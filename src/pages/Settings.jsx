import AppLayout from '../components/layout/AppLayout';
import PageLayout from '../components/layout/PageLayout';
import {
    Alert,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Divider,
    Input,
} from '@heroui/react';
import useCurrentWorkspace from '../hooks/useCurrentWorkspace.js';
import { useWorkspaceCredits } from '../hooks/react-query/credits/useWorkspaceCredits.js';
import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useUpdateWorkspace } from '../hooks/react-query/teams/useWorkspaces.js';
import toast from 'react-hot-toast';
import Paywall from '../components/marketing/Paywall.jsx';

function SettingsPage() {
    const [currentWorkspace] = useCurrentWorkspace();
    const { data: credits } = useWorkspaceCredits(currentWorkspace);
    const { mutateAsync: updateWorkspace, isPending } = useUpdateWorkspace();
    const [isLoading, setIsLoading] = useState(false);

    const [isPaywallOpen, setIsPaywallOpen] = useState(false);

    const {
        control, // Required for Controller
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: { workspace_name: '' },
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const id = currentWorkspace.workspace_id;
            const name = data.workspace_name;
            await updateWorkspace({ workspaceId: id, name });
            toast.success('Changes saved');
        } catch (error) {
            toast.error(error?.message || 'Failed to save changes, try again');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGeneralReset = () => {
        setValue('workspace_name', currentWorkspace.name);
    };

    useEffect(() => {
        if (currentWorkspace?.name) {
            setValue('workspace_name', currentWorkspace.name);
        }
    }, [currentWorkspace, setValue]);

    return (
        <AppLayout>
            <Paywall
                hideTitle
                isOpen={isPaywallOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsPaywallOpen(false);
                    }
                }}
                feature="more credits"
            />
            <PageLayout title="Workspace settings" maxW="2xl">
                <div className="flex flex-col gap-6">
                    <Card shadow="sm">
                        <CardHeader>
                            <h4 className="font-medium">General</h4>
                        </CardHeader>
                        <CardBody>
                            <form id="general-workspace-settings" onSubmit={handleSubmit(onSubmit)}>
                                <Controller
                                    name="workspace_name"
                                    control={control}
                                    rules={{ required: 'Workspace name is required' }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Workspace name"
                                            isInvalid={!!errors.workspace_name}
                                            errorMessage={errors.workspace_name?.message}
                                        />
                                    )}
                                />
                            </form>
                        </CardBody>
                        <Divider />
                        <CardFooter>
                            <div className="w-full flex gap-2 justify-end">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    color="default"
                                    isDisabled={isLoading}
                                    onPress={handleGeneralReset}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    form="general-workspace-settings"
                                    size="sm"
                                    variant="solid"
                                    color="primary"
                                    isLoading={isLoading}
                                    disabled={isPending}
                                >
                                    Save
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                    <Card shadow="sm">
                        <CardHeader>
                            <h4 className="font-medium">Billing</h4>
                        </CardHeader>
                        <CardBody className="flex flex-col gap-1">
                            <div className="flex items-center justify-between bg-content2 p-3 rounded-xl">
                                <div>
                                    <small>Available credits</small>
                                    <h3 className="text-xl font-semibold">
                                        {Intl.NumberFormat().format(credits?.available_credits)}
                                    </h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    color="primary"
                                    size="sm"
                                    onPress={() => setIsPaywallOpen(true)}
                                    isDisabled={currentWorkspace?.is_ltd}
                                >
                                    Get more
                                </Button>
                            </div>
                            {currentWorkspace?.is_ltd && (
                                <Alert
                                    title={`You have access to the Lifetime ${currentWorkspace?.ltd_plan}`}
                                    description="Credits renew each month"
                                />
                            )}
                        </CardBody>
                        <Divider />
                    </Card>
                </div>
            </PageLayout>
        </AppLayout>
    );
}

export default SettingsPage;
