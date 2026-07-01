# hono-app — Cloudflare Workers

Hono + @hono/zod-openapi HTTP 测试服务，部署目标为 Cloudflare Workers。

在 monorepo 根目录运行：

```bash
pnpm dev       # wrangler dev
pnpm deploy    # wrangler deploy --minify
pnpm cf-typegen
```

或在本目录：

```bash
pnpm dev
pnpm deploy
```

依赖 `@deno-h3/shared` workspace 包，Wrangler 会自动打包。
