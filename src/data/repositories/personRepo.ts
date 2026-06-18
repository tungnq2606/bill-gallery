import { getDb } from '../db';
import { generateId, now } from '@/utils/id';
import type { Person } from '../types';

type CreatePersonInput = {
  name: string;
  initials: string;
  avatarColor: string;
  isMe?: boolean;
  phone?: string;
  email?: string;
};

export const personRepo = {
  async getAll(): Promise<Person[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM persons WHERE deleted_at IS NULL ORDER BY is_me DESC, name ASC'
    );
    return rows.map(mapPerson);
  },

  async getMe(): Promise<Person | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM persons WHERE is_me = 1 AND deleted_at IS NULL'
    );
    return row ? mapPerson(row) : null;
  },

  async getById(id: string): Promise<Person | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM persons WHERE id = ? AND deleted_at IS NULL', id
    );
    return row ? mapPerson(row) : null;
  },

  async create(input: CreatePersonInput): Promise<Person> {
    const db = await getDb();
    const id = generateId();
    const timestamp = now();
    await db.runAsync(
      `INSERT INTO persons (id, name, initials, avatar_color, is_me, phone, email, sync_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'local', ?, ?)`,
      id, input.name, input.initials, input.avatarColor,
      input.isMe ? 1 : 0, input.phone ?? null, input.email ?? null,
      timestamp, timestamp
    );
    const person = await personRepo.getById(id);
    if (!person) throw new Error('Failed to create person');
    return person;
  },

  async softDelete(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE persons SET deleted_at = ?, updated_at = ? WHERE id = ?',
      now(), now(), id
    );
  },
};

const mapPerson = (row: Record<string, unknown>): Person => ({
  id: row.id as string,
  name: row.name as string,
  initials: row.initials as string,
  avatarColor: row.avatar_color as string,
  phone: row.phone as string | null,
  email: row.email as string | null,
  isMe: (row.is_me as number) === 1,
  remoteId: row.remote_id as string | null,
  syncStatus: row.sync_status as Person['syncStatus'],
  createdAt: row.created_at as number,
  updatedAt: row.updated_at as number,
  deletedAt: row.deleted_at as number | null,
});
