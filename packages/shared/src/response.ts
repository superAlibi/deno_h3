import {
  DEFAULT_TIMEOUT_MS,
  NO_BODY_METHODS,
  NO_BODY_RESPONSE_STATUSES,
  NO_RESPONSE_BODY_METHODS,
} from "./constants.js";

export type QueryRecord = Record<string, string | string[]>;

export interface ResponsePayload {
  contentType: string | null;
  serach: QueryRecord;
  body: unknown;
  message: string;
}

export function parseQueryFromUrl(url: string): QueryRecord {
  const params = new URL(url).searchParams;
  const query: QueryRecord = {};
  params.forEach((value, key) => {
    const existing = query[key];
    if (existing === undefined) {
      query[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      query[key] = [existing, value];
    }
  });
  return query;
}

export async function parseRequestBody(
  req: Request,
  method: string,
): Promise<unknown> {
  if (NO_BODY_METHODS.includes(method.toLowerCase() as typeof NO_BODY_METHODS[number])) {
    return null;
  }

  const contentType = req.headers.get("Content-Type")?.toLowerCase() ?? "";
  try {
    if (contentType.includes("application/json")) {
      return await req.json();
    }
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      const fields: Record<string, FormDataEntryValue> = {};
      formData.forEach((value, key) => {
        fields[key] = value;
      });
      return fields;
    }
    if (contentType.includes("text/plain")) {
      return await req.text();
    }
  } catch (error) {
    console.error(error);
  }
  return null;
}

export function buildResponse(
  req: Request,
  payload: ResponsePayload,
  status: number,
): Response {
  if (
    NO_RESPONSE_BODY_METHODS.includes(
      req.method.toLowerCase() as typeof NO_RESPONSE_BODY_METHODS[number],
    ) ||
    NO_BODY_RESPONSE_STATUSES.includes(
      status as typeof NO_BODY_RESPONSE_STATUSES[number],
    )
  ) {
    return new Response(null, { status });
  }

  const accept = req.headers.get("Accept")?.toLowerCase() ?? "";
  if (accept.includes("application/json")) {
    return Response.json(payload, { status });
  }

  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleSuccessRequest(
  req: Request,
  status: number,
  query: QueryRecord,
): Promise<Response> {
  const contentType = req.headers.get("Content-Type")?.toLowerCase() ?? null;
  const body = await parseRequestBody(req, req.method);
  const accept = req.headers.get("Accept")?.toLowerCase() ?? "";

  let message = "this is default response";
  if (accept.includes("application/json")) {
    message = "this is json response";
  } else if (accept.includes("text/plain")) {
    message = "this is text response";
  }

  return buildResponse(req, { contentType, serach: query, body, message }, status);
}

export async function handleErrorRequest(
  req: Request,
  status: number,
  query: QueryRecord,
  message: string,
): Promise<Response> {
  const contentType = req.headers.get("Content-Type")?.toLowerCase() ?? null;
  const body = await parseRequestBody(req, req.method);
  return buildResponse(req, { contentType, serach: query, body, message }, status);
}

export function handleTimeoutRequest(
  req: Request,
  query: QueryRecord,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const { promise, resolve } = Promise.withResolvers<Response>();
  const contentType = req.headers.get("Content-Type")?.toLowerCase() ?? null;
  const accept = req.headers.get("Accept")?.toLowerCase() ?? "";
  const rawTimeout = query.timeout;
  const timeout = rawTimeout
    ? Number(Array.isArray(rawTimeout) ? rawTimeout[0] : rawTimeout)
    : timeoutMs;

  setTimeout(() => {
    void (async () => {
      const body = await parseRequestBody(req, req.method);
      let message = `this is default response with timeout ${timeout}`;
      if (accept.includes("application/json")) {
        message = `this is json response with timeout ${timeout}`;
      } else if (accept.includes("text/plain")) {
        message = `this is text response with timeout ${timeout}`;
      }
      resolve(
        buildResponse(req, { contentType, serach: query, body, message }, 200),
      );
    })();
  }, timeout);

  return promise;
}
