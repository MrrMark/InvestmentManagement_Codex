# M9 Release Readiness Baseline

## Scope

M9는 모바일 MVP의 첫 산출물 기준을 정리한다. 현재 앱은 iPhone/iPad용 수동 월간 스냅샷 앱이며, broker 연동, 실시간 시세, 인증, App Store 제출 준비는 이 기준선에 포함하지 않는다.

## App Metadata Baseline

Current Expo metadata in `app.json`:

- Name: `Investment Snapshots`
- Slug: `investment-snapshots`
- Version: `1.0.0`
- Scheme: `investment-snapshots`
- Orientation: `default`
- User interface style: `automatic`
- iOS bundle identifier: `com.mrrmark.investmentsnapshots`
- iPad support: enabled with `ios.supportsTablet`

The Android adaptive icon assets are present, but Android release packaging is not part of the first mobile target unless explicitly requested.

## Asset Baseline

Current image assets:

- App icon: `assets/images/icon.png`, 1024 x 1024 PNG
- Splash image: `assets/images/splash-icon.png`, 1024 x 1024 PNG
- Web favicon: `assets/images/favicon.png`, 48 x 48 PNG
- Android foreground icon: `assets/images/android-icon-foreground.png`, 512 x 512 PNG
- Android background icon: `assets/images/android-icon-background.png`, 512 x 512 PNG
- Android monochrome icon: `assets/images/android-icon-monochrome.png`, 432 x 432 PNG

The splash screen uses the configured image at width `200`, contain resize mode, white light background, and black dark background.

## First Artifact Decision

For the current MVP, the first mobile readiness target is:

1. Expo Go verification
2. Local iPhone/iPad Simulator smoke
3. Static web export smoke as a fallback

2026-06-01 decision: keep the first readiness target non-installable for the next cycle. SQLite migration/seed/repository regression checks and CSV native file I/O smoke evidence are now documented; defer local native build until the privacy/store readiness draft is reviewed.

Do not add EAS build requirements or CI Simulator requirements yet. Add `eas.json`, credentials setup, or store build profiles only after deciding to produce a local native build or EAS build artifact.

## Release Readiness Checks

Run these before treating the mobile app as release-baseline ready:

```bash
npm test
npm run test:mobile
npm run build
cd apps/mobile && npm run typecheck
cd apps/mobile && npm run lint
cd apps/mobile && npx expo-doctor@latest
cd apps/mobile && npx expo config --type public
cd apps/mobile && npx expo export --platform web --output-dir /private/tmp/investment-mobile-release-web
xcrun simctl list devices available
cd apps/mobile && npm run ios
# iPad fallback when localhost/openurl is unreliable:
cd apps/mobile && npm run ios -- --lan --port 8085
git diff --check
git diff --cached --check
```

For the native smoke details, use [M6 Native Smoke Repeatability](m6-native-smoke-repeatability.md).

## Deferred Release Work

Before an App Store or TestFlight path, decide these explicitly:

- Apple Developer team and signing identity
- App Store privacy labels and screenshots
- Whether the first installable artifact is local native build or EAS build
- Whether Android package metadata should be completed
- Whether SQLite backup/export expectations need additional user-facing copy
