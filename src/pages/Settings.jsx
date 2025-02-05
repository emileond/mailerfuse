import AppLayout from '../components/layout/AppLayout';
import PageLayout from '../components/layout/PageLayout';
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input } from '@heroui/react';
import useCurrentWorkspace from '../hooks/useCurrentWorkspace.js';
import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useUpdateWorkspace } from '../hooks/react-query/teams/useWorkspaces.js';
import toast from 'react-hot-toast';

function SettingsPage() {
    const [currentWorkspace] = useCurrentWorkspace();
    const { mutateAsync: updateWorkspace, isPending } = useUpdateWorkspace();
    const [isLoading, setIsLoading] = useState(false);

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
            <PageLayout title="Settings" maxW="2xl">
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
            </PageLayout>
        </AppLayout>
    );
}

export default SettingsPage;
