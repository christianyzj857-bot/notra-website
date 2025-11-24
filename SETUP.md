# Notra Website - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Get your OpenAI API key:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Create a new API key
4. Copy and paste it into `.env.local`

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Overview

### Dashboard (`/dashboard`)
- Upload and process documents (PDF, DOCX, TXT, MD)
- Upload and transcribe audio files
- Process video links (YouTube, Bilibili, etc.)
- View recent sessions
- Track usage limits (Free vs Pro plan)

### Session Detail (`/dashboard/[id]`)
- View generated notes with structured sections
- Take AI-generated quizzes
- Study with flashcards
- Chat with your notes

### Chat Interface (`/chat`)
- General AI chat mode
- Note-specific chat mode (linked to uploaded materials)
- Support for multiple AI models (GPT-4o-mini, GPT-4o, GPT-5.1)

### Upload Pages
- `/upload/file` - Dedicated file upload page
- `/upload/audio` - Audio recording and upload
- `/upload/video` - Video link processing

## API Routes

### Processing APIs
- `POST /api/process/file` - Process uploaded documents
- `POST /api/process/audio` - Transcribe and process audio
- `POST /api/process/video` - Process video links

### Session Management
- `GET /api/session/[id]` - Get session details
- `GET /api/sessions/recent` - Get recent sessions

### Chat
- `POST /api/chat` - Chat with AI (general or note-specific)

### Usage Tracking
- `GET /api/usage` - Get current usage stats

## Database

The app uses a simple file-based storage system (`lib/db.ts`):
- Sessions are stored in `.notra-data/sessions.json`
- Usage stats are stored in `.notra-data/usage.json`
- No external database required for development

For production, consider using:
- PostgreSQL (recommended)
- MongoDB
- Supabase

## Free vs Pro Plans

### Free Plan Limits
- File uploads: 5 per month
- Audio transcriptions: 3 per month
- Video processing: 3 per month
- Chat messages: 20 per day
- Model access: GPT-4o-mini only

### Pro Plan
- File uploads: Unlimited
- Audio transcriptions: Unlimited
- Video processing: Unlimited
- Chat messages: Unlimited
- Model access: GPT-4o-mini, GPT-4o, GPT-5.1

## Troubleshooting

### Issue: "OpenAI API key not configured"
**Solution:** Make sure you've created `.env.local` and added your `OPENAI_API_KEY`.

### Issue: Upload fails with "Failed to process file"
**Possible causes:**
1. Invalid OpenAI API key
2. API rate limit exceeded
3. File format not supported

**Solution:**
- Check your API key is valid
- Verify you have credits in your OpenAI account
- Ensure file is PDF, DOCX, or TXT format

### Issue: "You have reached your monthly limit"
**Solution:**
- Wait until next month (Free plan)
- Upgrade to Pro plan
- Or modify usage limits in `config/usageLimits.ts`

## Development

### Project Structure
```
app/
├── api/              # API routes
├── dashboard/        # Dashboard pages
├── chat/             # Chat interface
├── upload/           # Upload pages
├── onboarding/       # Onboarding flow
└── page.tsx          # Homepage

components/           # Reusable components
lib/                  # Utility functions
types/                # TypeScript types
config/               # Configuration files
```

### Adding a New Feature

1. Create API route in `app/api/your-feature/route.ts`
2. Create page in `app/your-feature/page.tsx`
3. Update types in `types/notra.ts` if needed
4. Add configuration in `config/` if needed

## Production Deployment

### Environment Variables (Production)
Add these to your hosting platform (Vercel, Netlify, etc.):

```env
OPENAI_API_KEY=your-production-api-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Build for Production

```bash
npm run build
npm start
```

### Recommended Hosting Platforms
- **Vercel** (recommended for Next.js)
- Netlify
- Railway
- AWS / Google Cloud / Azure

## License

See LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/christianyzj857-bot/notra-website/issues)
- Documentation: See `docs/` folder
