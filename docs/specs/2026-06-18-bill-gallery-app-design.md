# Bill Gallery — App Design Specification

> **Mục tiêu:** Implement Bill Gallery từ HTML prototype thành React Native app thật, chạy trên iOS + Android.
>
> **Tóm tắt:** App cá nhân để lưu ảnh hóa đơn/chuyển khoản, nhận diện OCR, chia tiền, theo dõi ai nợ ai. Local-first, không cần account.

---

## 1. Decisions

| Quyết định | Lựa chọn |
|---|---|
| Platform | React Native |
| Framework | Expo (managed workflow) |
| Storage | Local-first (SQLite), cloud sync sau |
| OCR | Google ML Kit (on-device, free, offline) |
| Navigation | Expo Router (file-based) |
| State Management | Zustand |
| Target | iOS + Android |
| Architecture | Approach A+ — Monolith phân layer + Repository pattern |

---

## 2. Project Structure

```
bill-gallery/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root Stack navigator
│   ├── onboarding.tsx          # First-launch onboarding
│   ├── (tabs)/                 # Tab layout
│   │   ├── _layout.tsx         # Tab navigator config (custom tab bar)
│   │   ├── index.tsx           # Gallery home
│   │   ├── trips.tsx           # Trips list
│   │   └── summary.tsx         # Summary dashboard
│   ├── scan.tsx                # Camera scan (fullscreen, no tab bar)
│   ├── review.tsx              # Review OCR result + edit form
│   ├── split.tsx               # Split bill
│   ├── bill/
│   │   └── [id].tsx            # Bill detail
│   └── trip/
│       └── [id].tsx            # Trip detail (filtered gallery)
├── src/
│   ├── data/                   # Data layer
│   │   ├── db.ts               # SQLite connection (expo-sqlite)
│   │   ├── schema.ts           # Table definitions
│   │   ├── migrations/         # Versioned DB migrations
│   │   │   ├── index.ts
│   │   │   └── v1.ts
│   │   └── repositories/       # Repository pattern (abstract DB access)
│   │       ├── types.ts        # Repository interfaces
│   │       ├── billRepo.ts
│   │       ├── tripRepo.ts
│   │       ├── personRepo.ts
│   │       ├── splitRepo.ts
│   │       ├── categoryRepo.ts
│   │       └── groupRepo.ts
│   ├── stores/                 # Zustand stores (UI state only)
│   │   ├── billStore.ts        # Gallery filters, selected bill
│   │   ├── tripStore.ts        # Active trip
│   │   ├── splitStore.ts       # Split form state
│   │   └── uiStore.ts         # Onboarding, modals, tabs
│   ├── features/               # Feature-specific components & hooks
│   │   ├── gallery/
│   │   │   ├── BillTile.tsx
│   │   │   ├── GalleryGrid.tsx
│   │   │   ├── MonthSection.tsx
│   │   │   └── FilterChips.tsx
│   │   ├── scan/
│   │   │   ├── CameraView.tsx
│   │   │   ├── ScanFrame.tsx
│   │   │   └── useOCR.ts
│   │   ├── split/
│   │   │   ├── PayerSelector.tsx
│   │   │   ├── ParticipantChips.tsx
│   │   │   ├── SplitAmounts.tsx
│   │   │   ├── SplitSummary.tsx
│   │   │   └── useSplitCalculator.ts
│   │   ├── detail/
│   │   │   ├── DetailHeader.tsx
│   │   │   ├── SplitSection.tsx
│   │   │   └── PersonRow.tsx
│   │   ├── trips/
│   │   │   ├── TripCard.tsx
│   │   │   └── CreateTripSheet.tsx
│   │   ├── summary/
│   │   │   ├── SpendingHero.tsx
│   │   │   ├── StatGrid.tsx
│   │   │   └── BalanceList.tsx
│   │   └── onboarding/
│   │       ├── OnboardSlide.tsx
│   │       └── OnboardIllustration.tsx
│   ├── shared/                 # Shared design system
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Chip.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── SegmentedControl.tsx
│   │   │   ├── TextField.tsx
│   │   │   ├── ListRow.tsx
│   │   │   ├── FAB.tsx
│   │   │   ├── TabBar.tsx
│   │   │   ├── StatusDot.tsx
│   │   │   └── ScreenHeader.tsx
│   │   ├── theme/
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   ├── spacing.ts
│   │   │   ├── shadows.ts
│   │   │   └── index.ts
│   │   └── hooks/
│   │       ├── useImagePicker.ts
│   │       └── useFormatCurrency.ts
│   └── utils/
│       ├── currency.ts         # Format 147000 → "147.000 ₫"
│       ├── date.ts             # Format dates
│       ├── id.ts               # UUID generation
│       ├── ocr-parser.ts       # Parse ML Kit output → structured data
│       └── balance-calculator.ts # Net balance calculation
├── assets/
│   ├── fonts/
│   │   └── Outfit-*.ttf       # Outfit font family
│   └── images/
├── app.json                    # Expo config
├── package.json
└── tsconfig.json
```

