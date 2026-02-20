interface FormSelectProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
}

export function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  placeholder = 'Select...'
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
        className="h-[48px] border-2 border-[#E5E7EB] rounded-[4px] px-[16px] text-[14px] font-serif focus:outline-none focus:border-[#0D7377] bg-white transition-colors"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
