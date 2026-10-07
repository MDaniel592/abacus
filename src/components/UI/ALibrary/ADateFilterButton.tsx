import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, TouchableOpacity } from 'react-native';
import moment from 'moment';
import React, { useState } from 'react';
import { getLocales } from 'expo-localization';
import { Ionicons } from '@expo/vector-icons';
import { AText } from './index';
import { useThemeColors } from '../../../lib/common';
import AView from './AView';

interface ADateFilterButtonType {
  currentDate: Date;
  selectDate: (date: Date) => void;
}

export default function ADateFilterButton({
  currentDate,
  selectDate,
}: ADateFilterButtonType) {
  const [locale] = getLocales();
  const { colors, colorScheme } = useThemeColors();
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');

  return (
    <AView style={{ marginRight: 8 }}>
      {showDatePicker && (
        <DateTimePicker
          accentColor={colors.brandDark}
          themeVariant={colorScheme}
          locale={locale.languageCode}
          value={currentDate}
          style={{ flex: 1 }}
          onChange={(event, value) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (event.type === 'set' && value) selectDate(value);
          }}
        />
      )}
      {Platform.OS === 'android' && (
        <TouchableOpacity
          accessibilityRole="button"
          hitSlop={{ top: 6, bottom: 6 }}
          onPress={() => setShowDatePicker(true)}
        >
          <AView
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.tileBackgroundColor,
              borderWidth: 1,
              borderColor: colors.listBorderColor,
              borderRadius: 18,
              paddingLeft: 12,
              paddingRight: 10,
              height: 36,
            }}
          >
            <Ionicons name="calendar-outline" size={15} color={colors.text} style={{ marginRight: 6 }} />
            <AText fontSize={13}>{moment(currentDate).format('ll')}</AText>
            <Ionicons name="chevron-down-outline" size={14} color={colors.text} style={{ marginLeft: 4 }} />
          </AView>
        </TouchableOpacity>
      )}
    </AView>
  );
}