---

## 3. Data Models (SQLite Schema)

### 3.1 Sync Infrastructure
Mọi bảng chính đều có:
- `id TEXT PRIMARY KEY` — UUIDv4 (client-generated, sync-friendly)
- `remote_id TEXT` — server ID khi có cloud sync
- `sync_status TEXT DEFAULT 'local'` — 'local' | 'synced' | 'pending'
- `created_at INTEGER NOT NULL` — Unix timestamp (ms)
- `updated_at INTEGER NOT NULL` — Unix timestamp (ms)
- `deleted_at INTEGER` — Soft delete timestamp

### 3.2 Tables

```sql
-- Người tham gia (local contacts)
CREATE TABLE persons (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  initials        TEXT NOT NULL,
  avatar_color    TEXT NOT NULL,
  phone           TEXT,
  email           TEXT,
  is_me           INTEGER DEFAULT 0,
  remote_id       TEXT,
  sync_status     TEXT DEFAULT 'local',
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL,
  deleted_at      INTEGER
);

-- Nhóm chi tiêu
CREATE TABLE groups (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  color           TEXT NOT NULL,
  icon            TEXT,
  remote_id       TEXT,
  sync_status     TEXT DEFAULT 'local',
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL,
  deleted_at      INTEGER
);

CREATE TABLE group_members (
  group_id        TEXT NOT NULL REFERENCES groups(id),
  person_id       TEXT NOT NULL REFERENCES persons(id),
  role            TEXT DEFAULT 'member',
  joined_at       INTEGER NOT NULL,
  PRIMARY KEY (group_id, person_id)
);

-- Chuyến đi
CREATE TABLE trips (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  cover_color     TEXT NOT NULL,
  cover_image_uri TEXT,
  start_date      TEXT,
  end_date        TEXT,
  group_id        TEXT REFERENCES groups(id),
  budget          INTEGER,
  currency        TEXT DEFAULT 'VND',
  remote_id       TEXT,
  sync_status     TEXT DEFAULT 'local',
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL,
  deleted_at      INTEGER
);

-- Phân loại
CREATE TABLE categories (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  icon            TEXT NOT NULL,
  color           TEXT NOT NULL,
  sort_order      INTEGER DEFAULT 0,
  is_system       INTEGER DEFAULT 0,
  created_at      INTEGER NOT NULL
);

-- Hóa đơn
CREATE TABLE bills (
  id              TEXT PRIMARY KEY,
  type            TEXT NOT NULL CHECK(type IN ('receipt','transfer','manual')),
  status          TEXT DEFAULT 'unsettled' CHECK(status IN ('settled','unsettled','partial')),
  amount          INTEGER NOT NULL,
  currency        TEXT DEFAULT 'VND',
  exchange_rate   REAL,
  merchant        TEXT,
  date            TEXT NOT NULL,
  location        TEXT,
  latitude        REAL,
  longitude       REAL,
  note            TEXT,
  category_id     TEXT REFERENCES categories(id),
  trip_id         TEXT REFERENCES trips(id),
  group_id        TEXT REFERENCES groups(id),
  transfer_sender   TEXT,
  transfer_receiver TEXT,
  transfer_bank     TEXT,
  transfer_ref      TEXT,
  ocr_confidence  REAL,
  ocr_raw_text    TEXT,
  remote_id       TEXT,
  sync_status     TEXT DEFAULT 'local',
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL,
  deleted_at      INTEGER
);

-- Line items
CREATE TABLE bill_items (
  id              TEXT PRIMARY KEY,
  bill_id         TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  amount          INTEGER NOT NULL,
  quantity        INTEGER DEFAULT 1,
  sort_order      INTEGER DEFAULT 0,
  created_at      INTEGER NOT NULL
);

-- Attachments (nhiều ảnh per bill)
CREATE TABLE bill_attachments (
  id              TEXT PRIMARY KEY,
  bill_id         TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  uri             TEXT NOT NULL,
  type            TEXT DEFAULT 'image',
  width           INTEGER,
  height          INTEGER,
  thumbnail_uri   TEXT,
  is_primary      INTEGER DEFAULT 0,
  sort_order      INTEGER DEFAULT 0,
  remote_url      TEXT,
  created_at      INTEGER NOT NULL
);

-- Split config
CREATE TABLE splits (
  id              TEXT PRIMARY KEY,
  bill_id         TEXT NOT NULL UNIQUE REFERENCES bills(id) ON DELETE CASCADE,
  payer_id        TEXT NOT NULL REFERENCES persons(id),
  split_type      TEXT DEFAULT 'equal' CHECK(split_type IN ('equal','custom','percent','shares')),
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

-- Split shares
CREATE TABLE split_shares (
  id              TEXT PRIMARY KEY,
  split_id        TEXT NOT NULL REFERENCES splits(id) ON DELETE CASCADE,
  person_id       TEXT NOT NULL REFERENCES persons(id),
  amount          INTEGER NOT NULL,
  percent         REAL,
  shares          INTEGER,
  status          TEXT DEFAULT 'unpaid' CHECK(status IN ('unpaid','paid','partial')),
  paid_amount     INTEGER DEFAULT 0,
  paid_at         INTEGER,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

-- Payment records
CREATE TABLE payment_records (
  id              TEXT PRIMARY KEY,
  split_share_id  TEXT NOT NULL REFERENCES split_shares(id) ON DELETE CASCADE,
  amount          INTEGER NOT NULL,
  method          TEXT,
  note            TEXT,
  evidence_uri    TEXT,
  recorded_at     INTEGER NOT NULL
);
```

