'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { User, Settings, LogOut } from 'lucide-react'

interface UserDropdownProps {
  displayName: string
  role: string
  initials: string
  profilePictureUrl?: string | null
}

export function UserDropdown({ displayName, role, initials, profilePictureUrl }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
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

  async function handleSignOut() {
    setIsSigningOut(true)
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-[12px] cursor-pointer"
      >
        <div className="text-right">
          <div className="font-medium text-[#1B2A4A] text-[14px]">{displayName}</div>
          <div className="text-[#6B7280] text-[12px]">{role}</div>
        </div>
        {profilePictureUrl ? (
          <img 
            src={profilePictureUrl} 
            alt={displayName}
            className="w-[40px] h-[40px] rounded-full object-cover border-2 border-[#E5E7EB]"
          />
        ) : (
          <div className="w-[40px] h-[40px] rounded-full bg-[#1B2A4A] border-2 border-[#E5E7EB] flex items-center justify-center">
            <span className="text-[14px] text-white font-bold">{initials}</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[48px] w-[200px] bg-white border border-[#E5E7EB] rounded-[4px] shadow-md z-50">
          <Link
            href="/settings"
            className="flex items-center gap-[12px] px-[16px] py-[12px] h-[44px] text-[#1B2A4A] hover:bg-[#FAFBFC] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <User className="w-[18px] h-[18px] text-[#6B7280]" />
            <span className="text-[15px] font-normal">Account</span>
          </Link>
          
          <Link
            href="/settings?tab=profile"
            className="flex items-center gap-[12px] px-[16px] py-[12px] h-[44px] text-[#1B2A4A] hover:bg-[#FAFBFC] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-[18px] h-[18px] text-[#6B7280]" />
            <span className="text-[15px] font-normal">Settings</span>
          </Link>
          
          <div className="h-[1px] bg-[#E5E7EB] my-[8px]" />
          
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full flex items-center gap-[12px] px-[16px] py-[12px] h-[44px] text-[#EF4444] hover:bg-[#FEE2E2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningOut ? (
              <>
                <div className="w-[18px] h-[18px] border-2 border-[#EF4444]/30 border-t-[#EF4444] rounded-full animate-spin" />
                <span className="text-[15px] font-normal">Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-[18px] h-[18px]" />
                <span className="text-[15px] font-normal">Sign Out</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
