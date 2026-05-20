import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  pickSnapshotCsvPreview,
  toCreateSnapshotInputs,
  type SnapshotCsvPreview,
} from '@/lib/csv/import-snapshots';
import { importSnapshots, type MobileAccount } from '@/lib/db/snapshots';

export function CsvImportPanel({
  accounts,
  onImported,
}: {
  accounts: MobileAccount[];
  onImported: () => Promise<void>;
}) {
  const [preview, setPreview] = useState<SnapshotCsvPreview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const validCount = preview?.validRows.length ?? 0;
  const invalidCount = preview ? preview.rows.length - validCount : 0;

  async function selectCsvFile() {
    if (accounts.length === 0) {
      setMessage('CSV를 가져오려면 먼저 계좌 데이터가 필요합니다.');
      return;
    }

    setIsPicking(true);
    setMessage(null);

    try {
      const nextPreview = await pickSnapshotCsvPreview(accounts);

      if (!nextPreview) {
        return;
      }

      setPreview(nextPreview);
      setMessage(
        nextPreview.rows.length === 0
          ? 'CSV가 비어 있습니다.'
          : `${nextPreview.validRows.length}/${nextPreview.rows.length}행을 가져올 수 있습니다.`,
      );
    } catch (caughtError) {
      setPreview(null);
      setMessage(caughtError instanceof Error ? caughtError.message : 'CSV를 읽지 못했습니다.');
    } finally {
      setIsPicking(false);
    }
  }

  async function importValidRows() {
    if (!preview || validCount === 0) {
      setMessage('가져올 수 있는 행이 없습니다.');
      return;
    }

    setIsImporting(true);
    setMessage(null);

    try {
      const result = await importSnapshots(toCreateSnapshotInputs(preview.validRows, accounts));
      const duplicateMessage =
        result.skippedDuplicateCount > 0
          ? ` 중복 ${result.skippedDuplicateCount}행은 건너뛰었습니다.`
          : '';

      setMessage(`${result.createdCount}행을 가져왔습니다.${duplicateMessage}`);
      setPreview(null);
      await onImported();
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : 'CSV 가져오기에 실패했습니다.');
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>CSV 가져오기</Text>
          <Text style={styles.title}>파일로 일괄 추가</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={isPicking}
          style={[styles.secondaryButton, isPicking && styles.disabledButton]}
          onPress={selectCsvFile}>
          <Text style={styles.secondaryButtonText}>{isPicking ? '선택 중' : 'CSV 선택'}</Text>
        </Pressable>
      </View>

      <Text style={styles.description}>
        accountName, snapshotMonth, market, assetCategory, assetName, currency, amount, returnRate,
        memo 헤더를 사용합니다.
      </Text>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {preview ? (
        <View style={styles.preview}>
          <View style={styles.previewHeader}>
            <View style={styles.previewTitleGroup}>
              <Text style={styles.previewTitle}>{preview.fileName}</Text>
              <Text style={styles.previewMeta}>
                유효 {validCount}행 · 오류 {invalidCount}행
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={validCount === 0 || isImporting}
              style={[
                styles.primaryButton,
                (validCount === 0 || isImporting) && styles.disabledButton,
              ]}
              onPress={importValidRows}>
              <Text style={styles.primaryButtonText}>
                {isImporting ? '가져오는 중' : '가져오기'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.previewRows}>
            {preview.rows.map((row) => (
              <View
                key={row.rowNumber}
                style={styles.previewRow}>
                <Text style={styles.rowTitle}>
                  {row.rowNumber}행 · {row.raw.assetName || '자산명 없음'}
                </Text>
                <Text style={styles.rowMeta}>
                  {row.raw.accountName || '-'} · {row.raw.snapshotMonth || '-'} ·{' '}
                  {row.raw.currency || '-'}
                </Text>
                {row.errors.length > 0 ? (
                  <Text style={styles.rowError}>{row.errors.join(', ')}</Text>
                ) : (
                  <Text style={styles.rowValid}>유효</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE3E8',
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: '#49616E',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: '#172026',
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    color: '#64727C',
    fontSize: 13,
    lineHeight: 19,
  },
  message: {
    color: '#174A7C',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B8D3E8',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  secondaryButtonText: {
    color: '#174A7C',
    fontSize: 13,
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#174A7C',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  disabledButton: {
    borderColor: '#D5DDE3',
    backgroundColor: '#8495A1',
  },
  preview: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5EAEE',
    paddingTop: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  previewTitleGroup: {
    flex: 1,
    gap: 3,
  },
  previewTitle: {
    color: '#172026',
    fontSize: 15,
    fontWeight: '800',
  },
  previewMeta: {
    color: '#64727C',
    fontSize: 13,
    fontWeight: '700',
  },
  previewRows: {
    gap: 8,
  },
  previewRow: {
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5EAEE',
    padding: 10,
  },
  rowTitle: {
    color: '#172026',
    fontSize: 14,
    fontWeight: '800',
  },
  rowMeta: {
    color: '#64727C',
    fontSize: 13,
  },
  rowValid: {
    color: '#176B45',
    fontSize: 13,
    fontWeight: '800',
  },
  rowError: {
    color: '#B42318',
    fontSize: 13,
    fontWeight: '700',
  },
});
