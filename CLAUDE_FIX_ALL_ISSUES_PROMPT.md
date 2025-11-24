# 一次性修复所有 Dashboard 和 Chat 问题

## 任务概述
修复 Dashboard 上传功能、Chat 功能，并扩展文件类型支持。所有问题需要一次性修复完成。

---

## 问题 1: 修复 Dashboard 文件上传功能

### 文件位置
`app/dashboard/page.tsx`

### 当前问题
`handleDocumentUpload` 函数（第 183-193 行）只创建本地假数据，没有调用 API。

### 需要修复
将函数改为异步，调用 `/api/process/file` API，等待返回真实的 sessionId，然后导航到详情页。

### 修复后的代码
```typescript
// Handle document upload
const handleDocumentUpload = async (file: File) => {
  try {
    // 显示加载状态（可以添加一个 loading state）
    setIsLoading(true); // 需要添加这个 state
    
    // 创建 FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // 调用 API
    const response = await fetch('/api/process/file', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.message || 'Failed to upload file. Please try again.');
      setIsLoading(false);
      return;
    }
    
    const data = await response.json();
    // data = { sessionId, type, title, createdAt }
    
    // 重新加载 sessions 列表
    const sessionsResponse = await fetch('/api/sessions/recent');
    if (sessionsResponse.ok) {
      const sessions = await sessionsResponse.json();
      const formattedProjects: Project[] = sessions.map((s: any) => ({
        id: s.id,
        title: s.title,
        type: s.type,
        createdAt: new Date(s.createdAt).getTime(),
        summary: s.summaryForChat || 'No summary available'
      }));
      setProjects(formattedProjects);
    }
    
    // 导航到详情页
    router.push(`/dashboard/${data.sessionId}`);
  } catch (error: any) {
    console.error('File upload error:', error);
    alert('Failed to upload file. Please try again.');
    setIsLoading(false);
  }
};
```

### 需要添加的 State
```typescript
const [isLoading, setIsLoading] = useState(false);
```

### 需要添加的 Import
```typescript
import { useRouter } from 'next/navigation';
```

### 在组件中添加
```typescript
const router = useRouter();
```

---

## 问题 2: 修复 Dashboard 音频上传功能

### 文件位置
`app/dashboard/page.tsx`

### 当前问题
`handleAudioUpload` 函数（第 196-206 行）只创建本地假数据，没有调用 API。

### 修复后的代码
```typescript
// Handle audio upload
const handleAudioUpload = async (file: File) => {
  try {
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('audio', file);
    
    const response = await fetch('/api/process/audio', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.message || 'Failed to upload audio. Please try again.');
      setIsLoading(false);
      return;
    }
    
    const data = await response.json();
    
    // 重新加载 sessions 列表
    const sessionsResponse = await fetch('/api/sessions/recent');
    if (sessionsResponse.ok) {
      const sessions = await sessionsResponse.json();
      const formattedProjects: Project[] = sessions.map((s: any) => ({
        id: s.id,
        title: s.title,
        type: s.type,
        createdAt: new Date(s.createdAt).getTime(),
        summary: s.summaryForChat || 'No summary available'
      }));
      setProjects(formattedProjects);
    }
    
    router.push(`/dashboard/${data.sessionId}`);
  } catch (error: any) {
    console.error('Audio upload error:', error);
    alert('Failed to upload audio. Please try again.');
    setIsLoading(false);
  }
};
```

---

## 问题 3: 修复 Dashboard 视频链接功能

### 文件位置
`app/dashboard/page.tsx`

### 当前问题
`handleVideoLink` 函数（第 209-222 行）只创建本地假数据，没有调用 API。

### 修复后的代码
```typescript
// Handle video link
const handleVideoLink = async () => {
  if (!videoUrl.trim()) return;
  
  try {
    setIsLoading(true);
    
    const response = await fetch('/api/process/video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: videoUrl })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.message || 'Failed to process video. Please try again.');
      setIsLoading(false);
      return;
    }
    
    const data = await response.json();
    
    // 重新加载 sessions 列表
    const sessionsResponse = await fetch('/api/sessions/recent');
    if (sessionsResponse.ok) {
      const sessions = await sessionsResponse.json();
      const formattedProjects: Project[] = sessions.map((s: any) => ({
        id: s.id,
        title: s.title,
        type: s.type,
        createdAt: new Date(s.createdAt).getTime(),
        summary: s.summaryForChat || 'No summary available'
      }));
      setProjects(formattedProjects);
    }
    
    setVideoUrl('');
    router.push(`/dashboard/${data.sessionId}`);
  } catch (error: any) {
    console.error('Video processing error:', error);
    alert('Failed to process video. Please try again.');
    setIsLoading(false);
  }
};
```

