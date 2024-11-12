import { Button } from '@nextui-org/button'

export default function Hero() {
  return (
    <div className="relative justify-center items-center py-32">
      <section className="max-w-screen-xl mx-auto px-4 gap-12 md:px-8 flex flex-col justify-center items-center text-center">
        <span className="w-fit h-full text-sm bg-card px-2 py-1 border border-border rounded-full">
          250 credits per month for free
        </span>
        <h1 className="text-4xl font-bold tracking-tighter mx-auto md:text-6xl text-pretty">
          Verify Emails and Reach Every Inbox
        </h1>
        <p className="max-w-2xl text-lg mx-auto text-default-600 text-balance">
          Ensure your emails connect with real people. Our powerful verification
          tool boosts deliverability and protects your sender reputation.
        </p>
        <Button color="primary" variant="shadow">
          Verify my list
        </Button>
      </section>
    </div>
  )
}
