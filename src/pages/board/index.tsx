import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useBoard } from '@/hooks/useBoards'
import { useCards, useCreateCard, useMoveTask } from '@/hooks/useCardsAndTasks'
import Navbar from '@/components/layouts/Navbar'
import BoardColumn from '@/components/boards/BoardColumn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, ArrowLeft, X, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useSocket } from '@/contexts/SocketContext'
import { useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import InviteMemberModal from '@/components/boards/InviteMemberModal'
import { useUsersByIds } from '@/hooks/useUsers'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function BoardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { socket } = useSocket()

  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const { data: board, isLoading: isBoardLoading } = useBoard(id!)
  const { data: cards } = useCards(id!)
  const createCardMutation = useCreateCard()
  const moveTaskMutation = useMoveTask()

  const { data: members } = useUsersByIds(board?.members || [])

  useEffect(() => {
    if (socket && id) {
      socket.emit('join-board', id)

      const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ['boards', id] })
        queryClient.invalidateQueries({ queryKey: ['boards', id, 'cards'] })
      }

      socket.on('refresh-board', refresh)
      return () => {
        socket.off('refresh-board', refresh)
      }
    }
  }, [socket, id, queryClient])

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColumnName.trim()) return

    createCardMutation.mutate(
      { boardId: id!, name: newColumnName.trim() },
      {
        onSuccess: () => {
          setNewColumnName('')
          setIsAddingColumn(false)
          toast.success('Column added')
          if (socket) socket.emit('board-updated', id)
        }
      }
    )
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source, type } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    if (type === 'card') {
      toast.info('Column reordering coming soon')
      return
    }

    if (type === 'task') {
      const sourceCardId = source.droppableId
      const destCardId = destination.droppableId
      const taskId = result.draggableId

      moveTaskMutation.mutate(
        {
          boardId: id!,
          cardId: sourceCardId,
          taskId,
          newCardId: destCardId
        },
        {
          onSuccess: () => {
            if (socket) socket.emit('board-updated', id)
          },
          onError: () => {
            toast.error('Failed to move task. Please try again.')
          }
        }
      )
    }
  }

  if (isBoardLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-muted/90 flex flex-col overflow-hidden'>
      <Navbar />

      <div className='bg-background border-b px-6 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-6'>
          <Button variant='outline' size='sm' onClick={() => navigate('/dashboard')}>
            <ArrowLeft className='w-4 h-4 mr-2' /> All Boards
          </Button>
          <div className='flex flex-col'>
            <h1 className='text-xl font-black text-slate-900 tracking-tight leading-none'>{board?.name}</h1>
            <p className='text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1'>
              {board?.description || 'No description'}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <div className='flex -space-x-2'>
            {members?.map((member) => (
              <Avatar key={member.id} className='h-8 w-8 border-2 border-white ring-1 ring-slate-100 shadow-sm'>
                <AvatarImage src={member.avatarUrl} />
                <AvatarFallback className='bg-slate-100 text-[10px] font-bold'>
                  {member?.fullname?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>

          <Button
            size='sm'
            className='transition-all hover:scale-105 active:scale-95'
            onClick={() => setIsInviteOpen(true)}
          >
            <UserPlus className='w-4 h-4 mr-2' /> Invite
          </Button>
        </div>
      </div>

      <div className='flex-1 overflow-x-auto p-6 flex items-start gap-4 h-full bg-background'>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId='board' direction='horizontal' type='card'>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className='flex gap-4'>
                {cards?.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <BoardColumn boardId={id!} cardId={card.id} cardName={card.name} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {isAddingColumn ? (
          <form onSubmit={handleAddColumn} className='w-80 shrink-0 bg-muted/50 p-3 rounded-lg border-2 border-dashed'>
            <Input
              autoFocus
              placeholder='Enter list title...'
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              className='bg-white border-none shadow-sm h-10 mb-2'
            />
            <div className='flex gap-2'>
              <Button type='submit' size='sm' className='bg-blue-600 hover:bg-blue-700'>
                Add List
              </Button>
              <Button variant='ghost' size='sm' onClick={() => setIsAddingColumn(false)}>
                <X className='w-4 h-4' />
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant='secondary'
            className='w-80 shrink-0 h-12 border-2 border-dashed text-muted-foreground font-semibold'
            onClick={() => setIsAddingColumn(true)}
          >
            <Plus className='w-4 h-4 mr-2' /> Add another list
          </Button>
        )}
      </div>

      <InviteMemberModal boardId={id!} isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </div>
  )
}
