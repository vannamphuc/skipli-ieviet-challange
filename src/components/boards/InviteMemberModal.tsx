import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUserSearch, useInviteMember } from '@/hooks/useUsers'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, UserPlus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'

interface InviteMemberModalProps {
  boardId: string
  isOpen: boolean
  onClose: () => void
}

export default function InviteMemberModal({ boardId, isOpen, onClose }: InviteMemberModalProps) {
  const [query, setQuery] = useState('')
  const { data: searchResults, isLoading: isSearching } = useUserSearch(query)
  const inviteMutation = useInviteMember()

  const handleInvite = (userId: string, email: string) => {
    inviteMutation.mutate(
      { boardId, memberId: userId, email_member: email },
      {
        onSuccess: () => {
          toast.success(`Invitation sent to ${email}`)
          onClose()
        },
        onError: (error) => {
          if (isAxiosError(error)) {
            toast.error(error.response?.data?.message || 'Failed to send invitation')
          }
        }
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <UserPlus className='w-5 h-5' /> Invite Member
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6 pt-4'>
          <div className='space-y-2'>
            <Label htmlFor='search'>Find people by name or email</Label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                id='search'
                placeholder='Type a name or email address...'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className='pl-10'
                autoFocus
              />
            </div>
          </div>

          <div className='space-y-2 max-h-60 overflow-y-auto pr-1'>
            {isSearching ? (
              <div className='flex justify-center py-10'>
                <Loader2 className='w-6 h-6 animate-spin' />
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user.id}
                  className='flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-all group'
                >
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-10 w-10'>
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.fullname?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                      <span className='text-sm font-semibold'>{user.fullname}</span>
                      <span className='text-xs text-muted-foreground'>{user.email}</span>
                    </div>
                  </div>
                  <Button
                    size='sm'
                    className='opacity-0 group-hover:opacity-100'
                    onClick={() => handleInvite(user.id, user.email)}
                    disabled={inviteMutation.isPending}
                  >
                    {inviteMutation.isPending ? <Loader2 className='animate-spin w-4 h-4' /> : 'Invite'}
                  </Button>
                </div>
              ))
            ) : query.length >= 2 ? (
              <div className='text-center py-10'>
                <p className='text-sm text-muted-foreground italic'>No users found matching "{query}"</p>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
