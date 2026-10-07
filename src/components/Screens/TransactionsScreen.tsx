import React, {
  useCallback,
  useMemo,
  useEffect,
  useState,
  useRef,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import { SwipeListView } from 'react-native-swipe-list-view';
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useDispatch, useSelector } from 'react-redux';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePrivateNumberFormat from '../../lib/use-private-number-format';
import { TransactionSplitType, TransactionType } from '../../models/transactions';
import { RootDispatch, RootState } from '../../store';
import translate from '../../i18n/locale';
import { useThemeColors } from '../../lib/common';
import { ScreenType } from '../../types/screen';
import {
  AInput, APressable, AStackFlex, AText, AView,
} from '../UI/ALibrary';
import AFilterButton from '../UI/ALibrary/AFilterButton';
import AButton from '../UI/ALibrary/AButton';
import ADateFilterButton from '../UI/ALibrary/ADateFilterButton';

const ITEM_HEIGHT = 60;

const resetTransactionsDates = (transactions: TransactionSplitType[]) => transactions.map((t) => ({
  ...t,
  date: new Date().toISOString(),
}));

function ListFooterComponent({ onLoadMore, initLoading }) {
  const { colors } = useThemeColors();
  const loading = useSelector((state: RootState) => state.loading.effects.transactions.getMoreTransactions?.loading);
  const { page, totalPages } = useSelector((state: RootState) => state.transactions);

  return useMemo(() => (loading || initLoading || (page < totalPages)) && (
    <AStackFlex
      style={{
        height: ITEM_HEIGHT,
      }}
    >
      {(loading || initLoading) && (
      <AStackFlex py={10} px={10}>
        <ActivityIndicator color={colors.text} />
      </AStackFlex>
      )}
      {(!initLoading && !loading && (page < totalPages)) && (
        <AButton style={{ height: 40 }} mx={30} onPress={onLoadMore}>
          <AStackFlex row>
            <Ionicons name="cloud-download" size={15} color={colors.text} style={{ margin: 5 }} />
            <AText fontSize={15}>{translate('load_more')}</AText>
          </AStackFlex>
        </AButton>
      )}
    </AStackFlex>
  ), [
    colors,
    page,
    totalPages,
    loading,
    initLoading,
    onLoadMore,
  ]);
}

