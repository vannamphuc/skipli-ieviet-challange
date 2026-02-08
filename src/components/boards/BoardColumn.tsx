import React, { useState } from 'react'
import { useTasks, useCreateTask } from '@/hooks/useCardsAndTasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, MoreVertical, Github, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useSocket } from '@/contexts/SocketContext'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import TaskDetailModal from './TaskDetailModal'
import type { Task } from '@/hooks/useCardsAndTasks'

interface BoardColumnProps {
  boardId: string
  cardId: string
  cardName: string
}

export default function BoardColumn({ boardId, cardId, cardName }: BoardColumnProps) {
  const { data: tasks, isLoading } = useTasks(boardId, cardId)
  const createTaskMutation = useCreateTask()
  const { socket } = useSocket()

  const [isAddingTask, setIsAddingTask] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) return

    createTaskMutation.mutate(
      {
        boardId,
        cardId,
        title: taskTitle.trim()
      },
      {
        onSuccess: () => {
          setTaskTitle('')
          setIsAddingTask(false)
          toast.success('Task added')
          if (socket) socket.emit('board-updated', boardId)
        },
        onError: () => {
          toast.error('Failed to add task')
        }
      }
    )
  }

  return (
    <>
      <div className='w-80 shrink-0 flex flex-col bg-muted/50 rounded-lg max-h-full border'>
        <div className='p-3 flex items-center justify-between'>
          <h3 className='font-semibold text-xs uppercase tracking-wider'>{cardName}</h3>
          <Button variant='ghost' size='icon' className='h-8 w-8'>
            <MoreVertical className='w-4 h-4' />
          </Button>
        </div>

        <Droppable droppableId={cardId} type='task'>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`flex-1 overflow-y-auto px-2 pb-2 space-y-2 transition-colors ${
                snapshot.isDraggingOver ? 'bg-muted/80' : ''
              }`}
            >
              {isLoading ? (
                <div className='flex justify-center py-4'>
                  <Loader2 className='w-5 h-5 animate-spin text-slate-300' />
                </div>
              ) : (
                tasks?.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => setSelectedTask(task)}
                        className={`bg-card p-3 rounded-md border group ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                      >
                        <div className='flex items-start justify-between gap-2'>
                          <h4 className='text-sm font-medium text-slate-900 mb-1 flex-1'>{task.title}</h4>
                        </div>
                        {task.description && (
                          <p className='text-xs text-slate-500 line-clamp-2 mt-1'>{task.description}</p>
                        )}

                        <div className='flex items-center gap-3 mt-3'>
                          <div className='flex items-center gap-1.5'>
                            {task.priority === 'high' && <div className='w-2 h-2 rounded-full bg-destructive' />}
                            {task.priority === 'medium' && <div className='w-2 h-2 rounded-full bg-yellow-500' />}
                            {task.priority === 'low' && <div className='w-2 h-2 rounded-full bg-green-500' />}
                            <span className='text-[10px] uppercase font-bold text-muted-foreground'>
                              {task.priority}
                            </span>
                          </div>

                          {task.githubAttachments && task.githubAttachments.length > 0 && (
                            <div className='flex items-center gap-1 text-slate-400'>
                              <Github className='w-3 h-3' />
                              <span className='text-[10px] font-bold'>{task.githubAttachments.length}</span>
                            </div>
                          )}

                          {task.assignedMembers && task.assignedMembers.length > 0 && (
                            <div className='flex items-center gap-1 text-slate-400'>
                              <Users className='w-3 h-3' />
                              <span className='text-[10px] font-bold'>{task.assignedMembers.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <div className='p-2'>
          {isAddingTask ? (
            <form
              onSubmit={handleAddTask}
              className='bg-white p-2 rounded-lg shadow-sm border border-slate-200 space-y-2'
            >
              <Input
                autoFocus
                placeholder='What needs to be done?'
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className='text-sm h-9'
              />
              <div className='flex gap-2'>
                <Button type='submit' size='sm' disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending && <Loader2 className='w-3 h-3 mr-1 animate-spin' />}
                  Add Task
                </Button>
                <Button type='button' variant='ghost' size='sm' onClick={() => setIsAddingTask(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button
              variant='ghost'
              className='w-full justify-start text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              onClick={() => setIsAddingTask(true)}
            >
              <Plus className='w-4 h-4 mr-2' />
              Add a task
            </Button>
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal task={selectedTask} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </>
  )
}
