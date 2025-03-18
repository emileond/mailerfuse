import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export async function onRequestPost(context) {
    const supabase = createClient(context.env.SUPABASE_URL, context.env.SUPABASE_SERVICE_KEY);

    try {
        const body = await context.request.json();
        const {
            license_key,
            prev_license_key,
            event,
            event_timestamp,
            license_status,
            tier,
            test,
            extra,
        } = body;

        // Validate input
        if (!license_key || !event) {
            return Response.json(
                { error: 'Missing required fields' },
                {
                    status: 400,
                },
            );
        }

        // Define event handlers in an object
        const eventHandlers = {
            purchase: () =>
                supabase.from('appsumo_licenses').insert([
                    {
                        license_status,
                        license_key,
                        event,
                        event_timestamp,
                        extra,
                    },
                ]),
            activate: () =>
                supabase
                    .from('appsumo_licenses')
                    .update({
                        license_status: 'active',
                        event,
                        event_timestamp,
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
                        event_timestamp,
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
                        event_timestamp,
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
                        event_timestamp,
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
            return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json({ event, success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
