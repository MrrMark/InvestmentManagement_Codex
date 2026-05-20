# MOBILE_APP_PORTING_PLAN.md

## 1. 목적

이 문서는 현재 Next.js 웹 MVP를 iPhone과 iPad에서 사용할 수 있는 모바일 앱으로 포팅하기 위한 개발 플랜과 제품/기술 명세를 정의한다.

모바일 앱의 1차 목표는 웹 MVP와 동일하게 월별 자산 스냅샷을 수동으로 기록하고, 선택 월의 현황과 전월 대비 변화를 확인하는 것이다. 실시간 시세 연동, 브로커 API, 거래 원장, 복잡한 세금 계산은 모바일 포팅 범위에도 포함하지 않는다.

작성 기준일: 2026-05-20

---

## 2. 현재 프로젝트 상태

현재 저장소는 다음 구조를 갖는다.

| 영역 | 현재 상태 |
| --- | --- |
| 웹 앱 | Next.js App Router |
| 언어 | TypeScript strict |
| 스타일 | Tailwind CSS |
| DB | Prisma + SQLite |
| 검증 | Zod |
| 핵심 도메인 로직 | `packages/domain`에 집계, 비교, 필터, CSV, 검증 로직 분리 |
| 주요 화면 | Dashboard, Snapshots, Add/Edit Snapshot, Compare, CSV Import |
| 테스트 | `node --import tsx --test packages/domain/src/*.test.ts` |

포팅에서 가장 재사용 가치가 높은 부분은 `packages/domain`의 순수 로직이다. 반대로 `app`, `components`, `lib/db`는 Next.js/Prisma/Web UI 의존도가 높기 때문에 모바일에서 직접 재사용하기보다 개념과 타입 계약을 재사용한다.

---

## 3. 권장 포팅 전략

### 3.1 기본 권장안

React Native + Expo 기반의 iOS/iPadOS 앱을 새 앱으로 추가한다.

권장 이유:

- 현재 코드베이스가 TypeScript와 Zod 기반이므로 enum, validation, aggregation, comparison 로직을 공유하기 쉽다.
- iPhone과 iPad를 하나의 코드베이스에서 지원할 수 있다.
- Expo Router를 사용하면 현재 Next.js App Router의 화면 구조를 비슷한 mental model로 옮길 수 있다.
- EAS Build/TestFlight 배포 흐름이 개인 앱 배포와 내부 테스트에 적합하다.
- 로컬 SQLite를 앱 내부에 둘 수 있어 MVP의 수동 스냅샷 모델과 잘 맞는다.

### 3.2 대안

SwiftUI 네이티브 앱도 가능하다.

SwiftUI를 선택할 조건:

- 장기적으로 Apple 플랫폼만 지원한다.
- iPad split view, keyboard shortcut, Pencil, document picker 같은 Apple-native UX 완성도가 최우선이다.
- 기존 TypeScript 도메인 로직 재사용보다 네이티브 품질과 OS 통합을 더 중시한다.

현재 프로젝트 기준 기본 선택은 Expo다. SwiftUI는 제품이 Apple 전용으로 굳어지고 모바일 앱이 웹보다 중심 제품이 될 때 재검토한다.

---

## 4. 기술 스택 명세

### 4.1 Mobile App

| 항목 | 선택 |
| --- | --- |
| Framework | Expo + React Native |
| Language | TypeScript strict |
| Routing | Expo Router |
| State | React state + derived selectors first |
| Forms | React Hook Form 또는 단순 controlled form, Zod resolver는 필요 시 도입 |
| Validation | 공유 Zod schema |
| Local DB | `expo-sqlite` |
| DB access | 작은 repository 함수부터 시작, 복잡해지면 Drizzle 검토 |
| Charts | `react-native-svg` 기반 chart library 또는 직접 단순 bar/list 표현 |
| Build | EAS Build |
| Test distribution | TestFlight |

버전 원칙:

- 앱 생성 시 `npx create-expo-app@latest`를 사용한다.
- 생성 직후 `npx expo-doctor@latest`로 New Architecture와 라이브러리 호환성을 확인한다.
- 2026-05-20 기준 Expo SDK 최신 안정 문서는 SDK 55를 기준으로 React Native 0.83을 사용한다고 안내한다.
- React Native 자체 최신 안정 라인은 0.85 계열이므로, Expo SDK가 0.85를 안정 지원하는 시점에는 해당 SDK로 시작한다.
- SDK와 React Native 버전은 직접 핀보다 Expo SDK 호환성 표를 우선한다.

