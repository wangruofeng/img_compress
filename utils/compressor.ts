import { CompressionSettings } from '../types';

// Check if a format is supported by the browser
const isFormatSupported = (format: string): boolean => {
  try {
    const testCanvas = document.createElement('canvas');
    testCanvas.width = 1;
    testCanvas.height = 1;
    const dataUrl = testCanvas.toDataURL(format);
    return dataUrl.startsWith(`data:${format}`);
  } catch {
    return false;
  }
};

export const compressImage = async (
  file: File,
  settings: CompressionSettings
): Promise<Blob> => {
  // Determine the best format to use
  let format = settings.format;

  // Check if the requested format is supported
  if (!isFormatSupported(format)) {
    // Fallback to JPEG if the format is not supported
    format = 'image/jpeg';
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize logic if max width is set and image is larger
        if (settings.maxWidth > 0 && width > settings.maxWidth) {
          const ratio = settings.maxWidth / width;
          width = settings.maxWidth;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Fill background for non-transparent formats
        if (format === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // PNG is lossless, quality parameter is ignored
        const quality = format === 'image/png' ? undefined : settings.quality;

        // Try with requested format first
        canvas.toBlob(
          (blob) => {
            // Check if blob is valid
            if (blob && typeof blob.size === 'number' && blob.size > 0) {
              resolve(blob);
            } else {
              // Fallback to JPEG if compression fails
              canvas.toBlob(
                (fallbackBlob) => {
                  if (fallbackBlob && typeof fallbackBlob.size === 'number' && fallbackBlob.size > 0) {
                    resolve(fallbackBlob);
                  } else {
                    reject(new Error('Compression failed: no valid blob'));
                  }
                },
                'image/jpeg',
                settings.quality
              );
            }
          },
          format,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};
