# Investment Snapshots Mobile

iPhone/iPad용 월간 자산 스냅샷 앱입니다. 현재 단계는 Expo Router 기반 모바일 셸과 공유 domain 패키지 연결을 검증하는 스캐폴드입니다.

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

## Current Scope

- Dashboard, Snapshots, Add, Compare 탭 셸
- `@investment/domain` 공유 로직 import 검증
- 샘플 데이터 기반 집계/비교 표시
- 로컬 SQLite 저장소는 다음 단계에서 추가

## Stack

- Expo SDK 55
- React Native 0.83
- Expo Router
- TypeScript strict
