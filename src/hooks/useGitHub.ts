/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export interface GitHubRepoInfo {
  pullRequests: any[]
  commits: any[]
  issues: any[]
}

export function useGitHubRepo(owner: string, repo: string) {
  return useQuery<GitHubRepoInfo>({
    queryKey: ['github', owner, repo],
    queryFn: async () => {
      const response = await apiClient.get<GitHubRepoInfo>(`/github/repo?owner=${owner}&repo=${repo}`)
      return response.data
    },
    enabled: !!owner && !!repo,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

export function useAttachGitHub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      boardId: string
      cardId: string
      taskId: string
      type: 'pr' | 'commit' | 'issue'
      item: any
    }) => {
      const payload = {
        type: data.type,
        data: {
          id: data.item.id || data.item.sha,
          url: data.item.html_url || data.item.url,
          title: data.item.title || data.item.commit?.message || data.item.sha,
          number: data.item.number
        }
      }
      const response = await apiClient.post(`/github/${data.boardId}/${data.cardId}/${data.taskId}/attach`, payload)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId] })
    }
  })
}

export function useRemoveGitHub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { boardId: string; cardId: string; taskId: string; attachmentId: string }) => {
      const response = await apiClient.post(`/github/${data.boardId}/${data.cardId}/${data.taskId}/remove`, {
        attachmentId: data.attachmentId
      })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId] })
    }
  })
}
