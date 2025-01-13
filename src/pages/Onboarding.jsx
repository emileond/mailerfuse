import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUser } from '../hooks/react-query/user/useUser';
import { useCreateWorkspace, useWorkspaces } from '../hooks/react-query/teams/useWorkspaces';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { Button, Input, Select, SelectItem } from '@nextui-org/react';
import { PiWarningBold } from 'react-icons/pi';
import { validateEmail } from '../utils/validateEmail.js';
import useCurrentWorkspace from '../hooks/useCurrentWorkspace';
import { useAddWorkspaceMember } from '../hooks/react-query/teams/useWorkspaceMembers';
import toast from 'react-hot-toast';

function OnboardingPage() {
    const { data: user } = useUser();
    const { data: workspaces } = useWorkspaces(user);
    const { mutateAsync: createWorkspace, isPending } = useCreateWorkspace(user);
    const navigate = useNavigate();
    const [isWorkspaceCreated, setIsWorkspaceCreated] = useState(false);
    const [currentWorkspace, setCurrentWorkspace] = useCurrentWorkspace();
    const { mutateAsync: addWorkspaceMember, isPending: isAddPending } =
        useAddWorkspaceMember(currentWorkspace);

    // Initialize react-hook-form for both forms
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const {
        register: registerInvite,
        handleSubmit: handleInviteSubmit,
        formState: { errors: inviteErrors },
    } = useForm();

    // Function to handle workspace creation
    const handleCreateWorkspace = async (formData) => {
        const { workspaceName } = formData;
        await createWorkspace({
            name: workspaceName,
            user_id: user.id,
        });
    };

    // Function to handle sending invites
    const handleSendInvites = async (inviteData) => {
        const invites = Object.values(inviteData);

        for (const invite of invites.filter((inv) => inv.email && inv.role)) {
            const result = await validateEmail(invite.email);
            if (!result.syntax_error) {
                await addWorkspaceMember(
                    {
                        invite_email: invite.email,
                        role: invite.role,
                        workspace_id: currentWorkspace.workspace_id,
                        invited_by: user.email,
                    },
                    {
                        onSuccess: () => {
                            toast.success('Team member invited');
                            navigate('/dashboard');
                        },
                        onError: (error) => {
                            toast.error(error?.message);
                        },
                    },
                );
            }
        }
        // const { teamEmails } = inviteData;
        // Handle sending invites (e.g., API call)
    };

    // Function to skip inviting team members
    const handleSkip = () => {
        navigate('/dashboard');
    };

    useEffect(() => {
        if (workspaces && workspaces.length > 0) {
            workspaces.find((workspace) => {
                if (workspace.role === 'owner') {
                    setIsWorkspaceCreated(true);
                    setCurrentWorkspace(workspace);
                }
            });
        }
    }, [workspaces, user]);

    return (
        <div className="w-screen h-screen bg-content1 flex justify-center items-center">
            <PageLayout
                maxW="xl"
                title={isWorkspaceCreated ? 'Invite your team' : "Let's set up your workspace"}
            >
                {!isWorkspaceCreated ? (
                    <>
                        <p className="my-3">Create a workspace to collaborate with your team</p>
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
                            Add email addresses to send invitations, you can add more members later.
                        </p>
                        <form
                            onSubmit={handleInviteSubmit(handleSendInvites)}
                            className="flex flex-col gap-3 py-12"
                        >
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div className="flex gap-3" key={index}>
                                    <Input
                                        label="Email"
                                        type="email"
                                        fullWidth
                                        {...registerInvite(`${index}.email`, {})}
                                        className="basis-4/3"
                                    />
                                    <Select
                                        variant="bordered"
                                        label="Role"
                                        placeholder="Select a role"
                                        className="basis-1/3"
                                        defaultSelectedKeys={['member']}
                                        {...registerInvite(`${index}.role`, {})}
                                    >
                                        <SelectItem key="admin">Admin</SelectItem>
                                        <SelectItem key="member">Member</SelectItem>
                                    </Select>
                                </div>
                            ))}
                            <div className="flex justify-end gap-3 mt-9">
                                <Button variant="light" color="primary" onClick={handleSkip}>
                                    Skip for now
                                </Button>
                                <Button color="primary" type="submit" isLoading={isAddPending}>
                                    Send Invites
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </PageLayout>
        </div>
    );
}

export default OnboardingPage;
