interface OcrResult {
  merchant: string | null;
  total: number | null;
  date: string | null;
  items: { name: string; amount: number }[];
  confidence: number;
  rawText: string;
}

interface TextBlock {
  text: string;
  bounding?: { top: number; left: number; width: number; height: number };
}

const TOTAL_PATTERNS = [
  /(?:TỔNG|TOTAL|CỘNG|T\.CỘNG|THÀNH TIỀN|THANH TOÁN|AMOUNT)\s*:?\s*([\d.,]+)/i,
  /([\d.,]+)\s*(?:TỔNG|TOTAL|CỘNG|VNĐ|VND|₫)/i,
];

const DATE_PATTERNS = [
  /(\d{2})[\/\-.](\d{2})[\/\-.](\d{4})/,
  /(\d{4})[\/\-.](\d{2})[\/\-.](\d{2})/,
];

const ITEM_PATTERN = /^(.+?)\s{2,}([\d.,]+)\s*$/;

const parseAmount = (raw: string): number | null => {
  const cleaned = raw.replace(/[.,\s]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
};

const parseDate = (text: string): string | null => {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;
    if (match[1].length === 4) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return `${match[3]}-${match[2]}-${match[1]}`;
  }
  return null;
};

export const parseOcrText = (blocks: TextBlock[]): OcrResult => {
  const allText = blocks.map((b) => b.text).join('\n');
  const lines = allText.split('\n').map((l) => l.trim()).filter(Boolean);

  let merchant: string | null = null;
  let total: number | null = null;
  let date: string | null = null;
  const items: { name: string; amount: number }[] = [];
  let fieldsFound = 0;

  // Merchant: first non-empty line that's not a number
  for (const line of lines.slice(0, 5)) {
    if (line.length > 3 && !/^\d+$/.test(line) && !/^[\/\-.\d\s]+$/.test(line)) {
      merchant = line;
      fieldsFound++;
      break;
    }
  }

  // Total: scan for total patterns
  for (const line of lines) {
    for (const pattern of TOTAL_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        const amount = parseAmount(match[1]);
        if (amount && amount > 0) {
          total = amount;
          fieldsFound++;
          break;
        }
      }
    }
    if (total) break;
  }

  // Fallback: largest number if no total pattern found
  if (!total) {
    let maxAmount = 0;
    for (const line of lines) {
      const nums = line.match(/[\d.,]{4,}/g);
      if (nums) {
        for (const n of nums) {
          const amount = parseAmount(n);
          if (amount && amount > maxAmount) maxAmount = amount;
        }
      }
    }
    if (maxAmount > 0) {
      total = maxAmount;
      fieldsFound += 0.5;
    }
  }

  // Date
  for (const line of lines) {
    date = parseDate(line);
    if (date) { fieldsFound++; break; }
  }

  // Items: lines with "text  number" pattern
  for (const line of lines) {
    const match = line.match(ITEM_PATTERN);
    if (match) {
      const amount = parseAmount(match[2]);
      if (amount && amount > 0) {
        items.push({ name: match[1].trim(), amount });
      }
    }
  }
  if (items.length > 0) fieldsFound++;

  const confidence = Math.min(fieldsFound / 4, 1);

  return { merchant, total, date, items, confidence, rawText: allText };
};

export type { OcrResult, TextBlock };
