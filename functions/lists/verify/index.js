export async function onRequestGet() {
  return new Response(JSON.stringify({ message: 'Hello, Bulk!' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
}
