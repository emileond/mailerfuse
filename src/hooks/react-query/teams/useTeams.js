import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ID, teams } from '../../../lib/appwrite'

// Fetch all teams the user has access to
const fetchTeams = async () => {
  const userTeams = await teams.list()
  return userTeams
}

// Hook to fetch all teams
export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 30, // Cache for 30 minutes
  })
}

// Create a new team
const createTeam = async ({ name }) => {
  const newTeam = await teams.create(ID.unique(), name)
  return newTeam
}

// Update a team's details
const updateTeam = async ({ teamId, name }) => {
  const updatedTeam = await teams.update(teamId, { name })
  return updatedTeam
}

// Invite a user to a team
const createTeamMember = async ({ teamId, email, roles }) => {
  const newMember = await teams.createMembership(
    teamId,
    email,
    roles,
    `${window.location.origin}/invite-callback`
  )
  return newMember
}

// Update team member roles
const updateTeamMemberRoles = async ({ teamId, memberId, roles }) => {
  const updatedMember = await teams.updateMembershipRoles(
    teamId,
    memberId,
    roles
  )
  return updatedMember
}

// Delete a team member
const deleteTeamMember = async ({ teamId, memberId }) => {
  await teams.deleteMembership(teamId, memberId)
}

// Update team member status (e.g., activate or deactivate)
const updateTeamMemberStatus = async ({ teamId, memberId, status }) => {
  // Custom logic to update the status; for Appwrite, you might use activate/deactivate
  console.log('Updating team member status:', teamId, memberId, status)
}

// Hooks for team actions
export const useCreateTeam = () => {
  const queryClient = useQueryClient()
  return useMutation(createTeam, {
    onSuccess: () => {
      queryClient.invalidateQueries(['teams'])
    },
  })
}

export const useUpdateTeam = () => {
  const queryClient = useQueryClient()
  return useMutation(updateTeam, {
    onSuccess: () => {
      queryClient.invalidateQueries(['teams'])
    },
  })
}

export const useCreateTeamMember = () => {
  const queryClient = useQueryClient()
  return useMutation(createTeamMember, {
    onSuccess: () => {
      queryClient.invalidateQueries(['teams'])
    },
  })
}

export const useUpdateTeamMemberRoles = () => {
  const queryClient = useQueryClient()
  return useMutation(updateTeamMemberRoles, {
    onSuccess: () => {
      queryClient.invalidateQueries(['teams'])
    },
  })
}

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient()
  return useMutation(deleteTeamMember, {
    onSuccess: () => {
      queryClient.invalidateQueries(['teams'])
    },
  })
}

export const useUpdateTeamMemberStatus = () => {
  const queryClient = useQueryClient()
  return useMutation(updateTeamMemberStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries(['teams'])
    },
  })
}
