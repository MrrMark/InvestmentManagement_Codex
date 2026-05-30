import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import {
  getInitialSnapshotFormValues,
  SnapshotForm,
  type SnapshotFormSubmitPayload,
} from '@/components/snapshot-form';
import { useMobileSnapshots } from '@/hooks/use-mobile-snapshots';
import {
  getSnapshotById,
  updateSnapshot,
  type MobileSnapshot,
} from '@/lib/db/snapshots';

export default function EditSnapshotScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accounts, error: accountsError } = useMobileSnapshots();
  const [snapshot, setSnapshot] = useState<MobileSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSnapshot() {
      if (!id) {
        setError('스냅샷 ID가 없습니다.');
        setIsLoading(false);
        return;
      }

      try {
        const nextSnapshot = await getSnapshotById(id);

        if (!isMounted) {
          return;
        }

        setSnapshot(nextSnapshot);
        setError(nextSnapshot ? null : '스냅샷을 찾을 수 없습니다.');
      } catch (caughtError) {
        if (isMounted) {
          setError(caughtError instanceof Error ? caughtError.message : '스냅샷을 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSnapshot();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleSubmit(payload: SnapshotFormSubmitPayload) {
    if (!payload.id) {
      throw new Error('스냅샷 ID가 없습니다.');
    }

    await updateSnapshot({ ...payload, id: payload.id });
    router.replace('/snapshots');
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{isLoading ? '불러오는 중' : snapshot?.snapshotMonth}</Text>
          <Text style={styles.title}>스냅샷 수정</Text>
          {accountsError ? (
            <Text
              accessibilityLiveRegion="polite"
              style={styles.error}>
              {accountsError}
            </Text>
          ) : null}
          {error ? (
            <Text
              accessibilityLiveRegion="polite"
              style={styles.error}>
              {error}
            </Text>
          ) : null}
        </View>

        {snapshot ? (
          <SnapshotForm
            accounts={accounts}
            initialValues={getInitialSnapshotFormValues(snapshot)}
            snapshotId={snapshot.id}
            submitLabel="수정 저장"
            onSubmit={handleSubmit}
          />
        ) : (
          <EmptyState
            message={isLoading ? '스냅샷을 불러오는 중입니다.' : '수정할 스냅샷이 없습니다.'}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 64,
    backgroundColor: '#F6F7F9',
  },
  content: {
    width: '100%',
    maxWidth: 760,
    gap: 18,
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
