import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import translate from '../../i18n/locale';
import { AText } from './ALibrary';

export default function OfflineNotice() {
  const unavailable = useSelector((state: RootState) => Object.keys(state.configuration.unavailableRequests || {}).length > 0);
  if (!unavailable) return null;
  return <AText px={12} py={10} fontSize={13}>{translate('offline_notice')}</AText>;
}
