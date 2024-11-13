import { Button, Image } from '@nextui-org/react'

function Feature({ heading, description, ctaText, imageUrl, reverse = false }) {
  return (
    <div
      className={`w-full max-w-6xl mx-auto py-32 px-6 flex flex-col ${
        reverse ? 'md:flex-row' : 'md:flex-row-reverse'
      } items-center justify-between gap-8`}
    >
      {/* Image Section */}
      <div className="w-full md:w-1/2">
        <Image
          isBlurred
          src={imageUrl}
          alt={heading}
          className="w-full h-auto rounded-lg"
        />
      </div>

      {/* Content Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-4">{heading}</h2>
        <p className="text-lg text-gray-600 mb-6">{description}</p>
        <div>
          <Button color="primary" size="lg">
            {ctaText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Feature
