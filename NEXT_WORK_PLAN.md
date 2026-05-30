# NEXT_WORK_PLAN.md

작성 기준일: 2026-05-30

## 목적

이 문서는 현재 프로젝트 문서에서 확인된 후속 작업을 실제 구현 전에 검토할 수 있도록 작업별 플랜과 명세로 정리한다.

아래 M8/M9/Web CSV/문서 정합성 섹션은 완료된 작업의 원래 명세를 보존한다. 최신 후속 작업 판단은 이 상단 상태 업데이트를 우선한다.

## 현재 판단

- 웹 MVP 핵심 기능, Web CSV preview QA, 모바일 M8 usability/accessibility, M9 release readiness baseline, 문서 정합성 정리는 완료되어 main에 반영됐다.
- iPad native smoke의 `simctl openurl` timeout은 LAN mode recheck에서 해소됐다. iPad smoke는 `npm run ios -- --lan --port <free-port>` 경로를 우선 사용한다.
- Web/Mobile CSV import/export는 공유 domain 포맷의 round-trip 테스트가 추가됐다.
- 현재 release readiness 기준은 Expo Go verification, local iPhone/iPad Simulator smoke, static web export fallback이다.
- EAS preview, TestFlight, App Store 제출은 아직 선택된 산출물이 아니며 별도 release phase로 둔다.

## 다음 추천 진행 순서

1. Mobile local native build decision
   - Expo Go 기준을 유지할지, local native build를 첫 installable artifact로 올릴지 결정한다.
   - EAS/TestFlight는 local native build 필요성이 확인된 뒤 선택한다.
2. Mobile repository/data migration regression coverage
   - `expo-sqlite` migration, seed, CRUD repository 흐름은 앱 품질 관점에서 다음으로 큰 자동화 공백이다.
   - 가능하면 Expo 의존이 낮은 repository helper부터 테스트 가능한 경계로 분리한다.
3. Mobile CSV file I/O smoke
   - 공유 CSV round-trip은 자동화됐지만 document picker/share sheet는 native 파일 권한과 OS UI에 의존한다.
   - 다음 native smoke cycle에서 import preview와 export share sheet evidence를 별도로 남긴다.
4. Release privacy/store readiness draft
   - local-only SQLite, CSV import/export, 외부 전송 없음, financial advice 아님을 App Store privacy 준비 문서로 정리한다.
   - TestFlight를 선택할 때 필요한 screenshot/privacy/build number 항목을 체크리스트화한다.
5. Ongoing documentation freshness pass
   - 완료된 PR 번호와 현재 산출물 기준이 README, mobile docs, porting plan 사이에서 어긋나지 않는지 릴리스 단위로 점검한다.

완료 이력:

- #22 M8 Mobile usability regression
- #24 M9 Release readiness baseline
- #25 Mobile smoke/accessibility verification
- #26 Web CSV preview manual QA
- #27 Documentation consistency cleanup
- #28 iPad native smoke recheck
- #29 CSV round-trip automation

---

## 완료된 이전 계획

아래 섹션은 완료된 작업의 원래 명세다. 같은 유형의 회귀가 생기면 체크리스트로 재사용하되, 새 작업 우선순위는 위 `다음 추천 진행 순서`를 따른다.

---

## 1. M8 Mobile Usability Regression Pass

### 목표

모바일 MVP의 주요 사용 흐름을 실제 사용자 관점에서 다시 점검하고, 긴 자산명, 큰 금액, 필터, 수정/삭제, empty state, CSV import/export가 iPhone/iPad에서 깨지지 않는지 확인한다.

### 영향 범위

- UI: Dashboard, Snapshots, Add, Edit, Compare, CSV import/export
- Components: `MonthSelector`, `SnapshotForm`, `CsvImportPanel`, `EmptyState`, snapshot row/filter controls
- Validation: 기존 `@investment/domain` schema 유지
- DB: 변경 없음
- Tests: 비즈니스 로직 변경이 없다면 추가 테스트 없음

### 비목표

- 신규 기능 추가
- 화면 구조 전면 재작성
- 실시간 시세, broker 연동, 인증 추가
- 새 상태 관리 라이브러리 도입

### 점검 시나리오