---

## 问题 4: 修复 Chat 页面跳转

### 文件位置
`app/chat/page.tsx`

### 当前问题
第 29 行使用 `window.location.replace`，应该使用 `router.replace`。

### 修复
```typescript
// 第 24-32 行，修改为：
useEffect(() => {
  if (typeof window !== 'undefined') {
    const onboarded = localStorage.getItem('onboarding_complete');
    if (onboarded !== 'true') {
      router.replace('/onboarding/step1');
    }
  }
}, [router]);
```

确保已经导入 `useRouter`：
```typescript
import { useRouter } from 'next/navigation';
```

---

## 问题 5: 扩展文件类型支持

### 文件位置
`app/api/process/file/route.ts`

### 需要支持的文件类型（参考 ChatGPT 支持的类型）

**✅ 支持的文件类型**:
- **文档**: PDF (`.pdf`), Word (`.doc`, `.docx`)
- **表格**: Excel (`.xlsx`, `.xls`), CSV (`.csv`)
- **演示文稿**: PowerPoint (`.pptx`, `.ppt`)
- **文本**: Text (`.txt`), Markdown (`.md`), JSON (`.json`)
- **代码文件**: `.js`, `.ts`, `.py`, `.java`, `.cpp`, `.c`, `.cs`, `.php`, `.rb`, `.go`, `.rs`, `.swift`, `.kt`, `.scala`, `.html`, `.css`, `.xml`, `.yaml`, `.yml`, `.sh`, `.bat`, `.ps1`

**❌ 不支持的文件类型**（ChatGPT 也不支持）:
- 压缩文件: `.zip`, `.rar`, `.7z`, `.tar`, `.gz`
- 可执行文件: `.exe`, `.dll`, `.bin`, `.iso`, `.dmg`
- 图像文件: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg` (需要 OCR，暂不支持)
- 音频文件: `.mp3`, `.wav`, `.m4a`, `.flac` (使用专门的音频上传功能)
- 视频文件: `.mp4`, `.avi`, `.mov`, `.mkv` (使用专门的视频链接功能)

### 需要添加的库

安装必要的库：
```bash
npm install xlsx
```

**注意**: PowerPoint 解析比较复杂，可以先返回友好的错误提示，建议用户转换为 PDF。Excel 使用 `xlsx` 库即可。

### 修复 `app/api/process/file/route.ts`

在 `extractTextFromFile` 函数中添加：

```typescript
async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name.toLowerCase();

  // PDF
  if (fileName.endsWith('.pdf')) {
    try {
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = (pdfParseModule as any).default || pdfParseModule;
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      throw new Error('Failed to parse PDF file');
    }
  }
  
  // Word
  else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    try {
      const mammothModule = await import("mammoth");
      const mammoth = (mammothModule as any).default || mammothModule;
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      throw new Error('Failed to parse Word document');
    }
  }
  
  // Excel
  else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      let text = '';
      
      // 遍历所有工作表
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_csv(worksheet);
        text += `Sheet: ${sheetName}\n${sheetData}\n\n`;
      });
      
      return text;
    } catch (error) {
      throw new Error('Failed to parse Excel file');
    }
  }
  
  // Excel
  else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      let text = '';
      
      // 遍历所有工作表
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_csv(worksheet);
        text += `Sheet: ${sheetName}\n${sheetData}\n\n`;
      });
      
      return text;
    } catch (error) {
      throw new Error('Failed to parse Excel file. Please ensure the file is not corrupted.');
    }
  }
  
  // CSV
  else if (fileName.endsWith('.csv')) {
    return buffer.toString('utf-8');
  }
  
  // PowerPoint (暂时不支持，返回友好提示)
  else if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
    throw new Error('PowerPoint files are not yet supported. Please convert to PDF or export as text first.');
  }
  
  // Text files
  else if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.json')) {
    return buffer.toString('utf-8');
  }
  
  // Code files
  else if (['.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.html', '.css', '.xml', '.yaml', '.yml', '.sh', '.bat', '.ps1'].some(ext => fileName.endsWith(ext))) {
    return buffer.toString('utf-8');
  }
  
  // 不支持的格式（ChatGPT 也不支持）
  else if (['.zip', '.rar', '.7z', '.tar', '.gz', '.exe', '.dll', '.bin', '.iso', '.dmg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.mp3', '.wav', '.m4a', '.flac', '.mp4', '.avi', '.mov', '.mkv'].some(ext => fileName.endsWith(ext))) {
    const fileType = fileName.split('.').pop()?.toUpperCase();
    if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].some(ext => fileName.endsWith(ext))) {
      throw new Error(`Image files (${fileType}) are not supported. Please convert to PDF or use OCR tools first.`);
    } else if (['.mp3', '.wav', '.m4a', '.flac'].some(ext => fileName.endsWith(ext))) {
      throw new Error(`Audio files (${fileType}) should be uploaded using the Audio Upload feature, not file upload.`);
    } else if (['.mp4', '.avi', '.mov', '.mkv'].some(ext => fileName.endsWith(ext))) {
      throw new Error(`Video files (${fileType}) should be processed using the Video Link feature, not file upload.`);
    } else {
      throw new Error(`File type ${fileType} is not supported. Supported types: PDF, Word, Excel, CSV, Text, Code files.`);
    }
  }
  
  else {
    throw new Error(`Unsupported file type: ${file.name}. Supported types: PDF, Word, Excel (.xlsx, .xls), CSV, Text (.txt, .md), Code files (.js, .ts, .py, etc.).`);
  }
}
```

### 更新 Dashboard 文件输入

在 `app/dashboard/page.tsx` 中更新文件输入：

```typescript
<input
  ref={fileInputRef}
  type="file"
  className="hidden"
  accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.txt,.md,.json,.js,.ts,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.html,.css,.xml,.yaml,.yml,.sh,.bat,.ps1"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) handleDocumentUpload(file);
  }}
