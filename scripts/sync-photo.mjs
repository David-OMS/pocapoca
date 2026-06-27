import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const destPublic = path.join(projectRoot, 'client', 'public', 'tobi.jpeg');
const destAssets = path.join(projectRoot, 'client', 'src', 'assets', 'tobi.jpeg');
const src = path.join(projectRoot, 'tobi.jpeg');

function copyPhoto(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

if (process.env.TOBI_PHOTO_BASE64) {
  const buffer = Buffer.from(process.env.TOBI_PHOTO_BASE64, 'base64');
  fs.mkdirSync(path.dirname(destPublic), { recursive: true });
  fs.mkdirSync(path.dirname(destAssets), { recursive: true });
  fs.writeFileSync(destPublic, buffer);
  fs.writeFileSync(destAssets, buffer);
  console.log('Synced call photo from TOBI_PHOTO_BASE64');
} else if (fs.existsSync(src)) {
  copyPhoto(src, destPublic);
  copyPhoto(src, destAssets);
  console.log('Synced call photo from tobi.jpeg');
} else if (fs.existsSync(destPublic)) {
  copyPhoto(destPublic, destAssets);
  console.log('Synced call photo from client/public/tobi.jpeg');
} else if (fs.existsSync(destAssets)) {
  copyPhoto(destAssets, destPublic);
  console.log('Call photo already in client/src/assets/tobi.jpeg');
} else {
  console.warn('No call photo found (tobi.jpeg). Incoming call will use initials.');
}
