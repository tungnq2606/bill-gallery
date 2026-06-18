import { getDb } from '../db';
import { generateId, now } from '@/utils/id';
import type { Trip } from '../types';

type CreateTripInput = {
  name: string;
  coverColor: string;
  startDate?: string;
  endDate?: string;
  groupId?: string;
  budget?: number;
};

export const tripRepo = {
  async getAll(): Promise<Trip[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM trips WHERE deleted_at IS NULL ORDER BY created_at DESC'
    );
    return rows.map(mapTrip);
  },

  async getById(id: string): Promise<Trip | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM trips WHERE id = ? AND deleted_at IS NULL', id
    );
    return row ? mapTrip(row) : null;
  },

  async create(input: CreateTripInput): Promise<Trip> {
    const db = await getDb();
    const id = generateId();
    const timestamp = now();
    await db.runAsync(
      `INSERT INTO trips (id, name, cover_color, start_date, end_date, group_id, budget, sync_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'local', ?, ?)`,
      id, input.name, input.coverColor,
      input.startDate ?? null, input.endDate ?? null,
      input.groupId ?? null, input.budget ?? null,
      timestamp, timestamp
    );
    const trip = await tripRepo.getById(id);
    if (!trip) throw new Error('Failed to create trip');
    return trip;
  },

  async softDelete(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE trips SET deleted_at = ?, updated_at = ? WHERE id = ?', now(), now(), id);
  },

  async getBillCount(tripId: string): Promise<number> {
    const db = await getDb();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM bills WHERE trip_id = ? AND deleted_at IS NULL', tripId
    );
    return result?.count ?? 0;
  },

  async getTotalSpent(tripId: string): Promise<number> {
    const db = await getDb();
    const result = await db.getFirstAsync<{ total: number }>(
      'SELECT COALESCE(SUM(amount), 0) as total FROM bills WHERE trip_id = ? AND deleted_at IS NULL', tripId
    );
    return result?.total ?? 0;
  },
};

const mapTrip = (row: Record<string, unknown>): Trip => ({
  id: row.id as string, name: row.name as string,
  coverColor: row.cover_color as string,
  coverImageUri: row.cover_image_uri as string | null,
  startDate: row.start_date as string | null, endDate: row.end_date as string | null,
  groupId: row.group_id as string | null, budget: row.budget as number | null,
  currency: row.currency as string,
  remoteId: row.remote_id as string | null,
  syncStatus: row.sync_status as Trip['syncStatus'],
  createdAt: row.created_at as number, updatedAt: row.updated_at as number,
  deletedAt: row.deleted_at as number | null,
});
