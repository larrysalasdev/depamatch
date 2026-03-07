// scraper-planos.js — Extrae imágenes de planos de NexoAgentes
// Requiere: node scraper-planos.js (con sesión activa en Chrome)
// Instalar: npm install puppeteer-core

const puppeteer = require('puppeteer');
const fs = require('fs');

const PROYECTOS = [
  { id: 1,  id_nexo: 3796, nombre: 'LUMA - SAN MIGUEL' },
  { id: 2,  id_nexo: 3679, nombre: 'Vista Tower' },
  { id: 3,  id_nexo: 3202, nombre: 'Supra Tower' },
  { id: 4,  id_nexo: 3683, nombre: 'Albamar | Aura' },
  { id: 5,  id_nexo: 3251, nombre: 'Proyecto Libertad' },
  { id: 6,  id_nexo: 3421, nombre: 'Quiñones Park' },
  { id: 7,  id_nexo: 4053, nombre: 'DANAUS - SURQUILLO' },
  { id: 8,  id_nexo: 3342, nombre: 'ALBORADA III - SAN MIGUEL' },
  { id: 9,  id_nexo: 3886, nombre: 'Villa Elenia' },
  { id: 10, id_nexo: 3746, nombre: 'CAPRI Santa Catalina' },
  { id: 11, id_nexo: 3899, nombre: 'ALLURE - JESÚS MARÍA' },
  { id: 12, id_nexo: 3871, nombre: 'Residencial Leyendas II' },
  { id: 13, id_nexo: 3476, nombre: 'Element' },
];

async function main() {
  const browser = await puppeteer.launch({
    headless: false, // visible para que puedas loguearte
    defaultViewport: null,
  });

  const page = await browser.newPage();

  // Ir al login primero
  console.log('Abriendo NexoAgentes...');
  await page.goto('https://admin.nexoagentes.pe/login', { waitUntil: 'networkidle2' });
  console.log('Por favor loguéate manualmente en el navegador que se abrió.');
  console.log('Luego presiona ENTER aquí para continuar...');
  await new Promise(r => process.stdin.once('data', r));

  const resultados = [];

  for (const p of PROYECTOS) {
    const url = `https://admin.nexoagentes.pe/project/${p.id_nexo}?projectTypes=1&projectTypes=2&orderBy=precio_menor&page=1`;
    console.log(`\nScrapeando: ${p.nombre} → ${url}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Esperar tabla de modelos
      await page.waitForSelector('table', { timeout: 15000 });
      await new Promise(r => setTimeout(r, 2000)); // esperar carga de imágenes

      const modelos = await page.evaluate(() => {
        const filas = document.querySelectorAll('table tbody tr');
        return Array.from(filas).map(fila => {
          // Buscar imagen en la primera celda
          const img = fila.querySelector('img');
          const celdas = fila.querySelectorAll('td');
          // El nombre del modelo suele estar en la segunda celda
          const nombreCelda = celdas[1]?.innerText?.trim() || celdas[0]?.innerText?.trim() || '';
          // Limpiar nombre — tomar solo primera línea
          const nombre = nombreCelda.split('\n')[0].trim();
          
          // Obtener src de la imagen — puede estar en src, data-src, o srcset
          let plano_url = null;
          if (img) {
            plano_url = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
            // Convertir thumbnail a imagen completa si es necesario
            if (plano_url && plano_url.includes('_t.')) {
              plano_url = plano_url.replace('_t.', '_b.');
            }
          }
          
          return { nombre, plano_url };
        }).filter(m => m.nombre && m.nombre.length > 2);
      });

      console.log(`  → ${modelos.length} modelos encontrados`);
      modelos.forEach(m => console.log(`     ${m.nombre} | plano: ${m.plano_url ? '✓' : '✗'}`));
      
      resultados.push({ id: p.id, id_nexo: p.id_nexo, nombre: p.nombre, modelos });

    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      resultados.push({ id: p.id, id_nexo: p.id_nexo, nombre: p.nombre, modelos: [] });
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();
  fs.writeFileSync('planos-resultado.json', JSON.stringify(resultados, null, 2));
  console.log('\n✅ Guardado en planos-resultado.json — súbelo al chat para integrar los planos');
}

main().catch(console.error);
