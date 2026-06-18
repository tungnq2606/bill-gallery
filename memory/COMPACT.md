# Compact Context

> **Agent**: Read this FIRST on session start. Max 30 lines.
> **Update**: Agent refreshes this every session end.

## Project

Bill Gallery — React Native (Expo SDK 56) · TypeScript strict · Expo Router · Zustand · expo-sqlite · expo-camera · react-native-mlkit-ocr
Personal mobile app: save bill photos, OCR amounts, split expenses, track who owes who. Local-first, no account required.

## Active Task

Design spec complete. Implementation plan pending user approval.
Plan file: `docs/specs/2026-06-18-bill-gallery-app-design.md`

## Critical Rules (top 5 lessons)

1. Never use `any` — define proper types for all bill/split/person models
2. Repository pattern — screens call repos, never SQLite directly
3. Amounts as integers — VND has no decimals, store 147000 not 147.000
4. Image paths — always use `expo-file-system` documentDirectory, never hardcode
5. Soft deletes — all main tables use `deleted_at` for future cloud sync

## Blockers

(none)

## Last Session

2026-06-18: Brainstorming complete → design spec written → Expo project initialized (SDK 56, RN 0.85)
