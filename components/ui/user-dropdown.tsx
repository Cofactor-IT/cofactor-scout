'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { User, Settings, LogOut } from 'lucide-react'

interface UserDropdownProps {
  displayName: string
  role: string
  initials: string
}

export function UserDropdown({ displayName, role, initials }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-[0.83vw] cursor-pointer"
      >
        <div className="text-right">
          <div className="font-bold text-[#1B2A4A] text-[17.5px]">{displayName}</div>
          <div className="text-[#6B7280] text-[15px]">{role}</div>
        </div>
        <div className="w-[2.78vw] h-[2.78vw] rounded-full bg-[#1B2A4A] flex items-center justify-center">
          <span className="caption text-white font-medium">{initials}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[3.33vw] w-[13.89vw] bg-white border border-[#E5E7EB] rounded-[4px] shadow-md z-50">
          <Link
            href="/profile"
            className="flex items-center gap-[0.56vw] px-[1.11vw] py-[0.83vw] text-[#1B2A4A] hover:bg-[#FAFBFC] text-[17.5px]"
            onClick={() => setIsOpen(false)}
          >
            <User className="w-[1.11vw] h-[1.11vw]" />
            Account
          </Link>
          
          <Link
            href="/profile/settings"
            className="flex items-center gap-[0.56vw] px-[1.11vw] py-[0.83vw] text-[#1B2A4A] hover:bg-[#FAFBFC] text-[17.5px]"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-[1.11vw] h-[1.11vw]" />
            Settings
          </Link>
          
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-[0.56vw] px-[1.11vw] py-[0.83vw] text-[#EF4444] hover:bg-[#FAFBFC] border-t border-[#E5E7EB] text-[17.5px]"
          >
            <LogOut className="w-[1.11vw] h-[1.11vw]" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
