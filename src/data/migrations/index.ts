import type { SQLiteDatabase } from 'expo-sqlite';
import { migrateV1 } from './v1';

const MIGRATIONS = [
  { version: 1, migrate: migrateV1 },
];

export const runMigrations = async (db: SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      applied_at INTEGER NOT NULL
    );
  `);

  const result = await db.getFirstAsync<{ version: number }>(
    'SELECT MAX(version) as version FROM _migrations'
  );
  const currentVersion = result?.version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      await migration.migrate(db);
      await db.runAsync(
        'INSERT INTO _migrations (version, applied_at) VALUES (?, ?)',
        migration.version, Date.now()
      );
    }
  }
};
