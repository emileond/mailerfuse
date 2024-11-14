import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useUser } from '../hooks/react-query/user/useUser'
import {
  useCreateWorkspace,
  useWorkspaces,
} from '../hooks/react-query/teams/useWorkspaces'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import { Button, Input, Select, SelectItem } from '@nextui-org/react'
import { PiWarningBold } from 'react-icons/pi'

function OnboardingPage() {
  const { data: user } = useUser()
  const { data: workspaces } = useWorkspaces(user)
  const { mutateAsync: createWorkspace, isPending } = useCreateWorkspace(user)
  const navigate = useNavigate()
  const [isWorkspaceCreated, setIsWorkspaceCreated] = useState(false)

  // Initialize react-hook-form for both forms
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const {
    register: registerInvite,
    handleSubmit: handleInviteSubmit,
    formState: { errors: inviteErrors },
  } = useForm()

  // Function to handle workspace creation
  const handleCreateWorkspace = async (formData) => {
    const { workspaceName } = formData
    await createWorkspace({
      name: workspaceName,
      user_id: user.id,
    })
  }

  // Function to handle sending invites
  const handleSendInvites = (inviteData) => {
    const { teamEmails } = inviteData
    console.log('Sending invites to:', teamEmails)
    // Handle sending invites (e.g., API call)
  }

  // Function to skip inviting team members
  const handleSkip = () => {
    navigate('/dashboard')
  }

  useEffect(() => {
    if (workspaces && workspaces.length > 0) {
      workspaces.find((workspace) => {
        if (workspace.role === 'owner') {
          setIsWorkspaceCreated(true)
        }
        return
      })
    }
  }, [workspaces, user])

  return (
    <div className="w-screen h-screen bg-content1 flex justify-center items-center">
      <PageLayout
        maxW="xl"
        title={
          isWorkspaceCreated
            ? 'Invite your team'
            : "Let's set up your workspace"
        }
      >
        {!isWorkspaceCreated ? (
          <>
            <p className="my-3">
              Create a workspace to collaborate with your team
            </p>
            {errors.workspaceName && (
              <div className="flex items-center gap-2 bg-danger-50 p-3 rounded-xl border border-danger-100 font-bold text-default-900 text-sm">
                <PiWarningBold className="text-danger-300 text-2xl" />
                <p>{errors.workspaceName.message}</p>
              </div>
            )}
            <form
              onSubmit={handleSubmit(handleCreateWorkspace)}
              className="flex flex-col gap-6"
            >
              <Input
                label="Workspace Name"
                type="text"
                fullWidth
                placeholder="My workspace"
                aria-label="Workspace Name"
                {...register('workspaceName', {
                  required: 'Workspace Name is required',
                })}
              />
              <Button color="primary" type="submit" isLoading={isPending}>
                Create Workspace
              </Button>
            </form>
          </>
        ) : (
          <>
            <p className="mb-3">
              Add email addresses to send invitations, you can add more members
              later.
            </p>
            {inviteErrors.teamEmails && (
              <div className="flex items-center gap-2 bg-danger-50 p-3 rounded-xl border border-danger-100 font-bold text-default-900 text-sm">
                <PiWarningBold className="text-danger-300 text-2xl" />
                <p>{errors.teamEmails.message}</p>
              </div>
            )}
            <form
              onSubmit={handleInviteSubmit(handleSendInvites)}
              className="flex flex-col gap-3 py-12"
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="flex gap-3" key={index}>
                  <Input
                    label="Email"
                    type="text"
                    fullWidth
                    {...registerInvite('teamEmails', {
                      required: 'Please enter at least one email or skip',
                    })}
                    className="basis-4/3"
                  />
                  <Select
                    variant="bordered"
                    label="Role"
                    placeholder="Select a role"
                    className="basis-1/3"
                    defaultSelectedKeys={['Member']}
                  >
                    <SelectItem key="Admin">Admin</SelectItem>
                    <SelectItem key="Member">Member</SelectItem>
                  </Select>
                </div>
              ))}
              <div className="flex justify-end gap-3 mt-9">
                <Button variant="light" color="primary" onClick={handleSkip}>
                  Skip for now
                </Button>
                <Button color="primary" type="submit">
                  Send Invites
                </Button>
              </div>
            </form>
          </>
        )}
      </PageLayout>
    </div>
  )
}

export default OnboardingPage
