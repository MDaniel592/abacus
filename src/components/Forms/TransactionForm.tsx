import React, {
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  Keyboard, Platform, KeyboardAvoidingView, ScrollView, Switch, ActivityIndicator, View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import { Ionicons } from '@expo/vector-icons';

import TransactionSplitForm from '../Forms/TransactionSplitForm';
import { RootDispatch, RootState } from '../../store';
import translate from '../../i18n/locale';
import GroupTitle from './Fields/GroupTitle';

import Loading from '../UI/Loading';
import { initialSplit } from '../../models/transactions';
import { AStackFlex, AText, AView } from '../UI/ALibrary';
import AButton from '../UI/ALibrary/AButton';
import { useBrandStyle, useThemeColors } from '../../lib/common';

const EMPTY_SPLITS = [];

function MultipleTransactionSplitForm({ isNew, splits, title }) {
  const { colors } = useThemeColors();
  const { brandStyle } = useBrandStyle();
  const displayForeignCurrency = useSelector((state: RootState) => state.configuration.displayForeignCurrency);
  const [splitNumber, setSplitNumber] = useState<string[]>([]);
  const dispatch = useDispatch<RootDispatch>();
  const [showOptions, setShowOptions] = useState(splits.length > 1 || Boolean(title) || displayForeignCurrency);

  useEffect(() => {
    setSplitNumber(splits.length ? splits.map(() => Crypto.randomUUID()) : [Crypto.randomUUID()]);
  }, [splits]);

  const addTransactionSplit = () => {
    setSplitNumber((prevState) => [...prevState, Crypto.randomUUID()]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch();
    dispatch.transactions.addTransactionSplit();
  };

  const deleteTransactionSplit = (index: number) => {
    setSplitNumber((prevState) => prevState.filter((_, i) => i !== index));
    dispatch.transactions.deleteTransactionSplit(index);
  };

  const onSwitch = async (bool: boolean) => {
    dispatch.configuration.setDisplayForeignCurrency(bool);
    return Promise.resolve();
  };

  if (splitNumber.length === 0) {
    return <Loading />;
  }

  return (
    <AView>
      {splitNumber.map((e, i) => (
        <TransactionSplitForm
          key={e}
          index={i}
          isNew={isNew}
          total={splitNumber.length}
          transaction={splits[i] || initialSplit()}
          handleDelete={() => deleteTransactionSplit(i)}
        />
      ))}
      <AButton type="transparent" style={{ height: 36, marginTop: 4 }} onPress={() => setShowOptions((value) => !value)}>
        <AText fontSize={12} color={colors.greyLight}>{translate('transaction_form_more_options')}</AText>
        <Ionicons name={showOptions ? 'chevron-up' : 'chevron-down'} size={15} color={colors.greyLight} style={{ marginLeft: 6 }} />
      </AButton>
      {showOptions && (
      <>
        <AButton
          style={{
            height: 40,
            marginTop: 5,
            borderWidth: 0.5,
            borderColor: colors.listBorderColor,
          }}
          onPress={addTransactionSplit}
        >
          <AStackFlex row>
            <Ionicons name="add-circle" size={22} color={colors.greyLight} style={{ margin: 5 }} />
            <AText color={colors.greyLight} fontSize={13}>{translate('transaction_form_new_split_button')}</AText>
          </AStackFlex>
        </AButton>
        {(splitNumber.length > 1 || title) && <GroupTitle title={title || ''} />}
        <AStackFlex row py={10} alignItems="center" justifyContent="space-between">
          <AText color={colors.greyLight} fontSize={13} bold>{translate('transaction_form_foreign_currency_label')}</AText>
          <Switch thumbColor="white" trackColor={{ false: '#767577', true: brandStyle }} onValueChange={onSwitch} value={displayForeignCurrency} />
        </AStackFlex>
      </>
      )}
    </AView>
  );
}

function TransactionFormButtons({ handleSubmit }) {
  const { brandStyleContrast } = useBrandStyle();
  const loading = useSelector((state: RootState) => state.loading.effects.transactions.upsertTransaction?.loading);

  return (
    <AButton type="primary" loading={loading} disabled={loading} style={{ height: 44, marginBottom: 0 }} onPress={handleSubmit}>
      <AStackFlex row>
        <Ionicons name="cloud-upload-sharp" size={20} color={brandStyleContrast} style={{ margin: 5 }} />
        <AText color={brandStyleContrast} fontSize={13}>{translate('transaction_form_submit_button')}</AText>
      </AStackFlex>
    </AButton>
  );
}

export default function TransactionForm({
  navigation,
  title,
  splits = EMPTY_SPLITS,
  id = '-1',
}) {
  const { colors } = useThemeColors();
  const dispatch = useDispatch<RootDispatch>();
  const loading = useSelector((state: RootState) => state.loading.effects.transactions.upsertTransaction?.loading);
  const submitting = useRef(false);
  const closeTransactionScreen = useSelector((state: RootState) => state.configuration.closeTransactionScreen);

  useEffect(() => {
    dispatch.transactions.resetTransaction({ splits, title });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitting.current) {
      return;
    }
    submitting.current = true;
    Keyboard.dismiss();
    try {
      await dispatch.transactions.upsertTransaction({ id });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch();
      if (closeTransactionScreen) {
        navigation.goBack();
      }
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch();
    } finally {
      submitting.current = false;
    }
  }, [dispatch, id, closeTransactionScreen, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        loading ? <ActivityIndicator size="small" color={colors.text} /> : <AText onPress={handleSubmit} fontSize={16} bold>{translate('transaction_form_submit_button')}</AText>
      ),
    });
  }, [navigation, loading, colors.text, handleSubmit]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: 'height' })}
    >
      <ScrollView
        style={{
          flex: 1,
        }}
        contentContainerStyle={{ padding: 10, paddingBottom: 12 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <MultipleTransactionSplitForm isNew={id === '-1'} title={title} splits={splits} />
      </ScrollView>
      <View style={{
        paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 0.5, borderColor: colors.listBorderColor, backgroundColor: colors.tileBackgroundColor,
      }}
      >
        <TransactionFormButtons handleSubmit={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}
