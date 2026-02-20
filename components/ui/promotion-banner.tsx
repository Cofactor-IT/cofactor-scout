'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Award, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PromotionBanner() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const dismissedUntil = localStorage.getItem('scoutBannerDismissed')
    if (dismissedUntil) {
      const dismissTime = parseInt(dismissedUntil)
      if (Date.now() < dismissTime) {
        setIsVisible(false)
      } else {
        localStorage.removeItem('scoutBannerDismissed')
      }
    }
  }, [])

  const handleDismiss = () => {
    const dismissUntil = Date.now() + (2 * 60 * 60 * 1000) // 2 hours
    localStorage.setItem('scoutBannerDismissed', dismissUntil.toString())
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <section className="bg-[#FAFBFC] py-4 md:py-6 lg:h-[8.33vw] flex items-center px-4 md:px-8 lg:px-[8.33vw]">
      <div className="relative w-full bg-[rgba(13,115,119,0.05)] border-2 border-[#0D7377] rounded-[4px] min-h-[120px] md:min-h-[100px] lg:h-[8.33vw] flex flex-col md:flex-row items-start md:items-center p-4 md:px-6 lg:px-[2.22vw] gap-4 md:gap-6 lg:gap-[1.67vw]">
        <Award className="w-[32px] h-[32px] md:w-[40px] md:h-[40px] lg:w-[2.78vw] lg:h-[2.78vw] text-[#C9A84C] flex-shrink-0" />
        
        <div className="flex-1">
          <h4 className="mb-1 md:mb-[0.28vw] text-[18px] md:text-[20px]">Become a Verified Scout</h4>
          <p className="body text-[#6B7280] text-[14px] md:text-[16px]">Get priority review, higher commission rates, and join our official talent network</p>
        </div>
        
        <Link href="/scout/apply" className="w-full md:w-auto">
          <Button className="w-full md:w-[200px] lg:w-[13.89vw] h-[48px] md:h-[56px] lg:h-[3.33vw]">Apply to Be a Scout</Button>
        </Link>
        
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 md:top-4 md:right-4 lg:top-[1.11vw] lg:right-[1.11vw] hover:opacity-70"
        >
          <X className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] lg:w-[1.11vw] lg:h-[1.11vw] text-[#6B7280]" />
        </button>
      </div>
    </section>
  )
}
