import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  RefreshControl,
  View, Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import PagerView from 'react-native-pager-view';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import usePrivateNumberFormat from '../../lib/use-private-number-format';
import { RootDispatch, RootState } from '../../store';
import translate from '../../i18n/locale';
import { useBrandStyle, useThemeColors } from '../../lib/common';

import {
  AScrollView,
  AStack,
  AText,
  AProgressBar,
  ASkeleton, AStackFlex,
} from '../UI/ALibrary';
import DisplayAllAccountsSwitch from '../UI/DisplayAllAccountsSwitch';
import ErrorBoundary from '../UI/ErrorBoundary';
import IncomeExpenseBar from '../UI/IncomeExpenseBar';
import { NO_CATEGORY } from '../../lib/transaction-search';

const EXTRA_SCROLL_PADDING = 24;

function AssetsAccounts() {
  const localNumberFormat = usePrivateNumberFormat();
  const { colors } = useThemeColors();
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const displayAllAccounts = useSelector((state: RootState) => state.configuration.displayAllAccounts);
  const loading = useSelector((state: RootState) => state.loading.effects.accounts.getAccounts?.loading);
  const dispatch = useDispatch<RootDispatch>();
  const selectedBrandStyle = useSelector((state: RootState) => state.configuration.selectedBrandStyle || colors.brandStyle);

  const [nameSortOrder, setNameSortOrder] = useState('asc');
  const [balanceSortOrder, setBalanceSortOrder] = useState('desc');
  const [lastPressed, setLastPressed] = useState(null);

  const handleSortPress = (position) => {
    setLastPressed(position);
    if (position === 'left') {
      setNameSortOrder(nameSortOrder === 'asc' ? 'desc' : 'asc');
      setBalanceSortOrder(null);
    } else if (position === 'right') {
      setBalanceSortOrder(balanceSortOrder === 'desc' ? 'asc' : 'desc');
      setNameSortOrder(null);
    }
  };

  const sortedAccounts = accounts
    .filter((a) => a.display || displayAllAccounts)
    .sort((a, b) => {
      if (nameSortOrder) {
        return nameSortOrder === 'asc'
          ? a.attributes.name.localeCompare(b.attributes.name)
          : b.attributes.name.localeCompare(a.attributes.name);
      } if (balanceSortOrder) {
        return balanceSortOrder === 'asc'
          ? parseFloat(a.attributes.currentBalance) - parseFloat(b.attributes.currentBalance)
          : parseFloat(b.attributes.currentBalance) - parseFloat(a.attributes.currentBalance);
      }
      return 0;
    });

  return (
    <AScrollView
      showsVerticalScrollIndicator={false}
      style={{ paddingHorizontal: 16, paddingBottom: EXTRA_SCROLL_PADDING }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => Promise.all([dispatch.accounts.getAccounts(), dispatch.firefly.getNetWorth()])} />}
    >
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
      }}
      >
        <View>
          <AText fontSize={17} bold>{translate('home_accounts')}</AText>
          <AText fontSize={11} color={colors.greyLight}>{translate('home_accounts_period')}</AText>
        </View>
        <DisplayAllAccountsSwitch />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <TouchableOpacity accessibilityLabel={translate('home_sort_name')} hitSlop={12} style={{ padding: 4 }} onPress={() => handleSortPress('left')}>
          <MaterialCommunityIcons name="sort-alphabetical-ascending" size={22} color={lastPressed === 'left' ? selectedBrandStyle : colors.greyLight} />
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel={translate('home_sort_balance')} hitSlop={12} style={{ padding: 4 }} onPress={() => handleSortPress('right')}>
          <MaterialCommunityIcons name="sort-numeric-descending" size={22} color={lastPressed === 'right' ? selectedBrandStyle : colors.greyLight} />
        </TouchableOpacity>
      </View>
      {sortedAccounts.map((account) => {
        const balance = parseFloat(account.attributes.currentBalance);
        const difference = parseFloat(account.attributes.balanceDifference || '0');
        return (
          <View
            key={account.id}
            style={{
              borderWidth: 1, borderColor: colors.listBorderColor, borderRadius: 10, padding: 9, marginBottom: 6, backgroundColor: colors.tileBackgroundColor,
            }}
          >
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            }}
            >
              <View style={{ flex: 1 }}>
                <AText fontSize={13} bold numberOfLines={2}>
                  {account.attributes.name}
                  {account.attributes.includeNetWorth ? '' : ' *'}
                </AText>
                <AText fontSize={11} py={2} color={colors.greyLight}>{account.attributes.currencyCode}</AText>
              </View>
              <ASkeleton loading={loading}>
                <AText fontSize={16} bold textAlign="right" numberOfLines={1} adjustsFontSizeToFit>{localNumberFormat(account.attributes.currencyCode, balance)}</AText>
              </ASkeleton>
            </View>
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            }}
            >
              <AText fontSize={10} color={colors.greyLight}>{translate('home_period_change')}</AText>
              <ASkeleton loading={loading}>
                <AText fontSize={12} color={difference < 0 && account.attributes.type !== 'liabilities' ? colors.brandDanger : colors.brandSuccess}>
                  {difference > 0 ? '+' : ''}
                  {localNumberFormat(account.attributes.currencyCode, difference)}
                </AText>
              </ASkeleton>
            </View>
          </View>
        );
      })}
      {!loading && sortedAccounts.length === 0 && <AText fontSize={13} py={24}>{translate('home_no_accounts')}</AText>}
      <AText fontSize={10} py={10} color={colors.greyLight}>{translate('account_not_included_in_net_worth')}</AText>
    </AScrollView>
  );
}

