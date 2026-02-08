import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Clock,
  Github,
  Trash2,
  Loader2,
  Save,
  Search,
  PlusCircle,
  User,
  CalendarIcon,
  GitPullRequest,
  GitCommit,
  AlertCircle,
  X,
  ExternalLink
} from 'lucide-react'
import type { Task } from '@/hooks/useCardsAndTasks'
import { useUpdateTask, useAssignMember, useRemoveMember, useTask } from '@/hooks/useCardsAndTasks'
import { useUsersByIds, useUserSearch } from '@/hooks/useUsers'
import { useGitHubRepo, useAttachGitHub, useRemoveGitHub } from '@/hooks/useGitHub'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useSocket } from '@/contexts/SocketContext'
import { cn } from '@/lib/utils'

interface TaskDetailModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
}

type GitHubTab = 'prs' | 'commits' | 'issues'

export default function TaskDetailModal({ task, isOpen, onClose }: TaskDetailModalProps) {
  const { socket } = useSocket()
  const updateTaskMutation = useUpdateTask()
  const assignMemberMutation = useAssignMember()
  const removeMemberMutation = useRemoveMember()
  const attachGitHubMutation = useAttachGitHub()
  const removeGitHubMutation = useRemoveGitHub()

  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [priority, setPriority] = useState(task.priority)
  const [deadline, setDeadline] = useState<Date | undefined>(task.deadline ? new Date(task.deadline) : undefined)
  const [isEditing, setIsEditing] = useState(false)
  const [userQuery, setUserQuery] = useState('')
  const [ghRepo, setGhRepo] = useState({ owner: '', repo: '' })
  const [ghInput, setGhInput] = useState('')
  const [activeGHTab, setActiveGHTab] = useState<GitHubTab>('prs')

  const { data: liveTask } = useTask(task.boardId, task.cardId, task.id)
  const currentTask = liveTask || task

  const { data: assignedUsers } = useUsersByIds(currentTask.assignedMembers || [])
  const { data: searchResults } = useUserSearch(userQuery)
  const { data: githubInfo, isLoading: isLoadingGH, error: githubError } = useGitHubRepo(ghRepo.owner, ghRepo.repo)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(currentTask.title)
    setDescription(currentTask.description)
    setPriority(currentTask.priority)
    setDeadline(currentTask.deadline ? new Date(currentTask.deadline) : undefined)
  }, [currentTask])

  useEffect(() => {
    if (githubError) {
      toast.error('Failed to load GitHub repository data')
    }
  }, [githubError])

  const handleUpdate = () => {
    updateTaskMutation.mutate(
      {
        boardId: currentTask.boardId,
        cardId: currentTask.cardId,
        taskId: currentTask.id,
        payload: {
          title,
          description,
          priority,
          deadline: deadline?.toISOString()
        }
      },
      {
        onSuccess: () => {
          setIsEditing(false)
          toast.success('Task updated successfully')
          if (socket) socket.emit('board-updated', currentTask.boardId)
        },
        onError: () => {
          toast.error('Failed to update task')
        }
      }
    )
  }

  const handleGHSearch = () => {
    const parts = ghInput.trim().replace('.git', '').split('/')
    if (parts.length >= 2) {
      setGhRepo({ owner: parts[parts.length - 2], repo: parts[parts.length - 1] })
    } else {
      toast.error("Invalid format. Use 'owner/repo' or paste GitHub URL")
    }
  }

  const handleAttachGH = (type: 'pr' | 'commit' | 'issue', item: unknown) => {
    attachGitHubMutation.mutate(
      {
        boardId: currentTask.boardId,
        cardId: currentTask.cardId,
        taskId: currentTask.id,
        type,
        item
      },
      {
        onSuccess: () => {
          toast.success(`${type.toUpperCase()} attached successfully`)
          if (socket) socket.emit('board-updated', currentTask.boardId)
        },
        onError: () => {
          toast.error('Failed to attach')
        }
      }
    )
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const renderGitHubContent = () => {
    if (!githubInfo) return null

    const tabs = [
      { key: 'prs' as GitHubTab, label: 'Pull Requests', icon: GitPullRequest, count: githubInfo.pullRequests.length },
      { key: 'commits' as GitHubTab, label: 'Commits', icon: GitCommit, count: githubInfo.commits.length },
      { key: 'issues' as GitHubTab, label: 'Issues', icon: AlertCircle, count: githubInfo.issues.length }
    ]

    return (
      <div className='space-y-3'>
        <div className='flex gap-1 border rounded-lg p-1 bg-muted/50'>
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveGHTab(key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all',
                activeGHTab === key
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              <Icon className='w-3.5 h-3.5' />
              <span className='hidden sm:inline'>{label}</span>
              <Badge variant='secondary' className='h-5 text-[10px] px-1.5'>
                {count}
              </Badge>
            </button>
          ))}
        </div>

        <div className='bg-muted/30 rounded-lg border p-3 max-h-[300px] overflow-y-auto space-y-1.5'>
          {activeGHTab === 'prs' &&
            githubInfo.pullRequests.map((pr) => (
              <button
                key={pr.id}
                onClick={() => handleAttachGH('pr', pr)}
                className='w-full text-left p-3 rounded-md border border-transparent bg-background/50 hover:bg-background hover:border-border transition-all flex items-start gap-3 group'
              >
                <GitPullRequest className='w-4 h-4 text-green-600 mt-0.5 shrink-0' />
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='text-xs font-semibold text-muted-foreground'>#{pr.number}</span>
                  </div>
                  <p className='text-sm font-medium truncate'>{pr.title}</p>
                </div>
                <PlusCircle className='w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1' />
              </button>
            ))}

          {activeGHTab === 'commits' &&
            githubInfo.commits.map((c) => (
              <button
                key={c.sha}
                onClick={() => handleAttachGH('commit', c)}
                className='w-full text-left p-3 rounded-md border border-transparent bg-background/50 hover:bg-background hover:border-border transition-all flex items-start gap-3 group'
              >
                <GitCommit className='w-4 h-4 text-purple-600 mt-0.5 shrink-0' />
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    <code className='text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded'>
                      {c.sha?.substring(0, 7)}
                    </code>
                  </div>
                  <p className='text-sm font-medium truncate'>{c.commit.message}</p>
                </div>
                <PlusCircle className='w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1' />
              </button>
            ))}

          {activeGHTab === 'issues' &&
            githubInfo.issues.map((i) => (
              <button
                key={i.id}
                onClick={() => handleAttachGH('issue', i)}
                className='w-full text-left p-3 rounded-md border border-transparent bg-background/50 hover:bg-background hover:border-border transition-all flex items-start gap-3 group'
              >
                <AlertCircle className='w-4 h-4 text-orange-600 mt-0.5 shrink-0' />
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='text-xs font-semibold text-muted-foreground'>#{i.number}</span>
                  </div>
                  <p className='text-sm font-medium truncate'>{i.title}</p>
                </div>
                <PlusCircle className='w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1' />
              </button>
            ))}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl max-h-[95vh] overflow-hidden flex flex-col p-0'>
        {/* Header */}
        <DialogHeader className='px-6 pt-6 pb-4 border-b space-y-3'>
          <div className='flex items-start justify-between gap-4 mt-4'>
            <div className='flex-1 space-y-2'>
              {isEditing ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className='text-lg font-semibold h-10'
                  autoFocus
                />
              ) : (
                <DialogTitle className='text-xl leading-tight'>{currentTask.title}</DialogTitle>
              )}

              <div className='flex items-center gap-3 flex-wrap'>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <span>in</span>
                  <Badge variant='secondary' className='font-mono text-[10px]'>
                    {currentTask.cardId}
                  </Badge>
                </div>

                {isEditing ? (
                  <Select
                    value={priority}
                    onValueChange={(value) => {
                      setPriority(value as Task['priority'])
                    }}
                  >
                    <SelectTrigger className='w-fit h-6 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='low'>Low Priority</SelectItem>
                      <SelectItem value='medium'>Medium Priority</SelectItem>
                      <SelectItem value='high'>High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={getPriorityColor(priority)} className='text-xs'>
                    {priority.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>

            {!isEditing && (
              <Button variant='outline' size='sm' onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className='flex-1 overflow-y-auto px-6 py-4'>
          <div className='space-y-6'>
            {/* Description */}
            <section className='space-y-3'>
              <Label className='text-sm font-semibold flex items-center gap-2'>
                <span>Description</span>
              </Label>
              {isEditing ? (
                <Textarea
                  className='min-h-[120px] text-sm resize-none'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Add a detailed description...'
                />
              ) : (
                <div className='text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-4 border'>
                  {currentTask.description || 'No description provided.'}
                </div>
              )}
            </section>

            <Separator />

            {/* Members & Due Date Row */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Members */}
              <section className='space-y-3'>
                <Label className='text-sm font-semibold flex items-center gap-2'>
                  <User className='w-4 h-4' />
                  Members
                </Label>
                <div className='flex flex-wrap gap-2'>
                  {assignedUsers?.map((user) => (
                    <Popover key={user.id}>
                      <PopoverTrigger>
                        <Avatar className='w-9 h-9 cursor-pointer border-2 border-background hover:border-primary transition-colors'>
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback className='text-xs font-semibold'>
                            {user.fullname?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </PopoverTrigger>
                      <PopoverContent className='w-56 p-3' side='top'>
                        <div className='space-y-3'>
                          <div className='flex items-center gap-3'>
                            <Avatar className='w-10 h-10'>
                              <AvatarImage src={user.avatarUrl} />
                              <AvatarFallback>{user.fullname?.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm font-semibold truncate'>{user.fullname}</p>
                              <p className='text-xs text-muted-foreground truncate'>{user.email}</p>
                            </div>
                          </div>
                          <Button
                            variant='destructive'
                            size='sm'
                            className='w-full'
                            onClick={() =>
                              removeMemberMutation.mutate(
                                {
                                  boardId: currentTask.boardId,
                                  cardId: currentTask.cardId,
                                  taskId: currentTask.id,
                                  memberId: user.id
                                },
                                {
                                  onSuccess: () => {
                                    toast.success('Member removed')
                                    if (socket) socket.emit('board-updated', currentTask.boardId)
                                  }
                                }
                              )
                            }
                          >
                            Remove from task
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ))}

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        size='icon'
                        className='w-9 h-9 rounded-full border-dashed hover:border-solid'
                      >
                        <PlusCircle className='w-4 h-4' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-72 p-3' side='bottom' align='start'>
                      <div className='space-y-3'>
                        <div className='relative'>
                          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                          <Input
                            placeholder='Search by email...'
                            value={userQuery}
                            onChange={(e) => setUserQuery(e.target.value)}
                            className='pl-9 h-9'
                          />
                        </div>
                        <div className='max-h-64 overflow-y-auto space-y-1'>
                          {searchResults?.map((user) => (
                            <button
                              key={user.id}
                              className='w-full flex items-center gap-3 p-2.5 hover:bg-muted rounded-md transition-colors text-left'
                              onClick={() =>
                                assignMemberMutation.mutate(
                                  {
                                    boardId: currentTask.boardId,
                                    cardId: currentTask.cardId,
                                    taskId: currentTask.id,
                                    memberId: user.id
                                  },
                                  {
                                    onSuccess: () => {
                                      toast.success('Member assigned')
                                      if (socket) socket.emit('board-updated', currentTask.boardId)
                                    }
                                  }
                                )
                              }
                            >
                              <Avatar className='w-8 h-8'>
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback className='text-xs'>{user.fullname?.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium truncate'>{user.fullname}</p>
                                <p className='text-xs text-muted-foreground truncate'>{user.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </section>

              {/* Due Date */}
              <section className='space-y-3'>
                <Label className='text-sm font-semibold flex items-center gap-2'>
                  <Clock className='w-4 h-4' />
                  Due Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal h-10',
                        !deadline && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {deadline ? format(deadline, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar mode='single' selected={deadline} onSelect={setDeadline} autoFocus />
                  </PopoverContent>
                </Popover>
              </section>
            </div>

            <Separator />

            {/* GitHub Context */}
            <section className='space-y-3'>
              <Label className='text-sm font-semibold flex items-center gap-2'>
                <Github className='w-4 h-4' />
                GitHub Context
              </Label>

              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <Github className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <Input
                    placeholder='owner/repo or GitHub URL'
                    value={ghInput}
                    onChange={(e) => setGhInput(e.target.value)}
                    className='pl-9'
                    onKeyDown={(e) => e.key === 'Enter' && handleGHSearch()}
                  />
                </div>
                <Button onClick={handleGHSearch} disabled={isLoadingGH} size='icon'>
                  {isLoadingGH ? <Loader2 className='w-4 h-4 animate-spin' /> : <Search className='w-4 h-4' />}
                </Button>
              </div>

              {renderGitHubContent()}

              {/* Attached Items */}
              {currentTask.githubAttachments && currentTask.githubAttachments.length > 0 && (
                <div className='space-y-2 pt-2'>
                  <span className='text-xs font-semibold text-muted-foreground uppercase'>
                    Attached ({currentTask.githubAttachments.length})
                  </span>
                  <div className='space-y-1.5'>
                    {currentTask.githubAttachments.map((att) => (
                      <div
                        key={att.id || att.sha}
                        className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg border group hover:border-border transition-colors'
                      >
                        <div className='flex items-center gap-3 flex-1 min-w-0'>
                          <div className='w-8 h-8 rounded-md bg-background border flex items-center justify-center shrink-0'>
                            {att.type === 'pr' && <GitPullRequest className='w-4 h-4 text-green-600' />}
                            {att.type === 'commit' && <GitCommit className='w-4 h-4 text-purple-600' />}
                            {att.type === 'issue' && <AlertCircle className='w-4 h-4 text-orange-600' />}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <span className='text-[10px] font-bold text-muted-foreground uppercase block mb-0.5'>
                              {att.type}
                            </span>
                            <a
                              href={att.url}
                              target='_blank'
                              rel='noreferrer'
                              className='text-sm font-medium hover:underline truncate flex items-center gap-1.5 group/link'
                            >
                              <span className='truncate'>{att.title}</span>
                              <ExternalLink className='w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0' />
                            </a>
                          </div>
                        </div>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'
                          onClick={() =>
                            removeGitHubMutation.mutate({
                              boardId: currentTask.boardId,
                              cardId: currentTask.cardId,
                              taskId: currentTask.id,
                              attachmentId: att.id || (att.sha as string)
                            })
                          }
                        >
                          <X className='w-4 h-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Footer Actions */}
        <div className='border-t px-6 py-4 bg-muted/30'>
          <div className='flex items-center justify-between gap-3'>
            <Button
              variant='ghost'
              className='text-destructive hover:text-destructive hover:bg-destructive/10'
              onClick={() => toast.error('Delete coming soon')}
            >
              <Trash2 className='w-4 h-4 mr-2' />
              Delete Task
            </Button>

            {isEditing ? (
              <div className='flex gap-2'>
                <Button variant='ghost' onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={updateTaskMutation.isPending}>
                  {updateTaskMutation.isPending ? (
                    <Loader2 className='w-4 h-4 animate-spin mr-2' />
                  ) : (
                    <Save className='w-4 h-4 mr-2' />
                  )}
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button variant='outline' onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
