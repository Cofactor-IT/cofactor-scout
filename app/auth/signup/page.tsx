"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signUp } from "@/actions/auth.actions"
import { Navbar } from "@/components/shared/Navbar" // Assuming Navbar is shared/exportable

// Validation Schema
const signupSchema = z.object({
    name: z.string().min(2, "Full name is required").refine((val) => val.trim().includes(' '), {
        message: "Please enter your first and last name"
    }),
    email: z.string().email("Please enter a valid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
    const [serverError, setServerError] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    })

    const onSubmit = async (data: SignupFormValues) => {
        setIsLoading(true)
        setServerError(null)

        const formData = new FormData()
        formData.append("name", data.name)
        formData.append("email", data.email)
        formData.append("password", data.password)

        try {
            // Call server action
            const result = await signUp(undefined, formData)

            if (result?.error) {
                setServerError(result.error)
                // Optional: Map specific server errors to fields if possible
            } 
            // If success, the action handles redirect
        } catch (err) {
            setServerError("An unexpected error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FAFBFC] font-heading">
            {/* Navbar Override/Placement */}
            <div className="h-[80px] bg-white border-b border-light-gray px-[120px] flex items-center justify-between">
                <Link href="/" className="flex items-center gap-0">
                    <span className="font-heading font-bold text-[24px] text-navy">Cofactor</span>
                    <span className="font-heading font-bold text-[24px] text-teal">Scout</span>
                </Link>
                <Link href="/auth/signin">
                    <Button variant="primary" className="w-[120px]">Sign In</Button>
                </Link>
            </div>

            <div className="flex justify-center pt-[80px] pb-20">
                <main className="w-[560px] bg-white border border-[#E5E7EB] rounded-sharp shadow-card p-12">
                    {/* Error Banner */}
                    {serverError && (
                        <div className="bg-[#FEE2E2] border-2 border-[#EF4444] rounded-sharp p-4 flex gap-3 items-start mb-6">
                            <AlertCircle className="text-[#EF4444] shrink-0" size={20} />
                            <p className="text-[#EF4444] text-[14px] font-medium leading-tight">
                                {serverError}
                            </p>
                        </div>
                    )}

                    <div className="mb-8 text-center">
                        <h1 className="font-heading font-bold text-[36px] text-navy mb-2">
                            Create Account
                        </h1>
                        <p className="font-body font-normal text-[16px] text-cool-gray">
                            Join the community of research scouts
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        {/* Full Name */}
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            helperText={errors.name?.message || "We'll use this to create your profile"}
                            error={!!errors.name}
                            {...register("name")}
                        />

                        {/* Email */}
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@university.edu"
                            helperText={errors.email?.message || "Use your university email if possible"}
                            error={!!errors.email}
                            {...register("email")}
                        />

                        {/* Password */}
                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                helperText={errors.password?.message || "At least 8 characters with uppercase, lowercase, number, and special character"}
                                error={!!errors.password}
                                {...register("password")}
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-[40px] text-cool-gray hover:text-navy transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <Input
                                label="Confirm Password"
                                type={showConfirmPassword ? "text" : "password"}
                                helperText={errors.confirmPassword?.message}
                                error={!!errors.confirmPassword}
                                {...register("confirmPassword")}
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-[40px] text-cool-gray hover:text-navy transition-colors"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full mt-2"
                            isLoading={isLoading}
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>

                        {/* Login Link */}
                        <div className="text-center mt-2">
                            <p className="font-heading text-[14px] text-cool-gray">
                                Already have an account?{" "}
                                <Link
                                    href="/auth/signin"
                                    className="text-teal font-medium hover:underline decoration-teal underline-offset-2"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    )
}
