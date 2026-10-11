import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

export type PagerViewOnPageScrollEventData = {
  nativeEvent: { position: number; offset: number };
};

type PagerViewHandle = { setPage: (index: number) => void };

type Props = {
  children: React.ReactNode;
  initialPage?: number;
  onPageSelected?: (event: { nativeEvent: { position: number } }) => void;
  onPageScroll?: (event: PagerViewOnPageScrollEventData) => void;
  style?: StyleProp<ViewStyle>;
};

const PagerView = forwardRef<PagerViewHandle, Props>(({
  children,
  initialPage = 0,
  onPageSelected,
  onPageScroll,
  style,
}, ref) => {
  const pages = React.Children.toArray(children);
  const [page, setPageState] = useState(initialPage);

  useImperativeHandle(ref, () => ({
    setPage(index) {
      const nextPage = Math.max(0, Math.min(index, Math.max(0, pages.length - 1)));
      setPageState(nextPage);
      onPageSelected?.({ nativeEvent: { position: nextPage } });
      onPageScroll?.({ nativeEvent: { position: nextPage, offset: 0 } });
    },
  }), [onPageScroll, onPageSelected, pages.length]);

  return (
    <View style={[{ flex: 1 }, style]}>
      {pages.map((child, index) => (
        <View key={React.isValidElement(child) ? child.key ?? index : index} style={{ flex: 1, display: index === page ? 'flex' : 'none' }}>
          {child}
        </View>
      ))}
    </View>
  );
});

PagerView.displayName = 'PagerView';
export default PagerView;
