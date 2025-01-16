import AppLayout from '../components/layout/AppLayout';
import PageLayout from '../components/layout/PageLayout';
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
} from '@nextui-org/react';
import useCurrentWorkspace from '../hooks/useCurrentWorkspace';
import {
    useWorkspaceMembers,
    useAddWorkspaceMember,
    useUpdateWorkspaceMember,
} from '../hooks/react-query/teams/useWorkspaceMembers';
import EmptyState from '../components/EmptyState';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import MemberCard from '../components/team/MemberCard';
import { useUser } from '../hooks/react-query/user/useUser.js';
import { useState } from 'react';
import log from 'eslint-plugin-react/lib/util/log.js';

function TeamPage() {
    const { data: user } = useUser();
    const [currentWorkspace] = useCurrentWorkspace();
    const { data: workspaceMembers } = useWorkspaceMembers(currentWorkspace);
    const { mutateAsync: addWorkspaceMember, isPending } = useAddWorkspaceMember(currentWorkspace);
    const { mutateAsync: updateWorkspaceMember, isPending: isUpdating } =
        useUpdateWorkspaceMember(currentWorkspace);
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [editMember, setEditMember] = useState();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        if (editMember) {
            await updateWorkspaceMember(
                {
                    id: editMember.id,
                    role: data.role,
                    workspace_id: editMember.workspace_id,
                },
                {
                    onSuccess: () => {
                        toast.success('Team member updated');
                    },
                    onError: (error) => {
                        toast.error(error.message);
                    },
                },
            );
        } else {
            // Check if email is already invited
            const isDuplicate = workspaceMembers?.some(
                (member) => member.invite_email === data.email || member.email === data.email,
            );
            if (isDuplicate) {
                toast.error('This user is already invited');
            } else {
                await addWorkspaceMember(
                    {
                        invite_email: data.email,
                        role: data.role,
                        workspace_id: currentWorkspace.workspace_id,
                        invited_by: user.email,
                    },
                    {
                        onSuccess: () => {
                            toast.success('Team member invited');
                        },
                        onError: (error) => {
                            toast.error(error.message);
                        },
                    },
                );
            }
        }
        setEditMember(null);
        onClose();
        reset();
    };

    const handleAddMember = () => {
        reset();
        setEditMember(null);
        onOpen();
    };

    const handleEditMember = (member) => {
        setValue('email', member.email);
        setEditMember(member);
        onOpen();
    };

    return (
        <AppLayout>
            <PageLayout
                title="Team"
                maxW="2xl"
                primaryAction="Invite team member"
                description="Invite team members to your workspace"
                onClick={handleAddMember}
            >
                <div className="flex flex-col gap-3 mb-12">
                    <span className="text-sm text-default-600">
                        {workspaceMembers?.length}{' '}
                        {workspaceMembers?.length === 1 ? 'member' : 'members'}
                    </span>
                    {workspaceMembers?.length ? (
                        workspaceMembers.map((member) => (
                            <MemberCard
                                key={member.user_id}
                                member={member}
                                onEditMember={(m) => handleEditMember(m)}
                            />
                        ))
                    ) : (
                        <EmptyState
                            title="No team members found"
                            description="Invite team members to get started"
                            primaryAction="Invite member"
                            onClick={onOpen}
                        />
                    )}
                </div>
                <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                    <ModalContent>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <ModalHeader>
                                {editMember ? 'Edit team member' : 'Invite team member'}
                            </ModalHeader>
                            <ModalBody>
                                <p>
                                    {editMember
                                        ? 'Update user role'
                                        : 'Invite a new member to your workspace'}
                                </p>
                                <div className="flex gap-3">
                                    <Input
                                        {...register('email', { required: true })}
                                        label="Email"
                                        type="email"
                                        isInvalid={errors.email}
                                        isDisabled={editMember}
                                        errorMessage="Email is required"
                                        className="basis-2/3 grow"
                                    />
                                    <Select
                                        {...register('role', { required: true })}
                                        label="Role"
                                        className="basis-1/3"
                                        defaultSelectedKeys={
                                            editMember ? [editMember.role] : ['member']
                                        }
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
                                <Button variant="light" onPress={onClose} isDisabled={isPending}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit" isLoading={isPending}>
                                    {editMember ? 'Update' : 'Invite'}
                                </Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>
            </PageLayout>
        </AppLayout>
    );
}

export default TeamPage;
