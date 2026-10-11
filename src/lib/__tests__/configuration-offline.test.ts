import { init } from '@rematch/core';
import axios from 'axios';
import configuration from '../../models/configuration';
import type { RootModel } from '../../models';

jest.mock('../../lib/common', () => ({ convertKeysToCamelCase: (value: unknown) => value }));

describe('configuration offline apiFetch', () => {
  const store = init<RootModel>({ models: { configuration } as RootModel });
  const get = jest.spyOn(axios, 'get');

  beforeEach(() => {
    get.mockReset();
    store.dispatch.configuration.resetState();
    store.dispatch.configuration.setBackendURL('https://firefly.example');
    store.dispatch.configuration.setCacheIdentity('user@example.com');
  });

  it('returns cached response data and pagination metadata after a network failure', async () => {
    get.mockResolvedValueOnce({
      data: {
        data: [{ id: '1', attributes: { account_id: 12 } }],
        meta: { pagination: { current_page: 1, total_pages: 3 } },
      },
    });
    const first = await store.dispatch.configuration.apiFetch({ url: '/api/v1/accounts' });

    get.mockRejectedValueOnce({ code: 'ERR_NETWORK' });
    const offline = await store.dispatch.configuration.apiFetch({ url: '/api/v1/accounts' });

    expect(offline).toEqual(first);
    expect(offline).toEqual({
      data: [{ id: '1', attributes: { account_id: 12 } }],
      meta: { pagination: { current_page: 1, total_pages: 3 } },
    });
    expect(store.getState().configuration.unavailableRequests).toEqual({
      '["https://firefly.example","user@example.com","/api/v1/accounts",null]': true,
    });

    get.mockResolvedValueOnce({ data: { data: [{ id: '1' }], meta: { pagination: { current_page: 1, total_pages: 3 } } } });
    await store.dispatch.configuration.apiFetch({ url: '/api/v1/accounts' });
    expect(store.getState().configuration.unavailableRequests).toEqual({});

    get.mockRejectedValueOnce({ code: 'ERR_NETWORK' });
    await expect(store.dispatch.configuration.apiFetch({ url: '/api/v1/transactions' })).rejects.toEqual({ code: 'ERR_NETWORK' });

    store.dispatch.configuration.setCacheIdentity('another@example.com');
    get.mockRejectedValueOnce({ code: 'ERR_NETWORK' });
    await expect(store.dispatch.configuration.apiFetch({ url: '/api/v1/accounts' })).rejects.toEqual({ code: 'ERR_NETWORK' });

    store.dispatch.configuration.setCacheIdentity('user@example.com');
    get.mockRejectedValueOnce({ response: { status: 401 } });
    await expect(store.dispatch.configuration.apiFetch({ url: '/api/v1/accounts' })).rejects.toEqual({ response: { status: 401 } });
  });
});
