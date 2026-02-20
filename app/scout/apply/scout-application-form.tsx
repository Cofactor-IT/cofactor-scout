'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, ChevronDown, Check, X, Clock, Send } from 'lucide-react'
import { submitScoutApplication, sendScoutApplicationReminder } from '@/actions/scout.actions'

interface ScoutApplicationPageProps {
    user: {
        fullName: string
        email: string
        university: string | null
    } | null
    applicationStatus: {
        status: 'PENDING'
        applicationDate: Date
        lastReminderSent: Date | null
    } | null
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

export default function ScoutApplicationForm({ user, applicationStatus }: ScoutApplicationPageProps) {
    const router = useRouter()
    const [state, formAction] = useActionState(submitScoutApplication, undefined)
    const [linkedinUrl, setLinkedinUrl] = useState('')
    const [reminderState, setReminderState] = useState<{ loading: boolean; message?: string; error?: string }>({ loading: false })

    useEffect(() => {
        if (state?.success) {
            router.push('/scout/apply/submitted')
        }
    }, [state, router])

    const handleSendReminder = async () => {
        setReminderState({ loading: true })
        const result = await sendScoutApplicationReminder()
        
        if (result.error === 'APPLICATION_EXPIRED') {
            router.refresh()
        } else if (result.error) {
            setReminderState({ loading: false, error: result.error })
        } else {
            setReminderState({ loading: false, message: result.success })
            setTimeout(() => router.refresh(), 2000)
        }
    }

    const canSendReminder = () => {
        if (!applicationStatus?.lastReminderSent) return true
        const timeSinceLastReminder = Date.now() - new Date(applicationStatus.lastReminderSent).getTime()
        return timeSinceLastReminder >= ONE_WEEK_MS
    }

    const getDaysUntilNextReminder = () => {
        if (!applicationStatus?.lastReminderSent) return 0
        const timeSinceLastReminder = Date.now() - new Date(applicationStatus.lastReminderSent).getTime()
        return Math.ceil((ONE_WEEK_MS - timeSinceLastReminder) / (24 * 60 * 60 * 1000))
    }

    const getDaysSinceApplication = () => {
        if (!applicationStatus?.applicationDate) return 0
        return Math.floor((Date.now() - new Date(applicationStatus.applicationDate).getTime()) / (24 * 60 * 60 * 1000))
    }

    const isLoggedIn = !!user
    const isValidLinkedIn = !linkedinUrl || /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/.test(linkedinUrl)

    // Show pending status if application is pending
    if (applicationStatus?.status === 'PENDING') {
        return (
            <div className="min-h-screen bg-[#FAFBFC]">
                <div className="bg-[#FAFBFC] border-b border-[#E5E7EB] py-[32px]">
                    <div className="px-4 md:px-8 lg:px-[48px]">
                        <Link href="/dashboard" className="text-[14px] text-[#0D7377] hover:text-[#0a5a5d] mb-[16px] inline-block" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-[24px] md:text-[32px] lg:text-[36px] font-bold text-[#1B2A4A] mb-[12px]" style={{ fontFamily: 'var(--font-rethink-sans)', letterSpacing: '-0.18px' }}>
                            Scout Application Pending
                        </h1>
                    </div>
                </div>

                <div className="max-w-[900px] mx-auto px-4 md:px-8 lg:px-[48px] py-[48px]">
                    <div className="bg-white rounded-[4px] border border-[#E5E7EB] shadow-sm p-6 md:p-8 lg:p-[48px]">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                                <Clock className="text-[#F59E0B]" size={24} />
                            </div>
                            <div>
                                <h2 className="text-[24px] font-semibold text-[#1B2A4A] mb-2" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                                    Application Under Review
                                </h2>
                                <p className="text-[16px] text-[#6B7280] mb-4" style={{ fontFamily: 'var(--font-merriweather)' }}>
                                    Thank you for applying to become a Cofactor Scout! We've received your application and our team is reviewing it.
                                </p>
                                <div className="bg-[#FAFBFC] p-4 rounded-[4px] mb-6">
                                    <p className="text-[14px] text-[#6B7280]" style={{ fontFamily: 'var(--font-merriweather)' }}>
                                        <strong>Submitted:</strong> {new Date(applicationStatus.applicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} ({getDaysSinceApplication()} days ago)
                                    </p>
                                    {applicationStatus.lastReminderSent && (
                                        <p className="text-[14px] text-[#6B7280] mt-2" style={{ fontFamily: 'var(--font-merriweather)' }}>
                                            <strong>Last reminder sent:</strong> {new Date(applicationStatus.lastReminderSent).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    )}
                                </div>

                                {reminderState.message && (
                                    <div className="mb-4 p-3 bg-[#D1FAE5] border border-[#2D7D46] rounded-[4px] text-[#2D7D46] text-[14px]">
                                        {reminderState.message}
                                    </div>
                                )}

                                {reminderState.error && (
                                    <div className="mb-4 p-3 bg-[#FEE2E2] border border-[#EF4444] rounded-[4px] text-[#EF4444] text-[14px]">
                                        {reminderState.error}
                                    </div>
                                )}

                                <div className="border-t border-[#E5E7EB] pt-6 mt-6">
                                    <h3 className="text-[16px] font-semibold text-[#1B2A4A] mb-3" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                                        Need a status update?
                                    </h3>
                                    <p className="text-[14px] text-[#6B7280] mb-4" style={{ fontFamily: 'var(--font-merriweather)' }}>
                                        You can send a reminder to our team once per week. We typically respond within 3-5 business days.
                                    </p>
                                    <button
                                        onClick={handleSendReminder}
                                        disabled={!canSendReminder() || reminderState.loading}
                                        className="h-[48px] px-[32px] bg-[#0D7377] text-white rounded-full flex items-center gap-2 text-[16px] font-medium hover:bg-[#0a5a5d] disabled:bg-[#E5E7EB] disabled:text-[#6B7280] disabled:cursor-not-allowed transition-colors"
                                        style={{ fontFamily: 'var(--font-rethink-sans)' }}
                                    >
                                        <Send size={18} />
                                        {reminderState.loading ? 'Sending...' : canSendReminder() ? 'Send Reminder' : `Available in ${getDaysUntilNextReminder()} day${getDaysUntilNextReminder() > 1 ? 's' : ''}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FAFBFC]">
            {/* Page Header */}
            <div className="bg-[#FAFBFC] border-b border-[#E5E7EB] py-[32px]">
                <div className="px-4 md:px-8 lg:px-[48px]">
                    <Link href="/dashboard" className="text-[14px] text-[#0D7377] hover:text-[#0a5a5d] mb-[16px] inline-block" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-[24px] md:text-[32px] lg:text-[36px] font-bold text-[#1B2A4A] mb-[12px]" style={{ fontFamily: 'var(--font-rethink-sans)', letterSpacing: '-0.18px' }}>
                        Apply to Become a Scout
                    </h1>
                    <p className="text-[14px] md:text-[16px] text-[#6B7280]" style={{ fontFamily: 'var(--font-merriweather)' }}>
                        Scouts help us discover groundbreaking research and connect with innovative researchers. Share your background and tell us why you'd be a great fit.
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-[900px] mx-auto px-4 md:px-8 lg:px-[48px] py-[48px] pb-[120px]">
                {state?.error && (
                    <div className="mb-[24px] p-[12px] bg-[#FEE2E2] border border-[#EF4444] rounded-[4px] text-[#EF4444] text-[14px]">
                        {state.error}
                    </div>
                )}

                <form action={formAction} className="space-y-[32px]">
                    {/* Section 1: About You */}
                    <div className="bg-white rounded-[4px] border border-[#E5E7EB] shadow-sm p-6 md:p-8 lg:p-[48px]">
                        <h2 className="text-[24px] font-semibold text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                            About You
                        </h2>
                        <p className="text-[14px] text-[#6B7280] mb-[24px]" style={{ fontFamily: 'var(--font-merriweather)' }}>
                            Basic information about your academic background
                        </p>
                        <div className="border-t border-[#E5E7EB] mb-[24px]"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                            {/* Name - Locked */}
                            <div>
                                <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                                    Name <span className="text-[#EF4444]">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={user?.fullName || ''}
                                        readOnly={isLoggedIn}
                                        required
                                        placeholder="Enter your full name"
                                        className={`w-full h-[48px] px-[16px] ${isLoggedIn ? 'pr-[40px] bg-[#F9FAFB] cursor-not-allowed' : 'bg-white'} border-2 border-[#E5E7EB] rounded-[4px] text-[16px] ${isLoggedIn ? 'text-[#6B7280]' : 'text-[#1B2A4A]'} placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]`}
                                        style={{ fontFamily: 'var(--font-merriweather)' }}
                                    />
                                    {isLoggedIn && <Lock size={16} className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#6B7280]" />}
                                </div>
                            </div>

                            {/* Email - Locked */}
                            <div>
                                <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                                    Email <span className="text-[#EF4444]">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        defaultValue={user?.email || ''}
                                        readOnly={isLoggedIn}
                                        required
                                        placeholder="you@university.edu"
                                        className={`w-full h-[48px] px-[16px] ${isLoggedIn ? 'pr-[40px] bg-[#F9FAFB] cursor-not-allowed' : 'bg-white'} border-2 border-[#E5E7EB] rounded-[4px] text-[16px] ${isLoggedIn ? 'text-[#6B7280]' : 'text-[#1B2A4A]'} placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]`}
                                        style={{ fontFamily: 'var(--font-merriweather)' }}
                                    />
                                    {isLoggedIn && <Lock size={16} className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#6B7280]" />}
                                </div>
                            </div>

                            {/* University */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                                    University/Institute <span className="text-[#EF4444]">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="university"
                                    defaultValue={user?.university || ''}
                                    placeholder="e.g., Stanford University"
                                    required
                                    className="w-full h-[48px] px-[16px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[16px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]"
                                    style={{ fontFamily: 'var(--font-merriweather)' }}
                                />
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                                    Department/Lab <span className="text-[#EF4444]">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="department"
                                    placeholder="e.g., Computer Science"
                                    required
                                    className="w-full h-[48px] px-[16px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[16px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]"
                                    style={{ fontFamily: 'var(--font-merriweather)' }}
                                />
                            </div>

                            {/* LinkedIn */}
                            <div>
                                <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                                    LinkedIn
                                </label>
                                <input
                                    type="url"
                                    name="linkedinUrl"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    placeholder="https://linkedin.com/in/..."
                                    className="w-full h-[48px] px-[16px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[16px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]"
                                    style={{ fontFamily: 'var(--font-merriweather)' }}
                                />
                                {linkedinUrl && (
                                    <div className="mt-[8px] flex items-center gap-[8px] text-[14px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                                        {isValidLinkedIn ? (
                                            <>
                                                <Check size={16} className="text-[#2D7D46]" />
                                                <span className="text-[#2D7D46]">Valid LinkedIn URL</span>
                                            </>
                                        ) : (
                                            <>
                                                <X size={16} className="text-[#EF4444]" />
                                                <span className="text-[#EF4444]">Enter a valid LinkedIn URL</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-[12px] text-[#6B7280] mt-[16px]" style={{ fontFamily: 'var(--font-merriweather)', fontStyle: 'italic' }}>
                            {isLoggedIn ? 'Name and email are locked from your account settings' : 'Sign in to auto-fill your name and email'}
                        </p>
                    </div>

                    {/* Section 2: Your Background */}
                    <div className="bg-white rounded-[4px] border border-[#E5E7EB] shadow-sm p-6 md:p-8 lg:p-[48px]">
                        <h2 className="text-[24px] font-semibold text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                            Your Background
                        </h2>
                        <p className="text-[14px] text-[#6B7280] mb-[24px]" style={{ fontFamily: 'var(--font-merriweather)' }}>
                            Tell us about your experience and why you want to be a scout
                        </p>
                        <div className="border-t border-[#E5E7EB] mb-[24px]"></div>

                        <div className="space-y-[24px]">
                            {/* Role */}
                            <div>
                                <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                                    Your Role <span className="text-[#EF4444]">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        name="userRole"
                                        required
                                        className="w-full h-[48px] px-[16px] pr-[40px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[16px] text-[#1B2A4A] focus:outline-none focus:border-[#0D7377] appearance-none"
                                        style={{ fontFamily: 'var(--font-merriweather)' }}
                                    >
                                        <option value="">Select your role</option>
                                        <option value="PHD_STUDENT">PhD Student</option>
                                        <option value="POSTDOC">Postdoc</option>
                                        <option value="PROFESSOR">Professor</option>
                                        <option value="INDUSTRY_RESEARCHER">Industry Researcher</option>
                                        <option value="INDEPENDENT_RESEARCHER">Independent Researcher</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                    <ChevronDown size={20} className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                                </div>
                            </div>

                            {/* Research Areas */}
                            <div>
                                <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                                    Research Areas <span className="text-[#EF4444]">*</span>
                                </label>
                                <textarea
                                    name="researchAreas"
                                    placeholder="e.g., Machine Learning, Computational Biology, Quantum Computing"
                                    required
                                    rows={3}
                                    className="w-full px-[16px] py-[12px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[16px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377] resize-none"
                                    style={{ fontFamily: 'var(--font-merriweather)' }}
                                />
                                <p className="text-[12px] text-[#6B7280] mt-[8px]" style={{ fontFamily: 'var(--font-merriweather)', fontStyle: 'italic' }}>
                                    List your main areas of research interest
                                </p>
                            </div>

                            {/* Why Scout */}
                            <div>
                                <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                                    Why do you want to be a Scout? <span className="text-[#EF4444]">*</span>
                                </label>
                                <textarea
                                    name="whyScout"
                                    placeholder="Tell us what motivates you to become a scout..."
                                    required
                                    rows={4}
                                    className="w-full px-[16px] py-[12px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[16px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377] resize-none"
                                    style={{ fontFamily: 'var(--font-merriweather)' }}
                                />
                            </div>

                            {/* How Source Leads */}
                            <div>
                                <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                                    How will you source leads? <span className="text-[#EF4444]">*</span>
                                </label>
                                <textarea
                                    name="howSourceLeads"
                                    placeholder="Describe your approach to finding and vetting research leads..."
                                    required
                                    rows={4}
                                    className="w-full px-[16px] py-[12px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[16px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377] resize-none"
                                    style={{ fontFamily: 'var(--font-merriweather)' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-[#E5E7EB] shadow-md px-4 md:px-8 lg:px-[48px] py-[16px] flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 z-10">
                        {isLoggedIn ? (
                            <Link
                                href="/dashboard"
                                className="w-full md:w-auto h-[48px] px-[32px] bg-white border-2 border-[#1B2A4A] text-[#1B2A4A] rounded-full flex items-center justify-center text-[16px] font-medium hover:bg-[#F9FAFB] transition-colors"
                                style={{ fontFamily: 'var(--font-rethink-sans)' }}
                            >
                                Cancel
                            </Link>
                        ) : (
                            <Link
                                href="/auth/signin"
                                className="w-full md:w-auto h-[48px] px-[32px] bg-white border-2 border-[#1B2A4A] text-[#1B2A4A] rounded-full flex items-center justify-center text-[16px] font-medium hover:bg-[#F9FAFB] transition-colors"
                                style={{ fontFamily: 'var(--font-rethink-sans)' }}
                            >
                                Sign In
                            </Link>
                        )}
                        <button
                            type="submit"
                            className="w-full md:w-auto h-[56px] px-[48px] bg-[#0D7377] text-white rounded-full flex items-center justify-center text-[18px] font-medium hover:bg-[#0a5a5d] shadow-md transition-colors"
                            style={{ fontFamily: 'var(--font-rethink-sans)', boxShadow: '0px 2px 4px rgba(13,115,119,0.2)' }}
                        >
                            Submit Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
