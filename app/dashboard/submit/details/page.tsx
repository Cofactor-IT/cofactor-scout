'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardNavbar } from '@/components/dashboard-navbar'
import { ProgressStepper } from '@/components/submission/ProgressStepper'
import { FormInput } from '@/components/submission/FormInput'
import { FormTextarea } from '@/components/submission/FormTextarea'
import { FormSelect } from '@/components/submission/FormSelect'
import { FormFooter } from '@/components/submission/FormFooter'
import { saveDraft, getDraft, deleteDraft } from '@/actions/submission.actions'

export default function DetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get('draft')

  const [formData, setFormData] = useState({
    researcherCareerStage: '',
    researcherCareerStageOther: '',
    fundingStatus: '',
    researchStage: '',
    researcherLinkedin: '',
    keyPublications: '',
    potentialApplications: '',
    submissionSource: '',
    relationshipToResearcher: '',
    researcherAwareness: false,
    supportingLinks: [] as { label: string; url: string }[]
  })

  const [loading, setLoading] = useState(false)
  const [step1Data, setStep1Data] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/user').then(res => res.json()).then(data => setUser(data))
  }, [])

  useEffect(() => {
    if (draftId) {
      getDraft(draftId).then((result) => {
        if (result.success && result.draft) {
          setStep1Data(result.draft)
          setFormData({
            researcherCareerStage: result.draft.researcherCareerStage || '',
            researcherCareerStageOther: result.draft.researcherCareerStageOther || '',
            fundingStatus: result.draft.fundingStatus || '',
            researchStage: result.draft.researchStage || '',
            researcherLinkedin: result.draft.researcherLinkedin || '',
            keyPublications: result.draft.keyPublications || '',
            potentialApplications: result.draft.potentialApplications || '',
            submissionSource: result.draft.submissionSource || '',
            relationshipToResearcher: result.draft.relationshipToResearcher || '',
            researcherAwareness: result.draft.researcherAwareness || false,
            supportingLinks: Array.isArray(result.draft.supportingLinks) 
              ? (result.draft.supportingLinks as { label: string; url: string }[]) 
              : []
          })
        }
      })
    }
  }, [draftId])

  const isStep1Valid = step1Data?.researchTopic && step1Data?.researchDescription && 
                       step1Data?.researcherName && step1Data?.researcherEmail && 
                       step1Data?.researcherInstitution

  const handleSaveDraft = async () => {
    setLoading(true)
    await saveDraft({ id: draftId, ...formData })
    router.push('/dashboard/drafts')
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
    const result = await saveDraft({ id: draftId, ...formData })
    if (result.success) {
      router.push(`/dashboard/submit/review?draft=${result.id}`)
    }
    setLoading(false)
  }

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
            currentStep={2}
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
                Additional Details
              </h2>
              <p className="text-[12px] text-[#0D7377]">
                All fields on this page are optional
              </p>
            </div>

            <div className="flex flex-col gap-[24px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] md:gap-[32px]">
                <div>
                  <FormSelect
                    label="Researcher Career Stage"
                    name="researcherCareerStage"
                    value={formData.researcherCareerStage}
                    onChange={(value) => setFormData({ ...formData, researcherCareerStage: value, researcherCareerStageOther: value === 'OTHER' ? formData.researcherCareerStageOther : '' })}
                    options={[
                      { value: 'UNDERGRAD_STUDENT', label: 'Undergraduate Student' },
                      { value: 'PHD_STUDENT', label: 'PhD Student' },
                      { value: 'POSTDOC', label: 'Postdoc' },
                      { value: 'PROFESSOR', label: 'Professor' },
                      { value: 'INDUSTRY_RESEARCHER', label: 'Industry Researcher' },
                      { value: 'INDEPENDENT_RESEARCHER', label: 'Independent Researcher' },
                      { value: 'OTHER', label: 'Other' }
                    ]}
                    placeholder="Select career stage"
                  />
                  {formData.researcherCareerStage === 'OTHER' && (
                    <FormInput
                      label=""
                      name="researcherCareerStageOther"
                      value={formData.researcherCareerStageOther}
                      onChange={(value) => setFormData({ ...formData, researcherCareerStageOther: value })}
                      placeholder="Please specify career stage"
                    />
                  )}
                </div>

                <FormSelect
                  label="Funding Status"
                  name="fundingStatus"
                  value={formData.fundingStatus}
                  onChange={(value) => setFormData({ ...formData, fundingStatus: value })}
                  options={[
                    { value: 'NOT_SEEKING', label: 'Not Seeking' },
                    { value: 'SEEKING_SEED', label: 'Seeking Seed' },
                    { value: 'SEEKING_SERIES_A', label: 'Seeking Series A' },
                    { value: 'GRANT_FUNDED', label: 'Grant Funded' },
                    { value: 'INDUSTRY_FUNDED', label: 'Industry Funded' },
                    { value: 'VC_BACKED', label: 'VC Backed' }
                  ]}
                  placeholder="Select funding status"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] md:gap-[32px]">
                <FormSelect
                  label="Research Stage"
                  name="researchStage"
                  value={formData.researchStage}
                  onChange={(value) => setFormData({ ...formData, researchStage: value })}
                  options={[
                    { value: 'EARLY_CONCEPT', label: 'Early Concept' },
                    { value: 'ACTIVE_RESEARCH', label: 'Active Research' },
                    { value: 'HAS_RESULTS', label: 'Has Results' },
                    { value: 'PUBLISHED', label: 'Published' }
                  ]}
                  placeholder="Select research stage"
                />

                <FormInput
                  label="Researcher LinkedIn"
                  name="researcherLinkedin"
                  value={formData.researcherLinkedin}
                  onChange={(value) => setFormData({ ...formData, researcherLinkedin: value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <FormTextarea
                label="Key Publications"
                name="keyPublications"
                value={formData.keyPublications}
                onChange={(value) => setFormData({ ...formData, keyPublications: value })}
                placeholder="Links to papers, preprints, or other publications..."
                rows={4}
              />

              <FormTextarea
                label="Potential Applications"
                name="potentialApplications"
                value={formData.potentialApplications}
                onChange={(value) => setFormData({ ...formData, potentialApplications: value })}
                placeholder="Commercial applications, market opportunities..."
                rows={4}
              />

              {/* Supporting Links */}
              <div>
                <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]">
                  Supporting Links
                  <span className="text-[12px] text-[#6B7280] font-normal ml-[8px]">
                    (Optional - Add links to datasets, code, demos, etc.)
                  </span>
                </label>
                <div className="space-y-[12px]">
                  {formData.supportingLinks.map((link, index) => (
                    <div key={index} className="flex gap-[12px]">
                      <input
                        type="text"
                        placeholder="Label (e.g., GitHub Repo)"
                        value={link.label}
                        onChange={(e) => {
                          const newLinks = [...formData.supportingLinks]
                          newLinks[index].label = e.target.value
                          setFormData({ ...formData, supportingLinks: newLinks })
                        }}
                        className="flex-1 h-[48px] px-[16px] border-2 border-[#E5E7EB] rounded-[4px] text-[14px] font-serif focus:outline-none focus:border-[#0D7377]"
                      />
                      <input
                        type="url"
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...formData.supportingLinks]
                          newLinks[index].url = e.target.value
                          setFormData({ ...formData, supportingLinks: newLinks })
                        }}
                        className="flex-[2] h-[48px] px-[16px] border-2 border-[#E5E7EB] rounded-[4px] text-[14px] font-serif focus:outline-none focus:border-[#0D7377]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newLinks = formData.supportingLinks.filter((_, i) => i !== index)
                          setFormData({ ...formData, supportingLinks: newLinks })
                        }}
                        className="px-[16px] h-[48px] text-[#EF4444] hover:text-[#DC2626] text-[14px] font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        supportingLinks: [...formData.supportingLinks, { label: '', url: '' }]
                      })
                    }}
                    className="text-[14px] text-[#0D7377] hover:text-[#0A5A5D] font-medium"
                  >
                    + Add Link
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] md:gap-[32px]">
                <FormSelect
                  label="How did you find this research?"
                  name="submissionSource"
                  value={formData.submissionSource}
                  onChange={(value) => setFormData({ ...formData, submissionSource: value })}
                  options={[
                    { value: 'CONFERENCE', label: 'Conference' },
                    { value: 'ACADEMIC_PAPER', label: 'Academic Paper' },
                    { value: 'LINKEDIN', label: 'LinkedIn' },
                    { value: 'PERSONAL_CONNECTION', label: 'Personal Connection' },
                    { value: 'LAB_VISIT', label: 'Lab Visit' },
                    { value: 'OTHER', label: 'Other' }
                  ]}
                  placeholder="Select source"
                />

                <FormSelect
                  label="Your Relationship to Researcher"
                  name="relationshipToResearcher"
                  value={formData.relationshipToResearcher}
                  onChange={(value) => setFormData({ ...formData, relationshipToResearcher: value })}
                  options={[
                    { value: 'LAB_MATE', label: 'Lab Mate' },
                    { value: 'CLASSMATE', label: 'Classmate' },
                    { value: 'COLLEAGUE', label: 'Colleague' },
                    { value: 'NO_RELATIONSHIP', label: 'No Relationship' },
                    { value: 'OTHER', label: 'Other' }
                  ]}
                  placeholder="Select relationship"
                />
              </div>

              <label className="flex items-center gap-[12px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.researcherAwareness}
                  onChange={(e) => setFormData({ ...formData, researcherAwareness: e.target.checked })}
                  className="w-[20px] h-[20px] border-2 border-[#E5E7EB] rounded-[4px]"
                />
                <span className="text-[14px] text-[#1B2A4A]">
                  The researcher knows I am submitting this
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <FormFooter
        draftId={draftId}
        onSaveDraft={handleSaveDraft}
        onNext={handleNext}
        onCancel={handleCancel}
        nextLabel="Next: Review & Submit →"
        nextDisabled={!isStep1Valid}
        loading={loading}
      />
    </div>
  )
}
