# Bilibili（中国 B 站）API 服务选项

## 说明

代码已经正确识别中国 B 站（bilibili.com），支持以下 URL 格式：
- `https://www.bilibili.com/video/BVxxxxx`
- `https://bilibili.com/video/BVxxxxx`
- `https://m.bilibili.com/video/BVxxxxx`
- `https://www.bilibili.com/video/avxxxxx`（旧格式）

## API 服务选项

### 选项 1: OneAPI（推荐，已在代码中使用）

**网站**: https://getoneapi.com/

**优点**:
- 价格透明：约 0.03 元/次调用
- 支持中国 B 站
- 易于集成
- 有中文支持

**配置**:
- 在 Vercel 环境变量中添加：
  - `BILIBILI_API_KEY` = 你的 OneAPI API Key
  - `BILIBILI_API_URL` = `https://api.oneapi.com/bilibili`（可选，默认值）

---

### 选项 2: 其他第三方服务

如果 OneAPI 不适合，可以搜索其他 Bilibili API 服务：

1. **搜索关键词**:
   - "Bilibili API 服务"
   - "B站 API 接口"
   - "Bilibili 数据接口"

2. **注意事项**:
   - 确保服务支持中国 B 站（bilibili.com）
   - 确认价格和调用限制
   - 测试 API 是否稳定

3. **配置**:
   - 更新 `BILIBILI_API_URL` 环境变量
   - 可能需要调整 `lib/videoTranscripts/bilibili.ts` 中的 API 调用格式

---

### 选项 3: Bilibili 官方 API（不推荐）

**说明**:
- Bilibili 官方 API 主要面向站内开发者
- 公开文档较少
- 申请流程复杂
- 不适合外部应用使用

**如果必须使用**:
- 需要申请 Bilibili 开放平台账号
- 可能需要企业认证
- API 文档：https://openhome.bilibili.com/

---

## 当前实现

代码中的 Bilibili API 调用位于 `lib/videoTranscripts/bilibili.ts`：

```typescript
const apiUrl = process.env.BILIBILI_API_URL || 'https://api.oneapi.com/bilibili';
```

**默认使用 OneAPI**，如果需要更换服务商，只需：
1. 更新 `BILIBILI_API_URL` 环境变量
2. 根据新服务商的 API 文档调整请求格式（如果需要）

---

## 测试中国 B 站视频

### 测试 URL 示例

1. **BV 号格式**（新格式）:
   ```
   https://www.bilibili.com/video/BV1xx411c7mu
   ```

2. **av 号格式**（旧格式）:
   ```
   https://www.bilibili.com/video/av123456789
   ```

3. **移动端 URL**:
   ```
   https://m.bilibili.com/video/BV1xx411c7mu
   ```

### 测试步骤

1. 在 Dashboard 输入 B 站视频链接
2. 点击 "Process Video"
3. 应该能成功识别并处理

---

## 常见问题

### Q: 代码支持国际版 Bilibili 吗？

**A**: 代码主要针对中国 B 站（bilibili.com）设计。如果国际版使用不同的域名，可能需要添加额外的识别逻辑。

### Q: 如何确认 API 服务支持中国 B 站？

**A**: 
- 查看服务商文档
- 测试一个中国 B 站视频 URL
- 确认返回的数据格式正确

### Q: 如果 API 服务不支持，怎么办？

**A**: 
1. 更换其他 API 服务商
2. 或者暂时禁用 Bilibili 支持，只使用 YouTube
3. 等待更好的 API 服务出现

---

## 推荐配置

**当前推荐**: 使用 OneAPI
- 价格合理（0.03 元/次）
- 支持中国 B 站
- 易于配置

**配置步骤**:
1. 访问 https://getoneapi.com/
2. 注册并获取 API Key
3. 在 Vercel 添加 `BILIBILI_API_KEY` 环境变量
4. 重新部署项目

