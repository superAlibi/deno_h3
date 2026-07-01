# Monorepo 构建踩坑记录

本文档记录在搭建「多框架 OpenAPI 对比 Monorepo」过程中遇到的实际问题与解法，供后续维护或扩展参考。

---

## 1. 框架选型层面的坑

### H3 没有内置 OpenAPI

H3 v2 是极简 HTTP 框架，**不提供** Swagger / OpenAPI 自动生成。若目标是「文档随代码走」，必须换框架或在 H3 上手写 spec（维护成本高）。

### @swagent/h3 与 H3 v2 不兼容

`@swagent/h3` 的 peer 是 `h3 ^1.13`，在 H3 v2 上 mount 会报：

```
TypeError: Cannot set properties of undefined (setting 'matchedRoute')
```

结论：纯 H3 v2 项目不要用 @swagent/h3，除非降级到 H3 v1。

### 文档与真实 API 版本不一致

不少框架文档写的是**较新版本**的 API（如 Daloy 的 `docs: true`、`App.get()`），npm 上实际装到的版本可能更旧，需要以 **实际安装的包** 为准。

---

## 2. Deno Workspace

### 成员 `deno.json` 缺 `exports` 会刷屏警告

每个 workspace 成员若设置了 `name`，建议补上 `exports`，否则每次 `deno run` 都会提示：

```
Warning: "exports" field should be specified when specifying a "name".
```

应用型成员可写 `"exports": "./main.ts"` 或省略 `name`（仅保留 tasks）。

### Nitro 是「混合成员」

`apps/nitro-server` 需要 **Node.js + `package.json` + `npm install`**，不能当纯 Deno 应用对待。其他 6 个 app 可以只用 `deno run`。

### 并行启动端口冲突

`deno task dev` 会同时监听 5020–5026。本地反复测试时若未杀干净进程，容易 `AddrInUse`。测试前可：

```bash
fuser -k 5020/tcp 5021/tcp 5022/tcp 5023/tcp 5024/tcp 5025/tcp 5026/tcp 2>/dev/null
```

---

## 3. packages/shared

### 保持与旧 API 一致

原项目响应 JSON 里字段名是 `serach`（拼写错误），共享包**故意保留**，不要「顺手修正」，否则对比实验的行为会不一致。

### timeout 延迟逻辑

`handleTimeoutRequest` 必须在 `setTimeout` **回调里**再 `parseRequestBody` 并 `resolve`，不能在外面先 resolve 再 setTimeout，否则延迟语义错误。

---

## 4. Hono + @hono/zod-openapi（5021）

### Zod 版本 peer 警告

`@hono/zod-openapi@0.18` peer 要求 `zod@3.*`，workspace 解析时可能出现 zod 4 的 warning。目前能跑，若遇类型/运行时问题应 pin `zod@3`。

### OpenAPI 只覆盖 `createRoute` 声明的方法

`app.openapi(createRoute({ method: "get", ...}))` **只生成 GET 的文档**。若要支持 `ALL` 语义，需要：

- OpenAPI 里写 GET（文档代表）
- 另用 `app.all("/path/:param", handler)` 处理 POST/PUT 等

否则文档齐全但非 GET 方法无文档条目（功能仍可用）。

---

## 5. ts-api-kit（5022）

### 没有 `serve` 导出

文档示例里的 `import { serve } from "@ts-api-kit/core"` **不存在**。正确写法：

```ts
import { Server } from "@ts-api-kit/core";

const server = new Server();
await server.configureRoutes("./src/routes");
await server.start(5022);
```

启动后自动提供 `/docs`（Scalar）和 `/openapi.json`。

### 文件路由约定

- 路由文件名为 `+route.ts`
- 动态段目录：`success/[status]/+route.ts`
- 使用 Valibot schema，通过 `get({ params: v.object(...) }, handler)` 声明

---

## 6. Nitro（5023）— 坑最多

### 必须本地 npm install

根目录 `deno cache` **不会**替 `apps/nitro-server/node_modules` 解析运行时依赖。首次需：

```bash
cd apps/nitro-server && npm install
```

否则会报 `Cannot find package 'unstorage'` 等 Worker 错误。

### npm 版本号

`nitro@^3.0.1` 在 npm 上**不存在**，应 pin `3.0.0`。

### import 来源搞错（最常见）

| 符号 | 错误写法 | 正确写法 |
|------|----------|----------|
| `defineHandler` | `from "nitro"` | `from "h3"` |
| `defineRouteMeta` | `from "nitro"` | `from "nitro/runtime"` |
| `getRouterParam` | — | `from "h3"` |

Nitro 3 主入口 `nitro/dist/index.mjs` **不导出**上述 handler/meta 符号，构建产物 import 会直接 SyntaxError。

### 不能使用 workspace 别名 `@deno-h3/shared`

Nitro dev Worker 跑在 Node 解析路径下，不认 Deno workspace imports。路由里要用**相对路径**：

```
routes/index.get.ts          → ../../../packages/shared/mod.ts
routes/success/[status].ts   → ../../../../packages/shared/mod.ts
```

（注意：`[status].ts` 是**文件名**不是目录，相对路径层数与 `routes/timeout.get.ts` 不同。）

