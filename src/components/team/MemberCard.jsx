import {
    Button,
    Card,
    CardBody,
    Chip,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Tooltip,
    useDisclosure,
    User,
} from "@heroui/react";
import { RiEditLine, RiDeleteBin6Line, RiMailSendLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import {
    useDeleteWorkspaceMember,
    useUpdateWorkspaceMember,
} from '../../hooks/react-query/teams/useWorkspaceMembers.js';
import useCurrentWorkspace from '../../hooks/useCurrentWorkspace';

function MemberCard({ member, onEditMember }) {
    const [currentWorkspace] = useCurrentWorkspace();
    const { onOpen, isOpen, onOpenChange, onClose } = useDisclosure();
    const { mutateAsync: deleteWorkspaceMember, isPending: isDeleting } =
        useDeleteWorkspaceMember(currentWorkspace);
    const { mutateAsync: updateWorkspaceMember, isPending: isUpdating } =
        useUpdateWorkspaceMember(currentWorkspace);

    const handleUpdate = async (role, isResendEmail) => {
        await updateWorkspaceMember(
            { id: member.id, role: isResendEmail ? member.role : role },
            {
                onSuccess: () => {
                    toast.success(isResendEmail ? 'Invitation sent' : 'Member updated');
                },
                onError: (error) => {
                    toast.error(error.message);
                },
            },
        );
        // close modal
    };

    const handleDelete = async () => {
        await deleteWorkspaceMember(
            { id: member.id },
            {
                onSuccess: () => {
                    toast('Member removed');
                },
                onError: (error) => {
                    toast.error(error.message);
                },
            },
        );
        onClose();
    };

    const handleOnEdit = () => {
        onEditMember(member);
    };

    return (
        <>
            <Card shadow="sm">
                <CardBody>
                    <div className="flex gap-1 items-center justify-between">
                        <User
                            name={member.name || member.email.split('@')[0]}
                            description={member.email}
                            avatarProps={{
                                src: member.avatar,
                            }}
                        />
                        <span className="text-default-500">{member.role}</span>
                        <Chip
                            color={member.status === 'active' ? 'success' : 'default'}
                            variant="flat"
                        >
                            {member.status}
                        </Chip>
                        <div className="flex gap-3 items-center">
                            {member.status === 'pending' && (
                                <Tooltip content="Resend invite">
                                    <Button
                                        variant="light"
                                        size="md"
                                        isIconOnly
                                        isDisabled={
                                            new Date(member.updated_at).getTime() >
                                            Date.now() - 24 * 60 * 60 * 1000
                                        }
                                        onPress={() => handleUpdate(member.email, true)}
                                        isLoading={isUpdating}
                                    >
                                        <RiMailSendLine className="text-lg" />
                                    </Button>
                                </Tooltip>
                            )}
                            <Tooltip content="Edit">
                                <Button variant="light" size="md" isIconOnly onPress={handleOnEdit}>
                                    <RiEditLine className="text-lg" />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Delete">
                                <Button
                                    color="danger"
                                    variant="light"
                                    size="md"
                                    isIconOnly
                                    onPress={onOpen}
                                    isDisabled={member.role === 'owner'}
                                >
                                    <RiDeleteBin6Line className="text-lg" />
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                </CardBody>
            </Card>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    <ModalHeader>Remove user</ModalHeader>
                    <ModalBody>
                        <p>
                            Are you sure you want to remove
                            <span className="font-bold"> {member.name || member.email}</span> from
                            your workspace?
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="default"
                            variant="light"
                            isDisabled={isDeleting}
                            onPress={onClose}
                        >
                            Close
                        </Button>
                        <Button color="danger" isLoading={isDeleting} onClick={handleDelete}>
                            Yes, remove
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

export default MemberCard;
