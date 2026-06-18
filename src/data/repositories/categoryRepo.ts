import { getDb } from '../db';
import type { Category } from '../types';

export const categoryRepo = {
  async getAll(): Promise<Category[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM categories ORDER BY sort_order'
    );
    return rows.map(mapCategory);
  },
};

const mapCategory = (row: Record<string, unknown>): Category => ({
  id: row.id as string, name: row.name as string, icon: row.icon as string,
  color: row.color as string, sortOrder: row.sort_order as number,
  isSystem: (row.is_system as number) === 1, createdAt: row.created_at as number,
});
