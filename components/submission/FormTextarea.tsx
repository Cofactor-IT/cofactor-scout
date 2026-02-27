/**
 * FormTextarea.tsx
 * 
 * Reusable textarea component for multi-line text input.
 * Supports validation and helper text.
 * 
 * Features:
 * - Required field indicator
 * - Helper text display
 * - Configurable row height
 * - Focus state with teal border
 * - Non-resizable for consistent layout
 */

/**
 * Props for FormTextarea component.
 */
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

/**
 * Textarea component with label and validation.
 * Uses design system colors and typography.
 * 
 * @param label - Textarea label text
 * @param name - Textarea name attribute
 * @param value - Controlled textarea value
 * @param onChange - Value change handler
 * @param required - Shows required indicator
 * @param helperText - Helper text shown above textarea
 * @param placeholder - Textarea placeholder
 * @param rows - Number of visible text rows
 */
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
