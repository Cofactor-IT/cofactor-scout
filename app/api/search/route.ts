import { NextRequest } from 'next/server'
import { unifiedSearch, getSearchSuggestions } from '@/lib/search'
import { searchQuerySchema, searchFiltersSchema } from '@/lib/validation'
import { containsSqlInjection, sanitizeForSql } from '@/lib/sanitization'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const rawQuery = searchParams.get('q') || ''
    const rawType = searchParams.get('type') as 'page' | 'institute' | 'lab' | 'person' | undefined
    const suggestions = searchParams.get('suggestions') === 'true'
    const rawPage = parseInt(searchParams.get('page') || '1', 10)
    const rawLimit = parseInt(searchParams.get('limit') || '20', 10)

    // Validate and sanitize query
    const queryValidation = searchQuerySchema.safeParse(rawQuery)
    if (!queryValidation.success) {
        return Response.json({ results: [], totalCount: 0, error: 'Invalid search query' })
    }
    const query = queryValidation.data

    // Validate filter parameters
    const filtersValidation = searchFiltersSchema.safeParse({
        type: rawType,
        page: rawPage,
        limit: rawLimit
    })
    
    if (!filtersValidation.success) {
        return Response.json({ results: [], totalCount: 0, error: 'Invalid filter parameters' })
    }

    const { page, limit } = filtersValidation.data
    const type = rawType

    // Additional SQL injection check on raw query (defense in depth)
    if (containsSqlInjection(rawQuery)) {
        return Response.json({ results: [], totalCount: 0, error: 'Invalid search query' })
    }

    try {
        if (suggestions) {
            const suggestionsList = await getSearchSuggestions(query, 10)
            return Response.json({ suggestions: suggestionsList })
        }

        const { results, totalCount } = await unifiedSearch(query, {
            type
        }, limit)

        return Response.json({
            results,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            },
            query
        })
    } catch (error) {
        console.error('Search error:', error)
        return Response.json(
            { error: 'Search failed. Please try again.' },
            { status: 500 }
        )
    }
}