1. 앱 최초 실행 후 seed 데이터가 보이는지 확인한다.
2. Dashboard에서 월 선택, 총액, 계좌/시장/자산군별 breakdown을 확인한다.
3. Snapshots에서 월, 계좌, 시장, 자산군, 통화, 키워드 필터를 조합해 확인한다.
4. 매우 긴 자산명과 큰 금액을 가진 스냅샷을 추가한다.
5. 추가한 스냅샷을 수정하고 삭제한다.
6. Compare에서 이전 월이 있는 경우와 없는 경우를 각각 확인한다.
7. CSV import preview, invalid row message, valid row 저장 동작을 확인한다.
8. 현재 필터 결과 CSV export가 가능한지 확인한다.
9. 데이터가 없는 월에서 empty state가 명확하게 보이는지 확인한다.

### 구현 후보

회귀 점검 중 문제가 발견될 경우 아래 순서로 작은 수정만 적용한다.

1. 텍스트 줄바꿈, `minHeight`, `lineHeight`, `flexShrink` 조정
2. iPad 폭에서 `maxWidth` 또는 adaptive grid 조정
3. 필터 chip/action button 터치 영역 보강
4. 긴 금액과 통화 라벨의 정렬 보정
5. empty/error/result 상태 문구와 accessible label 보강

### 완료 기준

- iPhone 폭에서 주요 탭과 edit route가 사용 가능하다.
- iPad portrait/landscape에서 주요 화면이 단순 확대판처럼 깨지지 않는다.
- 긴 자산명과 큰 금액이 버튼, 금액, 필터, preview row와 겹치지 않는다.
- 수정/삭제/CSV import/export 흐름이 막히지 않는다.
- Dynamic Type과 기존 accessibility label 동작이 후퇴하지 않는다.

### 검증

```bash
cd apps/mobile
npm run typecheck
npm run lint
npx expo export --platform web --output-dir dist
```

공유 domain 또는 웹 빌드에 영향이 있으면 아래도 실행한다.

```bash
npm test
npm run build
```

---

## 2. Mobile Smoke / Accessibility Verification

### 목표

M6 이후에도 새 로컬 환경이나 다른 simulator에서 같은 방식으로 모바일 smoke를 반복할 수 있는지 확인하고, 접근성 회귀를 기록한다.

### 영향 범위

- QA: simulator smoke, web fallback smoke
- Docs: smoke evidence 기록이 필요할 수 있음
- UI: smoke 중 발견된 문제만 별도 M8 수정으로 분리

### 비목표

- CI에 iOS simulator 요구사항 추가
- native build pipeline 구성
- EAS/TestFlight 배포

### 사전 조건

```bash
git status --short --branch
npm install
xcodebuild -version
xcrun simctl list devices available
```

### 기본 검증 명령

```bash
npm test
npm run build
cd apps/mobile && npm run typecheck
cd apps/mobile && npm run lint
cd apps/mobile && npx expo-doctor@latest
cd apps/mobile && npx expo export --platform web --output-dir dist
git diff --check
git diff --cached --check
```

### Native smoke 시나리오

1. 현재 기본 iPhone simulator에서 `npm run ios`를 실행한다.
2. Dashboard, Snapshots, Add, Compare, Edit route를 확인한다.
3. iPad simulator에서 portrait 상태를 확인한다.
4. 같은 iPad simulator를 landscape로 회전해 확인한다.
5. Dynamic Type을 키운 뒤 주요 화면의 줄바꿈과 터치 영역을 확인한다.
6. VoiceOver를 켜고 tab, month chip, filter, input, save/delete/export/import action, empty state 이름을 확인한다.
7. 앱 재시작 후 로컬 SQLite 데이터 유지 여부를 확인한다.

### Web fallback 시나리오

native simulator가 막히면 Expo web export로 대체 검증한다.

```bash
cd apps/mobile
npx expo export --platform web --output-dir /private/tmp/investment-mobile-smoke
python3 -m http.server 8082 --directory /private/tmp/investment-mobile-smoke
```

확인 폭:

- iPhone small width
- iPad portrait width
- iPad landscape width

### 완료 기준

- smoke 결과를 재현 가능한 명령과 기기명으로 기록한다.
- native smoke가 불가능하면 blocker와 web fallback 결과를 기록한다.
- 접근성 확인 중 발견된 문제는 M8 수정 후보로 분리한다.

### Evidence template

