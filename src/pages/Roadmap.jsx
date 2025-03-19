import NavBar from '../components/marketing/Nav';
import { Card, CardBody, Progress } from '@heroui/react';
import Footer from '../components/marketing/Footer.jsx';
import { RiArrowUpFill } from 'react-icons/ri';
import { useFeatureRequests } from '../hooks/react-query/feature-requests/useFeatureRequests.js';
import { useUser } from '../hooks/react-query/user/useUser.js';

function RoadmapPage() {
    const { data: user } = useUser();
    const { data: items, isPending } = useFeatureRequests(user, ['planned', 'in progress', 'done']);

    const columns = [
        { title: 'planned', color: 'bg-primary-200' },
        { title: 'in progress', color: 'bg-blue-200' },
        { title: 'done', color: 'bg-success-200' },
    ];

    return (
        <div className="w-screen min-h-screen bg-content1">
            <NavBar />
            <div className="container mx-auto max-w-[1280px] px-6">
                <h1 className="text-left text-4xl font-bold pt-12 pb-6">Roadmap</h1>
                <p className="font-medium">
                    What’s on the horizon for {import.meta.env.VITE_APP_NAME}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh] pt-12 pb-32">
                    {columns.map((col) => (
                        <div
                            key={col.title}
                            className="bg-content1 p-4 rounded-xl border-1 border-bg-content2"
                        >
                            <div className="mb-3 pb-2">
                                <h2 className={`text-lg font-semibold mb-2`}>{col.title}</h2>
                                <Progress
                                    isIndeterminate={isPending}
                                    size="sm"
                                    value={100}
                                    classNames={{ indicator: `${col.color}` }}
                                    aria-label="label decorator"
                                />
                            </div>
                            <div className="space-y-3">
                                {items
                                    ?.filter((item) => item.status === col.title)
                                    ?.map((item) => (
                                        <Card key={item.id} shadow="sm">
                                            <CardBody className="p-0">
                                                <div className="flex items-center gap-0 h-24">
                                                    <div
                                                        className="flex flex-col justify-center hover:bg-content2 cursor-pointer p-4 border-r-1 border-bg-content2 h-full"
                                                        onClick={null}
                                                    >
                                                        <div className="p-2 text-center text-default-500">
                                                            <RiArrowUpFill fontSize="1.42rem" />
                                                            {0}
                                                        </div>
                                                    </div>
                                                    <h4 className="font-medium p-4">
                                                        {item.title}
                                                    </h4>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default RoadmapPage;
