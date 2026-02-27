/**
 * Review Card Component
 * 
 * Displays a section of form data for review with edit link.
 * Used in the final review step of submission form.
 */
import Link from 'next/link'

interface ReviewField {
  label: string
  value: string | null | undefined
}

interface ReviewCardProps {
  title: string
  fields: ReviewField[]
  editLink: string
}

export function ReviewCard({ title, fields, editLink }: ReviewCardProps) {
  return (
    <div className="bg-[#FAFBFC] border border-[#E5E7EB] rounded p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#1B2A4A]">{title}</h3>
        <Link href={editLink} className="text-sm text-[#0D7377] underline hover:text-[#0A5A5D]">
          Edit
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {fields.map((field, index) => (
          <div key={index}>
            <div className="text-base font-semibold text-[#6B7280] mb-1">
              {field.label}
            </div>
            <div className="text-sm font-serif text-[#1B2A4A]">
              {field.value || 'Not provided'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
