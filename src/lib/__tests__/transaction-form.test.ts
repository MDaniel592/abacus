import transactions, { initialSplit } from '../../models/transactions';
import changeTransactionType from '../transaction-form';

const expense = () => ({
  ...initialSplit(),
  amount: '24,50',
  description: 'Compra',
  sourceName: 'Cuenta principal',
  sourceId: 10,
  destinationName: 'Supermercado',
  destinationId: 20,
  currencyCode: 'EUR',
  currencySymbol: '€',
  budgetId: '30',
  budgetName: 'Alimentación',
});

describe('changing transaction type without leaving the form', () => {
  it('keeps the asset account and clears the expense account when switching to income', () => {
    const original = expense();
    const income = changeTransactionType(original, 'deposit');
    expect(income).toMatchObject({
      type: 'deposit',
      sourceName: '',
      sourceId: null,
      destinationName: 'Cuenta principal',
      destinationId: 10,
      currencyCode: 'EUR',
      amount: '24,50',
      budgetId: '',
      budgetName: '',
    });
    expect(original.destinationId).toBe(20);
  });

  it('can save an expense then income using the same form state', async () => {
    const dispatch = {
      configuration: {
        apiPost: jest.fn().mockResolvedValue({ data: { id: '1' } }),
      },
    };
    const upsertTransaction = transactions.effects(dispatch as never).upsertTransaction.bind({} as never);
    const split = expense();
    await upsertTransaction({ id: '-1' }, {
      transactions: { transactionPayload: { title: '', transactions: [split] } },
    });
    const income = {
      ...changeTransactionType(split, 'deposit'),
      sourceName: 'Empresa',
      sourceId: 40,
      amount: '1850,00',
    };
    await upsertTransaction({ id: '-1' }, {
      transactions: { transactionPayload: { title: '', transactions: [income] } },
    });
    expect(dispatch.configuration.apiPost).toHaveBeenCalledTimes(2);
    expect(dispatch.configuration.apiPost.mock.calls[1][0].body.transactions[0]).toMatchObject({
      type: 'deposit',
      source_id: 40,
      destination_id: 10,
      amount: 1850,
    });
  });

  it('moves the receiving asset account back to the source when returning to an expense', () => {
    const income = {
      ...changeTransactionType(expense(), 'deposit'),
      sourceName: 'Empresa',
      sourceId: 40,
    };
    expect(changeTransactionType(income, 'withdrawal')).toMatchObject({
      sourceName: 'Cuenta principal',
      sourceId: 10,
      destinationName: '',
      destinationId: null,
    });
  });

  it('does not clear accounts when selecting the currently selected type', () => {
    const split = expense();
    expect(changeTransactionType(split, 'withdrawal')).toBe(split);
  });

  it.each([
    ['withdrawal', 'transfer', 'sourceId', 10],
    ['deposit', 'transfer', 'destinationId', 10],
    ['transfer', 'withdrawal', 'sourceId', 10],
    ['transfer', 'deposit', 'destinationId', 50],
  ])('preserves the appropriate asset account from %s to %s', (from, to, field, id) => {
    const split = from === 'deposit'
      ? { ...changeTransactionType(expense(), from), sourceId: 40, sourceName: 'Empresa' }
      : { ...expense(), type: from, ...(from === 'transfer' ? { destinationId: 50, destinationName: 'Efectivo' } : {}) };
    const next = changeTransactionType(split, to);
    expect(next[field]).toBe(id);
    expect(to === 'deposit' ? next.sourceId : to === 'withdrawal' ? next.destinationId : from === 'deposit' ? next.sourceId : next.destinationId).toBeNull();
  });
  it.each(['withdrawal', 'deposit'])('saves a new %s using the default hidden counterparty', async (type) => {
    const dispatch = { configuration: { apiPost: jest.fn().mockResolvedValue({ data: { id: '1' } }) } };
    const split = {
      ...initialSplit(),
      type,
      amount: '20',
      description: 'Movimiento',
      ...(type === 'withdrawal' ? { sourceId: 10, sourceName: 'Cuenta principal' } : { destinationId: 10, destinationName: 'Cuenta principal' }),
    };
    await transactions.effects(dispatch as never).upsertTransaction.bind({} as never)({ id: '-1' }, {
      transactions: { transactionPayload: { title: '', transactions: [split] } },
    });
    const saved = dispatch.configuration.apiPost.mock.calls[0][0].body.transactions[0];
    expect(type === 'withdrawal' ? saved.destination_name : saved.source_name).toBe('');
    expect(type === 'withdrawal' ? saved.destination_id : saved.source_id).toBeNull();
    expect(type === 'withdrawal' ? saved.source_id : saved.destination_id).toBe(10);
  });
});
