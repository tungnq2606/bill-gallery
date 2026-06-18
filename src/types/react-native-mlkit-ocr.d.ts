declare module 'react-native-mlkit-ocr' {
  interface OcrBlock {
    text: string;
    bounding?: { top: number; left: number; width: number; height: number };
    lines: { text: string }[];
  }
  const MlkitOcr: {
    detectFromUri(uri: string): Promise<OcrBlock[]>;
    detectFromFile(path: string): Promise<OcrBlock[]>;
  };
  export default MlkitOcr;
}
