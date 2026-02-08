import Navbar from '@/components/layouts/Navbar'
import { useBoards } from '@/hooks/useBoards'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Link } from 'react-router'
import { Loader2, Kanban, Clock } from 'lucide-react'
import CreateBoardModal from '@/components/boards/CreateBoardModal'

export default function DashboardPage() {
  const { data: boards, isLoading } = useBoards()

  return (
    <div className='min-h-screen'>
      <Navbar />

      <main className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900'>Your Boards</h1>
            <p className='text-slate-500'>Manage your projects and collaborate with your team</p>
          </div>
          <CreateBoardModal />
        </div>

        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-20'>
            <Loader2 className='w-10 h-10 animate-spin text-primary mb-4' />
            <p className='text-slate-500 font-medium'>Loading...</p>
          </div>
        ) : boards && boards.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {boards.map((board) => (
              <Link key={board.id} to={`/boards/${board.id}`}>
                <Card className='hover:shadow-md transition-all cursor-pointer border-slate-200 group relative overflow-hidden'>
                  <div className='absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity' />
                  <CardHeader>
                    <div className='flex items-start justify-between mb-2'>
                      <div className='p-2 rounded-lg bg-primary/10 text-primary'>
                        <Kanban className='w-5 h-5' />
                      </div>
                      <div className='flex items-center gap-1 text-xs text-slate-400'>
                        <Clock className='w-3 h-3' />
                        <span>{new Date(board.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <CardTitle className='text-xl group-hover:text-primary transition-colors line-clamp-1'>
                      {board.name}
                    </CardTitle>
                    <CardDescription className='line-clamp-2 min-h-[40px]'>
                      {board.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200'>
            <div className='w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4'>
              <Kanban className='w-8 h-8 text-slate-300' />
            </div>
            <h3 className='text-xl font-semibold text-slate-900 mb-2'>No boards found</h3>
            <p className='text-slate-500 mb-6 max-w-xs text-center'>Create your first board to get started</p>
            <CreateBoardModal />
          </div>
        )}
      </main>
    </div>
  )
}
