# Claude Code Backend Development Prompt for Notra

## Project Overview
You are developing the backend API for Notra, an AI-powered academic note-taking platform. The goal is to create high-quality note generation that matches or exceeds Turbo AI's quality, with structured, color-highlighted content and summary tables.

## Repository Context
- **GitHub Repository**: `christianyzj857-bot/notra-website`
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **API Routes Location**: `app/api/`
- **Database**: Supabase (via `lib/db.ts`)
- **AI Provider**: OpenAI (GPT-4o-mini, GPT-4o, GPT-5.1)

## Current Codebase Structure

### Existing API Routes
1. **`app/api/process-file/route.ts`** - Handles file uploads (PDF, Word, TXT, MD, JSON)
   - Extracts text from files
   - Returns raw text (no AI processing yet)
   
2. **`app/api/chat/route.ts`** - Handles chat interactions
   - Supports "general" and "note" modes
   - Uses OpenAI API with streaming
   - Model selection: gpt-4o-mini, gpt-4o, gpt-5.1

### Missing API Routes (Need to Create)
1. **`app/api/process-file/route.ts`** - Needs enhancement to generate structured notes
2. **`app/api/process-audio/route.ts`** - Needs to be created for audio transcription + note generation
3. **`app/api/process-video/route.ts`** - Needs to be created for video transcription + note generation

### Frontend Integration Points
- **Dashboard**: `app/dashboard/page.tsx` - Three upload buttons (File, Audio, Video)
- **Session Detail**: `app/dashboard/[id]/page.tsx` - Displays generated notes
- **Onboarding Magic Book**: `app/onboarding/step2/page.tsx` - Reference for animation

### Type Definitions
- **`types/notra.ts`** - Defines `NotraSession`, `NoteSection`, `QuizItem`, `Flashcard`
- **`NoteSection`** includes: `heading`, `content`, `bullets`, `tableSummary`, `summaryTable`

## Requirements

### 1. Note Generation Quality (Turbo AI Level)

Based on the provided screenshots, generated notes must have:

#### Structure Requirements:
- **Brief Overview Section**: 1-2 sentence summary of the document
- **Key Points Section**: 4-6 bullet points highlighting critical information
- **Programme Details Section**: Structured information with icons
- **Admission Conditions Section**: Clear requirements with sub-sections
- **Responding to Your Offer Section**: Step-by-step instructions
- **Verifying Qualifications Section**: Deadlines and requirements
- **Fee Status & Funding Section**: Financial information with tables
- **Support Services Section**: Contact information and resources
- **Contact Information Section**: Table format with Role, Name, Department, Phone, Email, Address

#### Visual Formatting Requirements:
- **Color Highlighting**: Important terms, dates, deadlines, contact info should be highlighted in blue/purple
- **Tables**: Use `tableSummary` or `summaryTable` fields for structured data
- **Icons**: Each section should have appropriate icons (books, checkmarks, envelopes, documents, money bags, houses, phones)
- **Hierarchical Structure**: Use nested bullets and sub-sections
- **Emphasis**: Bold important dates, deadlines, and key terms

### 2. Model-Specific Generation Differences

Three models should produce different quality levels:

#### GPT-4o-mini (Free Plan):
- Basic structure with all required sections
- Simple bullet points
- Basic tables
- Minimal highlighting
- ~500-800 words total

#### GPT-4o (Pro Plan):
- Enhanced structure with more detail
- Rich bullet points with explanations
- Detailed tables with multiple columns
- Strategic highlighting of key information
- ~1000-1500 words total
- Better context understanding

#### GPT-5.1 (Pro Plan):
- Premium structure with comprehensive detail
- Rich, explanatory bullet points
- Complex multi-column tables
- Extensive highlighting and emphasis
- ~1500-2500 words total
- Advanced context understanding and cross-referencing
- Additional insights and recommendations

### 3. Magic Book Animation Integration

When users click upload buttons in dashboard, show the magic book animation:

**Reference Implementation**: `app/onboarding/step2/page.tsx`