### 4.2 Web App

기존 웹 앱은 유지한다.

- 모바일 포팅 중 웹 기능을 축소하지 않는다.
- `packages/domain`을 웹과 모바일의 공유 도메인 계약으로 유지한다.
- 웹 DB는 Prisma + SQLite를 유지한다.

### 4.3 Repository Layout Target

1차 포팅이 실제 구현으로 들어가면 아래 구조를 목표로 한다.

```text
apps/
  web/                기존 Next.js 앱
  mobile/             Expo 앱
packages/
  domain/             enum, Zod schema, aggregation, comparison, filter logic
  config/             tsconfig/eslint 공유 설정, 필요 시 추가
prisma/               웹 서버 DB 스키마 유지
```

단, 첫 구현 PR에서 바로 monorepo 대이동을 하지 않는다. 순서는 다음이 안전하다.

1. `packages/domain`을 만들고 순수 로직만 이동한다.
2. 웹 앱이 이동된 domain package를 참조하도록 바꾼다.
3. 모바일 앱을 추가하고 같은 domain package를 참조한다.
4. DB 접근 계층은 웹과 모바일을 분리한다.

---

## 5. 제품 범위

### 5.1 Mobile MVP 포함 범위

- 단일 사용자 로컬 앱
- 계좌 목록 조회
- 월별 자산 스냅샷 생성, 수정, 삭제
- 스냅샷 목록 조회와 필터
- 선택 월 대시보드
- 월간 비교
- CSV 가져오기
- CSV 내보내기
- iPhone/iPad 반응형 레이아웃
- 로컬 SQLite 영속화
- 기본 다국어 구조는 웹의 한국어/영어 사전을 이어받되, 1차 UI 문구는 한국어 우선

### 5.2 Mobile MVP 제외 범위

- 실시간 시세 동기화
- 브로커 API 연동
- OAuth/social login
- 서버 계정 동기화
- 다중 사용자 조직 기능
- 거래 원장 기반 회계
- 세금 계산
- AI 추천
- Push notification
- Apple Watch, widget, Siri shortcut

### 5.3 2차 후보

- Face ID/Touch ID 앱 잠금
- iCloud Drive 또는 파일 기반 백업/복원
- 같은 개인의 여러 기기 간 동기화
- App Store 정식 배포
- iPad keyboard shortcuts
- Chart 고도화

---

## 6. 데이터 명세

### 6.1 Core Entities

모바일도 웹과 같은 개념 모델을 사용한다.

```text
User
Account
AssetSnapshot
```

### 6.2 Local SQLite Tables

모바일 SQLite는 Prisma를 직접 사용하지 않는다. React Native 런타임에서는 Prisma Client를 앱 내부 DB 접근 계층으로 쓰지 않고, SQLite repository 함수를 별도로 둔다.

초기 로컬 스키마 방향:

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE asset_snapshots (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  snapshot_month TEXT NOT NULL,
  market TEXT NOT NULL,
  asset_category TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  currency TEXT NOT NULL,
  amount_text TEXT NOT NULL,
  return_rate_text TEXT NOT NULL,
  memo TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  UNIQUE (
    user_id,
    account_id,
    snapshot_month,
    asset_name,
    asset_category,
    currency
  )
);

CREATE INDEX idx_asset_snapshots_snapshot_month
ON asset_snapshots(snapshot_month);