/>
```

**注意**: PowerPoint (`.pptx`, `.ppt`) 暂时不包含在 accept 中，因为解析功能还未实现。如果用户上传，会在后端返回友好错误提示。

---

## 问题 6: 修复 Dashboard "View Full Notes" 按钮

### 文件位置
`app/dashboard/page.tsx` 第 672 行

### 当前问题
使用 `window.location.href`，应该使用 `router.push`。

### 修复
```typescript
// 第 672 行，修改为：
onClick={() => router.push(`/dashboard/${selectedProject.id}`)}
```

确保 `selectedProject.id` 是真实的 sessionId（通过修复上传函数后，这个会自动修复）。

---

## 问题 7: 添加加载状态显示

### 文件位置
`app/dashboard/page.tsx`

### 需要添加
在 Dashboard 组件中添加加载状态显示，当 `isLoading` 为 true 时显示加载动画。

```typescript
// 在 return 语句开始处添加
if (isLoading) {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Processing your file...</p>
      </div>
    </div>
  );
}
```

---

## 修复检查清单

完成以下所有修复：

- [ ] 修复 `handleDocumentUpload` - 调用 `/api/process/file`
- [ ] 修复 `handleAudioUpload` - 调用 `/api/process/audio`
- [ ] 修复 `handleVideoLink` - 调用 `/api/process/video`
- [ ] 添加 `isLoading` state
- [ ] 添加 `useRouter` import 和实例
- [ ] 修复 Chat 页面的 `window.location.replace` → `router.replace`
- [ ] 扩展文件类型支持（Excel, PowerPoint, Code files）
- [ ] 更新 Dashboard 文件输入 accept 属性
- [ ] 修复 "View Full Notes" 按钮使用 `router.push`
- [ ] 添加加载状态显示
- [ ] 所有函数改为 async/await
- [ ] 添加错误处理（try/catch）
- [ ] 上传成功后重新加载 sessions 列表

---

## 测试要求

修复后测试：
1. 上传 PDF 文件 → 应该生成笔记并导航到详情页
2. 上传 Word 文件 → 应该生成笔记并导航到详情页
3. 上传 Excel 文件 → 应该生成笔记并导航到详情页
4. 上传音频文件 → 应该转录并生成笔记
5. 输入视频链接 → 应该处理并生成笔记
6. 点击 "View Full Notes" → 应该正确导航到详情页
7. Chat 页面 → 应该正常加载，不跳转到 onboarding

---

## 重要提示

1. **不要删除现有代码**，只修改必要的函数
2. **保持错误处理**，所有 API 调用都要有 try/catch
3. **保持用户体验**，添加加载状态和错误提示
4. **文件类型支持**：优先实现 Excel，PowerPoint 可以先返回错误提示
5. **API 路径**：统一使用 `/api/process/file`，`/api/process/audio`，`/api/process/video`

---

**开始修复**: 按照上述要求，一次性修复所有问题。完成后测试所有功能是否正常工作。

