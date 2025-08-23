import { H3, defineHandler, getQuery } from "h3";
const app = new H3();
const handler = defineHandler(async (event) => {
  const contentType = event.req.headers.get('Content-Type')?.toLowerCase()
  const accept = event.req.headers.get('Accept')?.toLowerCase()
  const pathname = event.req.url.split('/').pop()
  const query = getQuery(event)
  const responseStatus = Number(pathname)
  const status = Number.isNaN(responseStatus) ? 500 : responseStatus
  let body = null
  if (contentType?.includes("application/json")) {
    // body = await event.req.json()
  } else if (contentType?.includes("application/x-www-form-urlencoded")) {
    body = await event.req.formData()
  } else if (contentType?.includes("text/plain")) {
    body = await event.req.text()
  }
  if (accept?.includes("application/json")) {
    return Response.json({
      contentType,
      serach: query,
      body,
      message: `Server Error with status ${status}`
    },{status})
  } else if (accept?.includes("text/plain")) {
    return new Response(JSON.stringify({
      contentType,
      serach: query,
      body,
      message: `Server Error with status ${status}`
    }),{status})
  } else {
    return new Response(JSON.stringify({
      contentType,
      serach: query,
      body,
      message: `Server Error with status ${status}`
    }),{status})
  }
})


app.all("/", handler);
app.all("/500", handler);
app.all("/501", handler);
app.all("/502", handler);
app.all("/503", handler);
app.all("/504", handler);
app.all("/505", handler);
app.all("/506", handler);
app.all("/507", handler);
app.all("/508", handler);
app.all("/509", handler);
app.all("/510", handler);
app.all("/511", handler);

export default app;