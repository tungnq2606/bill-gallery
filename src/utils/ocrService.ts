import { NativeModules } from 'react-native';
import { parseOcrText } from './ocrParser';
import type { OcrResult, TextBlock } from './ocrParser';

interface MlkitOcrBlock {
  text: string;
  bounding?: { top: number; left: number; width: number; height: number };
  lines: { text: string }[];
}

interface MlkitOcrModule {
  detectFromUri(uri: string): Promise<MlkitOcrBlock[] | null>;
}

/**
 * Run on-device OCR on an image and parse the results.
 * Falls back gracefully if ML Kit native module is unavailable.
 */
export const runOcr = async (imageUri: string): Promise<OcrResult> => {
  const MlkitOcr = NativeModules.MlkitOcr as MlkitOcrModule | null;

  if (!MlkitOcr) {
    console.warn('ML Kit OCR native module not available');
    return { merchant: null, total: null, date: null, items: [], confidence: 0, rawText: '' };
  }

  const mlkitBlocks = await MlkitOcr.detectFromUri(imageUri);

  if (!mlkitBlocks || mlkitBlocks.length === 0) {
    return { merchant: null, total: null, date: null, items: [], confidence: 0, rawText: '' };
  }

  const blocks: TextBlock[] = mlkitBlocks.map((block) => ({
    text: block.text,
    bounding: block.bounding
      ? {
          top: block.bounding.top,
          left: block.bounding.left,
          width: block.bounding.width,
          height: block.bounding.height,
        }
      : undefined,
  }));

  return parseOcrText(blocks);
};
