import NavBar from '../components/marketing/Nav';
import { Button, Modal, ModalContent, ModalBody, useDisclosure, Spinner } from '@heroui/react';
import Footer from '../components/marketing/Footer.jsx';
import { RiArrowLeftLine, RiArrowUpFill } from 'react-icons/ri';
import {
    useFeatureRequestItem,
    useVoteOnFeatureRequest,
    useVotesForFeatureRequest,
} from '../hooks/react-query/feature-requests/useFeatureRequests.js';
import { useUser } from '../hooks/react-query/user/useUser.js';
import AuthForm from '../components/auth/AuthForm.jsx';
import { useNavigate, useParams } from 'react-router-dom';

function FeatureRequestDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { data: user } = useUser();
    const { data: item, isPending: itemsPending } = useFeatureRequestItem(id);
    const { data: votes, refetch, isFetching } = useVotesForFeatureRequest(id, user?.id);
    const { mutateAsync: voteOnFeatureRequest } = useVoteOnFeatureRequest();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleVote = async () => {
        if (!user) {
            return onOpen();
        }

        await voteOnFeatureRequest({
            featureRequestId: item?.id,
            userId: user?.id,
            hasVoted: !!votes?.hasVoted,
        });
        await refetch();
    };

    return (
        <div className="w-screen min-h-screen bg-content2/50">
            <NavBar />
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    <ModalBody>
                        <AuthForm hideLogo onSuccess={() => onOpenChange()} />
                    </ModalBody>
                </ModalContent>
            </Modal>
            <div className="container mx-auto max-w-[860px] px-6">
                <div className="flex flex-wrap md:flex-nowrap gap-6 pt-12 pb-32">
                    <div className="bg-content1 p-6 rounded-xl border-1 border-content3 basis-2/3 grow min-h-[30vh]">
                        <div className="space-y-3 h-full">
                            {itemsPending && (
                                <div className="flex justify-center items-center h-full">
                                    <Spinner size="lg" />
                                </div>
                            )}
                            {item && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        color="primary"
                                        onPress={() => navigate(-1)}
                                        startContent={<RiArrowLeftLine fontSize="1rem" />}
                                    >
                                        Back
                                    </Button>
                                    <div className="flex items-start gap-3 h-16">
                                        <div
                                            className="flex flex-col items-center justify-center w-14 hover:bg-content2 border-1 border-content3 rounded-lg cursor-pointer p-4  h-full"
                                            onClick={handleVote}
                                        >
                                            {isFetching ? (
                                                <Spinner size="sm" color="default" />
                                            ) : (
                                                <div
                                                    className={`p-2 text-center text-default-500 ${votes?.hasVoted ? 'text-primary' : 'text-default-600'}`}
                                                >
                                                    <RiArrowUpFill fontSize="1.42rem" />
                                                    {votes?.voteCount || 0}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h1 className="font-semibold">{item.title}</h1>
                                            <p>{item.description}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default FeatureRequestDetails;
