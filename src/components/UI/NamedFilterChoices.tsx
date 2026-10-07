import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, View, Pressable,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootDispatch } from '../../store';
import translate from '../../i18n/locale';
import { useBrandStyle, useThemeColors } from '../../lib/common';
import { NO_CATEGORY } from '../../lib/transaction-search';
import { AInput, AText } from './ALibrary';
import AButton from './ALibrary/AButton';

type NamedOption = { id: string; attributes: { name?: string; tag?: string } };

export default function NamedFilterChoices({
  navigation, filterKind, selected, selectFilter,
}) {
  const { colors } = useThemeColors();
  const { brandStyleText } = useBrandStyle();
  const dispatch = useDispatch<RootDispatch>();
  const [options, setOptions] = useState<NamedOption[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const title = translate(filterKind === 'category' ? 'transaction_form_category_label' : 'transaction_form_tags_label');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setFailed(false);
      try {
        const result: NamedOption[] = [];
        let page = 1;
        let totalPages = 1;
        do {
          // Fetch each page after learning the pagination from the previous response.
          // eslint-disable-next-line no-await-in-loop
          const response = await dispatch.configuration.apiFetch({
            url: `/api/v1/${filterKind === 'category' ? 'categories' : 'tags'}?limit=100&page=${page}`,
          }) as { data: NamedOption[]; meta?: { pagination?: { totalPages?: number } } };
          if (!active) return;
          result.push(...response.data);
          totalPages = response.meta?.pagination?.totalPages || 1;
          page += 1;
        } while (page <= totalPages);
        setOptions(result);
      } catch (error) {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [dispatch, filterKind, retry]);

  const choose = useCallback((value: string) => {
    selectFilter(value);
    navigation.goBack();
  }, [selectFilter, navigation]);

  const choices = [
    { value: '', label: translate('transaction_filter_all') },
    ...(filterKind === 'category' ? [{ value: NO_CATEGORY, label: translate('no_category') }] : []),
    ...options.map((option) => ({
      value: filterKind === 'category' ? option.attributes.name : option.attributes.tag,
      label: filterKind === 'category' ? option.attributes.name : option.attributes.tag,
    })).filter((option) => option.value).sort((a, b) => a.label.localeCompare(b.label)),
  ].filter((option) => option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()));

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: colors.backgroundColor }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
      }}
      >
        <AText fontSize={23} bold>{title}</AText>
        <AButton type="transparent" style={{ height: 44, paddingHorizontal: 12 }} onPress={() => navigation.goBack()}>
          <AText fontSize={14}>{translate('cancel')}</AText>
        </AButton>
      </View>
      <AInput height={46} value={query} onChangeText={setQuery} placeholder={translate('transaction_filter_search')} />
      {loading && <ActivityIndicator style={{ margin: 24 }} color={brandStyleText} />}
      {failed && (
        <View style={{ paddingVertical: 20 }}>
          <AText fontSize={14}>{translate('transaction_filter_load_error')}</AText>
          <AButton style={{ height: 44, marginTop: 16 }} onPress={() => setRetry((value) => value + 1)}>
            <AText fontSize={14}>{translate('transaction_filter_retry')}</AText>
          </AButton>
        </View>
      )}
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: 12, paddingBottom: 40 }}>
        {choices.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: selected === option.value }}
            onPress={() => choose(option.value)}
            style={{
              paddingVertical: 16, paddingHorizontal: 12, borderBottomWidth: 0.5, borderColor: colors.listBorderColor, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <AText fontSize={15} style={{ flex: 1 }} bold={selected === option.value}>{option.label}</AText>
            {selected === option.value && <Ionicons name="checkmark" size={20} color={brandStyleText} />}
          </Pressable>
        ))}
        {!loading && !failed && choices.length === 0 && <AText fontSize={14} py={20}>{translate('transaction_filter_no_results')}</AText>}
      </ScrollView>
    </View>
  );
}
