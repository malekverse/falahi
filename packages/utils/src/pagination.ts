export interface PageParams {
  cursor?: string
  limit?: number
}

export interface PageResult<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

export function buildCursorQuery(
  baseQuery: string,
  cursorColumn: string,
  cursorDirection: 'asc' | 'desc' = 'desc',
): { select: string; order: string } {
  return {
    select: `${baseQuery}, ${cursorColumn}`,
    order: `${cursorColumn} ${cursorDirection}`,
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
