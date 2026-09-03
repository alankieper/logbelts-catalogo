// Mergea un JSON {codigo: descripcion} en scratch/desc-catalogo.json
import fs from 'fs';
const OUT = process.argv[2];
const patch = JSON.parse(process.argv[3]);
const cur = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
Object.assign(cur, patch);
fs.writeFileSync(OUT, JSON.stringify(cur, null, 2) + '\n');
console.log('total en', OUT, ':', Object.keys(cur).length);
