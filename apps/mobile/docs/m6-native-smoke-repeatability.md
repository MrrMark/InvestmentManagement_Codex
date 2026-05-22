# M6 Native Smoke Repeatability

## Scope

M6는 새 로컬 환경에서도 iPhone/iPad Simulator smoke를 같은 순서로 반복할 수 있게 정리한다. 이 문서는 로컬 검증 절차만 다루며, CI에 iOS Simulator 요구사항을 추가하지 않는다.

## Preconditions

Run these from the repository root unless noted.

```bash
git status --short --branch
npm install
xcodebuild -version
xcrun simctl list devices available
```

Expected baseline:

- `git status --short --branch` shows a clean working tree.
- Xcode command line tools are available.
- `xcrun simctl list devices available` lists at least one iPhone simulator and one iPad simulator.
- `npm install` completes before native smoke starts in a fresh checkout.

## Baseline Checks

Run the lightweight mobile checks before opening Simulator:

```bash
cd apps/mobile
npm run typecheck
npm run lint
```

Use the broader root checks from `docs/smoke-checklist.md` when the change affects shared domain logic, build output, or release readiness.

## Native Smoke Run

Start with the default iPhone simulator:

```bash
cd apps/mobile
npm run ios
```

If Expo prompts to open or install Expo Go, allow it and wait for the app to load. Keep Metro running while checking the app.

For iPad verification:

1. Open an available iPad simulator from the Simulator app.
2. Stop the previous Metro session with `Ctrl-C` if the app remains attached to the iPhone simulator.
3. Run `npm run ios` again from `apps/mobile`.
4. Check iPad portrait.
5. Rotate the simulator with Simulator's Device menu and check iPad landscape.

Suggested minimum device matrix:

- One current iPhone simulator
- One current iPad simulator in portrait
- The same iPad simulator in landscape

## Smoke Checklist

Check these routes on each target:

- `/`
- `/snapshots`
- `/add`
- `/compare`
- `/snapshots/[id]/edit` when an editable row is available

Look for:

- no clipped tab labels, buttons, filter chips, or action text
- no overlap between long asset names and large amounts
- Add/Edit form remains readable on iPhone and iPad
- CSV import preview and error text wrap cleanly
- empty, loading, error, and result states remain visible

## Accessibility Pass

At least once per native smoke cycle:

1. Increase Dynamic Type in the simulator settings.
2. Revisit Dashboard, Snapshots, Add, Compare, and Edit.
3. Enable VoiceOver and verify tabs, month chips, filters, inputs, save/delete/export/import actions, and empty states have meaningful names.
4. Return Dynamic Type and VoiceOver to the default settings before ending the run.

## Evidence Template

Use this short note in PR descriptions or local QA notes:

```text
Native smoke:
- Xcode:
- iPhone simulator:
- iPad simulator:
- Dynamic Type:
- VoiceOver:
- Result:
```

Record the exact simulator names from `xcrun simctl list devices available` when possible. If native smoke cannot run locally, include the blocker and run the web fallback from `docs/smoke-checklist.md`.
