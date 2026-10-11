import React from 'react';
import {
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { AStyle } from './types';
import AStack from './AStack';
import { useThemeColors } from '../../../lib/common';
import AView from './AView';
import { RootState } from '../../../store';

type AInputType = {
  height?: number
  bold?: boolean
  type?: 'text' | 'password'
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send' | 'default'
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad' | 'url'
  onSubmitEditing?: ({ nativeEvent: { text } }: { nativeEvent: { text: string; }; }) => void
  placeholder?: string
  value?: string
  onChangeText?: (text: string) => void
  onFocus?: React.ComponentProps<typeof TextInput>['onFocus']
  onBlur?: React.ComponentProps<typeof TextInput>['onBlur']
  InputLeftElement?: React.ReactNode
  InputRightElement?: React.ReactNode
  textAlign?: 'left' | 'center' | 'right'
  color?: string
  fontSize?: number
  numberOfLines?: number
  autoGrow?: boolean
  style?: AStyle
  testID?: string
}

export default function AInput({
  testID = null,
  height = 35,
  bold = false,
  type = 'text',
  returnKeyType = 'default',
  keyboardType = 'default',
  onSubmitEditing,
  placeholder = '',
  value,
  onChangeText,
  onFocus,
  onBlur,
  InputLeftElement = null,
  InputRightElement = null,
  textAlign = 'left',
  color,
  fontSize = 14,
  numberOfLines = 1,
  autoGrow = false,
  style = null,
}: AInputType) {
  const { colors } = useThemeColors();
  const { fontScale } = useWindowDimensions();
  const inputHeight = Math.max(height, Math.ceil(fontSize * fontScale * 1.5 + 10));
  const [isFocused, setIsFocused] = React.useState(false);
  const [contentHeight, setContentHeight] = React.useState(height);
  const selectedBrandStyle = useSelector((state: RootState) => state.configuration.selectedBrandStyle || colors.brandStyle);
  const handleFocus = (focusState: boolean, callback: () => void) => {
    setIsFocused(focusState);
    callback();
  };

  const selectedBrandStyleWithAlpha = (hexColor, alpha) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <AStack
      justifyContent="space-between"
      style={{
        width: '100%',
        borderRadius: 10,
        borderColor: isFocused ? selectedBrandStyle : colors.listBorderColor,
        backgroundColor: isFocused ? selectedBrandStyleWithAlpha(selectedBrandStyle, 0.1) : 'transparent',
        borderWidth: 1,
        ...style,
      }}
      row
    >
      {InputLeftElement || <AView style={{ width: 10 }} />}
      <TextInput
        testID={testID}
        multiline={numberOfLines > 1}
        submitBehavior={numberOfLines > 1 ? 'newline' : undefined}
        scrollEnabled={!autoGrow}
        onContentSizeChange={autoGrow ? (event) => {
          setContentHeight(Math.ceil(event.nativeEvent.contentSize.height));
        } : undefined}
        accessible
        secureTextEntry={type === 'password'}
        style={{
          flex: 1,
          height: autoGrow ? Math.max(inputHeight, contentHeight) : inputHeight,
          textAlignVertical: numberOfLines > 1 ? 'top' : 'center',
          fontSize,
          textAlign,
          fontFamily: bold ? 'Montserrat-Bold' : 'Montserrat-Regular',
          color: color || colors.text,
          paddingVertical: 5,
          ...style,
        }}
        cursorColor={selectedBrandStyle}
        returnKeyType={returnKeyType}
        keyboardType={keyboardType}
        placeholderTextColor={colors.greyLight}
        onChangeText={onChangeText}
        numberOfLines={numberOfLines}
        value={value}
        placeholder={placeholder}
        onSubmitEditing={onSubmitEditing}
        onFocus={(e) => {
          handleFocus(true, onFocus ? () => onFocus(e) : () => null);
        }}
        onBlur={(e) => {
          handleFocus(false, onBlur ? () => onBlur(e) : () => null);
        }}
        textContentType={type === 'password' ? 'password' : 'none'}
      />
      {InputRightElement}
    </AStack>
  );
}
