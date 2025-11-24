# Notra - AI-Powered Academic Note-Taking Platform

Transform your learning materials into structured knowledge with AI.

## ✨ Features

- 📝 **Document Processing** - Upload PDF, Word, or text files and get structured notes
- 🎙️ **Audio Transcription** - Convert lectures and recordings into organized study materials
- 🎥 **Video Analysis** - Process YouTube and Bilibili videos into notes and quizzes
- 💬 **AI Chat** - Ask questions about your uploaded materials
- 📊 **Quiz Generation** - Auto-generate quizzes from your content
- 🃏 **Flashcards** - Create study flashcards automatically
- 🌍 **Multi-language Support** - 30+ languages supported

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Add your OpenAI API key to `.env.local`:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

**Get your API key:** [OpenAI Platform](https://platform.openai.com/api-keys)

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📖 Full Setup Guide

See [SETUP.md](./SETUP.md) for detailed setup instructions and troubleshooting.

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** OpenAI API (GPT-4o-mini, GPT-4o, GPT-5.1)
- **Storage:** File-based (development) / PostgreSQL (production)

## 📁 Project Structure

```
app/
├── api/              # Backend API routes
├── dashboard/        # Main dashboard & session details
├── chat/             # AI chat interface
├── upload/           # File/audio/video upload pages
└── page.tsx          # Landing page

components/           # Reusable React components
lib/                  # Utility functions & database
types/                # TypeScript type definitions
config/               # App configuration
```

## 🎯 Key Pages

- `/` - Landing page with features overview
- `/dashboard` - Main dashboard with upload options
- `/dashboard/[id]` - Session detail with notes, quizzes, flashcards
- `/chat` - AI chat interface
- `/upload/file` - Dedicated file upload
- `/upload/audio` - Audio recording/upload
- `/upload/video` - Video link processing

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Complete setup instructions
- [Backend Development](./CLAUDE_BACKEND_DEVELOPMENT_PROMPT.md) - API development guide
- [Phase Guides](./CLAUDE_PROMPT_PHASE*.md) - Feature implementation guides

## 🔑 API Routes

### Processing
- `POST /api/process/file` - Process documents
- `POST /api/process/audio` - Transcribe audio
- `POST /api/process/video` - Process videos

### Sessions
- `GET /api/session/[id]` - Get session data
- `GET /api/sessions/recent` - List recent sessions

### Chat
- `POST /api/chat` - AI chat endpoint

## 📊 Free vs Pro Plans

### Free Plan
- 5 file uploads/month
- 3 audio transcriptions/month
- 3 video processing/month
- 20 chat messages/day
- GPT-4o-mini access

### Pro Plan
- Unlimited uploads
- Unlimited transcriptions
- Unlimited video processing
- Unlimited chat messages
- Access to GPT-4o and GPT-5.1

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

Compatible with:
- Netlify
- Railway
- AWS / Google Cloud / Azure

## 🐛 Troubleshooting

See [SETUP.md](./SETUP.md#troubleshooting) for common issues and solutions.

## 📄 License

See LICENSE file for details.

## 🤝 Contributing

Issues and pull requests are welcome!

## 📞 Support

- [GitHub Issues](https://github.com/christianyzj857-bot/notra-website/issues)
- Documentation: See `/docs` folder
