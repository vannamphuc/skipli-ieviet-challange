import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateBoard } from '@/hooks/useBoards'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createBoardSchema, type CreateBoardSchemaType } from '@/schemas/board'
import { isAxiosError } from 'axios'

export default function CreateBoardModal() {
  const [isOpen, setIsOpen] = useState(false)
  const createBoardMutation = useCreateBoard()

  const form = useForm<CreateBoardSchemaType>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  })

  const onSubmit = (data: CreateBoardSchemaType) => {
    createBoardMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Board created successfully!')
        form.reset()
        setIsOpen(false)
      },
      onError: (error) => {
        if (isAxiosError(error)) {
          toast.error(error.response?.data?.message || 'Failed to create board')
        }
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className='flex items-center gap-2 font-bold transition-all hover:scale-105 active:scale-95'>
          <Plus className='w-4 h-4' />
          New Board
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px] rounded-3xl border-none shadow-2xl'>
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
          <DialogDescription>
            Create a new space to organize your tasks and collaborate with your team.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 pt-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Board Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Design System 2024' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='What is this workspace about?'
                      className='min-h-[120px] max-h-[200px] transition-all p-4'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className='pt-4'>
              <Button type='button' variant='destructive' onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type='submit' disabled={createBoardMutation.isPending}>
                {createBoardMutation.isPending ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