**Animation States**:
1. **Idle**: Book closed, waiting for input
2. **Hovering**: Book glows when file/audio/video is dragged over
3. **Loading**: 
   - Right page shows loading progress (0-100%)
   - Rotating magic circle
   - Loading step texts
   - Magic particle effects
4. **Complete**: 
   - Right page scales up (1.5x)
   - Fades in generated notes preview
   - Shows "View Full Notes" button

**Integration Points**:
- File upload: `app/dashboard/page.tsx` - `handleDocumentUpload()`
- Audio upload: `app/dashboard/page.tsx` - `handleAudioUpload()`
- Video upload: `app/dashboard/page.tsx` - `handleVideoLink()`

### 4. API Endpoints to Create/Enhance

#### A. Enhanced `/api/process-file/route.ts`

**Current State**: Only extracts text, doesn't generate notes

**Required Changes**:
1. After text extraction, call OpenAI API to generate structured notes
2. Use appropriate model based on user plan
3. Return structured `NotraSession` object
4. Save to database via `lib/db.ts`

**Prompt Engineering for Note Generation**:
```
You are an expert academic note generator. Transform the following document into structured, comprehensive notes.

Document Content:
{extractedText}

Requirements:
1. Create a "Brief Overview" section (1-2 sentences)
2. Create a "Key Points" section (4-6 critical bullet points)
3. Extract and organize all structured information into appropriate sections
4. Use tables for contact information, fees, deadlines, etc.
5. Highlight important terms, dates, deadlines in your response using markdown formatting
6. Create sections based on document content (e.g., Programme Details, Admission Conditions, Fees, Support Services, Contact Information)
7. Generate 5-10 quiz questions based on the content
8. Generate 10-15 flashcards for key concepts

Output Format: JSON matching this structure:
{
  "title": "Document Title",
  "summaryForChat": "Brief summary for chat context",
  "notes": [
    {
      "id": "section-1",
      "heading": "Brief Overview",
      "content": "Overview text",
      "bullets": ["Point 1", "Point 2"]
    },
    {
      "id": "section-2",
      "heading": "Key Points",
      "content": "",
      "bullets": ["Key point 1", "Key point 2"]
    },
    {
      "id": "section-3",
      "heading": "Programme Details",
      "content": "Details text",
      "tableSummary": [
        {"label": "Programme", "value": "BSc Statistics"},
        {"label": "UCAS Code", "value": "G300"}
      ]
    },
    // ... more sections
  ],
  "quizzes": [
    {
      "id": "quiz-1",
      "question": "Question text",
      "options": [
        {"label": "A", "text": "Option A"},
        {"label": "B", "text": "Option B"}
      ],
      "correctIndex": 0,
      "explanation": "Explanation text"
    }
  ],
  "flashcards": [
    {
      "id": "flashcard-1",
      "front": "Front text",
      "back": "Back text",
      "tag": "Category"
    }
  ]
}
```

**Model-Specific Prompts**:
- **GPT-4o-mini**: Add "Keep responses concise and focused on essential information."
- **GPT-4o**: Add "Provide detailed explanations and comprehensive coverage."
- **GPT-5.1**: Add "Provide in-depth analysis, cross-references, and additional insights."

#### B. Create `/api/process-audio/route.ts`

**Functionality**:
1. Accept audio file upload
2. Transcribe using OpenAI Whisper API
3. Generate structured notes using same prompt as file processing
4. Return `NotraSession` object
5. Save to database

**Implementation Steps**:
```typescript
export async function POST(req: Request) {
  // 1. Get audio file from FormData
  // 2. Transcribe using OpenAI.audio.transcriptions.create()
  // 3. Use transcribed text with note generation prompt (same as file processing)
  // 4. Generate structured notes
  // 5. Create session in database
  // 6. Return sessionId
}
```

#### C. Create `/api/process-video/route.ts`

