"use client"

import { useState, useEffect } from 'react'

type ConsentState = {
    analytics: boolean;
    error: boolean;
    version: number;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (consent: ConsentState) => void;
    initialState: ConsentState;
}

export function CookieModal({ isOpen, onClose, onSave, initialState }: ModalProps) {
    const [preferences, setPreferences] = useState<ConsentState>(initialState)

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setPreferences(initialState)
        }
    }, [isOpen, initialState])

    if (!isOpen) return null

    const handleSave = () => {
        onSave(preferences)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-white max-w-lg w-full rounded-lg shadow-xl overflow-hidden border">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-foreground">Cookie Preferences</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    <p className="text-sm text-muted-foreground">
                        We use cookies to ensure the basic functionalities of the website and to enhance your online experience.
                        You can choose for each category to opt-in/out whenever you want.
                    </p>

                    {/* Strictly Necessary */}
                    <div className="space-y-2 border p-4 rounded-md bg-muted/30">
                        <div className="flex justify-between items-start">
                            <h3 className="font-medium text-foreground">Strictly Necessary Cookies</h3>
                            <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">Always On</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            These cookies are essential for the proper functioning of the website, such as authentication and security features. They cannot be disabled.
                        </p>
                    </div>

                    {/* Analytics */}
                    <div className="space-y-2 border p-4 rounded-md">
                        <div className="flex justify-between items-start">
                            <h3 className="font-medium text-foreground">Analytics Cookies</h3>
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
                        <p className="text-sm text-muted-foreground">
                            These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously (Vercel Analytics).
                        </p>
                    </div>

                    {/* Error Monitoring */}
                    <div className="space-y-2 border p-4 rounded-md">
                        <div className="flex justify-between items-start">
                            <h3 className="font-medium text-foreground">Error Monitoring</h3>
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
                        <p className="text-sm text-muted-foreground">
                            These cookies allow us to monitor errors and performance issues so we can fix them quickly (Sentry).
                        </p>
                    </div>
                </div>

                <div className="px-6 py-4 border-t bg-muted/10 flex justify-end gap-3">
                    <button
                        className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        onClick={handleSave}
                    >
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    )
}
