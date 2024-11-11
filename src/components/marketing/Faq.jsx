import { Accordion, AccordionItem } from '@nextui-org/accordion'

export default function Faq() {
  const accordionItems = [
    {
      title: 'This template is Free?',
      content: (
        <div className="text-muted-foreground">
          Yes, this template is free. You can use it for personal or commercial
          purposes.
        </div>
      ),
    },
    {
      title: 'There are more templates?',
      content: (
        <div className="text-muted-foreground">
          Yes, there are more templates available. You can find them here:{' '}
          <a
            href="https://x.com/gonzalochale"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            gonzalochale.dev
          </a>
        </div>
      ),
    },
    {
      title: 'How can I use this template?',
      content: (
        <div className="text-muted-foreground">
          You can use this template by cloning it from{' '}
          <a
            href="https://github.com/gonzalochale/nextui-saas-landing-template"
            className="text-primary underline"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          .
        </div>
      ),
    },
    {
      title: 'How can I contribute to this template?',
      content: (
        <div className="text-muted-foreground">
          You can contribute to this template by forking it on GitHub and
          submitting a pull request. You can also report any issues or bugs you
          encounter while using the template.
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-3xl py-32">
      <div className="flex flex-col gap-3 justify-center items-center">
        <h4 className="text-2xl font-bold sm:text-3xl">FAQ</h4>
        <p className="max-w-xl text-muted-foreground text-center mb-9">
          Here are some of our frequently asked questions.
        </p>
      </div>
      <div className="w-full">
        <Accordion fullWidth selectionMode="multiple" variant="light">
          {accordionItems.map((item, index) => (
            <AccordionItem
              key={index}
              aria-label={item.title}
              title={item.title}
              className="text-muted-foreground"
            >
              {item.content}
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
