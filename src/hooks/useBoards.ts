import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CreateBoardSchemaType } from '@/schemas/board'

export interface Board {
  id: string
  name: string
  description: string
  ownerId: string
  members: string[]
  createdAt: string
  updatedAt: string
}

export function useBoards() {
  return useQuery<Board[]>({
    queryKey: ['boards'],
    queryFn: async () => {
      const response = await apiClient.get<Board[]>('/boards')
      return response.data
    }
  })
}

export function useCreateBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateBoardSchemaType) => {
      const response = await apiClient.post<Board>('/boards', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
    }
  })
}

export function useBoard(id: string) {
  return useQuery<Board>({
    queryKey: ['boards', id],
    queryFn: async () => {
      const response = await apiClient.get<Board>(`/boards/${id}`)
      return response.data
    },
    enabled: !!id
  })
}