**Functionality**:
1. Accept video URL (YouTube, Bilibili, etc.)
2. Extract transcript (may need external service or YouTube API)
3. Generate structured notes using same prompt
4. Return `NotraSession` object
5. Save to database

**Note**: Video transcript extraction may require:
- YouTube Data API for YouTube videos
- External service for other platforms
- Or use OpenAI Whisper on downloaded audio

### 5. Chat API Enhancement

**Current State**: `app/api/chat/route.ts` already supports model selection

**Required Enhancements**:
1. Ensure all three models are properly configured
2. Test and tune prompts for each model's strengths
3. GPT-4o-mini: Fast, concise responses
4. GPT-4o: Balanced, detailed responses
5. GPT-5.1: Deep, comprehensive responses

### 6. Database Integration

**File**: `lib/db.ts`

**Functions to Use**:
- `createSession()` - Create new session
- `getSessionById()` - Retrieve session
- `findSessionByHash()` - Check for duplicates

**Session Structure**:
```typescript
{
  id: string;
  type: "file" | "audio" | "video";
  title: string;
  contentHash: string;
  notes: NoteSection[];
  quizzes: QuizItem[];
  flashcards: Flashcard[];
  summaryForChat: string;
  createdAt: string;
}
```

### 7. Frontend Integration Requirements

#### Dashboard Upload Handlers

**File**: `app/dashboard/page.tsx`

**Current Functions** (need enhancement):
- `handleDocumentUpload(file)` - Should show magic book animation
- `handleAudioUpload(file)` - Should show magic book animation  
- `handleVideoLink(url)` - Should show magic book animation

**Required Changes**:
1. Show magic book component when upload starts
2. Display loading progress (0-100%)
3. Show loading steps
4. On completion, show note preview
5. Navigate to session detail page

#### Magic Book Component

**Create**: `components/MagicBookUpload.tsx`

**Props**:
```typescript
{
  isOpen: boolean;
  type: "file" | "audio" | "video";
  fileName?: string;
  progress: number; // 0-100
  loadingStep: string;
  onComplete: (sessionId: string) => void;
  onClose: () => void;
}
```

**Animation States**: Same as onboarding magic book

### 8. Implementation Checklist

#### Phase 1: Note Generation API
- [ ] Enhance `/api/process-file/route.ts` with OpenAI note generation
- [ ] Create `/api/process-audio/route.ts` with Whisper + note generation
- [ ] Create `/api/process-video/route.ts` with transcript extraction + note generation
- [ ] Test all three models (gpt-4o-mini, gpt-4o, gpt-5.1)
- [ ] Verify note structure matches Turbo AI quality

#### Phase 2: Frontend Integration
- [ ] Create `components/MagicBookUpload.tsx`
- [ ] Integrate magic book into dashboard upload handlers
- [ ] Add loading progress tracking
- [ ] Test file upload flow
- [ ] Test audio upload flow
- [ ] Test video upload flow

#### Phase 3: Chat API Enhancement
- [ ] Test GPT-4o-mini chat responses
- [ ] Test GPT-4o chat responses
- [ ] Test GPT-5.1 chat responses (when available)
- [ ] Tune prompts for each model

#### Phase 4: Quality Assurance
- [ ] Test with various document types (PDF, Word, TXT)
- [ ] Test with audio files (MP3, WAV, M4A)
- [ ] Test with video URLs (YouTube, Bilibili)
- [ ] Verify color highlighting in generated notes
- [ ] Verify table formatting
- [ ] Verify section structure
- [ ] Compare output quality across models

### 9. Important Notes

1. **API Key**: Ensure `OPENAI_API_KEY` is set in environment variables
2. **Rate Limiting**: Implement usage limits based on user plan (already exists in `config/usageLimits.ts`)
3. **Error Handling**: Provide clear error messages for:
   - File parsing failures
   - API failures
   - Transcription failures
   - Network errors
4. **Cost Optimization**: 
   - Use appropriate models for user plan
   - Limit token usage
   - Cache results when possible
5. **Security**: 
   - Validate file types
   - Sanitize inputs
   - Check user permissions

