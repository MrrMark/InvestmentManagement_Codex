import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CsvImportPanel } from '@/components/csv-import-panel';
import { getInitialSnapshotFormValues, SnapshotForm } from '@/components/snapshot-form';
import { useMobileSnapshots } from '@/hooks/use-mobile-snapshots';
import { createSnapshot } from '@/lib/db/snapshots';

export default function AddSnapshotScreen() {
  const router = useRouter();
  const { accounts, error, reload } = useMobileSnapshots();

  async function handleSubmit(payload: Parameters<typeof createSnapshot>[0]) {
    await createSnapshot(payload);
    router.replace('/snapshots');
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.eyebrow}>수동 입력</Text>
        <Text style={styles.title}>스냅샷 추가</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <SnapshotForm
        accounts={accounts}
        initialValues={getInitialSnapshotFormValues()}
        submitLabel="스냅샷 저장"
        onSubmit={handleSubmit}
      />

      <CsvImportPanel
        accounts={accounts}
        onImported={reload}
      />
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
});
