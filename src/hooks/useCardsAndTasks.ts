import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export interface Card {
  id: string
  name: string
  description: string
  boardId: string
  createdAt: string
}

export interface GitHubAttachment {
  id: string
  type: 'pr' | 'commit' | 'issue'
  url: string
  title?: string
  sha?: string
  attachedAt: string
  attachedBy: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: 'low' | 'medium' | 'high'
  deadline: string | null
  cardId: string
  boardId: string
  ownerId: string
  assignedMembers: string[]
  githubAttachments: GitHubAttachment[]
  createdAt: string
  updatedAt: string
}

export function useCards(boardId: string) {
  return useQuery<Card[]>({
    queryKey: ['boards', boardId, 'cards'],
    queryFn: async () => {
      const response = await apiClient.get<Card[]>(`/boards/${boardId}/cards`)
      return response.data
    },
    enabled: !!boardId
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { boardId: string; name: string }) => {
      const response = await apiClient.post<Card>(`/boards/${data.boardId}/cards`, {
        name: data.name
      })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boards', variables.boardId, 'cards'] })
    }
  })
}

export function useTasks(boardId: string, cardId: string) {
  return useQuery<Task[]>({
    queryKey: ['boards', boardId, 'cards', cardId, 'tasks'],
    queryFn: async () => {
      const response = await apiClient.get<Task[]>(`/boards/${boardId}/cards/${cardId}/tasks`)
      return response.data
    },
    enabled: !!boardId && !!cardId
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      boardId: string
      cardId: string
      title: string
      description?: string
      priority?: string
      deadline?: string
    }) => {
      const response = await apiClient.post<Task>(`/boards/${data.boardId}/cards/${data.cardId}/tasks`, data)
      return response.data
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ['boards', variables.boardId, 'cards', variables.cardId, 'tasks']
      })

      const previousTasks = queryClient.getQueryData<Task[]>([
        'boards',
        variables.boardId,
        'cards',
        variables.cardId,
        'tasks'
      ])

      const optimisticTask: Task = {
        id: `temp-${Date.now()}`,
        title: variables.title,
        description: variables.description || '',
        status: 'todo',
        priority: (variables.priority as 'low' | 'medium' | 'high') || 'medium',
        deadline: variables.deadline || null,
        cardId: variables.cardId,
        boardId: variables.boardId,
        ownerId: '',
        assignedMembers: [],
        githubAttachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      queryClient.setQueryData<Task[]>(
        ['boards', variables.boardId, 'cards', variables.cardId, 'tasks'],
        [...(previousTasks || []), optimisticTask]
      )

      return { previousTasks }
    },
    onError: (_err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ['boards', variables.boardId, 'cards', variables.cardId, 'tasks'],
          context.previousTasks
        )
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['boards', variables.boardId, 'cards', variables.cardId, 'tasks']
      })
    }
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { boardId: string; cardId: string; taskId: string; payload: Partial<Task> }) => {
      const response = await apiClient.put<Task>(
        `/boards/${data.boardId}/cards/${data.cardId}/tasks/${data.taskId}`,
        data.payload
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['boards', variables.boardId, 'cards', variables.cardId, 'tasks']
      })
      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.taskId]
      })
    }
  })
}

