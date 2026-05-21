# M5 iPad and Accessibility Polish Spec

## Scope

M5는 기존 모바일 MVP 흐름을 유지하면서 iPad portrait/landscape, 긴 자산명/큰 금액, Dynamic Type, VoiceOver 사용성을 보강한다. 실시간 시세, 신규 화면, 복잡한 네이티브 설정은 포함하지 않는다.

## M5-2 Add/Edit and CSV Import Layout

Affected layers:

- UI: `SnapshotForm`, `CsvImportPanel`, Add/Edit screens
- Validation: existing domain schema only
- Tests: no business logic change

Implementation:

- iPad 폭에서 Add 화면의 form과 CSV import panel이 과도하게 넓어지지 않도록 content max width를 둔다.
- 폼 option chip은 긴 계좌명과 Dynamic Type에서 터치 영역을 유지하고 텍스트가 잘리지 않도록 높이와 줄 간격을 보강한다.
- CSV preview filename, row title, error text는 긴 값에서도 줄바꿈된다.

Done criteria:

- Add/Edit 화면이 iPhone width와 iPad portrait/landscape width에서 단일 입력 흐름을 유지한다.
- 긴 계좌명/파일명/자산명이 레이아웃을 밀어내지 않는다.

## M5-3 Dashboard and Compare iPad Layout

Affected layers:

- UI: Dashboard, Compare screens
- Utilities/tests: no aggregation logic change

Implementation:

- Dashboard cards use adaptive widths without accidental fixed vertical height.
- Compare sections use the same iPad-friendly grid behavior where it improves scanability.
- Metric/delta rows keep labels and amounts readable with large values and long labels.

Done criteria:

- Dashboard and Compare cards remain readable on iPad portrait/landscape.
- Large amounts do not overlap labels or adjacent content.

## M5-4 VoiceOver Accessibility Pass

Affected layers:

- UI: shared display/status components and actionable controls

Implementation:

- Status/error/result messages use polite live regions where supported.
- Empty states expose a concise accessible label.
- Destructive/edit/export/import actions include labels and disabled states.
- Informational metric rows expose combined label/value text.

Done criteria:

- Core screens expose meaningful labels for tabs, chips, inputs, buttons, empty states, and status messages.
- Icon text artifacts are not the primary accessible name.

## M5-5 Dynamic Type Stress Pass

Affected layers:

- UI styles only

Implementation:

- Common text styles use line height where wrapping is likely.
- Touch targets are at least 44px high for interactive chips/buttons.
- Headers, filter rows, and action rows wrap instead of clipping.

Done criteria:

- Larger text settings can wrap without obscuring adjacent UI.
- Main workflows remain reachable without horizontal-only dependency except chip scrollers.

## M5-6 Local Smoke Checklist

Affected layers:

- Documentation

Implementation:

- Document local verification commands.
- Include iPhone/iPad web smoke fallback.
- Note that native iOS simulator verification requires `xcrun simctl` availability.

Done criteria:

- Future contributors can repeat M5 smoke checks without relying on session memory.
