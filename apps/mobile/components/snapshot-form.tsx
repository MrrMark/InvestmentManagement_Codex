import {
  assetCategories,
  createSnapshotSchema,
  currencies,
  markets,
  type CreateSnapshotInput,
} from '@investment/domain/snapshot';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { MobileAccount, MobileSnapshot } from '@/lib/db/snapshots';

export type SnapshotFormValues = {
  snapshotMonth: string;
  assetName: string;
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
    assetName: snapshot?.assetName ?? '',
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

  function updateField(field: keyof SnapshotFormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitForm() {
    const firstAccount = accounts[0];

    if (!firstAccount) {
      setMessage('저장할 계좌가 없습니다.');
      return;
    }

    const result = createSnapshotSchema('ko').safeParse({
      ...form,
      accountId: firstAccount.id,
      market: markets[0],
      assetCategory: assetCategories[1],
      currency: currencies[0],
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
      <Field
        label="자산명"
        value={form.assetName}
        onChangeText={(value) => updateField('assetName', value)}
        placeholder="예: KODEX 200"
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
        disabled={isSubmitting}
        style={[styles.button, isSubmitting && styles.disabledButton]}
        onPress={submitForm}>
        <Text style={styles.buttonText}>{isSubmitting ? '저장 중' : submitLabel}</Text>
      </Pressable>
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
  label: {
    color: '#43515A',
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C9D3DA',
    paddingHorizontal: 12,
    color: '#172026',
    fontSize: 16,
  },
  message: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
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
