# Phase 3: 创建视频处理 API

## 任务目标
创建 `app/api/process-video/route.ts`，实现视频链接转录 + 笔记生成功能。

## 当前状态
- ❌ 文件不存在，需要创建
- ⚠️ 视频转录需要外部服务（YouTube API 或其他）

## 需要实现的功能

### 1. API 路由结构

**文件位置**: `app/api/process-video/route.ts`

**基本结构**:
```typescript
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { NotraSession, NoteSection, QuizItem, Flashcard } from "@/types/notra";
import { getCurrentUserPlan } from "@/lib/userPlan";
import { USAGE_LIMITS } from "@/config/usageLimits";
import { getUsage, incrementUsage, getMonthKey } from "@/lib/usage";

export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
```

### 2. 视频转录功能

**方案 A: YouTube 视频（推荐）**
```typescript
async function getVideoTranscript(url: string): Promise<string> {
  // 检查是否是 YouTube URL
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  
  if (match) {
    const videoId = match[1];
    // 使用 YouTube Data API v3 获取字幕
    // 或者使用 youtube-transcript 库
    // 这里先返回占位符，实际需要集成 YouTube API
    return `YouTube video transcript for ${videoId}`;
  }
  
  // 其他平台的处理...
  throw new Error("Unsupported video platform");
}
```

**方案 B: 通用方案（使用 Whisper）**
```typescript
async function getVideoTranscript(url: string): Promise<string> {
  // 1. 下载视频（或提取音频）
  // 2. 使用 Whisper API 转录
  // 3. 返回转录文本
  
  // 注意：这需要下载整个视频，可能很慢且占用资源
  // 优先使用平台提供的字幕/转录服务
}
```

**临时方案（用于开发）**:
```typescript
async function getVideoTranscript(url: string): Promise<string> {
  // 临时返回模拟转录，实际开发中需要替换
  return `This is a placeholder transcript for the video at ${url}.
  
  In production, this would:
  1. Extract video metadata (title, description)
  2. Fetch available transcripts/captions from the platform
  3. Use speech-to-text if transcripts are not available
  4. Return the full transcript text
  
  Key concepts covered in this video:
  - Introduction to the topic
  - Main concepts and explanations
  - Examples and applications
  - Summary and conclusions`;
}
```

### 3. 笔记生成功能

复用 Phase 1 中的笔记生成逻辑。

### 4. 主处理流程

```typescript
export async function POST(req: Request) {
  try {
    // 1. 获取视频 URL
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'No video URL provided' }, { status: 400 });
    }

    // 2. 验证 URL 格式
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // 3. 检查使用限制
    const plan = getCurrentUserPlan();
    const limits = USAGE_LIMITS[plan];
    const monthKey = getMonthKey();
    const used = await getUsage("video", monthKey);

    if (used >= limits.maxVideoSessionsPerMonth) {
      return NextResponse.json({
        error: "limit_reached",
        message: "You have reached your monthly limit for video processing.",
        plan,
        scope: "video",
        limit: limits.maxVideoSessionsPerMonth,
      }, { status: 429 });
    }

    // 4. 获取视频转录
    const transcript = await getVideoTranscript(url);

    // 5. 生成内容哈希（去重）
    const contentHash = generateContentHash(transcript);
    const existingSession = await findSessionByHash(contentHash);
    if (existingSession) {
      return NextResponse.json({
        sessionId: existingSession.id,
        type: existingSession.type,
        title: existingSession.title,
        createdAt: existingSession.createdAt,
      });
    }

    // 6. 生成结构化笔记
    const structuredContent = await generateStructuredContent(transcript, url);

    // 7. 创建会话
    const newSession = await createSession({
      type: "video",
      title: structuredContent.title || `Video: ${url.substring(0, 50)}`,
      contentHash,
      notes: structuredContent.notes,
      quizzes: structuredContent.quizzes,
      flashcards: structuredContent.flashcards,
      summaryForChat: structuredContent.summaryForChat,
    });

    // 8. 更新使用量
    await incrementUsage("video", monthKey, 1);

    // 9. 返回结果
    return NextResponse.json({
      sessionId: newSession.id,
      type: newSession.type,
      title: newSession.title,
      createdAt: newSession.createdAt,
    });
  } catch (error: any) {
    console.error("Video processing error:", error);
    return NextResponse.json(
      { error: error.message || "Error processing video" },
      { status: 500 }
    );
  }
}
```

### 5. 支持的平台

优先支持：
- **YouTube** - 使用 YouTube Data API v3 或 youtube-transcript 库
- **Bilibili** - 需要 Bilibili API（如果有）
- **其他平台** - 使用通用转录方案

### 6. 错误处理

处理以下情况：
- 无效的 URL
- 不支持的视频平台
- 视频不存在或无法访问
- 转录失败
- API 调用失败

### 7. 返回格式

成功时返回：
```json
{
  "sessionId": "session-xxx",
  "type": "video",
  "title": "Video Title",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 实现建议

1. **第一阶段**: 使用占位符转录，先完成整体流程
2. **第二阶段**: 集成 YouTube API 获取真实字幕
3. **第三阶段**: 添加其他平台支持

## 参考文件

- `app/api/process/file/route.ts` - 文件处理流程参考
- `app/api/process/audio/route.ts` - 音频处理参考
- YouTube Data API 文档

---

**开始实现**: 创建 `app/api/process-video/route.ts` 文件，先使用占位符转录。

