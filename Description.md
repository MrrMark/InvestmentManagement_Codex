# InvestmentManagement_Codex 작업 정리

## 개요
이번 세션에서는 월간 투자 스냅샷 관리 앱의 MVP를 실제로 사용할 수 있는 수준으로 안정화하는 작업을 진행했다.  
핵심 목표는 다음과 같았다.

- build/test 통과
- Prisma + SQLite persistence 정상화
- Snapshot CRUD 동작 연결
- Dashboard/Compare 집계 로직 연결
- Snapshot list 필터링 추가
- CSV import 기본 플로우 추가
- 비즈니스 로직 테스트 보강

---

## 1. 프로젝트 초기 구조 및 기반 구성

### 적용 내용
- Next.js(App Router) + TypeScript(strict) + Tailwind 기반 최소 앱 구조 생성
- 기본 라우트 구성
  - `/` (Dashboard)
  - `/snapshots` (Snapshot list)
  - `/add-snapshot` (Snapshot create)
  - `/compare` (Month-over-month compare)
  - `/import` (CSV import)
- 공통 layout + navigation 구성

### 목적
- 이후 기능 구현 시 구조를 크게 흔들지 않고 최소 변경으로 확장 가능하도록 기반을 만든 것

---

## 2. 데이터 모델/DB 계층

### Prisma schema
아래 3개 엔티티 중심으로 구성했다.

- `User`
- `Account`
- `AssetSnapshot`

주요 enum:
- `AccountType`
- `Market`
- `AssetCategory`
- `Currency`

주요 제약:
- `snapshotMonth` 인덱스
- `accountId + snapshotMonth` 인덱스
- `userId + accountId + snapshotMonth + assetName + assetCategory + currency` unique

### migration / DB 상태
- 초기 migration SQL을 추가
- `prisma migrate deploy` 기준으로 schema 적용 상태 확인
- 최종 검증 시 `Database schema is up to date` 확인

### seed 데이터
- 단일 월 샘플에서 복수 월(예: 2026-01/02/03)로 확장
- KRW/USD 혼합 데이터 포함
- 복수 account(CMA, IRP, Pension Savings) 및 복수 category(ETF, BOND, TDF 등) 포함

---

## 3. Snapshot CRUD 구현

### Create / Update / Delete / List
- `Server Action` 기반으로 CRUD 연결
- 목록 페이지에서 `Edit/Delete` 동작 가능
- 수정 페이지에서 기존 데이터 prefill 후 저장 가능

### Validation
- `Zod` 스키마로 입력 검증
  - `snapshotMonth` 형식 검증 (`YYYY-MM`)
  - enum 값 검증
  - numeric 값 검증
  - `returnRate`는 최대 소수점 둘째 자리까지 허용하도록 보강

---

## 4. Dashboard 집계 로직

### 구현 방식
- DB 조회와 집계를 분리하고, 집계는 pure function으로 구성
- `snapshotMonth` 기준 집계

### 제공 지표
- total assets
- assets by account
- assets by market
- assets by asset category
- top assets

### 통화 처리
- 서로 다른 currency를 강제로 합산하지 않고 currency별로 분리해서 표시

---

## 5. Month-over-month 비교 로직

### 구현 방식
- 기존 aggregation 유틸을 재사용해서 delta 계산
- 선택 월 대비 가장 가까운 이전 월을 찾아 비교

### 제공 지표
- total delta
- delta by account
- delta by market
- delta by asset category

### fallback 처리
- 이전 월이 없으면 비교값을 임의 생성하지 않고 `No previous month` 상태를 표시

---

## 6. Snapshot list 필터링

### 추가된 필터
- `snapshotMonth`
- `account`
- `market`
- `assetCategory`
- `currency`
- `keyword` (assetName 검색)

### 동작 방식
- URL query param 기반으로 상태 유지
  - 예: `/snapshots?market=US&snapshotMonth=2026-03`
- 서버 쿼리에서 필터 적용
- 기본 정렬은 `amount desc` 유지
- filter normalization 로직을 pure function으로 분리

---

## 7. CSV import 기능

### 구현 내용
- `/import` 페이지 추가
- CSV 파일 업로드
- 클라이언트에서 row preview
- row 단위 `Zod` 검증
- invalid row는 import 대상에서 제외
- valid row만 `Server Action`으로 DB 저장

### 기본 CSV 헤더
- `accountName,snapshotMonth,market,assetCategory,assetName,currency,amount,returnRate,memo`

---

## 8. DB 미준비 상태 구분

기존에는 일부 페이지에서 DB 에러를 catch 후 빈 배열 처리만 해서,
실제 empty state와 DB 미준비 상태가 구분되지 않는 문제가 있었다.

### 개선 내용
- Prisma table missing 계열 오류를 별도로 감지
- 페이지에서 `Database not ready` 메시지를 표시
- 정상 empty state와 DB 미준비 상태를 분리해서 안내

---

## 9. 테스트 보강

### 추가/보강된 테스트
- aggregation 유틸 테스트
- comparison 유틸 테스트
- snapshot validation(`Zod`) 테스트
- snapshot filter normalization 테스트

### test 실행 방식
- 샌드박스 환경의 IPC 제약을 피하기 위해 test script를
  `node --import tsx --test lib/domain/*.test.ts` 형태로 정리

---

## 10. 최종 검증 결과

세션 내 최종 상태에서 아래 항목을 확인했다.

- `npm test` 통과 (전체 pass)
- `npm run build` 통과
- `npx prisma migrate status` 통과 (`Database schema is up to date`)
- `npm run db:seed` 통과
- 주요 페이지 라우트 응답 확인
- 필터/월 선택 동작 확인
- Create/Update/Delete 플로우를 실제 요청으로 검증

추가로 검증용으로 생성한 테스트 데이터(`CLI_TEST_ASSET*`)는 삭제까지 수행해 정리했다.

---

## 11. 현재 상태 요약

- MVP 핵심 흐름(입력/조회/수정/삭제/집계/비교/CSV import)이 코드상 연결되어 있음
- build/test/DB schema 상태 모두 정상
- 실제 브라우저 상호작용 기준으로는 CSV preview 같은 UI 인터랙션 항목만 최종 수동 점검하면 안정적으로 마무리 가능

