// Bulk image compressor + ImageKit uploader.
//
// Takes a folder of original-quality images (jpg, png, webp, tiff, avif, heic/heif...),
// converts each to WebP at the highest quality that still fits under the size cap
// (default 180KB), uploads them into a folder on ImageKit and prints the URLs.
//
// Setup: add to .env.local
//   IMAGEKIT_PRIVATE_KEY=private_xxx      (ImageKit dashboard > Developer options)
//
// Usage:
//   node --env-file=.env.local scripts/compress-upload-imagekit.js <input-folder> <imagekit-folder> [--max-kb=180] [--dry-run]
// Example:
//   node --env-file=.env.local scripts/compress-upload-imagekit.js ./raw/kurtas kurtas-oct
//
// Outputs: compressed files in <input-folder>/compressed and <input-folder>/urls.csv
import sharp from "sharp";
import heicConvert from "heic-convert";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "fs";
import { join, extname, basename } from "path";

const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}`));
const positional = args.filter((a) => !a.startsWith("--"));
const [inputDir, ikFolder] = positional;
const MAX_BYTES = Number(flag("max-kb")?.split("=")[1] || 180) * 1024;
const DRY_RUN = !!flag("dry-run");
const PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;

if (!inputDir || !ikFolder) {
  console.error("Usage: node --env-file=.env.local scripts/compress-upload-imagekit.js <input-folder> <imagekit-folder> [--max-kb=180] [--dry-run]");
  process.exit(1);
}
if (!PRIVATE_KEY && !DRY_RUN) {
  console.error("IMAGEKIT_PRIVATE_KEY missing - add it to .env.local");
  process.exit(1);
}

const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".avif", ".gif", ".heic", ".heif"]);
const encode = (img, quality) => img.clone().webp({ quality, effort: 5 }).toBuffer();

async function load(file) {
  const ext = extname(file).toLowerCase();
  const buf = readFileSync(file);
  if (ext === ".heic" || ext === ".heif") {
    const jpeg = await heicConvert({ buffer: buf, format: "JPEG", quality: 1 });
    return Buffer.from(jpeg);
  }
  return buf;
}

// Highest quality (<= 90) whose output fits under MAX_BYTES. If even q55 is too
// big, shrink the long edge by 15% and try again - dimensions hurt less than
// dropping quality into blocky territory.
async function compress(input) {
  let longEdge = 2000;
  for (;;) {
    const img = sharp(input).rotate().resize({ width: longEdge, height: longEdge, fit: "inside", withoutEnlargement: true });
    let lo = 55, hi = 90, best = null;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const out = await encode(img, mid);
      if (out.length <= MAX_BYTES) { best = { buf: out, quality: mid }; lo = mid + 1; } else hi = mid - 1;
    }
    if (best) return { ...best, longEdge };
    if (longEdge < 600) throw new Error("cannot fit under size cap");
    longEdge = Math.round(longEdge * 0.85);
  }
}

async function upload(buf, fileName) {
  const form = new FormData();
  form.append("file", new Blob([buf], { type: "image/webp" }), fileName);
  form.append("fileName", fileName);
  form.append("folder", `/${ikFolder.replace(/^\/+|\/+$/g, "")}`);
  form.append("useUniqueFileName", "false");
  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${PRIVATE_KEY}:`).toString("base64") },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `upload failed (${res.status})`);
  return data.url;
}

const files = readdirSync(inputDir)
  .filter((f) => EXTS.has(extname(f).toLowerCase()) && statSync(join(inputDir, f)).isFile())
  .sort();
const outDir = join(inputDir, "compressed");
mkdirSync(outDir, { recursive: true });

console.log(`${files.length} images, cap ${Math.round(MAX_BYTES / 1024)}KB${DRY_RUN ? " (dry run, no upload)" : ""}\n`);
const rows = [["file", "original_kb", "compressed_kb", "quality", "url"]];
const failed = [];

for (const f of files) {
  const name = basename(f, extname(f)).replace(/[^\w.-]+/g, "-") + ".webp";
  try {
    const original = await load(join(inputDir, f));
    const { buf, quality, longEdge } = await compress(original);
    writeFileSync(join(outDir, name), buf);
    const url = DRY_RUN ? "" : await upload(buf, name);
    rows.push([f, Math.round(statSync(join(inputDir, f)).size / 1024), Math.round(buf.length / 1024), quality, url]);
    console.log(`OK  ${f}  ${Math.round(statSync(join(inputDir, f)).size / 1024)}KB -> ${Math.round(buf.length / 1024)}KB (q${quality}, ${longEdge}px)\n    ${url}`);
  } catch (err) {
    failed.push(f);
    console.error(`ERR ${f}: ${err.message}`);
  }
}

writeFileSync(join(inputDir, "urls.csv"), rows.map((r) => r.join(",")).join("\n"));
console.log(`\nDone: ${rows.length - 1} ok, ${failed.length} failed. URLs saved to ${join(inputDir, "urls.csv")}`);
if (failed.length) console.log("Failed:", failed.join(", "));
