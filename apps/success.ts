import { H3, defineHandler, getQuery, noContent } from "h3";
const app = new H3();

const notBodyMethods = ["get", "head", "options", "trace", "connect"]
const notResponseBodyMethods = ["head", "trace", "connect"]

export const hasNoBodyResponseStatus = [204, 205,206]
// index handle
const handlerIndex = defineHandler(async (event) => {
  const pathnameStatus = event.req.url.split('/').pop()
  const status = Number.isNaN(Number(pathnameStatus)) ? 200 : Number(pathnameStatus)

  const contentType = event.req.headers.get('Content-Type')?.toLowerCase()
  const accept = event.req.headers.get('Accept')?.toLowerCase()
  const query = getQuery(event)
  let body = null
  if (notBodyMethods.includes(event.req.method) || hasNoBodyResponseStatus.includes(event.req.status)) {
    body = null
  } else {
    if (contentType?.includes("application/json")) {
      try {
        body = await event.req.json()
      } catch (error) {
        console.error(error);
        body = null
      }
    } else if (contentType?.includes("application/x-www-form-urlencoded")) {
      try {
        body = await event.req.formData()
      } catch (error) {
        console.error(error);
        body = null
      }
    } else if (contentType?.includes("text/plain")) {
      try {
        body = await event.req.text()
      } catch (error) {
        console.error(error);
        body = null
      }
    }
  }

  if (notResponseBodyMethods.includes(event.req.method) || hasNoBodyResponseStatus.includes(status)) {
    return noContent(event, status)
  } else {
    if (accept?.includes("application/json")) {
      return Response.json({
        contentType,
        serach: query,
        body,
        message: "this is json response"
      }, { status })
    } else if (accept?.includes("text/plain")) {
      return new Response(JSON.stringify({
        contentType,
        serach: query,
        body,
        message: "this is text response"
      }), { status })
    } else {
      return new Response(JSON.stringify({
        contentType,
        serach: query,
        body,
        message: "this is default response"
      }), { status })
    }
  }

})

app.all("/200", handlerIndex);
app.all("/201", handlerIndex);
app.all("/202", handlerIndex);
app.all("/203", handlerIndex);
app.all("/204", handlerIndex);
app.all("/205", handlerIndex);
app.all("/206", handlerIndex);

app.all("/207", handlerIndex);
app.all("/208", handlerIndex);
app.all("/226", handlerIndex);



export default app;