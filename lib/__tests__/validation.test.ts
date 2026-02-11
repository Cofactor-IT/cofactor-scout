import { describe, it, expect } from 'vitest'
import { wikiSubmissionSchema } from '../validation'

describe('wikiSubmissionSchema', () => {
    describe('Happy Path', () => {
        it('should accept valid title and content', () => {
            const validData = {
                title: 'Valid Title',
                content: 'This is some valid content.'
            }
            const result = wikiSubmissionSchema.safeParse(validData)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual(validData)
            }
        })

        it('should sanitize title by removing extra whitespace', () => {
            const data = {
                title: '  Extra   Whitespace  ',
                content: 'Content'
            }
            const result = wikiSubmissionSchema.safeParse(data)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.title).toBe('Extra Whitespace')
            }
        })
    })

    describe('Title Validation', () => {
        it('should fail when title is empty', () => {
            const data = {
                title: '',
                content: 'Content'
            }
            const result = wikiSubmissionSchema.safeParse(data)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Title is required')
            }
        })

        it('should fail when title is too long', () => {
            const longTitle = 'a'.repeat(201)
            const data = {
                title: longTitle,
                content: 'Content'
            }
            const result = wikiSubmissionSchema.safeParse(data)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Title is too long')
            }
        })

        it('should fail when title contains only whitespace', () => {
            const data = {
                title: '   ',
                content: 'Content'
            }
            const result = wikiSubmissionSchema.safeParse(data)
            expect(result.success).toBe(false)
        })

        it('should sanitize HTML from title', () => {
            const data = {
                title: '<b>Bold Title</b>',
                content: 'Content'
            }
            const result = wikiSubmissionSchema.safeParse(data)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.title).toBe('Bold Title')
            }
        })

        it('should fail if title becomes empty after sanitization', () => {
            const data = {
                title: '<div></div>',
                content: 'Content'
            }
            const result = wikiSubmissionSchema.safeParse(data)
            expect(result.success).toBe(false)
        })

         it('should replace newlines with spaces in title', () => {
            const data = {
                title: 'Line\nBreak',
                content: 'Content'
            }
            const result = wikiSubmissionSchema.safeParse(data)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.title).toBe('Line Break')
            }
        })
    })

    describe('Content Validation', () => {
        it('should fail when content is empty', () => {
            const data = {
                title: 'Title',
                content: ''
            }
            const result = wikiSubmissionSchema.safeParse(data)
            expect(result.success).toBe(false)
             if (!result.success) {
                expect(result.error.issues[0].message).toContain('Content is required')
            }
        })

        it('should fail when content is too long', () => {
            const longContent = 'a'.repeat(100001)
            const data = {
                title: 'Title',
                content: longContent
            }
            const result = wikiSubmissionSchema.safeParse(data)
            expect(result.success).toBe(false)
             if (!result.success) {
                expect(result.error.issues[0].message).toContain('Content is too long')
            }
        })
    })
})
