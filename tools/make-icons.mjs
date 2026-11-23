// Draws the app icon (a script page with a highlighted line) as PNGs. No dependencies.
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
function png(size, full) {
  const px = Buffer.alloc(size * size * 4);
  const set = (x, y, [r, g, b], a = 255) => { const i = (y * size + x) * 4; const A = a / 255, B = px[i + 3] / 255; px[i] = r * A + px[i] * (1 - A); px[i + 1] = g * A + px[i + 1] * (1 - A); px[i + 2] = b * A + px[i + 2] * (1 - A); px[i + 3] = Math.max(px[i + 3], a); };
  const rr = (x0, y0, x1, y1, r, col) => { for (let y = Math.floor(y0); y < y1; y++) for (let x = Math.floor(x0); x < x1; x++) {
    const dx = Math.max(x0 + r - x - 0.5, 0, x + 0.5 - (x1 - r)), dy = Math.max(y0 + r - y - 0.5, 0, y + 0.5 - (y1 - r)); const d = Math.hypot(dx, dy) - r;
    if (d < 0.5) set(x, y, col, Math.round(255 * Math.min(1, 0.5 - d))); } };
  const s = size / 512;
  const bg = [30, 90, 134], paper = [250, 251, 252], ink = [120, 132, 146], hl = [255, 212, 0];
  if (full) rr(0, 0, size, size, 0, bg); else rr(0, 0, size, size, 112 * s, bg);
  rr(132 * s, 92 * s, 380 * s, 420 * s, 22 * s, paper);
  rr(164 * s, 214 * s, 348 * s, 262 * s, 8 * s, hl);
  for (const [y, w] of [[150, 150], [228, 150], [300, 170], [348, 120]]) rr(176 * s, y * s, (176 + w) * s, (y + 18) * s, 9 * s, ink);
  const raw = Buffer.alloc((size * 4 + 1) * size); for (let y = 0; y < size; y++) { raw[y * (size * 4 + 1)] = 0; px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
writeFileSync("icons/icon-192.png", png(192, false));
writeFileSync("icons/icon-512.png", png(512, false));
writeFileSync("icons/icon-maskable-512.png", png(512, true));
writeFileSync("icons/apple-touch-icon.png", png(180, true));
console.log("icons written");
