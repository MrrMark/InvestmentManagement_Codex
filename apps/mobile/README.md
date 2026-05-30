# Investment Snapshots Mobile

iPhone/iPad용 월간 자산 스냅샷 앱입니다. 현재 단계는 Expo Router 기반 모바일 셸에 로컬 SQLite 저장소를 연결한 MVP 기반입니다.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Scripts

- `npm run ios`: iOS simulator 실행
- `npm run web`: web target 실행
- `npm run lint`: Expo lint 실행
- `npm run typecheck`: TypeScript 검증

## M5 QA Docs

- [iPad and accessibility spec](docs/m5-ipad-accessibility-spec.md)
- [Mobile smoke checklist](docs/smoke-checklist.md)

## M6 QA Docs

- [Native smoke repeatability](docs/m6-native-smoke-repeatability.md)

## 다음 작업 리스트

M8 이후 추천 순서:

1. M9 Release readiness baseline
   - 앱 메타데이터, 아이콘/splash asset, bundle identifier, build profile 방향을 확인한다.
   - 첫 모바일 산출물을 Expo Go 검증, local native build, EAS build 중 어디까지로 둘지 결정한다.
   - 명시 요청 전까지 broker 연동, 실시간 시세, 인증은 범위에 포함하지 않는다.

## Current Scope

- Dashboard, Snapshots, Add, Compare 탭 셸
- `@investment/domain` 공유 로직 import 검증
- `expo-sqlite` 기반 로컬 migration/seed
- 스냅샷 목록, 집계, 비교 데이터 조회
- 스냅샷 생성, 수정, 삭제
- 월 선택과 스냅샷 목록 필터
- CSV 가져오기
- 현재 필터 결과 CSV 내보내기

## Stack

- Expo SDK 55
- React Native 0.83
- Expo Router
- TypeScript strict
