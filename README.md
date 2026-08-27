# superman 工作台

本地优先的 Team 工具前端原型，包含：

- Team 48 个月转长链（免 IP）配置界面
- Team 单席费用与账单时间检测脚本
- Token / Session 默认只在浏览器内存中处理
- 第三方接口默认关闭，不伪造或绕过授权

## 本地运行

需要 Node.js 22.13 或更高版本：

```bash
npm install
npm run dev
```

然后打开 `http://localhost:3000`。

生产构建：

```bash
npm run build
```

## 部署到 Vercel

1. 登录 Vercel，选择 **Add New → Project**。
2. 导入本 GitHub 仓库。
3. 保持默认构建设置并部署。
4. 在项目的 **Settings → Domains** 中添加自定义域名。
5. 按 Vercel 提示在域名服务商处添加 DNS 记录；解析生效后 HTTPS 会自动启用。

## 接口配置

复制 `.env.example` 为 `.env.local`。只有在获得第三方正式授权、并准备好安全的服务端代理后，才设置：

```env
NEXT_PUBLIC_ENABLE_API=true
NEXT_PUBLIC_API_BASE_URL=https://your-authorized-api.example.com
```

不要把服务端密钥、Token 或 Session 写入公开环境变量或提交到 GitHub。

## Team 账单检测

账单脚本位于 `public/team-billing-checker.js`。它需要由已登录的 Workspace 所有者在 `https://chatgpt.com/` 的浏览器控制台运行。脚本只调用订阅预览接口，不提交席位更新。
