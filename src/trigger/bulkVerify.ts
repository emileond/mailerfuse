import { logger, task } from '@trigger.dev/sdk/v3'
import { createClient } from '@supabase/supabase-js'
import { validateEmail } from '../utils/validateEmail'
import { verifyRecords } from '../utils/verifyRecords'

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string
)

export const emailVerificationTask = task({
  id: 'bulk-email-verification',
  run: async (
    payload: {
      data: any
      emailColumn: string
      listId: string
      workspace_id: string
    },
    { ctx }
  ) => {
    const { data, emailColumn, listId, workspace_id } = payload

    const { error } = await supabase.rpc('deduct_credits', {
      w_id: workspace_id,
      increment_value: data.length,
    })

    if (error) {
      logger.error(`Error incrementing credits_used: ${error.message}`)
      throw new Error('Failed to increment credits_used')
    }

    let deliverable = 0
    let undeliverable = 0
    let risky = 0
    let unknown = 0

    // TypeScript version of chunkArray function
    function chunkArray<T>(array: T[], size: number): T[][] {
      const chunks: T[][] = []
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
      }
      return chunks
    }

    const batchSize = 250
    const chunks = chunkArray(data, batchSize)
    const cacheDate = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    ).toISOString()

    // Process each chunk
    for (const chunk of chunks) {
      // Collect unique domains for batch query
      const domainsToCheck = new Set()
      chunk.forEach((item: any) =>
        domainsToCheck.add(item[emailColumn].split('@')[1])
      )

      // Fetch cached domains in one go
      const { data: cachedDomains, error: cacheError } = await supabase
        .from('domain_cache')
        .select('*')
        .in('domain', Array.from(domainsToCheck))
        .gte('last_updated', cacheDate)

      if (cacheError) {
        logger.error(`Error fetching domain cache: ${cacheError.message}`)
        continue
      }

      // Map for quick domain cache lookup
      const domainCache = new Map()
      cachedDomains.forEach((d) => domainCache.set(d.domain, d))

      const validatedRecords = await Promise.all(
        chunk.map(async (item: any) => {
          const email = item[emailColumn as keyof typeof item] as string
          const domain = email.split('@')[1]
          const validationResult = await validateEmail(email)

          if (validationResult.syntax_error || validationResult.disposable) {
            undeliverable++
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
            }
          }

          let score = validationResult.score

          // Use cached domain info if available
          const cachedData = domainCache.get(domain)

          if (cachedData) {
            const { domain_status, mx_record } = cachedData

            if (domain_status === 'active') {
              score += 20
            } else {
              score -= 20
            }

            if (mx_record) {
              score += 30
            } else {
              score -= 30
            }

            const status =
              score >= 75
                ? 'deliverable'
                : score >= 60
                ? 'risky'
                : 'undeliverable'

            switch (status) {
              case 'deliverable':
                deliverable++
                break
              case 'risky':
                risky++
                break
              default:
                undeliverable++
                break
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
            }
          } else {
            await new Promise((resolve) => setTimeout(resolve, 500))
            const recordsResult = await verifyRecords(domain)
            await supabase.from('domain_cache').insert({
              domain,
              domain_status: recordsResult.domain_status,
              mx_record: recordsResult.mx_record,
            })

            score += recordsResult.score
            const status =
              score >= 75
                ? 'deliverable'
                : score >= 60
                ? 'risky'
                : 'undeliverable'

            switch (status) {
              case 'deliverable':
                deliverable++
                break
              case 'risky':
                risky++
                break
              default:
                undeliverable++
                break
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
            }
          }
        })
      )

      // Use the unique list of validated records for insertion
      const { error: insertError } = await supabase
        .from('list_records')
        .insert(validatedRecords)

      if (insertError) {
        logger.error(
          `Error inserting records into list_records: ${insertError.message}`
        )
        continue
      }
    }

    const { error: listError } = await supabase
      .from('lists')
      .update({
        status: 'completed',
        summary: { deliverable, risky, undeliverable, unknown },
      })
      .eq('id', listId)

    if (listError) {
      logger.error(
        `Error updating list with ID ${listId}, ${listError?.message}`
      )
      throw new Error(`Error updating list with ID ${listId}`)
    }

    // Return a success message
    return { success: true, deliverable, risky, undeliverable, unknown }
  },
})
