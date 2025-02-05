import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '../../../lib/supabase';

// Fetch all worskpaces for a user
const fetchWorkspaces = async (user) => {
    const { data, error } = await supabaseClient
        .from('workspace_members')
        .select(
            `
      workspace_id,
      role,
      workspaces!workspace_members_workspace_id_fkey (
        name
      )
    `,
        )
        .eq('user_id', user?.id)
        .eq('status', 'active');

    if (error) {
        console.error('Error fetching workspaces:', error);
        throw error;
    }

    const transformedData = data.map((item) => ({
        workspace_id: item.workspace_id,
        role: item.role,
        name: item.workspaces?.name, // Flatten the 'name' field
    }));

    return transformedData;
};

// Hook to fetch all worskpaces
export const useWorkspaces = (user) => {
    return useQuery({
        queryKey: ['workspaces', user?.id],
        queryFn: () => fetchWorkspaces(user),
        staleTime: 1000 * 60 * 30, // 30 minutes
        enabled: !!user,
    });
};

// Update a team's details
const updateWorkspace = async ({ workspaceId, name }) => {
    const { data, error } = await supabaseClient
        .from('workspaces')
        .update({ name })
        .eq('id', workspaceId)
        .select()
        .single();

    if (error) {
        console.error('Error updating workspace:', error);
        throw error;
    }

    return data;
};

// Create a new workspace
const createWorkspace = async ({ name, user_id }) => {
    const { data, error } = await supabaseClient
        .from('workspaces')
        .insert([{ name, user_id }])
        .select(); // Optionally, use .select() to return the inserted data

    if (error) {
        console.error('Error creating workspace:', error);
        throw error;
    }

    return data[0];
};

// Hook to create a new workspace
export const useCreateWorkspace = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createWorkspace,
        onSuccess: (data) => {
            // Invalidate the 'workspaces' query to refetch the data
            queryClient.invalidateQueries(['workspaces', data.user_id]);
        },
    });
};

export const useUpdateWorkspace = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateWorkspace,
        onSuccess: (data) => {
            queryClient.invalidateQueries(['workspaces', data.user_id]);
        },
    });
};
