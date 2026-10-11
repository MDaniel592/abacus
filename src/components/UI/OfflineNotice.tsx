import React, { useEffect, useState } from 'react';
import {
  Modal, Pressable, ScrollView, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import translate from '../../i18n/locale';
import { useThemeColors } from '../../lib/common';
import { AText } from './ALibrary';

export default function OfflineNotice() {
  const requests = useSelector((state: RootState) => state.configuration.unavailableRequests || {});
  const { colorScheme } = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const unavailable = Object.keys(requests).length > 0;
  const backgroundColor = colorScheme === 'dark' ? '#352b1b' : '#fff5e2';
  const color = colorScheme === 'dark' ? '#f3cc83' : '#81551c';

  useEffect(() => {
    if (!unavailable) setExpanded(false);
  }, [unavailable]);

  if (!unavailable) return null;

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={translate('offline_status')}
        accessibilityState={{ expanded }}
        hitSlop={{ left: 8, right: 8 }}
        onPress={() => setExpanded(true)}
        style={({ pressed }) => ({
          width: 32,
          minHeight: 48,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View style={{
          width: 24, height: 24, borderRadius: 12, backgroundColor, alignItems: 'center', justifyContent: 'center',
        }}
        >
          <Ionicons name="cloud-offline-outline" size={14} color={color} />
        </View>
      </Pressable>
      <Modal visible={expanded} transparent animationType="fade" onRequestClose={() => setExpanded(false)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={translate('cancel')}
          onPress={() => setExpanded(false)}
          style={{
            flex: 1, backgroundColor: '#0006', justifyContent: 'center', padding: 24,
          }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              padding: 20, borderRadius: 16, backgroundColor, maxHeight: '80%',
            }}
          >
            <ScrollView>
              <AText fontSize={16} bold color={color}>{translate('offline_title')}</AText>
              <AText fontSize={13} lineHeight={20} color={color} py={12}>{translate('offline_details')}</AText>
              <Pressable accessibilityRole="button" onPress={() => setExpanded(false)} style={{ minHeight: 48, justifyContent: 'center' }}>
                <AText fontSize={14} bold color={color} textAlign="center">{translate('cancel')}</AText>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
