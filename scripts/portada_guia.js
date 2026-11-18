// Saca la portada de la guía como imagen (para la tarjeta del mensaje): guias/portada-NOMBRE.png
// Uso: node scripts/portada_guia.js gancho
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const name = process.argv[2];
  const root = path.join(__dirname, '..');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.goto('file://' + path.join(root, 'guias/src', name + '.html'), { waitUntil: 'networkidle' });
  await page.locator('section.page').first().screenshot({ path: path.join(root, 'guias', 'portada-' + name + '.png') });
  await browser.close();
  console.log('guias/portada-' + name + '.png');
})();
