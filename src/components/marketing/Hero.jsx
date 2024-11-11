import { Button } from '@nextui-org/button'

export default function Hero() {
  return (
    <div className="relative justify-center items-center py-32">
      <section className="max-w-screen-xl mx-auto px-4 gap-12 md:px-8 flex flex-col justify-center items-center">
        <span className="w-fit h-full text-sm bg-card px-2 py-1 border border-border rounded-full">
          NextUI template its here!
        </span>
        <h1 className="text-4xl font-bold tracking-tighter mx-auto md:text-6xl text-pretty text-center ">
          Use Nextjs and NextUI to build your website
        </h1>
        <p className="max-w-2xl text-lg mx-auto text-muted-foreground text-balance">
          Create your website with NextUI and Nextjs, the best UI Framework.
        </p>

        <Button color="primary" variant="shadow">
          See more
        </Button>
      </section>
    </div>
  )
}
