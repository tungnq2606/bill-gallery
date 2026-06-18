import { create } from 'zustand';
import type { Bill, BillAttachment, BillStatus, BillType } from '@/data/types';
import { billRepo } from '@/data/repositories';

interface BillWithAttachment extends Bill {
  primaryAttachment?: BillAttachment | null;
}

interface BillStore {
  bills: BillWithAttachment[];
  loading: boolean;
  filter: {
    status?: BillStatus;
    type?: BillType;
    tripId?: string;
    month?: string;
  };
  setFilter: (filter: BillStore['filter']) => void;
  loadBills: () => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
}

export const useBillStore = create<BillStore>((set, get) => ({
  bills: [],
  loading: false,
  filter: {},

  setFilter: (filter) => {
    set({ filter });
    get().loadBills();
  },

  loadBills: async () => {
    set({ loading: true });
    const bills = await billRepo.getAll(get().filter);
    const billsWithAttachments: BillWithAttachment[] = await Promise.all(
      bills.map(async (bill) => {
        const primaryAttachment = await billRepo.getPrimaryAttachment(bill.id);
        return { ...bill, primaryAttachment };
      })
    );
    set({ bills: billsWithAttachments, loading: false });
  },

  deleteBill: async (id) => {
    await billRepo.softDelete(id);
    await get().loadBills();
  },
}));
