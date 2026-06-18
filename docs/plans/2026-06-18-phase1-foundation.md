# Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Set up the Expo project foundation — theme, shared components, database — so Phase 2 screens can be built in parallel.

**Architecture:** Expo SDK 56 with Expo Router file-based navigation. Design system as theme tokens + shared components. SQLite via expo-sqlite with repository pattern.

**Tech Stack:** React Native 0.85.3 · Expo SDK 56 · TypeScript 6.0 strict · Expo Router · Zustand · expo-sqlite

**Spec Reference:** `docs/specs/2026-06-18-bill-gallery-app-design.md`

**3 Parallel Tasks:**
1. **Task 1: Project Setup** — Dependencies, fonts, Expo Router tabs, cleanup template files
2. **Task 2: Design System** — Theme tokens (colors, typography, spacing, shadows) + 12 shared components
3. **Task 3: Database Layer** — SQLite schema, migrations, 6 repositories, utility functions

---

> The full detailed plan with exact code for every step was presented inline in the conversation above. This file serves as the plan summary and checkpoint tracker. See the conversation for complete code blocks.

## Task 1: Project Setup

- [ ] 1.1: Install core deps (`expo-sqlite`, `zustand`, `@shopify/flash-list`, etc.)
- [ ] 1.2: Install dev deps (`@types/uuid`)
- [ ] 2.1: Download Outfit fonts (5 weights)
- [ ] 3.1: Remove default template files
- [ ] 4.1: Write root layout (`src/app/_layout.tsx`) with font loading
- [ ] 5.1: Create tabs layout (`src/app/(tabs)/_layout.tsx`)
- [ ] 5.2: Create placeholder tab screens (Gallery, Trips, Summary)
- [ ] 6.1: Type check (`npx tsc --noEmit`)
- [ ] 6.2: Start Expo & verify 3 tabs
- [ ] 6.3: Git init + commit

## Task 2: Design System

- [ ] 1.1: Create `src/shared/theme/colors.ts`
- [ ] 1.2: Create `src/shared/theme/typography.ts`
- [ ] 1.3: Create `src/shared/theme/spacing.ts`
- [ ] 1.4: Create `src/shared/theme/shadows.ts`
- [ ] 1.5: Create `src/shared/theme/index.ts` barrel
- [ ] 1.6: Commit theme
- [ ] 2.1: Create Button component
- [ ] 2.2: Create Avatar component
- [ ] 2.3: Create Card, Chip, Badge, StatusDot, SegmentedControl, TextField, ListRow, PersonRow, FAB, ScreenHeader
- [ ] 2.4: Create `src/shared/components/index.ts` barrel
- [ ] 2.5: Type check
- [ ] 2.6: Commit components

## Task 3: Database Layer

- [ ] 1.1: Create `src/utils/id.ts`
- [ ] 1.2: Create `src/utils/currency.ts`
- [ ] 1.3: Create `src/utils/date.ts`
- [ ] 2.1: Create `src/data/types.ts` (all data model interfaces)
- [ ] 3.1: Create `src/data/migrations/v1.ts` (full schema + seed categories)
- [ ] 3.2: Create `src/data/migrations/index.ts` (migration runner)
- [ ] 3.3: Create `src/data/db.ts` (connection + WAL mode)
- [ ] 4.1: Create personRepo
- [ ] 4.2: Create billRepo
- [ ] 4.3: Create tripRepo, splitRepo, categoryRepo, groupRepo
- [ ] 4.4: Create barrel exports
- [ ] 4.5: Type check
- [ ] 4.6: Commit database layer

## Final Verification

- [ ] Full type check: `npx tsc --noEmit` → 0 errors
- [ ] Start Expo: `npx expo start --ios` → app launches with 3 tabs
- [ ] Final commit: `git add -A && git commit -m "feat: Phase 1 Foundation complete"`
