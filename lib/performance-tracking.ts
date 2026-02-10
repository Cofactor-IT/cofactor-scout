import { trackApiRequest } from './analytics'

interface ErrorWithStatus extends Error {
    status?: number
}

export function withPerformanceTracking<T extends (...args: unknown[]) => Promise<unknown>>(
    handler: T,
    routeName: string
): T {
    return (async (...args: unknown[]) => {
        const start = Date.now()

        try {
            const result = await handler(...args)
            const duration = Date.now() - start

            trackApiRequest(routeName, 'unknown', duration, 200)
            return result
        } catch (error) {
            const duration = Date.now() - start
            const err = error as ErrorWithStatus
            const status = err?.status || 500
            trackApiRequest(routeName, 'unknown', duration, status)
            throw error
        }
    }) as T
}

export function withRouteTracking<T extends (...args: unknown[]) => Promise<unknown>>(
    handler: T,
    routeName: string
): T {
    return (async (...args: unknown[]) => {
        const start = Date.now()

        try {
            const result = await handler(...args)
            const duration = Date.now() - start

            trackApiRequest(routeName, 'GET', duration, 200)
            return result
        } catch (error) {
            const duration = Date.now() - start
            const err = error as ErrorWithStatus
            const status = err?.status || 500
            trackApiRequest(routeName, 'GET', duration, status)
            throw error
        }
    }) as T
}
