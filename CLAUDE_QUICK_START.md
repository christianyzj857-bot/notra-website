# Quick Start Guide for Claude Code

## Phase 1: File Processing API Enhancement

Copy and paste this prompt into Claude Code:

```
Please read the file CLAUDE_PROMPT_PHASE1_FILE_API.md and enhance the file processing API according to the requirements.

The main task is to:
1. Add OpenAI API integration to generate structured notes after text extraction
2. Use the prompt provided in the file to generate notes in JSON format
3. Save the generated notes to database using lib/db.ts functions
4. Return sessionId to the frontend

Start by reading the file and then implement the changes to app/api/process-file/route.ts
```

## Phase 2: Audio Processing API

After Phase 1 is complete, use this prompt:

```
Please read the file CLAUDE_PROMPT_PHASE2_AUDIO_API.md and create the audio processing API.

The main task is to:
1. Create app/api/process-audio/route.ts
2. Implement audio transcription using OpenAI Whisper API
3. Generate structured notes from the transcript
4. Save to database and return sessionId

Start by reading the file and then create the new API route.
```

## Phase 3: Video Processing API

After Phase 2 is complete, use this prompt:

```
Please read the file CLAUDE_PROMPT_PHASE3_VIDEO_API.md and create the video processing API.

The main task is to:
1. Create app/api/process-video/route.ts
2. Implement video transcript extraction (start with placeholder)
3. Generate structured notes from the transcript
4. Save to database and return sessionId

Start by reading the file and then create the new API route.
```

## Phase 4: Magic Book Animation

After Phase 3 is complete, use this prompt:

```
Please read the file CLAUDE_PROMPT_PHASE4_MAGIC_BOOK.md and integrate the magic book animation into the dashboard.

The main task is to:
1. Create a reusable MagicBookUpload component
2. Integrate it into app/dashboard/page.tsx upload handlers
3. Show animation during file/audio/video processing
4. Display progress and loading steps

Start by reading the file and then implement the component and integration.
```

## Phase 5: Optimization

After Phase 4 is complete, use this prompt:

```
Please read the file CLAUDE_PROMPT_PHASE5_OPTIMIZATION.md and optimize the note generation quality.

The main task is to:
1. Optimize the note generation prompts
2. Test all functionality
3. Compare with Turbo AI quality
4. Fix any issues found

Start by reading the file and then implement optimizations.
```

## Alternative: Single Comprehensive Prompt

If you want to give all phases at once, use this:

```
I have split the backend development into 5 phases. Please read all these files in order:
1. CLAUDE_PROMPT_PHASE1_FILE_API.md
2. CLAUDE_PROMPT_PHASE2_AUDIO_API.md
3. CLAUDE_PROMPT_PHASE3_VIDEO_API.md
4. CLAUDE_PROMPT_PHASE4_MAGIC_BOOK.md
5. CLAUDE_PROMPT_PHASE5_OPTIMIZATION.md

After reading all files, please implement Phase 1 first. Once Phase 1 is complete and tested, proceed to Phase 2, and so on.

Start with Phase 1: Read CLAUDE_PROMPT_PHASE1_FILE_API.md and enhance app/api/process-file/route.ts according to the requirements.
```

