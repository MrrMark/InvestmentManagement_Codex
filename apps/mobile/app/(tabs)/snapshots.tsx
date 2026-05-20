import { getAvailableSnapshotMonths } from '@investment/domain/comparison';
import { normalizeSnapshotListFilters } from '@investment/domain/snapshot-filters';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatAmount } from '@/data/seed-data';
import { useMobileSnapshots } from '@/hooks/use-mobile-snapshots';

export default function SnapshotsScreen() {
  const { snapshots, isLoading, error } = useMobileSnapshots();
  const selectedMonth = getAvailableSnapshotMonths(snapshots)[0];
  const filters = normalizeSnapshotListFilters({ snapshotMonth: selectedMonth });

  const visibleSnapshots = snapshots
    .filter((snapshot) => snapshot.snapshotMonth === filters.snapshotMonth)
    .sort((a, b) => Number(b.amount) - Number(a.amount));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{isLoading ? '불러오는 중' : selectedMonth}</Text>
        <Text style={styles.title}>스냅샷 목록</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.list}>
        {visibleSnapshots.map((snapshot) => (
          <View
            key={`${snapshot.accountName}-${snapshot.assetName}-${snapshot.currency}`}
            style={styles.row}>
            <View style={styles.rowMain}>
              <Text style={styles.assetName}>{snapshot.assetName}</Text>
              <Text style={styles.meta}>
                {snapshot.accountName} · {snapshot.market} · {snapshot.assetCategory}
              </Text>
            </View>
            <Text style={styles.amount}>
              {formatAmount(Number(snapshot.amount), snapshot.currency)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
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
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE3E8',
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  rowMain: {
    flex: 1,
    gap: 5,
  },
  assetName: {
    color: '#172026',
    fontSize: 16,
    fontWeight: '800',
  },
  meta: {
    color: '#64727C',
    fontSize: 13,
  },
  amount: {
    color: '#172026',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
  },
});
