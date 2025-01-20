import { Button, Card, CardBody, Chip, useDisclosure } from '@nextui-org/react';
import toast from 'react-hot-toast';
import {
    useDeleteWorkspaceMember,
    useUpdateWorkspaceMember,
} from '../../hooks/react-query/teams/useWorkspaceMembers.js';
import useCurrentWorkspace from '../../hooks/useCurrentWorkspace';

function InvitationCard({ invitation }) {
    const [currentWorkspace] = useCurrentWorkspace();
    const { mutateAsync: deleteWorkspaceMember, isPending: isDeleting } =
        useDeleteWorkspaceMember(currentWorkspace);
    const { mutateAsync: updateWorkspaceMember, isPending: isUpdating } =
        useUpdateWorkspaceMember(currentWorkspace);

    const handleAccept = async (role, isResendEmail) => {
        await updateWorkspaceMember(
            { id: invitation.id, role: isResendEmail ? invitation.role : role },
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

    const handleDecline = async () => {
        await deleteWorkspaceMember(
            { id: invitation.id },
            {
                onSuccess: () => {
                    toast('Member removed');
                },
                onError: (error) => {
                    toast.error(error.message);
                },
            },
        );
    };

    return (
        <Card shadow="sm">
            <CardBody>
                <div className="flex gap-1 items-center justify-between">
                    <p className="text-default-500">
                        <span className="font-semibold">{invitation.invited_by}</span> has invited
                        you to join their workspace
                    </p>
                    <div className="flex gap-3 items-center">
                        <Button
                            color="default"
                            variant="solid"
                            size="md"
                            onPress={() => handleUpdate(invitation.email, true)}
                            isLoading={isUpdating}
                        >
                            Decline
                        </Button>
                        <Button
                            color="primary"
                            variant="solid"
                            size="md"
                            onPress={() => handleUpdate(invitation.email, true)}
                            isLoading={isUpdating}
                        >
                            Accept
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}

export default InvitationCard;
