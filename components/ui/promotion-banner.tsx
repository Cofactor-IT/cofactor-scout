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
    const dismissUntil = Date.now() + (48 * 60 * 60 * 1000) // 48 hours
    localStorage.setItem('scoutBannerDismissed', dismissUntil.toString())
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <section className="bg-[#FAFBFC] h-[8.33vw] flex items-center px-[8.33vw]">
      <div className="relative w-full bg-[rgba(13,115,119,0.05)] border-2 border-[#0D7377] rounded-[4px] h-[8.33vw] flex items-center px-[2.22vw] gap-[1.67vw]">
        <Award className="w-[2.78vw] h-[2.78vw] text-[#C9A84C]" />
        
        <div className="flex-1">
          <h4 className="mb-[0.28vw]">Become a Verified Scout</h4>
          <p className="body text-[#6B7280]">Get priority review, higher commission rates, and join our official talent network</p>
        </div>
        
        <Link href="/scout/apply">
          <Button className="w-[13.89vw] h-[3.33vw]">Apply to Be a Scout</Button>
        </Link>
        
        <button 
          onClick={handleDismiss}
          className="absolute top-[1.11vw] right-[1.11vw] hover:opacity-70"
        >
          <X className="w-[1.11vw] h-[1.11vw] text-[#6B7280]" />
        </button>
      </div>
    </section>
  )
}
