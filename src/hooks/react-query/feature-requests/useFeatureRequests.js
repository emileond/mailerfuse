import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabaseClient } from '../../../lib/supabase';

// Fetch feature requests filtered by status
const fetchFeatureRequests = async (statusList) => {
    const { data, error } = await supabaseClient
        .from('feature_requests')
        .select('title, description, id, status')
        .in('status', statusList);

    if (error) {
        throw new Error('Failed to fetch email lists');
    }

    return data;
};

// Hook to fetch feature requests
export const useFeatureRequests = (user, statusList) => {
    return useQuery({
        queryKey: ['featureRequests', user?.id],
        queryFn: () => fetchFeatureRequests(statusList),
        staleTime: 1000 * 60 * 120, // 2 hours
    });
};

// Function to create a new api key
const createFeatureRequest = async ({ title, description, user_id }) => {
    const { error } = await supabaseClient.from('feature_requests').insert([
        {
            title,
            description,
            user_id,
            status: 'idea',
        },
    ]);

    if (error) {
        console.error('Error creating feature request:', error);
        throw new Error('Failed to create feature request');
    }
};

// Hook to create a new api key
export const useCreateFeatureRequest = (user) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createFeatureRequest,
        onSuccess: () => {
            // Invalidate and refetch the email lists query for the team
            queryClient.invalidateQueries(['featureRequests', user?.id]);
        },
    });
};
