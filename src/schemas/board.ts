import z from 'zod'

export const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(50, 'Board name is too long'),
  description: z.string().max(200, 'Description is too long').optional()
})

export type CreateBoardSchemaType = z.infer<typeof createBoardSchema>
