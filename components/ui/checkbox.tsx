import React from 'react'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export function Checkbox({ className = '', ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={`w-[20px] h-[20px] border-2 border-[#E5E7EB] rounded-[4px] cursor-pointer accent-[#0D7377] ${className}`}
      {...props}
    />
  )
}
