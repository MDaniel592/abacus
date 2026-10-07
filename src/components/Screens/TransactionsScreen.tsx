import React, {
  useCallback,
  useMemo,
  useLayoutEffect,
  useEffect,
  useState,
  useRef,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
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

import { SearchBarCommands } from 'react-native-screens';
import usePrivateNumberFormat from '../../lib/use-private-number-format';
import { TransactionSplitType, TransactionType } from '../../models/transactions';
import { RootDispatch, RootState } from '../../store';
import translate from '../../i18n/locale';
import { D_WIDTH, useThemeColors } from '../../lib/common';
import { ScreenType } from '../../types/screen';
import {
  APressable, AScrollView, AStackFlex, AText, AView,
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
            <Ionicons name="cloud-download" size={15} color="white" style={{ margin: 5 }} />
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
      bg: colors.brandNeutralLight,
      color: colors.red,
      icon: 'arrow-down',
      prefix: '-',
    },
    deposit: {
      bg: colors.brandSuccessLight,
      color: colors.green,
      icon: 'arrow-up',
      prefix: '+',
    },
    transfer: {
      bg: colors.brandInfoLight,
      color: colors.blue,
      icon: 'arrow-left-right',
      prefix: '',
    },
    'opening balance': {
      bg: colors.brandNeutralLight,
      color: colors.red,
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

  return useMemo(() => (
    <APressable
      style={{
        height: ITEM_HEIGHT,
        backgroundColor: colors.tileBackgroundColor,
        borderTopWidth: 0.5,
        borderColor: colors.listBorderColor,
        paddingLeft: 10,
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
      <AStackFlex justifyContent="space-between" alignItems="flex-start" row>
        <AStackFlex justifyContent="flex-start" row>
          <AView
            style={{
              backgroundColor: getTransactionTypeAttributes(item.attributes.transactions[0].type).bg,
              borderRadius: 10,
              marginRight: 8,
              padding: 5,
            }}
          >
            <MaterialCommunityIcons
              name={getTransactionTypeAttributes(item.attributes.transactions[0].type).icon}
              size={19}
              color={getTransactionTypeAttributes(item.attributes.transactions[0].type).color}
            />
          </AView>
          <AStackFlex alignItems="flex-start" py={5}>
            <AText fontSize={12} maxWidth={D_WIDTH - 150} numberOfLines={1} bold>
              {item.attributes.groupTitle}
              {item.attributes.groupTitle?.length > 0 ? ': ' : ''}
              {item.attributes.transactions[0].description}
            </AText>

            <AText fontSize={10} maxWidth={D_WIDTH - 150} numberOfLines={1}>
              {item.attributes.transactions[0].type === 'withdrawal' ? item.attributes.transactions[0].sourceName : item.attributes.transactions[0].destinationName}
              {item.attributes.transactions[0].categoryName ? ` · ${item.attributes.transactions[0].categoryName}` : ''}
            </AText>
            <AText fontSize={9} color={colors.greyLight} maxWidth={D_WIDTH - 150} numberOfLines={1}>
              {moment(item.attributes.transactions[0].date).format('HH:mm')}
              {item.attributes.transactions[0].tags.map((tag) => ` #${tag}`).join('')}
            </AText>
          </AStackFlex>
        </AStackFlex>
        <AView
          style={{
            borderRadius: 10,
            backgroundColor: getTransactionTypeAttributes(item.attributes.transactions[0].type).bg,
            margin: 6,
            marginTop: 9,
            padding: 3,
          }}
        >
          <AText
            fontSize={13}
            color={getTransactionTypeAttributes(item.attributes.transactions[0].type).color}
            bold
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {`${getTransactionTypeAttributes(item.attributes.transactions[0].type).prefix}${localNumberFormat(item.attributes.transactions[0].currencyCode, item.attributes.transactions.reduce((total, split) => total + parseFloat(split.amount), 0))}`}
          </AText>
        </AView>
      </AStackFlex>
    </APressable>
  ), [item, colors]);
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

  const searchBarRef = React.useRef<SearchBarCommands>(null);
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        ref: searchBarRef,
        autoCapitalize: 'none',
        placeholder: translate('transaction_search_placeholder'),
        headerIconColor: colors.text,
        textColor: colors.text,
        hintTextColor: colors.text,
        onChangeText: (event) => setSearchDraft(event.nativeEvent.text),
        onBlur: () => setSearch(searchDraft),
        onSearchButtonPress: () => setSearch(searchDraft),
        disableBackButtonOverride: true,
        shouldShowHintSearchIcon: false,
      },
    });
  }, [navigation, colors.text, searchDraft]);

  useEffect(() => {
    if (params?.transactionSearch !== undefined) {
      setSearch(params.transactionSearch);
      setSearchDraft(params.transactionSearch);
      searchBarRef.current?.setText(params.transactionSearch);
      navigation.setParams({ transactionSearch: undefined });
    }
    if (params?.category !== undefined) {
      setCategory(params.category);
      setTag('');
      setAccount('');
      setSearch('');
      setSearchDraft('');
      searchBarRef.current?.clearText();
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
    searchBarRef.current?.clearText();
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

      return Array.from(byDay.entries()).map(([title, data]) => ({ title, data }));
    },
    [transactions],
  );

  return (
    <SwipeListView
      useSectionList
      nestedScrollEnabled={false}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={(
        <RefreshControl
          refreshing={loading}
          onRefresh={onLoad}
        />
      )}
      ListHeaderComponent={(
        <AView>
          <AStackFlex row backgroundColor={colors.tileBackgroundColor} py={8}>
            {(type !== '' || currentCode !== '' || account !== '' || category !== '' || tag !== '' || search !== '') && (
            <AView
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: 30,
                height: 30,
                marginHorizontal: 5,
              }}
            >
              <Ionicons onPress={resetFilters} name="close-circle" size={19} color={colors.text} />
            </AView>
            )}
            <AScrollView horizontal showsHorizontalScrollIndicator={false}>
              <ADateFilterButton currentDate={start} selectDate={(date: Date) => { setStartDate(date); setEndDate(moment(date).endOf('month').toDate()); }} />
              <AFilterButton filterType={translate('transaction_type_label')} selected={type} selectFilter={(selected: 'withdrawal' | 'deposit' | 'transfer') => setType(selected)} navigation={navigation} capitalize />
              <AFilterButton filterKind="category" filterType={translate('transaction_form_category_label')} selected={category} selectFilter={setCategory} navigation={navigation} />
              <AFilterButton filterKind="tag" filterType={translate('transaction_form_tags_label')} selected={tag} selectFilter={setTag} navigation={navigation} />
              <AFilterButton filterType={translate('currency')} selected={currentCode} selectFilter={(selected) => setCurrentCode(selected)} navigation={navigation} />
              <AFilterButton filterType={translate('home_accounts')} selected={account} selectFilter={(selected) => setAccount(selected)} navigation={navigation} />
            </AScrollView>
          </AStackFlex>
          {loadError && (
          <AView style={{ padding: 16 }}>
            <AText fontSize={13}>{translate('transaction_filter_load_error')}</AText>
            <AButton style={{ height: 44, marginTop: 12 }} onPress={onLoad}>
              <AText fontSize={14}>{translate('transaction_filter_retry')}</AText>
            </AButton>
          </AView>
          )}
        </AView>
      )}
      ListEmptyComponent={!loading && !loadError ? <AText py={30} fontSize={14} textAlign="center">{translate('transaction_filter_no_results')}</AText> : null}
      initialNumToRender={15}
      keyExtractor={(item: TransactionType) => item.id}
      sections={!loading ? transactionSections : []}
      showsVerticalScrollIndicator
      renderSectionHeader={({ section }) => {
        const label = moment(section.title, 'YYYY-MM-DD', true).isValid()
          ? moment(section.title, 'YYYY-MM-DD').format('LL')
          : section.title;
        return (
          <AView
            style={{
              backgroundColor: colors.tileBackgroundColor,
              paddingHorizontal: 10,
              paddingTop: 12,
              paddingBottom: 6,
              borderTopWidth: 0.5,
              borderColor: colors.listBorderColor,
            }}
          >
            <AText bold>{label}</AText>
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
      getItemLayout={(_, index: number) => ({ length: ITEM_HEIGHT + 1, offset: (ITEM_HEIGHT + 1) * index, index })}
      ListFooterComponent={ListFooterComponent({ onLoadMore, initLoading: loading })}
    />
  );
}
