'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search as SearchIcon, X } from 'lucide-react'

export function SearchBar() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(true)
            }
            if (e.key === 'Escape') {
                setIsOpen(false)
                setShowSuggestions(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        async function fetchSuggestions() {
            if (query.length >= 2) {
                try {
                    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&suggestions=true`)
                    const data = await response.json()
                    setSuggestions(data.suggestions || [])
                } catch (error) {
                    console.error('Failed to fetch suggestions:', error)
                    setSuggestions([])
                }
            } else {
                setSuggestions([])
            }
        }

        const timeoutId = setTimeout(fetchSuggestions, 300)
        return () => clearTimeout(timeoutId)
    }, [query])

    const handleSearch = (e: FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`)
            setIsOpen(false)
            setShowSuggestions(false)
        }
    }

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion)
        router.push(`/search?q=${encodeURIComponent(suggestion)}`)
        setIsOpen(false)
        setShowSuggestions(false)
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
                aria-label="Search"
                title="Search (Ctrl+K)"
            >
                <SearchIcon size={20} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/20 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-96 bg-popover rounded-lg shadow-xl border border-border z-50">
                        <form onSubmit={handleSearch} className="p-4">
                            <div className="flex items-center gap-2">
                                <SearchIcon className="text-muted-foreground" size={20} />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value)
                                        setShowSuggestions(e.target.value.length >= 2)
                                    }}
                                    placeholder="Search wiki..."
                                    className="flex-1 px-2 py-1 focus:outline-none bg-transparent text-foreground"
                                    autoFocus
                                />
                                <kbd className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                    ESC
                                </kbd>
                            </div>
                        </form>

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="border-t border-border max-h-64 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2"
                                    >
                                        <SearchIcon size={14} className="text-muted-foreground" />
                                        <span className="text-sm text-foreground">{suggestion}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {showSuggestions && suggestions.length === 0 && query.length >= 2 && (
                            <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                                No suggestions found
                            </div>
                        )}

                        <div className="border-t border-border px-4 py-2 flex justify-between items-center">
                            <div className="text-xs text-muted-foreground">
                                Use <kbd className="bg-muted px-1 rounded">Ctrl</kbd> +{' '}
                                <kbd className="bg-muted px-1 rounded">K</kbd> to open
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
