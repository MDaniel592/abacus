import transactionSearch, { NO_CATEGORY } from '../transaction-search';
import transactions from '../../models/transactions';

const filters = {
  type: 'withdrawal' as const,
  start: new Date(2026, 8, 1, 12),
  end: new Date(2026, 8, 30, 12),
  category: 'Comida y café',
  tag: 'Casa & familia',
};

describe('transaction category and tag filters', () => {
  it('combines exact category and tag with the selected historical period', () => {
    expect(transactionSearch(filters)).toBe('date_after:2026-09-01 date_before:2026-09-30 type:withdrawal category_is:"Comida y café" tag_is:"Casa & familia"');
  });

  it('supports uncategorized movements with a tag', () => {
    expect(transactionSearch({ type: '', category: NO_CATEGORY, tag: 'Casa' })).toBe('has_any_category:false tag_is:"Casa"');
  });

  it('keeps free text, account and currency filters', () => {
    expect(transactionSearch({
      type: '', search: '  supermercado  ', account: 'Cuenta principal', currentCode: 'EUR',
    })).toBe('supermercado currency_is:"EUR" account_contains:"Cuenta principal"');
  });

  it('encodes ampersands and preserves the same filters on subsequent pages', async () => {
    const dispatch = {
      configuration: {
        apiFetch: jest.fn().mockResolvedValue({ data: [], meta: { pagination: { currentPage: 1, totalPages: 3 } } }),
      },
      transactions: { setMetaPagination: jest.fn() },
    };
    const effects = transactions.effects(dispatch as never);
    await effects.getTransactions.bind({} as never)(filters);
    await effects.getMoreTransactions.bind({} as never)(filters, { transactions: { page: 1, totalPages: 3 } } as never);
    const first = new URL(dispatch.configuration.apiFetch.mock.calls[0][0].url, 'https://example.test');
    const second = new URL(dispatch.configuration.apiFetch.mock.calls[1][0].url, 'https://example.test');
    expect(first.searchParams.get('query')).toBe(transactionSearch(filters));
    expect(second.searchParams.get('query')).toBe(first.searchParams.get('query'));
    expect(second.searchParams.get('page')).toBe('2');
    expect(first.searchParams.get('limit')).toBe('15');
    expect(first.searchParams.get('Casa')).toBeNull();
  });
  it('ignores pagination metadata from an older filter request', async () => {
    let resolveOld: (value: unknown) => void;
    const oldResponse = new Promise((resolve) => { resolveOld = resolve; });
    const dispatch = {
      configuration: { apiFetch: jest.fn().mockReturnValueOnce(oldResponse).mockResolvedValueOnce({ data: [], meta: { pagination: { currentPage: 1, totalPages: 2 } } }) },
      transactions: { setMetaPagination: jest.fn() },
    };
    const effects = transactions.effects(dispatch as never);
    const oldRequest = effects.getTransactions.bind({} as never)(filters);
    await effects.getTransactions.bind({} as never)({ ...filters, category: 'Trabajo' });
    resolveOld({ data: [], meta: { pagination: { currentPage: 1, totalPages: 99 } } });
    await oldRequest;
    expect(dispatch.transactions.setMetaPagination).toHaveBeenCalledTimes(1);
    expect(dispatch.transactions.setMetaPagination).toHaveBeenCalledWith({ page: 1, totalPages: 2 });
  });
});
