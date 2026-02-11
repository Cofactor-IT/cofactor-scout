import { expect, test, describe } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  test('merges class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  test('handles conditional classes', () => {
    expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2')
  })

  test('handles arrays', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2')
  })

  test('handles undefined, null, and boolean values', () => {
    expect(cn('class1', undefined, null, false, true && 'class2')).toBe('class1 class2')
  })

  test('merges tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'p-4')).toBe('p-4')
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  })

  test('handles complex combinations', () => {
    expect(cn('text-base', ['p-4', { 'bg-red-500': false, 'bg-blue-500': true }])).toBe('text-base p-4 bg-blue-500')
  })
})
