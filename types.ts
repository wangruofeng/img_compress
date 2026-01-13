export interface ProcessedImage {
  id: string;
  originalFile: File;
  originalPreviewUrl: string;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  status: 'pending' | 'processing' | 'done' | 'error';
  compressionRatio: number; // Percentage saved
}

export interface CompressionSettings {
  quality: number; // 0.1 to 1.0
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  maxWidth: number;
}
