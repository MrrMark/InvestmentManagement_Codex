import { createSnapshotSchema, currencies, markets, assetCategories } from '@investment/domain/snapshot';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const initialForm = {
  snapshotMonth: '2026-04',
  assetName: '',
  amount: '',
  returnRate: '0.00',
  memo: '',
};

export default function AddSnapshotScreen() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState<string | null>(null);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validateForm() {
    const result = createSnapshotSchema('ko').safeParse({
      ...form,
      accountId: 'sample-account',
      market: markets[0],
      assetCategory: assetCategories[1],
      currency: currencies[0],
    });

    setMessage(result.success ? '입력값이 검증되었습니다.' : result.error.issues[0]?.message ?? null);
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.eyebrow}>수동 입력</Text>
        <Text style={styles.title}>스냅샷 추가</Text>
      </View>

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

        <Pressable accessibilityRole="button" style={styles.button} onPress={validateForm}>
          <Text style={styles.buttonText}>입력 검증</Text>
        </Pressable>
      </View>
    </ScrollView>
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
  container: {
    gap: 18,
    padding: 20,
    paddingTop: 64,
    backgroundColor: '#F6F7F9',
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    color: '#49616E',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: '#172026',
    fontSize: 28,
    fontWeight: '800',
  },
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
    color: '#174A7C',
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#174A7C',
    padding: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
