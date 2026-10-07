import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { localNumberFormat } from './common';

export default function usePrivateNumberFormat() {
  const hidden = useSelector((state: RootState) => state.configuration.hideBalance);
  return (currencyCode: string, value: number | bigint) => (hidden ? '••••' : localNumberFormat(currencyCode, value));
}
