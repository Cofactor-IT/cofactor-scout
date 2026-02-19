interface Step {
  number: number
  label: string
}

interface ProgressIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-[2.78vw] h-[2.78vw] rounded-full flex items-center justify-center label ${
                step.number <= currentStep
                  ? 'bg-[#0D7377] text-white'
                  : 'bg-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              {step.number}
            </div>
            <span className="mt-[0.56vw] caption text-[#1B2A4A]">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-[2px] mx-[0.83vw] ${
                step.number < currentStep ? 'bg-[#0D7377]' : 'bg-[#E5E7EB]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
