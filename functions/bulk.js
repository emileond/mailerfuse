export async function onRequestGet(context) {
  // Get the Host header from the incoming request
  const host = context.request.headers.get('Host')

  // Only allow requests from api.mailerfuse.com
  if (host !== 'api.mailerfuse.com') {
    return new Response('Forbidden: Invalid Host', { status: 403 })
  }

  return new Response(JSON.stringify({ message: 'Hello, Bulk!' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
}
