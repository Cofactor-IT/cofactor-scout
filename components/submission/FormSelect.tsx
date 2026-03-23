/**
 * Form Select Component
 * 
 * Reusable select dropdown for submission forms.
 * Includes label, required indicator, and placeholder support.
 */
interface FormSelectProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  error?: string
}

export function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  placeholder = 'Select...',
  error
}: FormSelectProps) {
  return (
    <div className="flex flex-col gap-[8px]">
      <label htmlFor={name} className="text-[14px] font-medium text-[#1B2A4A]">
        {label}
        {required && <span className="text-[#EF4444] ml-[4px]">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-[48px] border-2 rounded-[4px] px-[16px] text-[14px] font-serif focus:outline-none transition-colors bg-white ${
          error ? 'border-[#DC2626] focus:border-[#DC2626]' : 'border-[#E5E7EB] focus:border-[#0D7377]'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[14px] text-[#DC2626]">{error}</p>}
    </div>
  )
}
