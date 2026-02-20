interface FormInputProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  helperText?: string
  placeholder?: string
  type?: string
  error?: string
}

export function FormInput({
  label,
  name,
  value,
  onChange,
  required = false,
  helperText,
  placeholder,
  type = 'text',
  error
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-[14px] font-medium text-[#1B2A4A]">
          {label}
          {required && <span className="text-[#EF4444] ml-[4px]">*</span>}
        </label>
        {helperText && !error && (
          <span className="text-[12px] text-[#6B7280]">{helperText}</span>
        )}
        {error && (
          <span className="text-[12px] text-[#EF4444]">{error}</span>
        )}
      </div>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-[48px] border-2 rounded-[4px] px-[16px] text-[14px] font-serif focus:outline-none transition-colors ${
          error ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#0D7377]'
        }`}
      />
    </div>
  )
}
