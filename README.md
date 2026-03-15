# InvestmentManagement_Codex

월별 자산 스냅샷을 기록하고 현재 포트폴리오 상태를 확인하기 위한 개인 투자 관리 앱입니다. 이 프로젝트는 거래 시스템이나 실시간 시세 연동 서비스가 아니라, 직접 입력한 월간 자산 데이터를 안정적으로 저장하고 비교하는 MVP에 초점을 맞춥니다.

현재 구현은 대시보드, 스냅샷 CRUD, CSV import, 월간 비교, Docker 실행 검증까지 포함합니다. GitHub 방문자가 프로젝트 목적과 실행 방법을 빠르게 이해할 수 있도록, 아래 내용은 한글 설명을 먼저 제공하고 같은 내용을 영어로 이어서 제공합니다.

## 프로젝트 개요

- 월별 자산 보유 현황을 스냅샷 단위로 기록합니다.
- 선택한 월 기준으로 자산 합계와 배분 현황을 확인할 수 있습니다.
- 이전 월과 비교해 증감 변화를 확인할 수 있습니다.
- CSV 파일로 스냅샷을 일괄 등록할 수 있습니다.
- 수동 입력 기반 MVP이며, 실시간 시세/브로커 연동은 포함하지 않습니다.

## 핵심 기능

- 대시보드
  - 스냅샷 월 선택
  - 총 자산
  - 계좌별 자산
  - 시장별 자산
  - 자산군별 자산
  - 상위 자산 목록
- 스냅샷 목록
  - 월, 계좌, 시장, 자산군, 통화, 키워드 필터
  - 월 기준 내림차순, 금액 기준 정렬
  - 수정 및 삭제
- 스냅샷 입력
  - 월별 보유 자산 추가
  - 기존 스냅샷 수정
- CSV import
  - 검증된 행만 업로드
  - 계좌명 기준으로 스냅샷 생성
- 월간 비교
  - 선택한 월과 가장 가까운 이전 월 비교
  - 총합/계좌/시장/자산군 단위 증감 확인

## 기술 스택

- Next.js App Router
- TypeScript
- Prisma
- SQLite
- Zod
- Tailwind CSS
- Docker / Docker Compose

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 기준으로 `.env`를 준비합니다.

```env
DATABASE_URL="file:./dev.db"
```

### 3. 데이터베이스 준비

```bash
npx prisma migrate dev
npm run db:seed
```

### 4. 개발 서버 실행

```bash
npm run dev
```

기본 주소는 `http://localhost:3000` 입니다.

## 테스트 및 빌드

```bash
npm test
npm run build
```

- `npm test`: 도메인 로직 테스트 실행
- `npm run build`: Next.js 프로덕션 빌드 검증

## Docker 실행

### 이미지 빌드

```bash
docker compose build
```

### 앱 실행

```bash
docker compose up -d
```

기본 포트 `3000`이 이미 사용 중이면 다음처럼 다른 포트를 사용할 수 있습니다.

```bash
HOST_PORT=3001 docker compose up -d
```

이 구성은 컨테이너 시작 시 아래 순서로 앱을 준비합니다.

```text
prisma migrate deploy -> prisma db seed -> next start
```

### 스모크 테스트

```bash
curl http://localhost:3000/
curl http://localhost:3000/snapshots
curl http://localhost:3000/import
```

`HOST_PORT=3001`로 실행했다면 같은 방식으로 `http://localhost:3001`을 사용하면 됩니다.

### 종료 및 초기화

```bash
docker compose down
docker compose down -v
```

- `docker compose down`: 컨테이너와 네트워크만 정리
- `docker compose down -v`: SQLite 볼륨까지 함께 초기화

## 데이터 모델 요약

핵심 엔티티는 아래 3개입니다.

- `User`
- `Account`
- `AssetSnapshot`

주요 필드는 다음과 같습니다.

- `snapshotMonth`: `YYYY-MM` 형식의 월 단위 기준값
- `market`: `KR`, `US`
- `assetCategory`: `STOCK`, `ETF`, `BOND`, `ELB`, `TDF`
- `currency`: `KRW`, `USD`
- `amount`: 원래 통화 기준 자산 금액
- `returnRate`: 수익률

중복 입력 방지를 위해 아래 조합에 unique 제약을 둡니다.

```text
userId + accountId + snapshotMonth + assetName + assetCategory + currency
```

## 디렉터리 구조

```text
app/           화면과 라우트, 서버 액션
components/    공통 UI 컴포넌트
lib/db/        Prisma 조회와 폼 데이터 파싱
lib/domain/    집계, 비교, 필터, CSV, 검증 로직
prisma/        스키마, 마이그레이션, 시드 데이터
```

구조상 중요한 원칙은 DB 접근과 계산 로직을 분리하는 것입니다.

- `lib/db/`는 Prisma를 통해 데이터를 읽고 저장합니다.
- `lib/domain/`은 집계/비교/필터링 같은 순수 로직을 담당합니다.

## 현재 구현 범위

현재 README 기준으로 구현된 범위는 다음과 같습니다.

