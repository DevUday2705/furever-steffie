import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Compresses images to WebP in the browser (highest quality that fits under the
// size cap), then uploads them to ImageKit using a short-lived signature from
// /api/stock (action "imagekit-auth") so the private key stays server-side.

const CONCURRENCY = 3;
const isHeic = (f) => /\.(heic|heif)$/i.test(f.name) || /hei[cf]/i.test(f.type);

async function toDecodable(file) {
  if (!isHeic(file)) return file;
  // heic-to ships a newer libheif that reads recent iPhone HEICs; heic2any's
  // older build throws "ERR_LIBHEIF format not supported" on those, so it's
  // only the fallback.
  try {
    const { heicTo } = await import("heic-to");
    return await heicTo({ blob: file, type: "image/jpeg", quality: 1 });
  } catch (err) {
    console.warn("heic-to failed, trying heic2any", err);
    const { default: heic2any } = await import("heic2any");
    const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 1 });
    return Array.isArray(out) ? out[0] : out;
  }
}

const canvasToWebp = (canvas, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));

// Highest quality (<= 0.9) under maxBytes; if even 0.55 is too big, shrink the
// long edge 15% and retry - dimensions hurt less than blocky quality.
async function compress(file, maxBytes) {
  const bitmap = await createImageBitmap(await toDecodable(file), { imageOrientation: "from-image" });
  let longEdge = Math.min(2000, Math.max(bitmap.width, bitmap.height));
  try {
    for (;;) {
      const scale = longEdge / Math.max(bitmap.width, bitmap.height);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      let lo = 55, hi = 90, best = null;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const blob = await canvasToWebp(canvas, mid / 100);
        if (blob && blob.size <= maxBytes) { best = { blob, quality: mid }; lo = mid + 1; } else hi = mid - 1;
      }
      if (best) return { ...best, width: canvas.width, height: canvas.height };
      if (longEdge < 600) throw new Error("Can't fit under size cap");
      longEdge = Math.round(longEdge * 0.85);
    }
  } finally {
    bitmap.close();
  }
}

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

async function uploadToImageKit(blob, fileName, folder) {
  const authRes = await fetch("/api/stock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "imagekit-auth" }),
  });
  const auth = await readJson(authRes, "Auth");
  if (!authRes.ok) throw new Error(auth.message || "Auth failed");

  const form = new FormData();
  form.append("file", blob, fileName);
  form.append("fileName", fileName);
  form.append("folder", folder ? `/${folder}` : "/");
  form.append("useUniqueFileName", "false");
  form.append("publicKey", auth.publicKey);
  form.append("token", auth.token);
  form.append("expire", auth.expire);
  form.append("signature", auth.signature);
  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body: form });
  const data = await readJson(res, "ImageKit upload");
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data.url;
}

const kb = (b) => `${Math.round(b / 1024)} KB`;

const ImageCompressor = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [items, setItems] = useState([]);
  const [folder, setFolder] = useState("");
  const [maxKb, setMaxKb] = useState(180);
  const [running, setRunning] = useState(false);

  const patch = (id, changes) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...changes } : it)));

  const addFiles = (fileList) => {
    const added = Array.from(fileList)
      .filter((f) => f.type.startsWith("image/") || isHeic(f))
      .map((file) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        status: "queued",
      }));
    setItems((prev) => [...prev, ...added]);
  };

  const processOne = async (item, safeFolder) => {
    try {
      patch(item.id, { status: "compressing" });
      const { blob, quality, width } = await compress(item.file, maxKb * 1024);
      const name = item.file.name.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "-") + ".webp";
      patch(item.id, { status: "uploading", newSize: blob.size, quality, width, name });
      const url = await uploadToImageKit(blob, name, safeFolder);
      patch(item.id, { status: "done", url });
    } catch (err) {
      console.error(item.file.name, err);
      patch(item.id, { status: "error", error: err.message });
    }
  };

  const start = async () => {
    const safeFolder = folder.trim().replace(/^\/+|\/+$/g, "").replace(/[^\w/-]+/g, "-");
    const pending = items.filter((it) => it.status === "queued" || it.status === "error");
    if (!pending.length) return;
    setRunning(true);
    const queue = [...pending];
    await Promise.all(
      Array.from({ length: CONCURRENCY }, async () => {
        while (queue.length) await processOne(queue.shift(), safeFolder);
      })
    );
    setRunning(false);
    toast.success("Finished");
  };

  const copy = (text, msg = "Copied") =>
    navigator.clipboard.writeText(text).then(() => toast.success(msg));

  const doneUrls = items.filter((it) => it.url).map((it) => it.url);
  const hasPending = items.some((it) => it.status === "queued" || it.status === "error");

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate("/admin")} className="text-sm text-gray-500 mb-4">
          ← Admin
        </button>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Image Compressor</h1>
        <p className="text-gray-500 mb-6">
          Drop originals (JPG, PNG, HEIC...). Each is converted to WebP under the size cap and uploaded to ImageKit.
        </p>

        <div className="flex flex-wrap gap-4 mb-4">
          <label className="flex-1 min-w-[220px] text-sm text-gray-600">
            ImageKit folder
            <input
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="e.g. kurtas-oct (blank = ImageKit root)"
              className="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </label>
          <label className="w-32 text-sm text-gray-600">
            Max size (KB)
            <input
              type="number"
              min={50}
              value={maxKb}
              onChange={(e) => setMaxKb(Number(e.target.value) || 180)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </label>
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className="cursor-pointer border-2 border-dashed border-gray-300 rounded-2xl bg-white p-10 text-center text-gray-500 hover:border-gray-400"
        >
          Drag & drop images here, or click to choose
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,.heic,.heif"
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {items.length > 0 && (
          <>
            <div className="flex flex-wrap gap-3 my-4">
              <button
                onClick={start}
                disabled={running || !hasPending}
                className="bg-gray-900 text-white rounded-lg px-5 py-2 disabled:opacity-40"
              >
                {running ? "Working..." : "Compress & upload"}
              </button>
              <button
                onClick={() => copy(doneUrls.join("\n"), `Copied ${doneUrls.length} URLs`)}
                disabled={!doneUrls.length}
                className="border rounded-lg px-5 py-2 bg-white disabled:opacity-40"
              >
                Copy all URLs ({doneUrls.length})
              </button>
              <button
                onClick={() => setItems([])}
                disabled={running}
                className="border rounded-lg px-5 py-2 bg-white text-gray-500 disabled:opacity-40"
              >
                Clear
              </button>
            </div>

            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.id} className="bg-white border rounded-xl px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-gray-800 truncate max-w-[50%]">{it.file.name}</span>
                    <span className="text-gray-500">
                      {kb(it.file.size)}
                      {it.newSize ? ` → ${kb(it.newSize)} (q${it.quality}, ${it.width}px)` : ""}
                    </span>
                    <span
                      className={
                        it.status === "done"
                          ? "text-green-600"
                          : it.status === "error"
                          ? "text-red-600"
                          : "text-gray-500"
                      }
                    >
                      {it.status === "error" ? `Error: ${it.error}` : it.status}
                    </span>
                  </div>
                  {it.url && (
                    <div className="mt-2 flex items-center gap-2">
                      <input readOnly value={it.url} className="flex-1 border rounded px-2 py-1 text-xs bg-gray-50" />
                      <button onClick={() => copy(it.url)} className="border rounded px-3 py-1 text-xs">
                        Copy
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageCompressor;
