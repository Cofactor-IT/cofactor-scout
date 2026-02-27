import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { FadeInOnLoad } from '@/components/ui/FadeInOnLoad'

export default function ScoutApplicationSubmittedPage() {
    return (
        <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-[48px]">
            <FadeInOnLoad delay={0}>
                <div className="w-[600px] bg-white rounded-[4px] border border-[#E5E7EB] shadow-sm p-[64px] text-center">
                    <div className="flex justify-center mb-[32px]">
                        <div className="w-[80px] h-[80px] bg-[#D1FAE5] rounded-full flex items-center justify-center">
                            <CheckCircle size={48} className="text-[#2D7D46]" />
                        </div>
                    </div>

                    <h1 className="text-[36px] font-bold text-[#1B2A4A] mb-[16px]" style={{ fontFamily: 'var(--font-rethink-sans)', letterSpacing: '-0.18px' }}>
                        Application Received!
                    </h1>

                    <p className="text-[16px] text-[#6B7280] mb-[8px]" style={{ fontFamily: 'var(--font-merriweather)' }}>
                        Thank you for applying to become a Cofactor Scout.
                    </p>
                    <p className="text-[16px] text-[#6B7280] mb-[8px]" style={{ fontFamily: 'var(--font-merriweather)' }}>
                        Our team will review your application and get back to you within 3-5 business days.
                    </p>
                    <p className="text-[16px] text-[#6B7280] mb-[40px]" style={{ fontFamily: 'var(--font-merriweather)' }}>
                        We've sent a confirmation email to your inbox.
                    </p>

                    <Link
                        href="/"
                        className="inline-block h-[56px] px-[48px] bg-[#0D7377] text-white rounded-full flex items-center justify-center text-[18px] font-medium hover:bg-[#0a5a5d] shadow-md transition-colors"
                        style={{ fontFamily: 'var(--font-rethink-sans)', boxShadow: '0px 2px 4px rgba(13,115,119,0.2)' }}
                    >
                        Back to Home
                    </Link>
                </div>
            </FadeInOnLoad>
        </div>
    )
}
