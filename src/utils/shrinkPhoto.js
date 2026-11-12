// Shrinks a phone photo before upload: an iPhone picture is often 3-6 MB, but
// a courier receipt is still easy to read at 1600px. Saves as JPEG because
// Safari can't encode WebP (canvas.toBlob silently returns a huge PNG instead).
const MAX_LONG_EDGE = 1600;
const JPEG_QUALITY = 0.8;

const isHeic = (file) => /\.(heic|heif)$/i.test(file.name) || /hei[cf]/i.test(file.type);

// iPhone Safari normally hands over a JPEG, but a HEIC can still arrive
// (e.g. picked from Files on a desktop), and only Safari can draw those.
async function toDrawable(file) {
  if (!isHeic(file)) return file;
  try {
    const { heicTo } = await import("heic-to");
    return await heicTo({ blob: file, type: "image/jpeg", quality: 0.9 });
  } catch {
    return file;
  }
}

export async function shrinkPhoto(file) {
  const bitmap = await createImageBitmap(await toDrawable(file), { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, MAX_LONG_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    if (!blob) throw new Error("Couldn't process this photo.");
    return blob;
  } finally {
    bitmap.close();
  }
}
