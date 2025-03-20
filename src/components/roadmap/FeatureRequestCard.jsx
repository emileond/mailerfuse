import { Card, CardBody, Spinner } from '@heroui/react';
import { RiArrowUpFill } from 'react-icons/ri';
import { useUser } from '../../hooks/react-query/user/useUser.js';
import {
    useVotesForFeatureRequest,
    useVoteOnFeatureRequest,
} from '../../hooks/react-query/feature-requests/useFeatureRequests.js';

function FeatureRequestCard({ item }) {
    const { data: user } = useUser();
    const { data: votes, refetch, isFetching } = useVotesForFeatureRequest(item?.id, user?.id);
    const { mutateAsync: voteOnFeatureRequest } = useVoteOnFeatureRequest(user?.id);

    const handleVote = async () => {
        await voteOnFeatureRequest({
            featureRequestId: item?.id,
            userId: user?.id,
            hasVoted: !!votes?.hasVoted,
        });
        refetch();
    };

    return (
        <Card shadow="sm">
            <CardBody className="p-0">
                <div className="flex items-start gap-0 h-32">
                    <div
                        className="flex flex-col justify-center hover:bg-content2 cursor-pointer p-4 border-r-1 border-bg-content2 h-full"
                        onClick={handleVote}
                    >
                        {isFetching ? (
                            <Spinner size="sm" color="default" />
                        ) : (
                            <div
                                className={`p - 2 text-center text-default-500 ${votes?.hasVoted ? 'text-primary' : 'text-default-600'}`}
                            >
                                <RiArrowUpFill fontSize="1.42rem" />
                                {votes?.voteCount || 0}
                            </div>
                        )}
                    </div>
                    <div className="p-4 space-y-2">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-default-500">{item.description}</p>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}

export default FeatureRequestCard;
