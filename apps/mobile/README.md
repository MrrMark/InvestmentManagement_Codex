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

## M8 QA Docs

- [Smoke and accessibility evidence](docs/m8-smoke-accessibility-evidence.md)

## M9 QA Docs

- [Release readiness baseline](docs/m9-release-readiness-baseline.md)

## 진행 상태

- M6 Native smoke repeatability 완료
- M7 Mobile data safety polish 완료
- M8 Mobile usability regression pass 완료
- M9 Release readiness baseline 완료

후속 릴리즈 작업은 local native build, EAS build, TestFlight/App Store 제출 중 어느 산출물을 목표로 할지 결정한 뒤 별도 범위로 진행합니다.

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