### 10. Testing Strategy

1. **Unit Tests**: Test note generation prompts with sample documents
2. **Integration Tests**: Test full upload → generation → display flow
3. **Quality Tests**: Compare generated notes with Turbo AI examples
4. **Performance Tests**: Measure API response times
5. **Model Comparison**: Generate same document with all three models and compare

### 11. Expected Output Format

Generated notes should match this structure (from Turbo AI example):

```json
{
  "title": "UCL BSc Statistics Admissions",
  "summaryForChat": "University admissions offer for BSc Statistics programme...",
  "notes": [
    {
      "id": "brief-overview",
      "heading": "Brief Overview",
      "content": "This note covers University admissions and was created from a 2-page PDF. It details the academic prerequisites, offer response steps, qualification verification deadlines, fee structure, available funding, accommodation procedures, wellbeing support, and key contact information for prospective BSc Statistics students."
    },
    {
      "id": "key-points",
      "heading": "Key Points",
      "content": "",
      "bullets": [
        "Confirm your AP grades and meet UCL terms before accepting the offer.",
        "Submit all required documents by 31August2024.",
        "Review fee rates, tuition fees, and scholarship opportunities.",
        "Use the provided contacts for accommodation and wellbeing support."
      ]
    },
    {
      "id": "programme-details",
      "heading": "Programme Details",
      "content": "",
      "tableSummary": [
        {"label": "Programme", "value": "BSc Statistics"},
        {"label": "UCAS Code", "value": "G300"},
        {"label": "Start Date", "value": "23 September 2024"}
      ]
    },
    {
      "id": "admission-conditions",
      "heading": "Admission Conditions",
      "content": "",
      "bullets": [
        "Five Advanced Placement (AP) subjects taken in the final three years of high school.",
        "Required grades: 5,5,5,5,4 (must include a 5 in AP CalculusBC).",
        "Must meet the UCL Terms and Conditions for Undergraduate Students."
      ]
    },
    {
      "id": "contact-information",
      "heading": "Contact Information",
      "content": "",
      "summaryTable": [
        {
          "concept": "Executive Director",
          "formula": "Sarah J. Cowls",
          "notes": "Undergraduate Student and Registry Services Admissions, +44 (0)208 05909 39"
        }
      ]
    }
  ],
  "quizzes": [...],
  "flashcards": [...]
}
```

### 12. Color Highlighting Implementation

In the frontend (`app/dashboard/[id]/page.tsx`), notes are rendered with ReactMarkdown. To support color highlighting:

1. **Markdown Format**: Use markdown syntax in generated content:
   - `**Important Text**` for bold
   - Use custom markdown extensions for colors (may need to implement)

2. **Alternative**: Include highlighting metadata in `NoteSection`:
```typescript
interface HighlightedText {
  text: string;
  color: "blue" | "purple" | "red" | "green";
  bold?: boolean;
}
```

3. **Render in Frontend**: Parse highlights and apply appropriate CSS classes

## Development Instructions

1. **Start with File Processing**: Enhance `/api/process-file/route.ts` first
2. **Test with Sample Documents**: Use the UCL offer PDF as a test case
3. **Iterate on Prompts**: Refine prompts until output matches Turbo AI quality
4. **Add Audio/Video**: Once file processing works, add audio and video routes
5. **Integrate Frontend**: Add magic book animation to dashboard
6. **Test All Models**: Verify quality differences between models
7. **Optimize**: Reduce costs, improve speed, enhance quality

## Success Criteria

✅ Generated notes match Turbo AI structure and quality
✅ All three models produce appropriately different quality levels
✅ Magic book animation works for all upload types
✅ Color highlighting appears in rendered notes
✅ Tables are properly formatted
✅ Chat API works with all three models
✅ Error handling is robust
✅ Performance is acceptable (< 30s for note generation)

---

**Start Development**: Begin by enhancing `/api/process-file/route.ts` with OpenAI note generation, then proceed through the checklist systematically.

