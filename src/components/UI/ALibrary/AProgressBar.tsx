import React from 'react';
import { View } from 'react-native';

import { AStyle } from './types';
import { useThemeColors } from '../../../lib/common';

type AProgressBarType = {
  value: number
  color?: string
  style?: AStyle
}

export default function AProgressBar({
  value,
  color = 'black',
  style = null,
}: AProgressBarType) {
  const { colors } = useThemeColors();

  return (
    <View
      style={{
        width: '100%',
        height: 5,
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: colors.brandNeutralLight,
        ...style,
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${value > 100 ? 100 : value}%`,
          borderRadius: 3,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