```text
Mobile smoke:
- Xcode:
- iPhone simulator:
- iPad simulator:
- Dynamic Type:
- VoiceOver:
- Web fallback:
- Result:
- Blockers:
```

---

## 3. Web CSV Preview Manual QA

### 목표

웹 MVP에서 문서상 남은 수동 점검 항목인 CSV preview UI 상호작용을 확인한다. CSV 파일 선택, preview 표시, row-level validation, valid row import 흐름이 사용자 입장에서 명확한지 확인한다.

### 영향 범위

- Web UI: `/import`
- Components: `CsvImportForm`
- Server Action: CSV import 저장 action
- Domain: CSV parse/validation schema
- DB: 테스트 데이터 생성 가능

### 비목표

- CSV 포맷 확장
- 대량 import 성능 최적화
- drag-and-drop 업로드
- 계좌 자동 생성 정책 변경

### 테스트 CSV 케이스

정상 행:

```csv
accountName,snapshotMonth,market,assetCategory,assetName,currency,amount,returnRate,memo
CMA,2026-04,KR,ETF,QA_TEST_KR_ETF,KRW,1234567,4.56,manual qa valid row
IRP,2026-04,US,ETF,QA_TEST_US_ETF,USD,1234.56,-1.23,manual qa usd row
```

오류 행:

```csv
accountName,snapshotMonth,market,assetCategory,assetName,currency,amount,returnRate,memo
CMA,2026-13,KR,ETF,INVALID_MONTH,KRW,1000,1.23,bad month
CMA,2026-04,KR,ETF,NEGATIVE_AMOUNT,KRW,-1000,1.23,bad amount
CMA,2026-04,KR,ETF,BAD_RATE,KRW,1000,1.234,bad rate scale
UNKNOWN,2026-04,KR,ETF,UNKNOWN_ACCOUNT,KRW,1000,1.23,bad account
```

### 점검 시나리오

1. `/import` 페이지가 정상 로드되는지 확인한다.
2. 정상 CSV 선택 후 preview row가 표시되는지 확인한다.
3. 오류 CSV 선택 후 row별 오류 메시지가 표시되는지 확인한다.
4. valid row만 import 대상이 되는지 확인한다.
5. import 완료 후 `/snapshots?snapshotMonth=2026-04&keyword=QA_TEST`로 결과를 확인한다.
6. 같은 CSV를 다시 import했을 때 duplicate/unique 충돌 메시지가 이해 가능한지 확인한다.
7. 생성된 QA 데이터는 확인 후 삭제한다.

### 완료 기준

- preview가 파일 선택 직후 사용자가 이해 가능한 형태로 표시된다.
- invalid row는 저장되지 않는다.
- valid row는 저장된다.
- 계좌명 불일치, 잘못된 월, 음수 금액, 소수점 초과 수익률 오류가 구분된다.
- import 결과가 snapshot list에서 필터로 확인된다.

### 검증

```bash
npm test
npm run build
```

브라우저 수동 검증:

```bash
npm run dev
```

확인 경로:

- `/import`
- `/snapshots?snapshotMonth=2026-04&keyword=QA_TEST`

---

## 4. M9 Release Readiness Baseline

### 목표

모바일 앱을 어떤 수준의 첫 산출물로 볼지 결정하고, Expo Go 검증, local native build, EAS build, TestFlight 중 이번 단계의 release readiness 기준을 명확히 한다.

### 영향 범위

- Config: `apps/mobile/app.json`, package metadata, Expo config
- Assets: icon, splash, adaptive icon
- Build: local native build 또는 EAS build 설정
- Docs: release checklist, privacy note, build evidence

### 비목표

- App Store 정식 제출
- 서버 동기화
- 사용자 계정/인증
- broker 연동
- 실시간 시세
- crash analytics 제품 도입

### 결정해야 할 사항

1. 첫 산출물 기준
   - Option A: Expo Go 검증까지
   - Option B: local native build까지
   - Option C: EAS preview build까지
   - Option D: TestFlight internal build까지

2. 앱 식별 정보
   - display name
   - bundle identifier
   - version/build number policy
   - orientation policy

3. asset 준비도
   - app icon
   - splash icon
   - adaptive icon
   - favicon/web fallback

4. 개인정보/데이터 정책 초안
   - local-only SQLite 저장
   - 외부 서버 전송 없음
   - CSV import/export는 사용자 파일 선택/공유 액션 기반
   - financial advice나 AI recommendation 없음

