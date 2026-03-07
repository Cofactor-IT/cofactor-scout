'use client'

import { useActionState, useEffect, useRef, useState, type DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, ChevronDown, Check, X, Clock, Send } from 'lucide-react'
import { submitScoutApplication, sendScoutApplicationReminder } from '@/actions/scout.actions'
import { Button } from '@/components/ui/button'

interface ScoutApplicationPageProps {
    user: {
        fullName: string
        email: string
        university: string | null
    } | null
    applicationStatus: {
        status: 'PENDING'
        applicationDate: Date
    } | null
}

export default function ScoutApplicationForm({ user, applicationStatus }: ScoutApplicationPageProps) {
    const router = useRouter()
    const [state, formAction] = useActionState(submitScoutApplication, undefined)
    const [linkedinUrl, setLinkedinUrl] = useState('')
    const [userRole, setUserRole] = useState('')
    const [resumeFileName, setResumeFileName] = useState('')
    const [coverLetterFileName, setCoverLetterFileName] = useState('')
    const [resumeDragActive, setResumeDragActive] = useState(false)
    const [coverLetterDragActive, setCoverLetterDragActive] = useState(false)
    const [reminderState, setReminderState] = useState<{ loading: boolean; message?: string; error?: string }>({ loading: false })
    const resumeInputRef = useRef<HTMLInputElement>(null)
    const coverLetterInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (state?.success === 'REDIRECT_TO_SIGNUP') {
            // Encode application data and redirect to signup
            const data = encodeURIComponent(JSON.stringify(state.data))
            router.push(`/auth/signup?scoutApp=${data}`)
        } else if (state?.success) {
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

    const setDroppedFile = (input: HTMLInputElement | null, file: File) => {
        if (!input) return
        const transfer = new DataTransfer()
        transfer.items.add(file)
        input.files = transfer.files
    }

    const handleResumeDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        setResumeDragActive(false)
        const file = event.dataTransfer.files?.[0]
        if (!file) return
        setDroppedFile(resumeInputRef.current, file)
        setResumeFileName(file.name)
    }

    const handleCoverLetterDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        setCoverLetterDragActive(false)
        const file = event.dataTransfer.files?.[0]
        if (!file) return
        setDroppedFile(coverLetterInputRef.current, file)
        setCoverLetterFileName(file.name)
    }

    const getDaysSinceApplication = () => {
        if (!applicationStatus?.applicationDate) return 0
        return Math.floor((new Date().getTime() - new Date(applicationStatus.applicationDate).getTime()) / (24 * 60 * 60 * 1000))
    }

    const isLoggedIn = !!user
    const isValidLinkedIn = !linkedinUrl || /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/.test(linkedinUrl)
    const [email, setEmail] = useState(user?.email || '')
    const [name, setName] = useState(user?.fullName || '')
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const isValidName = name.trim().length >= 2

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
                                    Thank you for applying to become a Cofactor Scout! We have received your application and our team is reviewing it.
                                </p>
                                <div className="bg-[#FAFBFC] p-4 rounded-[4px] mb-6">
                                    <p className="text-[14px] text-[#6B7280]" style={{ fontFamily: 'var(--font-merriweather)' }}>
                                        <strong>Submitted:</strong> {new Date(applicationStatus.applicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} ({getDaysSinceApplication()} days ago)
                                    </p>
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
                                    <Button
                                        onClick={handleSendReminder}
                                        className="h-[48px] px-[32px] gap-2 text-[16px] disabled:bg-[#E5E7EB] disabled:text-[#6B7280] disabled:cursor-not-allowed"
                                        disabled={reminderState.loading}
                                    >
                                        <Send size={18} />
                                        {reminderState.loading ? 'Sending...' : 'Send Reminder'}
                                    </Button>
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
                        Scouts help us discover groundbreaking research and connect with innovative researchers. Share your background and tell us why you would be a great fit.
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-[900px] mx-auto px-4 md:px-8 lg:px-[48px] py-[48px] pb-[220px] md:pb-[160px]">
                {state?.error && (
                    <div className="mb-[24px] p-[12px] bg-[#FEE2E2] border border-[#EF4444] rounded-[4px] text-[#EF4444] text-[14px]">
                        {state.error}
                    </div>
                )}

                <form action={formAction} className="space-y-[32px]" encType="multipart/form-data">
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
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        readOnly={isLoggedIn}
                                        required
                                        placeholder="Enter your full name"
                                        className={`w-full h-[48px] px-[16px] ${isLoggedIn ? 'pr-[40px] bg-[#F9FAFB] cursor-not-allowed' : 'bg-white'} border-2 border-[#E5E7EB] rounded-[4px] text-[16px] ${isLoggedIn ? 'text-[#6B7280]' : 'text-[#1B2A4A]'} placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]`}
                                        style={{ fontFamily: 'var(--font-merriweather)' }}
                                    />
                                    {isLoggedIn && <Lock size={16} className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#6B7280]" />}
                                </div>
                                {!isLoggedIn && name && (
                                    <div className="mt-[8px] flex items-center gap-[8px] text-[14px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                                        {isValidName ? (
                                            <>
                                                <Check size={16} className="text-[#2D7D46]" />
                                                <span className="text-[#2D7D46]">Valid name</span>
                                            </>
                                        ) : (
                                            <>
                                                <X size={16} className="text-[#EF4444]" />
                                                <span className="text-[#EF4444]">Name must be at least 2 characters</span>
                                            </>
                                        )}
                                    </div>
                                )}
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        readOnly={isLoggedIn}
                                        required
                                        placeholder="you@university.edu"
                                        className={`w-full h-[48px] px-[16px] ${isLoggedIn ? 'pr-[40px] bg-[#F9FAFB] cursor-not-allowed' : 'bg-white'} border-2 border-[#E5E7EB] rounded-[4px] text-[16px] ${isLoggedIn ? 'text-[#6B7280]' : 'text-[#1B2A4A]'} placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]`}
                                        style={{ fontFamily: 'var(--font-merriweather)' }}
                                    />
                                    {isLoggedIn && <Lock size={16} className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#6B7280]" />}
                                </div>
                                {!isLoggedIn && email && (
                                    <div className="mt-[8px] flex items-center gap-[8px] text-[14px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                                        {isValidEmail ? (
                                            <>
                                                <Check size={16} className="text-[#2D7D46]" />
                                                <span className="text-[#2D7D46]">Valid email</span>
                                            </>
                                        ) : (
                                            <>
                                                <X size={16} className="text-[#EF4444]" />
                                                <span className="text-[#EF4444]">Enter a valid email</span>
                                            </>
                                        )}
                                    </div>
                                )}
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
                                        value={userRole}
                                        onChange={(e) => setUserRole(e.target.value)}
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
                                {userRole === 'OTHER' && (
                                    <input
                                        type="text"
                                        name="userRoleOther"
                                        placeholder="Please specify your role"
                                        required
                                        className="w-full h-[48px] px-[16px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[16px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377] mt-[8px]"
                                        style={{ fontFamily: 'var(--font-merriweather)' }}
                                    />
                                )}
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

                    {/* Section 3: Documents */}
                    <div className="bg-white rounded-[4px] border border-[#E5E7EB] shadow-sm p-6 md:p-8 lg:p-[48px]">
                        <h2 className="text-[24px] font-semibold text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                            Application Documents
                        </h2>
                        <p className="text-[14px] text-[#6B7280] mb-[24px]" style={{ fontFamily: 'var(--font-merriweather)' }}>
                            Upload your resume and an optional cover letter (PDF, DOC, or DOCX, max 5MB each)
                        </p>
                        <div className="border-t border-[#E5E7EB] mb-[24px]"></div>

                        <div className="space-y-[24px]">
                            <div>
                                <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                                    Resume <span className="text-[#EF4444]">*</span>
                                </label>
                                <div
                                    onDragOver={(event) => {
                                        event.preventDefault()
                                        setResumeDragActive(true)
                                    }}
                                    onDragLeave={() => setResumeDragActive(false)}
                                    onDrop={handleResumeDrop}
                                    className={`rounded-[4px] border-2 border-dashed p-6 transition-colors ${resumeDragActive ? 'border-[#0D7377] bg-[#ECFEFF]' : 'border-[#E5E7EB] bg-[#FAFBFC]'}`}
                                >
                                    <input
                                        ref={resumeInputRef}
                                        type="file"
                                        name="resume"
                                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        required
                                        onChange={(event) => setResumeFileName(event.target.files?.[0]?.name || '')}
                                        className="hidden"
                                    />
                                    <p className="text-[14px] text-[#6B7280] text-center mb-4" style={{ fontFamily: 'var(--font-merriweather)' }}>
                                        Drag and drop your resume here
                                    </p>
                                    <div className="flex justify-center">
                                        <Button
                                            type="button"
                                            className="h-[44px] px-[24px] text-[14px]"
                                            onClick={() => resumeInputRef.current?.click()}
                                        >
                                            Choose Resume File
                                        </Button>
                                    </div>
                                </div>
                                {resumeFileName && (
                                    <p className="text-[12px] text-[#6B7280] mt-[8px]" style={{ fontFamily: 'var(--font-merriweather)' }}>
                                        Selected: {resumeFileName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                                    Cover Letter <span className="text-[#6B7280] font-normal">(Optional)</span>
                                </label>
                                <div
                                    onDragOver={(event) => {
                                        event.preventDefault()
                                        setCoverLetterDragActive(true)
                                    }}
                                    onDragLeave={() => setCoverLetterDragActive(false)}
                                    onDrop={handleCoverLetterDrop}
                                    className={`rounded-[4px] border-2 border-dashed p-6 transition-colors ${coverLetterDragActive ? 'border-[#1B2A4A] bg-[#F1F5F9]' : 'border-[#E5E7EB] bg-[#FAFBFC]'}`}
                                >
                                    <input
                                        ref={coverLetterInputRef}
                                        type="file"
                                        name="coverLetter"
                                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        onChange={(event) => setCoverLetterFileName(event.target.files?.[0]?.name || '')}
                                        className="hidden"
                                    />
                                    <p className="text-[14px] text-[#6B7280] text-center mb-4" style={{ fontFamily: 'var(--font-merriweather)' }}>
                                        Drag and drop your cover letter here
                                    </p>
                                    <div className="flex justify-center">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="h-[44px] px-[24px] text-[14px]"
                                            onClick={() => coverLetterInputRef.current?.click()}
                                        >
                                            Choose Cover Letter
                                        </Button>
                                    </div>
                                </div>
                                {coverLetterFileName && (
                                    <p className="text-[12px] text-[#6B7280] mt-[8px]" style={{ fontFamily: 'var(--font-merriweather)' }}>
                                        Selected: {coverLetterFileName}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-[#E5E7EB] shadow-md px-4 md:px-8 lg:px-[48px] py-[16px] flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 z-10">
                        {isLoggedIn ? (
                            <Link
                                href="/dashboard"
                                className="button w-full md:w-auto h-[48px] px-[32px] bg-white border-2 border-[#1B2A4A] text-[#1B2A4A] rounded-full flex items-center justify-center text-[16px] font-medium hover:bg-[#F9FAFB] transition-colors"
                                style={{ fontFamily: 'var(--font-rethink-sans)' }}
                            >
                                Cancel
                            </Link>
                        ) : (
                            <Link
                                href="/auth/signin"
                                className="button w-full md:w-auto h-[48px] px-[32px] bg-white border-2 border-[#1B2A4A] text-[#1B2A4A] rounded-full flex items-center justify-center text-[16px] font-medium hover:bg-[#F9FAFB] transition-colors"
                                style={{ fontFamily: 'var(--font-rethink-sans)' }}
                            >
                                Sign In
                            </Link>
                        )}
                        <Button
                            type="submit"
                            className="w-full md:w-auto h-[56px] px-[48px] text-[18px]"
                        >
                            Submit Application
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
