import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import {
  listAccounts,
  listSnapshots,
  type MobileAccount,
  type MobileSnapshot,
} from '@/lib/db/snapshots';

type SnapshotState = {
  accounts: MobileAccount[];
  snapshots: MobileSnapshot[];
  error: string | null;
  isLoading: boolean;
  reload: () => Promise<void>;
};

export function useMobileSnapshots(): SnapshotState {
  const [accounts, setAccounts] = useState<MobileAccount[]>([]);
  const [snapshots, setSnapshots] = useState<MobileSnapshot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [nextAccounts, nextSnapshots] = await Promise.all([listAccounts(), listSnapshots()]);
      setAccounts(nextAccounts);
      setSnapshots(nextSnapshots);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { accounts, snapshots, error, isLoading, reload };
}
