# Phase 1: 增强文件处理 API - 添加笔记生成功能

## 任务目标
增强 `app/api/process-file/route.ts`，在提取文本后调用 OpenAI API 生成结构化的笔记。

## 当前状态
- ✅ 文件已能提取文本（PDF, Word, TXT, MD, JSON）
- ❌ 缺少笔记生成功能
- ❌ 没有调用 OpenAI API

## 需要实现的功能

### 1. 在文件处理流程中添加笔记生成

**位置**: `app/api/process-file/route.ts`

**流程**:
```
文件上传 → 提取文本 → 生成结构化笔记 → 保存到数据库 → 返回 sessionId
```

### 2. 笔记生成 Prompt

使用以下 prompt 调用 OpenAI API：

```
You are an expert academic note generator. Transform the following document into structured, comprehensive notes.

Document Content:
{extractedText}

Requirements:
1. Create a "Brief Overview" section (1-2 sentences summarizing the document)
2. Create a "Key Points" section (4-6 critical bullet points)
3. Extract and organize all structured information into appropriate sections
4. Use tables for contact information, fees, deadlines, etc.
5. Highlight important terms, dates, deadlines in your response
6. Create sections based on document content (e.g., Programme Details, Admission Conditions, Fees, Support Services, Contact Information)
7. Generate 5-10 quiz questions based on the content
8. Generate 10-15 flashcards for key concepts

Output Format: Return ONLY valid JSON matching this structure:
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
    }
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

### 3. 模型选择逻辑

根据用户计划选择模型：
- **Free Plan**: `gpt-4o-mini`
- **Pro Plan**: `gpt-4o` (可以后续升级到 gpt-5.1)

**参考代码位置**:
- `lib/userPlan.ts` - `getCurrentUserPlan()`
- `app/api/chat/route.ts` - 模型选择逻辑示例

### 4. 数据库保存

使用 `lib/db.ts` 中的函数：
- `generateContentHash(text)` - 生成内容哈希（去重）
- `findSessionByHash(hash)` - 检查是否已存在
- `createSession(data)` - 创建新会话

### 5. 错误处理

处理以下错误情况：
- OpenAI API 调用失败
- JSON 解析失败
- 数据库保存失败
- 文本过长（需要截断）

### 6. 返回格式

成功时返回：
```json
{
  "sessionId": "session-xxx",
  "type": "file",
  "title": "Document Title",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 实现步骤

1. **导入必要的依赖**
   ```typescript
   import OpenAI from "openai";
   import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
   import { NotraSession, NoteSection, QuizItem, Flashcard } from "@/types/notra";
   import { getCurrentUserPlan } from "@/lib/userPlan";
   ```

2. **添加笔记生成函数**
   ```typescript
   async function generateStructuredContent(
     text: string, 
     model: "gpt-4o-mini" | "gpt-4o" = "gpt-4o-mini"
   ): Promise<{
     title: string;
     notes: NoteSection[];
     quizzes: QuizItem[];
     flashcards: Flashcard[];
     summaryForChat: string;
   }> {
     // 实现笔记生成逻辑
   }
   ```

3. **在 POST 函数中集成**
   - 提取文本后调用 `generateStructuredContent()`
   - 检查内容哈希（去重）
   - 保存到数据库
   - 返回 sessionId

## 测试用例

使用一个简单的 PDF 文件测试：
- 应该能提取文本
- 应该能生成结构化笔记
- 应该能保存到数据库
- 应该返回有效的 sessionId

## 参考文件

- `app/api/process/audio/route.ts` - 音频处理的实现示例
- `app/api/process/file/route.ts` - 当前文件处理实现
- `app/api/chat/route.ts` - OpenAI API 调用示例

---

**开始实现**: 修改 `app/api/process-file/route.ts`，添加笔记生成功能。

