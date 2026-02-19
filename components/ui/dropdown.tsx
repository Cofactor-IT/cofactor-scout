import React from 'react'

interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string
}

export function Dropdown({ className = '', children, ...props }: DropdownProps) {
  return (
    <select
      className={`w-auto h-[48px] px-[16px] bg-white border border-[#E5E7EB] rounded-[4px] text-[16px] text-[#1B2A4A] focus:outline-none focus:border-[#0D7377] cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
