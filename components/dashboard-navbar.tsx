/**
 * Dashboard Navbar Component
 * 
 * Navigation bar for dashboard pages with user dropdown and page links.
 * Responsive design with mobile menu.
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import NavbarLogo from '@/public/cofactor-scout-navbar-logo.png'
import { UserDropdown } from '@/components/ui/user-dropdown'

interface DashboardNavbarProps {
  displayName: string
  role: string
  initials: string
  profilePictureUrl?: string | null
  activePage: 'submissions' | 'drafts'
}

export function DashboardNavbar({ displayName, role, initials, profilePictureUrl, activePage }: DashboardNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 h-[70px] bg-white border-b border-[#E5E7EB] px-4 md:px-8 lg:px-[120px] flex items-center justify-between flex-shrink-0 z-50">
      <Image 
        src={NavbarLogo} 
        alt="CofactorScout" 
        width={150} 
        height={30}
        className="h-[24px] md:h-[30px] w-auto flex-shrink-0"
        priority
      />
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-[48px] flex-shrink-0">
        <Link 
          href="/dashboard" 
          className={`text-[#1B2A4A] text-[16px] font-medium pb-[2px] border-b-2 ${
            activePage === 'submissions' ? 'border-[#0D7377]' : 'border-transparent'
          }`}
        >
          My Submissions
        </Link>
        <Link 
          href="/dashboard/drafts" 
          className={`text-[#1B2A4A] text-[16px] font-medium pb-[2px] border-b-2 ${
            activePage === 'drafts' ? 'border-[#0D7377]' : 'border-transparent'
          }`}
        >
          My Drafts
        </Link>
        
        <UserDropdown 
          displayName={displayName}
          role={role}
          initials={initials}
          profilePictureUrl={profilePictureUrl}
        />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden text-[#1B2A4A] p-2"
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[70px] left-0 right-0 bg-white border-b border-[#E5E7EB] shadow-lg">
          <div className="flex flex-col p-4 gap-4">
            <Link 
              href="/dashboard" 
              onClick={() => setIsMenuOpen(false)}
              className={`text-[#1B2A4A] text-[16px] font-medium py-2 border-l-4 pl-4 ${
                activePage === 'submissions' ? 'border-[#0D7377]' : 'border-transparent'
              }`}
            >
              My Submissions
            </Link>
            <Link 
              href="/dashboard/drafts" 
              onClick={() => setIsMenuOpen(false)}
              className={`text-[#1B2A4A] text-[16px] font-medium py-2 border-l-4 pl-4 ${
                activePage === 'drafts' ? 'border-[#0D7377]' : 'border-transparent'
              }`}
            >
              My Drafts
            </Link>
            <div className="pt-2 border-t border-[#E5E7EB]">
              <UserDropdown 
                displayName={displayName}
                role={role}
                initials={initials}
                profilePictureUrl={profilePictureUrl}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