- 단일 사용자 기준 데모 데이터 시드
- 월별 스냅샷 추가/수정/삭제
- 스냅샷 목록 필터링
- 대시보드 집계
- 월간 비교
- CSV import
- Docker 기반 실행 검증

## 현재 범위에 포함되지 않는 기능

- 실시간 시세 연동
- 브로커 API 연동
- 거래 원장형 회계 처리
- 복잡한 세금 계산
- OAuth / 소셜 로그인
- 모바일 앱
- 다중 사용자 조직 기능
- AI 추천 기능

## 참고

- 앱은 데모 시드를 포함하므로 초기 실행 후 바로 화면을 확인할 수 있습니다.
- Prisma는 현재 6.x 기준으로 유지되고 있습니다.
- README는 현재 코드 기준 사실만 설명하며, 아직 구현되지 않은 기능은 포함하지 않습니다.

---

# InvestmentManagement_Codex

InvestmentManagement_Codex is a personal investment management app for recording monthly asset snapshots and reviewing the current portfolio state. It is not a trading platform or a real-time market integration product. The current MVP focuses on storing manually entered monthly asset data and comparing changes over time.

The current implementation includes a dashboard, snapshot CRUD, CSV import, month-over-month comparison, and Docker-based runtime validation. The Korean documentation above is the primary version, and the following English section mirrors the same scope in the same order.

## Overview

- Record portfolio holdings as monthly snapshots.
- Review totals and allocation for a selected month.
- Compare the selected month with the closest previous month.
- Import snapshot rows from CSV.
- Stay focused on a manual snapshot workflow instead of real-time brokerage sync.

## Core Features

- Dashboard
  - Select a snapshot month
  - View total assets
  - View assets by account
  - View assets by market
  - View assets by asset category
  - Review top assets
- Snapshot list
  - Filter by month, account, market, asset category, currency, and keyword
  - Review rows sorted by month and amount
  - Edit and delete snapshots
- Snapshot input
  - Create monthly holding snapshots
  - Update existing snapshots
- CSV import
  - Import only validated rows
  - Create snapshots by matching account names
- Month-over-month comparison
  - Compare the selected month with the closest earlier month
  - Review deltas by total, account, market, and category

## Tech Stack

- Next.js App Router
- TypeScript
- Prisma
- SQLite
- Zod
- Tailwind CSS
- Docker / Docker Compose

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env` based on `.env.example`.

```env
DATABASE_URL="file:./dev.db"
```

### 3. Prepare the database

```bash
npx prisma migrate dev
npm run db:seed
```

### 4. Start the development server

```bash
npm run dev
```

The default address is `http://localhost:3000`.

## Test and Build

```bash
npm test
npm run build
```

- `npm test`: runs domain-level tests
- `npm run build`: verifies the production build

## Docker

### Build the image

```bash
docker compose build
```

### Start the app

```bash
docker compose up -d
```

If port `3000` is already in use, run the app on a different host port.

```bash
HOST_PORT=3001 docker compose up -d
```

The container startup flow is:

```text
prisma migrate deploy -> prisma db seed -> next start
```

### Smoke test

```bash
curl http://localhost:3000/
curl http://localhost:3000/snapshots
curl http://localhost:3000/import
```

If you started the app with `HOST_PORT=3001`, use `http://localhost:3001` for the same checks.

### Stop and reset

```bash
docker compose down
docker compose down -v
```

- `docker compose down`: removes containers and network
- `docker compose down -v`: also removes the SQLite volume

## Data Model Summary

The project centers around three entities:

- `User`
- `Account`
- `AssetSnapshot`

Important fields include:

- `snapshotMonth`: month key in `YYYY-MM` format
- `market`: `KR`, `US`
- `assetCategory`: `STOCK`, `ETF`, `BOND`, `ELB`, `TDF`
- `currency`: `KRW`, `USD`
- `amount`: asset amount in its original currency
- `returnRate`: return percentage

To prevent exact duplicate rows, the schema uses the following unique combination:

```text
userId + accountId + snapshotMonth + assetName + assetCategory + currency
```

## Directory Structure

```text
app/           routes, pages, and server actions
components/    shared UI components
lib/db/        Prisma queries and form parsing
lib/domain/    aggregation, comparison, filter, CSV, and validation logic
prisma/        schema, migrations, and seed data
```

One of the key architectural choices is separating persistence from calculation logic.

- `lib/db/` handles data access and persistence with Prisma.
- `lib/domain/` contains pure logic for aggregation, comparison, filtering, and validation.

## Current Scope

The current codebase includes:

- Demo seed data for a single-user workflow
- Create, update, and delete snapshot flows
- Snapshot list filtering
- Dashboard aggregations
- Month-over-month comparison
- CSV import
- Docker-based runtime validation

## Out of Scope

- Real-time market data sync
- Broker API integration
- Full transaction ledger accounting
- Complex tax calculations
- OAuth / social login
- Mobile app
- Multi-user organization features
- AI recommendation features

## Notes

- The app includes demo seed data, so the UI can be reviewed right after setup.
- Prisma currently remains on the 6.x line.
- This README only describes what is already implemented in the current codebase.
