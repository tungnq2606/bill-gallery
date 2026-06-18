import { useState, useMemo } from 'react';
import type { SplitType } from '@/data/types';

interface Participant {
  personId: string;
  name: string;
}

interface ShareResult {
  personId: string;
  amount: number;
  percent?: number;
  shares?: number;
}

interface SplitCalculatorState {
  splitType: SplitType;
  totalAmount: number;
  participants: Participant[];
  customAmounts: Record<string, number>;
  customPercents: Record<string, number>;
  customShares: Record<string, number>;
  results: ShareResult[];
  isValid: boolean;
  remainder: number;
  setSplitType: (type: SplitType) => void;
  setCustomAmount: (personId: string, amount: number) => void;
  setCustomPercent: (personId: string, percent: number) => void;
  setCustomShares: (personId: string, shares: number) => void;
}

export const useSplitCalculator = (
  totalAmount: number,
  participants: Participant[],
): SplitCalculatorState => {
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
  const [customPercents, setCustomPercents] = useState<Record<string, number>>({});
  const [customShares, setCustomSharesState] = useState<Record<string, number>>({});

  const results = useMemo((): ShareResult[] => {
    const count = participants.length;
    if (count === 0) return [];

    switch (splitType) {
      case 'equal': {
        const perPerson = Math.floor(totalAmount / count);
        const remainder = totalAmount - perPerson * count;
        return participants.map((p, i) => ({
          personId: p.personId,
          amount: perPerson + (i === 0 ? remainder : 0),
        }));
      }

      case 'custom': {
        return participants.map((p) => ({
          personId: p.personId,
          amount: customAmounts[p.personId] ?? 0,
        }));
      }

      case 'percent': {
        let allocated = 0;
        const shares = participants.map((p, i) => {
          const pct = customPercents[p.personId] ?? 0;
          const amount = i === participants.length - 1
            ? totalAmount - allocated
            : Math.round(totalAmount * pct / 100);
          allocated += amount;
          return { personId: p.personId, amount, percent: pct };
        });
        return shares;
      }

      case 'shares': {
        const totalShares = participants.reduce(
          (sum, p) => sum + (customShares[p.personId] ?? 1), 0
        );
        if (totalShares === 0) {
          return participants.map((p) => ({
            personId: p.personId, amount: 0, shares: 0,
          }));
        }
        let allocated = 0;
        return participants.map((p, i) => {
          const s = customShares[p.personId] ?? 1;
          const amount = i === participants.length - 1
            ? totalAmount - allocated
            : Math.round(totalAmount * s / totalShares);
          allocated += amount;
          return { personId: p.personId, amount, shares: s };
        });
      }

      default:
        return [];
    }
  }, [splitType, totalAmount, participants, customAmounts, customPercents, customShares]);

  const allocatedTotal = results.reduce((sum, r) => sum + r.amount, 0);
  const remainder = totalAmount - allocatedTotal;
  const isValid = splitType === 'equal' || Math.abs(remainder) < 2;

  return {
    splitType, totalAmount, participants,
    customAmounts, customPercents, customShares,
    results, isValid, remainder,
    setSplitType,
    setCustomAmount: (personId, amount) =>
      setCustomAmounts((prev) => ({ ...prev, [personId]: amount })),
    setCustomPercent: (personId, percent) =>
      setCustomPercents((prev) => ({ ...prev, [personId]: percent })),
    setCustomShares: (personId, shares) =>
      setCustomSharesState((prev) => ({ ...prev, [personId]: shares })),
  };
};

export type { Participant, ShareResult };
