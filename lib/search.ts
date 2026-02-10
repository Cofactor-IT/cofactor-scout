import { prisma } from './prisma'
import { sanitizeForSql, containsSqlInjection } from './sanitization'

interface SearchResult {
    id: string
    type: 'page' | 'institute' | 'lab' | 'person'
    title: string
    content: string
    url: string
    score: number
}

interface SearchFilters {
    universityId?: string
    type?: 'page' | 'institute' | 'lab' | 'person'
}

/**
 * Search wiki pages with SQL injection protection
 * @param allowedUniversityIds - Array of university IDs user can access, or null for all (admin)
 */
export async function searchWiki(query: string, limit: number = 20, allowedUniversityIds?: string[] | null): Promise<SearchResult[]> {
    if (!query || query.length < 2) {
        return []
    }

    // Additional SQL injection check
    if (containsSqlInjection(query)) {
        console.warn('SQL injection attempt detected in search query:', query)
        return []
    }

    const sanitizedQuery = sanitizeForSql(query)
    const pattern = `%${sanitizedQuery}%`

    try {
        // Build WHERE clause with university filtering if needed
        const universityFilter = allowedUniversityIds !== null && allowedUniversityIds !== undefined
            ? `AND up."universityId" = ANY(ARRAY[${allowedUniversityIds.map(id => `'${sanitizeForSql(id)}'`).join(',')}]::text[])`
            : ''

        const results = await prisma.$queryRaw<Array<{
            id: string
            type: string
            title: string
            content: string
            url: string
            score: number
        }>>`
            SELECT
                up.id,
                'page' as type,
                up.name as title,
                LEFT(up.content, 200) as content,
                '/wiki/' || up.slug as url,
                COALESCE(ts_rank_cd(to_tsvector('english', up.name || ' ' || up.content), plainto_tsquery('english', ${sanitizedQuery}::text)), 0) as score
            FROM "UniPage" up
            WHERE
                up.published = true
                ${universityFilter ? `${universityFilter}` : ''}
                AND (
                    up.name ILIKE ${pattern}
                    OR up.content ILIKE ${pattern}
                    OR ${sanitizedQuery}::text = ANY(up.keywords)
                )
            ORDER BY score DESC, up.name ASC
            LIMIT ${limit}
        `

        return results.map(r => ({
            id: r.id,
            type: r.type as 'page',
            title: r.title,
            content: r.content,
            url: r.url,
            score: r.score
        }))
    } catch (error) {
        console.error('Wiki search error:', error)
        return []
    }
}

/**
 * Search institutes
 * @param allowedUniversityIds - Array of university IDs user can access, or null for all (admin)
 */
export async function searchInstitutes(query: string, limit: number = 10, allowedUniversityIds?: string[] | null): Promise<SearchResult[]> {
    if (!query || query.length < 2) {
        return []
    }

    // Additional SQL injection check
    if (containsSqlInjection(query)) {
        console.warn('SQL injection attempt detected in search query:', query)
        return []
    }

    const results = await prisma.institute.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { keywords: { has: query } }
            ],
            approved: true,
            ...(allowedUniversityIds !== null && allowedUniversityIds !== undefined ? {
                universityId: { in: allowedUniversityIds }
            } : {})
        },
        include: {
            university: true
        },
        take: limit,
        orderBy: { name: 'asc' }
    })

    return results.map(inst => ({
        id: inst.id,
        type: 'institute' as const,
        title: inst.name,
        content: `University: ${inst.university?.name || ''}`,
        url: `/wiki/institutes/${inst.slug}`,
        score: 1
    }))
}

/**
 * Search labs
 * @param allowedUniversityIds - Array of university IDs user can access, or null for all (admin)
 */
export async function searchLabs(query: string, limit: number = 10, allowedUniversityIds?: string[] | null): Promise<SearchResult[]> {
    if (!query || query.length < 2) {
        return []
    }

    // Additional SQL injection check
    if (containsSqlInjection(query)) {
        console.warn('SQL injection attempt detected in search query:', query)
        return []
    }

    const results = await prisma.lab.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { keywords: { has: query } }
            ],
            approved: true,
            ...(allowedUniversityIds !== null && allowedUniversityIds !== undefined ? {
                institute: {
                    universityId: { in: allowedUniversityIds }
                }
            } : {})
        },
        include: {
            institute: {
                include: {
                    university: true
                }
            }
        },
        take: limit,
        orderBy: { name: 'asc' }
    })

    return results.map(lab => ({
        id: lab.id,
        type: 'lab' as const,
        title: lab.name,
        content: `Institute: ${lab.institute?.name || ''}`,
        url: `/wiki/labs/${lab.slug}`,
        score: 1
    }))
}

/**
 * Search people
 * @param allowedUniversityIds - Array of university IDs user can access, or null for all (admin)
 */
