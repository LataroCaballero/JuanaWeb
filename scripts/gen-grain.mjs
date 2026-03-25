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
    channels: 1,
    noise: {
      type: 'gaussian',
      mean: 128,
      sigma: 30,
    },
  },
})
  .webp({ quality: 50 })
  .toFile(OUTPUT);

console.log('grain.webp written to', OUTPUT);
