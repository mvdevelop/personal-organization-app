#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '../public');
const svgPath = path.join(publicDir, 'icon.svg');

const sizes = [192, 512];

async function generateIcons() {
  try {
    console.log('Gerando ícones PWA a partir de icon.svg...');

    for (const size of sizes) {
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
      await sharp(svgPath)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(outputPath);
      console.log(`✓ Gerado: ${outputPath}`);
    }

    console.log('✅ Todos os ícones foram gerados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error);
    process.exit(1);
  }
}

generateIcons();
