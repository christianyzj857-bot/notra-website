# Phase 2: 创建音频处理 API

## 任务目标
创建 `app/api/process-audio/route.ts`，实现音频转录 + 笔记生成功能。

## 当前状态
- ❌ 文件不存在，需要创建
- ✅ 可以参考 `app/api/transcribe/route.ts` 的转录逻辑
- ✅ 可以参考 `app/api/process/audio/route.ts` 的结构（如果存在）

## 需要实现的功能

### 1. API 路由结构

**文件位置**: `app/api/process-audio/route.ts`

**基本结构**:
```typescript
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { NotraSession, NoteSection, QuizItem, Flashcard } from "@/types/notra";
import { getCurrentUserPlan } from "@/lib/userPlan";
import { USAGE_LIMITS } from "@/config/usageLimits";
import { getUsage, incrementUsage, getMonthKey } from "@/lib/usage";

export const runtime = "nodejs"; // 需要 Node.js runtime 用于文件处理

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
```

### 2. 音频转录功能

使用 OpenAI Whisper API 转录音频：

```typescript
async function transcribeAudio(audioFile: File): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  // 将 File 转为 Buffer 并保存到临时文件
  const bytes = await audioFile.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const tempPath = join(tmpdir(), `audio-${Date.now()}.${audioFile.name.split('.').pop()}`);
  await writeFile(tempPath, buffer);

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: "whisper-1",
      prompt: "This is an educational lecture or audio content. Please transcribe accurately.",
      temperature: 0,
    });

    const transcriptText = typeof transcription === 'string' 
      ? transcription 
      : transcription.text;

    // 清理临时文件
    await unlink(tempPath).catch(() => {});

    return transcriptText;
  } catch (error) {
    await unlink(tempPath).catch(() => {});
    throw error;
  }
}
```

### 3. 笔记生成功能

复用 Phase 1 中的笔记生成逻辑（或调用相同的函数）：

```typescript
async function generateStructuredContent(
  text: string
): Promise<{
  title: string;
  notes: NoteSection[];
  quizzes: QuizItem[];
  flashcards: Flashcard[];
  summaryForChat: string;
}> {
  // 使用与文件处理相同的 prompt 和逻辑
  // 参考 Phase 1 的实现
}
```

### 4. 使用限制检查

在开始处理前检查用户使用量：

```typescript
const plan = getCurrentUserPlan();
const limits = USAGE_LIMITS[plan];
const monthKey = getMonthKey();
const used = await getUsage("audio", monthKey);

if (used >= limits.maxAudioSessionsPerMonth) {
  return NextResponse.json({
    error: "limit_reached",
    message: "You have reached your monthly limit for audio transcriptions.",
    plan,
    scope: "audio",
    limit: limits.maxAudioSessionsPerMonth,
  }, { status: 429 });
}
```

### 5. 主处理流程

```typescript
export async function POST(req: Request) {
  try {
    // 1. 获取音频文件
    const formData = await req.formData();
    const file = formData.get("audio") as File;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // 2. 检查使用限制
    // ... (见上面)

    // 3. 转录音频
    const transcript = await transcribeAudio(file);

    // 4. 生成内容哈希（去重）
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

    // 5. 生成结构化笔记
    const structuredContent = await generateStructuredContent(transcript);

    // 6. 创建会话
    const newSession = await createSession({
      type: "audio",
      title: structuredContent.title || "Audio Lecture",
      contentHash,
      notes: structuredContent.notes,
      quizzes: structuredContent.quizzes,
      flashcards: structuredContent.flashcards,
      summaryForChat: structuredContent.summaryForChat,
    });

    // 7. 更新使用量
    await incrementUsage("audio", monthKey, 1);

    // 8. 返回结果
    return NextResponse.json({
      sessionId: newSession.id,
      type: newSession.type,
      title: newSession.title,
      createdAt: newSession.createdAt,
    });
  } catch (error: any) {
    console.error("Audio processing error:", error);
    return NextResponse.json(
      { error: error.message || "Error processing audio" },
      { status: 500 }
    );
  }
}
```

### 6. 错误处理

处理以下情况：
- 文件大小超过 25MB（Whisper 限制）
- 不支持的音频格式
- 转录失败
- API 调用失败
- 数据库错误

### 7. 返回格式

成功时返回：
```json
{
  "sessionId": "session-xxx",
  "type": "audio",
  "title": "Audio Lecture Title",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 参考文件

- `app/api/transcribe/route.ts` - Whisper API 调用示例
- `app/api/process/file/route.ts` - 文件处理流程参考
- `lib/db.ts` - 数据库操作函数
- `lib/usage.ts` - 使用量管理

## 测试

使用一个简短的音频文件（MP3, WAV, M4A）测试：
- 应该能成功转录
- 应该能生成笔记
- 应该能保存到数据库

---

**开始实现**: 创建 `app/api/process-audio/route.ts` 文件。

