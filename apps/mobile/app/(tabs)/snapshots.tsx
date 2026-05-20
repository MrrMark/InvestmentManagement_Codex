import { getAvailableSnapshotMonths } from '@investment/domain/comparison';
import { normalizeSnapshotListFilters } from '@investment/domain/snapshot-filters';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { MonthSelector } from '@/components/month-selector';
import { formatAmount } from '@/data/seed-data';
import { useMobileSnapshots } from '@/hooks/use-mobile-snapshots';
import { useSelectedMonth } from '@/hooks/use-selected-month';
import { deleteSnapshot } from '@/lib/db/snapshots';

export default function SnapshotsScreen() {
  const router = useRouter();
  const { snapshots, isLoading, error, reload } = useMobileSnapshots();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const months = useMemo(() => getAvailableSnapshotMonths(snapshots), [snapshots]);
  const [selectedMonth, setSelectedMonth] = useSelectedMonth(months, months[0] ?? '');
  const filters = normalizeSnapshotListFilters({ snapshotMonth: selectedMonth });

  const visibleSnapshots = snapshots
    .filter((snapshot) => snapshot.snapshotMonth === filters.snapshotMonth)
    .sort((a, b) => Number(b.amount) - Number(a.amount));

  function requestDelete(id: string, assetName: string) {
    Alert.alert('스냅샷 삭제', `${assetName} 스냅샷을 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          void handleDelete(id);
        },
      },
    ]);
  }

  async function handleDelete(id: string) {
    try {
      await deleteSnapshot(id);
      setActionMessage('스냅샷이 삭제되었습니다.');
      await reload();
    } catch (caughtError) {
      setActionMessage(caughtError instanceof Error ? caughtError.message : '삭제에 실패했습니다.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{isLoading ? '불러오는 중' : selectedMonth}</Text>
        <Text style={styles.title}>스냅샷 목록</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {actionMessage ? <Text style={styles.message}>{actionMessage}</Text> : null}
      </View>

      <MonthSelector
        months={months}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
      />

      <View style={styles.list}>
        {visibleSnapshots.length === 0 ? (
          <EmptyState message="선택한 월에 등록된 스냅샷이 없습니다." />
        ) : null}
        {visibleSnapshots.map((snapshot) => (
          <View
            key={snapshot.id}
            style={styles.row}>
            <View style={styles.rowMain}>
              <Text style={styles.assetName}>{snapshot.assetName}</Text>
              <Text style={styles.meta}>
                {snapshot.accountName} · {snapshot.market} · {snapshot.assetCategory}
              </Text>
            </View>
            <View style={styles.rowActions}>
              <Text style={styles.amount}>
                {formatAmount(Number(snapshot.amount), snapshot.currency)}
              </Text>
              <View style={styles.actionButtons}>
                <Pressable
                  accessibilityRole="button"
                  style={styles.editButton}
                  onPress={() =>
                    router.push({
                      pathname: '/snapshots/[id]/edit',
                      params: { id: snapshot.id },
                    })
                  }>
                  <Text style={styles.editText}>수정</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  style={styles.deleteButton}
                  onPress={() => requestDelete(snapshot.id, snapshot.assetName)}>
                  <Text style={styles.deleteText}>삭제</Text>
                </Pressable>
              </View>
            </View>
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
  message: {
    color: '#174A7C',
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
  rowActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B8D3E8',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  editText: {
    color: '#174A7C',
    fontSize: 13,
    fontWeight: '800',
  },
  deleteButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3B9B3',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  deleteText: {
    color: '#B42318',
    fontSize: 13,
    fontWeight: '800',
  },
});
