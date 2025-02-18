import { createClient } from '@supabase/supabase-js';
import { processEmailValidation } from '../../src/utils/processEmail.js';

export async function onRequestPost(context) {
    const { email } = await context.request.json();

    // basic 400 error handling
    if (!email) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
        });
    }

    const supabase = createClient(context.env.SUPABASE_URL, context.env.SUPABASE_SERVICE_KEY);

    // Process Email Validation (with Supabase)
    const result = await processEmailValidation(email, supabase);

    return new Response(JSON.stringify(result));
}
