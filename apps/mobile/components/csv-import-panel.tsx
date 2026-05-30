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
      setMessage(getPreviewMessage(nextPreview));
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
      const inputs = toCreateSnapshotInputs(preview.validRows, accounts);

      if (inputs.length === 0) {
        setMessage('CSV의 계좌명을 현재 계좌 목록과 다시 확인해 주세요.');
        return;
      }

      const result = await importSnapshots(inputs);

      setMessage(getImportResultMessage(result));
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
          accessibilityLabel="CSV 파일 선택"
          accessibilityState={{ disabled: isPicking }}
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

      {message ? (
        <Text
          accessibilityLiveRegion="polite"
          style={styles.message}>
          {message}
        </Text>
      ) : null}

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
              accessibilityLabel="유효한 CSV 행 가져오기"
              accessibilityState={{ disabled: validCount === 0 || isImporting }}
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
                accessible
                accessibilityLabel={`${row.rowNumber}행 ${row.raw.assetName || '자산명 없음'} ${
                  row.errors.length > 0 ? row.errors.join(', ') : '유효'
                }`}
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

function getPreviewMessage(preview: SnapshotCsvPreview) {
  if (preview.errors.length > 0) {
    return preview.errors.join(' ');
  }

  if (preview.rows.length === 0) {
    return '가져올 데이터 행이 없습니다. 헤더 아래에 스냅샷 행을 추가해 주세요.';
  }

  return `${preview.validRows.length}/${preview.rows.length}행을 가져올 수 있습니다.`;
}

function getImportResultMessage({
  createdCount,
  skippedDuplicateCount,
}: {
  createdCount: number;
  skippedDuplicateCount: number;
}) {
  if (createdCount === 0 && skippedDuplicateCount > 0) {
    return `이미 등록된 중복 ${skippedDuplicateCount}행만 있어 새로 가져온 행이 없습니다.`;
  }

  if (skippedDuplicateCount > 0) {
    return `${createdCount}행을 가져왔습니다. 중복 ${skippedDuplicateCount}행은 건너뛰었습니다.`;
  }

  return `${createdCount}행을 가져왔습니다.`;
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
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
    minWidth: 180,
    gap: 4,
  },
  eyebrow: {
    color: '#49616E',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  title: {
    color: '#172026',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
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
    lineHeight: 20,
  },
  secondaryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B8D3E8',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  secondaryButtonText: {
    flexShrink: 1,
    color: '#174A7C',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#174A7C',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryButtonText: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
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
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  previewTitleGroup: {
    flex: 1,
    flexShrink: 1,
    minWidth: 180,
    gap: 3,
  },
  previewTitle: {
    flexShrink: 1,
    color: '#172026',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  previewMeta: {
    color: '#64727C',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
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
    flexShrink: 1,
    color: '#172026',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  rowMeta: {
    flexShrink: 1,
    color: '#64727C',
    fontSize: 13,
    lineHeight: 18,
  },
  rowValid: {
    color: '#176B45',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  rowError: {
    flexShrink: 1,
    color: '#B42318',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
