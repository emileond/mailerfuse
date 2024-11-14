import { createClient } from '@supabase/supabase-js'

export async function onRequestPost(context) {
  const supabase = createClient(
    context.env.SUPABASE_URL,
    context.env.SUPABASE_KEY
  )
  const { fileName, data, emailColumn, workspace_id, session } =
    await context.request.json()

  if (!fileName || !workspace_id || !session || !data || !emailColumn) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), {
      status: 400,
    })
  }

  const { error: authError } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })

  if (authError) {
    return new Response(JSON.stringify({ error: authError.message }), {
      status: 401,
    })
  }

  // Create a new file in the "files" table
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
    .single()

  if (fileError) {
    console.log(fileError)
    return new Response(JSON.stringify({ error: fileError.message }), {
      status: 500,
    })
  }

  const { data: credits, error: creditsError } = await supabase
    .from('workspace_credits')
    .select('total_credits, used_credits')
    .eq('workspace_id', workspace_id)
    .single()

  if (creditsError) {
    return new Response(JSON.stringify({ error: creditsError.message }), {
      status: 500,
    })
  }

  const { total_credits, used_credits } = credits

  let response

  if (used_credits + data.length > total_credits) {
    response = new Response(
      JSON.stringify({
        error: 'Not enough credits',
        error_code: 'INSUFFICIENT_CREDITS',
      }),
      { status: 403 }
    )
  } else {
    response = new Response(JSON.stringify({ success: true }), {
      status: 200,
    })
  }

  const listId = fileData.id

  async function saveRecords() {
    // Function to chunk the array into smaller arrays
    const chunkArray = (array, size) => {
      const chunks = []
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
      }
      return chunks
    }

    // Define the batch size
    const batchSize = 500
    const chunks = chunkArray(data, batchSize)

    // Process each chunk
    for (const chunk of chunks) {
      const records = chunk.map((item) => ({
        list_id: listId,
        email: item[emailColumn],
        custom_fields: item, // jsonb, custom fields without email column
        workspace_id: workspace_id,
      }))

      const { error: insertError } = await supabase
        .from('list_records')
        .insert(records)

      if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500,
        })
      }
    }
  }

  // Function to chunk the data
  context.waitUntil(saveRecords())

  return response
}
