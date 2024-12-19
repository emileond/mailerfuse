export async function onRequest(context) {
    const host = context.request.headers.get('Host');

    // Enforce host check for non-API routes
    if (host !== 'api.mailerfuse.com') {
        return new Response('Forbidden: Invalid Host', { status: 403 });
    }

    return await context.next();
}
