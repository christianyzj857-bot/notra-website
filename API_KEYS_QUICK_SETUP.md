# API Keys 快速配置指南

## 需要在 Vercel 添加的环境变量

### 1. YouTube API Key（可选，但推荐）

**获取链接**: https://console.cloud.google.com/apis/credentials

**步骤**:
1. 访问上面的链接
2. 创建新项目或选择现有项目
3. 启用 "YouTube Data API v3"
4. 创建 API Key
5. 复制 API Key

**Vercel 环境变量**:
- 变量名: `YOUTUBE_API_KEY`
- 值: 你的 YouTube API Key

**注意**: YouTube 转录也可以不使用 API Key（使用免费库），但配置后可以获取视频标题和描述。

---

### 2. Bilibili API Key（必需，如果要支持 Bilibili）

**推荐服务**: OneAPI - https://getoneapi.com/

**步骤**:
1. 访问 OneAPI 网站
2. 注册账号
3. 获取 Bilibili API Key
4. 价格：约 0.03 元/次调用

**Vercel 环境变量**:
- 变量名: `BILIBILI_API_KEY`
- 值: 你的 Bilibili API Key

**可选**:
- 变量名: `BILIBILI_API_URL`
- 值: `https://api.oneapi.com/bilibili`（如果不设置，会使用默认值）

---

### 3. OpenAI API Key（应该已经有了）

**获取链接**: https://platform.openai.com/api-keys

**Vercel 环境变量**:
- 变量名: `OPENAI_API_KEY`
- 值: 你的 OpenAI API Key

---

## 在 Vercel 中添加环境变量

1. **登录 Vercel**: https://vercel.com/
2. **选择项目**: notra-website
3. **进入设置**: Settings → Environment Variables
4. **添加变量**: 点击 "Add New"，输入变量名和值
5. **选择环境**: Production, Preview, Development（建议全选）
6. **保存并重新部署**: 添加后必须重新部署项目

---

## 必需 vs 可选

| 环境变量 | 必需性 | 说明 |
|---------|--------|------|
| `OPENAI_API_KEY` | ✅ 必需 | 用于生成笔记 |
| `BILIBILI_API_KEY` | ⚠️ 必需（如果要支持 Bilibili） | 用于 Bilibili 视频转录 |
| `YOUTUBE_API_KEY` | ⚠️ 可选（推荐） | 用于获取 YouTube 视频元数据 |
| `BILIBILI_API_URL` | ⚠️ 可选 | 默认使用 OneAPI |

---

## 测试

添加环境变量并重新部署后：

1. **测试 YouTube**: 
   - 输入: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - 应该能成功生成笔记

2. **测试 Bilibili**:
   - 输入: `https://www.bilibili.com/video/BV1xx411c7mu`
   - 需要配置 `BILIBILI_API_KEY` 才能工作

---

## 详细文档

查看 `VERCEL_API_KEYS_SETUP.md` 获取更详细的配置说明。

