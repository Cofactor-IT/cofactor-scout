"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, AlertCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertBanner } from "@/components/ui/alert-banner"

// Validation Schema
const signinSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
})

type SigninFormValues = z.infer<typeof signinSchema>

export default function SigninPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const message = searchParams.get("message")
    const errorParam = searchParams.get("error")

    const [loginError, setLoginError] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)

    // Check if verification message is present
    const isVerificationMessage = message === "verify-email" || message?.includes("verify your account")

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm<SigninFormValues>({
        resolver: zodResolver(signinSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const onSubmit = async (data: SigninFormValues) => {
        setIsLoading(true)
        setLoginError(null)

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
            })

            if (result?.error) {
                // Clear password on failure
                setValue("password", "")
                
                if (result.error === "CredentialsSignin") {
                    setLoginError("Invalid email or password. Please try again.")
                } else if (result.error.includes("locked")) {
                     setLoginError("Too many failed login attempts. Your account has been locked for 15 minutes.")
                } else {
                    setLoginError("An error occurred during sign in. Please try again.")
                }
            } else {
                router.push("/dashboard")
            }
        } catch (err) {
             setLoginError("An unexpected error occurred. Please try again.")
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
                <Link href="/auth/signup">
                    <Button variant="primary" className="w-[120px]">Sign Up</Button>
                </Link>
            </div>

            <div className="flex justify-center pt-[160px] pb-20">
                <main className="w-[560px] bg-white border border-[#E5E7EB] rounded-sharp shadow-card p-12">
                    
                    {/* Verification Banner */}
                    {isVerificationMessage && (
                        <div className="bg-[#DBEAFE] border-2 border-[#1E40AF] rounded-sharp p-4 flex gap-3 items-start mb-6">
                             <AlertCircle className="text-[#1E40AF] shrink-0" size={20} />
                             <div className="flex flex-col gap-1">
                                <p className="text-[#1E40AF] text-[14px] font-medium leading-tight">
                                    Please verify your email address before signing in. Check your inbox for a verification link.
                                </p>
                                {/* Placeholder for resend - strictly styled link for now */}
                                <button className="text-teal text-[14px] font-medium underline decoration-teal hover:text-teal-dark text-left w-fit">
                                    Resend verification email
                                </button>
                             </div>
                        </div>
                    )}

                    {/* Error Banner */}
                    {(loginError || errorParam) && (
                        <div className={`rounded-sharp p-4 flex gap-3 items-start mb-6 border-2 ${
                            loginError?.includes("locked") 
                            ? "bg-[#FEF3C7] border-[#F59E0B]" 
                            : "bg-[#FEE2E2] border-[#EF4444]"
                        }`}>
                            {loginError?.includes("locked") ? (
                                <AlertTriangle className="text-[#F59E0B] shrink-0" size={20} />
                            ) : (
                                <AlertCircle className="text-[#EF4444] shrink-0" size={20} />
                            )}
                            <p className={`${
                                loginError?.includes("locked") ? "text-[#F59E0B]" : "text-[#EF4444]"
                            } text-[14px] font-medium leading-tight`}>
                                {loginError || "An error occurred during authentication."}
                            </p>
                        </div>
                    )}

                    <div className="mb-8 text-center">
                        <h1 className="font-heading font-bold text-[36px] text-navy mb-2">
                            Welcome Back
                        </h1>
                        <p className="font-body font-normal text-[16px] text-cool-gray">
                           Sign in to access your dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        {/* Email */}
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@university.edu"
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            {...register("email")}
                        />

                        {/* Password */}
                        <div className="relative">
                            <div className="flex justify-between items-baseline mb-1.5">
                                <label className="font-heading font-medium text-[14px] text-navy">
                                    Password
                                </label>
                                <Link 
                                    href="/auth/forgot-password"
                                    className="font-heading text-[12px] text-teal font-medium hover:underline decoration-teal"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                            
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    error={!!errors.password}
                                    {...register("password")}
                                    className="pr-10" // Space for eye icon
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-cool-gray hover:text-navy transition-colors transform"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                             {errors.password && (
                                <p className="font-heading text-[12px] mt-1 text-red">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full mt-2"
                            isLoading={isLoading}
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                        </Button>

                        {/* Register Link */}
                        <div className="text-center mt-2">
                             <p className="font-heading text-[14px] text-cool-gray">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/auth/signup"
                                    className="text-teal font-medium hover:underline decoration-teal underline-offset-2"
                                >
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    )
}
