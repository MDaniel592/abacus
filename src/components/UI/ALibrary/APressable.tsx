import React from 'react';
import { Pressable } from 'react-native';
import { AStyle } from './types';
import { useThemeColors } from '../../../lib/common';

type APressableType = {
  style?: AStyle
  disabled?: boolean
  children?: React.ReactNode
  onPress: () => void
  onLongPress?: () => void
  flexDirection?: 'row' | 'column'
}

export default function APressable({
  onPress,
  onLongPress,
  disabled = false,
  flexDirection = 'row',
  style = null,
  children = null,
}: APressableType) {
  const { colors } = useThemeColors();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        flexDirection,
        ...style,
        // Applied after style so rows with their own background still show press feedback.
        backgroundColor: pressed ? colors.listPressed : (style?.backgroundColor || 'transparent'),
      })}
    >
      {children}
    </Pressable>
  );
}
