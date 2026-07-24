import sharp from 'sharp';
import path from 'path';

async function convertJpgToPng() {
  const input = path.join(process.cwd(), 'public', 'app-icon.jpg');
  const output = path.join(process.cwd(), 'public', 'app-icon.png');
  await sharp(input).toFormat('png').toFile(output);
  console.log('✓ Converted app-icon.jpg to public/app-icon.png');
}

convertJpgToPng();
