import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabaseClient } from '../../../lib/supabase';

// Fetch email lists for a specific team
const fetchWorkspaceMembers = async (workspace_id) => {
    // Fetch workspace members first
    const { data: members, error: membersError } = await supabaseClient
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspace_id)
        .in('status', ['active', 'pending']);

    if (membersError) {
        throw new Error('Failed to fetch workspace members');
    }

    const userIds = members
        .filter((member) => member.user_id !== null)
        .map((member) => member.user_id);

    // Fetch profiles for the corresponding user IDs
    const { data: profiles, error: profilesError } = await supabaseClient
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);

    if (profilesError) {
        console.log(profilesError);
        throw new Error('Failed to fetch profiles');
    }

    // Merge workspace members with their corresponding profile emails
    const result = members.map((member) => ({
        ...member,
        email:
            profiles.find((profile) => profile.user_id === member.user_id)?.email ||
            member.invite_email,
    }));

    return result;
};

// Hook to fetch all workspace members
export const useWorkspaceMembers = (currentWorkspace) => {
    return useQuery({
        queryKey: ['workspaceMembers', currentWorkspace?.workspace_id],
        queryFn: () => fetchWorkspaceMembers(currentWorkspace?.workspace_id),
        staleTime: 1000 * 60 * 30, // 30 minutes
        enabled: !!currentWorkspace?.workspace_id, // Only fetch if teamId is provided
    });
};

// Function to add a new member
const addWorkspaceMember = async ({ invite_email, role, workspace_id, invited_by }) => {
    const { error } = await supabaseClient.from('workspace_members').insert([
        {
            invite_email,
            role,
            workspace_id,
            status: 'pending',
            invited_by: invited_by,
        },
    ]);

    if (error) {
        console.error('Error adding workspace member:', error);
        throw new Error(error.message);
    }
};

// Hook to create a new api key
export const useAddWorkspaceMember = (currentWorkspace) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addWorkspaceMember,
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries(['workspaceMembers', currentWorkspace?.workspace_id]);
        },
    });
};

// Function to delete an api key
const deleteWorkspaceMember = async ({ id }) => {
    console.log('Deleting api key with id:', id);
    const { error } = await supabaseClient.from('workspace_members').delete().eq('id', id);

    if (error) {
        console.error('Error deleting:', error);
        throw new Error('Failed to delete member');
    }
};

// Hook to delete an api key
export const useDeleteWorkspaceMember = (currentWorkspace) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteWorkspaceMember,
        onSuccess: () => {
            // Invalidate and refetch the email lists query for the team
            queryClient.invalidateQueries(['workspaceMembers', currentWorkspace?.workspace_id]);
        },
    });
};
