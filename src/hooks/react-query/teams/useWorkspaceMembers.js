import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { supabaseClient } from '../../../lib/supabase'

// Fetch email lists for a specific team
const fetchWorkspaceMembers = async (workspace_id) => {
  // Fetch workspace members first
  const { data: members, error: membersError } = await supabaseClient
    .from('workspace_members')
    .select('user_id, status, role')
    .eq('workspace_id', workspace_id)
    .in('status', ['active', 'pending'])

  if (membersError) {
    throw new Error('Failed to fetch workspace members')
  }

  const userIds = members.map((member) => member.user_id)

  // Fetch profiles for the corresponding user IDs
  const { data: profiles, error: profilesError } = await supabaseClient
    .from('profiles')
    .select('user_id, email')
    .in('user_id', userIds)

  if (profilesError) {
    throw new Error('Failed to fetch profiles')
  }

  // Merge workspace members with their corresponding profile emails
  const result = members.map((member) => ({
    ...member,
    email:
      profiles.find((profile) => profile.user_id === member.user_id)?.email ||
      null,
  }))

  return result
}

// Hook to fetch all workspace members
export const useWorkspaceMembers = (currentWorkspace) => {
  return useQuery({
    queryKey: ['workspaceMembers', currentWorkspace?.workspace_id],
    queryFn: () => fetchWorkspaceMembers(currentWorkspace?.workspace_id),
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!currentWorkspace?.workspace_id, // Only fetch if teamId is provided
  })
}

// Function to add a new member
const addWorkspaceMember = async ({ invite_email, role, workspace_id }) => {
  const { error } = await supabaseClient.from('api_keys').insert([
    {
      invite_email,
      role,
      workspace_id,
    },
  ])

  if (error) {
    console.error('Error adding workspace member:', error)
    throw new Error('Failed to add member')
  }

  return
}

// Hook to create a new api key
export const useAddWorkspaceMember = (currentWorkspace) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addWorkspaceMember,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries([
        'workspaceMembers',
        currentWorkspace?.workspace_id,
      ])
    },
  })
}

// Function to delete an api key
const deleteApiKey = async ({ id }) => {
  console.log('Deleting api key with id:', id)
  const { error } = await supabaseClient.from('api_keys').delete().eq('id', id)

  if (error) {
    console.error('Error deleting api key:', error)
    throw new Error('Failed to create email list')
  }

  return
}

// Hook to delete an api key
export const useDeleteApiKey = (currentWorkspace) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteApiKey,
    onSuccess: () => {
      // Invalidate and refetch the email lists query for the team
      queryClient.invalidateQueries(['apiKeys', currentWorkspace?.workspace_id])
    },
  })
}
