const fs = require('node:fs');
const path = require('node:path');

const publicDir = path.resolve(__dirname, '..', 'frontend', 'public');
const manifestPath = path.join(publicDir, 'manifest.webmanifest');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const errors = [];

if (!manifest.name || !manifest.short_name) errors.push('manifest name/short_name');
if (manifest.display !== 'standalone') errors.push('display must be standalone');
if (!manifest.start_url || !manifest.scope) errors.push('start_url/scope');

for (const icon of manifest.icons || []) {
  const iconPath = path.join(publicDir, String(icon.src || '').replace(/^\//, ''));
  if (!fs.existsSync(iconPath)) errors.push(`missing icon ${icon.src}`);
}

for (const requiredFile of ['sw.js', '_headers']) {
  if (!fs.existsSync(path.join(publicDir, requiredFile))) errors.push(`missing ${requiredFile}`);
}

if (errors.length) {
  console.error('PWA validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`PWA contract OK (${manifest.icons.length} icons and install metadata checked).`);
