import { H3, defineHandler, redirect, } from "h3";
const app = new H3();
const handler = defineHandler((event) => {
  const pathname = event.req.url.split('/').pop()
  const responseStatus = Number(pathname)
  const status = Number.isNaN(responseStatus) ? 300 : responseStatus
  return redirect('/api/success/200', status)
})

app.all("/300", handler);
app.all("/301", handler);
app.all("/302", handler);
app.all("/303", handler);
app.all("/304", handler);
app.all("/307", handler);
app.all("/308", handler);

export default app;