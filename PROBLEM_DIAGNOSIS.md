# 问题诊断报告

## 发现的主要问题

### 🔴 问题 1: Dashboard 上传函数没有调用 API

**位置**: `app/dashboard/page.tsx`

**问题代码**:
```typescript
// 第 183-193 行
const handleDocumentUpload = (file: File) => {
  const newProject: Project = {
    id: `project-${Date.now()}`,  // ❌ 这是本地生成的假 ID
    title: file.name,
    type: 'document',
    createdAt: Date.now(),
    summary: generateDocumentSummary(file.name)  // ❌ 只是生成本地摘要
  };
  setProjects([newProject, ...projects]);
  setSelectedProject(newProject);
  // ❌ 没有调用 API 上传文件
  // ❌ 没有生成笔记
  // ❌ 没有保存到数据库
};
```

**同样的问题**:
- `handleAudioUpload` (第 196-206 行) - 没有调用 API
- `handleVideoLink` (第 209-222 行) - 没有调用 API

**影响**:
- 文件没有真正上传
- 笔记没有生成
- 数据没有保存到数据库
- 创建的 Project 对象是假的，没有对应的 session

---

### 🔴 问题 2: "View Full Notes" 无法工作

**位置**: `app/dashboard/page.tsx` 第 672 行

**问题代码**:
```typescript
onClick={() => window.location.href = `/dashboard/${selectedProject.id}`}
```

**问题**:
- `selectedProject.id` 是 `project-${Date.now()}`，不是真实的 sessionId
- 这个 ID 在数据库中不存在
- 导航到 `/dashboard/project-xxx` 时，`app/dashboard/[id]/page.tsx` 会尝试从 `/api/session/project-xxx` 获取数据
- API 返回 404，显示 "Session not found"

---

### 🔴 问题 3: API 路径混乱

**发现两个文件处理 API**:

1. **`app/api/process-file/route.ts`** (第 1-153 行)
   - ✅ 能提取文本（PDF, Word, TXT）
   - ❌ **只返回文本，不生成笔记**
   - ❌ 不保存到数据库
   - 返回格式: `{ text, fileName, fileSize }`

2. **`app/api/process/file/route.ts`** (第 1-237 行)
   - ✅ 能提取文本
   - ✅ **能生成结构化笔记**（调用 OpenAI）
   - ✅ **能保存到数据库**
   - 返回格式: `{ sessionId, type, title, createdAt }`

**问题**:
- Dashboard 没有调用任何一个 API
- 即使调用，路径也不一致（`/api/process-file` vs `/api/process/file`）

---

### 🔴 问题 4: Chat 功能可能的问题

**位置**: `app/chat/page.tsx`

**潜在问题**:
- 第 29 行使用 `window.location.replace('/onboarding/step1')` 而不是 `router.replace()`
- 需要检查 chat API (`/api/chat/route.ts`) 是否正常工作

---

### 🔴 问题 5: 音频和视频 API 存在但未使用

**存在的 API**:
- ✅ `app/api/process/audio/route.ts` - 有完整实现
- ✅ `app/api/process/video/route.ts` - 有完整实现

**问题**:
- Dashboard 的上传函数没有调用这些 API
- 这些 API 可能工作正常，但前端没有使用

---

## 问题根源总结

### 核心问题
**Dashboard 的上传函数 (`handleDocumentUpload`, `handleAudioUpload`, `handleVideoLink`) 只是创建了本地的假数据，完全没有调用后端 API。**

### 导致的问题链
1. 用户上传文件 → 只创建本地 Project 对象
2. 没有调用 API → 文件没有处理，笔记没有生成
3. Project ID 是假的 → 点击 "View Full Notes" 时找不到 session
4. 其他功能可能也受影响 → 因为数据流断裂

---

## 需要修复的地方

### 1. 修复 `handleDocumentUpload`
**应该**:
```typescript
const handleDocumentUpload = async (file: File) => {
  // 1. 显示加载状态
  setIsLoading(true);
  
  // 2. 调用 API 上传文件
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/process/file', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    // 处理错误
    return;
  }
  
  const data = await response.json();
  // data = { sessionId, type, title, createdAt }
  
  // 3. 导航到详情页
  router.push(`/dashboard/${data.sessionId}`);
};
```

### 2. 修复 `handleAudioUpload`
**应该调用**: `/api/process/audio`

### 3. 修复 `handleVideoLink`
**应该调用**: `/api/process/video`

### 4. 统一 API 路径
- 决定使用哪个路径：`/api/process/file` 还是 `/api/process-file`
- 建议使用 `/api/process/file`（因为它有完整的笔记生成功能）

### 5. 修复 Chat 页面
- 将 `window.location.replace` 改为 `router.replace`

---

## 检查清单

- [ ] `handleDocumentUpload` 是否调用 API？
- [ ] `handleAudioUpload` 是否调用 API？
- [ ] `handleVideoLink` 是否调用 API？
- [ ] API 返回后是否导航到详情页？
- [ ] Project ID 是否是真实的 sessionId？
- [ ] Chat API 是否正常工作？
- [ ] 所有 API 路径是否一致？

---

## 建议的修复顺序

1. **第一步**: 修复 `handleDocumentUpload`，让它调用 `/api/process/file`
2. **第二步**: 修复 `handleAudioUpload`，让它调用 `/api/process/audio`
3. **第三步**: 修复 `handleVideoLink`，让它调用 `/api/process/video`
4. **第四步**: 测试所有功能是否恢复正常
5. **第五步**: 清理不需要的 API (`/api/process-file/route.ts` 如果不再使用)

---

## 当前状态总结

✅ **正常工作的部分**:
- API 路由存在且有实现 (`/api/process/file`, `/api/process/audio`, `/api/process/video`)
- 数据库操作函数存在 (`lib/db.ts`)
- Session 详情页能正确显示（如果 sessionId 存在）

❌ **不工作的部分**:
- Dashboard 上传功能（没有调用 API）
- "View Full Notes" 按钮（因为 ID 是假的）
- 音频上传功能（没有调用 API）
- 视频上传功能（没有调用 API）
- Chat 功能（需要检查）

---

**结论**: 主要问题是前端 Dashboard 的上传函数没有调用后端 API，导致整个数据流断裂。修复这些函数后，功能应该能恢复正常。

