import { compareMonthOverMonth } from '@investment/domain/comparison';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatAmount, sampleSnapshots, selectedSampleMonth } from '@/data/sample-snapshots';

const comparison = compareMonthOverMonth(sampleSnapshots, selectedSampleMonth);

export default function CompareScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          {comparison.previousMonth ?? '이전 월 없음'} → {comparison.selectedMonth}
        </Text>
        <Text style={styles.title}>월간 비교</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>총 증감</Text>
        {comparison.totalDelta.map((item) => (
          <DeltaRow
            key={item.currency}
            label={item.currency}
            value={formatAmount(item.deltaAmount, item.currency)}
          />
        ))}
      </View>

      <DeltaSection title="계좌별 증감" groups={comparison.deltaByAccount} />
      <DeltaSection title="시장별 증감" groups={comparison.deltaByMarket} />
      <DeltaSection title="자산군별 증감" groups={comparison.deltaByCategory} />
    </ScrollView>
  );
}

function DeltaSection({
  title,
  groups,
}: {
  title: string;
  groups: { label: string; deltas: { currency: string; deltaAmount: number }[] }[];
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {groups.map((group) =>
        group.deltas.map((delta) => (
          <DeltaRow
            key={`${group.label}-${delta.currency}`}
            label={group.label}
            value={formatAmount(delta.deltaAmount, delta.currency)}
          />
        )),
      )}
    </View>
  );
}

function DeltaRow({ label, value }: { label: string; value: string }) {
  const isNegative = value.trim().startsWith('-');

  return (
    <View style={styles.deltaRow}>
      <Text style={styles.deltaLabel}>{label}</Text>
      <Text style={[styles.deltaValue, isNegative && styles.negative]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    padding: 20,
    paddingTop: 64,
    backgroundColor: '#F6F7F9',
  },
  header: {
    gap: 6,
    marginBottom: 4,
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
  card: {
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE3E8',
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  cardTitle: {
    color: '#172026',
    fontSize: 17,
    fontWeight: '800',
  },
  deltaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  deltaLabel: {
    flex: 1,
    color: '#43515A',
    fontSize: 14,
  },
  deltaValue: {
    color: '#146C43',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  negative: {
    color: '#B42318',
  },
});
