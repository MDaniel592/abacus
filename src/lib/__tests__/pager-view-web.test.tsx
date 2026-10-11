import React, { createRef } from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text, View } from 'react-native';
import PagerView from '../../components/UI/PagerView.web';

describe('web PagerView fallback', () => {
  it('keeps pages mounted and selects a clamped page through its ref', () => {
    const ref = createRef() as React.RefObject<{ setPage: (index: number) => void }>;
    const onPageSelected = jest.fn();
    let tree: renderer.ReactTestRenderer | undefined;

    act(() => {
      tree = renderer.create(
        <PagerView ref={ref} initialPage={0} onPageSelected={onPageSelected}>
          <Text>First</Text>
          <Text>Second</Text>
        </PagerView>,
      );
    });

    act(() => ref.current?.setPage(8));

    const rendered = tree as renderer.ReactTestRenderer;
    expect(rendered.root.findAllByType(Text).map((node) => node.props.children)).toEqual(['First', 'Second']);
    expect(rendered.root.findAllByType(View).map((node) => node.props.style).filter((style) => style?.display)).toEqual([
      { flex: 1, display: 'none' },
      { flex: 1, display: 'flex' },
    ]);
    expect(onPageSelected).toHaveBeenLastCalledWith({ nativeEvent: { position: 1 } });
  });
});
