# 部署检查清单

## ✅ 已完成

- [x] 添加 `BILIBILI_API_KEY` 环境变量
- [x] 添加 `OPENAI_API_KEY` 环境变量（如果还没有）

## 🔄 下一步：重新部署

### 在 Vercel 重新部署项目

1. **进入 Deployments 页面**
   - 在 Vercel 项目页面，点击 "Deployments" 标签

2. **重新部署**
   - 找到最新的部署记录
   - 点击右侧的 "..." 菜单
   - 选择 "Redeploy"
   - 或者点击 "Redeploy" 按钮

3. **等待部署完成**
   - 部署通常需要 1-3 分钟
   - 等待状态变为 "Ready"

## 🧪 测试步骤

### 测试 1: YouTube 视频（不需要 API Key）

1. 打开 Dashboard
2. 在视频链接输入框输入：
   ```
   https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```
3. 点击 "Process Video"
4. 应该能看到加载状态，然后跳转到笔记页面

### 测试 2: 中国 B 站视频（需要 BILIBILI_API_KEY）

1. 打开 Dashboard
2. 在视频链接输入框输入：
   ```
   https://www.bilibili.com/video/BV1xx411c7mu
   ```
   或任何其他 B 站视频链接
3. 点击 "Process Video"
4. 应该能看到加载状态，然后跳转到笔记页面

## ⚠️ 如果遇到问题

### 问题 1: "Bilibili API key not configured"

**原因**: 环境变量未正确加载

**解决**:
1. 确认环境变量名称拼写正确：`BILIBILI_API_KEY`
2. 确认选择了正确的环境（Production/Preview/Development）
3. 重新部署项目

### 问题 2: "Failed to get Bilibili transcript"

**可能原因**:
- API Key 无效
- API 服务不可用
- 视频没有字幕

**解决**:
1. 检查 API Key 是否正确
2. 确认 OneAPI 服务是否正常
3. 尝试另一个有字幕的 B 站视频

### 问题 3: 部署后仍然不工作

**解决**:
1. 清除浏览器缓存
2. 硬刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）
3. 检查 Vercel 部署日志是否有错误

## 📊 使用限制

- **Free Plan**: 每月 3 条视频
- **Pro Plan**: 无限制

## ✅ 验证清单

部署完成后，确认：
- [ ] YouTube 视频可以正常处理
- [ ] B 站视频可以正常处理
- [ ] 生成的笔记包含标题、内容、Quiz、Flashcards
- [ ] 可以点击 "View Full Notes" 查看详情
- [ ] 可以点击 "Chat with this Note" 进行对话

## 🎉 完成

如果所有测试通过，恭喜！视频转录功能已经成功部署！