export async function searchPeople(query: string, limit: number = 10, allowedUniversityIds?: string[] | null): Promise<SearchResult[]> {
    if (!query || query.length < 2) {
        return []
    }

    // Additional SQL injection check
    if (containsSqlInjection(query)) {
        console.warn('SQL injection attempt detected in search query:', query)
        return []
    }

    const results = await prisma.person.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { role: { contains: query, mode: 'insensitive' } },
                { fieldOfStudy: { contains: query, mode: 'insensitive' } },
                { bio: { contains: query, mode: 'insensitive' } },
                { keywords: { has: query } }
            ],
            ...(allowedUniversityIds !== null && allowedUniversityIds !== undefined ? {
                institute: {
                    universityId: { in: allowedUniversityIds }
                }
            } : {})
        },
        take: limit,
        orderBy: { name: 'asc' }
    })

    return results.map(person => ({
        id: person.id,
        type: 'person' as const,
        title: person.name,
        content: `${person.role || ''}${person.fieldOfStudy ? ` · ${person.fieldOfStudy}` : ''}`,
        url: person.slug ? `/wiki/people/${person.slug}` : '#',
        score: 1
    }))
}

/**
 * Unified search across all entities
 * @param allowedUniversityIds - Array of university IDs user can access, or null for all (admin)
 */
export async function unifiedSearch(
    query: string,
    filters?: SearchFilters,
    limit: number = 20,
    allowedUniversityIds?: string[] | null
): Promise<{ results: SearchResult[]; totalCount: number }> {
    if (!query || query.length < 2) {
        return { results: [], totalCount: 0 }
    }

    // Additional SQL injection check
    if (containsSqlInjection(query)) {
        console.warn('SQL injection attempt detected in unified search query:', query)
        return { results: [], totalCount: 0 }
    }

    const [pages, institutes, labs, people] = await Promise.all([
        filters?.type === 'page' || !filters?.type ? searchWiki(query, limit, allowedUniversityIds) : Promise.resolve([]),
        filters?.type === 'institute' || !filters?.type ? searchInstitutes(query, limit, allowedUniversityIds) : Promise.resolve([]),
        filters?.type === 'lab' || !filters?.type ? searchLabs(query, limit, allowedUniversityIds) : Promise.resolve([]),
        filters?.type === 'person' || !filters?.type ? searchPeople(query, limit, allowedUniversityIds) : Promise.resolve([])
    ])

    const allResults = [...pages, ...institutes, ...labs, ...people]

    const totalCount = allResults.length
    allResults.sort((a, b) => b.score - a.score)

    return {
        results: allResults.slice(0, limit),
        totalCount
    }
}

/**
 * Get search suggestions
 * @param allowedUniversityIds - Array of university IDs user can access, or null for all (admin)
 */
export async function getSearchSuggestions(query: string, limit: number = 5, allowedUniversityIds?: string[] | null): Promise<string[]> {
    if (!query || query.length < 2) {
        return []
    }

    // Additional SQL injection check
    if (containsSqlInjection(query)) {
        console.warn('SQL injection attempt detected in suggestions query:', query)
        return []
    }

    const [pages, institutes, labs, people] = await Promise.all([
        searchWiki(query, limit, allowedUniversityIds),
        searchInstitutes(query, limit, allowedUniversityIds),
        searchLabs(query, limit, allowedUniversityIds),
        searchPeople(query, limit, allowedUniversityIds)
    ])

    return [
        ...pages.map(p => p.title),
        ...institutes.map(i => i.title),
        ...labs.map(l => l.title),
        ...people.map(p => p.title)
    ].slice(0, limit)
}

/**
 * Highlight search terms in content
 */
export function highlightSearchTerms(content: string, query: string): string {
    if (!query) return content

    // Sanitize query for regex
    const sanitizedQuery = sanitizeForSql(query)
    const terms = sanitizedQuery.split(/\s+/).filter(term => term.length > 2)
    let highlightedContent = content

    terms.forEach(term => {
        // Escape special regex characters
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`(${escapedTerm})`, 'gi')
        highlightedContent = highlightedContent.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
    })

    return highlightedContent
}

/**
 * Track search query for analytics
 */
export async function trackSearchQuery(query: string, resultsCount: number, userId?: string): Promise<void> {
    try {
        // Additional SQL injection check
        if (containsSqlInjection(query)) {
            console.warn('SQL injection attempt detected in tracked query:', query)
            return
        }

        const sanitizedQuery = sanitizeForSql(query)

        if (process.env.NODE_ENV === 'production') {
            await prisma.$executeRaw`
                INSERT INTO "SearchAnalytics" (query, results_count, user_id, created_at)
                VALUES (${sanitizedQuery}, ${resultsCount}, ${userId || null}, NOW())
                ON CONFLICT DO NOTHING
            `
        }
    } catch (error) {
        console.error('Failed to track search query:', error)
    }
}
