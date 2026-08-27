import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';

const PDF = process.argv[2];
const OUT = process.argv[3] || 'pages.json';

const data = new Uint8Array(fs.readFileSync(PDF));
const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
const pages = [];

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const vp = page.getViewport({ scale: 1 });
  const tc = await page.getTextContent();
  const items = tc.items
    .filter(i => i.str != null)
    .map(i => ({
      s: i.str,
      x: Math.round(i.transform[4]),
      y: Math.round(vp.height - i.transform[5]), // flip so y grows downward
      w: Math.round(i.width || 0),
      h: Math.round(i.height || (i.transform[0] || 0)),
    }));
  pages.push({ p, w: Math.round(vp.width), h: Math.round(vp.height), items });
  if (p % 20 === 0) console.error('...', p);
}
fs.writeFileSync(OUT, JSON.stringify(pages));
console.error('wrote', OUT, 'pages', pages.length);
