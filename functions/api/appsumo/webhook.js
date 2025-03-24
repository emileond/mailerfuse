import { createClient } from '@supabase/supabase-js';

export async function onRequestPost(context) {
    const supabase = createClient(context.env.SUPABASE_URL, context.env.SUPABASE_SERVICE_KEY);

    try {
        // Check if the request comes from appsumo.com
        const origin =
            context.request.headers.get('Origin') || context.request.headers.get('Referer');
        const forwardedFor = context.request.headers.get('X-Forwarded-For'); // May contain multiple IPs

        console.log(origin);
        console.log(forwardedFor);

        if (!origin?.includes('appsumo.com') && !forwardedFor?.endsWith('appsumo.com')) {
            return Response.json(
                { error: 'Unauthorized: Request not from AppSumo' },
                { status: 401 },
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
