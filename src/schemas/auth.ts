import z from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address')
})

export type LoginSchemaType = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  fullname: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address')
})

export type SignupSchemaType = z.infer<typeof signupSchema>

export const otpSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits')
})

export type OtpSchemaType = z.infer<typeof otpSchema>
