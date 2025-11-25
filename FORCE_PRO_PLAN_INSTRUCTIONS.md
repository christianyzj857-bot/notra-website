# 强制 Pro 会员设置说明（开发阶段）

## ✅ 已完成的修改

### 1. 登录/注册 API
- `app/api/auth/login/route.ts` - 返回 `plan: 'pro'`
- `app/api/auth/register/route.ts` - 返回 `plan: 'pro'`

### 2. 登录/注册页面
- `app/login/page.tsx` - 强制设置 `localStorage.setItem('user_plan', 'pro')`
- `app/signup/page.tsx` - 强制设置 `localStorage.setItem('user_plan', 'pro')`

### 3. 用户计划获取函数
- `lib/userPlan.ts` - 即使 localStorage 有 'free'，也强制返回 'pro'（开发阶段）

## 🔧 如果已经登录的用户还是显示 Free

### 方法 1：重新登录
1. 退出登录
2. 重新登录
3. 系统会自动设置 `user_plan = 'pro'`

### 方法 2：手动设置（浏览器控制台）
在浏览器控制台执行：
```javascript
localStorage.setItem('user_plan', 'pro');
location.reload();
```

### 方法 3：清除 localStorage（推荐）
在浏览器控制台执行：
```javascript
localStorage.removeItem('user_plan');
localStorage.setItem('user_plan', 'pro');
location.reload();
```

## ✅ 验证方法

1. **检查 localStorage**：
   ```javascript
   localStorage.getItem('user_plan') // 应该是 'pro'
   ```

2. **Dashboard**：
   - 应该显示 "Pro Plan" 徽章
   - 不应该看到 "Upgrade to Pro" 按钮
   - 所有上传功能应该无限制

3. **Notra Chat AI**：
   - 三个模型按钮（4o-Mini, GPT-4o, GPT-5.1）都应该可用
   - 不应该看到 "Upgrade to Pro" 的错误提示

## 📝 注意事项

- **开发阶段**：所有用户默认都是 Pro 会员
- **生产环境**：需要实现真实的会员系统和订阅逻辑
- **Vercel 部署**：新部署后，所有新登录的用户都会自动获得 Pro 权限

