import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ID, account, teams } from '../../../lib/appwrite'

const fetchCurrentUser = async () => {
  try {
    const data = await account.get()
    return data
  } catch {
    return null
  }
}

export const useUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 60, // 60 minutes
    cacheTime: 1000 * 60 * 60, // Cache for 60 minutes
  })
}
// Functions for login, logout, and register
const loginUser = async ({ email, password }) => {
  const user = await account.createEmailPasswordSession(email, password)
  return user
}

const logoutUser = async () => {
  await account.deleteSession('current')
}

const registerUser = async ({ email, password }) => {
  await account.create(ID.unique(), email, password)
  await account.createEmailPasswordSession(email, password)
  await account.createVerification(import.meta.env.VITE_PUBLIC_URL)
  // should move this after verification ???
  const userTeams = await teams.list()
  if (!userTeams.total) {
    await teams.create(ID.unique(), 'My Team')
  }
  return
}

// Hooks for mutations
export const useLoginUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      await queryClient.setQueryData('currentUser', data)
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export const useRegisterUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: registerUser,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      await queryClient.setQueryData('currentUser', data)
    },
  })
}
