import { createRoute } from "@hono/zod-openapi";
import {
  ApiResponseSchema,
  EndpointListSchema,
  StatusParamsSchema,
  TimeoutQuerySchema,
} from "./schemas.ts";

export const rootRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Root"],
  summary: "端点列表",
  responses: {
    200: {
      description: "端点列表与各框架文档链接",
      content: {
        "application/json": {
          schema: EndpointListSchema,
        },
      },
    },
  },
});

export const successRoute = createRoute({
  method: "get",
  path: "/success/{status}",
  tags: ["Success"],
  summary: "成功响应",
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
  tags: ["Redirect"],
  summary: "重定向",
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
  tags: ["Client Error"],
  summary: "客户端错误",
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
  tags: ["Server Error"],
  summary: "服务器错误",
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
  tags: ["Timeout"],
  summary: "延迟响应",
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
