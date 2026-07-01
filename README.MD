# HTTP 测试服务器 — Cloudflare Workers Monorepo

基于 pnpm workspace 的 monorepo，核心应用为部署到 Cloudflare Workers 的 Hono + zod-openapi 服务。

## 前置环境

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 11+
- [Cloudflare 账号](https://dash.cloudflare.com/)（部署时需要）

## 快速开始

```bash
# 安装依赖
pnpm install

# 本地开发（Wrangler dev server，默认 http://localhost:8787）
pnpm dev

# 部署到 Cloudflare Workers
pnpm deploy
```

## 项目结构

```
deno_h3/
├── package.json              # 根 workspace 脚本
├── pnpm-workspace.yaml       # pnpm monorepo 配置
├── packages/
│   └── shared/               # @deno-h3/shared — 共享响应逻辑与常量
└── apps/
    └── hono-app/             # Cloudflare Workers — Hono + zod-openapi
        ├── src/
        ├── wrangler.jsonc
        └── package.json
```

## API 端点

- `GET /` — 端点列表与文档链接
- `GET /success/{status}` — 2xx 成功响应
- `GET /redirect/{status}` — 3xx 重定向
- `GET /client-error/{status}` — 4xx 客户端错误
- `GET /server-error/{status}` — 5xx 服务器错误
- `GET /timeout?timeout=` — 延迟响应
- `GET /openapi.json` — OpenAPI spec
- `GET /docs` — Scalar 文档 UI
- `ALL /*` — 默认成功响应（catch-all）

## Cloudflare 部署

### 本地手动部署

```bash
# 登录 Cloudflare（首次）
pnpm exec wrangler login

# 部署
pnpm deploy
```

### CI/CD（GitHub Actions）

在 GitHub 仓库 Settings → Secrets 中配置：

| Secret | 说明 |
| ------ | ---- |
| `CLOUDFLARE_API_TOKEN` | [API Token](https://dash.cloudflare.com/profile/api-tokens)，需 Workers Scripts Edit 权限 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账号 ID（Dashboard 右侧栏） |

推送到 `main` 分支后自动部署，也可在 Actions 页手动触发。

## 技术栈

- **运行时**: Cloudflare Workers
- **框架**: Hono + @hono/zod-openapi
- **文档 UI**: Scalar
- **共享包**: `@deno-h3/shared`（pnpm workspace）
- **构建/部署**: Wrangler 4

## 开发说明

- 共享逻辑放在 `packages/shared`，通过 `"@deno-h3/shared": "workspace:*"` 引用
- Wrangler 会自动打包 workspace 依赖，无需预编译 shared 包
- 修改 `wrangler.jsonc` 后运行 `pnpm cf-typegen` 更新类型

更细的构建踩坑见 [docs/BUILD_PITFALLS.md](docs/BUILD_PITFALLS.md)。
