import { describe, it, expect } from 'vitest'
import { sanitizeText, sanitizePhone, sanitizePlate, clampLength, sanitizeWithMaxLength } from '../sanitize'

describe('sanitizeText', () => {
  it('strips HTML tags', () => {
    expect(sanitizeText('<script>alert("xss")</script>hello')).toBe('alert("xss")hello')
  })

  it('strips lone angle brackets by removing HTML-like tags', () => {
    expect(sanitizeText('foo < bar > baz')).toBe('foo  baz')
  })

  it('trims whitespace', () => {
    expect(sanitizeText('  hello world  ')).toBe('hello world')
  })

  it('clamps to max length', () => {
    const long = 'a'.repeat(1000)
    expect(sanitizeText(long, 10)).toBe('a'.repeat(10))
  })

  it('defaults to 500 max length', () => {
    const long = 'a'.repeat(600)
    expect(sanitizeText(long)).toBe('a'.repeat(500))
  })

  it('preserves normal text', () => {
    expect(sanitizeText('Hello, هذا اختبار!')).toBe('Hello, هذا اختبار!')
  })
})

describe('sanitizePhone', () => {
  it('keeps only digits and +', () => {
    expect(sanitizePhone('+216 55 123 456')).toBe('+21655123456')
  })

  it('removes letters', () => {
    expect(sanitizePhone('abc+21655def')).toBe('+21655')
  })

  it('clamps to 15 chars', () => {
    expect(sanitizePhone('+21699123456789012345')).toBe('+21699123456789')
  })
})

describe('sanitizePlate', () => {
  it('uppercases and clamps to 12 chars', () => {
    expect(sanitizePlate('123 tunis 456')).toBe('123 TUNIS 45')
  })

  it('removes underscores and special chars', () => {
    expect(sanitizePlate('123_TN_456!')).toBe('123TN456')
  })

  it('clamps to 12 chars', () => {
    expect(sanitizePlate('12345678901234567890')).toBe('123456789012')
  })

  it('trims result', () => {
    expect(sanitizePlate('  ABC 123  ')).toBe('ABC 123')
  })
})

describe('clampLength', () => {
  it('slices at max', () => {
    expect(clampLength('hello world', 5)).toBe('hello')
  })

  it('returns full string if within max', () => {
    expect(clampLength('hi', 5)).toBe('hi')
  })
})

describe('sanitizeWithMaxLength', () => {
  it('uses appropriate max from constant', () => {
    expect(sanitizeWithMaxLength('<b>hello</b>', 'productName')).toBe('hello')
  })

  it('clamps to the correct max length', () => {
    const long = 'x'.repeat(300)
    expect(sanitizeWithMaxLength(long, 'productName')).toBe('x'.repeat(200))
  })
})
