import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('src/assets/images', { recursive: true });

const images = [
  { name: 'historia-truck.jpg', width: 1200, height: 675, color: { r: 53, g: 53, b: 52 } },
  { name: 'ubicacion-iron-man.jpg', width: 800, height: 600, color: { r: 53, g: 53, b: 52 } },
  { name: 'ubicacion-cara-sur.jpg', width: 800, height: 600, color: { r: 53, g: 53, b: 52 } },
];

for (const img of images) {
  await sharp({
    create: {
      width: img.width,
      height: img.height,
      channels: 3,
      background: img.color,
    },
  })
    .jpeg()
    .toFile(`src/assets/images/${img.name}`);
  console.log(`Created: src/assets/images/${img.name}`);
}