function InsightCategories() {
  const localNumberFormat = usePrivateNumberFormat();
  const { colors } = useThemeColors();
  const insightCategories = useSelector((state: RootState) => state.categories.insightCategories);
  const total = useSelector((state: RootState) => state.categories.total);
  const perDay = useSelector((state: RootState) => state.categories.perDay);
  const loading = useSelector((state: RootState) => state.loading.effects.categories.getInsightCategories?.loading);
  const start = useSelector((state: RootState) => state.firefly.rangeDetails.start);
  const end = useSelector((state: RootState) => state.firefly.rangeDetails.end);
  const dispatch = useDispatch<RootDispatch>();
  const navigation = useNavigation();
  const rows = [...insightCategories]
    .sort((left, right) => Math.abs(right.expense) - Math.abs(left.expense));

  const openCategory = (category: string) => navigation.dispatch(CommonActions.navigate(translate('navigation_transactions_tab'), {
    screen: 'TransactionsScreen',
    merge: true,
    params: {
      category,
      transactionType: '',
      startDate: new Date(`${start}T12:00:00`),
      endDate: new Date(`${end}T12:00:00`),
    },
  }));

  const categoryScale = Math.max(1, ...insightCategories.flatMap((category) => [category.income, Math.abs(category.expense)]));
  const renderRow = (category, summary = false) => {
    const scale = summary ? Math.max(1, category.income, Math.abs(category.expense)) : categoryScale;
    return (
      <View style={{ paddingVertical: summary ? 9 : 7, borderBottomWidth: 0.5, borderColor: colors.listBorderColor }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3,
        }}
        >
          <AText fontSize={category.name === 'perday' ? 10 : 12} bold={summary} style={{ flex: 1 }} numberOfLines={2}>
            {category.name === 'total' ? translate('category_total_balance')
              : category.name === 'perday' ? translate('transaction_filter_daily_average')
                : category.name === 'no-category' ? translate('no_category') : category.name}
          </AText>
          <ASkeleton loading={loading}>
            <AText fontSize={summary ? 15 : 12} bold color={category.difference > 0 ? colors.brandSuccess : category.difference < 0 ? colors.brandDanger : colors.text} textAlign="right" numberOfLines={1} adjustsFontSizeToFit>
              {category.difference > 0 ? '+' : ''}
              {localNumberFormat(category.currencyCode, category.difference)}
            </AText>
          </ASkeleton>
        </View>
        {category.name !== 'perday' && <IncomeExpenseBar income={category.income} incomeTotal={scale} expense={category.expense} expenseTotal={scale} currencyCode={category.currencyCode} loading={loading} barHeight={summary ? 7 : 5} />}
      </View>
    );
  };

  return (
    <AScrollView
      showsVerticalScrollIndicator={false}
      style={{ paddingHorizontal: 16, paddingBottom: 24 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => Promise.all([dispatch.categories.getInsightCategories(), dispatch.firefly.getNetWorth()])} />}
    >
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8,
      }}
      >
        <AText fontSize={18} bold>{translate('navigation_categories_tab')}</AText>

      </View>
      {total && renderRow(total, true)}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between', paddingTop: 7, paddingBottom: 2,
      }}
      >
        <AText fontSize={10} color={colors.greyLight}>{translate('home_expenses')}</AText>
        <AText fontSize={10} color={colors.greyLight}>{translate('home_income')}</AText>
      </View>
      {rows.map((category) => (
        <Pressable key={category.id} accessibilityRole="button" onPress={() => openCategory(category.name === 'no-category' ? NO_CATEGORY : category.name)}>
          {renderRow(category)}
        </Pressable>
      ))}
      {perDay && renderRow(perDay, true)}
      {!loading && rows.length === 0 && <AText fontSize={13} py={24} textAlign="center">{translate('transaction_filter_no_results')}</AText>}
    </AScrollView>
  );
}

