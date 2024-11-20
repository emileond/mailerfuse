export async function onRequestGet() {
  return Response.json({
    message: 'Hello visitor!',
  })
}
