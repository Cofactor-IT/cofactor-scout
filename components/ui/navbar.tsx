import Link from 'next/link';
import Image from 'next/image';
import NavbarLogo from '@/public/cofactor-scout-navbar-logo.png';

interface NavbarProps {
  userName: string;
  userRole: string;
  userInitials: string;
}

export function Navbar({ userName, userRole, userInitials }: NavbarProps) {
  return (
    <nav className="relative w-full h-[80px] bg-[#E5E7EB] border-b border-[#E5E7EB]">
      {/* Logo */}
      <div className="absolute left-[120px] top-[20px]">
        <Link href="/dashboard">
          <Image 
            src={NavbarLogo}
            alt="Cofactor Scout" 
            width={312} 
            height={40}
          />
        </Link>
      </div>
      
      {/* Right Section */}
      <div className="absolute right-[120px] top-[20px] flex items-center gap-8">
        {/* Navigation Links */}
        <Link 
          href="/submissions" 
          className="button-text text-[#1B2A4A] underline hover:text-[#0D7377]"
        >
          My Submissions
        </Link>
        
        <Link 
          href="/drafts" 
          className="button-text text-[#1B2A4A] underline hover:text-[#0D7377]"
        >
          My Drafts
        </Link>
        
        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[14px] font-medium text-[#1B2A4A]" style={{ fontFamily: 'Rethink Sans' }}>
              {userName}
            </div>
            <div className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Rethink Sans' }}>
              {userRole}
            </div>
          </div>
          
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#1B2A4A] flex items-center justify-center">
            <span className="text-white text-[14px] font-medium" style={{ fontFamily: 'Rethink Sans' }}>
              {userInitials}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