CREATE INDEX idx_asset_snapshots_account_month
ON asset_snapshots(account_id, snapshot_month);
```

### 6.3 Decimal Policy

모바일 SQLite에서는 `amount`와 `returnRate`를 숫자 부동소수점으로 저장하지 않는다.

- 저장: `amount_text`, `return_rate_text`에 정규화된 decimal string 저장
- 검증: Zod schema에서 non-negative amount, two-decimal return rate 검증
- 계산: 집계/비교 함수 입력으로 넘기기 전에 decimal-safe 변환 계층을 둔다.
- 표시: 통화별 값을 섞어 합산하지 않고 `KRW`, `USD`를 분리해 보여준다.

현재 웹의 Prisma `Decimal`과 모바일의 decimal string 사이에는 adapter를 둔다.

### 6.4 ID Policy

- 모바일 로컬 ID는 string을 사용한다.
- 웹과 공유 가능성을 고려해 UUID 또는 CUID 계열을 사용한다.
- 서버 동기화를 도입하기 전까지 별도의 remote id는 두지 않는다.

---

## 7. 화면 명세

### 7.1 Navigation

iPhone:

- Bottom tab: Dashboard, Snapshots, Add, Compare
- Add/Edit 화면은 stack push
- 필터는 화면 상단 compact controls 또는 filter sheet

iPad:

- Sidebar: Dashboard, Snapshots, Add Snapshot, Compare, Import/Export
- 넓은 화면에서는 master-detail 패턴 사용
- Snapshots 목록과 상세/편집 패널을 동시에 표시할 수 있게 설계

공통:

- safe area를 준수한다.
- Dynamic Type 확대를 고려해 카드/표 레이아웃이 깨지지 않게 한다.
- 핵심 숫자와 통화 라벨은 항상 함께 표시한다.

### 7.2 Dashboard

기능:

- 선택 월 변경
- 통화별 총 자산
- 계좌별 자산
- 시장별 자산
- 자산군별 자산
- 상위 자산
- 전월 대비 delta 요약

모바일 표현:

- iPhone: summary card + section list
- iPad: 왼쪽 월 선택/요약, 오른쪽 breakdown grid
- chart는 MVP에서 필수로 보지 않는다. 단순 bar/list가 더 읽기 쉬우면 chart보다 우선한다.

빈 상태:

- 선택 월 데이터가 없으면 "해당 월에 등록된 스냅샷이 없습니다" 표시
- 이전 월 데이터가 없으면 전월 비교 값은 생성하지 않는다.

### 7.3 Snapshot List

기능:

- 월, 계좌, 시장, 자산군, 통화, 키워드 필터
- 기본 정렬: amount descending
- 행 선택 후 상세/편집
- 삭제 전 확인

모바일 표현:

- iPhone: 카드형 list row
- iPad: table-like row 또는 2-pane layout
- 긴 자산명은 2줄까지 허용하고 금액/통화는 우측 정렬

### 7.4 Snapshot Create/Edit

필드:

- snapshotMonth
- account
- market
- assetCategory
- assetName
- currency
- amount
- returnRate
- memo

입력 정책:

- `snapshotMonth`는 `YYYY-MM` picker 또는 month selector로 입력
- amount는 numeric keyboard
- returnRate는 signed decimal 입력 허용
- memo는 200자 이하
- 저장 전 Zod 검증
- 중복 unique 충돌은 사용자에게 명확한 메시지로 표시

### 7.5 Compare

기능:

- 선택 월과 가장 가까운 이전 월 비교
- 통화별 total delta
- 계좌/시장/자산군별 delta

모바일 표현:

- iPhone: summary 후 breakdown list
- iPad: category tabs 또는 segmented control + 넓은 table

### 7.6 Import/Export

CSV 가져오기:

- iOS document picker로 CSV 선택
- 행 단위 검증
- 오류 행은 row number와 reason 표시
- 검증된 행만 저장

CSV 내보내기:

- 현재 필터 결과를 CSV로 생성
- iOS share sheet로 저장/전달

---

## 8. 애플 플랫폼 UX 기준

- iPhone에서는 한 손 사용과 빠른 월 선택을 우선한다.
- iPad에서는 넓은 화면을 정보 밀도 향상에 사용하고, 단순히 iPhone 화면을 늘리지 않는다.
- iPad는 sidebar 또는 split view를 기본 레이아웃 후보로 둔다.
- 입력 화면은 modal 남발보다 stack navigation과 명확한 저장/취소 액션을 우선한다.
- 표/리스트의 행 높이는 Dynamic Type과 긴 자산명을 고려한다.
- 화면 하단 tab bar, 상단 navigation bar, Dynamic Island, home indicator를 침범하지 않는다.

---

## 9. 아키텍처 명세

### 9.1 Layering

```text
Mobile UI
  screens, components, navigation

Application Hooks
  useDashboardSummary, useSnapshotList, useSnapshotForm

Repository
  SQLite CRUD, migrations, import/export IO

Domain Package
  enums, Zod schemas, aggregation, comparison, filter normalization
```

원칙:

- UI에서 SQL을 직접 호출하지 않는다.
- Repository에서 React component를 참조하지 않는다.
- Aggregation/comparison은 DB를 모르는 순수 함수로 유지한다.
- Web과 Mobile의 DB adapter는 분리하되 domain input/output type은 맞춘다.

### 9.2 Data Flow

```text
Screen
  -> hook
  -> repository query
  -> normalize DB rows
  -> domain utility
  -> view model
  -> component render