function InsightBudgets() {
  const localNumberFormat = usePrivateNumberFormat();
  const { colors } = useThemeColors();
  const tabBarHeight = useBottomTabBarHeight();
  const insightBudgets = useSelector((state: RootState) => state.budgets.budgets);
  const loading = useSelector((state: RootState) => state.loading.effects.budgets.getInsightBudgets?.loading);
  const dispatch = useDispatch<RootDispatch>();

  return (
    <AScrollView
      showsVerticalScrollIndicator={false}
      style={{ paddingBottom: tabBarHeight + EXTRA_SCROLL_PADDING }}
      refreshControl={(
        <RefreshControl
          refreshing={false}
          onRefresh={() => Promise.all([
            dispatch.budgets.getInsightBudgets(),
            dispatch.firefly.getNetWorth(),
          ])}
        />
      )}
    >
      <AText fontSize={18} lineHeight={22} style={{ margin: 8 }} bold>
        {translate('home_budgets')}
      </AText>
      {insightBudgets.filter((budget) => budget.attributes?.active).map((budget) => (
        <AStack
          key={budget.attributes.name}
          mx={15}
          style={{ height: 60 }}
        >
          <AStackFlex row justifyContent="space-between">
            <AStack
              style={{ maxWidth: '80%' }}
              alignItems="flex-start"
            >
              <AText fontSize={13} lineHeight={22} numberOfLines={1}>
                {budget.attributes.name}
              </AText>
              <AText fontSize={12} lineHeight={20} numberOfLines={1}>
                {localNumberFormat(budget.currencyCode, budget.differenceFloat < 0 ? (budget.differenceFloat * -1) : budget.differenceFloat)}
                {' / '}
                {localNumberFormat(budget.currencyCode, budget.limit)}
              </AText>
            </AStack>

            <ASkeleton loading={loading}>
              <AStack alignItems="flex-end">
                <AStack
                  px={6}
                  py={2}
                  backgroundColor={-budget.differenceFloat > budget.limit ? colors.brandDangerLight : colors.brandSuccessLight}
                  style={{ borderRadius: 5 }}
                >
                  <AText
                    fontSize={15}
                    numberOfLines={1}
                    color={-budget.differenceFloat > budget.limit ? colors.brandDanger : colors.brandSuccess}
                    style={{ textAlign: 'center' }}
                    bold
                  >
                    {`${(budget.limit > 0 ? (((budget.differenceFloat * -1) * 100) / budget.limit).toFixed(0) : 0)}%`}
                  </AText>
                </AStack>
              </AStack>
            </ASkeleton>
          </AStackFlex>
          <AProgressBar
            color={-budget.differenceFloat > budget.limit ? colors.red : colors.green}
            value={((-budget.differenceFloat * 100) / budget.limit) || 0}
          />
        </AStack>
      ))}
    </AScrollView>
  );
}

