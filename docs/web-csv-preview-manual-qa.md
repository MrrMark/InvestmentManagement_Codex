# Web CSV Preview Manual QA

작성 기준일: 2026-05-30

## Scope

웹 `/import` 화면의 CSV preview와 import 흐름을 수동 QA했다. 범위는 파일 선택 직후 preview, row-level validation, valid row import, duplicate error, snapshot list 확인까지다.

## Environment

- App: Next.js local dev server (`npm run dev`)
- Browser: headless Chrome 148 via local CDP
- Locale: Korean
- Test month: `2026-04`
- QA asset prefix: `QA_TEST`

## CSV Cases

Valid rows:

```csv
accountName,snapshotMonth,market,assetCategory,assetName,currency,amount,returnRate,memo
CMA,2026-04,KR,ETF,QA_TEST_KR_ETF,KRW,1234567,4.56,manual qa valid row
IRP,2026-04,US,ETF,QA_TEST_US_ETF,USD,1234.56,-1.23,manual qa usd row
```

Invalid rows:

```csv
accountName,snapshotMonth,market,assetCategory,assetName,currency,amount,returnRate,memo
CMA,2026-13,KR,ETF,INVALID_MONTH,KRW,1000,1.23,bad month
CMA,2026-04,KR,ETF,NEGATIVE_AMOUNT,KRW,-1000,1.23,bad amount
CMA,2026-04,KR,ETF,BAD_RATE,KRW,1000,1.234,bad rate scale
UNKNOWN,2026-04,KR,ETF,UNKNOWN_ACCOUNT,KRW,1000,1.23,bad account
```

Missing header rows:

```csv
accountName,snapshotMonth,assetName,currency,amount,returnRate,memo
CMA,2026-04,QA_MISSING_HEADER,KRW,1000,1.25,missing headers
```

## Findings

- CSV parser returned file-level errors for missing headers, but the web form did not show them.
- `snapshotMonth` accepted `2026-13` because validation only checked `YYYY-MM` shape.
- `returnRate: 4.56` was rejected by two-decimal validation because of floating point scaling.

## Fixes

- Web CSV preview now renders file-level preview errors in an alert region.
- Shared snapshot month validation now accepts only `YYYY-01` through `YYYY-12`.
- Return rate precision validation now tolerates normal floating point scaling noise while still rejecting values such as `4.567`.

## Manual QA Result

Passed:

- `/import` loads.
- Missing required CSV headers show a file-level message.
- Invalid CSV shows `0 valid / 4 total` and row-level errors for invalid month, negative amount, excessive return-rate precision, and unknown account.
- Valid CSV shows `2 valid / 2 total`.
- Import redirects to `/snapshots` with a success message.
- `/snapshots?snapshotMonth=2026-04&keyword=QA_TEST` shows both imported QA rows.
- Re-importing the same valid CSV shows the duplicate snapshot error.
- QA rows were deleted after verification.

Cleanup check:

```text
QA_TEST rows: 0
```

## Command Checks

Passed:

```bash
npm test
npm run build
git diff --check
```
