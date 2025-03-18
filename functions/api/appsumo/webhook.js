import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export async function onRequestPost(context) {
    const supabase = createClient(context.env.SUPABASE_URL, context.env.SUPABASE_SERVICE_KEY);

    try {
        const receivedSignature = context.request.headers.get('X-Appsumo-Signature'); // Get the signature from the headers
        const receivedTimestamp = context.request.headers.get('X-Appsumo-Timestamp'); // Get the timestamp from the headers

        if (!receivedSignature || !receivedTimestamp) {
            return Response.json(
                { error: 'Unauthorized: Missing signature or timestamp' },
                {
                    status: 401,
                },
            );
        }

        // Get the request body
        const rawBody = await context.request.text();

        // Rebuild the message to compare with the signature
        const message = `${receivedTimestamp}${rawBody}`;

        // Your API key (which you should keep safe and in your environment variables)
        const apiKey = context.env.APPSUMO_PRIVATE_KEY;

        // Generate the expected signature using HMAC SHA256
        const expectedSignature = crypto.createHmac('SHA256', apiKey).update(message).digest('hex');

        // Verify if the received signature matches the expected signature
        if (receivedSignature !== expectedSignature) {
            return Response.json(
                { error: 'Unauthorized: Invalid signature' },
                {
                    status: 401,
                },
            );
        }

        const body = await context.request.json();
        const { license_key, prev_license_key, event, license_status, tier, test, extra } = body;

        // Validate input
        if (!license_key || !event) {
            return Response.json(
                { error: 'Missing required fields' },
                {
                    status: 400,
                },
            );
        }

        const eventTimestamp = new Date().toISOString();

        // Define event handlers in an object
        const eventHandlers = {
            purchase: () =>
                supabase.from('appsumo_licenses').insert([
                    {
                        license_status,
                        license_key,
                        event,
                        event_timestamp: eventTimestamp,
                        extra,
                    },
                ]),
            activate: () =>
                supabase
                    .from('appsumo_licenses')
                    .update({
                        license_status: 'active',
                        event,
                        event_timestamp: eventTimestamp,
                        extra,
                    })
                    .eq('license_key', license_key)
                    .select(),
            deactivate: () =>
                supabase
                    .from('appsumo_licenses')
                    .update({
                        license_status: 'deactivated',
                        event,
                        event_timestamp: eventTimestamp,
                        extra,
                    })
                    .eq('license_key', license_key)
                    .select(),
            upgrade: () =>
                supabase
                    .from('appsumo_licenses')
                    .update({
                        tier,
                        prev_license_key,
                        event,
                        event_timestamp: eventTimestamp,
                        extra,
                    })
                    .eq('license_key', license_key)
                    .select(),
            downgrade: () =>
                supabase
                    .from('appsumo_licenses')
                    .update({
                        tier,
                        prev_license_key,
                        event,
                        event_timestamp: eventTimestamp,
                    })
                    .eq('license_key', license_key)
                    .select(),
        };

        // Check if the event exists
        if (!eventHandlers[event]) {
            return Response.json({ error: 'Invalid event type' }, { status: 400 });
        }

        // Execute the corresponding database operation

        const { error } = await eventHandlers[event]();

        // Handle Supabase errors
        if (error) {
            console.log(error);
            return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json({ event, success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
