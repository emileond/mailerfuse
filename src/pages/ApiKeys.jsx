import AppLayout from '../components/layout/AppLayout'
import PageLayout from '../components/layout/PageLayout'
import useCurrentWorkspace from '../hooks/useCurrentWorkspace'
import { useApiKeys } from '../hooks/react-query/api-keys/useApiKeys'
import ApiKeyCard from '../components/auth/ApiKeyCard'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Button,
} from '@nextui-org/react'
import { useForm } from 'react-hook-form'
import { useCreateApiKey } from '../hooks/react-query/api-keys/useApiKeys'
import toast from 'react-hot-toast'

function ApiKeysPage() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const [currentWorkspace] = useCurrentWorkspace()
  const { data } = useApiKeys(currentWorkspace)
  const { mutateAsync: createApiKey } = useCreateApiKey(currentWorkspace)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    onClose()
    reset()
    await createApiKey(
      { name: data.name, workspace_id: currentWorkspace.workspace_id },
      {
        onSuccess: () => {
          toast.success('API key created successfully')
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  }

  return (
    <AppLayout>
      <PageLayout
        title="API keys"
        maxW="2xl"
        primaryAction="Create key"
        description="API keys allow you to automate actions on Mailerfuse from external services."
        onClick={onOpen}
      >
        <div className="flex flex-col gap-3 mb-12">
          {data && data.map((key) => <ApiKeyCard key={key.id} apiKey={key} />)}
        </div>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader className="flex flex-col gap-1">
                Create API key
              </ModalHeader>
              <ModalBody>
                <p>Add a name to the API key to easily identify it</p>
                <Input
                  {...register('name', { required: true })}
                  label="API key name"
                  isInvalid={errors.name}
                  errorMessage="Name is required"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" type="submit">
                  Create key
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </PageLayout>
    </AppLayout>
  )
}

export default ApiKeysPage
