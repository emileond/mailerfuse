import { createClient } from '@supabase/supabase-js';
import { validateEmail } from '../../src/utils/validateEmail';
import { verifyRecords } from '../../src/utils/verifyRecords';

export async function onRequestPost(context) {
    const { fileName, data, emailColumn, workspace_id, session } = await context.request.json();

    // basic 400 error handling
    if (!fileName || !workspace_id || !session || !data || !emailColumn) {
        return new Response(JSON.stringify({ error: 'Missing parameters' }), {
            status: 400,
        });
    }

    const supabase = createClient(context.env.SUPABASE_URL, context.env.SUPABASE_SERVICE_KEY);

    // auth check
    const { error: authError } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
    });

    if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), {
            status: 401,
        });
    }

    const creditsNeeded = data.length;

    // 1. check credits
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
    const notEnoughCredits = creditsNeeded > available_credits;

    if (notEnoughCredits) {
        return new Response(
            JSON.stringify({
                error: 'Not enough credits',
                error_code: 'INSUFFICIENT_CREDITS',
            }),
            { status: 403 },
        );
    } else {
        // 2. If enough credits, save list in db
        const { data: fileData, error: fileError } = await supabase
            .from('lists')
            .insert([
                {
                    name: fileName,
                    workspace_id: workspace_id,
                    status: 'pending',
                    size: data.length,
                },
            ])
            .select('id')
            .single();

        if (fileError) {
            console.log(fileError);
            return new Response(JSON.stringify({ error: fileError.message }), {
                status: 500,
            });
        }
        const listId = fileData.id;

        const res = new Response(JSON.stringify({ list_id: listId }), {
            status: 200,
        });

        context.waitUntil(
            (async () => {
                await supabase
                    .from('lists')
                    .update({
                        status: 'processing',
                    })
                    .eq('id', listId);

                const { error: deductError } = await supabase.rpc('deduct_credits', {
                    w_id: workspace_id,
                    increment_value: data.length,
                });

                if (deductError) {
                    console.error(deductError);
                }

                let deliverable = 0;
                let undeliverable = 0;
                let risky = 0;
                let unknown = 0;

                function chunkArray(array, size) {
                    const chunks = [];
                    for (let i = 0; i < array.length; i += size) {
                        chunks.push(array.slice(i, i + size));
                    }
                    return chunks;
                }

                const batchSize = 250;
                const chunks = chunkArray(data, batchSize);
                const cacheDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

                // Process each chunk
                for (const chunk of chunks) {
                    // Collect unique domains for batch query
                    const domainsToCheck = new Set();
                    chunk.forEach((item) => domainsToCheck.add(item[emailColumn].split('@')[1]));

                    // Fetch cached domains in one go
                    const { data: cachedDomains, error: cacheError } = await supabase
                        .from('domain_cache')
                        .select('*')
                        .in('domain', Array.from(domainsToCheck))
                        .gte('last_updated', cacheDate);

                    if (cacheError) {
                        console.error('Error fetching domain cache:', cacheError);
                        continue;
                    }

                    // Map for quick domain cache lookup
                    const domainCache = new Map();
                    cachedDomains.forEach((d) => domainCache.set(d.domain, d));

                    const validatedRecords = await Promise.all(
                        chunk.map(async (item) => {
                            const email = item[emailColumn];
                            const domain = email.split('@')[1];
                            const validationResult = await validateEmail(email);

                            if (validationResult.syntax_error || validationResult.disposable) {
                                undeliverable++;
                                return {
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
                                    list_id: listId,
                                    custom_fields: item,
                                    workspace_id: workspace_id,
                                };
                            }

                            let score = validationResult.score;

                            // Use cached domain info if available
                            const cachedData = domainCache.get(domain);

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

                                const status =
                                    score >= 75
                                        ? 'deliverable'
                                        : score >= 60
                                          ? 'risky'
                                          : 'undeliverable';

                                switch (status) {
                                    case 'deliverable':
                                        deliverable++;
                                        break;
                                    case 'risky':
                                        risky++;
                                        break;
                                    default:
                                        undeliverable++;
                                        break;
                                }

                                return {
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
                                    list_id: listId,
                                    custom_fields: item,
                                    workspace_id: workspace_id,
                                };
                            } else {
                                await new Promise((resolve) => setTimeout(resolve, 500));
                                const recordsResult = await verifyRecords(domain);
                                await supabase.from('domain_cache').insert({
                                    domain,
                                    domain_status: recordsResult.domain_status,
                                    mx_record: recordsResult.mx_record,
                                });

                                score += recordsResult.score;
                                const status =
                                    score >= 75
                                        ? 'deliverable'
                                        : score >= 60
                                          ? 'risky'
                                          : 'undeliverable';

                                switch (status) {
                                    case 'deliverable':
                                        deliverable++;
                                        break;
                                    case 'risky':
                                        risky++;
                                        break;
                                    default:
                                        undeliverable++;
                                        break;
                                }

                                return {
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
                                    list_id: listId,
                                    custom_fields: item,
                                    workspace_id: workspace_id,
                                };
                            }
                        }),
                    );

                    // Use the unique list of validated records for insertion
                    const { error: insertError } = await supabase
                        .from('list_records')
                        .insert(validatedRecords);

                    if (insertError) {
                        console.error('Error inserting records:', insertError);
                    }
                }

                const { error: listError } = await supabase
                    .from('lists')
                    .update({
                        status: 'completed',
                        summary: { deliverable, risky, undeliverable, unknown },
                    })
                    .eq('id', listId);

                if (listError) {
                    console.error('Error updating list:', listError);
                }
            })(),
        );

        return res;
    }
}
