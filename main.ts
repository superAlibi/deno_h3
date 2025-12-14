import { H3, serve } from "h3";
import successResponse from "./apps/success.ts";
import redirectResponse from "./apps/redirect.ts";
import clientError from "./apps/client-error.ts";
import serverError from "./apps/server-error.ts";
import timeoutResponse from "./apps/timeout.ts";
const app = new H3();


app.mount("/success", successResponse);
app.mount("/redirect", redirectResponse);
app.mount("/client-error", clientError);
app.mount("/server-error", serverError);
app.mount("/timeout", timeoutResponse);
app.mount("*", successResponse);
serve(app, { port: 5020 });