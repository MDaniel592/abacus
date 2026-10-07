import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AText, AView } from './index';
import { NavigationType } from '../../../types/screen';
import { useBrandStyle, useThemeColors } from '../../../lib/common';
import translate from '../../../i18n/locale';
import { NO_CATEGORY } from '../../../lib/transaction-search';

interface AFilterButtonType {
  filterType: string;
  navigation: NavigationType;
  selected: string;
  selectFilter: (filter: string) => void;
  capitalize?: boolean;
  filterKind?: 'category' | 'tag';
}

export default function AFilterButton({
  selected,
  navigation,
  filterType,
  selectFilter,
  capitalize = false,
  filterKind,
}: AFilterButtonType) {
  const { colors } = useThemeColors();
  const { brandStyle, brandStyleContrast } = useBrandStyle();
  const textColor = selected ? brandStyleContrast : colors.text;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      hitSlop={{ top: 6, bottom: 6 }}
      onPress={() => navigation.navigate('FilterScreen', {
        filterType,
        selectFilter,
        filterKind,
        selected,
      })}
    >
      <AView
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: selected ? brandStyle : colors.tileBackgroundColor,
          borderWidth: 1,
          borderColor: selected ? brandStyle : colors.listBorderColor,
          borderRadius: 18,
          paddingLeft: 14,
          paddingRight: 10,
          marginRight: 8,
          height: 36,
        }}
      >
        <AText fontSize={13} color={textColor} bold={Boolean(selected)} capitalize={capitalize} numberOfLines={1} maxWidth={160}>
          {selected === NO_CATEGORY ? translate('no_category') : filterType === translate('transaction_type_label') && selected !== '' ? translate(`transaction_form_type_${selected}`) : selected || filterType}
        </AText>
        <Ionicons name="chevron-down-outline" size={14} color={textColor} style={{ marginLeft: 4 }} />
      </AView>
    </TouchableOpacity>
  );
}