### 3.3 Indexes
```sql
CREATE INDEX idx_bills_date ON bills(date DESC);
CREATE INDEX idx_bills_trip ON bills(trip_id) WHERE trip_id IS NOT NULL;
CREATE INDEX idx_bills_group ON bills(group_id) WHERE group_id IS NOT NULL;
CREATE INDEX idx_bills_category ON bills(category_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_active ON bills(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_bill_items_bill ON bill_items(bill_id);
CREATE INDEX idx_bill_attachments_bill ON bill_attachments(bill_id);
CREATE INDEX idx_splits_bill ON splits(bill_id);
CREATE INDEX idx_split_shares_split ON split_shares(split_id);
CREATE INDEX idx_split_shares_person ON split_shares(person_id);
CREATE INDEX idx_payment_records_share ON payment_records(split_share_id);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX idx_group_members_person ON group_members(person_id);
```

### 3.4 Seed Categories
```sql
INSERT INTO categories (id, name, icon, color, sort_order, is_system, created_at) VALUES
  ('cat-food', 'Ăn uống', '🍜', '#F76707', 0, 1, 0),
  ('cat-transport', 'Di chuyển', '🚗', '#4C6EF5', 1, 1, 0),
  ('cat-shopping', 'Mua sắm', '🛍️', '#E64980', 2, 1, 0),
  ('cat-entertainment', 'Giải trí', '🎬', '#7950F2', 3, 1, 0),
  ('cat-accommodation', 'Lưu trú', '🏨', '#20C997', 4, 1, 0),
  ('cat-utilities', 'Tiện ích', '💡', '#FCC419', 5, 1, 0),
  ('cat-health', 'Sức khỏe', '💊', '#FA5252', 6, 1, 0),
  ('cat-other', 'Khác', '📦', '#868E96', 7, 1, 0);
```

