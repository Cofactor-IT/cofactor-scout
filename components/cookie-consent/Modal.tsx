/**
 * @file Modal.tsx
 * @description Cookie preferences customization modal.
 * Allows users to toggle individual cookie categories (analytics, error monitoring).
 */
"use client"

import { useState, useEffect } from 'react'
import { ConsentState } from './types'

/**
 * Props for the CookieModal component.
 */
interface ModalProps {
    /** Whether the modal is currently open */
    isOpen: boolean
    /** Callback to close the modal */
    onClose: () => void
    /** Callback to save consent preferences */
    onSave: (consent: ConsentState) => void
    /** Initial consent state to populate the form */
    initialState: ConsentState
}

/**
 * Cookie preferences modal component.
 * Displays toggles for analytics and error monitoring cookies.
 * @param props - Modal configuration and callbacks
 * @returns Modal dialog with cookie preference toggles
 */
export function CookieModal({ isOpen, onClose, onSave, initialState }: ModalProps) {
    const [preferences, setPreferences] = useState<ConsentState>(initialState)

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setPreferences(initialState)
        }
    }, [isOpen, initialState])

    if (!isOpen) return null

    /**
     * Saves the current preferences and closes the modal.
     */
    const handleSave = () => {
        onSave(preferences)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-white max-w-lg w-full rounded-lg shadow-xl overflow-hidden border border-[#E5E7EB]">
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex justify-between items-center">
                    <h3>Cookie Preferences</h3>
                    <button onClick={onClose} className="text-[#6B7280] hover:text-[#1B2A4A]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    <p className="body text-sm text-[#6B7280]">
                        We use cookies to ensure the basic functionalities of the website and to enhance your online experience.
                        You can choose for each category to opt-in/out whenever you want.
                    </p>

                    {/* Strictly Necessary */}
                    <div className="space-y-2 border border-[#E5E7EB] p-4 rounded-md bg-[#FAFBFC]">
                        <div className="flex justify-between items-start">
                            <h4>Strictly Necessary Cookies</h4>
                            <span className="caption font-semibold bg-[#0D7377]/10 px-2 py-1 rounded" style={{ color: '#0D7377' }}>Always On</span>
                        </div>
                        <p className="body text-sm text-[#6B7280]">
                            These cookies are essential for the proper functioning of the website, such as authentication and security features. They cannot be disabled.
                        </p>
                    </div>

                    {/* Analytics */}
                    <div className="space-y-2 border border-[#E5E7EB] p-4 rounded-md">
                        <div className="flex justify-between items-start">
                            <h4>Analytics Cookies</h4>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={preferences.analytics}
                                    onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D7377]"></div>
                            </label>
                        </div>
                        <p className="body text-sm text-[#6B7280]">
                            These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously (Vercel Analytics).
                        </p>
                    </div>

                    {/* Error Monitoring */}
                    <div className="space-y-2 border border-[#E5E7EB] p-4 rounded-md">
                        <div className="flex justify-between items-start">
                            <h4>Error Monitoring</h4>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={preferences.error}
                                    onChange={(e) => setPreferences(prev => ({ ...prev, error: e.target.checked }))}
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D7377]"></div>
                            </label>
                        </div>
                        <p className="body text-sm text-[#6B7280]">
                            These cookies allow us to monitor errors and performance issues so we can fix them quickly (Sentry).
                        </p>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#FAFBFC] flex justify-end gap-3">
                    <button
                        className="button border border-[#E5E7EB] rounded-md hover:bg-white"
                        onClick={onClose}
                        style={{ color: '#1B2A4A' }}
                    >
                        Cancel
                    </button>
                    <button
                        className="button bg-[#0D7377] text-white rounded-md hover:bg-[#0A5A5D]"
                        onClick={handleSave}
                    >
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    )
}