### 开发命令

```bash
cd apps/nitro-server
../../node_modules/.bin/nitro dev --port 5023
# 或 deno task dev:nitro（在装过 npm 依赖后）
```

文档地址：`/_swagger`、`/_scalar`、`/_openapi.json`（不是 `/docs`）。

### defineRouteMeta 是构建时宏

只接受**静态对象**，不能传变量或运行时 Zod schema。OpenAPI 元数据需手写 JSON Schema 形状。

---

## 7. @yelix/hono（5024）

相对最顺。注意：

```ts
app.exposeScalarOpenAPI({
  title: "...",
  openapiJsonPath: "/openapi.json",
  docsPath: "/docs",
});
```

路由上加 `openapi({ tags, summary })` 中间件即可进文档。非 GET 用 `app.all(...)`。

---

## 8. @murat/yelix 原生（5025）— 第二多坑

### `Yelix.serve()` 与 `port` 配置

构造函数里传 `port: 5025`，但 `yelix.serve()` / `restartEndpoints()` 仍可能绑 **3030**，再调 `serve()` 会 `AddrInUse`。

**最终方案**：不用 `yelix.serve()`，改为：

```ts
yelix.initOpenAPI({ ... });
yelix.serveAPIReference(new ScalarReference("/docs"));
Deno.serve({ port: 5025 }, yelix.app.fetch);
```

路由通过 `yelix.app.on(method, path, handler)` 手动注册（`api/` 下文件只 export handler 配置）。

### `loadEndpoints` 不认 `ALL`

endpoint 对象只识别：`GET | POST | PUT | PATCH | DELETE`。用 helper 展开：

```ts
export function allMethods(handler) {
  return { GET: handler, POST: handler, PUT: handler, PATCH: handler, DELETE: handler };
}
```

### `ScalarReference` 要实例化

```ts
// 错
yelix.serveAPIReference(ScalarReference);

// 对
yelix.serveAPIReference(new ScalarReference("/docs"));
```

### 文件名 `[status].ts` 的 import 路径

文件路径是 `api/success/[status].ts`（**不是** `api/success/[status]/index.ts`）。

因此：

```ts
import { allMethods } from "../helpers.ts";  // → api/helpers.ts
```

写 `./helpers.ts` 会变成 `api/success/helpers.ts` → **Module not found**。

### `noWelcome: true` 仍可能打印欢迎横幅

Yelix 0.1.47 存在时序问题，横幅可忽略，不影响功能。

---

## 9. DaloyJS @daloyjs/core 0.1.2（5026）

### 没有 `app.get()` / `docs: true`

0.1.2 的 `App` 只有 **`app.route({ method, path, responses, handler })`**。官网新版的一行 `docs: true` **在此版本不存在**。

### 手动挂载文档

```ts
import { generateOpenAPI } from "@daloyjs/core/openapi";
import { swaggerUiHtml, htmlResponse } from "@daloyjs/core/docs";

app.route({ method: "GET", path: "/openapi.json", ... handler: () => ({
  status: 200,
  body: generateOpenAPI(app, { info: { title, version } }),
})});

app.route({ method: "GET", path: "/docs", ... handler: () =>
  htmlResponse(swaggerUiHtml({ specUrl: "/openapi.json", title })),
});
```

### handler 返回值

JSON 路由返回 `{ status: 200, body: {...} }`；重定向可直接 `return Response.redirect(...)`。

---

## 10. Docker

原 Dockerfile 指向根目录 `main.ts`，迁移后需：

```dockerfile
WORKDIR /app/apps/h3-server
RUN deno cache main.ts  # 在 COPY 后、WORKDIR 前于 /app 执行 cache 亦可
CMD ["deno", "run", "--allow-net", "--allow-env", "main.ts"]
```

端口映射改为 `-p 5020:5020`（原 README 有 5020:5010 的旧映射）。

---

## 11. 建议的验证顺序

若某个服务起不来，按此排查：

1. 端口是否被占用（`fuser` / `ss -tlnp`）
2. 是否在正确目录、用了正确的 task（Nitro 先 `npm install`）
3. import 路径（Nitro 相对路径、Yelix helpers 层级）
4. 框架版本是否与文档一致（Daloy / ts-api-kit API 差异）
5. 只看 GET 200 不够时，再测 `/docs`、`/_openapi.json` 与带 path param 的路由

---

## 12. 若只保留一个「自动生成文档」方案

| 优先级 | 框架 | 理由 |
|--------|------|------|
| 推荐 | Hono + zod-openapi | 生态成熟、纯 Deno、文档与类型一体 |
| 备选 | ts-api-kit | 文件路由清晰、Scalar 开箱即用 |
| 学习成本最高 | Nitro | 需 Node 工具链 + 构建时 meta + 路径别名限制 |
| API 与文档差距大 | Daloy 0.1.x | 版本文档超前，需手动挂文档路由 |
| 维护活跃度低 | @murat/yelix | 端口/生命周期 API 晦涩，Downloads 很少 |

H3 保留作**无文档基线**即可，适合对比「手写 vs 自动生成」的维护成本。