---

## 4. Navigation & Screen Flows

### 4.1 Root Layout
```
Stack Navigator (root)
  ├── Onboarding (conditional — first launch only, check AsyncStorage)
  └── (tabs) — Tab Navigator
        ├── Gallery (index)
        ├── Trips
        └── Summary
  ├── /scan — fullscreen modal (no tab bar)
  ├── /review — push stack
  ├── /split — push stack
  ├── /bill/[id] — push stack
  └── /trip/[id] — push stack
```

### 4.2 Key User Flows

**Flow 1: Scan & Save Bill**
```
Gallery → FAB → Bottom Sheet → "Scan paper bill"
  → /scan (camera viewfinder)
  → Chụp ảnh → auto-run OCR
  → /review (form pre-filled from OCR)
  → User sửa fields → "Continue to split"
  → /split (chọn payer, participants, split type)
  → "Save bill" → bill saved to SQLite → back to Gallery
```

**Flow 2: View & Manage Bill**
```
Gallery → Tap tile → /bill/[id]
  → Xem detail: amount, merchant, items, split info
  → Actions: "Mark as paid", "Share", "Edit", "Delete"
```

**Flow 3: Create Trip**
```
Trips tab → "+" button → Bottom Sheet (create trip form)
  → Nhập tên, chọn dates, chọn group/people, pick color
  → Save → trip appears in list
```

---

## 5. Core Features

### 5.1 Camera & OCR

**Dependencies:**
- `expo-camera` — camera access
- `expo-image-picker` — gallery import
- `react-native-mlkit-ocr` — on-device text recognition
- `expo-image-manipulator` — resize/crop/rotate
- `expo-file-system` — save images

**OCR Parser Logic (`ocr-parser.ts`):**
```
Input: ML Kit recognized text blocks (with bounding boxes)
Output: { merchant, items[], total, date, location }

Steps:
1. Tìm merchant: text block lớn nhất ở top (largest font heuristic)
2. Tìm total: regex cho "TỔNG|TOTAL|CỘNG" + số kế bên, hoặc số lớn nhất
3. Tìm items: dòng có pattern "text ... number" (left-right aligned)
4. Tìm date: regex dd/mm/yyyy, dd-mm-yyyy, ISO date
5. Return confidence score (0-1) dựa trên có tìm được bao nhiêu fields
```

### 5.2 Split Calculator

**Equal split:**
```
perPerson = Math.floor(totalAmount / numPeople)
remainder = totalAmount - (perPerson * numPeople)
// First person gets remainder (1-2 đồng difference)
```

**Custom split:** User nhập trực tiếp amount cho mỗi người. Validate tổng = bill amount.

**Percent split:** User nhập %, tính `amount = Math.round(totalAmount * percent / 100)`. Adjust rounding error on last person.

**Shares split:** User chọn multiplier (1x, 2x, 3x). `amount = totalAmount * myShares / totalShares`.

### 5.3 Balance Aggregation (Summary)

```
Cho mỗi person P (không phải "me"):
  netBalance = Σ(P owes me) - Σ(I owe P)
  Nếu netBalance > 0: P nợ mình
  Nếu netBalance < 0: mình nợ P
  Nếu netBalance = 0: hòa
```

### 5.4 Image Management

- **Capture:** Save full-res to `${FileSystem.documentDirectory}bills/{billId}/original.jpg`
- **Thumbnail:** Generate 300×400 thumbnail, save to `${FileSystem.documentDirectory}bills/{billId}/thumb.jpg`
- **Gallery tile:** Load thumbnail via `expo-image` (blurhash placeholder)
- **Detail view:** Load original full-res
- **Cleanup:** Delete image files when bill is hard-deleted

---

## 6. Design System (React Native)

### 6.1 Theme Tokens

