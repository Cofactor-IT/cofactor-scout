'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  helperText?: string
  placeholder?: string
  showToggle?: boolean
}

export function PasswordInput({
  label,
  name,
  value,
  onChange,
  required = false,
  helperText,
  placeholder,
  showToggle = false
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

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
      <div className="relative">
        <input
          id={name}
          name={name}
          type={showToggle && showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-[48px] border-2 border-[#E5E7EB] rounded-[4px] px-[16px] pr-[48px] text-[14px] font-serif focus:outline-none focus:border-[#0D7377] transition-colors"
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1B2A4A]"
          >
            {showPassword ? (
              <EyeOff className="w-[20px] h-[20px]" />
            ) : (
              <Eye className="w-[20px] h-[20px]" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
