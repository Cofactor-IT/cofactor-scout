/**
 * Form Footer Component
 * 
 * Fixed footer for submission forms with save draft, cancel, and next actions.
 * Responsive design with mobile-optimized button labels.
 */
import Link from 'next/link'

interface FormFooterProps {
  draftId?: string | null
  onSaveDraft: () => void
  onNext: () => void
  onCancel?: () => void
  nextLabel: string
  nextDisabled?: boolean
  loading?: boolean
}

export function FormFooter({ 
  draftId,
  onSaveDraft, 
  onNext,
  onCancel,
  nextLabel, 
  nextDisabled = false,
  loading = false 
}: FormFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-white border-t border-[#E5E7EB] shadow-[0_-2px_8px_rgba(0,0,0,0.06)] flex items-center justify-between px-4 md:px-8 lg:px-[120px] z-40">
      <button
        onClick={onCancel}
        disabled={loading}
        className="text-[12px] md:text-[14px] font-medium text-[#EF4444] hover:text-[#DC2626] disabled:opacity-50"
      >
        <span className="hidden md:inline">Cancel & Delete Draft</span>
        <span className="md:hidden">Cancel</span>
      </button>
      <div className="flex items-center gap-[8px] md:gap-[16px]">
        <button
          onClick={onSaveDraft}
          disabled={loading}
          className="w-[100px] md:w-[160px] h-[40px] md:h-[48px] border-2 border-[#1B2A4A] rounded-full text-[12px] md:text-[14px] font-medium hover:bg-[#FAFBFC] disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          onClick={onNext}
          disabled={nextDisabled || loading}
          className="w-[120px] md:w-[240px] h-[40px] md:h-[48px] bg-[#0D7377] text-white rounded-full text-[12px] md:text-[14px] font-medium disabled:opacity-50 hover:bg-[#0A5A5D]"
        >
          <span className="hidden md:inline">{nextLabel}</span>
          <span className="md:hidden">Next →</span>
        </button>
      </div>
    </div>
  )
}
