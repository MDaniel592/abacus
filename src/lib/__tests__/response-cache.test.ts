import { cacheResponse, cachedResponse, canUseCache } from '../response-cache';

describe('offline response cache', () => {
  it('isolates mutable chart responses and request identities', () => {
    const response = { data: [{ entries: { January: '10' } }] };
    const cache = cacheResponse({}, 'server-user-period', response);
    response.data[0].entries.January = '99';
    const restored = cachedResponse(cache, 'server-user-period') as typeof response;
    expect(restored.data[0].entries.January).toBe('10');
    restored.data[0].entries.January = '20';
    expect(cachedResponse(cache, 'server-user-period')).toEqual({ data: [{ entries: { January: '10' } }] });
    expect(cachedResponse(cache, 'other-user-period')).toBeUndefined();
  });

  it('limits storage and tolerates corrupted entries', () => {
    let cache = {};
    for (let index = 0; index < 110; index += 1) cache = cacheResponse(cache, String(index), { data: index });
    expect(Object.keys(cache)).toHaveLength(100);
    expect(cachedResponse(cache, '109')).toEqual({ data: 109 });
    expect(cacheResponse(cache, 'large', 'x'.repeat(2000001))).toEqual(cache);
    expect(cacheResponse({}, 'large', 'x'.repeat(2000001))).toEqual({});
    expect(cachedResponse({ bad: { savedAt: 0, json: '{' } }, 'bad')).toBeUndefined();
  });

  it('falls back for connection and server failures, never authentication or cancellation', () => {
    expect(canUseCache({ code: 'ECONNABORTED' })).toBe(true);
    expect(canUseCache({ response: { status: 503 } })).toBe(true);
    [401, 403, 404, 422].forEach((status) => expect(canUseCache({ response: { status } })).toBe(false));
    expect(canUseCache({ code: 'ERR_CANCELED' })).toBe(false);
  });
});
