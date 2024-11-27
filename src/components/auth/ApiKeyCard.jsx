import { Button, Card, CardBody, Code, Tooltip } from '@nextui-org/react'
import { useState } from 'react'
import {
  RiFileCopyLine,
  RiEyeLine,
  RiEyeOffLine,
  RiDeleteBin6Line,
} from 'react-icons/ri'
import toast from 'react-hot-toast'

function ApiKeyCard({ apiKey }) {
  const [revealedKey, setRevealedKey] = useState(false)

  const toggleRevealKey = () => {
    setRevealedKey(!revealedKey)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.key)
      toast.success('Copied to clipboard')
    } catch (err) {
      console.error('Failed to copy key:', err)
    }
  }

  return (
    <Card key={apiKey.id} shadow="sm">
      <CardBody className="flex flex-col gap-3 font-medium">
        {apiKey.name}
        <div className="w-full flex gap-3 items-center">
          <Code size="lg" className="grow">
            {revealedKey ? apiKey.key : '•'.repeat(apiKey.key.length)}
          </Code>
          <Tooltip content="Copy">
            <Button
              variant="light"
              size="md"
              isIconOnly
              onClick={copyToClipboard}
            >
              <RiFileCopyLine className="text-lg" />
            </Button>
          </Tooltip>
          <Tooltip content={revealedKey ? 'Hide key' : 'Reveal key'}>
            <Button
              variant="light"
              size="md"
              isIconOnly
              onClick={toggleRevealKey}
            >
              {revealedKey ? (
                <RiEyeOffLine className="text-lg" />
              ) : (
                <RiEyeLine className="text-lg" />
              )}
            </Button>
          </Tooltip>
          <Tooltip content="Delete">
            <Button
              color="danger"
              variant="light"
              size="md"
              isIconOnly
              onClick={toggleRevealKey}
            >
              <RiDeleteBin6Line className="text-lg" />
            </Button>
          </Tooltip>
        </div>
      </CardBody>
    </Card>
  )
}

export default ApiKeyCard
