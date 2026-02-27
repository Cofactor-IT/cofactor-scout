/**
 * Progress Stepper Component
 * 
 * Visual progress indicator for multi-step submission form.
 * Shows current step, allows navigation to previous steps, and displays completion status.
 */
'use client'

import Link from 'next/link'

interface Step {
  number: number
  label: string
}

interface ProgressStepperProps {
  currentStep: number
  steps: Step[]
  draftId?: string | null
}

export function ProgressStepper({ currentStep, steps, draftId }: ProgressStepperProps) {
  // Generate URL for each step based on draft ID
  const getStepUrl = (stepNumber: number) => {
    if (!draftId) return '#'
    if (stepNumber === 1) return `/dashboard/submit?draft=${draftId}`
    if (stepNumber === 2) return `/dashboard/submit/details?draft=${draftId}`
    if (stepNumber === 3) return `/dashboard/submit/review?draft=${draftId}`
    return '#'
  }

  // Prevent navigation if no draft exists
  const handleClick = (e: React.MouseEvent, stepNumber: number) => {
    if (!draftId) {
      e.preventDefault()
    }
  }

  return (
    <div className="w-full mb-[32px] md:mb-[48px] px-4 md:px-0">
      <div className="flex items-center justify-center gap-[8px] md:gap-[16px] lg:gap-[32px] max-w-[600px] mx-auto">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-shrink-0">
          <Link 
            href={getStepUrl(step.number)} 
            onClick={(e) => handleClick(e, step.number)}
            className="flex flex-col items-center group"
          >
            <div
              className={`w-[32px] h-[32px] md:w-[40px] md:h-[40px] rounded-full flex items-center justify-center text-[12px] md:text-[14px] font-semibold transition-all ${
                step.number <= currentStep
                  ? 'bg-[#0D7377] text-white group-hover:bg-[#0A5A5D]'
                  : 'bg-white border-2 border-[#E5E7EB] text-[#6B7280] group-hover:border-[#0D7377]'
              }`}
            >
              {step.number}
            </div>
            <span
              className={`mt-[4px] md:mt-[8px] text-[10px] md:text-[12px] font-medium text-center transition-all whitespace-nowrap ${
                step.number <= currentStep ? 'text-[#0D7377] group-hover:text-[#0A5A5D]' : 'text-[#6B7280] group-hover:text-[#0D7377]'
              }`}
            >
              <span className="hidden md:inline">{step.label}</span>
              <span className="md:hidden">Step {step.number}</span>
            </span>
          </Link>
          {index < steps.length - 1 && (
            <div className="w-[40px] md:w-[80px] lg:w-[192px] h-[2px] -mt-[16px] md:-mt-[24px] mx-[4px] md:mx-[8px] lg:mx-[16px]">
              <div
                className={`h-full transition-all ${
                  step.number < currentStep ? 'bg-[#0D7377]' : 'bg-[#E5E7EB]'
                }`}
              />
            </div>
          )}
        </div>
      ))}
      </div>
    </div>
  )
}
