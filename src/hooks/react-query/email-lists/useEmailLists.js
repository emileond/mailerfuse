import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { databases, ID, Permission, Role } from '../../../lib/appwrite'

// Fetch email lists for a specific team
const fetchEmailLists = async () => {
  const result = await databases.listDocuments(
    '672b9b260032fe4d52ef',
    '672c0483001ea19aa498',
    [] // Add any necessary queries or filters here
  )
  return result.documents
}

// Hook to fetch all email lists for a given team
export const useEmailLists = (teamId) => {
  return useQuery({
    queryKey: ['emailLists', teamId],
    queryFn: () => fetchEmailLists(teamId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: !!teamId, // Only fetch if teamId is provided
  })
}

// Function to create a new email list
const createEmailList = async ({ fileName, teamId }) => {
  const savedList = await databases.createDocument(
    '672b9b260032fe4d52ef',
    '672c0483001ea19aa498',
    ID.unique(),
    {
      name: fileName,
      status: 'pending',
    },
    [
      Permission.read(Role.team(teamId)),
      Permission.update(Role.team(teamId)),
      Permission.delete(Role.team(teamId)),
    ]
  )
  return savedList
}

// Hook to create a new email list
export const useCreateEmailList = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEmailList,
    onSuccess: (newList, { teamId }) => {
      // Invalidate and refetch the email lists query for the team
      queryClient.invalidateQueries(['emailLists', teamId])
    },
  })
}

// Function to delete an email list
const deleteEmailList = async ({ listId }) => {
  await databases.deleteDocument(
    '672b9b260032fe4d52ef',
    '672c0483001ea19aa498',
    listId
  )
  return
}

// Hook to delete an email list
export const useDeleteEmailList = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteEmailList,
    onError: (error) => {
      console.error('Error deleting email list:', error)
    },
    onSuccess: () => {
      // Invalidate and refetch the email lists query for the team
      queryClient.invalidateQueries(['emailLists'])
    },
  })
}
