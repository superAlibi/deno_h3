import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import type { RedirectStatusCode } from "hono/utils/http-status";
import {
  getEndpointList,
  REDIRECT_TARGET,
} from "@deno-h3/shared/constants";
import {
  handleErrorRequest,
  handleSuccessRequest,
  handleTimeoutRequest,
  parseQueryFromUrl,
} from "@deno-h3/shared/response";
import { asRouteHandler } from "./openapi-handlers.ts";
import {
  clientErrorRoute,
  redirectRoute,
  rootRoute,
  serverErrorRoute,
  successRoute,
  timeoutRoute,
} from "./routes.ts";

const app = new OpenAPIHono();

app.openapi(rootRoute, (c) => {
  const url = new URL(c.req.url);
  const { endpoints, docs } = getEndpointList(`${url.protocol}//${url.host}`);
  return c.json({ endpoints, docs }, 200);
});

app.openapi(
  successRoute,
  asRouteHandler<typeof successRoute>(async (c) => {
    const { status } = c.req.valid("param");
    return handleSuccessRequest(
      c.req.raw,
      status || 200,
      parseQueryFromUrl(c.req.url),
    );
  }),
);

app.openapi(
  redirectRoute,
  asRouteHandler<typeof redirectRoute>((c) => {
    const { status } = c.req.valid("param");
    return Response.redirect(
      new URL(REDIRECT_TARGET, c.req.raw.url).toString(),
      (status || 302) as RedirectStatusCode,
    );
  }),
);

app.openapi(
  clientErrorRoute,
  asRouteHandler<typeof clientErrorRoute>(async (c) => {
    const { status } = c.req.valid("param");
    return handleErrorRequest(
      c.req.raw,
      status || 400,
      parseQueryFromUrl(c.req.url),
      `Bad Request ${status}`,
    );
  }),
);

app.openapi(
  serverErrorRoute,
  asRouteHandler<typeof serverErrorRoute>(async (c) => {
    const { status } = c.req.valid("param");
    return handleErrorRequest(
      c.req.raw,
      status || 500,
      parseQueryFromUrl(c.req.url),
      `Server Error with status ${status}`,
    );
  }),
);

app.openapi(
  timeoutRoute,
  asRouteHandler<typeof timeoutRoute>(async (c) =>
    handleTimeoutRequest(c.req.raw, parseQueryFromUrl(c.req.url))
  ),
);

app.doc("/openapi.json", (c) => ({
  openapi: "3.0.0",
  info: {
    title: "HTTP Test (Hono + zod-openapi)",
    version: "1.0.0",
    description:
      "基于 @hono/zod-openapi 的 OpenAPI 自动生成（Cloudflare Workers）",
  },
  servers: [
    {
      url: new URL(c.req.url).origin,
      description: "当前环境",
    },
  ],
}));

app.get(
  "/docs",
  Scalar({
    theme: "kepler",
    spec: { url: "/openapi.json" },
  }),
);

app.all(
  "*",
  async (c) =>
    handleSuccessRequest(c.req.raw, 200, parseQueryFromUrl(c.req.url)),
);

export default app;
