import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export interface User {
  id: string
  email: string
  fullname: string
  avatarUrl: string
}

export interface Invitation {
  id: string
  boardId: string
  boardName: string
  boardOwnerId: string
  memberId: string
  emailMember: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
}

export function useUserSearch(query: string) {
  return useQuery<User[]>({
    queryKey: ['users', 'search', query],
    queryFn: async () => {
      const response = await apiClient.get<User[]>(`/users/search?q=${query}`)
      return response.data
    },
    enabled: query.length >= 2
  })
}

export function useInvitations() {
  return useQuery<Invitation[]>({
    queryKey: ['invitations'],
    queryFn: async () => {
      const response = await apiClient.get<Invitation[]>('/boards/invitations')
      return response.data
    }
  })
}

export function useInviteMember() {
  return useMutation({
    mutationFn: async (data: { boardId: string; memberId: string; email_member: string }) => {
      const response = await apiClient.post(`/boards/${data.boardId}/invite`, data)
      return response.data
    }
  })
}

export function useHandleInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { inviteId: string; status: 'accepted' | 'declined' }) => {
      const response = await apiClient.post('/boards/invitations/handle', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      queryClient.invalidateQueries({ queryKey: ['boards'] })
    }
  })
}

export function useUsersByIds(ids: string[]) {
  return useQuery<User[]>({
    queryKey: ['users', 'list', ids],
    queryFn: async () => {
      if (!ids.length) return []
      const response = await apiClient.post<User[]>('/users/list', { ids })
      return response.data
    },
    enabled: ids.length > 0
  })
}
