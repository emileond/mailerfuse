export async function onRequestPost(context) {
    const body = await context.request.json();
    const { event } = body;

    return new Response(JSON.stringify({ event, success: true }), { status: 200 });
}
