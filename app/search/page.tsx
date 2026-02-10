'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search as SearchIcon, X } from 'lucide-react'

interface SearchResult {
    id: string
    type: 'page' | 'institute' | 'lab' | 'person'
    title: string
    content: string
    url: string
    score: number
}

export default function SearchPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const queryParam = searchParams.get('q') || ''
    const typeParam = searchParams.get('type') as 'page' | 'institute' | 'lab' | 'person' | 'all' || 'all'
    const page = parseInt(searchParams.get('page') || '1', 10)

    const [query, setQuery] = useState(queryParam)
    const [type, setType] = useState(typeParam)
    const [results, setResults] = useState<SearchResult[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    useEffect(() => {
        async function fetchResults() {
            if (!query || query.length < 2) {
                setResults([])
                setTotalCount(0)
                setHasSearched(false)
                return
            }

            try {
                setIsLoading(true)
                setHasSearched(true)
                const url = `/api/search?q=${encodeURIComponent(query)}&type=${type === 'all' ? '' : type}&page=${page}&limit=20`
                const response = await fetch(url)
                const data = await response.json()
                setResults(data.results || [])
                setTotalCount(data.pagination?.total || 0)
            } catch (error) {
                console.error('Search failed:', error)
                setResults([])
                setTotalCount(0)
            } finally {
                setIsLoading(false)
            }
        }

        if (queryParam) {
            fetchResults()
        }
    }, [queryParam, type, page, query])

    const handleSearch = (e: FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (query.trim()) {
            params.set('q', query.trim())
        }
        if (type !== 'all') {
            params.set('type', type)
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleTypeChange = (newType: string) => {
        setType(newType as 'page' | 'institute' | 'lab' | 'person' | 'all')
        const params = new URLSearchParams(searchParams)
        if (newType !== 'all') {
            params.set('type', newType)
        } else {
            params.delete('type')
        }
        params.set('page', '1')
        router.push(`${pathname}?${params.toString()}`)
    }

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', newPage.toString())
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-4">Search</h1>

                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search wiki pages, institutes, labs, people..."
                                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Search
                        </button>
                    </form>

                    <div className="flex gap-2 mt-4">
                        <select
                            value={type}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            className="bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                        >
                            <option value="all">All Content</option>
                            <option value="page">Pages</option>
                            <option value="institute">Institutes</option>
                            <option value="lab">Labs</option>
                            <option value="person">People</option>
                        </select>
                    </div>

                    {hasSearched && !isLoading && (
                        <p className="text-muted-foreground mt-2">
                            Found {totalCount} result{totalCount !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {isLoading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-border border-t-primary"></div>
                        <p className="mt-4 text-muted-foreground">Searching...</p>
                    </div>
                )}

                {!isLoading && hasSearched && results.length === 0 && (
                    <div className="text-center py-12">
                        <X className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
                        <p className="text-foreground text-lg">
                            No results found for &quot;{query}&quot;
                        </p>
                        <p className="text-muted-foreground mt-2">
                            Try different search terms or filters
                        </p>
                    </div>
                )}

                {!isLoading && hasSearched && results.length > 0 && (
                    <div className="space-y-4">
                        {results.map((result) => (
                            <div
                                key={`${result.type}-${result.id}`}
                                className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`px-3 py-1 rounded text-white text-xs font-semibold ${result.type === 'page' ? 'bg-blue-600 dark:bg-blue-500' :
                                            result.type === 'institute' ? 'bg-green-600 dark:bg-green-500' :
                                                result.type === 'lab' ? 'bg-purple-600 dark:bg-purple-500' :
                                                    'bg-gray-600 dark:bg-gray-500'
                                        }`}>
                                        {result.type}
                                    </div>
                                    <div className="flex-1">
                                        <a
                                            href={result.url}
                                            className="text-lg font-semibold text-foreground hover:text-primary"
                                        >
                                            {result.title}
                                        </a>
                                        {result.content && (
                                            <p className="text-muted-foreground mt-1 line-clamp-2">
                                                {result.content}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && hasSearched && totalCount > 20 && (
                    <div className="flex justify-center gap-2 mt-8">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-background text-foreground hover:bg-muted border border-border"
                        >
                            Previous
                        </button>
                        {Array.from({ length: Math.min(5, Math.ceil(totalCount / 20)) }).map((_, i) => {
                            const pageNum = Math.max(1, page - 2) + i
                            if (pageNum > Math.ceil(totalCount / 20)) return null
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-4 py-2 rounded-lg ${page === pageNum
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-background text-foreground hover:bg-muted border border-border'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= Math.ceil(totalCount / 20)}
                            className="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-background text-foreground hover:bg-muted border border-border"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
