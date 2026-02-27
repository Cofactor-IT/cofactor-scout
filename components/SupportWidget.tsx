/**
 * Support Widget Component
 * 
 * Draggable floating button for user feedback and support.
 * Allows users to submit help requests, bug reports, feature suggestions, and comments.
 */
'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, HelpCircle, Bug, Lightbulb, MessageSquare, X, CheckCircle } from 'lucide-react'
import { submitFeedback } from '@/actions/feedback.actions'

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedType, setSelectedType] = useState<'help' | 'bug' | 'feature' | 'comment' | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Initialize widget position in bottom-right corner
  useEffect(() => {
    setPosition({ x: window.innerWidth - 100, y: window.innerHeight - 100 })
  }, [])

  // Handle drag functionality
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleTypeSelect = (type: 'help' | 'bug' | 'feature' | 'comment') => {
    setSelectedType(type)
    setShowForm(true)
    setIsOpen(false)
  }

  const handleSubmit = async () => {
    if (!selectedType || !message.trim()) return
    
    setLoading(true)
    setError('')
    const result = await submitFeedback({ type: selectedType, message })
    
    if (result.success) {
      setSuccess(true)
      setMessage('')
      setTimeout(() => {
        setSuccess(false)
        setShowForm(false)
        setSelectedType(null)
      }, 3000)
    } else {
      setError(result.error || 'Failed to submit')
    }
    setLoading(false)
  }

  const typeConfig = {
    help: { 
      icon: HelpCircle, 
      label: 'Ask for Help', 
      color: '#0D7377',
      placeholder: 'What do you need help with?'
    },
    bug: { 
      icon: Bug, 
      label: 'Report a Bug', 
      color: '#EF4444',
      placeholder: 'Notice anything off on our page? Let us know what happened...'
    },
    feature: { 
      icon: Lightbulb, 
      label: 'Suggest a Feature', 
      color: '#F59E0B',
      placeholder: 'What feature would you like to see?'
    },
    comment: { 
      icon: MessageSquare, 
      label: 'General Comment', 
      color: '#6366F1',
      placeholder: 'Share your thoughts with us...'
    }
  }

  return (
    <>
      {/* Main Button */}
      <div
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 9999,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        <button
          onClick={() => !isDragging && setIsOpen(!isOpen)}
          className="w-[60px] h-[60px] bg-[#0D7377] text-white rounded-full shadow-lg hover:bg-[#0A5A5D] flex items-center justify-center transition-all"
        >
          <MessageCircle className="w-[28px] h-[28px]" />
        </button>
      </div>

      {/* Options Menu */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            right: `${Math.max(20, window.innerWidth - position.x - 60)}px`,
            bottom: `${Math.max(20, window.innerHeight - position.y)}px`,
            zIndex: 9998
          }}
          className="bg-white rounded-[8px] shadow-xl border border-[#E5E7EB] p-[8px] w-[220px]"
        >
          {Object.entries(typeConfig).map(([key, config]) => {
            const Icon = config.icon
            return (
              <button
                key={key}
                onClick={() => handleTypeSelect(key as any)}
                className="w-full flex items-center gap-[12px] px-[16px] py-[12px] hover:bg-[#FAFBFC] rounded-[4px] text-left transition-colors"
              >
                <Icon className="w-[20px] h-[20px]" style={{ color: config.color }} />
                <span className="text-[14px] text-[#1B2A4A]">{config.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && selectedType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-[8px] shadow-xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-[32px]">
              <div className="flex items-center justify-between mb-[24px]">
                <h2 className="text-[20px] md:text-[24px] font-semibold text-[#1B2A4A]">
                  {typeConfig[selectedType].label}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setSelectedType(null)
                    setMessage('')
                    setError('')
                  }}
                  className="text-[#6B7280] hover:text-[#1B2A4A]"
                >
                  <X className="w-[24px] h-[24px]" />
                </button>
              </div>

              {success ? (
                <div className="flex flex-col items-center justify-center py-[40px]">
                  <CheckCircle className="w-[64px] h-[64px] text-[#2D7D46] mb-[16px]" />
                  <p className="text-[16px] text-[#1B2A4A] text-center">
                    Thank you! We've received your feedback and sent you a confirmation email.
                  </p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-[16px] p-[12px] bg-[#FEE2E2] border border-[#EF4444] rounded-[4px] text-[#EF4444] text-[14px]">
                      {error}
                    </div>
                  )}

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={typeConfig[selectedType].placeholder}
                    className="w-full h-[200px] border-2 border-[#E5E7EB] rounded-[4px] p-[16px] text-[14px] font-serif focus:outline-none focus:border-[#0D7377] resize-none"
                  />

                  <div className="flex flex-col sm:flex-row justify-end gap-[12px] mt-[24px]">
                    <button
                      onClick={() => {
                        setShowForm(false)
                        setSelectedType(null)
                        setMessage('')
                        setError('')
                      }}
                      className="w-full sm:w-auto px-[24px] py-[12px] border-2 border-[#E5E7EB] text-[#1B2A4A] text-[14px] font-medium rounded-full hover:bg-[#FAFBFC]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || message.trim().length < 10}
                      className="w-full sm:w-auto px-[24px] py-[12px] bg-[#0D7377] text-white text-[14px] font-medium rounded-full hover:bg-[#0A5A5D] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
