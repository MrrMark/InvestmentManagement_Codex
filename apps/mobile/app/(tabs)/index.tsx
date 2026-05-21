import {
  getAssetsByAccount,
  getAssetsByCategory,
  getAssetsByMarket,
  getTopAssets,
  getTotalAssetsByCurrency,
} from '@investment/domain/aggregation';
import { getAvailableSnapshotMonths } from '@investment/domain/comparison';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { MonthSelector } from '@/components/month-selector';
import { defaultSnapshotMonth, formatAmount } from '@/data/seed-data';
import { useMobileSnapshots } from '@/hooks/use-mobile-snapshots';
import { useSelectedMonth } from '@/hooks/use-selected-month';

export default function HomeScreen() {
  const { snapshots, isLoading, error } = useMobileSnapshots();
  const months = useMemo(() => getAvailableSnapshotMonths(snapshots), [snapshots]);
  const [selectedMonth, setSelectedMonth] = useSelectedMonth(months, defaultSnapshotMonth);
  const totalAssets = getTotalAssetsByCurrency(snapshots, selectedMonth);
  const byAccount = getAssetsByAccount(snapshots, selectedMonth);
  const byMarket = getAssetsByMarket(snapshots, selectedMonth);
  const byCategory = getAssetsByCategory(snapshots, selectedMonth);
  const topAssets = getTopAssets(snapshots, selectedMonth, 3);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{isLoading ? '불러오는 중' : selectedMonth}</Text>
        <Text style={styles.title}>월간 자산 대시보드</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <MonthSelector
        months={months}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
      />

      <View style={styles.grid}>
        <Section title="총 자산">
          {totalAssets.length === 0 ? (
            <EmptyState message="선택한 월에 등록된 스냅샷이 없습니다." />
          ) : (
            totalAssets.map((item) => (
              <MetricRow
                key={item.currency}
                label={item.currency}
                value={formatAmount(item.totalAmount, item.currency)}
              />
            ))
          )}
        </Section>
        <Section title="상위 자산">
          {topAssets.length === 0 ? (
            <EmptyState message="상위 자산을 표시할 데이터가 없습니다." />
          ) : (
            topAssets.map((item) => (
              <MetricRow
                key={`${item.assetName}-${item.currency}`}
                label={item.assetName}
                value={formatAmount(item.totalAmount, item.currency)}
              />
            ))
          )}
        </Section>
        <Breakdown title="계좌별" groups={byAccount} />
        <Breakdown title="시장별" groups={byMarket} />
        <Breakdown title="자산군별" groups={byCategory} />
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

function Breakdown({
  title,
  groups,
}: {
  title: string;
  groups: { label: string; totals: { currency: string; totalAmount: number }[] }[];
}) {
  return (
    <Section title={title}>
      {groups.length === 0 ? (
        <EmptyState message="표시할 배분 데이터가 없습니다." />
      ) : (
        groups.map((group) =>
          group.totals.map((total) => (
            <MetricRow
              key={`${group.label}-${total.currency}`}
              label={group.label}
              value={formatAmount(total.totalAmount, total.currency)}
            />
          )),
        )
      )}
    </Section>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      accessible
      accessibilityLabel={`${label} ${value}`}
      style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
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
  error: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: '700',
  },
  grid: {
    gap: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    minWidth: 280,
    flexGrow: 1,
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
  },
  cardBody: {
    gap: 10,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  metricLabel: {
    flex: 1,
    minWidth: 120,
    color: '#43515A',
    fontSize: 14,
    lineHeight: 20,
  },
  metricValue: {
    flexShrink: 1,
    color: '#172026',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'right',
  },
});
