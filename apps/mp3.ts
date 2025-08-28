import { H3, defineHandler, getRouterParam } from "h3";
const app = new H3();

app.get("/:filePath", defineHandler(async (event) => {
  const filepath = getRouterParam(event, "filePath") as string

  const path = [import.meta.dirname, filepath?.replace(/^\//, '')].join('/')
  try {
    const file = await Deno.open(path, { read: true })
    return new Response(file.readable, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error(error)
    return  Response.json({
      message: 'only mp3 file a.mp3 and b.mp3 is supported',
    }, {
      status: 404,
    })
  }
}))


export default app