import { createClient } from '@supabase/supabase-js';
import { validateEmail } from '../../src/utils/validateEmail';
import { verifyRecords } from '../../src/utils/verifyRecords.js';
import { cacheDate } from '../../src/utils/cacheDate.js';

export async function onRequestPost(context) {
    const { email, session, workspace_id } = await context.request.json();

    // basic 400 error handling
    if (!email || !session || !workspace_id) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
        });
    }

    const supabaseClient = createClient(context.env.SUPABASE_URL, context.env.SUPABASE_KEY);

    // auth check
    const { error: authError } = await supabaseClient.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
    });

    if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), {
            status: 401,
        });
    }

    const supabase = createClient(context.env.SUPABASE_URL, context.env.SUPABASE_SERVICE_KEY);

    // 1. check credits
    const CREDITS_REQUIRED = 1;

    const { data: credits, error: creditsError } = await supabase
        .from('workspace_credits')
        .select('available_credits')
        .eq('workspace_id', workspace_id)
        .single();

    if (creditsError) {
        return new Response(JSON.stringify({ error: creditsError.message }), {
            status: 500,
        });
    }

    const { available_credits } = credits;
    const notEnoughCredits = CREDITS_REQUIRED > available_credits;

    if (notEnoughCredits) {
        return new Response(
            JSON.stringify({
                error: 'Not enough credits',
                error_code: 'INSUFFICIENT_CREDITS',
            }),
            { status: 403 },
        );
    } else {
        const { error } = await supabase.rpc('deduct_credits', {
            w_id: workspace_id,
            increment_value: 1,
        });

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
            });
        }

        const validationResult = await validateEmail(email);
        if (validationResult.syntax_error || validationResult.disposable) {
            return Response.json({
                email,
                status: 'undeliverable',
                score: 0,
                syntax_error: validationResult.syntax_error,
                gibberish: null,
                role: null,
                did_you_mean: null,
                disposable: validationResult.disposable,
                domain_status: null,
                mx_record: null,
            });
        }

        let score = validationResult.score;

        const domain = email.split('@')[1];

        const { data: cachedData } = await supabase
            .from('domain_cache')
            .select('*')
            .eq('domain', domain)
            .gte('last_updated', cacheDate)
            .single();

        console.log(cacheDate);

        if (cachedData) {
            const { domain_status, mx_record } = cachedData;

            if (domain_status === 'active') {
                score += 20;
            } else {
                score -= 20;
            }

            if (mx_record) {
                score += 30;
            } else {
                score -= 30;
            }

            const status = score >= 75 ? 'deliverable' : score >= 60 ? 'risky' : 'undeliverable';

            return new Response(
                JSON.stringify({
                    email,
                    status,
                    score: Math.max(0, Math.min(100, score)),
                    syntax_error: validationResult.syntax_error,
                    gibberish: validationResult.gibberish,
                    role: validationResult.role,
                    did_you_mean: validationResult.did_you_mean,
                    disposable: validationResult.disposable,
                    domain_status,
                    mx_record,
                    workspace_id: workspace_id,
                }),
            );
        }

        const recordsResult = await verifyRecords(domain);
        await supabase.from('domain_cache').insert({
            domain,
            domain_status: recordsResult.domain_status,
            mx_record: recordsResult.mx_record,
        });

        score += recordsResult.score;
        const status = score >= 75 ? 'deliverable' : score >= 60 ? 'risky' : 'undeliverable';

        return new Response(
            JSON.stringify({
                email,
                status,
                score: Math.max(0, Math.min(100, score)),
                syntax_error: validationResult.syntax_error,
                gibberish: validationResult.gibberish,
                role: validationResult.role,
                did_you_mean: validationResult.did_you_mean,
                disposable: validationResult.disposable,
                domain_status: recordsResult.domain_status,
                mx_record: recordsResult.mx_record,
                workspace_id: workspace_id,
            }),
        );
    }
}
