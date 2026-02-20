interface FormTextareaProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  helperText?: string
  placeholder?: string
  rows?: number
}

export function FormTextarea({
  label,
  name,
  value,
  onChange,
  required = false,
  helperText,
  placeholder,
  rows = 6
}: FormTextareaProps) {
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-[14px] font-medium text-[#1B2A4A]">
          {label}
          {required && <span className="text-[#EF4444] ml-[4px]">*</span>}
        </label>
        {helperText && (
          <span className="text-[12px] text-[#6B7280]">{helperText}</span>
        )}
      </div>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="border-2 border-[#E5E7EB] rounded-[4px] px-[16px] py-[12px] text-[14px] font-serif resize-none focus:outline-none focus:border-[#0D7377] transition-colors"
      />
    </div>
  )
}
