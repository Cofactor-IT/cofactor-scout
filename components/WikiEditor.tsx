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
                        },
                        item: {
                            padding: '5px 15px',
                            borderBottom: '1px solid rgba(0,0,0,0.15)',
                            '&focused': {
                                backgroundColor: '#cee4e5',
                            },
                        },
                    },
                }}
            >
                <Mention
                    trigger="@"
                    data={(query, callback) => {
                        if (query.length < 2) return
                        fetch(`/api/mentions?query=${query}`)
                            .then(res => res.json())
                            .then(res => callback(res))
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
