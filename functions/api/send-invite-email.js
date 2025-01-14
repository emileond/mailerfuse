import ky from 'ky';

export async function onRequestPost(context) {
    const apiKey = context.request.headers.get('x-api-key');

    // check if api key is valid
    if (!apiKey || apiKey !== context.env.WEBHOOK_API_KEY) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
        });
    }

    const body = await context.request.json();
    console.log(body);
    const { type, record } = body;

    // Basic 400 error handling
    if (!type || !record) {
        return new Response(JSON.stringify({ error: 'Missing parameters' }), {
            status: 400,
        });
    }
    const { invite_email: email, status, invited_by } = record;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return new Response(JSON.stringify({ error: 'Invalid email format' }), {
            status: 400,
        });
    }
    if (status !== 'pending') {
        return new Response(JSON.stringify({ error: 'Invite not pending' }), {
            status: 400,
        });
    }

    try {
        const addSubscriberUrl = 'https://listmonk.mailerfuse.com/api/subscribers';

        let subscriberData;

        try {
            const addSubscriberRes = await ky.post(addSubscriberUrl, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `token ${context.env.LISTMONK_USERNAME}:${context.env.LISTMONK_ACCESS_TOKEN}`,
                },
                json: {
                    email,
                    status: 'enabled',
                    lists: [1],
                },
            });

            subscriberData = await addSubscriberRes.json();
            console.log(subscriberData);
        } catch (error) {
            if (error.response && error.response.status === 409) {
                console.log('E-mail already exists, sending email invite.');
            } else {
                console.error('Error adding subscriber:', error);
                return new Response(JSON.stringify({ error: 'Error adding subscriber' }), {
                    status: 500,
                });
            }
        }

        const sendEmailUrl = 'https://listmonk.mailerfuse.com/api/tx';

        const response = await ky.post(sendEmailUrl, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `token ${context.env.LISTMONK_USERNAME}:${context.env.LISTMONK_ACCESS_TOKEN}`,
            },
            json: {
                subscriber_email: email,
                template_id: 4,
                data: {
                    inviter_name: invited_by,
                    workspace_name: 'CTSubly',
                    invitation_link: 'https://mailerfuse.com',
                },
                content_type: 'html',
            },
        });

        const data = await response.json();
        return new Response(JSON.stringify({ data }), { status: 200 });
    } catch (error) {
        if (error.response) {
            // Handle non-successful responses
            const errorText = await error.response.text();
            return new Response(errorText, { status: error.response.status });
        } else {
            // Handle network or other errors
            return new Response('Internal Server Error', { status: 500 });
        }
    }
}
