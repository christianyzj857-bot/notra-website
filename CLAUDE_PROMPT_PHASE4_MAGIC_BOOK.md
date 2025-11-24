# Phase 4: 集成魔法书动画到 Dashboard

## 任务目标
在 Dashboard 的上传功能中添加魔法书动画效果，参考 onboarding 阶段的实现。

## 当前状态
- ✅ Onboarding 魔法书动画已实现 (`app/onboarding/step2/page.tsx`)
- ❌ Dashboard 上传功能缺少动画效果
- ❌ 需要创建可复用的魔法书组件

## 需要实现的功能

### 1. 创建可复用的魔法书组件

**文件位置**: `components/MagicBookUpload.tsx`

**组件 Props**:
```typescript
interface MagicBookUploadProps {
  isOpen: boolean;
  type: "file" | "audio" | "video";
  fileName?: string;
  progress: number; // 0-100
  loadingStep: string;
  onComplete: (sessionId: string) => void;
  onClose: () => void;
}
```

### 2. 组件状态

参考 `app/onboarding/step2/page.tsx` 的状态管理：

```typescript
const [bookState, setBookState] = useState<'idle' | 'hovering' | 'loading' | 'complete'>('idle');
const [loadingProgress, setLoadingProgress] = useState(0);
const [currentLoadingStep, setCurrentLoadingStep] = useState('');
const [rightPageScale, setRightPageScale] = useState(1);
```

### 3. 动画效果

复用 onboarding 中的动画：
- **Idle**: 书本关闭，等待输入
- **Hovering**: 书本发光（当文件拖拽悬停时）
- **Loading**: 
  - 右侧页面显示加载进度（0-100%）
  - 旋转的魔法圆圈
  - 加载步骤文本
  - 魔法粒子效果
- **Complete**: 
  - 右侧页面放大（1.5x）
  - 淡入显示笔记预览
  - 显示 "View Full Notes" 按钮

### 4. 集成到 Dashboard

**文件位置**: `app/dashboard/page.tsx`

**修改函数**:
- `handleDocumentUpload(file)` - 文件上传
- `handleAudioUpload(file)` - 音频上传
- `handleVideoLink(url)` - 视频链接

**集成步骤**:
```typescript
const [showMagicBook, setShowMagicBook] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
const [uploadStep, setUploadStep] = useState('');

const handleDocumentUpload = async (file: File) => {
  // 1. 显示魔法书
  setShowMagicBook(true);
  setBookState('loading');
  
  // 2. 上传文件并更新进度
  setUploadStep('Uploading file...');
  setUploadProgress(20);
  
  // 3. 处理文件
  setUploadStep('Extracting text...');
  setUploadProgress(40);
  
  // 4. 生成笔记
  setUploadStep('Generating notes...');
  setUploadProgress(70);
  
  // 5. 完成
  setUploadStep('Almost ready...');
  setUploadProgress(100);
  setBookState('complete');
  
  // 6. 导航到笔记页面
  // onComplete(sessionId);
};
```

### 5. 进度更新逻辑

在 API 调用过程中更新进度：

```typescript
// 使用 fetch 的进度事件（如果支持）
// 或者使用定时器模拟进度更新
const updateProgress = () => {
  const interval = setInterval(() => {
    setUploadProgress(prev => {
      if (prev >= 90) {
        clearInterval(interval);
        return 90;
      }
      return prev + 10;
    });
  }, 500);
  
  return interval;
};
```

### 6. 加载步骤文本

根据处理阶段显示不同文本：

```typescript
const loadingSteps = [
  { text: 'Uploading...', progress: 0 },
  { text: 'Extracting content...', progress: 30 },
  { text: 'Analyzing structure...', progress: 50 },
  { text: 'Generating notes...', progress: 70 },
  { text: 'Creating quizzes...', progress: 85 },
  { text: 'Almost ready...', progress: 100 },
];
```

### 7. 完成后的处理

当笔记生成完成：
1. 显示笔记预览（右侧页面）
2. 显示 "View Full Notes" 按钮
3. 点击按钮导航到 `/dashboard/${sessionId}`

## 参考实现

**主要参考**: `app/onboarding/step2/page.tsx`
- 魔法书的 HTML 结构
- CSS 动画和样式
- 状态管理逻辑
- 加载进度显示

## 样式复用

可以直接复用 onboarding 中的样式类：
- `.magic-book-container`
- `.book-left-page`
- `.book-right-page`
- `.book-spine`
- 动画关键帧

## 测试

测试场景：
1. 上传文件 → 应该显示魔法书动画
2. 上传音频 → 应该显示魔法书动画
3. 上传视频 → 应该显示魔法书动画
4. 进度应该平滑更新
5. 完成后应该显示预览和导航按钮

---

**开始实现**: 
1. 创建 `components/MagicBookUpload.tsx`
2. 在 `app/dashboard/page.tsx` 中集成

