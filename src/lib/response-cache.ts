export type ResponseCache = Record<string, { savedAt: number; json: string }>;

// Store serialized responses: chart/account consumers mutate the returned data.
export function cacheResponse(cache: ResponseCache, key: string, response: unknown): ResponseCache {
  const next = { ...cache, [key]: { savedAt: Date.now(), json: JSON.stringify(response) } };
  const keys = Object.keys(next).sort((a, b) => next[b].savedAt - next[a].savedAt || (a === key ? -1 : b === key ? 1 : 0));
  let characters = 0;
  const result: ResponseCache = {};
  keys.forEach((entry) => {
    const size = next[entry].json.length + entry.length;
    if (Object.keys(result).length < 100 && characters + size <= 2000000) {
      result[entry] = next[entry];
      characters += size;
    }
  });
  return result;
}

export function cachedResponse(cache: ResponseCache, key: string): unknown {
  try {
    return cache[key] ? JSON.parse(cache[key].json) : undefined;
  } catch {
    return undefined;
  }
}

export function canUseCache(error: { response?: { status?: number }; code?: string }): boolean {
  return (!error.response && error.code !== 'ERR_CANCELED')
    || error.response?.status >= 500;
}
