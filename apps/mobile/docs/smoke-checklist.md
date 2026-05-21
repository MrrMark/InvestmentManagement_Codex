# Mobile Smoke Checklist

## Required Commands

Run these from the repository root unless noted.

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

## Local Web Smoke

Use Expo web export when a native simulator is not available.

```bash
cd apps/mobile
npx expo export --platform web --output-dir /private/tmp/investment-mobile-smoke
python3 -m http.server 8082 --directory /private/tmp/investment-mobile-smoke
```

Check these routes at iPhone, iPad portrait, and iPad landscape widths:

- `/`
- `/snapshots`
- `/add`
- `/compare`
- `/snapshots/[id]/edit` when an editable id is available

Look for:

- no clipped tab labels, buttons, or filter chips
- no overlap between long asset names and large amounts
- Add/Edit form remains centered and readable on iPad
- CSV import panel buttons and preview rows wrap cleanly
- empty, error, and result states are visible and readable

## Native iOS Smoke

Native smoke requires Xcode command line tools with `xcrun simctl`.

```bash
xcrun simctl list devices available
cd apps/mobile
npm run ios
```

Suggested devices:

- iPhone current default simulator
- iPad portrait
- iPad landscape

Accessibility checks:

- enable larger Dynamic Type and revisit Dashboard, Snapshots, Add, Compare, Edit
- with VoiceOver, verify tabs, month chips, filters, inputs, save/delete/export/import actions, and empty states have meaningful names
- verify disabled actions are announced as disabled where applicable
