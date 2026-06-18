import type { SQLiteBindValue } from 'expo-sqlite';
import { getDb } from '../db';
import { generateId, now } from '@/utils/id';
import type { Bill, BillItem, BillAttachment } from '../types';

type CreateBillInput = {
  type: Bill['type'];
  amount: number;
  currency?: string;
  merchant?: string;
  date: string;
  location?: string;
  note?: string;
  categoryId?: string;
  tripId?: string;
  transferSender?: string;
  transferReceiver?: string;
  transferBank?: string;
  transferRef?: string;
  ocrConfidence?: number;
  ocrRawText?: string;
};

type BillFilter = {
  status?: Bill['status'];
  type?: Bill['type'];
  tripId?: string;
  month?: string;
};

export const billRepo = {
  async getAll(filter?: BillFilter): Promise<Bill[]> {
    const db = await getDb();
    let query = 'SELECT * FROM bills WHERE deleted_at IS NULL';
    const params: SQLiteBindValue[] = [];

    if (filter?.status) { query += ' AND status = ?'; params.push(filter.status); }
    if (filter?.type) { query += ' AND type = ?'; params.push(filter.type); }
    if (filter?.tripId) { query += ' AND trip_id = ?'; params.push(filter.tripId); }
    if (filter?.month) { query += ' AND date LIKE ?'; params.push(`${filter.month}%`); }

    query += ' ORDER BY date DESC, created_at DESC';
    const rows = await db.getAllAsync<Record<string, unknown>>(query, ...params);
    return rows.map(mapBill);
  },

  async getById(id: string): Promise<Bill | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM bills WHERE id = ? AND deleted_at IS NULL', id
    );
    return row ? mapBill(row) : null;
  },

  async create(input: CreateBillInput): Promise<Bill> {
    const db = await getDb();
    const id = generateId();
    const timestamp = now();
    await db.runAsync(
      `INSERT INTO bills (id, type, status, amount, currency, merchant, date, location, note,
        category_id, trip_id, transfer_sender, transfer_receiver, transfer_bank, transfer_ref,
        ocr_confidence, ocr_raw_text, sync_status, created_at, updated_at)
       VALUES (?, ?, 'unsettled', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'local', ?, ?)`,
      id, input.type, input.amount, input.currency ?? 'VND',
      input.merchant ?? null, input.date, input.location ?? null, input.note ?? null,
      input.categoryId ?? null, input.tripId ?? null,
      input.transferSender ?? null, input.transferReceiver ?? null,
      input.transferBank ?? null, input.transferRef ?? null,
      input.ocrConfidence ?? null, input.ocrRawText ?? null,
      timestamp, timestamp
    );
    const bill = await billRepo.getById(id);
    if (!bill) throw new Error('Failed to create bill');
    return bill;
  },

  async updateStatus(id: string, status: Bill['status']): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE bills SET status = ?, updated_at = ? WHERE id = ?', status, now(), id);
  },

  async softDelete(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE bills SET deleted_at = ?, updated_at = ? WHERE id = ?', now(), now(), id);
  },

  async getItems(billId: string): Promise<BillItem[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM bill_items WHERE bill_id = ? ORDER BY sort_order', billId
    );
    return rows.map(mapBillItem);
  },

  async addItem(billId: string, name: string, amount: number, quantity = 1): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'INSERT INTO bill_items (id, bill_id, name, amount, quantity, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      generateId(), billId, name, amount, quantity, now()
    );
  },

  async getPrimaryAttachment(billId: string): Promise<BillAttachment | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM bill_attachments WHERE bill_id = ? AND is_primary = 1', billId
    );
    return row ? mapAttachment(row) : null;
  },

  async addAttachment(billId: string, uri: string, isPrimary = false): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'INSERT INTO bill_attachments (id, bill_id, uri, is_primary, created_at) VALUES (?, ?, ?, ?, ?)',
      generateId(), billId, uri, isPrimary ? 1 : 0, now()
    );
  },
};

const mapBill = (row: Record<string, unknown>): Bill => ({
  id: row.id as string, type: row.type as Bill['type'], status: row.status as Bill['status'],
  amount: row.amount as number, currency: row.currency as string,
  exchangeRate: row.exchange_rate as number | null, merchant: row.merchant as string | null,
  date: row.date as string, location: row.location as string | null,
  latitude: row.latitude as number | null, longitude: row.longitude as number | null,
  note: row.note as string | null, categoryId: row.category_id as string | null,
  tripId: row.trip_id as string | null, groupId: row.group_id as string | null,
  transferSender: row.transfer_sender as string | null,
  transferReceiver: row.transfer_receiver as string | null,
  transferBank: row.transfer_bank as string | null,
  transferRef: row.transfer_ref as string | null,
  ocrConfidence: row.ocr_confidence as number | null,
  ocrRawText: row.ocr_raw_text as string | null,
  remoteId: row.remote_id as string | null,
  syncStatus: row.sync_status as Bill['syncStatus'],
  createdAt: row.created_at as number, updatedAt: row.updated_at as number,
  deletedAt: row.deleted_at as number | null,
});

const mapBillItem = (row: Record<string, unknown>): BillItem => ({
  id: row.id as string, billId: row.bill_id as string, name: row.name as string,
  amount: row.amount as number, quantity: row.quantity as number,
  sortOrder: row.sort_order as number, createdAt: row.created_at as number,
});

const mapAttachment = (row: Record<string, unknown>): BillAttachment => ({
  id: row.id as string, billId: row.bill_id as string, uri: row.uri as string,
  type: row.type as BillAttachment['type'],
  width: row.width as number | null, height: row.height as number | null,
  thumbnailUri: row.thumbnail_uri as string | null,
  isPrimary: (row.is_primary as number) === 1, sortOrder: row.sort_order as number,
  remoteUrl: row.remote_url as string | null, createdAt: row.created_at as number,
});
