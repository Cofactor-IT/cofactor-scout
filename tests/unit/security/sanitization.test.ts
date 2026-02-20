import { describe, it, expect } from 'vitest'
import {
  sanitizeName,
  sanitizeString,
  sanitizeBio,
  containsSqlInjection,
  validateAndSanitizeUrl,
  validateSocialUrl,
  sanitizeSearchQuery,
  safeJsonParse,
  removeZeroWidthChars,
  normalizeUnicode,
  normalizeWhitespace
} from '@/lib/security/sanitization'

describe('sanitizeName', () => {
  it('should accept valid names', () => {
    const result = sanitizeName('John Doe')
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('John Doe')
  })

  it('should trim whitespace', () => {
    const result = sanitizeName('  John Doe  ')
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('John Doe')
  })

  it('should normalize multiple spaces', () => {
    const result = sanitizeName('John    Doe')
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('John Doe')
  })

  it('should accept names with hyphens', () => {
    const result = sanitizeName('Mary-Jane Smith')
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('Mary-Jane Smith')
  })

  it('should accept names with apostrophes', () => {
    const result = sanitizeName("O'Brien")
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe("O'Brien")
  })

  it('should reject names with numbers', () => {
    const result = sanitizeName('John123')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Name contains invalid characters')
  })

  it('should reject names with HTML characters', () => {
    const result = sanitizeName('John<script>')
    expect(result.isValid).toBe(false)
  })

  it('should reject names that are too short', () => {
    const result = sanitizeName('J')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Name must be at least 2 characters')
  })

  it('should reject names that are too long', () => {
    const result = sanitizeName('a'.repeat(101))
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('must be no more than')
  })
})

describe('sanitizeString', () => {
  it('should sanitize basic strings', () => {
    const result = sanitizeString('Hello World')
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('Hello World')
  })

  it('should remove zero-width characters', () => {
    const result = sanitizeString('Hello\u200BWorld')
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('HelloWorld')
  })

  it('should normalize whitespace', () => {
    const result = sanitizeString('Hello    World')
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('Hello World')
  })

  it('should remove HTML by default', () => {
    const result = sanitizeString('Hello <script>alert("xss")</script>')
    expect(result.isValid).toBe(true)
    expect(result.sanitized).not.toContain('<')
    expect(result.sanitized).not.toContain('>')
  })

  it('should enforce max length', () => {
    const result = sanitizeString('a'.repeat(300), { maxLength: 100 })
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('no more than 100 characters')
  })

  it('should enforce min length', () => {
    const result = sanitizeString('a', { minLength: 5 })
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('at least 5 characters')
  })

  it('should allow newlines when specified', () => {
    const result = sanitizeString('Line 1\nLine 2', { allowNewlines: true })
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toContain('\n')
  })

  it('should remove newlines by default', () => {
    const result = sanitizeString('Line 1\nLine 2', { allowNewlines: false })
    expect(result.isValid).toBe(true)
    expect(result.sanitized).not.toContain('\n')
  })
})

describe('sanitizeBio', () => {
  it('should sanitize bio text', () => {
    const result = sanitizeBio('I am a researcher at MIT.')
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('I am a researcher at MIT.')
  })

  it('should allow newlines in bio', () => {
    const result = sanitizeBio('Line 1\nLine 2')
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toContain('\n')
  })

  it('should enforce max length', () => {
    const result = sanitizeBio('a'.repeat(1001))
    expect(result.isValid).toBe(false)
  })
})

describe('containsSqlInjection', () => {
  it('should detect SQL keywords with quotes', () => {
    expect(containsSqlInjection("SELECT * FROM users WHERE id='1'")).toBe(true)
    expect(containsSqlInjection("admin' OR '1'='1")).toBe(true)
    expect(containsSqlInjection('DROP TABLE users;')).toBe(true)
  })

  it('should detect comment syntax', () => {
    expect(containsSqlInjection('admin --')).toBe(true)
    expect(containsSqlInjection('admin /* comment */')).toBe(true)
    expect(containsSqlInjection('admin #')).toBe(true)
  })

  it('should detect time-based injection', () => {
    expect(containsSqlInjection('WAITFOR DELAY')).toBe(true)
    expect(containsSqlInjection('SLEEP(5)')).toBe(true)
  })

  it('should allow normal text', () => {
    expect(containsSqlInjection('John Doe')).toBe(false)
    expect(containsSqlInjection('john@example.com')).toBe(false)
    expect(containsSqlInjection('My research on AI')).toBe(false)
  })
})

