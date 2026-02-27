/**
 * Step 1 Form Component
 * 
 * First step of research submission form.
 * Collects research summary and researcher information with auto-save draft functionality.
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProgressStepper } from '@/components/submission/ProgressStepper'
import { FormInput } from '@/components/submission/FormInput'
import { FormTextarea } from '@/components/submission/FormTextarea'
import { FormFooter } from '@/components/submission/FormFooter'
import { saveDraft, getDraft, deleteDraft } from '@/actions/submission.actions'

export function Step1Form() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get('draft')

  const [formData, setFormData] = useState({
    researchTopic: '',
    researchDescription: '',
    researcherName: '',
    researcherEmail: '',
    researcherInstitution: '',
    researcherDepartment: ''
  })

  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [saveError, setSaveError] = useState('')

  const validateEmail = (email: string) => {
    if (!email) return ''
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) ? '' : 'Invalid email address'
  }

  // Load existing draft data if draft ID provided
  useEffect(() => {
    if (draftId) {
      getDraft(draftId).then((result) => {
        if (result.success && result.draft) {
          setFormData({
            researchTopic: result.draft.researchTopic || '',
            researchDescription: result.draft.researchDescription || '',
            researcherName: result.draft.researcherName || '',
            researcherEmail: result.draft.researcherEmail || '',
            researcherInstitution: result.draft.researcherInstitution || '',
            researcherDepartment: result.draft.researcherDepartment || ''
          })
        }
      })
    }
  }, [draftId])

  const isValid = formData.researchTopic && formData.researchDescription && 
                  formData.researcherName && formData.researcherEmail && 
                  formData.researcherInstitution

  const hasAnyData = formData.researchTopic || formData.researchDescription || 
                    formData.researcherName || formData.researcherEmail || 
                    formData.researcherInstitution || formData.researcherDepartment

  const handleSaveDraft = async () => {
    setLoading(true)
    setSaveError('')
    const result = await saveDraft({ id: draftId, ...formData })
    if (result.success) {
      router.push('/dashboard/drafts')
    } else if (result.error) {
      setSaveError(result.error)
    }
    setLoading(false)
  }

  const handleCancel = async () => {
    if (draftId) {
      setLoading(true)
      await deleteDraft(draftId)
      setLoading(false)
    }
    router.push('/dashboard')
  }

  const handleNext = async () => {
    setLoading(true)
    setSaveError('')
    const result = await saveDraft({ id: draftId, ...formData })
    if (result.success) {
      router.push(`/dashboard/submit/details?draft=${result.id}`)
    } else if (result.error) {
      setSaveError(result.error)
    }
    setLoading(false)
  }

  return (
    <>
      <div className="pt-[140px] pb-[120px] px-4 md:px-8 lg:px-[120px]">
        <div className="max-w-[1440px] mx-auto">
          <ProgressStepper
            currentStep={1}
            draftId={draftId}
            steps={[
              { number: 1, label: 'Research Summary' },
              { number: 2, label: 'Additional Details' },
              { number: 3, label: 'Review & Submit' }
            ]}
          />

          <div className="w-full max-w-[900px] mx-auto bg-white border border-[#E5E7EB] rounded-[4px] shadow-sm p-6 md:p-8 lg:p-[48px]">
            {saveError && (
              <div className="mb-[24px] p-[12px] bg-[#FEE2E2] border border-[#EF4444] rounded-[4px] text-[#EF4444] text-[14px]">
                {saveError}
              </div>
            )}
            <div className="mb-[40px]">
              <h2 className="text-[24px] font-semibold text-[#1B2A4A] mb-[8px]">
                Research Summary
              </h2>
              <p className="text-[14px] font-serif text-[#6B7280]">
                Provide a brief overview of the research and researcher
              </p>
            </div>

            <div className="flex flex-col gap-[24px]">
              <FormInput
                label="Research Topic"
                name="researchTopic"
                value={formData.researchTopic}
                onChange={(value) => setFormData({ ...formData, researchTopic: value })}
                required
                helperText="Max 100 characters"
                placeholder="e.g., Novel CRISPR gene editing technique"
              />

              <FormTextarea
                label="Research Description"
                name="researchDescription"
                value={formData.researchDescription}
                onChange={(value) => setFormData({ ...formData, researchDescription: value })}
                required
                helperText="200-1000 characters"
                placeholder="Describe the research, its significance, and potential impact..."
                rows={8}
              />
            </div>

            <div className="h-[1px] bg-[#E5E7EB] my-[40px]" />

            <div className="mb-[40px]">
              <h2 className="text-[24px] font-semibold text-[#1B2A4A]">
                Researcher Information
              </h2>
            </div>

            <div className="flex flex-col gap-[24px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] md:gap-[32px]">
                <FormInput
                  label="Researcher Name"
                  name="researcherName"
                  value={formData.researcherName}
                  onChange={(value) => setFormData({ ...formData, researcherName: value })}
                  required
                  placeholder="Dr. Jane Smith"
                />
                <FormInput
                  label="Researcher Email"
                  name="researcherEmail"
                  value={formData.researcherEmail}
                  onChange={(value) => {
                    setFormData({ ...formData, researcherEmail: value })
                    setEmailError(validateEmail(value))
                  }}
                  required
                  type="email"
                  placeholder="jane.smith@university.edu"
                  error={emailError}
                />
              </div>

              <FormInput
                label="Institution"
                name="researcherInstitution"
                value={formData.researcherInstitution}
                onChange={(value) => setFormData({ ...formData, researcherInstitution: value })}
                required
                placeholder="Stanford University"
              />

              <FormInput
                label="Department/Lab"
                name="researcherDepartment"
                value={formData.researcherDepartment}
                onChange={(value) => setFormData({ ...formData, researcherDepartment: value })}
                placeholder="Department of Bioengineering"
              />
            </div>
          </div>
        </div>
      </div>

      <FormFooter
        draftId={draftId}
        onSaveDraft={handleSaveDraft}
        onNext={handleNext}
        onCancel={handleCancel}
        nextLabel="Next: Additional Details →"
        nextDisabled={false}
        loading={loading}
      />
    </>
  )
}
