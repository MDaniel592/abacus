import React, {
  useEffect, useState,
} from 'react';
import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryVoronoiContainer,
} from 'victory-native';
import { AntDesign } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useDispatch, useSelector } from 'react-redux';
import {
  Pressable,
  View,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { getLocales } from 'expo-localization';
import {
  AStackFlex,
  AText, AView,
} from '../UI/ALibrary';

import { RootDispatch, RootState } from '../../store';
import Loading from '../UI/Loading';
import translate from '../../i18n/locale';
import { useThemeColors } from '../../lib/common';
import ErrorBoundary from '../UI/ErrorBoundary';

export default function AssetsHistoryChart() {
  const [locale] = getLocales();
  const { width } = useWindowDimensions();
  const { colors } = useThemeColors();
  const start = useSelector((state: RootState) => state.firefly.rangeDetails.start);
  const end = useSelector((state: RootState) => state.firefly.rangeDetails.end);
  const accountCharts = useSelector((state: RootState) => state.firefly?.accounts);
  const range = useSelector((state: RootState) => state.firefly.rangeDetails.range);
  const [hiddenAccounts, setHiddenAccounts] = useState<string[]>([]);
  const loading = useSelector((state: RootState) => state.loading.effects.firefly.getAccountChart?.loading);
  const currentCode = useSelector((state: RootState) => state.currencies.currentCode);
  const dispatch = useDispatch<RootDispatch>();

  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  useEffect(() => {
    setSelectedDate(null);
  }, [start, end, currentCode]);

  const activeCharts = accountCharts.filter((data) => data.entries.length > 0 && !hiddenAccounts.includes(data.label));
  const dates = Array.from(new Set(activeCharts.flatMap((chart) => chart.entries.map((point) => point.x)))).sort((a, b) => a - b);
  const displayedDate = selectedDate ?? dates[dates.length - 1];
  const minimumBalance = activeCharts.reduce((minimum, chart) => Math.min(minimum, chart.minY), Infinity);
  const maximumBalance = activeCharts.reduce((maximum, chart) => Math.max(maximum, chart.maxY), -Infinity);
  const balanceDate = new Date(displayedDate);
  if (range > 3) balanceDate.setUTCMonth(balanceDate.getUTCMonth() + 1, 0);
  const tickValues = range > 1
    ? dates.filter((date, index) => index === 0 || new Date(date).getUTCMonth() !== new Date(dates[index - 1]).getUTCMonth())
    : dates.filter((_, index) => index % Math.max(1, Math.ceil(dates.length / 6)) === 0);
  const formatAmount = (amount: number) => amount.toLocaleString(locale.languageTag, {
    style: 'currency', currency: currentCode, minimumFractionDigits: 2,
  });

  return (
    <ErrorBoundary>
      <ScrollView bounces={false}>
        <AStackFlex
          backgroundColor={colors.tileBackgroundColor}
          justifyContent="center"
          style={{
            borderTopWidth: 0.5,
            borderBottomWidth: 0.5,
            borderColor: colors.listBorderColor,
          }}
        >
          <AStackFlex
            row
            alignItems="center"
            justifyContent="space-between"
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <AText fontSize={20} bold style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
              {translate('assets_history_chart')}
              {' '}
              {currentCode}
            </AText>
            <AStackFlex flex={0} row justifyContent="flex-end" style={{ width: 48 }}>
              <Pressable
                style={{
                  minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center',
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch();
                  dispatch.firefly.getAccountChart();
                }}
              >
                <AntDesign name="reload" size={24} color={colors.text} />
              </Pressable>
            </AStackFlex>
          </AStackFlex>
          {!loading && displayedDate !== undefined && (
            <AStackFlex flex={0} px={12} py={8} gap={6}>
              <AText fontSize={14} color={colors.brandPrimary} bold>
                {new Date(displayedDate).toLocaleDateString(locale.languageTag, {
                  month: 'long', year: 'numeric', ...(range <= 3 ? { day: 'numeric' } : {}),
                })}
              </AText>
              {activeCharts.map((chart) => {
                const point = chart.entries.filter((entry) => entry.x <= balanceDate.getTime()).slice(-1)[0];
                return (
                  <AStackFlex key={chart.label} flex={0} row alignItems="center" justifyContent="space-between" gap={12}>
                    <AStackFlex flex={1} row alignItems="center" gap={8}>
                      <View style={{
                        width: 8, height: 8, borderRadius: 4, backgroundColor: chart.color,
                      }}
                      />
                      <AText fontSize={13} numberOfLines={1} style={{ flex: 1 }}>{chart.label}</AText>
                    </AStackFlex>
                    <AText fontSize={13} bold>{point ? formatAmount(point.y) : '—'}</AText>
                  </AStackFlex>
                );
              })}
            </AStackFlex>
          )}
          {loading && (
          <AStackFlex justifyContent="center">
            <AStackFlex row style={{ height: 400 }} alignItems="center">
              <Loading />
            </AStackFlex>
          </AStackFlex>
          )}
          {!loading && (
          <VictoryChart
            padding={{
              top: 20,
              left: 55,
              right: 24,
              bottom: 60,
            }}
            height={320}
            width={width}
            domainPadding={2}
            domain={{ x: [new Date(start).getTime(), new Date(end).getTime()] }}
            containerComponent={(
              <VictoryVoronoiContainer
                voronoiDimension="x"
                voronoiBlacklist={['selected-date', ...activeCharts.map((chart) => `points-${chart.label}`)]}
                onActivated={(points) => {
                  if (points.length) setSelectedDate(points[0].x);
                }}
              />
          )}
          >
            <VictoryAxis
              dependentAxis
              crossAxis={false}
              tickCount={6}
              tickFormat={(x) => (Math.abs(x) >= 1000 ? `${(x / 1000).toLocaleString(locale.languageTag, { maximumFractionDigits: 1 })}k` : x.toLocaleString(locale.languageTag, { maximumFractionDigits: 0 }))}
              style={{
                grid: { stroke: '#949494', strokeWidth: 0.2 },
                axis: { stroke: colors.brandLight },
                tickLabels: {
                  fill: colors.text,
                  fontWeight: 200,
                },
              }}
            />
            <VictoryAxis
              offsetY={60}
              tickValues={tickValues}
              tickFormat={(x) => new Date(x).toLocaleDateString(locale.languageTag, range === 1 ? { day: 'numeric' } : { month: 'short' })}
              style={{
                grid: { stroke: '#949494', strokeWidth: 0.2 },
                axis: { stroke: colors.brandLight },
                tickLabels: {
                  fill: colors.text,
                  fontWeight: 200,
                  fontSize: 11,
                  angle: tickValues.length > 7 ? -40 : 0,
                },
              }}
            />
            {activeCharts.length > 0 && displayedDate !== undefined && (
              <VictoryLine
                name="selected-date"
                data={[
                  { x: displayedDate, y: minimumBalance === maximumBalance ? minimumBalance - 1 : minimumBalance },
                  { x: displayedDate, y: minimumBalance === maximumBalance ? maximumBalance + 1 : maximumBalance },
                ]}
                style={{
                  data: {
                    stroke: colors.text,
                    strokeWidth: 1.5,
                    strokeDasharray: '4, 4',
                    opacity: 0.5,
                  },
                }}
              />
            )}
            {activeCharts.flatMap((chart) => [
              <VictoryLine
                key={`line-${chart.label}`}
                style={{
                  data: {
                    stroke: chart.color,
                    strokeWidth: 2.5,
                  },
                }}
                interpolation="monotoneX"
                data={chart.entries}
                name={`${chart.label} (${chart.currencySymbol})`}
              />,
              (range > 3 || chart.entries.length === 1) && (
                <VictoryScatter
                  key={`points-${chart.label}`}
                  name={`points-${chart.label}`}
                  data={chart.entries}
                  size={({ datum }) => {
                    const sameMonth = new Date(datum.x).getUTCFullYear() === new Date(displayedDate).getUTCFullYear()
                      && new Date(datum.x).getUTCMonth() === new Date(displayedDate).getUTCMonth();
                    return (range > 3 ? sameMonth : datum.x === displayedDate) ? 5 : 3.5;
                  }}
                  style={{ data: { fill: chart.color, stroke: colors.tileBackgroundColor, strokeWidth: 1 } }}
                />
              ),
            ])}
          </VictoryChart>
          )}
        </AStackFlex>
        <AStackFlex px={10} py={12} gap={6} flexWrap="wrap" justifyContent="center" row>
          {accountCharts.map((chart) => chart.entries.length > 0 && (
            <TouchableOpacity
              key={chart.label}
              accessibilityRole="button"
              accessibilityLabel={chart.label}
              accessibilityState={{ selected: !hiddenAccounts.includes(chart.label) }}
              onPress={() => {
                setHiddenAccounts(
                  hiddenAccounts.includes(chart.label)
                    ? hiddenAccounts.filter((hiddenLabel) => hiddenLabel !== chart.label)
                    : [...hiddenAccounts, chart.label],
                );
              }}
            >
              <AView style={{
                backgroundColor: hiddenAccounts.includes(chart.label) ? colors.backgroundColor : chart.color,
                borderColor: chart.color,
                borderWidth: 2,
                borderRadius: 10,
                paddingHorizontal: 16,
                height: 32,
                justifyContent: 'center',
                margin: 2,
              }}
              >
                <AText fontSize={13} color={hiddenAccounts.includes(chart.label) ? chart.color : colors.backgroundColor} bold>
                  {chart.label}
                </AText>
              </AView>
            </TouchableOpacity>
          ))}
        </AStackFlex>
      </ScrollView>
    </ErrorBoundary>
  );
}
