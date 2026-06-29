export interface PageParams {
  cursor?: string
  limit?: number
}

export interface PageResult<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

export interface CursorData {
  createdAt: string
  id: number | string
}

function toBase64(str: string): string {
  try {
    return btoa(str)
  } catch { return Buffer.from(str).toString('base64') }
}

function fromBase64(str: string): string {
  try {
    return atob(str)
  } catch { return Buffer.from(str, 'base64').toString('utf-8') }
}

export function encodeCursor(data: CursorData): string {
  return toBase64(`${data.createdAt}|${data.id}`)
}

export function decodeCursor(cursor: string): CursorData {
  const decoded = fromBase64(cursor)
  const sep = decoded.lastIndexOf('|')
  return { createdAt: decoded.slice(0, sep), id: decoded.slice(sep + 1) }
}

export function cursorResponse<T extends { created_at: string; id: number | string }>(
  items: T[],
  limit: number,
): PageResult<T> {
  if (items.length === 0) return { items, nextCursor: null, hasMore: false }
  const last = items[items.length - 1]
  return {
    items,
    nextCursor: items.length >= limit ? encodeCursor({ createdAt: last.created_at, id: last.id }) : null,
    hasMore: items.length >= limit,
  }
}

export function getOffset(params: PageParams): number {
  return params.cursor ? Number(params.cursor) : 0
}

export function offsetResponse<T>(
  items: T[],
  offset: number,
  limit: number,
): PageResult<T> {
  const nextOffset = offset + items.length
  return {
    items,
    nextCursor: items.length >= limit ? String(nextOffset) : null,
    hasMore: items.length >= limit,
  }
}
