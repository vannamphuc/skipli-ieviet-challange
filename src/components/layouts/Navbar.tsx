import { useNavigate, Link } from 'react-router'
import { LogOut, Loader2, Search } from 'lucide-react'
import Cookies from 'js-cookie'
import InvitationsPopover from './InvitationsPopover'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface User {
  fullname: string
  email: string
  avatarUrl?: string
  createdAt: string
}

export default function Navbar() {
  const navigate = useNavigate()
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await apiClient.get<User>('/auth/me')
      return response.data
    }
  })

  const handleLogout = () => {
    Cookies.remove('accessToken')
    navigate('/', {
      replace: true
    })
  }

  return (
    <nav className='h-16 border-b border-border bg-muted backdrop-blur-md sticky top-0 z-50'>
      <div className='max-w-screen-2xl mx-auto h-full px-6 flex items-center justify-between'>
        <div className='flex items-center gap-10'>
          <Link to='/dashboard' className='text-xl font-black tracking-tighter'>
            Trello
          </Link>

          <div className='hidden items-center bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 group focus-within:ring-2 focus-within:ring-primary/20 transition-all'>
            <Search className='w-4 h-4 text-slate-400 mr-2' />
            <input
              placeholder='Search boards...'
              className='bg-transparent border-none outline-none text-sm w-48 placeholder:text-slate-400'
            />
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <InvitationsPopover />

          {isLoading ? (
            <Loader2 className='w-5 h-5 animate-spin text-slate-300' />
          ) : (
            <div className='flex items-center gap-3 pl-2'>
              <div className='flex flex-col items-end'>
                <span className='text-sm font-bold text-slate-800 leading-none'>{user?.fullname}</span>
              </div>
              <Avatar className='h-10 w-10 border-2 border-slate-100 shadow-sm'>
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className='bg-slate-50 text-slate-400 text-xs font-bold'>
                  {user?.fullname?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <Button
                variant='ghost'
                size='icon'
                onClick={handleLogout}
                className='h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors ml-2'
              >
                <LogOut className='w-5 h-5' />
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
