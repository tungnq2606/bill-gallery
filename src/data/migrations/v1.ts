import type { SQLiteDatabase } from 'expo-sqlite';

export const migrateV1 = async (db: SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS persons (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, initials TEXT NOT NULL,
      avatar_color TEXT NOT NULL, phone TEXT, email TEXT, is_me INTEGER DEFAULT 0,
      remote_id TEXT, sync_status TEXT DEFAULT 'local',
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, deleted_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, color TEXT NOT NULL, icon TEXT,
      remote_id TEXT, sync_status TEXT DEFAULT 'local',
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, deleted_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS group_members (
      group_id TEXT NOT NULL REFERENCES groups(id),
      person_id TEXT NOT NULL REFERENCES persons(id),
      role TEXT DEFAULT 'member', joined_at INTEGER NOT NULL,
      PRIMARY KEY (group_id, person_id)
    );

    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, cover_color TEXT NOT NULL,
      cover_image_uri TEXT, start_date TEXT, end_date TEXT,
      group_id TEXT REFERENCES groups(id), budget INTEGER, currency TEXT DEFAULT 'VND',
      remote_id TEXT, sync_status TEXT DEFAULT 'local',
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, deleted_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, icon TEXT NOT NULL, color TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0, is_system INTEGER DEFAULT 0, created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY, type TEXT NOT NULL, status TEXT DEFAULT 'unsettled',
      amount INTEGER NOT NULL, currency TEXT DEFAULT 'VND', exchange_rate REAL,
      merchant TEXT, date TEXT NOT NULL, location TEXT, latitude REAL, longitude REAL,
      note TEXT, category_id TEXT REFERENCES categories(id),
      trip_id TEXT REFERENCES trips(id), group_id TEXT REFERENCES groups(id),
      transfer_sender TEXT, transfer_receiver TEXT, transfer_bank TEXT, transfer_ref TEXT,
      ocr_confidence REAL, ocr_raw_text TEXT,
      remote_id TEXT, sync_status TEXT DEFAULT 'local',
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, deleted_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS bill_items (
      id TEXT PRIMARY KEY, bill_id TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
      name TEXT NOT NULL, amount INTEGER NOT NULL, quantity INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0, created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bill_attachments (
      id TEXT PRIMARY KEY, bill_id TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
      uri TEXT NOT NULL, type TEXT DEFAULT 'image', width INTEGER, height INTEGER,
      thumbnail_uri TEXT, is_primary INTEGER DEFAULT 0, sort_order INTEGER DEFAULT 0,
      remote_url TEXT, created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS splits (
      id TEXT PRIMARY KEY,
      bill_id TEXT NOT NULL UNIQUE REFERENCES bills(id) ON DELETE CASCADE,
      payer_id TEXT NOT NULL REFERENCES persons(id),
      split_type TEXT DEFAULT 'equal',
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS split_shares (
      id TEXT PRIMARY KEY, split_id TEXT NOT NULL REFERENCES splits(id) ON DELETE CASCADE,
      person_id TEXT NOT NULL REFERENCES persons(id),
      amount INTEGER NOT NULL, percent REAL, shares INTEGER,
      status TEXT DEFAULT 'unpaid', paid_amount INTEGER DEFAULT 0, paid_at INTEGER,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payment_records (
      id TEXT PRIMARY KEY,
      split_share_id TEXT NOT NULL REFERENCES split_shares(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL, method TEXT, note TEXT, evidence_uri TEXT,
      recorded_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(date DESC);
    CREATE INDEX IF NOT EXISTS idx_bills_trip ON bills(trip_id) WHERE trip_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
    CREATE INDEX IF NOT EXISTS idx_bills_active ON bills(deleted_at) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_bill_items_bill ON bill_items(bill_id);
    CREATE INDEX IF NOT EXISTS idx_bill_attachments_bill ON bill_attachments(bill_id);
    CREATE INDEX IF NOT EXISTS idx_splits_bill ON splits(bill_id);
    CREATE INDEX IF NOT EXISTS idx_split_shares_split ON split_shares(split_id);
    CREATE INDEX IF NOT EXISTS idx_split_shares_person ON split_shares(person_id);

    INSERT OR IGNORE INTO categories (id, name, icon, color, sort_order, is_system, created_at) VALUES
      ('cat-food', 'Ăn uống', '🍜', '#F76707', 0, 1, 0),
      ('cat-transport', 'Di chuyển', '🚗', '#4C6EF5', 1, 1, 0),
      ('cat-shopping', 'Mua sắm', '🛍️', '#E64980', 2, 1, 0),
      ('cat-entertainment', 'Giải trí', '🎬', '#7950F2', 3, 1, 0),
      ('cat-accommodation', 'Lưu trú', '🏨', '#20C997', 4, 1, 0),
      ('cat-utilities', 'Tiện ích', '💡', '#FCC419', 5, 1, 0),
      ('cat-health', 'Sức khỏe', '💊', '#FA5252', 6, 1, 0),
      ('cat-other', 'Khác', '📦', '#868E96', 7, 1, 0);
  `);
};
