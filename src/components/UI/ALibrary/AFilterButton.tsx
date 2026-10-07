import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AText, AView } from './index';
import { NavigationType } from '../../../types/screen';
import { useThemeColors } from '../../../lib/common';
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

  return (
    <TouchableOpacity
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
          backgroundColor: selected ? colors.filterBorderColor : colors.listBorderColor,
          borderRadius: 8,
          paddingHorizontal: 7,
          marginHorizontal: 2,
          height: 35,
        }}
      >
        <AText fontSize={15} bold capitalize={capitalize}>
          {selected === NO_CATEGORY ? translate('no_category') : filterType === translate('transaction_type_label') && selected !== '' ? translate(`transaction_form_type_${selected}`) : selected || filterType}
        </AText>
        <Ionicons name="chevron-down-outline" size={15} color={colors.text} />
      </AView>
    </TouchableOpacity>
  );
}
