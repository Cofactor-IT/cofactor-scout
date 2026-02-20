'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardNavbar } from '@/components/dashboard-navbar'
import { ProgressStepper } from '@/components/submission/ProgressStepper'
import { FormTextarea } from '@/components/submission/FormTextarea'
import { ReviewCard } from '@/components/submission/ReviewCard'
import { FormFooter } from '@/components/submission/FormFooter'
import { submitResearch, getDraft, deleteDraft } from '@/actions/submission.actions'

export default function ReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get('draft')

  const [whyInteresting, setWhyInteresting] = useState('')
  const [draft, setDraft] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/user').then(res => res.json()).then(data => setUser(data))
  }, [])

  useEffect(() => {
    if (draftId) {
      getDraft(draftId).then((result) => {
        if (result.success && result.draft) {
          setDraft(result.draft)
          setWhyInteresting(result.draft.whyInteresting || '')
        }
      })
    }
  }, [draftId])

  const isValid = whyInteresting.length >= 50 && whyInteresting.length <= 500

  const handleSaveDraft = async () => {
    if (!draftId) return
    
    setLoading(true)
    const { saveDraft } = await import('@/actions/submission.actions')
    await saveDraft({ id: draftId, whyInteresting })
    setLoading(false)
    router.push('/dashboard/drafts')
  }

  const handleCancel = async () => {
    if (draftId) {
      setLoading(true)
      await deleteDraft(draftId)
      setLoading(false)
    }
    router.push('/dashboard')
  }

  const handleSubmit = async () => {
    if (!isValid || !draftId) return
    
    setLoading(true)
    const result = await submitResearch({ id: draftId, whyInteresting })
    if (result.success) {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  if (!draft) return null

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <DashboardNavbar 
        displayName={user?.fullName || 'User'}
        role={user?.role === 'SCOUT' ? 'Verified Scout' : 'Community Contributor'}
        initials={user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U'}
        activePage="submissions"
      />

      <div className="pt-[140px] pb-[120px] px-4 md:px-8 lg:px-[120px]">
        <div className="max-w-[1440px] mx-auto">
          <ProgressStepper
            currentStep={3}
            draftId={draftId}
            steps={[
              { number: 1, label: 'Research Summary' },
              { number: 2, label: 'Additional Details' },
              { number: 3, label: 'Review & Submit' }
            ]}
          />

          <div className="w-full max-w-[900px] mx-auto bg-white border border-[#E5E7EB] rounded-[4px] shadow-sm p-6 md:p-8 lg:p-[48px]">
            <div className="mb-[40px]">
              <h2 className="text-[24px] font-semibold text-[#1B2A4A] mb-[8px]">
                Your Scout Pitch
              </h2>
              <p className="text-[14px] font-serif text-[#6B7280]">
                Why should Cofactor care about this research?
              </p>
            </div>

            <FormTextarea
              label="Why is this interesting to investors?"
              name="whyInteresting"
              value={whyInteresting}
              onChange={setWhyInteresting}
              required
              helperText={`${whyInteresting.length}/500 characters`}
              placeholder="Explain the commercial potential, market opportunity, or why this research could lead to a successful startup..."
              rows={8}
            />

            <div className="h-[1px] bg-[#E5E7EB] my-[40px]" />

            <div className="mb-[40px]">
              <h2 className="text-[24px] font-semibold text-[#1B2A4A] mb-[8px]">
                Review Your Submission
              </h2>
              <p className="text-[14px] font-serif text-[#6B7280]">
                Please review the information below before submitting
              </p>
            </div>

            <div className="flex flex-col gap-[24px]">
              <ReviewCard
                title="Research Summary"
                editLink={`/dashboard/submit?draft=${draftId}`}
                fields={[
                  { label: 'Research Topic', value: draft.researchTopic },
                  { label: 'Research Description', value: draft.researchDescription },
                  { label: 'Researcher Name', value: draft.researcherName },
                  { label: 'Researcher Email', value: draft.researcherEmail },
                  { label: 'Institution', value: draft.researcherInstitution },
                  { label: 'Department/Lab', value: draft.researcherDepartment }
                ]}
              />

              <ReviewCard
                title="Additional Details"
                editLink={`/dashboard/submit/details?draft=${draftId}`}
                fields={[
                  { label: 'Career Stage', value: draft.researcherCareerStage?.replace(/_/g, ' ') },
                  { label: 'Funding Status', value: draft.fundingStatus?.replace(/_/g, ' ') },
                  { label: 'Research Stage', value: draft.researchStage?.replace(/_/g, ' ') },
                  { label: 'LinkedIn', value: draft.researcherLinkedin },
                  { label: 'Key Publications', value: draft.keyPublications },
                  { label: 'Potential Applications', value: draft.potentialApplications },
                  { label: 'Source', value: draft.submissionSource?.replace(/_/g, ' ') },
                  { label: 'Relationship', value: draft.relationshipToResearcher?.replace(/_/g, ' ') },
                  { label: 'Researcher Aware', value: draft.researcherAwareness ? 'Yes' : 'No' }
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <FormFooter
        draftId={draftId}
        onSaveDraft={handleSaveDraft}
        onNext={handleSubmit}
        onCancel={handleCancel}
        nextLabel="Submit Research Lead"
        nextDisabled={!isValid}
        loading={loading}
      />
    </div>
  )
}
