import moment from 'moment';
import type { GetTransactionsPayload } from '../models/transactions';

export const NO_CATEGORY = '__no_category__';

export default function transactionSearch(payload: GetTransactionsPayload): string {
  const {
    start, end, type, currentCode, account, category, tag, search,
  } = payload;
  const terms = [search?.trim() || ''];
  if (start) terms.push(`date_after:${moment(start).format('YYYY-MM-DD')}`);
  if (end) terms.push(`date_before:${moment(end).format('YYYY-MM-DD')}`);
  if (currentCode) terms.push(`currency_is:${JSON.stringify(currentCode)}`);
  if (type) terms.push(`type:${type}`);
  if (account) terms.push(`account_contains:${JSON.stringify(account)}`);
  if (category === NO_CATEGORY) {
    terms.push('has_any_category:false');
  } else if (category) {
    terms.push(`category_is:${JSON.stringify(category)}`);
  }
  if (tag) terms.push(`tag_is:${JSON.stringify(tag)}`);
  return terms.filter(Boolean).join(' ');
}
