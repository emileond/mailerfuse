import AppLayout from '../components/layout/AppLayout'
import PageLayout from '../components/layout/PageLayout'
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
} from '@nextui-org/react'
import useCurrentWorkspace from '../hooks/useCurrentWorkspace'
import {
  useWorkspaceMembers,
  useAddWorkspaceMember,
} from '../hooks/react-query/teams/useWorkspaceMembers'
import EmptyState from '../components/EmptyState'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import MemberCard from '../components/team/MemberCard'

function TeamPage() {
  const [currentWorkspace] = useCurrentWorkspace()
  const { data } = useWorkspaceMembers(currentWorkspace)
  const { mutateAsync: addWorkspaceMember, isPending } =
    useAddWorkspaceMember(currentWorkspace)
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    await addWorkspaceMember(
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
    onClose()
    reset()
  }

  return (
    <AppLayout>
      <PageLayout
        title="Team"
        maxW="2xl"
        primaryAction="Invite team member"
        description="Invite team members to your workspace"
        onClick={onOpen}
      >
        <div className="flex flex-col gap-3 mb-12">
          <span className="text-sm text-default-600">
            {data?.length} {data?.length === 1 ? 'member' : 'members'}
          </span>
          {data?.length ? (
            data.map((member) => (
              <MemberCard key={member.user_id} member={member} />
            ))
          ) : (
            <EmptyState
              title="No API keys found"
              description="Create an API key to get started"
              primaryAction="Create key"
              onClick={onOpen}
            />
          )}
        </div>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader className="flex flex-col gap-1">
                Invite team member
              </ModalHeader>
              <ModalBody>
                <p>Enter the email address and role.</p>
                <div className="flex gap-3">
                  <Input
                    {...register('email', { required: true })}
                    label="Email"
                    isInvalid={errors.email}
                    errorMessage="Email is required"
                    className="basis-2/3 grow"
                  />
                  <Select
                    {...register('role', { required: true })}
                    label="Role"
                    className="basis-1/3"
                    defaultSelectedKeys={['member']}
                  >
                    <SelectItem key="admin" value="admin">
                      Admin
                    </SelectItem>
                    <SelectItem key="member" value="member">
                      Member
                    </SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                  isDisabled={isPending}
                >
                  Cancel
                </Button>
                <Button color="primary" type="submit" isLoading={isPending}>
                  Send invite
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </PageLayout>
    </AppLayout>
  )
}

export default TeamPage
