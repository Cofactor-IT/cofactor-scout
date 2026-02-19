import Link from 'next/link';
import Image from 'next/image';
import NavbarLogo from '@/public/cofactor-scout-navbar-logo.png';

export function AuthNavbar() {
  return (
    <nav className="relative w-full h-[78px] bg-[#E5E7EB] border-b border-[#E5E7EB]">
      <div className="absolute left-[120px] top-[19px]">
        <Image 
          src={NavbarLogo}
          alt="Cofactor Scout" 
          width={312} 
          height={40}
        />
      </div>
      
      <div className="absolute right-[120px] top-[27px]">
        <Link 
          href="/" 
          className="button-text text-[#1B2A4A] underline hover:text-[#0D7377]"
        >
          Back to Homepage
        </Link>
      </div>
    </nav>
  );
}
