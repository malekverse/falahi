interface CacheEntry<T> {
  data: T
  staleAt: number
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

export function swrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 10_000,
  swrMs = 60_000,
): Promise<T> {
  const now = Date.now()
  const entry = store.get(key) as CacheEntry<T> | undefined

  if (entry && now < entry.staleAt) {
    return Promise.resolve(entry.data)
  }

  if (entry && now < entry.expiresAt) {
    const promise = fetcher().then((data) => {
      store.set(key, { data, staleAt: Date.now() + ttlMs, expiresAt: Date.now() + swrMs })
      return data
    })
    return Promise.resolve(entry.data)
  }

  return fetcher().then((data) => {
    store.set(key, { data, staleAt: Date.now() + ttlMs, expiresAt: Date.now() + swrMs })
    return data
  })
}
