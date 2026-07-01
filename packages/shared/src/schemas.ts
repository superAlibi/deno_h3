import { z } from "zod";

export const ApiResponseSchema = z.object({
  contentType: z.string().nullable(),
  serach: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  body: z.unknown().nullable(),
  message: z.string(),
});

export const StatusParamSchema = z.coerce.number().int();

export const TimeoutQuerySchema = z.object({
  timeout: z.coerce.number().int().optional(),
});