function formatDate(date) {
  if (!date) {
    return translate('date_unavailable');
  }
  const momentDate = moment(date);
  const formattedDate = momentDate.isValid() ? momentDate.format('LL') : translate('date_unavailable');
  return formattedDate;
}

function Bills() {
  const localNumberFormat = usePrivateNumberFormat();
  const { colors } = useThemeColors();
  const tabBarHeight = useBottomTabBarHeight();
  const bills = useSelector((state: RootState) => state.bills.bills);
  const loading = useSelector((state: RootState) => state.loading.effects.bills?.getBills?.loading);
  const dispatch = useDispatch<RootDispatch>();

  useEffect(() => {
    dispatch.bills.getBills();
  }, [dispatch]);

  return (
    <AScrollView
      showsVerticalScrollIndicator={false}
      style={{ paddingBottom: tabBarHeight + EXTRA_SCROLL_PADDING }}
      refreshControl={(
        <RefreshControl
          refreshing={loading}
          onRefresh={() => Promise.all([
            dispatch.bills.getBills(),
            dispatch.firefly.getNetWorth(),
          ])}
        />
      )}
    >
      <AText fontSize={18} lineHeight={22} style={{ margin: 8 }} bold>
        {translate('home_bills')}
      </AText>
      {bills.map((bill) => {
        const amountPaid = parseFloat(bill.attributes.currentPaidAmount || '0');
        const amountMin = parseFloat(bill.attributes.amountMin);
        const percentagePaid = (amountPaid / amountMin) * 100;
        const isPaid = amountPaid >= amountMin;

        const statusText = isPaid
          ? `${translate('bills_paid')} ${formatDate(bill.attributes.nextExpectedMatch)}`
          : amountPaid > 0
            ? `${percentagePaid.toFixed(0)}%`
            : `${translate('due_by')} ${formatDate(bill.attributes.nextExpectedMatch)}`;

        return (
          <AStack
            key={bill.id}
            mx={15}
            style={{
              height: 60,
            }}
          >
            <AStackFlex row justifyContent="space-between">
              <AStack
                style={{ maxWidth: '80%' }}
                alignItems="flex-start"
              >
                <AText fontSize={13} lineHeight={22} numberOfLines={1}>
                  {bill.attributes.name}
                </AText>
                <AText fontSize={12} lineHeight={20} numberOfLines={1}>
                  {localNumberFormat(bill.attributes.currencyCode, amountPaid)}
                  {' / '}
                  {localNumberFormat(bill.attributes.currencyCode, amountMin)}
                </AText>
              </AStack>

              <ASkeleton loading={loading}>
                <AStack alignItems="flex-end">
                  <AStack
                    px={6}
                    py={2}
                    backgroundColor={isPaid ? colors.brandSuccessLight : colors.brandNeutralLight}
                    style={{ borderRadius: 5 }}
                  >
                    <AText
                      fontSize={15}
                      numberOfLines={1}
                      color={isPaid ? colors.brandSuccess : colors.brandNeutral}
                      style={{ textAlign: 'center' }}
                      bold
                    >
                      {statusText}
                    </AText>
                  </AStack>
                </AStack>
              </ASkeleton>
            </AStackFlex>

            <AProgressBar
              color={percentagePaid >= 50.0 ? colors.green : colors.brandWarning}
              value={percentagePaid}
            />
          </AStack>
        );
      })}
    </AScrollView>
  );
}

