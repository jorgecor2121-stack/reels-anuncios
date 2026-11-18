// Convierte guias/src/NOMBRE.html en guias/guia-NOMBRE.pdf (páginas 1080x1350, formato Instagram)
// Uso: node scripts/hacer_guia.js gancho
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const name = process.argv[2];
  const root = path.join(__dirname, '..');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(root, 'guias/src', name + '.html'), { waitUntil: 'networkidle' });
  await page.pdf({ path: path.join(root, 'guias', 'guia-' + name + '.pdf'), width: '1080px', height: '1350px', printBackground: true });
  await browser.close();
  console.log('guias/guia-' + name + '.pdf');
})();
