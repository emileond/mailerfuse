import { configure, tasks } from '@trigger.dev/sdk/v3'

export async function onRequestPost(context) {
  configure({
    secretKey: context.env.TRIGGER_SECRET_KEY,
  })

  const handle = await tasks.trigger('hello-world', {
    email: 'emilio@subly.app',
  })

  return Response.json(handle)
}
