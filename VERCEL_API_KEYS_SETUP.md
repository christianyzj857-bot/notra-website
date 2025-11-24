# Vercel 环境变量配置指南

## 视频平台 API Keys 配置

为了使用 YouTube 和 Bilibili 的视频转录功能，需要在 Vercel 中添加以下环境变量。

---

## 1. YouTube API Key（可选，但推荐）

### 获取 YouTube API Key

1. **访问 Google Cloud Console**
   - 链接：https://console.cloud.google.com/
   - 登录你的 Google 账号

2. **创建新项目或选择现有项目**
   - 点击项目选择器，创建新项目或选择现有项目

3. **启用 YouTube Data API v3**
   - 在搜索栏搜索 "YouTube Data API v3"
   - 点击进入并点击 "启用" 按钮
   - 链接：https://console.cloud.google.com/apis/library/youtube.googleapis.com

4. **创建 API Key**
   - 进入 "凭据" 页面：https://console.cloud.google.com/apis/credentials
   - 点击 "创建凭据" → "API 密钥"
   - 复制生成的 API Key

5. **（可选）限制 API Key**
   - 点击刚创建的 API Key 进行编辑
   - 在 "API 限制" 中选择 "限制密钥"
   - 选择 "YouTube Data API v3"
   - 保存

### 添加到 Vercel

- **变量名**: `YOUTUBE_API_KEY`
- **值**: 你从 Google Cloud Console 复制的 API Key
- **说明**: YouTube API 有每天 10,000 单位的免费配额，通常足够使用

**注意**: YouTube 转录功能也可以不使用 API Key（使用免费库），但使用 API Key 可以获取视频元数据（标题、描述等）。

---

## 2. Bilibili API Key（必需）

### 获取 Bilibili API Key

Bilibili 官方 API 文档较少，推荐使用第三方服务：

#### 选项 A: OneAPI（推荐）

1. **访问 OneAPI**
   - 网站：https://getoneapi.com/
   - 或搜索 "OneAPI Bilibili"

2. **注册账号**
   - 创建账号并登录

3. **获取 API Key**
   - 在控制台中找到 Bilibili API 服务
   - 获取你的 API Key
   - 价格：约 0.03 元/次调用

4. **获取 API URL**
   - 通常是：`https://api.oneapi.com/bilibili`
   - 或查看 OneAPI 文档获取最新 URL

#### 选项 B: 其他第三方服务

- 搜索 "Bilibili API 服务" 或 "Bilibili 数据接口"
- 选择可靠的服务商
- 获取 API Key 和 API URL

### 添加到 Vercel

- **变量名**: `BILIBILI_API_KEY`
- **值**: 你从第三方服务获取的 API Key
- **说明**: 每次调用 Bilibili API 约 0.03 元

- **变量名**: `BILIBILI_API_URL`（可选）
- **值**: API 服务的基础 URL（如：`https://api.oneapi.com/bilibili`）
- **说明**: 如果不设置，默认使用 OneAPI 的 URL

---

## 3. OpenAI API Key（已存在，用于笔记生成）

如果你还没有配置：

- **变量名**: `OPENAI_API_KEY`
- **值**: 你的 OpenAI API Key
- **获取链接**: https://platform.openai.com/api-keys

---

## 在 Vercel 中添加环境变量

### 方法 1: 通过 Vercel Dashboard

1. **登录 Vercel**
   - 访问：https://vercel.com/
   - 登录你的账号

2. **进入项目设置**
   - 选择你的项目（notra-website）
   - 点击 "Settings" → "Environment Variables"

3. **添加环境变量**
   - 点击 "Add New"
   - 输入变量名和值
   - 选择环境（Production, Preview, Development）
   - 点击 "Save"

4. **重新部署**
   - 添加环境变量后，需要重新部署项目
   - 在 "Deployments" 页面，点击最新部署的 "..." → "Redeploy"

### 方法 2: 通过 Vercel CLI

```bash
# 安装 Vercel CLI（如果还没有）
npm i -g vercel

# 登录
vercel login

# 添加环境变量
vercel env add YOUTUBE_API_KEY
vercel env add BILIBILI_API_KEY
vercel env add BILIBILI_API_URL
vercel env add OPENAI_API_KEY

# 重新部署
vercel --prod
```

---

## 环境变量列表

### 必需的环境变量

| 变量名 | 说明 | 必需性 |
|--------|------|--------|
| `OPENAI_API_KEY` | OpenAI API Key（用于生成笔记） | ✅ 必需 |
| `BILIBILI_API_KEY` | Bilibili API Key（用于 Bilibili 视频转录） | ✅ 必需（如果要支持 Bilibili） |

### 可选的环境变量

| 变量名 | 说明 | 必需性 |
|--------|------|--------|
| `YOUTUBE_API_KEY` | YouTube Data API v3 Key（用于获取视频元数据） | ⚠️ 可选（推荐） |
| `BILIBILI_API_URL` | Bilibili API 服务 URL | ⚠️ 可选（默认使用 OneAPI） |

---

## 测试配置

### 测试 YouTube

1. 在 Dashboard 输入一个 YouTube 视频链接
2. 例如：`https://www.youtube.com/watch?v=dQw4w9WgXcQ`
3. 点击 "Process Video"
4. 如果成功，应该能看到生成的笔记

### 测试 Bilibili

1. 在 Dashboard 输入一个 Bilibili 视频链接
2. 例如：`https://www.bilibili.com/video/BV1xx411c7mu`
3. 点击 "Process Video"
4. 如果成功，应该能看到生成的笔记

---

## 常见问题

### Q: YouTube 不配置 API Key 可以吗？

**A**: 可以！YouTube 转录功能使用免费库，不需要 API Key。但配置 API Key 可以获取视频标题和描述，提升用户体验。

### Q: Bilibili API Key 必须配置吗？

**A**: 是的，如果要支持 Bilibili 视频，必须配置 `BILIBILI_API_KEY`。否则 Bilibili 视频会处理失败。

### Q: 如何查看 API 调用成本？

**A**: 
- YouTube: 在 Google Cloud Console 查看配额使用情况
- Bilibili: 在第三方服务商的控制台查看调用次数和费用

### Q: 环境变量添加后不生效？

**A**: 
1. 确保环境变量名称拼写正确
2. 确保选择了正确的环境（Production/Preview/Development）
3. **重要**: 添加环境变量后必须重新部署项目

---

## 成本估算

### 小规模使用（每月 100 个视频）

- YouTube: ¥0（免费）
- Bilibili: 100 × ¥0.03 = ¥3
- **总计**: ¥3/月

### 中等规模（每月 1,000 个视频）

- YouTube: ¥0（免费）
- Bilibili: 1,000 × ¥0.03 = ¥30
- **总计**: ¥30/月

**注意**: Free plan 用户每月限制 3 个视频，所以实际成本会更低。

---

## 下一步

1. ✅ 获取所有必需的 API Keys
2. ✅ 在 Vercel 中添加环境变量
3. ✅ 重新部署项目
4. ✅ 测试 YouTube 和 Bilibili 视频处理功能

如果遇到问题，请检查：
- 环境变量是否正确添加
- API Keys 是否有效
- 项目是否已重新部署

