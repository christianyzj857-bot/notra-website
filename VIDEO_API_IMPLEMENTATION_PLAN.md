# 视频平台 API 实现方案

## 目标

实现支持 YouTube、Bilibili、抖音三个平台的视频转录和笔记生成功能。

---

## 技术架构

### 1. 平台识别
根据 URL 识别视频平台：
- YouTube: `youtube.com`, `youtu.be`
- Bilibili: `bilibili.com`
- 抖音: `douyin.com`, `iesdouyin.com`

### 2. API 集成

#### YouTube (官方 API)
```typescript
// 使用 YouTube Data API v3
// 需要 API Key: YOUTUBE_API_KEY
// 免费配额: 10,000 单位/天
```

#### Bilibili (第三方服务)
```typescript
// 使用 OneAPI 或类似服务
// 需要 API Key: BILIBILI_API_KEY
// 成本: 0.03 元/次
```

#### 抖音 (第三方服务)
```typescript
// 使用 OneAPI 或类似服务
// 需要 API Key: DOUYIN_API_KEY
// 成本: 0.03 元/次
```

### 3. 降级方案
如果无法获取字幕，使用 Whisper API 进行语音转文字。

---

## 实现步骤

### Step 1: 环境变量配置

在 `.env.local` 中添加：
```env
# YouTube
YOUTUBE_API_KEY=your_youtube_api_key

# Bilibili (第三方服务)
BILIBILI_API_KEY=your_bilibili_api_key
BILIBILI_API_URL=https://api.oneapi.com/bilibili

# 抖音 (第三方服务)
DOUYIN_API_KEY=your_douyin_api_key
DOUYIN_API_URL=https://api.oneapi.com/douyin

# OpenAI (已存在，用于 Whisper 降级方案)
OPENAI_API_KEY=your_openai_api_key
```

### Step 2: 安装依赖

```bash
npm install youtube-transcript
npm install @google-cloud/video-intelligence  # 可选，用于 YouTube
```

### Step 3: 实现平台识别

```typescript
// lib/videoPlatforms.ts
export type VideoPlatform = 'youtube' | 'bilibili' | 'douyin' | 'unknown';

export function detectVideoPlatform(url: string): VideoPlatform {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('bilibili.com')) {
    return 'bilibili';
  }
  if (url.includes('douyin.com') || url.includes('iesdouyin.com')) {
    return 'douyin';
  }
  return 'unknown';
}

export function extractVideoId(url: string, platform: VideoPlatform): string | null {
  // 实现各平台的视频 ID 提取逻辑
  // ...
}
```

### Step 4: 实现各平台 API 调用

#### YouTube
```typescript
// lib/videoTranscripts/youtube.ts
import { YouTubeTranscript } from 'youtube-transcript';

export async function getYouTubeTranscript(videoId: string): Promise<string> {
  try {
    // 方法 1: 使用 youtube-transcript 库（免费，无需 API key）
    const transcriptItems = await YouTubeTranscript.fetchTranscript(videoId);
    return transcriptItems.map(item => item.text).join(' ');
  } catch (error) {
    // 方法 2: 使用 YouTube Data API v3（需要 API key）
    // 如果方法 1 失败，尝试方法 2
    throw error;
  }
}

export async function getYouTubeMetadata(videoId: string): Promise<{
  title: string;
  description: string;
}> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }
  
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`
  );
  const data = await response.json();
  
  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found');
  }
  
  return {
    title: data.items[0].snippet.title,
    description: data.items[0].snippet.description,
  };
}
```

#### Bilibili
```typescript
// lib/videoTranscripts/bilibili.ts
export async function getBilibiliTranscript(videoId: string): Promise<string> {
  const apiKey = process.env.BILIBILI_API_KEY;
  const apiUrl = process.env.BILIBILI_API_URL || 'https://api.oneapi.com/bilibili';
  
  if (!apiKey) {
    throw new Error('Bilibili API key not configured');
  }
  
  try {
    const response = await fetch(`${apiUrl}/video/${videoId}/transcript`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Bilibili transcript');
    }
    
    const data = await response.json();
    return data.transcript || '';
  } catch (error) {
    throw new Error(`Bilibili API error: ${error.message}`);
  }
}
```

#### 抖音
```typescript
// lib/videoTranscripts/douyin.ts
export async function getDouyinTranscript(videoId: string): Promise<string> {
  const apiKey = process.env.DOUYIN_API_KEY;
  const apiUrl = process.env.DOUYIN_API_URL || 'https://api.oneapi.com/douyin';
  
  if (!apiKey) {
    throw new Error('Douyin API key not configured');
  }
  
  try {
    const response = await fetch(`${apiUrl}/video/${videoId}/transcript`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Douyin transcript');
    }
    
    const data = await response.json();
    return data.transcript || '';
  } catch (error) {
    throw new Error(`Douyin API error: ${error.message}`);
  }
}
```

### Step 5: 统一接口

```typescript
// lib/videoTranscripts/index.ts
import { detectVideoPlatform, extractVideoId } from '../videoPlatforms';
import { getYouTubeTranscript, getYouTubeMetadata } from './youtube';
import { getBilibiliTranscript } from './bilibili';
import { getDouyinTranscript } from './douyin';