function RenderItem({ item }) {
  const localNumberFormat = usePrivateNumberFormat();
  const { colors } = useThemeColors();
  const navigation = useNavigation();

  const goToEdit = (id: string, payload: { splits: TransactionSplitType[]; groupTitle: string; }) => navigation.dispatch(
    CommonActions.navigate({
      name: 'TransactionDetailScreen',
      params: {
        id,
        payload,
      },
    }),
  );

  const goToDuplicate = (payload: { splits: TransactionSplitType[]; groupTitle: string; }) => navigation.dispatch(
    CommonActions.navigate({
      name: 'TransactionCreateScreen',
      params: {
        payload,
      },
    }),
  );

  const colorItemTypes = {
    withdrawal: {
      bg: colors.brandDangerLight,
      color: colors.brandDanger,
      icon: 'arrow-down',
      prefix: '-',
    },
    deposit: {
      bg: colors.brandSuccessLight,
      color: colors.brandSuccess,
      icon: 'arrow-up',
      prefix: '+',
    },
    transfer: {
      bg: colors.brandInfoLight,
      color: colors.brandInfo,
      icon: 'arrow-left-right',
      prefix: '',
    },
    'opening balance': {
      bg: colors.brandNeutralLight,
      color: colors.brandNeutral,
      icon: 'arrow-left-right',
      prefix: '',
    },
  };

  const getTransactionTypeAttributes = (type: string) => {
    if (typeof colorItemTypes[type] === 'undefined') {
      return colorItemTypes.transfer;
    }

    return colorItemTypes[type];
  };

  const split = item.attributes.transactions[0];
  const typeAttributes = getTransactionTypeAttributes(split.type);
  const meta = [
    split.type === 'withdrawal' ? split.sourceName : split.destinationName,
    split.categoryName,
    moment(split.date).format('HH:mm'),
    ...split.tags.map((tag) => `#${tag}`),
  ].filter(Boolean).join(' · ');

  return useMemo(() => (
    <APressable
      style={{
        height: ITEM_HEIGHT,
        backgroundColor: colors.tileBackgroundColor,
        borderTopWidth: 0.5,
        borderColor: colors.listBorderColor,
        paddingHorizontal: 16,
      }}
      onPress={() => {
        goToEdit(item.id, {
          splits: item.attributes.transactions,
          groupTitle: item.attributes.groupTitle,
        });
      }}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch();
        goToDuplicate({
          splits: resetTransactionsDates(item.attributes.transactions),
          groupTitle: item.attributes.groupTitle || '',
        });
      }}
    >
      <AView
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: typeAttributes.bg,
          marginRight: 12,
        }}
      >
        <MaterialCommunityIcons name={typeAttributes.icon} size={18} color={typeAttributes.color} />
      </AView>
      <AView style={{ flex: 1, marginRight: 10 }}>
        <AText fontSize={14} numberOfLines={1} bold>
          {item.attributes.groupTitle}
          {item.attributes.groupTitle?.length > 0 ? ': ' : ''}
          {split.description}
        </AText>
        <AText fontSize={11} color={colors.greyLight} numberOfLines={1} style={{ marginTop: 2 }}>
          {meta}
        </AText>
      </AView>
      <AText fontSize={14} color={typeAttributes.color} bold numberOfLines={1}>
        {`${typeAttributes.prefix}${localNumberFormat(split.currencyCode, item.attributes.transactions.reduce((total, s) => total + parseFloat(s.amount), 0))}`}
      </AText>
    </APressable>
  ), [item, colors, localNumberFormat]);
}

async function deleteAlert(transaction: TransactionType, rowMap, closeRow, deleteRow) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch();
  Alert.alert(
    translate('transaction_list_alert_title'),
    `${translate('transaction_list_alert_text')}\n`
    + `${transaction?.attributes?.transactions[0]?.description}\n`
    + `${moment(transaction?.attributes?.transactions[0]?.date).format('ll')} • ${transaction?.attributes?.transactions[0]?.categoryName || ''}\n`,
    [
      {
        text: translate('transaction_list_delete_button'),
        onPress: () => deleteRow(transaction?.id),
        style: 'destructive',
      },
      {
        text: translate('transaction_list_cancel_button'),
        onPress: () => closeRow(transaction?.id, rowMap),
        style: 'cancel',
      },
    ],
  );
}

function RenderHiddenItem({ handleOnPressCopy, handleOnPressDelete }) {
  const { colors } = useThemeColors();

  return useMemo(() => (
    <AStackFlex row>
      <APressable
        style={{
          height: ITEM_HEIGHT,
          width: '50%',
          backgroundColor: colors.brandWarning,
          paddingHorizontal: 10,
          borderTopWidth: 0.5,
          borderColor: colors.listBorderColor,
        }}
        onPress={handleOnPressCopy}
      >
        <AStackFlex alignItems="flex-start">
          <AStackFlex style={{ width: 70 }}>
            <MaterialIcons name="content-copy" color="white" size={17} />
            <AText color="white" fontSize={12} bold>
              {translate('transaction_clone')}
            </AText>
          </AStackFlex>
        </AStackFlex>
      </APressable>
      <APressable
        style={{
          height: ITEM_HEIGHT,
          width: '50%',
          backgroundColor: colors.red,
          paddingHorizontal: 10,
          borderTopWidth: 0.5,
          borderColor: colors.listBorderColor,
        }}
        onPress={handleOnPressDelete}
      >
        <AStackFlex alignItems="flex-end">
          <AStackFlex style={{ width: 70 }}>
            <MaterialIcons name="delete" color="white" size={17} />
            <AText color="white" fontSize={12} bold>
              {translate('transaction_delete')}
            </AText>
          </AStackFlex>
        </AStackFlex>
      </APressable>
    </AStackFlex>
  ), [handleOnPressCopy, handleOnPressDelete]);
}

