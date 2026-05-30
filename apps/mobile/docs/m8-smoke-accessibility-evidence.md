# M8 Smoke and Accessibility Evidence

작성 기준일: 2026-05-30

## Scope

M8 이후 모바일 smoke와 접근성 회귀 여부를 확인했다. 이 문서는 로컬 검증 결과만 기록하며, CI에 iOS Simulator 요구사항을 추가하지 않는다.

## Environment

- Xcode: 26.5, build 17F42
- iPhone simulator: iPhone 17 Pro, iOS 26.5
- iPad simulator: iPad Pro 11-inch (M5), iOS 26.5
- Expo runtime: Expo Go, SDK 55

## Command Checks

아래 명령을 통과했다.

```bash
npm test
npm run build
cd apps/mobile && npm run typecheck
cd apps/mobile && npm run lint
cd apps/mobile && npx expo-doctor@latest
cd apps/mobile && npx expo export --platform web --output-dir dist
git diff --check
```

## Native iPhone Smoke

`cd apps/mobile && npm run ios`로 iPhone 17 Pro simulator에서 Expo Go를 설치하고 앱을 실행했다.

확인 결과:

- Dashboard가 로드된다.
- 월 선택 chip, 총 자산, 상위 자산, 계좌/시장/자산군 카드가 표시된다.
- Expo Go 안내 modal을 닫은 뒤 주요 접근성 label이 Simulator accessibility tree에 노출된다.
- 탭, 월 chip, 필터 chip, 입력, 수정/삭제 action의 accessible name이 확인된다.

Dynamic Type:

- `xcrun simctl ui booted content_size accessibility-extra-large`로 확대 후 Dashboard와 Snapshots를 확인했다.
- 고정 `lineHeight`로 인한 텍스트 clipping을 제거했다.
- 월 선택 chip, 필터 chip, form option chip, 주요 action button은 control text scale 상한을 두어 화면 밖으로 밀리지 않게 했다.
- 확인 후 `xcrun simctl ui booted content_size large`로 되돌렸다.

## Native iPad Smoke

iPad Pro 11-inch (M5) simulator를 boot한 뒤 `cd apps/mobile && npm run ios`를 실행했다.

초기 결과:

- Expo Go 설치는 진행됐다.
- `xcrun simctl openurl ... exp://...` 단계가 timeout으로 실패했다.
- iPad 화면은 Expo Go의 "Could not connect to the server" 상태로 남았다.

Blocker:

```text
xcrun simctl openurl CF98DF53-BA0B-4AE5-92DE-2431925FB1B8 exp://192.168.35.160:8081 exited with non-zero code: 60
Simulator device failed to open exp://192.168.35.160:8081.
Operation timed out
```

이 blocker 때문에 이번 cycle에서는 iPad native route smoke를 완료하지 못했고, web fallback으로 iPad portrait/landscape 폭을 확인했다.

### Recheck

같은 iPad Pro 11-inch (M5) simulator에서 native smoke를 재검증했다.

```bash
cd apps/mobile
npm run ios -- --lan --port 8085
```

결과:

- Expo Go가 `exp://192.168.35.160:8085`를 열고 iOS bundle을 로드했다.
- Dashboard, Snapshots, Add, Compare 탭이 iPad portrait에서 표시됐다.
- Compare 화면을 iPad landscape로 회전해도 카드와 탭이 겹치지 않았다.
- Simulator accessibility tree에서 month chip, filter chip, input, save/delete/export/import action, tab label이 확인됐다.

참고:

- `npm run ios -- --localhost --port 8083`는 `exp://127.0.0.1:8083`을 열었지만 Expo Go 내부 bundle URL도 `127.0.0.1`로 잡혀 development server 연결에 실패했다.
- 이 로컬 환경에서는 iPad native smoke에 `--lan` 모드가 더 안정적이었다.

## Web Fallback Smoke

Expo web export 결과를 local fallback server로 띄워 아래 경로를 확인했다.

- `/`
- `/snapshots`
- `/add`
- `/compare`

확인 폭:

- iPhone width: 390 px
- iPad portrait width: 820 px
- iPad landscape width: 1180 px

결과:

- 모든 경로가 unmatched route 없이 렌더링됐다.
- 모든 확인 폭에서 horizontal overflow가 `0`이었다.
- Snapshots filter chip과 form option chip은 줄바꿈된다.
- Dashboard/Compare 금액 행은 확대 텍스트에서 clipping 없이 표시된다.

## Follow-up

- iPad native `openurl` timeout은 LAN 모드 재검증에서 해소됐다. 다음 native smoke cycle에서도 iPad는 `npm run ios -- --lan --port <free-port>` 경로를 우선 사용한다.
- TestFlight 또는 EAS build 단계로 넘어가기 전에는 실제 iPad 설치 smoke를 별도 evidence로 남긴다.
