import { getRequestHost, H3, serve } from "h3";
import successResponse from "./apps/success.ts";
import redirectResponse from "./apps/redirect.ts";
import clientError from "./apps/client-error.ts";
import serverError from "./apps/server-error.ts";
import timeoutResponse from "./apps/timeout.ts";
const app = new H3();

app.all("/", (event) => {
    return Response.json([
        getRequestHost(event) + "/success/200",
        getRequestHost(event) + "/redirect/300",
        getRequestHost(event) + "/client-error/400",
        getRequestHost(event) + "/server-error/500",
        getRequestHost(event) + "/timeout?timeout=60000",
    ]);
});

app.mount("/success", successResponse);
app.mount("/redirect", redirectResponse);
app.mount("/client-error", clientError);
app.mount("/server-error", serverError);
app.mount("/timeout", timeoutResponse);
app.mount("*", successResponse);
serve(app, { port: 5020 });