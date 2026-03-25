// scripts/gen-grain.mjs
// Run: node scripts/gen-grain.mjs
// Source: https://sharp.pixelplumbing.com/api-constructor (noise option)
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../public/assets');
const OUTPUT = join(OUTPUT_DIR, 'grain.webp');

mkdirSync(OUTPUT_DIR, { recursive: true });

await sharp({
  create: {
    width: 200,
    height: 200,
    channels: 1,          // Greyscale — minimizes file size
    noise: {
      type: 'gaussian',
      mean: 128,
      sigma: 30,           // Controls noise intensity; 30 = subtle grain
    },
  },
})
  .webp({ quality: 50, lossless: false })  // ~2KB output target
  .toFile(OUTPUT);

console.log(`grain.webp written to ${OUTPUT}`);
