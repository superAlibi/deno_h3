import { H3, defineHandler, getQuery } from "h3";
const app = new H3();


// index handle
const handlerIndex = defineHandler(async (event) => {
  const contentType = event.req.headers.get('Content-Type')?.toLowerCase()
  const accept = event.req.headers.get('Accept')?.toLowerCase()
  const query = getQuery(event)
  let body = null
  const { promise, resolve } = Promise.withResolvers()
  const timeout = query.timeout ? Number(query.timeout) : 60 * 1000
  if (contentType?.includes("application/json")) {
    // body = await event.req.json()
  } else if (contentType?.includes("application/x-www-form-urlencoded")) {
    body = await event.req.formData()
  } else if (contentType?.includes("text/plain")) {
    body = await event.req.text()
  }
  if (accept?.includes("application/json")) {
    setTimeout(() => resolve(Response.json({
      contentType,
      serach: query,
      body,
      message: `this is json response with timeout ${timeout}`
    })), timeout)
  } else if (accept?.includes("text/plain")) {
    setTimeout(() => resolve(new Response(JSON.stringify({
      contentType,
      serach: query,
      body,
      message: `this is text response with timeout ${timeout}`
    }))), timeout)
  } else {
    setTimeout(() => {
      resolve(new Response(JSON.stringify({
        contentType,
        serach: query,
        body,
        message: `this is default response with timeout ${timeout}`
      })))
    }, timeout)

  }
  return promise
})
// 200
app.all("/", handlerIndex);





export default app;