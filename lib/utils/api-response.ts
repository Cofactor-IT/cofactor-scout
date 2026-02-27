/**
 * API Response Utilities
 * 
 * Standardized response helpers for API routes and server actions.
 * Provides consistent success/error response formats.
 */

import { AppError } from '@/lib/errors'

export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: {
        message: string
        code: string
    }
    meta?: {
        timestamp: string
        requestId?: string
    }
}

/**
 * Create a successful API response
 * 
 * @param data - Response data
 * @param meta - Optional metadata
 * @returns Standardized success response
 */
export function success<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
    return {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            ...meta
        }
    }
}

/**
 * Create an error API response
 * 
 * @param err - Error object or message
 * @param code - Optional error code
 * @returns Standardized error response
 */
export function error(err: AppError | string, code?: string): ApiResponse {
    if (err instanceof AppError) {
        return {
            success: false,
            error: {
                message: err.message,
                code: err.code
            },
            meta: {
                timestamp: new Date().toISOString()
            }
        }
    }

    return {
        success: false,
        error: {
            message: err,
            code: code || 'UNKNOWN_ERROR'
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    }
}

/**
 * Create a successful action response (simplified format)
 * 
 * @param data - Optional response data
 * @returns Success object
 */
export function actionSuccess<T>(data?: T): { success: true; data?: T } {
    return { success: true, ...(data !== undefined && { data }) }
}

/**
 * Create an error action response (simplified format)
 * 
 * @param message - Error message
 * @returns Error object
 */
export function actionError(message: string): { success: false; error: string } {
    return { success: false, error: message }
}

/**
 * Wrapper for async actions to standardize error handling
 * 
 * @param action - Async function to execute
 * @param errorMessage - Default error message
 * @returns Success or error response
 */
export async function withActionHandling<T>(
    action: () => Promise<T>,
    errorMessage: string = 'An unexpected error occurred'
): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
        const result = await action()
        return { success: true, data: result }
    } catch (err) {
        console.error(errorMessage, err)
        return actionError(err instanceof Error ? err.message : errorMessage)
    }
}

/**
 * Wrapper for form actions with validation
 * 
 * @param formData - Form data to validate
 * @param validator - Validation function
 * @param action - Action to execute with validated data
 * @returns Success or error response
 */
export async function withFormHandling<T>(
    formData: FormData,
    validator: (data: FormData) => { success: true; data: T } | { success: false; errors: string[] },
    action: (validatedData: T) => Promise<unknown>
): Promise<{ success: true } | { success: false; error: string }> {
    const validation = validator(formData)

    if (!validation.success) {
        return actionError(validation.errors.join(', '))
    }

    try {
        await action(validation.data)
        return { success: true }
    } catch (err) {
        console.error('Form action failed:', err)
        return actionError(err instanceof Error ? err.message : 'Action failed')
    }
}
