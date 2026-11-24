// post-x-promote-make-your-own-bounty-01 entry (Node 22, standard library only).
//
// The entry is one post of our own on X that quotes make.fun's make-your-own-bounty
// post (https://x.com/makefunai/status/2124915864336236646), with a photo of its own
// attached, make.fun / @makefunai and our play code in its text. Places go by the
// post's replies + reposts + quotes at the deadline; views and likes move nothing.
//
// This program does two things, both into MAKEFUN_OUTPUT_DIR only:
//   1. copies POST.json from the repository root to <output>/POST.json (the gate
//      reads the post's address from there);
//   2. renders photo.png from code (a small RGBA canvas, a PNG encoder, and a
//      5x7 bitmap font typed here; no network, no downloaded assets, fully
//      deterministic — two runs write byte-identical files).
// It also writes post.txt, the exact text to publish on X, beside them.
// It never writes to a relative path: the grader runs the repository read-only.
//
// Local run:  mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// ---------------------------------------------------------------- post text
// The exact text to publish on X (227 characters, under the 280 limit).
// It is posted as a QUOTE of make.fun's post
// https://x.com/makefunai/status/2124915864336236646, from the public account
// @Irkammuzakky, with photo.png attached. The question at the end asks for
// replies, which is what the score counts (replies + reposts + quotes).
export const POST_TEXT =
  'Got a job nobody will do? Make your own bounty on @makefunai: https://make.fun/sponsor/new \u2014 name your price, AI agents race to build it, you pay only the winner. What would YOU put a bounty on? \u{1F447}\nmakefun-daybreak-jewel-cheetah';

// ------------------------------------------------------------------- canvas
const W = 1200;
const H = 675;

type RGBA = [number, number, number, number];

class Canvas {
  readonly w: number;
  readonly h: number;
  readonly px: Uint8Array;
  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.px = new Uint8Array(w * h * 4);
  }
  set(x: number, y: number, c: RGBA): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.px[i] = c[0];
    this.px[i + 1] = c[1];
    this.px[i + 2] = c[2];
    this.px[i + 3] = c[3];
  }
  rect(x: number, y: number, w: number, h: number, c: RGBA): void {
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) this.set(xx, yy, c);
    }
  }
  // Ring (outline circle) centred at (cx, cy) with radius r and thickness t.
  ring(cx: number, cy: number, r: number, t: number, c: RGBA): void {
    for (let yy = cy - r - t; yy <= cy + r + t; yy++) {
      for (let xx = cx - r - t; xx <= cx + r + t; xx++) {
        const d = Math.sqrt((xx - cx) * (xx - cx) + (yy - cy) * (yy - cy));
        if (d >= r - t / 2 && d <= r + t / 2) this.set(xx, yy, c);
      }
    }
  }
}

// --------------------------------------------------------------------- font
// 5x7 bitmap font, typed here. Each glyph is 7 rows of 5 bits ('1' = ink).
const FONT: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  a: ['00000', '00000', '01110', '00001', '01111', '10001', '01111'],
  b: ['10000', '10000', '11110', '10001', '10001', '10001', '11110'],
  c: ['00000', '00000', '01110', '10001', '10000', '10001', '01110'],
  d: ['00001', '00001', '01111', '10001', '10001', '10001', '01111'],
  e: ['00000', '00000', '01110', '10001', '11111', '10000', '01110'],
  f: ['00110', '01001', '01000', '11110', '01000', '01000', '01000'],
  g: ['01111', '10001', '10001', '01111', '00001', '00001', '01110'],
  h: ['10000', '10000', '11110', '10001', '10001', '10001', '10001'],
  i: ['00100', '00000', '01100', '00100', '00100', '00100', '01110'],
  k: ['10000', '10000', '10010', '10100', '11000', '10100', '10010'],
  l: ['01100', '00100', '00100', '00100', '00100', '00100', '01110'],
  m: ['00000', '00000', '11010', '10101', '10101', '10101', '10101'],
  n: ['00000', '00000', '11110', '10001', '10001', '10001', '10001'],
  o: ['00000', '00000', '01110', '10001', '10001', '10001', '01110'],
  p: ['10000', '10000', '11110', '10001', '10001', '11110', '10000'],
  r: ['00000', '00000', '10110', '11001', '10100', '10000', '10000'],
  s: ['00000', '00000', '01111', '10000', '01110', '00001', '11110'],
  t: ['00100', '00100', '11110', '00100', '00100', '00100', '00100'],
  u: ['00000', '00000', '10001', '10001', '10001', '10011', '01101'],
  w: ['00000', '00000', '10001', '10101', '10101', '10101', '01010'],
  y: ['00000', '00000', '10001', '10001', '01111', '00001', '01110'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  '/': ['00001', '00010', '00010', '00100', '00100', '01000', '10000'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};

function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale - scale;
}

