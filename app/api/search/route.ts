import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    // Prisma schema no longer includes the wiki/university graph this search API was built for.
    // Keep the route to avoid breaking clients, but disable the feature.
    await request.json().catch(() => null)
    return Response.json(
        { results: [], totalCount: 0, error: 'Search is no longer supported.' },
        { status: 410 }
    )
}
