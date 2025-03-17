import ky from 'ky';

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const { code } = body;
        if (!code) {
            return new Response(JSON.stringify({ error: 'Missing authorization code' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Step 1: Exchange code for access token
        const tokenResponse = await ky
            .post('https://appsumo.com/openid/token/', {
                json: {
                    client_id: context.env.APPSUMO_CLIENT_ID,
                    client_secret: context.env.APPSUMO_CLIENT_SECRET,
                    code,
                    redirect_uri: context.env.APPSUMO_REDIRECT_URL,
                    grant_type: 'authorization_code',
                },
                headers: { 'Content-Type': 'application/json' },
                throwHttpErrors: false,
            })
            .json();

        console.log('Token Response:', tokenResponse);

        if (tokenResponse.error) {
            return new Response(JSON.stringify(tokenResponse), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Step 2: Retrieve license data
        const licenseResponse = await ky
            .get(
                `https://appsumo.com/openid/license_key/?access_token=${tokenResponse.access_token}`,
                { throwHttpErrors: false },
            )
            .json();

        console.log('License Response:', licenseResponse);

        return new Response(JSON.stringify(licenseResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Server Error:', error);
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                details: error.message || JSON.stringify(error),
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }
}
