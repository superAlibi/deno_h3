import { H3, defineHandler, getQuery, } from "h3";
const app = new H3();
const handler = defineHandler(async (event) => {
  const contentType = event.req.headers.get('Content-Type')?.toLowerCase()
  const accept = event.req.headers.get('Accept')?.toLowerCase()
  const pathname = event.req.url.split('/').pop()
  const query = getQuery(event)
  const responseStatus = Number(pathname)
  const status = Number.isNaN(responseStatus) ? 400 : responseStatus
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
      message: `Bad Request ${pathname}`
    }, { status })
  } else if (accept?.includes("text/plain")) {
    return new Response(JSON.stringify({
      contentType,
      serach: query,
      body,
      message: `Bad Request ${pathname}`
    }), { status })
  } else {
    return Response.json({
      contentType,
      serach: query,
      body,
      message: `Bad Request ${pathname}`
    }, { status })
  }
})


app.all("/400", handler);
app.all("/401", handler);
app.all("/402", handler);
app.all("/403", handler);
app.all("/404", handler);
app.all("/405", handler);
app.all("/406", handler);
app.all("/407", handler);
app.all("/408", handler);
app.all("/409", handler);
app.all("/410", handler);
app.all("/411", handler);
app.all("/412", handler);
app.all("/413", handler);
app.all("/414", handler);
app.all("/415", handler);
app.all("/416", handler);
app.all("/417", handler);
app.all("/418", handler);
app.all("/421", handler);
app.all("/422", handler);
app.all("/423", handler);
app.all("/424", handler);
app.all("/425", handler);
app.all("/426", handler);
app.all("/428", handler);
app.all("/429", handler);
app.all("/431", handler);
app.all("/451", handler);

export default app;