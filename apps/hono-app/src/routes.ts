import { createRoute } from "@hono/zod-openapi";
import {
  ApiResponseSchema,
  StatusParamsSchema,
  TimeoutQuerySchema,
} from "./schemas.ts";

export const successRoute = createRoute({
  method: "get",
  path: "/success/{status}",
  tags: ["成功响应"],
  summary: "返回20x系列响应",
  request: {
    params: StatusParamsSchema,
  },
  responses: {
    200: {
      description: "成功响应",
      content: {
        "application/json": {
          schema: ApiResponseSchema,
        },
      },
    },
  },
});

export const redirectRoute = createRoute({
  method: "get",
  path: "/redirect/{status}",
  tags: ["重定响应"],
  summary: "返回重定向响应",
  request: {
    params: StatusParamsSchema,
  },
  responses: {
    302: {
      description: "重定向",
    },
  },
});

export const clientErrorRoute = createRoute({
  method: "get",
  path: "/client-error/{status}",
  tags: ["客户端错误"],
  summary: "返回指定状态码的客户端错误",
  description: "返回指定状态码的客户端错误",
  request: {
    params: StatusParamsSchema,
  },
  responses: {
    400: { description: "Client error" },
    401: { description: "Unauthorized" },
    403: { description: "Forbidden" },
    404: { description: "Not Found" },
  },
});

export const serverErrorRoute = createRoute({
  method: "get",
  path: "/server-error/{status}",
  tags: ["服务器错误"],
  summary: "返回指定状态码的服务器错误",
  request: {
    params: StatusParamsSchema,
  },
  responses: {
    500: {
      description: "服务器错误",
      content: {
        "application/json": {
          schema: ApiResponseSchema,
        },
      },
    },
  },
});

export const timeoutRoute = createRoute({
  method: "get",
  path: "/timeout",
  tags: ["延时响应"],
  summary: "根据请求参数返回延时响应",
  request: {
    query: TimeoutQuerySchema,
  },
  responses: {
    200: {
      description: "延迟后的成功响应",
      content: {
        "application/json": {
          schema: ApiResponseSchema,
        },
      },
    },
  },
});
