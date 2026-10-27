import { adminFetch } from "../utils/adminFetch";

// res.json() throws a cryptic "Unexpected end of JSON input" on an empty body,
// which is what /api/stock returns under plain `vite dev` (no API there).
async function readJson(res, what) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    const hint = what === "Auth" ? " The /api routes only exist on Vercel or 'vercel dev', not 'npm run dev'." : "";
    throw new Error(`${what} returned an empty/invalid response (HTTP ${res.status}).${hint}`);
  }
}

// Browser-side ImageKit upload, signed by /api/stock (action "imagekit-auth")
// so the private key stays server-side. Replaces the old unsigned Cloudinary
// upload - that account is closed.
// uniqueName: let ImageKit suffix the name so two "IMG_0001.jpg"s from
// different phones don't overwrite each other. The Image Compressor turns it
// off because it names files deliberately.
export async function uploadToImageKit(file, { folder = "", fileName = file.name || "upload", uniqueName = true } = {}) {
  const authRes = await adminFetch("/api/stock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "imagekit-auth" }),
  });
  const auth = await readJson(authRes, "Auth");
  if (!authRes.ok) throw new Error(auth.message || "Auth failed");

  const form = new FormData();
  form.append("file", file, fileName);
  form.append("fileName", fileName);
  form.append("folder", folder ? `/${folder}` : "/");
  form.append("useUniqueFileName", String(uniqueName));
  form.append("publicKey", auth.publicKey);
  form.append("token", auth.token);
  form.append("expire", auth.expire);
  form.append("signature", auth.signature);
  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body: form });
  const data = await readJson(res, "ImageKit upload");
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data.url;
}
