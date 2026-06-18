import MlkitOcr from 'react-native-mlkit-ocr';
import { parseOcrText } from './ocrParser';
import type { OcrResult, TextBlock } from './ocrParser';

/**
 * Run on-device OCR on an image and parse the results.
 */
export const runOcr = async (imageUri: string): Promise<OcrResult> => {
  const mlkitBlocks = await MlkitOcr.detectFromUri(imageUri);

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
