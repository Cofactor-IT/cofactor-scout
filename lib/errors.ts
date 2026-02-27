/**
 * Error Classes
 * 
 * Standardized error classes for consistent error handling throughout the application.
 * All errors extend AppError with specific status codes and error codes.
 */

export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500,
        public context?: Record<string, unknown>
    ) {
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace?.(this, this.constructor)
    }

    toJSON() {
        return {
            error: this.message,
            code: this.code,
            ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
        }
    }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'VALIDATION_ERROR', 400, context)
    }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 'AUTHENTICATION_ERROR', 401)
    }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends AppError {
    constructor(message: string = 'Access denied') {
        super(message, 'AUTHORIZATION_ERROR', 403)
    }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
    constructor(resource: string, identifier?: string) {
        super(
            identifier ? `${resource} not found: ${identifier}` : `${resource} not found`,
            'NOT_FOUND',
            404,
            { resource, identifier }
        )
    }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
    constructor(retryAfter?: number) {
        super(
            retryAfter ? `Rate limit exceeded. Try again in ${retryAfter} seconds.` : 'Rate limit exceeded',
            'RATE_LIMIT',
            429,
            { retryAfter }
        )
    }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 'CONFLICT', 409)
    }
}

/**
 * Database error (500)
 */
export class DatabaseError extends AppError {
    constructor(message: string = 'Database operation failed', context?: Record<string, unknown>) {
        super(message, 'DATABASE_ERROR', 500, context)
    }
}

/**
 * External service error (502)
 */
export class ExternalServiceError extends AppError {
    constructor(service: string, message: string) {
        super(`${service} service error: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, { service })
    }
}

/**
 * Type guard to check if an error is an AppError
 * 
 * @param error - Error to check
 * @returns True if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError
}

/**
 * Convert unknown error to AppError
 * 
 * @param error - Error to convert
 * @returns AppError instance
 */
export function toAppError(error: unknown): AppError {
    if (isAppError(error)) {
        return error
    }

    if (error instanceof Error) {
        return new AppError(error.message, 'UNKNOWN_ERROR', 500)
    }

    return new AppError(String(error), 'UNKNOWN_ERROR', 500)
}