function PiggyBanks() {
  const localNumberFormat = usePrivateNumberFormat();
  const { colors } = useThemeColors();
  const tabBarHeight = useBottomTabBarHeight();
  const piggyBanks = useSelector((state: RootState) => state.piggyBanks.piggyBanks);
  const loading = useSelector((state: RootState) => state.loading.effects.piggyBanks?.getPiggyBanks?.loading);
  const dispatch = useDispatch<RootDispatch>();

  return (
    <AScrollView
      showsVerticalScrollIndicator={false}
      style={{ paddingBottom: tabBarHeight + EXTRA_SCROLL_PADDING }}
      refreshControl={(
        <RefreshControl
          refreshing={false}
          onRefresh={() => Promise.all([
            dispatch.piggyBanks.getPiggyBanks(),
            dispatch.firefly.getNetWorth(),
          ])}
        />
      )}
    >
      <AText fontSize={18} lineHeight={22} style={{ margin: 8 }} bold>
        {translate('home_piggy_banks')}
      </AText>
      {piggyBanks.filter((pb) => pb.attributes?.percentage).map((pb) => (
        <AStack
          key={pb.id}
          mx={15}
          style={{
            height: 60,
          }}
        >
          <AStackFlex row justifyContent="space-between">
            <AStack
              style={{ maxWidth: '80%' }}
              alignItems="flex-start"
            >
              <AText fontSize={13} lineHeight={22} numberOfLines={1}>
                {pb.attributes.name}
              </AText>
              <AText fontSize={12} lineHeight={20} numberOfLines={1}>
                {localNumberFormat(pb.attributes.currencyCode, pb.attributes.currentAmount)}
                {' / '}
                {localNumberFormat(pb.attributes.currencyCode, pb.attributes.targetAmount)}
              </AText>
            </AStack>

            <ASkeleton loading={loading}>
              <AStack alignItems="flex-end">
                <AStack
                  px={6}
                  py={2}
                  backgroundColor={pb.attributes.leftToSave > 0.0 ? colors.brandNeutralLight : colors.brandSuccessLight}
                  style={{ borderRadius: 5 }}
                >
                  <AText
                    fontSize={15}
                    numberOfLines={1}
                    color={pb.attributes.leftToSave > 0.0 ? colors.brandNeutral : colors.brandSuccess}
                    style={{ textAlign: 'center' }}
                    bold
                  >
                    {`${pb.attributes.percentage?.toFixed(0)}%`}
                  </AText>
                </AStack>
              </AStack>
            </ASkeleton>
          </AStackFlex>

          <AProgressBar
            color={pb.attributes.percentage > 50.0 ? colors.green : colors.brandWarning}
            value={pb.attributes.percentage}
          />
        </AStack>
      ))}
    </AScrollView>
  );
}

function NetWorth() {
  const localNumberFormat = usePrivateNumberFormat();
  const { colors, colorScheme } = useThemeColors();
  const hideBalance = useSelector((state: RootState) => state.configuration.hideBalance);
  const netWorth = useSelector((state: RootState) => state.firefly.netWorth);
  const earned = useSelector((state: RootState) => state.firefly.earned);
  const spent = useSelector((state: RootState) => state.firefly.spent);
  const currentCode = useSelector((state: RootState) => state.currencies.currentCode);
  const loading = useSelector((state: RootState) => state.loading.effects.firefly.getNetWorth?.loading);

  return (
    <View testID="home_screen_net_worth" style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 9 }}>
      <View>
        <LinearGradient
          colors={colorScheme === 'dark' ? ['#523B88', '#7054AB'] : ['#6446B8', '#7B58CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 14, padding: 12 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AText fontSize={12} color="white">{translate('home_net_worth')}</AText>
          </View>
          <ASkeleton loading={loading}>
            <AText fontSize={27} color="white" bold numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} py={5}>
              {hideBalance ? '••••••' : localNumberFormat(currentCode, parseFloat(netWorth[0]?.monetaryValue || '0'))}
            </AText>
          </ASkeleton>
        </LinearGradient>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 7 }}>
        {[{ label: 'home_income', data: earned, color: colors.brandSuccess }, { label: 'home_expenses', data: spent, color: colors.brandDanger }].map((metric) => (
          <View
            key={metric.label}
            style={{
              flex: 1, borderRadius: 10, backgroundColor: colors.tileBackgroundColor, borderWidth: 1, borderColor: colors.listBorderColor, padding: 8,
            }}
          >
            <AText fontSize={11} color={colors.greyLight}>{translate(metric.label)}</AText>
            <ASkeleton loading={loading}>
              <AText fontSize={16} color={metric.color} bold py={5} numberOfLines={1} adjustsFontSizeToFit>
                {hideBalance ? '••••' : localNumberFormat(currentCode, Math.abs(parseFloat(metric.data[0]?.monetaryValue || '0')))}
              </AText>
            </ASkeleton>
          </View>
        ))}
      </View>
    </View>
  );
}

