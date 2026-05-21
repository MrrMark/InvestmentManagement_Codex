import {
  assetCategories,
  createSnapshotSchema,
  currencies,
  markets,
  type CreateSnapshotInput,
} from '@investment/domain/snapshot';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { MobileAccount, MobileSnapshot } from '@/lib/db/snapshots';

export type SnapshotFormValues = {
  snapshotMonth: string;
  accountId: string;
  market: (typeof markets)[number];
  assetCategory: (typeof assetCategories)[number];
  assetName: string;
  currency: (typeof currencies)[number];
  amount: string;
  returnRate: string;
  memo: string;
};

export type SnapshotFormSubmitPayload = CreateSnapshotInput & {
  id?: string;
};

export function getInitialSnapshotFormValues(snapshot?: MobileSnapshot | null): SnapshotFormValues {
  return {
    snapshotMonth: snapshot?.snapshotMonth ?? '2026-04',
    accountId: snapshot?.accountId ?? '',
    market: getOptionValue(markets, snapshot?.market, markets[0]),
    assetCategory: getOptionValue(assetCategories, snapshot?.assetCategory, assetCategories[1]),
    assetName: snapshot?.assetName ?? '',
    currency: getOptionValue(currencies, snapshot?.currency, currencies[0]),
    amount: snapshot ? String(snapshot.amount) : '',
    returnRate: snapshot?.returnRate.toFixed(2) ?? '0.00',
    memo: snapshot?.memo ?? '',
  };
}

export function SnapshotForm({
  accounts,
  initialValues,
  snapshotId,
  submitLabel,
  onSubmit,
}: {
  accounts: MobileAccount[];
  initialValues: SnapshotFormValues;
  snapshotId?: string;
  submitLabel: string;
  onSubmit: (payload: SnapshotFormSubmitPayload) => Promise<void>;
}) {
  const [form, setForm] = useState(initialValues);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedAccountId = form.accountId || accounts[0]?.id || '';

  function updateField<FieldName extends keyof SnapshotFormValues>(
    field: FieldName,
    value: SnapshotFormValues[FieldName],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitForm() {
    if (!selectedAccountId) {
      setMessage('저장할 계좌가 없습니다.');
      return;
    }

    const result = createSnapshotSchema('ko').safeParse({
      ...form,
      accountId: selectedAccountId,
    });

    if (!result.success) {
      setMessage(result.error.issues[0]?.message ?? null);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await onSubmit(snapshotId ? { ...result.data, id: snapshotId } : result.data);
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : '저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.form}>
      <Field
        label="스냅샷 월"
        value={form.snapshotMonth}
        onChangeText={(value) => updateField('snapshotMonth', value)}
        placeholder="YYYY-MM"
      />
      {accounts.length > 0 ? (
        <OptionSelector
          label="계좌"
          options={accounts.map((account) => account.id)}
          selectedValue={selectedAccountId}
          onSelect={(value) => updateField('accountId', value)}
          getLabel={(value) => accounts.find((account) => account.id === value)?.name ?? value}
        />
      ) : (
        <Text style={styles.message}>저장할 계좌가 없습니다.</Text>
      )}
      <OptionSelector
        label="시장"
        options={markets}
        selectedValue={form.market}
        onSelect={(value) => updateField('market', value)}
      />
      <OptionSelector
        label="자산 분류"
        options={assetCategories}
        selectedValue={form.assetCategory}
        onSelect={(value) => updateField('assetCategory', value)}
      />
      <Field
        label="자산명"
        value={form.assetName}
        onChangeText={(value) => updateField('assetName', value)}
        placeholder="예: KODEX 200"
      />
      <OptionSelector
        label="통화"
        options={currencies}
        selectedValue={form.currency}
        onSelect={(value) => updateField('currency', value)}
      />
      <Field
        label="금액"
        value={form.amount}
        onChangeText={(value) => updateField('amount', value)}
        placeholder="0"
        keyboardType="decimal-pad"
      />
      <Field
        label="수익률"
        value={form.returnRate}
        onChangeText={(value) => updateField('returnRate', value)}
        placeholder="0.00"
        keyboardType="numbers-and-punctuation"
      />
      <Field
        label="메모"
        value={form.memo}
        onChangeText={(value) => updateField('memo', value)}
        placeholder="선택"
      />

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={submitLabel}
        accessibilityState={{ disabled: isSubmitting }}
        disabled={isSubmitting}
        style={[styles.button, isSubmitting && styles.disabledButton]}
        onPress={submitForm}>
        <Text style={styles.buttonText}>{isSubmitting ? '저장 중' : submitLabel}</Text>
      </Pressable>
    </View>
  );
}

function getOptionValue<OptionValue extends string>(
  options: readonly OptionValue[],
  value: string | undefined,
  fallback: OptionValue,
) {
  return value && options.some((option) => option === value) ? (value as OptionValue) : fallback;
}

function OptionSelector<OptionValue extends string>({
  label,
  options,
  selectedValue,
  onSelect,
  getLabel = (value) => value,
}: {
  label: string;
  options: readonly OptionValue[];
  selectedValue: OptionValue;
  onSelect: (value: OptionValue) => void;
  getLabel?: (value: OptionValue) => string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        accessibilityLabel={`${label} 선택`}
        horizontal
        contentContainerStyle={styles.optionList}
        showsHorizontalScrollIndicator={false}>
        {options.map((option) => {
          const isSelected = option === selectedValue;

          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${getLabel(option)}`}
              accessibilityState={{ selected: isSelected }}
              style={[styles.optionChip, isSelected && styles.selectedOptionChip]}
              onPress={() => onSelect(option)}>
              <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                {getLabel(option)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'decimal-pad' | 'numbers-and-punctuation';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={placeholder === 'YYYY-MM' ? 'YYYY-MM 형식으로 입력합니다.' : undefined}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE3E8',
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  field: {
    gap: 6,
  },
  optionList: {
    gap: 8,
    paddingVertical: 2,
  },
  optionChip: {
    minHeight: 44,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C9D3DA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  selectedOptionChip: {
    borderColor: '#174A7C',
    backgroundColor: '#174A7C',
  },
  optionText: {
    color: '#43515A',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  label: {
    color: '#43515A',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  input: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C9D3DA',
    paddingHorizontal: 12,
    color: '#172026',
    fontSize: 16,
    lineHeight: 22,
  },
  message: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#174A7C',
    padding: 14,
  },
  disabledButton: {
    backgroundColor: '#8495A1',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