```

### 9.3 Error Handling

- Validation error: field-level message
- Duplicate snapshot: form-level message with duplicated key summary
- DB migration error: blocking error screen with retry
- Import partial failure: valid/invalid row count와 오류 목록 표시

### 9.4 Offline Policy

MVP는 offline-first local-only 앱이다.

- 앱 실행과 CRUD는 네트워크 없이 동작해야 한다.
- 외부 서버가 없어도 전체 기능이 가능해야 한다.
- 동기화는 별도 phase에서만 추가한다.

---

## 10. 개발 플랜

### Phase M0 - Decision and Scaffold

목표:

- 모바일 앱의 기술 선택을 확정하고 실행 가능한 Expo 앱을 만든다.

작업:

- `apps/mobile` Expo 앱 생성
- TypeScript strict 설정 확인
- Expo Router 설정
- iOS simulator 실행 확인
- `expo-doctor`로 SDK/라이브러리 호환성 확인
- iPhone/iPad target orientation과 display name 설정

완료 기준:

- iOS simulator에서 빈 앱 실행
- 기본 routing 동작
- TypeScript check 통과

### Phase M1 - Shared Domain Package

목표:

- 웹과 모바일이 공통으로 쓸 도메인 계약을 분리한다.

작업:

- `packages/domain` 생성
- enum/constants 이동
- Zod schema 이동
- aggregation/comparison/filter/csv 순수 로직 이동
- 웹 앱 import 경로 조정
- 기존 domain test 이동 또는 복제 후 통과 확인

완료 기준:

- 웹 앱 테스트 통과
- 웹 앱 build 통과
- domain package가 React/Next/Prisma에 의존하지 않음

### Phase M2 - Mobile Local Persistence

목표:

- 모바일 앱에 로컬 SQLite 기반 CRUD 기반을 만든다.

작업:

- `expo-sqlite` 추가
- DB migration runner 작성
- User/Account seed 작성
- Snapshot repository 작성
- create/update/delete/list query 작성
- unique 충돌 처리
- repository 단위 테스트 또는 integration smoke 작성

완료 기준:

- 앱 재시작 후 데이터 유지
- 스냅샷 CRUD 가능
- 중복 입력 방지
- migration version 관리 가능

### Phase M3 - Mobile Screens MVP

목표:

- 웹 MVP와 같은 핵심 화면을 모바일에서 사용할 수 있게 한다.

작업:

- Dashboard screen
- Snapshot list screen
- Snapshot create/edit screen
- Compare screen
- Month selector
- Filter controls
- Empty/error/loading states

완료 기준:

- iPhone simulator에서 주요 플로우 완료
- iPad simulator에서 layout 파손 없음
- 통화별 금액 라벨이 명확함
- 이전 월 없음 상태가 명확함

### Phase M4 - CSV Import/Export

목표:

- 기존 웹의 CSV 업무 흐름을 모바일에서도 지원한다.

작업:

- CSV parser adapter 연결
- document picker로 CSV 선택
- 행 단위 검증 결과 UI
- valid rows 저장
- 현재 필터 결과 CSV 생성
- share sheet export

완료 기준:

- 웹 CSV 샘플과 호환
- invalid row가 저장되지 않음
- export 파일을 다시 import할 수 있음

### Phase M5 - iPad and Accessibility Polish

목표:

- iPad에서 "확대한 iPhone 앱"이 아니라 관리 도구답게 보이게 한다.

작업:

- sidebar/split layout 적용
- snapshot list + detail/edit 2-pane 검토
- Dynamic Type 점검
- VoiceOver label 점검
- keyboard navigation 기본 검토
- landscape layout 점검

완료 기준:

- iPad portrait/landscape에서 핵심 화면 사용 가능
- 주요 버튼과 입력 필드에 accessibility label 존재
- 긴 자산명/큰 금액/한국어 텍스트가 UI를 깨지 않음

### Phase M6 - Distribution Readiness

목표:

- 실제 기기와 TestFlight에서 검증한다.

작업:

- app icon, launch screen, display name 정리
- bundle identifier 설정
- privacy nutrition label 초안 작성
- TestFlight internal build
- 실제 iPhone/iPad smoke test
- crash/logging 최소 구성 검토

완료 기준:

- EAS production 또는 preview build 성공
- TestFlight 설치 가능
- 실제 기기에서 CRUD/import/export smoke 통과
- App Store 제출 전 체크리스트 준비

---

## 11. 테스트 전략

### 11.1 Unit Tests

대상:

- snapshot validation
- aggregation
- comparison
- filter normalization
- CSV parse/serialize
- decimal normalization

원칙:

- domain package 테스트는 web/mobile과 독립적으로 실행한다.
- 통화 혼합 합산 방지 케이스를 반드시 포함한다.

### 11.2 Repository Tests

대상:

- migration
- insert/update/delete/list
- unique constraint
- filter query
- import transaction rollback/partial save policy

### 11.3 Device Smoke

대상 기기:

- iPhone small screen
- iPhone large screen
- iPad 11-inch
- iPad 13-inch 또는 가장 큰 simulator

핵심 시나리오:

1. 앱 최초 실행 후 seed 확인
2. 새 스냅샷 추가
3. 목록 필터와 검색
4. 기존 스냅샷 수정
5. 전월 비교 확인
6. CSV export
7. CSV import
8. 앱 재시작 후 데이터 유지 확인

---

## 12. 주요 리스크와 대응

| 리스크 | 영향 | 대응 |
| --- | --- | --- |
| Prisma Client를 모바일에서 재사용하려는 유혹 | 번들/런타임 문제 | 모바일 DB 계층은 `expo-sqlite` repository로 분리 |
| 웹 구조를 한 번에 monorepo로 크게 이동 | 회귀 위험 | domain package만 먼저 분리 |
| decimal을 JS number로 저장 | 금액 정확도 저하 | SQLite에는 decimal string 저장 |
| iPad UX가 단순 확대판이 됨 | 사용성 저하 | sidebar/split view를 별도 명세로 처리 |
| CSV import 오류 처리 부실 | 데이터 신뢰도 저하 | 행 단위 검증과 partial result UI |
| New Architecture 미호환 라이브러리 | 빌드 실패 | `expo-doctor`와 React Native Directory 확인 |

---

## 13. 구현 우선순위

1. Domain package 분리
2. Mobile scaffold
3. Local SQLite schema/migration
4. Snapshot CRUD
5. Dashboard aggregation
6. Month comparison
7. Filters/search
8. CSV import/export
9. iPad layout
10. TestFlight readiness

---

## 14. 작업 단위 제안

작은 PR 단위:

| PR | 내용 | 검증 |
| --- | --- | --- |
| PR-1 | `packages/domain` 분리 | domain tests, web build |
| PR-2 | `apps/mobile` scaffold | iOS simulator boot, typecheck |
| PR-3 | mobile SQLite migration/repository | repository smoke |
| PR-4 | mobile snapshot form/list | CRUD smoke |
| PR-5 | mobile dashboard/compare | domain tests, simulator smoke |
| PR-6 | CSV import/export | round-trip smoke |
| PR-7 | iPad/accessibility polish | iPad simulator screenshots |
| PR-8 | EAS/TestFlight readiness | EAS build |

---

## 15. Done Criteria

모바일 포팅 MVP는 아래 조건을 만족하면 완료로 본다.

- iPhone과 iPad에서 앱 설치/실행 가능
- 네트워크 없이 스냅샷 CRUD 가능
- 앱 재시작 후 데이터 유지
- Dashboard와 Compare가 웹 MVP와 같은 계산 결과를 표시
- 스냅샷 목록 필터가 동작
- CSV import/export가 웹 포맷과 호환
- TypeScript strict 유지
- domain business logic 테스트 통과
- iPhone/iPad 주요 simulator smoke 통과
- TestFlight 내부 배포 가능 상태

---

## 16. 공식 참고 문서

- Expo SDK reference: https://docs.expo.dev/versions/v55.0.0/
- Expo Router: https://docs.expo.dev/versions/latest/sdk/router/
- Expo SQLite: https://docs.expo.dev/versions/latest/sdk/sqlite/
- Expo New Architecture guide: https://docs.expo.dev/guides/new-architecture/
- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Submit for iOS: https://docs.expo.dev/submit/ios/
- React Native versions: https://reactnative.dev/versions
- React Native 0.84 release notes: https://reactnative.dev/blog/2026/02/11/react-native-0.84
- Apple Human Interface Guidelines - Layout: https://developer.apple.com/design/human-interface-guidelines/layout
- Apple Human Interface Guidelines - Sidebars: https://developer.apple.com/design/human-interface-guidelines/sidebars
- Apple Human Interface Guidelines - Tab bars: https://developer.apple.com/design/human-interface-guidelines/tab-bars
