import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PageLayout from '../components/layout/PageLayout';
import {
    Avatar,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Input,
    Tabs,
    Tab,
} from '@nextui-org/react';
import { useEffect, useState } from 'react';

function ProfilePage() {
    const navigate = useNavigate();
    const { tab } = useParams();
    const [activeTab, setActiveTab] = useState('profile');

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Update the URL to reflect the active tab
        navigate(`/account/${tab}`, { replace: true });
    };

    useEffect(() => {
        if (tab) {
            setActiveTab(tab);
        }
    }, [tab]);

    return (
        <AppLayout>
            <PageLayout title="Account settings" maxW="3xl">
                <Tabs selectedKey={activeTab} onSelectionChange={(tab) => handleTabChange(tab)}>
                    <Tab key="profile" title="Profile">
                        <div className="flex flex-col gap-3">
                            <Card shadow="sm">
                                <CardHeader>Profile</CardHeader>
                                <CardBody>
                                    <Avatar
                                        className="w-20 h-20 text-large"
                                        src="https://i.pravatar.cc/150?u=a04258114e29026708c"
                                    />
                                    <Input label="name" type="text" />
                                </CardBody>
                                <CardFooter>
                                    <Button color="primary">Save</Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </Tab>
                    <Tab key="invitations" title="Invitations">
                        <div className="flex flex-col gap-3">
                            <Card shadow="sm">
                                <CardBody>
                                    <Input label="name" type="text" />
                                </CardBody>
                            </Card>
                        </div>
                    </Tab>
                </Tabs>
            </PageLayout>
        </AppLayout>
    );
}

export default ProfilePage;