function drawText(cv: Canvas, s: string, x: number, y: number, scale: number, c: RGBA): void {
  for (let ci = 0; ci < s.length; ci++) {
    const g = FONT[s[ci]] ?? FONT[' '];
    for (let r = 0; r < 7; r++) {
      for (let col = 0; col < 5; col++) {
        if (g[r][col] === '1') {
          cv.rect(x + (ci * 6 + col) * scale, y + r * scale, scale, scale, c);
        }
      }
    }
  }
}

// ---------------------------------------------------------------------- png
const CRC_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t.push(c >>> 0);
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length);
  return out;
}

function encodePng(cv: Canvas): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(cv.w, 0);
  ihdr.writeUInt32BE(cv.h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc(cv.h * (1 + cv.w * 4));
  for (let y = 0; y < cv.h; y++) {
    raw[y * (1 + cv.w * 4)] = 0; // filter: none
    raw.set(cv.px.subarray(y * cv.w * 4, (y + 1) * cv.w * 4), y * (1 + cv.w * 4) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// -------------------------------------------------------------------- photo
// Typographic poster, 1200x675 (16:9). The name make.fun is written as plain
// text, lowercase with the dot, as the rules ask. No logo artwork is drawn:
// make.fun's mark comes from its press pack, and no binary asset ships here.
const NAVY: RGBA = [16, 16, 46, 255];
const NAVY2: RGBA = [27, 27, 69, 255];
const LIME: RGBA = [215, 247, 74, 255];
const WHITE: RGBA = [255, 255, 255, 255];
const MIST: RGBA = [216, 216, 236, 255];

function renderPhoto(): Buffer {
  const cv = new Canvas(W, H);
  cv.rect(0, 0, W, H, NAVY);
  cv.rect(0, 0, W, 14, LIME);
  // Decoration: lime rings, top right.
  cv.ring(1064, 92, 30, 5, LIME);
  cv.ring(1128, 158, 16, 4, LIME);
  cv.ring(1004, 168, 11, 4, LIME);
  // Wordmark line.
  drawText(cv, 'make.fun', 64, 56, 4, LIME);
  // Headline.
  drawText(cv, 'MAKE YOUR OWN', 64, 168, 9, WHITE);
  drawText(cv, 'BOUNTY', 64, 262, 14, LIME);
  // Divider.
  cv.rect(64, 402, 200, 8, LIME);
  // Sub-lines.
  drawText(cv, 'Name your price. Agents race to build it.', 64, 440, 4, MIST);
  drawText(cv, 'You pay only the winner.', 64, 492, 4, MIST);
  // Bottom strip.
  cv.rect(0, 580, W, 95, NAVY2);
  drawText(cv, 'make.fun/sponsor/new', 64, 612, 4, LIME);
  return encodePng(cv);
}

// --------------------------------------------------------------------- main
mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(join(BOT_DIR, 'POST.json'), join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
writeFileSync(join(OUTPUT_DIR, 'photo.png'), renderPhoto());
writeFileSync(join(OUTPUT_DIR, 'post.txt'), POST_TEXT + '\n');
