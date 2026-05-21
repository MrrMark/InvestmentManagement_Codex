import { compareMonthOverMonth, getAvailableSnapshotMonths } from '@investment/domain/comparison';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { MonthSelector } from '@/components/month-selector';
import { defaultSnapshotMonth, formatAmount } from '@/data/seed-data';
import { useMobileSnapshots } from '@/hooks/use-mobile-snapshots';
import { useSelectedMonth } from '@/hooks/use-selected-month';

export default function CompareScreen() {
  const { snapshots, isLoading, error } = useMobileSnapshots();
  const months = useMemo(() => getAvailableSnapshotMonths(snapshots), [snapshots]);
  const [selectedMonth, setSelectedMonth] = useSelectedMonth(months, defaultSnapshotMonth);
  const comparison = compareMonthOverMonth(snapshots, selectedMonth);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          {isLoading
            ? '불러오는 중'
            : `${comparison.previousMonth ?? '이전 월 없음'} → ${comparison.selectedMonth}`}
        </Text>
        <Text style={styles.title}>월간 비교</Text>
        {error ? (
          <Text
            accessibilityLiveRegion="polite"
            style={styles.error}>
            {error}
          </Text>
        ) : null}
      </View>

      <MonthSelector
        months={months}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
      />

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>총 증감</Text>
          {!comparison.hasPreviousMonth ? (
            <EmptyState message="비교할 이전 월 데이터가 없습니다." />
          ) : (
            comparison.totalDelta.map((item) => (
              <DeltaRow
                key={item.currency}
                label={item.currency}
                value={formatAmount(item.deltaAmount, item.currency)}
              />
            ))
          )}
        </View>

        <DeltaSection title="계좌별 증감" groups={comparison.deltaByAccount} />
        <DeltaSection title="시장별 증감" groups={comparison.deltaByMarket} />
        <DeltaSection title="자산군별 증감" groups={comparison.deltaByCategory} />
      </View>
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
      {groups.length === 0 ? (
        <EmptyState message="표시할 증감 데이터가 없습니다." />
      ) : (
        groups.map((group) =>
          group.deltas.map((delta) => (
            <DeltaRow
              key={`${group.label}-${delta.currency}`}
              label={group.label}
              value={formatAmount(delta.deltaAmount, delta.currency)}
            />
          )),
        )
      )}
    </View>
  );
}

function DeltaRow({ label, value }: { label: string; value: string }) {
  const isNegative = value.trim().startsWith('-');

  return (
    <View
      accessible
      accessibilityLabel={`${label} 증감 ${value}`}
      style={styles.deltaRow}>
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
    lineHeight: 20,
  },
  title: {
    color: '#172026',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  error: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  grid: {
    gap: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    minWidth: 280,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 320,
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
    lineHeight: 23,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  deltaLabel: {
    flex: 1,
    minWidth: 120,
    color: '#43515A',
    fontSize: 14,
    lineHeight: 20,
  },
  deltaValue: {
    flexShrink: 1,
    color: '#146C43',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'right',
  },
  negative: {
    color: '#B42318',
  },
});