describe('validateAndSanitizeUrl', () => {
  it('should validate valid URLs', () => {
    const result = validateAndSanitizeUrl('https://example.com')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedUrl).toBe('https://example.com/')
  })

  it('should add https:// if missing', () => {
    const result = validateAndSanitizeUrl('example.com')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedUrl).toBe('https://example.com/')
  })

  it('should reject dangerous protocols', () => {
    expect(validateAndSanitizeUrl('javascript:alert(1)').isValid).toBe(false)
    expect(validateAndSanitizeUrl('data:text/html,<script>').isValid).toBe(false)
    expect(validateAndSanitizeUrl('vbscript:msgbox').isValid).toBe(false)
    expect(validateAndSanitizeUrl('file:///etc/passwd').isValid).toBe(false)
  })

  it('should reject empty URLs', () => {
    const result = validateAndSanitizeUrl('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('URL is required')
  })

  it('should reject URLs that are too long', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2100)
    const result = validateAndSanitizeUrl(longUrl)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('URL is too long')
  })
})

describe('validateSocialUrl', () => {
  it('should validate LinkedIn URLs', () => {
    const result = validateSocialUrl('https://www.linkedin.com/in/johndoe', 'linkedin')
    expect(result.isValid).toBe(true)
  })

  it('should validate Twitter URLs', () => {
    const result1 = validateSocialUrl('https://twitter.com/johndoe', 'twitter')
    expect(result1.isValid).toBe(true)
    
    const result2 = validateSocialUrl('https://x.com/johndoe', 'twitter')
    expect(result2.isValid).toBe(true)
  })

  it('should validate Google Scholar URLs', () => {
    const result = validateSocialUrl('https://scholar.google.com/citations?user=abc123', 'googleScholar')
    expect(result.isValid).toBe(true)
  })

  it('should reject wrong platform URLs', () => {
    const result = validateSocialUrl('https://twitter.com/johndoe', 'linkedin')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('Invalid linkedin URL')
  })
})

describe('sanitizeSearchQuery', () => {
  it('should sanitize valid search queries', () => {
    const result = sanitizeSearchQuery('machine learning')
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('machine learning')
  })

  it('should remove special characters', () => {
    const result = sanitizeSearchQuery('machine<learning>')
    expect(result.isValid).toBe(true)
    expect(result.sanitized).not.toContain('<')
    expect(result.sanitized).not.toContain('>')
  })

  it('should detect SQL injection patterns', () => {
    const result = sanitizeSearchQuery("SELECT * FROM users")
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Invalid search query')
  })

  it('should enforce max length', () => {
    const result = sanitizeSearchQuery('a'.repeat(101))
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('too long')
  })

  it('should enforce min length', () => {
    const result = sanitizeSearchQuery('a')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('at least 2 characters')
  })
})

describe('safeJsonParse', () => {
  it('should parse valid JSON', () => {
    const result = safeJsonParse('{"name":"John","age":30}')
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ name: 'John', age: 30 })
  })

  it('should reject JSON with __proto__', () => {
    const result = safeJsonParse('{"__proto__":{"isAdmin":true}}')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid JSON content')
  })

  it('should reject JSON with constructor', () => {
    const result = safeJsonParse('{"constructor":{"prototype":{"isAdmin":true}}}')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid JSON content')
  })

  it('should reject invalid JSON', () => {
    const result = safeJsonParse('not json')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid JSON format')
  })
})

describe('removeZeroWidthChars', () => {
  it('should remove zero-width characters', () => {
    const input = 'Hello\u200BWorld\u200C\u200D\uFEFF'
    const result = removeZeroWidthChars(input)
    expect(result).toBe('HelloWorld')
  })

  it('should not affect normal text', () => {
    const input = 'Hello World'
    const result = removeZeroWidthChars(input)
    expect(result).toBe('Hello World')
  })
})

describe('normalizeUnicode', () => {
  it('should normalize Unicode to NFKC', () => {
    const input = 'café' // é as combining characters
    const result = normalizeUnicode(input)
    expect(result).toBe('café') // é as single character
  })
})

describe('normalizeWhitespace', () => {
  it('should normalize multiple spaces', () => {
    const result = normalizeWhitespace('Hello    World')
    expect(result).toBe('Hello World')
  })

  it('should trim leading and trailing whitespace', () => {
    const result = normalizeWhitespace('  Hello World  ')
    expect(result).toBe('Hello World')
  })

  it('should remove control characters', () => {
    const result = normalizeWhitespace('Hello\x00World')
    expect(result).toBe('HelloWorld')
  })
})
