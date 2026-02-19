import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
}

export function Textarea({ className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full px-[16px] py-[12px] bg-white border border-[#E5E7EB] rounded-[4px] text-[16px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377] resize-vertical min-h-[100px] ${className}`}
      {...props}
    />
  )
}
