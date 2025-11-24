# API 测试指南

## 检查清单

### 1. 环境变量
确保设置了 `OPENAI_API_KEY`：
```bash
# 在 .env.local 文件中
OPENAI_API_KEY=sk-...
```

### 2. 测试文件上传 API
```bash
curl -X POST http://localhost:3000/api/process/file \
  -F "file=@test.txt" \
  -v
```

### 3. 检查日志
查看服务器控制台输出，应该看到：
- `[File API] Starting learning asset generation`
- `[LearningAssetGenerator] Calling OpenAI API`
- `[File API] Session created successfully`

### 4. 常见问题

#### 问题1: "OpenAI API key not configured"
- 检查 `.env.local` 文件是否存在
- 检查 `OPENAI_API_KEY` 是否正确设置
- 重启开发服务器

#### 问题2: "Failed to parse OpenAI response as JSON"
- OpenAI 返回了非 JSON 格式的响应
- 检查 OpenAI API 是否正常工作
- 查看服务器日志中的响应内容

#### 问题3: "Failed to save session"
- 数据库文件权限问题
- 检查 `.notra-data` 目录是否可写

#### 问题4: 前端显示 "Failed to upload file"
- 打开浏览器开发者工具 (F12)
- 查看 Console 标签页的错误信息
- 查看 Network 标签页，找到 `/api/process/file` 请求
- 查看请求的 Response 内容

