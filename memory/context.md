# Project Context

> This file reflects current project state. AI agents MUST update this when starting/completing tasks. Can be overwritten (not append-only). **Max 100 lines** — keep it compact.

## Current Focus

Implementation plan creation — translating design spec into phased execution plan.

## Recently Completed

- [x] UI/UX prototype (index.html — taste-skill redesign)
- [x] Brainstorming: architecture, DB schema, phasing
- [x] Design spec: `docs/specs/2026-06-18-bill-gallery-app-design.md`
- [x] Expo project init (SDK 56, RN 0.85, Expo Router)

## Known Issues

- Default Expo template files still in `src/app/` — need to replace with our screen structure
- No git init yet in this directory
- HTML prototype (`index.html`) coexists with new RN project — keep as reference

## Tech Stack Summary

- **Runtime**: React Native 0.85.3
- **Framework**: Expo SDK 56.0.12 (managed workflow)
- **Language**: TypeScript 6.0.3 (strict mode)
- **Navigation**: Expo Router 56.2.11
- **State**: Zustand (to be installed)
- **Database**: expo-sqlite (to be installed)
- **Camera**: expo-camera (to be installed)
- **OCR**: react-native-mlkit-ocr (to be installed)
- **UI**: expo-image, expo-glass-effect, react-native-reanimated 4.3.1
- **Lists**: @shopify/flash-list (to be installed)
- **Bottom Sheet**: @gorhom/bottom-sheet (to be installed)

## Scripts

```sh
npm start        # Start Expo dev server
npm run ios      # Start on iOS simulator
npm run android  # Start on Android emulator
npm run web      # Start web version
npm run lint     # Run ESLint
```

## Session Log (last 5 sessions)

- **2026-06-18 13:30**: Brainstorming → design spec → Expo init. Agent config files updated.
