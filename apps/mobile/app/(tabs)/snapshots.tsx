import { assetCategories, currencies, markets } from '@investment/domain/snapshot';
import { getAvailableSnapshotMonths } from '@investment/domain/comparison';
import { normalizeSnapshotListFilters } from '@investment/domain/snapshot-filters';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { MonthSelector } from '@/components/month-selector';
import { formatAmount } from '@/data/seed-data';
import { useMobileSnapshots } from '@/hooks/use-mobile-snapshots';
import { useSelectedMonth } from '@/hooks/use-selected-month';
import { exportSnapshotsToCsv } from '@/lib/csv/export-snapshots';
import { deleteSnapshot } from '@/lib/db/snapshots';

export default function SnapshotsScreen() {
  const router = useRouter();
  const { accounts, snapshots, isLoading, error, reload } = useMobileSnapshots();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [accountFilter, setAccountFilter] = useState('');
  const [marketFilter, setMarketFilter] = useState('');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [keywordFilter, setKeywordFilter] = useState('');
  const months = useMemo(() => getAvailableSnapshotMonths(snapshots), [snapshots]);
  const [selectedMonth, setSelectedMonth] = useSelectedMonth(months, months[0] ?? '');
  const filters = normalizeSnapshotListFilters({
    snapshotMonth: selectedMonth,
    account: accountFilter,
    market: marketFilter,
    assetCategory: assetCategoryFilter,
    currency: currencyFilter,
    keyword: keywordFilter,
  });
  const normalizedKeyword = filters.keyword?.toLowerCase();
  const hasActiveFilters = Boolean(
    filters.account ||
      filters.market ||
      filters.assetCategory ||
      filters.currency ||
      filters.keyword,
  );

  const visibleSnapshots = snapshots
    .filter(
      (snapshot) =>
        snapshot.snapshotMonth === filters.snapshotMonth &&
        (!filters.account || snapshot.accountId === filters.account) &&
        (!filters.market || snapshot.market === filters.market) &&
        (!filters.assetCategory || snapshot.assetCategory === filters.assetCategory) &&
        (!filters.currency || snapshot.currency === filters.currency) &&
        (!normalizedKeyword || snapshot.assetName.toLowerCase().includes(normalizedKeyword)),
    )
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

  async function handleExport() {
    setIsExporting(true);
    setActionMessage(null);

    try {
      const fileName = await exportSnapshotsToCsv(visibleSnapshots);
      setActionMessage(`${fileName} 내보내기를 준비했습니다.`);
    } catch (caughtError) {
      setActionMessage(
        caughtError instanceof Error ? caughtError.message : 'CSV 내보내기에 실패했습니다.',
      );
    } finally {
      setIsExporting(false);
    }
  }

  function resetFilters() {
    setAccountFilter('');
    setMarketFilter('');
    setAssetCategoryFilter('');
    setCurrencyFilter('');
    setKeywordFilter('');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{isLoading ? '불러오는 중' : selectedMonth}</Text>
        <Text style={styles.title}>스냅샷 목록</Text>
        {error ? (
          <Text
            accessibilityLiveRegion="polite"
            style={styles.error}>
            {error}
          </Text>
        ) : null}
        {actionMessage ? (
          <Text
            accessibilityLiveRegion="polite"
            style={styles.message}>
            {actionMessage}
          </Text>
        ) : null}
      </View>

      <MonthSelector
        months={months}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
      />

      <View style={styles.filters}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>필터</Text>
          <View style={styles.filterActions}>
            {hasActiveFilters ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="필터 초기화"
                style={styles.resetButton}
                onPress={resetFilters}>
                <Text style={styles.resetText}>초기화</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="CSV 내보내기"
              accessibilityState={{ disabled: visibleSnapshots.length === 0 || isExporting }}
              disabled={visibleSnapshots.length === 0 || isExporting}
              style={[
                styles.exportButton,
                (visibleSnapshots.length === 0 || isExporting) && styles.disabledExportButton,
              ]}
              onPress={handleExport}>
              <Text style={styles.exportText}>{isExporting ? '준비 중' : 'CSV'}</Text>
            </Pressable>
          </View>
        </View>
        <FilterChipGroup
          label="계좌"
          options={[
            { label: '전체', value: '' },
            ...accounts.map((account) => ({ label: account.name, value: account.id })),
          ]}
          selectedValue={accountFilter}
          onSelect={setAccountFilter}
        />
        <FilterChipGroup
          label="시장"
          options={[
            { label: '전체', value: '' },
            ...markets.map((market) => ({ label: market, value: market })),
          ]}
          selectedValue={marketFilter}
          onSelect={setMarketFilter}
        />
        <FilterChipGroup
          label="자산 분류"
          options={[
            { label: '전체', value: '' },
            ...assetCategories.map((category) => ({ label: category, value: category })),
          ]}
          selectedValue={assetCategoryFilter}
          onSelect={setAssetCategoryFilter}
        />
        <FilterChipGroup
          label="통화"
          options={[
            { label: '전체', value: '' },
            ...currencies.map((currency) => ({ label: currency, value: currency })),
          ]}
          selectedValue={currencyFilter}
          onSelect={setCurrencyFilter}
        />
        <View style={styles.keywordField}>
          <Text style={styles.filterLabel}>자산명</Text>
          <TextInput
            accessibilityLabel="자산명 검색어"
            accessibilityHint="스냅샷 목록을 자산명으로 필터링합니다."
            value={keywordFilter}
            onChangeText={setKeywordFilter}
            placeholder="검색어"
            returnKeyType="search"
            style={styles.keywordInput}
          />
        </View>
        <Text
          accessibilityLiveRegion="polite"
          style={styles.resultCount}>
          표시 {visibleSnapshots.length}건
        </Text>
      </View>

      <View style={styles.list}>
        {visibleSnapshots.length === 0 ? (
          <EmptyState
            message={
              hasActiveFilters
                ? '필터 조건에 맞는 스냅샷이 없습니다.'
                : '선택한 월에 등록된 스냅샷이 없습니다.'
            }
          />
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
                  accessibilityLabel={`${snapshot.assetName} 수정`}
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
                  accessibilityLabel={`${snapshot.assetName} 삭제`}
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

function FilterChipGroup({
  label,
  options,
  selectedValue,
  onSelect,
}: {
  label: string;
  options: { label: string; value: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View
        accessibilityLabel={`${label} 필터 옵션`}
        style={styles.filterOptions}>
        {options.map((option) => {
          const isSelected = option.value === selectedValue;

          return (
            <Pressable
              key={`${label}-${option.value || 'all'}`}
              accessibilityRole="button"
              accessibilityLabel={`${label} 필터 ${option.label}`}
              accessibilityState={{ selected: isSelected }}
              style={[styles.filterChip, isSelected && styles.selectedFilterChip]}
              onPress={() => onSelect(option.value)}>
              <Text style={[styles.filterChipText, isSelected && styles.selectedFilterChipText]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
  message: {
    color: '#174A7C',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  filters: {
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE3E8',
    backgroundColor: '#FFFFFF',
    padding: 14,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  filterTitle: {
    color: '#172026',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  filterActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
    marginLeft: 'auto',
    maxWidth: '100%',
  },
  resetButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C9D3DA',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  resetText: {
    color: '#43515A',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  exportButton: {
    minHeight: 44,
    minWidth: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#174A7C',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  disabledExportButton: {
    backgroundColor: '#8495A1',
  },
  exportText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  filterGroup: {
    gap: 6,
  },
  filterLabel: {
    color: '#43515A',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    minHeight: 44,
    minWidth: 58,
    maxWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C9D3DA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  selectedFilterChip: {
    borderColor: '#174A7C',
    backgroundColor: '#174A7C',
  },
  filterChipText: {
    flexShrink: 1,
    color: '#43515A',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  selectedFilterChipText: {
    color: '#FFFFFF',
  },
  keywordField: {
    gap: 6,
  },
  keywordInput: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C9D3DA',
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#172026',
    fontSize: 15,
    lineHeight: 20,
  },
  resultCount: {
    color: '#64727C',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE3E8',
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  rowMain: {
    flexBasis: 190,
    flexGrow: 1,
    flexShrink: 1,
    gap: 5,
    minWidth: 0,
  },
  assetName: {
    flexShrink: 1,
    color: '#172026',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  meta: {
    flexShrink: 1,
    color: '#64727C',
    fontSize: 13,
    lineHeight: 18,
  },
  amount: {
    flexShrink: 1,
    maxWidth: '100%',
    color: '#172026',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
    textAlign: 'right',
  },
  rowActions: {
    alignItems: 'flex-end',
    flexBasis: 168,
    flexGrow: 1,
    flexShrink: 1,
    gap: 8,
    maxWidth: '100%',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  editButton: {
    minHeight: 44,
    minWidth: 58,
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 18,
    textAlign: 'center',
  },
  deleteButton: {
    minHeight: 44,
    minWidth: 58,
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 18,
    textAlign: 'center',
  },
});