export function useTask(boardId: string, cardId: string, taskId: string) {
  return useQuery<Task>({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const response = await apiClient.get<Task>(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`)
      return response.data
    },
    enabled: !!boardId && !!cardId && !!taskId
  })
}

export function useAssignMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { boardId: string; cardId: string; taskId: string; memberId: string }) => {
      const response = await apiClient.post(
        `/boards/${data.boardId}/cards/${data.cardId}/tasks/${data.taskId}/assign`,
        { memberId: data.memberId }
      )
      return response.data
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', variables.taskId] })
      await queryClient.cancelQueries({
        queryKey: ['boards', variables.boardId, 'cards', variables.cardId, 'tasks']
      })

      const previousTask = queryClient.getQueryData<Task>(['tasks', variables.taskId])
      const previousTasks = queryClient.getQueryData<Task[]>([
        'boards',
        variables.boardId,
        'cards',
        variables.cardId,
        'tasks'
      ])

      if (previousTask) {
        queryClient.setQueryData<Task>(['tasks', variables.taskId], {
          ...previousTask,
          assignedMembers: [...(previousTask.assignedMembers || []), variables.memberId]
        })
      }

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          ['boards', variables.boardId, 'cards', variables.cardId, 'tasks'],
          previousTasks.map((task) =>
            task.id === variables.taskId
              ? { ...task, assignedMembers: [...(task.assignedMembers || []), variables.memberId] }
              : task
          )
        )
      }

      return { previousTask, previousTasks }
    },
    onError: (_err, variables, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', variables.taskId], context.previousTask)
      }
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ['boards', variables.boardId, 'cards', variables.cardId, 'tasks'],
          context.previousTasks
        )
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId] })
      queryClient.invalidateQueries({
        queryKey: ['boards', variables.boardId, 'cards', variables.cardId, 'tasks']
      })
    }
  })
}

export function useRemoveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { boardId: string; cardId: string; taskId: string; memberId: string }) => {
      const response = await apiClient.delete(
        `/boards/${data.boardId}/cards/${data.cardId}/tasks/${data.taskId}/assign/${data.memberId}`
      )
      return response.data
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', variables.taskId] })
      await queryClient.cancelQueries({
        queryKey: ['boards', variables.boardId, 'cards', variables.cardId, 'tasks']
      })

      const previousTask = queryClient.getQueryData<Task>(['tasks', variables.taskId])
      const previousTasks = queryClient.getQueryData<Task[]>([
        'boards',
        variables.boardId,
        'cards',
        variables.cardId,
        'tasks'
      ])

      if (previousTask) {
        queryClient.setQueryData<Task>(['tasks', variables.taskId], {
          ...previousTask,
          assignedMembers: previousTask.assignedMembers.filter((id) => id !== variables.memberId)
        })
      }

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          ['boards', variables.boardId, 'cards', variables.cardId, 'tasks'],
          previousTasks.map((task) =>
            task.id === variables.taskId
              ? { ...task, assignedMembers: task.assignedMembers.filter((id) => id !== variables.memberId) }
              : task
          )
        )
      }

      return { previousTask, previousTasks }
    },
    onError: (_err, variables, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', variables.taskId], context.previousTask)
      }
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ['boards', variables.boardId, 'cards', variables.cardId, 'tasks'],
          context.previousTasks
        )
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId] })
      queryClient.invalidateQueries({
        queryKey: ['boards', variables.boardId, 'cards', variables.cardId, 'tasks']
      })
    }
  })
}

export function useMoveTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { boardId: string; cardId: string; taskId: string; newCardId: string }) => {
      const response = await apiClient.post(`/boards/${data.boardId}/cards/${data.cardId}/tasks/${data.taskId}/move`, {
        newCardId: data.newCardId
      })
      return response.data
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['boards', variables.boardId, 'cards', variables.cardId, 'tasks'] })

      const previousSourceTasks = queryClient.getQueryData<Task[]>([
        'boards',
        variables.boardId,
        'cards',
        variables.cardId,
        'tasks'
      ])
      const previousDestTasks = queryClient.getQueryData<Task[]>([
        'boards',
        variables.boardId,
        'cards',
        variables.newCardId,
        'tasks'
      ])

      if (previousSourceTasks) {
        const taskToMove = previousSourceTasks.find((task) => task.id === variables.taskId)
        if (taskToMove) {
          queryClient.setQueryData<Task[]>(
            ['boards', variables.boardId, 'cards', variables.cardId, 'tasks'],
            previousSourceTasks.filter((task) => task.id !== variables.taskId)
          )

          if (variables.cardId !== variables.newCardId) {
            const updatedTask = { ...taskToMove, cardId: variables.newCardId }
            queryClient.setQueryData<Task[]>(
              ['boards', variables.boardId, 'cards', variables.newCardId, 'tasks'],
              [...(previousDestTasks || []), updatedTask]
            )
          } else {
            queryClient.setQueryData<Task[]>(
              ['boards', variables.boardId, 'cards', variables.cardId, 'tasks'],
              [...previousSourceTasks.filter((task) => task.id !== variables.taskId), taskToMove]
            )
          }
        }
      }

      return { previousSourceTasks, previousDestTasks }
    },
    onError: (_err, variables, context) => {
      if (context?.previousSourceTasks) {
        queryClient.setQueryData(
          ['boards', variables.boardId, 'cards', variables.cardId, 'tasks'],
          context.previousSourceTasks
        )
      }
      if (context?.previousDestTasks) {
        queryClient.setQueryData(
          ['boards', variables.boardId, 'cards', variables.newCardId, 'tasks'],
          context.previousDestTasks
        )
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boards', variables.boardId, 'cards'] })
    }
  })
}
