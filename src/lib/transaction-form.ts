import type { TransactionSplitType } from '../models/transactions';

// Account roles differ between expenses, income and transfers. Keep the asset
// account, but never reuse an expense account as a revenue account (or vice versa).
export default function changeTransactionType(split: TransactionSplitType, type: string): TransactionSplitType {
  if (split.type === type) {
    return split;
  }

  const next = {
    ...split,
    type,
    sourceName: '',
    sourceId: null,
    destinationName: '',
    destinationId: null,
    budgetId: '',
    budgetName: '',
    billId: '',
    billName: '',
  };

  if (split.type === 'deposit') {
    if (type === 'withdrawal') {
      next.sourceName = split.destinationName;
      next.sourceId = split.destinationId;
    } else if (type === 'transfer') {
      next.destinationName = split.destinationName;
      next.destinationId = split.destinationId;
    }
  } else if (split.type === 'withdrawal' || split.type === 'transfer') {
    if (type === 'deposit') {
      next.destinationName = split.type === 'transfer' ? split.destinationName : split.sourceName;
      next.destinationId = split.type === 'transfer' ? split.destinationId : split.sourceId;
    } else if (type === 'withdrawal' || type === 'transfer') {
      next.sourceName = split.sourceName;
      next.sourceId = split.sourceId;
    }
  }

  return next;
}
