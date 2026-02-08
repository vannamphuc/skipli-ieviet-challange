import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader } from 'lucide-react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { useMutation } from '@tanstack/react-query'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signupSchema, otpSchema } from '@/schemas/auth'
import type { SignupSchemaType, OtpSchemaType } from '@/schemas/auth'
import { useNavigate } from 'react-router'
import { apiClient } from '@/lib/axios'

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate()
  const [step, setStep] = useState<'info' | 'otp'>('info')
  const [email, setEmail] = useState('')

  const signupForm = useForm<SignupSchemaType>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullname: '',
      email: ''
    }
  })

  const otpForm = useForm<OtpSchemaType>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: ''
    }
  })

  const sendOtpMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiClient.post('/auth/send-otp', { email: data.email })
      return response.data
    },
    onSuccess: (_, variables) => {
      setEmail(variables.email)
      setStep('otp')
      toast.success('Verification code sent to your email')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to send verification code')
    }
  })

  const verifyOtpMutation = useMutation<{ accessToken: string }, Error, OtpSchemaType>({
    mutationFn: async (data: OtpSchemaType) => {
      const response = await apiClient.post<{ accessToken: string }>('/auth/verify-otp', {
        email,
        verificationCode: data.code,
        fullname: signupForm.getValues('fullname')
      })
      return response.data
    },
    onSuccess: (data: { accessToken: string }) => {
      Cookies.set('accessToken', data.accessToken, { expires: 7 })
      toast.success('Registration successful!')
      navigate('/dashboard')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Invalid verification code')
    }
  })

  const onSignupSubmit = (data: SignupSchemaType) => {
    sendOtpMutation.mutate(data)
  }

  const onOtpSubmit = (data: OtpSchemaType) => {
    verifyOtpMutation.mutate(data)
  }

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/github`
  }

  const isLoading = sendOtpMutation.isPending || verifyOtpMutation.isPending

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='border-border/50 shadow-sm'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-semibold tracking-tight'>
            {step === 'info' ? 'Create an account' : 'Confirm your email'}
          </CardTitle>
          <CardDescription>
            {step === 'info' ? 'Enter your details below to create your account' : `Enter the code we sent to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'info' ? (
            <div className='grid gap-6'>
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className='space-y-4' noValidate>
                  <FormField
                    control={signupForm.control}
                    name='fullname'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder='John Doe' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder='name@example.com' type='email' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type='submit' className='w-full' disabled={isLoading}>
                    {isLoading && <Loader className='mr-2 h-4 w-4 animate-spin' />}
                    Create Account
                  </Button>
                </form>
              </Form>

              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-card px-2 text-muted-foreground'>Or continue with</span>
                </div>
              </div>

              <Button
                variant='outline'
                type='button'
                className='w-full'
                disabled={isLoading}
                onClick={handleGithubLogin}
              >
                <svg role='img' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                  <title>GitHub</title>
                  <path d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' />
                </svg>
                GitHub
              </Button>
            </div>
          ) : (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className='space-y-4' noValidate>
                <FormField
                  control={otpForm.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem className='flex flex-col items-center justify-center gap-4'>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup className='gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border'>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type='submit' className='w-full' disabled={isLoading}>
                  {isLoading && <Loader className='mr-2 h-4 w-4 animate-spin' />}
                  Verify & Register
                </Button>
                <Button
                  variant='ghost'
                  type='button'
                  className='w-full text-xs'
                  onClick={() => setStep('info')}
                  disabled={isLoading}
                >
                  Edit information
                </Button>
                <div className='text-center text-sm text-muted-foreground mt-2'>
                  Didn&apos;t receive the code?{' '}
                  <button
                    type='button'
                    className='underline underline-offset-4 hover:text-primary transition-colors disabled:opacity-50'
                    onClick={() => {
                      sendOtpMutation.mutate({ email })
                    }}
                    disabled={isLoading}
                  >
                    Resend
                  </button>
                </div>
              </form>
            </Form>
          )}

          <p className='px-8 text-center text-sm text-muted-foreground mt-6'>
            Already have an account?{' '}
            <Button variant='link' className='px-0' onClick={() => navigate('/')}>
              Sign in
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
