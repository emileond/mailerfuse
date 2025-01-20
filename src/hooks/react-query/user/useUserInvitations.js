import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '../../../lib/supabase';

const fetchUserInvitations = async (user_email) => {
    const { data, error } = await supabaseClient
        .from('workspace_members')
        .select('*')
        .eq('invite_email', user_email)
        .eq('status', 'pending');

    if (error) {
        throw new Error('Failed to fetch invitations');
    }

    return data;
};

export const useUserInvitations = (user) => {
    return useQuery({
        queryKey: ['userInvitations', user?.id],
        queryFn: () => fetchUserInvitations(user?.email),
        staleTime: 1000 * 60 * 120, // 120 minutes
        enabled: !!user, // Only fetch if user is provided
    });
};
