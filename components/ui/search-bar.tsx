'use client'

import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
}

export function SearchBar({ value, onChange, onClear, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-[0.83vw] top-1/2 -translate-y-1/2 w-[1.39vw] h-[1.39vw] text-[#6B7280]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[3.33vw] pl-[3.06vw] pr-[3.06vw] border-2 border-[#E5E7EB] rounded-[4px] body focus:border-[#0D7377] focus:outline-none"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-[0.83vw] top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1B2A4A]"
        >
          <X className="w-[1.39vw] h-[1.39vw]" />
        </button>
      )}
    </div>
  )
}
