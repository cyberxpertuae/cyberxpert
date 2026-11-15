// Builds src/i18n/en.json and ar.json from the bilingual string modules.
import fs from 'fs';
import path from 'path';
const dir = path.resolve('scripts/strings');
const en = {}, ar = {};
const walk = (obj, prefix) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) { if (en[key]) throw new Error('dup ' + key); en[key] = v[0]; ar[key] = v[1]; }
    else walk(v, key);
  }
};
for (const f of fs.readdirSync(dir).sort()) walk((await import(path.join(dir, f))).default, '');
fs.writeFileSync('src/i18n/en.json', JSON.stringify(en, null, 1));
fs.writeFileSync('src/i18n/ar.json', JSON.stringify(ar, null, 1));
console.log('strings:', Object.keys(en).length);
