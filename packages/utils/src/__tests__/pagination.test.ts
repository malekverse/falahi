import { describe, it, expect } from 'vitest'
import { encodeCursor, decodeCursor, cursorResponse } from '../pagination'

interface TestItem { id: number; created_at: string }

describe('cursor encoding/decoding', () => {
  it('encodes and decodes a cursor with numeric id', () => {
    const original = { createdAt: '2024-01-01T00:00:00Z', id: 42 }
    const encoded = encodeCursor(original)
    const decoded = decodeCursor(encoded)
    expect(decoded.createdAt).toBe(original.createdAt)
    expect(decoded.id).toBe(42)
  })

  it('decodes string IDs', () => {
    const original = { createdAt: '2024-06-15T12:30:00Z', id: 'abc-123' }
    const encoded = encodeCursor(original)
    const decoded = decodeCursor(encoded)
    expect(decoded.createdAt).toBe(original.createdAt)
    expect(decoded.id).toBe('abc-123')
  })

  it('produces valid base64 output', () => {
    const original = { createdAt: '2024-01-01T00:00:00Z', id: 1 }
    const encoded = encodeCursor(original)
    expect(() => atob(encoded)).not.toThrow()
  })
})

describe('cursorResponse', () => {
  it('returns hasMore=false when items fewer than limit', () => {
    const result = cursorResponse<TestItem>([{ id: 1, created_at: '2024-01-01T00:00:00Z' }], 20)
    expect(result.hasMore).toBe(false)
    expect(result.nextCursor).toBeNull()
    expect(result.items).toHaveLength(1)
  })

  it('returns hasMore=true and nextCursor when items equal limit+1', () => {
    const items: TestItem[] = Array.from({ length: 21 }, (_, i) => ({
      id: i + 1,
      created_at: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
    }))
    const result = cursorResponse(items, 20)
    expect(result.hasMore).toBe(true)
    expect(result.nextCursor).toBeDefined()
    expect(result.items).toHaveLength(20)
  })

  it('strips the extra item and uses it as cursor', () => {
    const items: TestItem[] = Array.from({ length: 21 }, (_, i) => ({
      id: i + 1,
      created_at: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
    }))
    const result = cursorResponse(items, 20)
    expect(result.items).toHaveLength(20)
    expect(result.items[19].id).toBe(20)
  })
})
