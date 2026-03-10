import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputFile = './public/logo.png';
const outputDir = './public';

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

async function generateFavicons() {
  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Fuente ${inputFile} no encontrada.`);
    return;
  }

  try {
    // Generar PNGs
    for (const item of sizes) {
      await sharp(inputFile)
        .resize(item.size, item.size)
        .toFile(path.join(outputDir, item.name));
      console.log(`✓ Generado: ${item.name}`);
    }

    // Generar favicon.ico (32x32) - Usando PNG pero con extensión .ico para compatibilidad
    await sharp(inputFile)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon.ico'));
    console.log('✓ Generado: favicon.ico (as PNG)');

    console.log('\n¡Todos los iconos se han generado correctamente!');
  } catch (error) {
    console.error('Error generando iconos:', error);
  }
}

generateFavicons();
