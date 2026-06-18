interface BalanceEntry {
  personId: string;
  netBalance: number; // positive = they owe me, negative = I owe them
}

interface ShareRecord {
  payerId: string;
  personId: string;
  amount: number;
  isPaid: boolean;
}

/**
 * Calculate net balances from the perspective of "me".
 * netBalance > 0 → person owes me
 * netBalance < 0 → I owe person
 */
export const calculateBalances = (
  meId: string,
  shares: ShareRecord[],
): BalanceEntry[] => {
  const balances = new Map<string, number>();

  for (const share of shares) {
    if (share.isPaid) continue;

    if (share.payerId === meId && share.personId !== meId) {
      // I paid, they owe me
      const current = balances.get(share.personId) ?? 0;
      balances.set(share.personId, current + share.amount);
    } else if (share.personId === meId && share.payerId !== meId) {
      // They paid, I owe them
      const current = balances.get(share.payerId) ?? 0;
      balances.set(share.payerId, current - share.amount);
    }
  }

  return Array.from(balances.entries())
    .map(([personId, netBalance]) => ({ personId, netBalance }))
    .filter((b) => b.netBalance !== 0)
    .sort((a, b) => b.netBalance - a.netBalance);
};

export type { BalanceEntry, ShareRecord };
