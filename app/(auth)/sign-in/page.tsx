"use client";

import FooterLink from "@/components/forms/FooterLink";
import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import { signInWithEmail } from "@/lib/actions/auth.actions";
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SignInPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  })

  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await signInWithEmail(data)

      if (result.success) {
        router.push('/')
      } else {
        toast.error('Failed to sign in.', {
          description: result.error || 'Please check your credentials and try again.'
        })
      }
    } catch (error) {
      console.error(error)
      toast.error('An unexpected error occurred.', {
        description: error instanceof Error ? error.message : 'Please try again later'
      })
    }
  }

  return (
    <>
      <h1 className="form-title">Welcome Back</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="email"
          label="Email"
          placeholder="contact@stocket.com"
          register={register}
          error={errors.email}
          validation={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          }}
        />

        <InputField
          name="password"
          label="Password"
          placeholder="Enter your password"
          type="password"
          register={register}
          error={errors.password}
          validation={{
            required: 'Password is required',
          }}
        />

        <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>

        <FooterLink 
          href="/sign-up"
          text="Don't have an account?"
          linkText="Create an account"
        />
      </form>
    </>
  )
}

export default SignInPage