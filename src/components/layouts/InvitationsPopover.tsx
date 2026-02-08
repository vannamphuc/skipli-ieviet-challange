import { Bell, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useInvitations, useHandleInvitation } from '@/hooks/useUsers'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function InvitationsPopover() {
  const { data: invitations, isLoading } = useInvitations()
  const handleMutation = useHandleInvitation()

  const handleAction = (inviteId: string, status: 'accepted' | 'declined') => {
    handleMutation.mutate(
      { inviteId, status },
      {
        onSuccess: () => {
          toast.success(`Invitation ${status}`)
        }
      }
    )
  }

  const pendingCount = invitations?.length || 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative h-10 w-10 rounded-full hover:bg-slate-100 transition-colors'
        >
          <Bell className='h-5 w-5 text-slate-600' />
          {pendingCount > 0 && (
            <Badge className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 border-2 border-white text-[10px] font-bold'>
              {pendingCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-80 p-0 shadow-2xl border-none overflow-hidden rounded-2xl'
        align='end'
        sideOffset={8}
      >
        <div className='bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between'>
          <h3 className='text-sm font-bold text-slate-900 uppercase tracking-wider'>Invitations</h3>
          <Badge variant='outline' className='text-[10px] bg-white'>
            {pendingCount} New
          </Badge>
        </div>
        <div className='max-h-[400px] overflow-y-auto bg-white'>
          {isLoading ? (
            <div className='flex justify-center p-10'>
              <Loader2 className='h-6 w-6 animate-spin text-slate-300' />
            </div>
          ) : pendingCount === 0 ? (
            <div className='p-10 text-center space-y-2'>
              <div className='w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto'>
                <Bell className='h-6 w-6 text-slate-200' />
              </div>
              <p className='text-xs text-slate-400 font-medium italic'>No pending invitations</p>
            </div>
          ) : (
            <div className='divide-y divide-slate-50'>
              {invitations?.map((invite) => (
                <div key={invite.id} className='p-4 hover:bg-slate-50/50 transition-colors space-y-3'>
                  <div className='flex flex-col'>
                    <p className='text-[13px] text-slate-700 leading-tight'>
                      You've been invited to join <span className='font-bold text-slate-900'>{invite.boardName}</span>
                    </p>
                    <span className='text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter'>
                      Pending your approval
                    </span>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      className='flex-1 h-8 bg-primary hover:bg-primary/90 text-xs font-bold rounded-lg shadow-sm'
                      onClick={() => handleAction(invite.id, 'accepted')}
                      disabled={handleMutation.isPending}
                    >
                      <Check className='h-3 w-3 mr-2' /> Accept
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='flex-1 h-8 text-xs font-bold text-slate-500 border-slate-200 rounded-lg hover:bg-slate-50'
                      onClick={() => handleAction(invite.id, 'declined')}
                      disabled={handleMutation.isPending}
                    >
                      <X className='h-3 w-3 mr-2' /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