5. 빌드/배포 검증 범위
   - Expo doctor
   - local simulator smoke
   - web fallback export
   - EAS build 필요 여부

### 작업 단계

1. 현재 `app.json`과 assets 상태를 inventory로 정리한다.
2. bundle identifier와 display name 후보를 확정한다.
3. 첫 산출물 기준을 Option A-D 중 하나로 정한다.
4. 선택한 산출물 기준에 맞는 build checklist를 작성한다.
5. privacy nutrition label 초안에 필요한 local-only 데이터 흐름을 정리한다.
6. M8 smoke 결과를 release checklist에 연결한다.

### 완료 기준

- 첫 모바일 산출물의 기준이 명확하다.
- 앱 이름, bundle identifier, version/build 정책이 문서화되어 있다.
- icon/splash asset의 현재 상태와 보완 필요 여부가 정리되어 있다.
- local-only 개인정보 처리 방향이 문서화되어 있다.
- 선택한 build 경로에 필요한 명령과 evidence template이 있다.

### 검증

최소 기준:

```bash
cd apps/mobile
npm run typecheck
npm run lint
npx expo-doctor@latest
```

build 기준을 EAS까지 올릴 경우:

```bash
cd apps/mobile
npx eas build --platform ios --profile preview
```

EAS 명령은 계정/네트워크/인증 상태에 따라 별도 승인이 필요할 수 있다.

---

## 5. Documentation Consistency Cleanup

### 목표

루트 README, 모바일 README, 포팅 계획 문서 사이의 현재 구현 범위 표현을 맞춘다. 특히 루트 README가 모바일 앱을 out of scope로만 적고 있는 상태와 `apps/mobile`에 실제 모바일 MVP가 존재하는 상태의 불일치를 정리한다.

### 영향 범위

- `README.md`
- `apps/mobile/README.md`
- `MOBILE_APP_PORTING_PLAN.md`
- 필요 시 `Description.md`

### 비목표

- 기능 구현
- 오래된 문서 전체 재작성
- PR 히스토리 재구성
- product scope 확대

### 정리 원칙

- README는 현재 코드 기준 사실만 설명한다.
- 모바일 앱은 "웹 MVP 범위 밖"이 아니라 "별도 Expo mobile MVP 작업이 진행된 상태"로 표현한다.
- 실시간 시세, broker 연동, 인증, AI 추천은 계속 out of scope로 유지한다.
- 모바일 release readiness는 완료된 것과 계획 중인 것을 분리해서 쓴다.

### 작업 단계

1. 루트 README의 `현재 범위에 포함되지 않는 기능`에서 모바일 앱 표현을 재검토한다.
2. `apps/mobile/README.md`의 다음 작업 리스트가 M8/M9 명세와 맞는지 확인한다.
3. `MOBILE_APP_PORTING_PLAN.md`에서 M0-M6 완료/진행 상태를 별도 status note로 보강할지 결정한다.
4. 문서 간 용어를 통일한다.
   - Mobile MVP
   - release readiness
   - native smoke
   - local-only SQLite
5. 문서 변경만 포함하고 구현 파일은 건드리지 않는다.

### 완료 기준

- 루트 README와 모바일 README가 서로 모순되지 않는다.
- 이미 구현된 모바일 범위와 아직 남은 release readiness가 구분된다.
- 후속 작업자는 어느 문서를 먼저 봐야 하는지 알 수 있다.
- MVP 비목표가 계속 명확하다.

### 검증

```bash
git diff --check
git diff --cached --check
```

문서만 수정한 경우 build/test는 필수는 아니지만, README의 명령이나 경로를 바꿨다면 해당 명령의 존재 여부는 확인한다.

---

## 다음 구현 전 검토 질문

다음 구현 턴 전에 아래 결정을 먼저 하면 작업 범위가 깔끔해진다.

1. 모바일 첫 installable artifact를 아직 보류할지, local native build까지 올릴지
2. `expo-sqlite` repository/migration 테스트를 어디까지 자동화할지
3. CSV native file picker/share sheet 검증을 수동 evidence로 남길지, 별도 E2E 도구를 도입할지
4. TestFlight를 선택하기 전에 privacy/store readiness 초안을 먼저 작성할지
