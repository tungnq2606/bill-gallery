import { getDb } from '../db';
import { generateId, now } from '@/utils/id';
import type { Split, SplitShare } from '../types';

type CreateSplitInput = {
  billId: string;
  payerId: string;
  splitType: Split['splitType'];
  shares: { personId: string; amount: number; percent?: number; shares?: number }[];
};

export const splitRepo = {
  async getByBillId(billId: string): Promise<Split | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM splits WHERE bill_id = ?', billId
    );
    return row ? mapSplit(row) : null;
  },

  async getShares(splitId: string): Promise<SplitShare[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM split_shares WHERE split_id = ?', splitId
    );
    return rows.map(mapShare);
  },

  async getSharesByPerson(personId: string): Promise<SplitShare[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      `SELECT ss.* FROM split_shares ss
       JOIN splits s ON ss.split_id = s.id
       JOIN bills b ON s.bill_id = b.id
       WHERE ss.person_id = ? AND b.deleted_at IS NULL`, personId
    );
    return rows.map(mapShare);
  },

  async create(input: CreateSplitInput): Promise<Split> {
    const db = await getDb();
    const splitId = generateId();
    const timestamp = now();

    await db.runAsync(
      'INSERT INTO splits (id, bill_id, payer_id, split_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      splitId, input.billId, input.payerId, input.splitType, timestamp, timestamp
    );

    for (const share of input.shares) {
      await db.runAsync(
        `INSERT INTO split_shares (id, split_id, person_id, amount, percent, shares, status, paid_amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        generateId(), splitId, share.personId, share.amount,
        share.percent ?? null, share.shares ?? null,
        share.personId === input.payerId ? 'paid' : 'unpaid',
        timestamp, timestamp
      );
    }

    const split = await splitRepo.getByBillId(input.billId);
    if (!split) throw new Error('Failed to create split');
    return split;
  },

  async markSharePaid(shareId: string): Promise<void> {
    const db = await getDb();
    const share = await db.getFirstAsync<{ amount: number }>('SELECT amount FROM split_shares WHERE id = ?', shareId);
    if (!share) return;
    await db.runAsync(
      `UPDATE split_shares SET status = 'paid', paid_amount = ?, paid_at = ?, updated_at = ? WHERE id = ?`,
      share.amount, now(), now(), shareId
    );
  },

  async markShareUnpaid(shareId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `UPDATE split_shares SET status = 'unpaid', paid_amount = 0, paid_at = NULL, updated_at = ? WHERE id = ?`,
      now(), shareId
    );
  },
};

const mapSplit = (row: Record<string, unknown>): Split => ({
  id: row.id as string, billId: row.bill_id as string,
  payerId: row.payer_id as string, splitType: row.split_type as Split['splitType'],
  createdAt: row.created_at as number, updatedAt: row.updated_at as number,
});

const mapShare = (row: Record<string, unknown>): SplitShare => ({
  id: row.id as string, splitId: row.split_id as string, personId: row.person_id as string,
  amount: row.amount as number, percent: row.percent as number | null,
  shares: row.shares as number | null, status: row.status as SplitShare['status'],
  paidAmount: row.paid_amount as number, paidAt: row.paid_at as number | null,
  createdAt: row.created_at as number, updatedAt: row.updated_at as number,
});
