import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import { ScreenType } from '../../types/screen';
import { types } from '../../models/transactions';
import translate from '../../i18n/locale';
import ErrorBoundary from '../UI/ErrorBoundary';
import NamedFilterChoices from '../UI/NamedFilterChoices';

export default function FilterScreen({ navigation, route }: ScreenType) {
  const {
    filterType, selectFilter, filterKind, selected,
  } = route.params;
  const currencies = useSelector((state: RootState) => state.currencies.currencies);
  const accounts = useSelector((state: RootState) => state.accounts.accounts);

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: filterType });
  }, [navigation, filterType]);

  const localChoices = useMemo(() => {
    const all = { value: '', label: translate('transaction_filter_all') };
    if (filterType === translate('transaction_type_label')) {
      return [all, ...types.map((type) => ({ value: type.type, label: translate(type.keyName) }))];
    }
    if (filterType === translate('currency')) {
      return currencies.map((currency) => ({
        value: currency.attributes.code,
        label: `${currency.attributes.code} ${currency.attributes.symbol}`,
      })).sort((a, b) => a.label.localeCompare(b.label));
    }
    if (filterType === translate('home_accounts')) {
      return [all, ...accounts.map((account) => ({
        value: account.attributes.name,
        label: account.attributes.name,
      })).sort((a, b) => a.label.localeCompare(b.label))];
    }
    return [];
  }, [filterType, currencies, accounts]);

  return (
    <ErrorBoundary>
      <NamedFilterChoices
        navigation={navigation}
        filterKind={filterKind}
        selected={selected}
        selectFilter={selectFilter}
        title={filterType}
        localChoices={filterKind ? undefined : localChoices}
      />
    </ErrorBoundary>
  );
}
