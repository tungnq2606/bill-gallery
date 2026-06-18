import { getDb } from '../db';
import { generateId, now } from '@/utils/id';
import type { Group } from '../types';

export const groupRepo = {
  async getAll(): Promise<Group[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM groups WHERE deleted_at IS NULL ORDER BY name'
    );
    return rows.map(mapGroup);
  },

  async create(name: string, color: string, icon?: string): Promise<Group> {
    const db = await getDb();
    const id = generateId();
    const timestamp = now();
    await db.runAsync(
      `INSERT INTO groups (id, name, color, icon, sync_status, created_at, updated_at) VALUES (?, ?, ?, ?, 'local', ?, ?)`,
      id, name, color, icon ?? null, timestamp, timestamp
    );
    const group = await db.getFirstAsync<Record<string, unknown>>('SELECT * FROM groups WHERE id = ?', id);
    if (!group) throw new Error('Failed to create group');
    return mapGroup(group);
  },
};

const mapGroup = (row: Record<string, unknown>): Group => ({
  id: row.id as string, name: row.name as string, color: row.color as string,
  icon: row.icon as string | null, remoteId: row.remote_id as string | null,
  syncStatus: row.sync_status as Group['syncStatus'],
  createdAt: row.created_at as number, updatedAt: row.updated_at as number,
  deletedAt: row.deleted_at as number | null,
});
