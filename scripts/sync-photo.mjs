import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const dest = path.join(projectRoot, 'client', 'public', 'tobi.jpeg');
const src = path.join(projectRoot, 'tobi.jpeg');

fs.mkdirSync(path.dirname(dest), { recursive: true });

if (process.env.TOBI_PHOTO_BASE64) {
  fs.writeFileSync(dest, Buffer.from(process.env.TOBI_PHOTO_BASE64, 'base64'));
  console.log('Synced call photo from TOBI_PHOTO_BASE64');
} else if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('Synced call photo from tobi.jpeg');
} else if (fs.existsSync(dest)) {
  console.log('Call photo already in client/public/tobi.jpeg');
} else {
  console.warn('No call photo found (tobi.jpeg). Incoming call will use initials.');
}