export function CategoriesScreen() {
  const rangeDetails = useSelector((state: RootState) => state.firefly.rangeDetails);
  const currentCode = useSelector((state: RootState) => state.currencies.currentCode);
  const dispatch = useDispatch<RootDispatch>();
  useFocusEffect(useCallback(() => {
    dispatch.categories.getInsightCategories().catch(() => {});
  }, [dispatch, rangeDetails.start, rangeDetails.end, currentCode]));
  return <ErrorBoundary><InsightCategories /></ErrorBoundary>;
}

export default function HomeScreen() {
  const { colors } = useThemeColors();
  const { brandStyle, brandStyleContrast } = useBrandStyle();
  const start = useSelector((state: RootState) => state.firefly.rangeDetails.start);
  const end = useSelector((state: RootState) => state.firefly.rangeDetails.end);
  const currentCode = useSelector((state: RootState) => state.currencies.currentCode);
  const dispatch = useDispatch<RootDispatch>();
  const viewPagerRef = useRef<PagerView>(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const pages = ['home_accounts', 'transaction_form_category_label', 'home_budgets', 'home_bills', 'home_piggy_banks'];

  useEffect(() => {
    Promise.all([dispatch.currencies.getCurrencies(), dispatch.configuration.getCurrentApiVersion()]).catch(() => {});
  }, [dispatch]);

  useFocusEffect(useCallback(() => {
    if (axios.defaults.headers.Authorization) {
      Promise.all([
        dispatch.firefly.getNetWorth(),
        dispatch.accounts.getAccounts(),
        dispatch.categories.getInsightCategories(),
        dispatch.budgets.getInsightBudgets(),
        dispatch.bills.getBills(),
        dispatch.piggyBanks.getPiggyBanks(),
      ]).catch(() => {});
    }
  }, [dispatch, start, end, currentCode]));

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      <ErrorBoundary>
        <NetWorth />
        <View style={{ paddingBottom: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}>
            {pages.map((label, index) => (
              <Pressable
                key={label}
                accessibilityRole="tab"
                accessibilityState={{ selected: selectedPage === index }}
                onPress={() => { setSelectedPage(index); viewPagerRef.current?.setPage(index); }}
                style={{
                  backgroundColor: selectedPage === index ? brandStyle : colors.tileBackgroundColor, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 9,
                }}
              >
                <AText fontSize={11} color={selectedPage === index ? brandStyleContrast : colors.greyLight} bold>{translate(label)}</AText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        <PagerView ref={viewPagerRef} initialPage={0} style={{ flex: 1 }} onPageSelected={(event) => setSelectedPage(event.nativeEvent.position)}>
          <View key="accounts" style={{ flex: 1 }} collapsable={false}><AssetsAccounts /></View>
          <View key="categories" style={{ flex: 1 }} collapsable={false}><InsightCategories /></View>
          <View key="budgets" style={{ flex: 1 }} collapsable={false}><InsightBudgets /></View>
          <View key="bills" style={{ flex: 1 }} collapsable={false}><Bills /></View>
          <View key="piggy" style={{ flex: 1 }} collapsable={false}><PiggyBanks /></View>
        </PagerView>
      </ErrorBoundary>
    </View>
  );
}