export default function TransactionsScreen({ navigation, route }: ScreenType) {
  const { params } = route;
  const { colors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const localNumberFormat = usePrivateNumberFormat();
  const [loading, setLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [search, setSearch] = useState('');
  const defaultStart = useSelector((state: RootState) => state.firefly.rangeDetails.start);
  const [start, setStartDate] = useState<Date>(new Date(`${defaultStart}T12:00:00`));
  const defaultEnd = useSelector((state: RootState) => state.firefly.rangeDetails.end);
  const [end, setEndDate] = useState<Date>(new Date(`${defaultEnd}T12:00:00`));
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [loadError, setLoadError] = useState(false);
  const loadGeneration = useRef(0);
  const loadingMore = useRef(false);
  const [account, setAccount] = useState<string>('');
  const [type, setType] = useState<'' | 'withdrawal' | 'deposit' | 'transfer'>('');
  const [currentCode, setCurrentCode] = useState('');
  const {
    transactions: {
      getMoreTransactions,
      getTransactions,
      deleteTransaction,
    },
  } = useDispatch<RootDispatch>();

  const onLoad = useCallback(async () => {
    loadGeneration.current += 1;
    const generation = loadGeneration.current;
    setLoading(true);
    setLoadError(false);
    try {
      const result = await getTransactions({
        start, end, type, currentCode, account, category, tag, search,
      });
      if (generation === loadGeneration.current) setTransactions(result);
    } catch (error) {
      if (generation === loadGeneration.current) {
        setTransactions([]);
        setLoadError(true);
      }
    } finally {
      if (generation === loadGeneration.current) setLoading(false);
    }
  }, [getTransactions, start, end, type, currentCode, account, category, tag, search]);

  const onLoadMore = useCallback(async () => {
    if (loading || loadingMore.current) return;
    const generation = loadGeneration.current;
    loadingMore.current = true;
    try {
      const result = await getMoreTransactions({
        start, end, type, currentCode, account, category, tag, search,
      });
      if (generation === loadGeneration.current) setTransactions((previous) => [...previous, ...result]);
    } catch (error) {
      if (generation === loadGeneration.current) setLoadError(true);
    } finally {
      loadingMore.current = false;
    }
  }, [getMoreTransactions, loading, start, end, type, currentCode, account, category, tag, search]);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchDraft), 300);
    return () => clearTimeout(timeout);
  }, [searchDraft]);

  useEffect(() => {
    if (params?.transactionSearch !== undefined) {
      setSearch(params.transactionSearch);
      setSearchDraft(params.transactionSearch);
      navigation.setParams({ transactionSearch: undefined });
    }
    if (params?.category !== undefined) {
      setCategory(params.category);
      setTag('');
      setAccount('');
      setSearch('');
      setSearchDraft('');
      navigation.setParams({ category: undefined });
    }
    if (params?.transactionType !== undefined) {
      setType(params.transactionType);
      navigation.setParams({ transactionType: undefined });
    }
    if (params?.startDate !== undefined) {
      setStartDate(new Date(params.startDate));
      navigation.setParams({ startDate: undefined });
    }
    if (params?.endDate !== undefined) {
      setEndDate(new Date(params.endDate));
      navigation.setParams({ endDate: undefined });
    }
    if (params?.forceRefresh) {
      onLoad();
      navigation.setParams({ forceRefresh: false });
    }
  }, [params, navigation, onLoad]);

  useFocusEffect(useCallback(() => {
    onLoad();
    return () => { loadGeneration.current += 1; };
  }, [onLoad]));

  useEffect(() => {
    setStartDate(new Date(`${defaultStart}T12:00:00`));
    setEndDate(new Date(`${defaultEnd}T12:00:00`));
  }, [defaultStart, defaultEnd]);

  const closeRow = (rowKey: string | number, rowMap: { [x: string]: { closeRow: () => void; }; }) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  const deleteRow = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions((prevState) => prevState.filter((item) => item.id !== id));
    } catch (error) {
      setLoadError(true);
    }
  };

  const goToDuplicate = (payload: { splits: TransactionSplitType[]; groupTitle: string; }) => navigation.dispatch(
    CommonActions.navigate({
      name: 'TransactionCreateScreen',
      params: {
        payload,
      },
    }),
  );

  const resetFilters = () => {
    setType('');
    setCurrentCode('');
    setSearch('');
    setAccount('');
    setCategory('');
    setTag('');
    setSearchDraft('');
    setStartDate(new Date(`${defaultStart}T12:00:00`));
    setEndDate(new Date(`${defaultEnd}T12:00:00`));
  };

  const transactionSections = useMemo(
    () => {
      const byDay = new Map<string, TransactionType[]>();

      transactions.forEach((t) => {
        const date = t?.attributes?.transactions?.[0]?.date;
        const dayKey = date ? moment(date).format('YYYY-MM-DD') : 'Invalid date';

        const dayTransactions = byDay.get(dayKey);
        if (dayTransactions) {
          dayTransactions.push(t);
        } else {
          byDay.set(dayKey, [t]);
        }
      });

      return Array.from(byDay.entries()).map(([title, data]) => {
        const currencies = new Set(data.map((t) => t.attributes.transactions[0].currencyCode));
        const total = data.reduce((sum, t) => {
          const amount = t.attributes.transactions.reduce((acc, split) => acc + parseFloat(split.amount), 0);
          const { type: splitType } = t.attributes.transactions[0];
          if (splitType === 'withdrawal') return sum - amount;
          if (splitType === 'deposit') return sum + amount;
          return sum;
        }, 0);
        return {
          title,
          data,
          total,
          currencyCode: currencies.size === 1 ? [...currencies][0] : null,
        };
      });
    },
    [transactions],
  );

  const hasFilters = type !== '' || currentCode !== '' || account !== '' || category !== '' || tag !== '' || search !== '';

  return (
    <AView style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      <AView
        style={{
          paddingTop: insets.top,
          backgroundColor: colors.backgroundColor,
          borderBottomWidth: 0.5,
          borderColor: colors.listBorderColor,
        }}
      >
        <AView style={{ height: 44, paddingHorizontal: 16, justifyContent: 'center' }}>
          <AText fontSize={20} bold>{translate('navigation_transactions_tab')}</AText>
        </AView>
        <AView style={{ paddingHorizontal: 16 }}>
          <AInput
            height={38}
            returnKeyType="search"
            placeholder={translate('transaction_search_placeholder')}
            value={searchDraft}
            onChangeText={setSearchDraft}
            onSubmitEditing={() => setSearch(searchDraft)}
            style={{ backgroundColor: colors.tileBackgroundColor }}
            InputLeftElement={<Ionicons name="search" size={17} color={colors.greyLight} style={{ marginHorizontal: 10 }} />}
            InputRightElement={searchDraft !== '' ? (
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={translate('transaction_form_reset_button')} hitSlop={8} onPress={() => { setSearchDraft(''); setSearch(''); }} style={{ paddingHorizontal: 10 }}>
                <Ionicons name="close-circle" size={17} color={colors.greyLight} />
              </TouchableOpacity>
            ) : null}
          />
        </AView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' }}
        >
          {hasFilters && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={translate('transaction_form_reset_button')}
            hitSlop={{ top: 6, bottom: 6 }}
            onPress={resetFilters}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: 36,
              paddingHorizontal: 12,
              marginRight: 8,
              borderRadius: 18,
              backgroundColor: colors.brandDangerLight,
            }}
          >
            <Ionicons name="close" size={16} color={colors.brandDanger} style={{ marginRight: 4 }} />
            <AText fontSize={13} color={colors.brandDanger} bold>{translate('transaction_form_reset_button')}</AText>
          </TouchableOpacity>
          )}
          <ADateFilterButton currentDate={start} selectDate={(date: Date) => { setStartDate(date); setEndDate(moment(date).endOf('month').toDate()); }} />
          <AFilterButton filterType={translate('transaction_type_label')} selected={type} selectFilter={(selected: 'withdrawal' | 'deposit' | 'transfer') => setType(selected)} navigation={navigation} capitalize />
          <AFilterButton filterKind="category" filterType={translate('transaction_form_category_label')} selected={category} selectFilter={setCategory} navigation={navigation} />
          <AFilterButton filterKind="tag" filterType={translate('transaction_form_tags_label')} selected={tag} selectFilter={setTag} navigation={navigation} />
          <AFilterButton filterType={translate('currency')} selected={currentCode} selectFilter={(selected) => setCurrentCode(selected)} navigation={navigation} />
          <AFilterButton filterType={translate('home_accounts')} selected={account} selectFilter={(selected) => setAccount(selected)} navigation={navigation} />
        </ScrollView>
      </AView>
      {loadError && (
      <AView style={{ padding: 16 }}>
        <AText fontSize={13}>{translate('transaction_filter_load_error')}</AText>
        <AButton style={{ height: 44, marginTop: 12 }} onPress={onLoad}>
          <AText fontSize={14}>{translate('transaction_filter_retry')}</AText>
        </AButton>
      </AView>
      )}
      <SwipeListView
        useSectionList
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={false}
        refreshControl={(
          <RefreshControl
            refreshing={loading}
            onRefresh={onLoad}
          />
      )}
        ListEmptyComponent={!loading && !loadError ? <AText py={30} fontSize={14} textAlign="center">{translate('transaction_filter_no_results')}</AText> : null}
        initialNumToRender={15}
        keyExtractor={(item: TransactionType) => item.id}
        sections={!loading ? transactionSections : []}
        showsVerticalScrollIndicator
        renderSectionHeader={({ section }) => {
          const day = moment(section.title, 'YYYY-MM-DD', true);
          let label = section.title;
          if (day.isValid()) {
            if (day.isSame(moment(), 'day')) label = translate('today');
            else if (day.isSame(moment().subtract(1, 'day'), 'day')) label = translate('yesterday');
            else label = day.format(day.isSame(moment(), 'year') ? 'dddd, D MMM' : 'dddd, D MMM YYYY');
          }
          return (
            <AView
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: colors.backgroundColor,
                paddingHorizontal: 16,
                paddingTop: 14,
                paddingBottom: 6,
              }}
            >
              <AText fontSize={12} color={colors.greyLight} bold capitalize>{label}</AText>
              {section.currencyCode && section.total !== 0 && (
              <AText fontSize={12} color={colors.greyLight}>
                {section.total > 0 ? '+' : ''}
                {localNumberFormat(section.currencyCode, section.total)}
              </AText>
              )}
            </AView>
          );
        }}
        renderItem={({ item }) => <RenderItem item={item} />}
        renderHiddenItem={(data, rowMap) => (
          <RenderHiddenItem
            handleOnPressCopy={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch();
              goToDuplicate({
                splits: resetTransactionsDates(data.item.attributes.transactions),
                groupTitle: data.item.attributes.groupTitle || '',
              });
            }}
            handleOnPressDelete={() => deleteAlert(data.item, rowMap, closeRow, deleteRow)}
          />
        )}
        rightOpenValue={-90}
        stopRightSwipe={-190}
        rightActivationValue={-170}
        onRightActionStatusChange={({
          key,
          isActivated,
        }) => (isActivated ? deleteAlert(transactions.find((t) => t.id === key), [], closeRow, deleteRow) : null)}
        leftOpenValue={90}
        stopLeftSwipe={190}
        leftActivationValue={170}
        onLeftActionStatusChange={({
          key,
          isActivated,
        }) => (isActivated ? goToDuplicate({
          splits: resetTransactionsDates(transactions.find((t) => t.id === key).attributes.transactions),
          groupTitle: transactions.find((t) => t.id === key).attributes.groupTitle || '',
        }) : null)}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListFooterComponent={ListFooterComponent({ onLoadMore, initLoading: loading })}
      />
    </AView>
  );
}
