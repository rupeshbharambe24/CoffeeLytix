/**
 * Free, Storage-free image handling: resize + JPEG-compress an uploaded photo
 * entirely in the browser and return a data URL that we store inline in the
 * Firestore document. We keep the result comfortably under Firestore's ~1 MB
 * per-document limit so no Cloud Storage (Blaze plan) is needed.
 */

const DIMENSIONS = [1024, 800, 640];
const QUALITIES = [0.72, 0.6, 0.5, 0.42];
// Stay well under Firestore's 1,048,576-byte document limit (leave room for
// the rest of the document's fields). base64 chars are 1 byte each.
const TARGET_BYTES = 700_000;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

function fit(width: number, height: number, max: number) {
  if (width <= max && height <= max) return { width, height };
  const scale = max / Math.max(width, height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export async function compressImageToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(img.src);
    throw new Error("Could not process that image.");
  }

  try {
    for (const dim of DIMENSIONS) {
      const { width, height } = fit(img.naturalWidth, img.naturalHeight, dim);
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      for (const quality of QUALITIES) {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        if (dataUrl.length <= TARGET_BYTES) return dataUrl;
      }
    }
    throw new Error(
      "That image is too large to store. Please try a smaller photo.",
    );
  } finally {
    URL.revokeObjectURL(img.src);
  }
}
