# M10 CSV File I/O Smoke Evidence

## Scope

M10은 모바일 CSV import/export의 native file I/O 경계를 확인한다. 공유 domain CSV 파싱/직렬화 round-trip은 이미 자동화되어 있으므로, 이번 범위는 iOS Document Picker 진입, 파일 읽기 fallback, native share sheet 진입, 회귀 테스트 명령 추가에 둔다.

## Environment

- Date: 2026-06-01
- Xcode: 26.5 (17F42)
- Simulator: iPad Pro 11-inch (M5), iOS 26.5
- Launch command: `cd apps/mobile && npm run ios -- --lan --port 8085`
- Fixture CSV: `mobile-import-smoke.csv`

Fixture rows:

```csv
accountName,snapshotMonth,market,assetCategory,assetName,currency,amount,returnRate,memo
CMA,2026-04,KR,ETF,NATIVE_IMPORT_SMOKE_KR,KRW,123456,1.23,native import smoke
IRP,2026-04,US,STOCK,NATIVE_IMPORT_SMOKE_US,USD,789.01,-2.34,native import smoke
```

## Native Smoke Result

| Area | Result |
| --- | --- |
| App launch | Passed. App opened through Expo Go LAN URL on the iPad simulator. |
| CSV import entry | Passed. `CSV 선택` opened the iOS Document Picker popover with Recent, iCloud Drive, and On My iPad locations. |
| CSV import file selection | Not fully automated. The picker itself opened, but the current Computer Use environment did not expose picker row clicks for reliable file selection. |
| CSV export entry | Passed. `CSV` on the Snapshots tab created a `snapshots-20260601-1444.csv` payload and opened the native share sheet. |
| Native share actions | Passed for entry. Share sheet showed Preview, More, Copy, and Save to Files options. |

## Automated Regression Coverage

The native picker/share sheet UI still needs hands-on confirmation on a real device or installable build, but the app-owned file I/O boundaries are now covered by `npm run test:mobile`:

- `buildSnapshotCsvPreviewFromDocument` reads web `File.text()` assets.
- `buildSnapshotCsvPreviewFromDocument` falls back to native URI reading through `FileSystem.readAsStringAsync`.
- `toCreateSnapshotInputs` maps valid CSV rows to local account ids.
- `buildSnapshotCsvExportPayload` creates stable CSV payloads and rejects empty exports.
- `shareNativeSnapshotCsvExport` writes the CSV file, checks sharing availability, and calls native share with `text/csv` and `public.comma-separated-values-text`.
- Storage unavailable and sharing unavailable errors are covered.

## Evidence Commands

```bash
xcrun simctl list devices available
cd apps/mobile && npm run ios -- --lan --port 8085
xcrun simctl io booted screenshot /private/tmp/investment-mobile-csv-share-sheet.png
npm run test:mobile
```

## Follow-Up

Before TestFlight or an installable artifact, repeat the import file-selection path by hand on a real device or local native build and attach the selected-file preview result. No app defect was found in this pass; the remaining gap is automation access to the iOS Document Picker internals.
