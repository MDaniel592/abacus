import React, { useState } from 'react';
import moment from 'moment';
import { CommonActions } from '@react-navigation/native';
import {
  View, Pressable, Modal, TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AText } from './ALibrary';
import { RootDispatch, RootState } from '../../store';
import { useThemeColors } from '../../lib/common';
import translate from '../../i18n/locale';

export default function NavigationHeader({ navigation }) {
  const { colors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const currentCode = useSelector((state: RootState) => state.currencies.currentCode);
  const title = useSelector((state: RootState) => state.firefly.rangeDetails.title);
  const start = useSelector((state: RootState) => state.firefly.rangeDetails.start);
  const range = useSelector((state: RootState) => state.firefly.rangeDetails.range);
  const [pickerRange, setPickerRange] = useState(range);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(moment(start).format('YYYY'));
  const dispatch = useDispatch<RootDispatch>();

  const changePeriod = (direction: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch();
    dispatch.firefly.setRange({ direction });
  };

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: colors.backgroundColor }}>
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable
          onPress={() => setPickerOpen(false)}
          style={{
            flex: 1, backgroundColor: '#0006', justifyContent: 'center', padding: 24,
          }}
        >
          <Pressable onPress={() => {}} style={{ backgroundColor: colors.tileBackgroundColor, borderRadius: 16, padding: 16 }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
            }}
            >
              <Pressable
                accessibilityLabel="Año anterior"
                onPress={() => setPickerYear(String(Number(pickerYear) - 1))}
                style={{
                  width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="chevron-back" size={18} color={colors.text} />
              </Pressable>
              <TextInput
                accessibilityLabel="Año"
                keyboardType="number-pad"
                value={pickerYear}
                onChangeText={setPickerYear}
                maxLength={4}
                style={{
                  width: 90, textAlign: 'center', fontSize: 20, color: colors.text,
                }}
              />
              <Pressable
                accessibilityLabel="Año siguiente"
                onPress={() => setPickerYear(String(Number(pickerYear) + 1))}
                style={{
                  width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="chevron-forward" size={18} color={colors.text} />
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 4, marginBottom: 10 }}>
              {[{ size: 1, label: 'period_month' }, { size: 3, label: 'period_quarter' }, { size: 6, label: 'period_half_year' }, { size: 12, label: 'period_year' }].map((choice) => (
                <Pressable
                  key={choice.size}
                  onPress={() => setPickerRange(choice.size)}
                  style={{
                    flex: 1, paddingVertical: 9, borderRadius: 7, backgroundColor: pickerRange === choice.size ? colors.brandStyle : colors.backgroundColor,
                  }}
                >
                  <AText fontSize={10} textAlign="center" color={pickerRange === choice.size ? 'white' : colors.text}>{translate(choice.label)}</AText>
                </Pressable>
              ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {Array.from({ length: 12 / pickerRange }, (_, slot) => slot * pickerRange).map((month) => (
                <Pressable
                  key={month}
                  onPress={() => {
                    if (!/^\d{4}$/.test(pickerYear) || Number(pickerYear) < 1) return;
                    dispatch.firefly.setRange({ range: pickerRange, monthStart: `${pickerYear}-${String(month + 1).padStart(2, '0')}-01` });
                    setPickerOpen(false);
                  }}
                  style={{ width: pickerRange === 1 ? '33.333%' : pickerRange === 12 ? '100%' : '50%', paddingVertical: 14 }}
                >
                  <AText textAlign="center" fontSize={14} color={moment(start).month() === month && moment(start).format('YYYY') === pickerYear ? colors.brandStyle : colors.text}>
                    {pickerRange === 12 ? pickerYear : pickerRange === 3 ? `T${month / 3 + 1}` : pickerRange === 6 ? `S${month / 6 + 1}` : moment().month(month).locale('es').format('MMM')
                      .replace('.', '')}
                  </AText>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setPickerOpen(false)} style={{ paddingTop: 12 }}><AText textAlign="center" fontSize={13}>Cancelar</AText></Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <View style={{
        height: 44, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}
      >
        <AText fontSize={20} bold color={colors.brandStyle}>abacus.</AText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={translate('home_previous_period')} onPress={() => changePeriod(-1)} style={{ padding: 8 }}>
            <Ionicons name="chevron-back" size={18} color={colors.greyLight} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={translate('filters_screen_title')}
            onPress={() => { setPickerYear(moment(start).format('YYYY')); setPickerRange(range); setPickerOpen(true); }}
            onLongPress={() => navigation.dispatch(CommonActions.navigate({ name: 'FiltersScreen' }))}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 10,
            }}
          >
            <AText fontSize={12} bold>{title}</AText>
            <AText fontSize={10} color={colors.greyLight}>{currentCode}</AText>
            <Ionicons name="chevron-down" size={12} color={colors.greyLight} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={translate('home_next_period')} onPress={() => changePeriod(1)} style={{ padding: 8 }}>
            <Ionicons name="chevron-forward" size={18} color={colors.greyLight} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
