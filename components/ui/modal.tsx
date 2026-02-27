/**
 * modal.tsx
 * 
 * Reusable modal dialog component with overlay.
 * 
 * Features:
 * - Three size variants (sm, md, lg)
 * - Close button and overlay click to dismiss
 * - Optional footer for action buttons
 * - Prevents body scroll when open
 * - Responsive sizing and padding
 */

'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

/**
 * Props for Modal component.
 */
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Modal dialog component with overlay and close functionality.
 * Locks body scroll when open.
 * 
 * @param isOpen - Controls modal visibility
 * @param onClose - Close handler
 * @param title - Modal title
 * @param children - Modal content
 * @param footer - Optional footer with action buttons
 * @param size - Modal width (sm: 400px, md: 600px, lg: 800px)
 */
export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  // Lock body scroll when modal is open
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
    sm: 'w-[90vw] max-w-[400px]',
    md: 'w-[90vw] max-w-[600px]',
    lg: 'w-[90vw] max-w-[800px]',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-[4px] shadow-lg ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-[18px] md:text-[20px]">{title}</h3>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1B2A4A]">
            <X className="w-[20px] h-[20px] md:w-[24px] md:h-[24px]" />
          </button>
        </div>
        <div className="px-4 md:px-6 py-4 md:py-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-4 md:px-6 py-4 border-t border-[#E5E7EB]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
