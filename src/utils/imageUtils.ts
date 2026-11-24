const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ACCEPTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
  'image/heif',
]);

const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic', '.heif'];

export interface ProcessedPhoto {
  previewDataUrl: string;
  base64: string;
  mimeType: string;
  fileName: string;
}

export function validateImageFile(file: File): string | null {
  const lowerName = file.name.toLowerCase();
  const hasValidExt = ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const hasValidMime = file.type ? ACCEPTED_MIME_TYPES.has(file.type.toLowerCase()) : false;

  if (!hasValidMime && !hasValidExt) {
    return 'Please choose a JPEG, PNG, or HEIC photo.';
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'This photo is larger than 10 MB. Please choose a smaller image.';
  }

  return null;
}

function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Resize/compress browser-decodable images so they fit cleanly in localStorage
 * and upload quickly to the Gemini Vision endpoint.
 * For HEIC files that browsers cannot draw onto canvas, passes through raw base64.
 */
export async function processUploadedFile(file: File): Promise<ProcessedPhoto> {
  const dataUrl = await readFileAsDataUrl(file);
  const lowerName = file.name.toLowerCase();
  const isHeic =
    file.type.toLowerCase().includes('heic') ||
    file.type.toLowerCase().includes('heif') ||
    lowerName.endsWith('.heic') ||
    lowerName.endsWith('.heif');

  if (isHeic) {
    const base64 = dataUrl.split(',')[1] || '';
    return {
      previewDataUrl: dataUrl,
      base64,
      mimeType: file.type || 'image/heic',
      fileName: file.name,
    };
  }

  try {
    const compressedDataUrl = await compressDataUrl(dataUrl, 960, 0.82);
    const base64 = compressedDataUrl.split(',')[1] || '';
    return {
      previewDataUrl: compressedDataUrl,
      base64,
      mimeType: 'image/jpeg',
      fileName: file.name,
    };
  } catch {
    const base64 = dataUrl.split(',')[1] || '';
    return {
      previewDataUrl: dataUrl,
      base64,
      mimeType: file.type || 'image/jpeg',
      fileName: file.name,
    };
  }
}

export function compressDataUrl(
  dataUrl: string,
  maxEdge = 960,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Failed to decode image'));
    img.src = dataUrl;
  });
}

/**
 * Fetches an app-hosted sample image URL (e.g. /src/assets/images/...) and converts it
 * to base64 so it can be sent through the live Gemini Vision API just like a user upload.
 */
export async function urlToBase64Image(url: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Could not load sample photo.');
  }
  const blob = await response.blob();
  const dataUrl = await readFileAsDataUrl(blob);
  const base64 = dataUrl.split(',')[1] || '';
  return {
    base64,
    mimeType: blob.type || 'image/jpeg',
  };
}
