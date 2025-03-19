import NavBar from '../components/marketing/Nav';
import {
    Button,
    Card,
    CardBody,
    Input,
    Textarea,
    Select,
    SelectItem,
    Chip,
    Divider,
} from '@heroui/react';
import Footer from '../components/marketing/Footer.jsx';
import { RiArrowUpFill, RiCircleFill } from 'react-icons/ri';
import { useFeatureRequests } from '../hooks/react-query/feature-requests/useFeatureRequests.js';
import { useCreateFeatureRequest } from '../hooks/react-query/feature-requests/useFeatureRequests.js';
import { useUser } from '../hooks/react-query/user/useUser.js';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

function FeatureRequestsPage() {
    const [status, setStatus] = useState('idea');
    const { data: user } = useUser();
    const { data: items, refetch } = useFeatureRequests(user, [status]);
    const { mutateAsync: createFeatureRequest, isPending } = useCreateFeatureRequest(user);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        if (!user) return;

        try {
            await createFeatureRequest({
                title: data.title,
                description: data.description,
                user_id: user.id,
            });
            reset();
            toast('Idea submitted', {
                type: 'success',
                icon: '✅',
            });
        } catch (e) {
            console.log(e);
        }
    };

    const statusList = [
        { key: 'idea', color: 'text-default-400' },
        { key: 'planned', color: 'text-primary-400' },
        { key: 'in progress', color: 'text-blue-400' },
        { key: 'done', color: 'text-success-400' },
    ];
    useEffect(() => {
        refetch();
    }, [status]);

    return (
        <div className="w-screen min-h-screen bg-content1">
            <NavBar />
            <div className="container mx-auto max-w-[1280px] px-6">
                <h1 className="text-left text-4xl font-bold pt-12 pb-6">Suggest a feature</h1>
                <p className="font-medium">
                    Tell us what you’d like to see on {import.meta.env.VITE_APP_NAME}
                </p>
                <div className="flex flex-wrap md:flex-nowrap gap-6 pt-12 pb-32">
                    <div className="bg-content1 p-4 rounded-xl border-1 border-bg-content2 basis-1/3 grow h-full">
                        <div className="space-y-2">
                            <h2 className={`text-lg font-semibold`}>Add your idea</h2>
                            <p className="text-default-600">
                                This could be a problem you&apos;re having or something you wish was
                                possible with {import.meta.env.VITE_APP_NAME}
                            </p>
                        </div>
                        <form
                            id="submit-idea"
                            onSubmit={handleSubmit(onSubmit)}
                            className="mt-14 space-y-6"
                        >
                            <Input
                                {...register('title', { required: true })}
                                label="Title"
                                labelPlacement="outside"
                                placeholder="Keep it short"
                            />
                            <Textarea
                                {...register('description', { required: true })}
                                label="Description"
                                labelPlacement="outside"
                                placeholder="What do you need this for? Why is it important for you?"
                            />
                            <Button
                                type="submit"
                                form="submit-idea"
                                color="primary"
                                className="w-full"
                                isLoading={isPending}
                            >
                                Add idea
                            </Button>
                        </form>
                    </div>
                    <div className="bg-content1 p-4 rounded-xl border-1 border-bg-content2 basis-2/3 grow min-h-[70vh]">
                        <Select
                            selectionMode="single"
                            size="sm"
                            className="max-w-[160px]"
                            variant="bordered"
                            defaultSelectedKeys={['idea']}
                            aria-label="Status"
                            onSelectionChange={(keys) => {
                                const selectedValue = Array.from(keys)[0]; // Convert Set to Array and get the first item
                                setStatus(selectedValue);
                            }}
                            renderValue={(items) => {
                                return items.map((item) => (
                                    <Chip
                                        variant="light"
                                        key={item.key}
                                        startContent={
                                            <RiCircleFill
                                                className={
                                                    statusList.find(
                                                        (status) => status.key === item.key,
                                                    )?.color
                                                }
                                            />
                                        }
                                    >
                                        {item.key}
                                    </Chip>
                                ));
                            }}
                        >
                            {statusList.map((item) => (
                                <SelectItem
                                    key={item.key}
                                    startContent={
                                        <RiCircleFill
                                            className={
                                                statusList.find((status) => status.key === item.key)
                                                    ?.color
                                            }
                                        />
                                    }
                                >
                                    {item.key}
                                </SelectItem>
                            ))}
                        </Select>
                        <Divider className="my-3" />
                        <div className="space-y-3">
                            {items?.map((item) => (
                                <Card key={item.id} shadow="sm">
                                    <CardBody className="p-0">
                                        <div className="flex items-start gap-0 h-32">
                                            <div
                                                className="flex flex-col justify-center hover:bg-content2 cursor-pointer p-4 border-r-1 border-bg-content2 h-full"
                                                onClick={null}
                                            >
                                                <div className="p-2 text-center text-default-500">
                                                    <RiArrowUpFill fontSize="1.42rem" />
                                                    {0}
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-2">
                                                <h4 className="font-medium">{item.title}</h4>
                                                <p className="text-default-500">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default FeatureRequestsPage;