export async function getVideoTranscript(url: string): Promise<string> {
  const platform = detectVideoPlatform(url);
  const videoId = extractVideoId(url, platform);
  
  if (!videoId) {
    throw new Error('Invalid video URL');
  }
  
  try {
    switch (platform) {
      case 'youtube':
        return await getYouTubeTranscript(videoId);
      case 'bilibili':
        return await getBilibiliTranscript(videoId);
      case 'douyin':
        return await getDouyinTranscript(videoId);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  } catch (error) {
    // 降级方案：使用 Whisper API
    console.warn(`Failed to get transcript from ${platform}, falling back to Whisper API`);
    return await transcribeWithWhisper(url);
  }
}

async function transcribeWithWhisper(url: string): Promise<string> {
  // 使用 Whisper API 进行语音转文字
  // 需要下载视频或使用视频 URL
  // 成本: $0.006/分钟
  // ...
}
```

### Step 6: 更新视频处理 API

```typescript
// app/api/process/video/route.ts
import { getVideoTranscript } from '@/lib/videoTranscripts';

export async function POST(req: Request) {
  // ... existing code ...
  
  // 替换占位符函数
  const transcript = await getVideoTranscript(url);
  
  // ... rest of the code ...
}
```

---

## 成本控制

### 1. 缓存机制
```typescript
// 使用内容哈希去重（已实现）
const contentHash = generateContentHash(transcript);
const existingSession = await findSessionByHash(contentHash);
```

### 2. 配额管理
```typescript
// 检查用户配额
const used = await getUsage("video", monthKey);
if (used >= limits.maxVideoSessionsPerMonth) {
  return NextResponse.json({ error: "limit_reached" }, { status: 429 });
}
```

### 3. 错误处理
```typescript
try {
  transcript = await getVideoTranscript(url);
} catch (error) {
  // 记录错误但不暴露给用户
  console.error('Video transcript error:', error);
  // 使用降级方案或返回友好错误
}
```

---

## 测试计划

1. **YouTube 测试**
   - 测试有字幕的视频
   - 测试无字幕的视频（降级到 Whisper）
   - 测试无效视频 ID

2. **Bilibili 测试**
   - 测试正常视频
   - 测试 API 调用失败情况
   - 测试成本计算

3. **抖音测试**
   - 测试正常视频
   - 测试 API 调用失败情况
   - 测试成本计算

---

## 部署注意事项

1. **API Keys 安全**
   - 所有 API keys 存储在环境变量中
   - 不要提交到 Git
   - 使用 Vercel 环境变量管理

2. **错误监控**
   - 记录所有 API 调用失败
   - 监控成本使用情况
   - 设置告警阈值

3. **性能优化**
   - 使用缓存减少 API 调用
   - 异步处理长时间任务
   - 添加超时机制

---

## 后续优化

1. **批量处理**
   - 支持批量视频处理
   - 降低单次调用成本

2. **智能路由**
   - 根据成本选择最佳方案
   - 自动降级到更便宜的方案

3. **用户反馈**
   - 收集用户使用情况
   - 优化配额分配
   - 调整定价策略