```typescript
// src/shared/theme/colors.ts
export const colors = {
  white: '#FFFFFF',
  grey50: '#F8F9FA', grey100: '#F1F3F5', grey200: '#E9ECEF',
  grey300: '#DEE2E6', grey400: '#ADB5BD', grey500: '#868E96',
  grey600: '#6B7280', grey700: '#495057', grey800: '#343A40',
  grey900: '#1A1D26',

  indigo50: '#EDF2FF', indigo100: '#DBE4FF', indigo200: '#BAC8FF',
  indigo500: '#4C6EF5', indigo600: '#3B5BDB', indigo700: '#364FC7',

  green50: '#EBFBEE', green100: '#D3F9D8',
  green500: '#40C057', green600: '#2F9E44',

  orange50: '#FFF4E6', orange100: '#FFE8CC',
  orange500: '#FF922B', orange600: '#F76707',

  red500: '#FA5252',

  // Semantic
  accent: '#3B5BDB',
  accentHover: '#364FC7',
  accentSoft: '#EDF2FF',
  accentSoftText: '#364FC7',
  paid: '#2F9E44',
  paidBg: '#EBFBEE',
  unpaid: '#F76707',
  unpaidBg: '#FFF4E6',

  bgPage: '#F8F9FA',
  bgCard: '#FFFFFF',
  bgSunken: '#F1F3F5',
  bgOverlay: 'rgba(0,0,0,0.4)',

  textPrimary: '#1A1D26',
  textSecondary: '#6B7280',
  textTertiary: '#ADB5BD',

  border: 'rgba(0,0,0,0.06)',
  borderStrong: 'rgba(0,0,0,0.1)',
  separator: 'rgba(0,0,0,0.05)',
};

// src/shared/theme/typography.ts
export const typography = {
  displayXl: { fontFamily: 'Outfit-ExtraBold', fontSize: 42, lineHeight: 44, letterSpacing: -1.2 },
  displayLg: { fontFamily: 'Outfit-Bold', fontSize: 32, lineHeight: 35, letterSpacing: -0.6 },
  displayMd: { fontFamily: 'Outfit-Bold', fontSize: 24, lineHeight: 28, letterSpacing: -0.5 },
  title: { fontFamily: 'Outfit-Bold', fontSize: 20, lineHeight: 24, letterSpacing: -0.2 },
  headline: { fontFamily: 'System', fontSize: 16, lineHeight: 21, fontWeight: '600' },
  body: { fontFamily: 'System', fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: 'System', fontSize: 15, lineHeight: 22, fontWeight: '500' },
  callout: { fontFamily: 'System', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  caption: { fontFamily: 'System', fontSize: 12, lineHeight: 16, fontWeight: '500' },
  micro: { fontFamily: 'System', fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
};

// src/shared/theme/spacing.ts
export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40,
};

// src/shared/theme/shadows.ts (iOS/Android different APIs)
export const shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6 },
  fab: { shadowColor: '#3B5BDB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
};
```

### 6.2 Component Map

| Shared Component | Design Reference (HTML prototype) |
|---|---|
| `<Button variant size icon>` | `.btn .btn-primary .btn-secondary .btn-ghost .btn-outline` |
| `<Chip selected onPress>` | `.chip .selected` |
| `<Avatar size initials color>` | `.avatar .avatar-sm .avatar-md .avatar-lg` |
| `<Card pressable elevated>` | `.card .card-pressable` |
| `<StatusBadge status count>` | `.badge-paid .badge-unpaid` |
| `<SegmentedControl options selected>` | `.seg .seg-item` |
| `<TextField label icon value>` | `.field .field-box .field-input` |
| `<ListRow icon title subtitle trail>` | `.list-row` |
| `<PersonRow person amount status>` | `.person-row` |
| `<FAB icon onPress>` | `.fab` |
| `<StatusDot status>` | `.status-dot` |
| `<ScreenHeader title right back>` | `.gallery-header .split-header` |
| `<SectionLabel>` | `.section-label` |
| `<AmountHero amount currency>` | `.amount-hero` |

---

## 7. Dependencies

