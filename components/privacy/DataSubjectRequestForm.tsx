/**
 * DataSubjectRequestForm.tsx
 *
 * Form component for submitting GDPR data rights requests.
 * Client-side validation, field-level error display, submission handling.
 *
 * Supports 4 request types with user-friendly labels and strict ORCID validation.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { submitDataSubjectRequest } from '@/actions/privacy-request.actions'

const REQUEST_TYPE_OPTIONS = [
  { value: 'REMOVE_MY_DATA', label: 'Request deletion of my data' },
  { value: 'OBJECT_TO_PROCESSING', label: 'Object to processing of my data' },
  { value: 'CORRECT_MY_DATA', label: 'Request correction of my data' },
  { value: 'ACCESS_MY_DATA', label: 'Request access to my data' },
]

export function DataSubjectRequestForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    orcid: '',
    requestType: '',
    context: '',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState<string>()
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const result = await submitDataSubjectRequest(formData)

    if (result.success) {
      router.push(`/privacy/request/confirm?id=${result.requestId}`)
    } else if (result.warning) {
      setDuplicateWarning(result.warning)
      setShowDuplicateWarning(true)
    } else if (result.errors) {
      setErrors(result.errors)
    }

    setLoading(false)
  }

  const handleDuplicateConfirm = async () => {
    setShowDuplicateWarning(false)
    setDuplicateWarning(undefined)
    setLoading(true)
    const result = await submitDataSubjectRequest(formData)
    if (result.success) {
      router.push(`/privacy/request/confirm?id=${result.requestId}`)
    } else if (result.errors) {
      setErrors(result.errors)
    }
    setLoading(false)
  }

  const getFieldError = (field: string): string => {
    return errors[field]?.[0] || ''
  }

  return (
    <>
      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="label">Full Name *</label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={e => handleChange('fullName', e.target.value)}
              className={getFieldError('fullName') ? 'border-[#DC2626]' : ''}
              placeholder="Jane Doe"
              required
            />
            {getFieldError('fullName') && (
              <p className="caption text-[#DC2626]">{getFieldError('fullName')}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="label">Institutional Email *</label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              className={getFieldError('email') ? 'border-[#DC2626]' : ''}
              placeholder="jane.doe@university.edu"
              required
            />
            {getFieldError('email') && (
              <p className="caption text-[#DC2626]">{getFieldError('email')}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="orcid" className="label">ORCID (Optional)</label>
            <Input
              id="orcid"
              type="text"
              value={formData.orcid}
              onChange={e => handleChange('orcid', e.target.value)}
              className={getFieldError('orcid') ? 'border-[#DC2626]' : ''}
              placeholder="0000-0000-0000-0000"
              maxLength={19}
            />
            {getFieldError('orcid') && (
              <p className="caption text-[#DC2626]">{getFieldError('orcid')}</p>
            )}
            <p className="caption text-[var(--cool-gray)]">
              Format: 0000-0000-0000-0000
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="requestType" className="label">Request Type *</label>
            <select
              id="requestType"
              value={formData.requestType}
              onChange={e => handleChange('requestType', e.target.value)}
              className={`bg-white border px-4 py-3 body focus:outline-none transition-colors ${
                getFieldError('requestType') ? 'border-[#DC2626]' : 'border-[#E5E7EB] focus:border-[#0D7377]'
              }`}
              style={{ borderRadius: '4px' }}
              required
            >
              <option value="">Select request type...</option>
              {REQUEST_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {getFieldError('requestType') && (
              <p className="caption text-[#DC2626]">{getFieldError('requestType')}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="context" className="label">Additional Context (Optional)</label>
            <Textarea
              id="context"
              value={formData.context}
              onChange={e => handleChange('context', e.target.value)}
              className={getFieldError('context') ? 'border-[#DC2626]' : ''}
              placeholder="Provide any additional details about your request..."
              rows={4}
            />
            {getFieldError('context') && (
              <p className="caption text-[#DC2626]">{getFieldError('context')}</p>
            )}
            <p className="caption text-[var(--cool-gray)]">
              Max 2000 characters
            </p>
          </div>

          {errors.form && (
            <div className="p-4 bg-[#FEE2E2] border border-[#EF4444] rounded-[4px]">
              <p className="body text-[#EF4444]">{errors.form[0]}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="mt-4"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </Card>

      {showDuplicateWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md mx-4">
            <h3 className="h3 mb-4">Duplicate Request Detected</h3>
            <p className="body mb-6">{duplicateWarning}</p>
            <p className="body mb-6">Do you still want to submit this request?</p>
            <div className="flex gap-4">
              <Button
                variant="secondary"
                onClick={() => setShowDuplicateWarning(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDuplicateConfirm}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Anyway'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
