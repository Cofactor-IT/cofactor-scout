import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
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

    // Get user session and determine accessible universities
    const session = await getServerSession(authOptions)
    let allowedUniversityIds: string[] | null = null

    if (session?.user) {
        // ADMIN and STAFF can search all universities (null = no filter)
        if (session.user.role === 'ADMIN' || session.user.role === 'STAFF') {
            allowedUniversityIds = null
        } else {
            // STUDENT can only search their own university (and secondary if exists)
            const universityIds: string[] = []
            if (session.user.universityId) {
                universityIds.push(session.user.universityId)
            }
            if (session.user.secondaryUniversityId) {
                universityIds.push(session.user.secondaryUniversityId)
            }
            allowedUniversityIds = universityIds.length > 0 ? universityIds : []
        }
    } else {
        // Unauthenticated users shouldn't reach here due to middleware, but handle gracefully
        allowedUniversityIds = []
    }

    try {
        if (suggestions) {
            const suggestionsList = await getSearchSuggestions(query, 10, allowedUniversityIds)
            return Response.json({ suggestions: suggestionsList })
        }

        const { results, totalCount } = await unifiedSearch(query, {
            type
        }, limit, allowedUniversityIds)

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