```json
{
  "expo": "~52.0.0",
  "expo-router": "~4.0.0",
  "expo-camera": "~16.0.0",
  "expo-image-picker": "~16.0.0",
  "expo-image": "~2.0.0",
  "expo-image-manipulator": "~13.0.0",
  "expo-file-system": "~18.0.0",
  "expo-font": "~13.0.0",
  "expo-sqlite": "~15.0.0",
  "expo-haptics": "~14.0.0",
  "expo-blur": "~14.0.0",
  "react-native-mlkit-ocr": "^0.4.0",
  "zustand": "^5.0.0",
  "@gorhom/bottom-sheet": "^5.0.0",
  "@shopify/flash-list": "^1.7.0",
  "react-native-reanimated": "~3.16.0",
  "react-native-gesture-handler": "~2.20.0",
  "uuid": "^10.0.0",
  "date-fns": "^4.0.0"
}
```

---

## 8. Phasing Strategy

### Phase 1: Foundation (3 sub-agents, song song)
> **Goal:** Project chạy được, có theme, có database.

- **1A: Project Setup** — `npx create-expo-app`, install deps, Expo Router config, TypeScript
- **1B: Design System** — Theme tokens, tất cả shared components (Button, Card, Avatar, Chip, etc.)
- **1C: Database** — SQLite setup, schema, migrations, repository layer, seed data

### Phase 2: Core Screens (4 sub-agents, song song)
> **Goal:** 4 tab screens hoạt động với mock data từ SQLite.

- **2A: Gallery Home** — Grid layout (FlashList), BillTile, MonthSection, FilterChips, FAB, TabBar
- **2B: Bill Detail** — Detail screen, receipt header, split section, actions
- **2C: Trips** — Trip list, TripCard, CreateTripSheet, Trip detail
- **2D: Summary** — SpendingHero, StatGrid, BalanceList

### Phase 3: Capture Flow (tuần tự, phụ thuộc Phase 1)
> **Goal:** Chụp ảnh → OCR → review → save bill.

- **3A: Camera Scan** — Camera viewfinder, capture, import from gallery
- **3B: OCR Integration** — ML Kit setup, ocr-parser, confidence scoring
- **3C: Review Screen** — Form pre-filled from OCR, edit, bill type segmented control

### Phase 4: Split & Balance (tuần tự, phụ thuộc Phase 2)
> **Goal:** Chia tiền hoạt động thật, tính balance.

- **4A: Split Bill Screen** — Payer selector, participant chips, split calculator
- **4B: Balance Logic** — Aggregation, net balance, settlement optimization
- **4C: Payment Tracking** — Mark paid, partial payment, payment history

### Phase 5: Polish (song song)
> **Goal:** App feel premium, production-ready.

- **5A: Onboarding** — 3-slide onboarding, setup "me" profile
- **5B: Animations** — Screen transitions, micro-interactions (Reanimated)
- **5C: Edge Cases** — Empty states, error handling, loading skeletons, haptic feedback

### Dependency Graph
```
Phase 1A ──┐
Phase 1B ──┼── Phase 2A, 2B, 2C, 2D (song song)
Phase 1C ──┘         │
                     ├── Phase 3A → 3B → 3C (tuần tự)
                     ├── Phase 4A → 4B → 4C (tuần tự)
                     └── Phase 5A, 5B, 5C (song song)
```

---

## 9. Testing Strategy

- **Unit tests:** Split calculator, OCR parser, currency formatter, balance aggregator
- **Integration tests:** Repository layer (SQLite queries)
- **Component tests:** Shared components (render + snapshot)
- **E2E:** Manual testing trên Expo Go (iOS + Android)

---

## 10. Future Considerations (Không trong scope hiện tại)

- Cloud sync (Supabase) — repository pattern sẵn sàng cho swap
- Push notifications — nhắc nhở người nợ tiền
- Export PDF/CSV — summary reports
- Widgets — iOS widget hiện tổng chi tiêu tháng
- Apple Watch — quick add bill
- Multi-language — i18n (hiện tại chỉ Vietnamese)
- Dark mode — theme tokens đã sẵn sàng cho swap
