/**
 * Format integer amount to display string.
 * VND: 147000 → "147.000 ₫"
 * USD: 1500 → "$15.00"
 */
export const formatAmount = (amount: number, currency = 'VND'): string => {
  if (currency === 'VND') {
    return `${amount.toLocaleString('vi-VN')} ₫`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
};

/**
 * Short format for gallery tiles.
 * 147000 → "147k"
 * 1250000 → "1.25M"
 */
export const formatAmountShort = (amount: number): string => {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000)}k`;
  }
  return String(amount);
};
