import { z } from "@hono/zod-openapi";

export const StatusParamsSchema = z.object({
  status: z.coerce.number().int().openapi({
    param: { name: "status", in: "path", description: "响应状态码" },
    example: 200,
  }),
});

export const TimeoutQuerySchema = z.object({
  timeout: z.coerce.number().int().optional().openapi({
    param: { name: "timeout", in: "query" },
    example: 60_000,
  }),
});

export const ApiResponseSchema = z
  .object({
    contentType: z.string().nullable(),
    serach: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
    body: z.unknown().nullable(),
    message: z.string(),
  })
  .openapi("ApiResponse");

export const EndpointListSchema = z
  .object({
    endpoints: z.array(z.string()),
    docs: z.array(
      z.object({
        framework: z.string(),
        url: z.string(),
      }),
    ),
  })
  .openapi("EndpointList");
