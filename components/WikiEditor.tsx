'use client'

import React, { useState } from 'react'
import { MentionsInput, Mention } from 'react-mentions'

interface WikiEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function WikiEditor({ value, onChange, placeholder }: WikiEditorProps) {
    // Styles for react-mentions need to be passed as an object or imported.
    // We'll use a simple inline style object approach for portability, specific to shadcn/tailwindcss integration if possible.
    // But react-mentions structure is complex. Let's define a basic style object.

    return (
        <div className="wiki-editor-container border rounded-md min-h-[400px] bg-background">
            <MentionsInput
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="mentions-input min-h-[400px] p-2 font-mono text-sm focus:outline-none"
                style={{
                    control: {
                        backgroundColor: 'transparent',
                        fontSize: 14,
                        fontWeight: 'normal',
                        width: '100%',
                    },
                    '&multiLine': {
                        control: {
                            fontFamily: 'monospace',
                            minHeight: 400,
                        },
                        highlighter: {
                            padding: 9,
                            border: '1px solid transparent',
                        },
                        input: {
                            padding: 9,
                            minHeight: 400,
                            border: '0',
                            outline: '0',
                            backgroundColor: 'transparent',
                            color: 'inherit',
                        },
                    },
                    '&singleLine': {
                        display: 'inline-block',
                        width: 180,
                        highlighter: {
                            padding: 1,
                            border: '2px inset transparent',
                        },
                        input: {
                            padding: 1,
                            border: '2px inset',
                        },
                    },
                    suggestions: {
                        list: {
                            backgroundColor: 'white',
                            border: '1px solid rgba(0,0,0,0.15)',
                            fontSize: 14,
                            borderRadius: 4,
                            overflow: 'hidden',
                            zIndex: 1000,
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        },
                        item: {
                            padding: '8px 15px',
                            borderBottom: '1px solid rgba(0,0,0,0.05)',
                            '&focused': {
                                backgroundColor: '#f1f5f9',
                            },
                        },
                    },
                }}
            >
                <Mention
                    trigger="@"
                    data={(query, callback) => {
                        // Allow searching with just 1 character
                        if (query.length === 0) return

                        fetch(`/api/mentions?query=${query}`)
                            .then(res => {
                                if (!res.ok) throw new Error(res.statusText)
                                return res.json()
                            })
                            .then(res => callback(res))
                            .catch(err => {
                                console.error("Mentions API Error:", err)
                                callback([]) // Ensure menu doesn't hang
                            })
                    }}
                    markup="[@__display__](__link__)"
                    displayTransform={(id, display) => `@${display}`}
                    renderSuggestion={(suggestion: any) => (
                        <div className="flex flex-col text-black">
                            <span className="font-bold">{suggestion.display}</span>
                            <span className="text-xs text-muted-foreground">{suggestion.type}</span>
                        </div>
                    )}
                />
            </MentionsInput>
        </div>
    )
}
