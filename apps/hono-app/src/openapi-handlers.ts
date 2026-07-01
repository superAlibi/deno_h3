import type { RouteConfig, RouteHandler } from "@hono/zod-openapi";

/**
 * 桥接返回原生 `Response` 的 handler。
 * `createRoute` 的 responses 含 `content` schema 时，`RouteHandler` 要求 `TypedResponse`；
 * 共享 handler 返回原生 `Response`，运行时兼容，类型上需断言。
 */
export function asRouteHandler<R extends RouteConfig>(
  handler: (
    c: Parameters<RouteHandler<R>>[0],
  ) => Response | Promise<Response>,
): RouteHandler<R> {
  return handler as unknown as RouteHandler<R>;
}
