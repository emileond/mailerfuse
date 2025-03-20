import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabaseClient } from '../../../lib/supabase';

// Fetch feature requests filtered by status
const fetchFeatureRequests = async (statusList) => {
    const { data, error } = await supabaseClient
        .from('feature_requests')
        .select('title, description, id, status')
        .in('status', statusList);

    if (error) {
        throw new Error('Failed to fetch feature requests');
    }

    return data;
};

// Fetch the number of votes and if the user has voted for the feature request
const fetchVotesForFeatureRequest = async (featureRequestId, userId) => {
    const { data } = await supabaseClient
        .from('feature_request_votes')
        .select('id')
        .eq('request_id', featureRequestId)
        .eq('user_id', userId)
        .single(); // Assumes user can vote only once per feature request

    const { count: voteCount } = await supabaseClient
        .from('feature_request_votes')
        .select('id', { count: 'exact' })
        .eq('request_id', featureRequestId);

    return {
        hasVoted: !!data,
        voteCount,
    };
};

// Hook to fetch feature requests
export const useFeatureRequests = (user, statusList) => {
    return useQuery({
        queryKey: ['featureRequests', user?.id],
        queryFn: () => fetchFeatureRequests(statusList),
        staleTime: 1000 * 60 * 120, // 2 hours
    });
};

// Hook to fetch votes for a specific feature request and check if the user has voted
export const useVotesForFeatureRequest = (featureRequestId, userId) => {
    return useQuery({
        queryKey: ['featureRequestVotes', featureRequestId],
        queryFn: () => fetchVotesForFeatureRequest(featureRequestId, userId),
        staleTime: 1000 * 60 * 20, // 20 min
        // enabled: !!userId, // Only run if userId is available
    });
};

// Function to create a new feature request
const createFeatureRequest = async ({ title, description, user_id }) => {
    // Insert new feature request
    const { data, error } = await supabaseClient
        .from('feature_requests')
        .insert([
            {
                title,
                description,
                user_id,
                status: 'idea',
            },
        ])
        .select();

    if (error) {
        console.error('Error creating feature request:', error);
        throw new Error('Failed to create feature request');
    }

    // Automatically vote for the feature request that was just created
    const { error: voteError } = await supabaseClient.from('feature_request_votes').insert([
        {
            request_id: data[0].id, // Use the id of the created feature request
            user_id: user_id, // The user who created the feature request
        },
    ]);

    if (voteError) {
        console.error('Error adding vote for feature request:', voteError);
        throw new Error('Failed to add vote for feature request');
    }
};

// Hook to create a new feature request
export const useCreateFeatureRequest = (user) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createFeatureRequest,
        onSuccess: () => {
            // Invalidate and refetch the feature requests query for the user
            queryClient.invalidateQueries(['featureRequests', user?.id]);
        },
    });
};

// Function to vote or unvote on a feature request
const voteOnFeatureRequest = async ({ featureRequestId, userId, hasVoted }) => {
    console.log('voting', featureRequestId, userId, hasVoted);
    if (hasVoted) {
        const { error } = await supabaseClient
            .from('feature_request_votes')
            .delete()
            .eq('request_id', featureRequestId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error unvoting feature request:', error);
            throw new Error('Failed to unvote');
        }
    } else {
        const { error } = await supabaseClient.from('feature_request_votes').insert([
            {
                request_id: featureRequestId,
                user_id: userId,
            },
        ]);

        if (error) {
            console.error('Error voting feature request:', error);
            throw new Error('Failed to vote');
        }
    }
};

// Hook to vote/unvote on a feature request
export const useVoteOnFeatureRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: voteOnFeatureRequest,
    });
};
