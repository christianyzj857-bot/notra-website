# 开发模式 Pro 会员设置

## ✅ 已完成的修改

### 1. `lib/userPlan.ts` - 默认返回 "pro"
- **修改前**：默认返回 "free"
- **修改后**：默认返回 "pro"（开发阶段）
- **支持环境变量**：可以通过 `DEV_DEFAULT_PLAN=free` 或 `DEV_DEFAULT_PLAN=pro` 控制

### 2. `app/api/chat/route.ts` - Chat API 默认 "pro"
- **修改前**：如果没有传入 `userPlan`，默认 "free"
- **修改后**：如果没有传入 `userPlan`，默认 "pro"（开发阶段）
- **支持环境变量**：可以通过 `DEV_DEFAULT_PLAN` 控制

## 🎯 开发阶段功能权限

现在作为开发者，你可以：

### Dashboard 功能
- ✅ **文件上传**：无限制（Pro: 9999/月）
- ✅ **音频上传**：无限制（Pro: 9999/月）
- ✅ **视频处理**：无限制（Pro: 9999/月）
- ✅ **文件大小**：100MB（Pro 限制）
- ✅ **页数限制**：200 页/文件（Pro 限制）
- ✅ **音频时长**：60 分钟/会话（Pro 限制）

### Notra Chat AI 功能
- ✅ **GPT-4o-mini**：可用（免费和 Pro 都支持）
- ✅ **GPT-4o**：可用（Pro 功能）
- ✅ **GPT-5.1**：可用（Pro 功能）
- ✅ **Chat with Note**：可用（RAG 检索）
- ✅ **上下文长度**：5 轮对话（Pro）
- ✅ **回复长度**：1024 tokens（Pro）

## 🔧 如何切换回 Free 模式（测试用）

### 方法 1：环境变量
在 `.env.local` 或 Vercel 环境变量中设置：
```
DEV_DEFAULT_PLAN=free
```

### 方法 2：浏览器 localStorage
在浏览器控制台执行：
```javascript
localStorage.setItem('user_plan', 'free');
// 刷新页面
location.reload();
```

### 方法 3：代码修改
修改 `lib/userPlan.ts` 最后一行：
```typescript
return "free"; // 改为 "free"
```

## 📝 注意事项

1. **生产环境**：在正式上线前，需要实现真实的用户认证和会员系统
2. **环境变量**：`DEV_DEFAULT_PLAN` 只在开发阶段有效
3. **localStorage**：客户端的 `user_plan` 会覆盖环境变量设置

## ✅ 验证方法

1. **Dashboard**：
   - 上传文件/音频/视频应该都能正常工作
   - 不应该看到 "upgrade to Pro" 的限制提示

2. **Notra Chat AI**：
   - 三个模型按钮（4o-Mini, GPT-4o, GPT-5.1）都应该可用
   - 不应该看到 "Upgrade to Pro" 的错误

3. **浏览器控制台**：
   ```javascript
   // 检查当前 plan
   localStorage.getItem('user_plan') // 应该是 null 或 'pro'
   ```

