import Link from 'next/link';
import Image from 'next/image';
import NavbarLogo from '@/public/cofactor-scout-navbar-logo.png';

export function AuthNavbar() {
  return (
    <nav className="relative w-full h-[78px] bg-[#E5E7EB] border-b border-[#E5E7EB] px-4 md:px-8 lg:px-[120px]">
      <div className="absolute left-4 md:left-8 lg:left-[120px] top-[19px]">
        <Image 
          src={NavbarLogo}
          alt="Cofactor Scout" 
          width={312} 
          height={40}
          className="w-[180px] md:w-[250px] lg:w-[312px] h-auto"
        />
      </div>
      
      <div className="absolute right-4 md:right-8 lg:right-[120px] top-[27px]">
        <Link 
          href="/" 
          className="button-text text-[#1B2A4A] underline hover:text-[#0D7377] text-[12px] md:text-[14px]"
        >
          Back to Homepage
        </Link>
      </div>
    </nav>
  );
}
