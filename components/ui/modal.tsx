'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'w-[27.78vw]',
    md: 'w-[41.67vw]',
    lg: 'w-[55.56vw]',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-[4px] shadow-lg ${sizeClasses[size]}`}>
        <div className="flex items-center justify-between px-[1.67vw] py-[1.11vw] border-b border-[#E5E7EB]">
          <h3>{title}</h3>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1B2A4A]">
            <X className="w-[1.67vw] h-[1.67vw]" />
          </button>
        </div>
        <div className="px-[1.67vw] py-[1.67vw]">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-[0.83vw] px-[1.67vw] py-[1.11vw] border-t border-[#E5E7EB]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
