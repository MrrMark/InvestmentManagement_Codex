import { Pressable, StyleSheet, Text, View } from 'react-native';

const controlTextMaxFontSizeMultiplier = 1.8;

export function MonthSelector({
  months,
  selectedMonth,
  onSelectMonth,
}: {
  months: string[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}) {
  if (months.length === 0) {
    return (
      <Text
        accessibilityLiveRegion="polite"
        style={styles.empty}>
        선택할 스냅샷 월이 없습니다.
      </Text>
    );
  }

  return (
    <View
      accessibilityLabel="스냅샷 월 선택"
      style={styles.container}>
      {months.map((month) => {
        const isSelected = month === selectedMonth;

        return (
          <Pressable
            key={month}
            accessibilityRole="button"
            accessibilityLabel={`스냅샷 월 ${month}`}
            accessibilityState={{ selected: isSelected }}
            style={[styles.chip, isSelected && styles.selectedChip]}
            onPress={() => onSelectMonth(month)}>
            <Text
              maxFontSizeMultiplier={controlTextMaxFontSizeMultiplier}
              style={[styles.chipText, isSelected && styles.selectedChipText]}>
              {month}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    minHeight: 44,
    minWidth: 78,
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C9D3DA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  selectedChip: {
    borderColor: '#174A7C',
    backgroundColor: '#174A7C',
  },
  chipText: {
    flexShrink: 1,
    color: '#43515A',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  empty: {
    color: '#64727C',
    fontSize: 14,
  },
});
