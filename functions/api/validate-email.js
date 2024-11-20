import { createClient } from '@supabase/supabase-js'
import { validateEmail } from '../../src/utils/validateEmail'

export async function onRequestPost(context) {
  const { email, session, workspace_id } = await context.request.json()

  // basic 400 error handling
  if ((!email, !session, !workspace_id)) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
    })
  }

  const supabaseClient = createClient(
    context.env.SUPABASE_URL,
    context.env.SUPABASE_KEY
  )

  // auth check
  const { error: authError } = await supabaseClient.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })

  if (authError) {
    return new Response(JSON.stringify({ error: authError.message }), {
      status: 401,
    })
  }

  const supabase = createClient(
    context.env.SUPABASE_URL,
    context.env.SUPABASE_SERVICE_KEY
  )

  // 1. check credits
  const CREDITS_REQUIRED = 1

  const { data: credits, error: creditsError } = await supabase
    .from('workspace_credits')
    .select('available_credits')
    .eq('workspace_id', workspace_id)
    .single()

  if (creditsError) {
    return new Response(JSON.stringify({ error: creditsError.message }), {
      status: 500,
    })
  }

  const { available_credits } = credits
  const notEnoughCredits = CREDITS_REQUIRED > available_credits

  if (notEnoughCredits) {
    return new Response(
      JSON.stringify({
        error: 'Not enough credits',
        error_code: 'INSUFFICIENT_CREDITS',
      }),
      { status: 403 }
    )
  } else {
    const { error } = await supabase.rpc('deduct_credits', {
      w_id: workspace_id,
      increment_value: 1,
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      })
    }

    const validationResult = await validateEmail(email)
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
      })
    }

    let score = validationResult.score

    const domain = email.split('@')[1]
    // 6. Check domain status, score: 20
    async function checkDomainStatus(domain) {
      try {
        // Fetch A records for the domain
        const aRecordsResponse = await fetch(
          `https://dns.google/resolve?name=${domain}&type=A`
        )
        const aRecordsData = await aRecordsResponse.json()
        const aRecords = aRecordsData.Answer
          ? aRecordsData.Answer.map((record) => record.data)
          : []

        // Fetch NS records for the domain
        const nsRecordsResponse = await fetch(
          `https://dns.google/resolve?name=${domain}&type=NS`
        )
        const nsRecordsData = await nsRecordsResponse.json()
        const nsRecords = nsRecordsData.Answer
          ? nsRecordsData.Answer.map((record) => record.data)
          : []

        // Check if the domain is inactive
        if (nsRecords.length === 0) return 'inactive'

        // Determine if the domain is parked or active
        return isParked(nsRecords, aRecords) ? 'parked' : 'active'
      } catch (error) {
        console.error('Error checking domain status:', error)
        return 'unknown'
      }
    }

    function isParked(nsRecords, aRecords) {
      const knownParkingNameservers = [
        'parked.com',
        'sedoparking.com',
        'bodis.com',
        'parkingcrew.net',
        'parklogic.com',
        'namejet.com',
      ]
      return (
        nsRecords.some((ns) =>
          knownParkingNameservers.some((parking) => ns.includes(parking))
        ) ||
        (aRecords &&
          aRecords.length === 1 &&
          ['0.0.0.0', '127.0.0.1', '192.168.0.1'].includes(aRecords[0]))
      )
    }

    const domain_status = await checkDomainStatus(domain)
    if (domain_status === 'active') {
      score += 20
    } else if (domain_status === 'parked' || domain_status === 'inactive') {
      score -= 20
    }

    async function resolveMXRecords() {
      try {
        // Attempt to resolve MX records using the DNS promises API
        const response = await fetch(
          `https://dns.google/resolve?name=${domain}&type=MX`
        )
        const data = await response.json()

        if (data.Status === 0 && data.Answer) {
          const mxRecords = data.Answer.filter(
            (answer) => answer.type === 15 // Type 15 indicates MX records
          ).sort((a, b) => {
            // Extract priority from the data field
            const priorityA = parseInt(a.data.split(' ')[0], 10)
            const priorityB = parseInt(b.data.split(' ')[0], 10)
            return priorityA - priorityB
          })

          return mxRecords.length > 0
            ? mxRecords[0].data.split(' ')[1] // Return the mail server address
            : null
        }
      } catch (error) {
        console.error('Error resolving MX records with DNS promises:', error)
        return null
      }
    }

    const mx_record = await resolveMXRecords()
    if (mx_record) {
      score += 30
    } else {
      score -= 30
    }

    const status =
      score >= 75 ? 'deliverable' : score >= 60 ? 'risky' : 'undeliverable'

    return Response.json({
      email,
      score: Math.max(0, Math.min(100, score)),
      status: status,
      syntax_error: validationResult.syntax_error,
      gibberish: validationResult.gibberish,
      role: validationResult.role,
      did_you_mean: validationResult.did_you_mean,
      disposable: validationResult.disposable,
      domain_status,
      mx_record,
    })
  }
}
