import { logger, schedules, task } from '@trigger.dev/sdk/v3';
import { createClient } from '@supabase/supabase-js';
import { verifyRecords } from '../utils/verifyRecords';

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_KEY as string,
);

export const emailVerificationTask = schedules.task({
    id: 'update-cache-dns',
    cron: '0 * * * *',
    run: async () => {
        const cacheDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

        // Fetch cached domains in one go
        const { data: cachedDomains, error: cacheError } = await supabase
            .from('domain_cache')
            .select('*')
            .lte('last_updated', cacheDate)
            .limit(500);

        // Process each chunk
        for (const cDomain of cachedDomains) {
            const recordsResult = await verifyRecords(cDomain.domain);
            await supabase
                .from('domain_cache')
                .update({
                    domain_status: recordsResult.domain_status,
                    mx_record: recordsResult.mx_record,
                    last_updated: new Date(Date.now()).toISOString(),
                })
                .eq('id', cDomain.id);
        }

        // Return a success message
        return { success: true };
    },
});
