export type BillType = 'receipt' | 'transfer' | 'manual';
export type BillStatus = 'settled' | 'unsettled' | 'partial';
export type SplitType = 'equal' | 'custom' | 'percent' | 'shares';
export type ShareStatus = 'unpaid' | 'paid' | 'partial';
export type SyncStatus = 'local' | 'synced' | 'pending';
export type PaymentMethod = 'cash' | 'transfer' | 'momo' | 'other';

export interface Person {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  phone: string | null;
  email: string | null;
  isMe: boolean;
  remoteId: string | null;
  syncStatus: SyncStatus;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface Bill {
  id: string;
  type: BillType;
  status: BillStatus;
  amount: number;
  currency: string;
  exchangeRate: number | null;
  merchant: string | null;
  date: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  note: string | null;
  categoryId: string | null;
  tripId: string | null;
  groupId: string | null;
  transferSender: string | null;
  transferReceiver: string | null;
  transferBank: string | null;
  transferRef: string | null;
  ocrConfidence: number | null;
  ocrRawText: string | null;
  remoteId: string | null;
  syncStatus: SyncStatus;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface BillItem {
  id: string;
  billId: string;
  name: string;
  amount: number;
  quantity: number;
  sortOrder: number;
  createdAt: number;
}

export interface BillAttachment {
  id: string;
  billId: string;
  uri: string;
  type: 'image' | 'pdf';
  width: number | null;
  height: number | null;
  thumbnailUri: string | null;
  isPrimary: boolean;
  sortOrder: number;
  remoteUrl: string | null;
  createdAt: number;
}

export interface Trip {
  id: string;
  name: string;
  coverColor: string;
  coverImageUri: string | null;
  startDate: string | null;
  endDate: string | null;
  groupId: string | null;
  budget: number | null;
  currency: string;
  remoteId: string | null;
  syncStatus: SyncStatus;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  isSystem: boolean;
  createdAt: number;
}

export interface Split {
  id: string;
  billId: string;
  payerId: string;
  splitType: SplitType;
  createdAt: number;
  updatedAt: number;
}

export interface SplitShare {
  id: string;
  splitId: string;
  personId: string;
  amount: number;
  percent: number | null;
  shares: number | null;
  status: ShareStatus;
  paidAmount: number;
  paidAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  remoteId: string | null;
  syncStatus: SyncStatus;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface PaymentRecord {
  id: string;
  splitShareId: string;
  amount: number;
  method: PaymentMethod | null;
  note: string | null;
  evidenceUri: string | null;
  recordedAt: number;
}
