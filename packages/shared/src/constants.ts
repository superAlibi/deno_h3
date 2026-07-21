export const SUCCESS_STATUSES = [
  200,
  201,
  202,
  203,
  204,
  205,
  206,
  207,
  208,
  226,
] as const;
export const REDIRECT_STATUSES = [300, 301, 302, 303, 304, 307, 308] as const;
export const CLIENT_ERROR_STATUSES = [
  400,
  401,
  402,
  403,
  404,
  405,
  406,
  407,
  408,
  409,
  410,
  411,
  412,
  413,
  414,
  415,
  416,
  417,
  418,
  421,
  422,
  423,
  424,
  425,
  426,
  428,
  429,
  431,
  451,
] as const;
export const SERVER_ERROR_STATUSES = [
  500,
  501,
  502,
  503,
  504,
  505,
  506,
  507,
  508,
  509,
  510,
  511,
] as const;

export const NO_BODY_METHODS = [
  "get",
  "head",
  "options",
  "trace",
  "connect",
] as const;
export const NO_RESPONSE_BODY_METHODS = ["head", "trace", "connect"] as const;
export const NO_BODY_RESPONSE_STATUSES = [204, 205, 206] as const;

export const DEFAULT_TIMEOUT_MS = 60_000;
