# Phase 5: 优化和测试

## 任务目标
优化笔记生成质量，测试所有功能，确保达到 Turbo AI 级别的效果。

## 当前状态
- ✅ 基本功能已实现
- ⚠️ 需要优化笔记质量
- ⚠️ 需要测试所有场景

## 优化任务

### 1. 笔记生成 Prompt 优化

**目标**: 让生成的笔记更接近 Turbo AI 的质量

**优化点**:
- 更清晰的结构化要求
- 更好的颜色高亮指示
- 更准确的表格生成
- 更相关的 quiz 和 flashcard

**优化后的 Prompt**:
```
You are an expert academic note generator. Transform the following document into structured, comprehensive notes that match professional note-taking standards.

Document Content:
{extractedText}

CRITICAL REQUIREMENTS:

1. **Brief Overview** (1-2 sentences)
   - Summarize the document's main purpose and scope

2. **Key Points** (4-6 bullet points)
   - Extract the most critical information
   - Use clear, concise language
   - Highlight deadlines, requirements, and important actions

3. **Structured Sections**
   - Create sections based on document content
   - Use appropriate headings (e.g., "Programme Details", "Admission Conditions", "Fee Status & Funding", "Support Services", "Contact Information")
   - Each section should have clear content

4. **Tables for Structured Data**
   - Use tableSummary for simple key-value pairs
   - Use summaryTable for complex multi-column data
   - Include contact information in table format

5. **Highlighting Important Information**
   - Important terms, dates, deadlines should be marked with **bold** or special formatting
   - Use markdown formatting for emphasis

6. **Quiz Generation** (5-10 questions)
   - Questions should test understanding of key concepts
   - Include multiple choice options
   - Provide clear explanations

7. **Flashcard Generation** (10-15 cards)
   - Front: Key term or question
   - Back: Definition or answer
   - Tag: Category for organization

OUTPUT FORMAT: Return ONLY valid JSON (no markdown code blocks, no explanations):
{
  "title": "Document Title",
  "summaryForChat": "Brief summary for chat context",
  "notes": [...],
  "quizzes": [...],
  "flashcards": [...]
}
```

### 2. 模型差异化优化

**GPT-4o-mini (Free Plan)**:
- 基础结构，简洁内容
- 500-800 字
- 简单表格

**GPT-4o (Pro Plan)**:
- 详细结构，丰富内容
- 1000-1500 字
- 复杂表格
- 更好的上下文理解

**GPT-5.1 (Pro Plan)**:
- 全面结构，深度分析
- 1500-2500 字
- 高级表格和交叉引用
- 额外见解和建议

### 3. 前端渲染优化

**文件位置**: `app/dashboard/[id]/page.tsx`

**优化点**:
- 支持颜色高亮（解析 markdown 中的特殊格式）
- 更好的表格渲染
- 图标显示（根据 section 类型）

**颜色高亮实现**:
```typescript
// 在渲染 notes 时，解析特殊格式
const renderContent = (content: string) => {
  // 解析 **重要文本** 为蓝色高亮
  // 解析日期、截止日期为紫色高亮
  // 解析联系信息为特殊样式
};
```

### 4. 错误处理优化

**改进点**:
- 更清晰的错误消息
- 重试机制
- 部分成功处理（如果某些部分失败，仍返回已生成的内容）

### 5. 性能优化

**优化点**:
- 缓存已处理的文件（使用 contentHash）
- 流式处理（如果可能）
- 异步处理（对于大文件）

### 6. 测试清单

#### 功能测试
- [ ] 文件上传（PDF, Word, TXT）
- [ ] 音频上传（MP3, WAV, M4A）
- [ ] 视频链接（YouTube, Bilibili）
- [ ] 魔法书动画显示
- [ ] 进度更新
- [ ] 笔记生成质量
- [ ] Quiz 生成
- [ ] Flashcard 生成

#### 质量测试
- [ ] 笔记结构与 Turbo AI 对比
- [ ] 颜色高亮是否正确
- [ ] 表格格式是否正确
- [ ] 三个模型的质量差异
- [ ] 不同文档类型的处理

#### 边界测试
- [ ] 大文件处理
- [ ] 空文件处理
- [ ] 无效文件格式
- [ ] API 失败处理
- [ ] 网络错误处理

#### 用户体验测试
- [ ] 加载时间是否可接受
- [ ] 动画是否流畅
- [ ] 错误提示是否清晰
- [ ] 导航是否顺畅

### 7. 对比测试

**测试方法**:
1. 使用相同的文档在 Turbo AI 和 Notra 中生成笔记
2. 对比结构、内容、格式
3. 找出差距并优化

**对比维度**:
- 结构完整性
- 信息准确性
- 格式美观度
- 易读性

### 8. 性能指标

**目标指标**:
- 文件处理: < 30 秒
- 音频处理: < 60 秒（取决于长度）
- 视频处理: < 90 秒
- API 响应: < 5 秒

### 9. 文档更新

更新以下文档：
- API 文档
- 用户指南
- 开发文档

---

**开始优化**: 
1. 优化笔记生成 prompt
2. 测试所有功能
3. 对比 Turbo AI 效果
4. 迭代改进

