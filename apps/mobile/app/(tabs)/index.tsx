import {
  getAssetsByAccount,
  getAssetsByCategory,
  getAssetsByMarket,
  getTopAssets,
  getTotalAssetsByCurrency,
} from '@investment/domain/aggregation';
import { getAvailableSnapshotMonths } from '@investment/domain/comparison';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { defaultSnapshotMonth, formatAmount } from '@/data/seed-data';
import { useMobileSnapshots } from '@/hooks/use-mobile-snapshots';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { snapshots, isLoading, error } = useMobileSnapshots();
  const isWide = width >= 760;
  const selectedMonth = getAvailableSnapshotMonths(snapshots)[0] ?? defaultSnapshotMonth;
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

      <View style={[styles.grid, isWide && styles.gridWide]}>
        <Section title="총 자산">
          {totalAssets.map((item) => (
            <MetricRow
              key={item.currency}
              label={item.currency}
              value={formatAmount(item.totalAmount, item.currency)}
            />
          ))}
        </Section>
        <Section title="상위 자산">
          {topAssets.map((item) => (
            <MetricRow
              key={`${item.assetName}-${item.currency}`}
              label={item.assetName}
              value={formatAmount(item.totalAmount, item.currency)}
            />
          ))}
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
      {groups.map((group) =>
        group.totals.map((total) => (
          <MetricRow
            key={`${group.label}-${total.currency}`}
            label={group.label}
            value={formatAmount(total.totalAmount, total.currency)}
          />
        )),
      )}
    </Section>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricRow}>
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
  },
  gridWide: {
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
    justifyContent: 'space-between',
    gap: 16,
  },
  metricLabel: {
    flex: 1,
    color: '#43515A',
    fontSize: 14,
  },
  metricValue: {
    color: '#172026',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
});
