// ─── nexoagentes-scraper.js ───────────────────────────────────────────────────
// Scraper autenticado para NexoAgentes.
// Entra con tu usuario, extrae todos los proyectos del catálogo,
// descarga las fotos y genera el archivo data.js listo para DepaMatch.
//
// USO:
//   node nexoagentes-scraper.js
//
// REQUISITOS:
//   npm install playwright-chromium
//
// OUTPUT:
//   /imagenes/          → fotos descargadas de cada proyecto
//   nexo-data.js        → archivo listo para copiar a lib/data.js en DepaMatch
//   nexo-raw.json       → data cruda de todos los proyectos (para debug)
// ─────────────────────────────────────────────────────────────────────────────

const { chromium } = require('playwright-chromium');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ─── CONFIGURACIÓN — EDITA ESTO ──────────────────────────────────────────────
const CONFIG = {
  email: process.env.NEXO_EMAIL || 'ls@valeinmobiliaria.com',
  password: process.env.NEXO_PASSWORD || '',
  distritos_filtro: [
    'Surquillo', 'Jesús María', 'Jesus Maria',
    'San Miguel', 'Lince', 'La Victoria',
    'Miraflores', 'San Borja', 'Magdalena',
  ],
  max_proyectos: 100,
  descargar_fotos: false,
  carpeta_fotos: './imagenes',
  headless: true,
  delay_entre_paginas: 2000,
};
// ─────────────────────────────────────────────────────────────────────────────

// Mapeo de distritos para normalizar nombres
const DISTRITO_NORMALIZE = {
  'jesus maria': 'Jesús María',
  'jesus maría': 'Jesús María',
  'san miguel': 'San Miguel',
  'surquillo': 'Surquillo',
  'lince': 'Lince',
  'la victoria': 'La Victoria',
  'miraflores': 'Miraflores',
  'san borja': 'San Borja',
  'magdalena del mar': 'Magdalena del Mar',
  'magdalena': 'Magdalena del Mar',
  'cercado de lima': 'Cercado de Lima',
  'barranco': 'Barranco',
  'pueblo libre': 'Pueblo Libre',
  'san isidro': 'San Isidro',
};

function normalizeDistrito(raw) {
  const key = (raw || '').toLowerCase().trim();
  return DISTRITO_NORMALIZE[key] || raw;
}

// Descarga una imagen desde una URL a un archivo local
function descargarImagen(url, destino) {
  return new Promise((resolve, reject) => {
    if (!url || url.includes('placeholder')) return resolve(null);
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destino);
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        descargarImagen(res.headers.location, destino).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(destino); });
    }).on('error', (err) => {
      fs.unlink(destino, () => {});
      reject(err);
    });
  });
}

function slugify(str) {
  return (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── SCRAPER PRINCIPAL ────────────────────────────────────────────────────────
async function scrapeProyecto(page, projectId, config) {
  const url = `https://admin.nexoagentes.pe/project/${projectId}?projectTypes=1&projectTypes=2`;
  console.log(`  → Scrapeando proyecto ${projectId}...`);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(1000);

    // Esperar que cargue el contenido principal
    // Esperar que Vue renderice el contenido
    await page.waitForSelector('h4.text-primary', { timeout: 15000 }).catch(() => {});
    await sleep(2000);

    const data = await page.evaluate(() => {
      const texto = (sel, fallback = '') => {
        const el = document.querySelector(sel);
        return el ? el.innerText.trim() : fallback;
      };
      const textoAll = (sel) => {
        return [...document.querySelectorAll(sel)].map(el => el.innerText.trim()).filter(Boolean);
      };

      // ── Nombre ── h4.text-primary (confirmado en DevTools)
      const nombre = texto('h4.text-primary') || texto('h4') || '';

      // ── Dirección y distrito ── p.f-14 (confirmado en DevTools)
      const pTags = [...document.querySelectorAll('p.f-14')];
      const direccion = pTags[0] ? pTags[0].innerText.trim() : '';
      const distrito = texto('p.f-14.font-weight-bold') || (pTags[1] ? pTags[1].innerText.trim() : '');

      // ── Precio ── buscar "Precio desde S/. X"
      const precioText = document.body.innerText.match(/Precio desde S\/\.\s*([\d,\.]+)/);
      const precio_desde = precioText
        ? parseInt(precioText[1].replace(/\./g, '').replace(/,/g, ''))
        : 0;

      // ── Tabla de información del proyecto ── todas las <td> en pares
      const infoRows = {};
      const allTds = [...document.querySelectorAll('td')];
      for (let i = 0; i < allTds.length - 1; i += 2) {
        const key = allTds[i].innerText.trim().toLowerCase();
        const val = allTds[i + 1].innerText.trim();
        if (key && val) infoRows[key] = val;
      }

      // ── Extraer campos de la tabla ──
      const etapa = infoRows['etapa del proyecto'] || infoRows['etapa'] || '';
      const fecha_entrega = infoRows['fecha de entrega'] || infoRows['fecha entrega'] || '';
      const banco = infoRows['financiamiento'] || '';
      const inmobiliaria = infoRows['desarrollador inmobiliario'] || infoRows['desarrollador'] || '';
      const dormitorios_text = infoRows['nº dormitorios'] || infoRows['dormitorios'] || '';
      const area_text = infoRows['área total'] || infoRows['area total'] || infoRows['área techada'] || '';
      const condicion_pago = infoRows['condición de pago'] || infoRows['condicion de pago'] || '';

      // Dormitorios: "De 1 a 3 dormitorios" → [1,2,3]
      const dormNums = dormitorios_text.match(/\d+/g) || [];
      const dMin = dormNums.length > 0 ? parseInt(dormNums[0]) : 1;
      const dMax = dormNums.length > 1 ? parseInt(dormNums[dormNums.length-1]) : dMin;
      const dormitorios = [];
      for (let d = dMin; d <= dMax; d++) dormitorios.push(d);

      // Áreas: "De 31.73 a 80.14 m2" → 31.73 / 80.14
      // Extraer áreas: "De 31.73 a 80.14 m2" → filtrar solo números con decimales reales
      const areaMatches = (area_text.match(/\d+\.\d+/g) || area_text.match(/\d+/g) || [])
        .map(parseFloat).filter(n => n > 5); // ignorar "2" de "m2"
      const area_desde = areaMatches.length > 0 ? areaMatches[0] : 0;
      const area_hasta = areaMatches.length > 1 ? areaMatches[areaMatches.length - 1] : area_desde;

      // ── Descripción ── párrafo largo debajo del título
      const parrafos = [...document.querySelectorAll('p')].filter(p => p.innerText.length > 80);
      const descripcion = parrafos[0] ? parrafos[0].innerText.trim().slice(0, 300) : '';

      // ── Amenities ── extraer solo nombres reales de áreas comunes
      // Estrategia: buscar el bloque "Áreas comunes" y tomar solo textos cortos sin números
      const AMENITY_KEYWORDS = ['gimnasio','piscina','lobby','terraza','coworking','sala','zona',
        'jardín','jardin','área verde','area verde','juegos','parrilla','bbq','lavandería',
        'laundry','bar','niños','multiuso','internet','bicicletero','deposito','depósito'];
      let amenities = [];
      // Buscar todos los textos del DOM que coincidan con keywords de amenities
      const allText = [...document.querySelectorAll('span, a, p, li, div')]
        .map(el => el.childNodes.length === 1 && el.childNodes[0].nodeType === 3
          ? el.innerText.trim() : '')
        .filter(t => {
          if (t.length < 3 || t.length > 50) return false;
          if (/\d/.test(t)) return false; // excluir textos con números
          if (t.includes('S/.') || t.includes('Ref') || t.includes('Solicitar')) return false;
          const tl = t.toLowerCase();
          return AMENITY_KEYWORDS.some(k => tl.includes(k));
        });
      amenities = [...new Set(allText)].slice(0, 20);

      // ── Fotos ── todas las imágenes del proyecto desde CloudFront
      const fotos = [...document.querySelectorAll('img')]
        .map(img => img.src || img.dataset.src || '')
        .filter(src => src.includes('cloudfront') || src.includes('nexo'))
        .filter(src => !src.includes('logo') && !src.includes('banner'))
        .slice(0, 8);

      // ── Modelos disponibles ── tabla con Modelo/Dorm/Baños/Área/Precio/Comisión
      const modelos = [];
      const tablas = [...document.querySelectorAll('table')];
      tablas.forEach(tabla => {
        const filas = tabla.querySelectorAll('tr');
        filas.forEach(fila => {
          const cells = fila.querySelectorAll('td');
          if (cells.length >= 5) {
            // Buscar precio en formato "S/. 216,500" o "Desde S/. 216,500"
          const precioRaw = cells[4].innerText || '';
          const precioMatch2 = precioRaw.match(/[\d]{2,3}[.,][\d]{3}/);
          const precioStr = precioMatch2
            ? precioMatch2[0].replace(/\./g,'').replace(/,/g,'')
            : precioRaw.replace(/[^0-9]/g, '');
            const comisionMatch = cells[5] ? cells[5].innerText.match(/([\d.]+)\s*%/) : null;
            const nombreModelo = cells[1] ? cells[1].innerText.trim() : cells[0].innerText.trim();
            if (nombreModelo && precioStr) {
              modelos.push({
                nombre: nombreModelo,
                dormitorios: parseInt(cells[2]?.innerText) || parseInt(cells[1]?.innerText) || 0,
                banos: parseInt(cells[3]?.innerText) || 0,
                area: parseFloat(cells[4]?.innerText) || 0,
                precio: parseInt(precioStr) || 0,
                comision_pct: comisionMatch ? parseFloat(comisionMatch[1]) : 2,
              });
            }
          }
        });
      });

      // ── Comisión ──
      const comision_pct = modelos.length > 0 ? modelos[0].comision_pct : 2;

      // ── YouTube ──
      const youtubeEl = document.querySelector('iframe[src*="youtube"]');
      const youtube_url = youtubeEl ? youtubeEl.src : '';

      return {
        nombre, direccion, distrito, precio_desde,
        etapa, fecha_entrega, banco, inmobiliaria,
        dormitorios, area_desde, area_hasta,
        descripcion, amenities, fotos, modelos,
        comision_pct, youtube_url, condicion_pago,
        pisos: parseInt(infoRows['pisos'] || '0') || 0,
      };
    });

    data.id_nexo = projectId;
    data.url_nexo = url;
    data.distrito = normalizeDistrito(data.distrito);

    return data;
  } catch (err) {
    console.log(`  ✗ Error en proyecto ${projectId}: ${err.message}`);
    return null;
  }
}

async function obtenerIdsProyectos(page, config) {
  console.log('Obteniendo lista de proyectos...');
  await page.goto('https://admin.nexoagentes.pe/search?projectTypes=1&projectTypes=2&orderBy=precio_menor&page=1', {
    waitUntil: 'domcontentloaded', timeout: 60000,
  });
  await sleep(2000);

  const ids = [];
  let pagina = 1;

  while (ids.length < config.max_proyectos) {
    console.log(`  Página ${pagina}...`);

    const nuevosIds = await page.evaluate(() => {
      // Buscar links a proyectos
      const links = [...document.querySelectorAll('a[href*="/project/"]')];
      return links
        .map(a => {
          const match = a.href.match(/\/project\/(\d+)/);
          return match ? parseInt(match[1]) : null;
        })
        .filter(Boolean);
    });

    const uniqueNuevos = [...new Set(nuevosIds)].filter(id => !ids.includes(id));
    if (uniqueNuevos.length === 0) break;

    ids.push(...uniqueNuevos);
    console.log(`  → ${ids.length} proyectos encontrados`);

    // Buscar botón de siguiente página
    const nextBtn = await page.$('[class*="next"]:not([disabled]), [aria-label="Next"]:not([disabled])');
    if (!nextBtn) break;

    await nextBtn.click();
    await sleep(config.delay_entre_paginas);
    pagina++;
  }

  return [...new Set(ids)].slice(0, config.max_proyectos);
}

// ─── GENERADOR DE data.js ──────────────────────────────────────────────────
function generarDataJS(proyectos) {
  const proyectosValidos = proyectos.filter(p => p && p.nombre && p.precio_desde > 0);

  const bloques = proyectosValidos.map((p, i) => {
    const slug = slugify(p.nombre);
    const imagenLocal = p.foto_local
      ? `/assets/proyectos/${path.basename(p.foto_local)}`
      : `https://picsum.photos/seed/${slug}/800/500`;

    const dormitoriosStr = p.dormitorios.length > 0
      ? p.dormitorios.join(', ')
      : '1, 2';

    const amenitiesStr = p.amenities.length > 0
      ? p.amenities.map(a => `"${a.replace(/"/g, '')}"`).join(', ')
      : '"Lobby", "Áreas comunes"';

    const etapaNorm = p.etapa.includes('Construcción') ? 'En Construcción'
      : p.etapa.includes('Planos') ? 'En Planos'
      : p.etapa.includes('Entrega') || p.etapa.includes('entrega') ? 'Entrega Inmediata'
      : 'En Construcción';

    const entrega = p.fecha_entrega
      ? p.fecha_entrega.match(/\d{4}/) ? p.fecha_entrega.match(/\d{4}/)[0] : p.fecha_entrega
      : '2027';

    return `  {
    id: ${i + 1},
    id_nexo: ${p.id_nexo},
    nombre: "${p.nombre.replace(/"/g, '')}",
    inmobiliaria: "${(p.inmobiliaria || '').replace(/"/g, '')}",
    direccion: "${(p.direccion || '').replace(/"/g, '')}",
    distrito: "${p.distrito}",
    lat: 0, lng: 0, // TODO: geocodificar
    zona: "Lima",
    precio_desde: ${p.precio_desde},
    precio_hasta: ${p.modelos.length > 0 ? Math.max(...p.modelos.map(m => m.precio || p.precio_desde)) : p.precio_desde},
    moneda: "S/",
    area_desde: ${p.area_desde || 40},
    area_hasta: ${p.area_hasta || p.area_desde || 100},
    dormitorios: [${dormitoriosStr}],
    pisos: ${p.pisos || 15},
    etapa: "${etapaNorm}",
    cuota_inicial_min: ${p.condicion_pago ? parseInt(p.condicion_pago) || 10 : 10},
    entrega: "${entrega}",
    banco_sponsor: "${(p.banco || 'BCP').replace(/"/g, '')}",
    amenities: [${amenitiesStr}],
    acabados_lista: [],
    electrodomesticos: [],
    descripcion: "${(p.descripcion || '').replace(/"/g, '').replace(/\n/g, ' ').slice(0, 200)}",
    imagen: "${imagenLocal}",
    imagen_color: "#1a3a5c",
    per: 18.0,
    reputacion: 4.0,
    comision_pct: ${p.comision_pct || 2},
    url_nexo: "${p.url_nexo}",
    modelos: ${JSON.stringify(p.modelos, null, 4).replace(/\n/g, '\n    ')},
  }`;
  });

  return `// ─── GENERADO AUTOMÁTICAMENTE POR nexoagentes-scraper.js ────────────────────
// Fecha: ${new Date().toISOString()}
// Proyectos: ${proyectosValidos.length}
// NO EDITAR MANUALMENTE — regenerar corriendo: node nexoagentes-scraper.js
// ─────────────────────────────────────────────────────────────────────────────

export const PROYECTOS_NEXO = [
${bloques.join(',\n')}
];
`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  NexoAgentes Scraper — DepaMatch');
  console.log('═══════════════════════════════════════════');

  // Crear carpeta de fotos
  if (CONFIG.descargar_fotos && !fs.existsSync(CONFIG.carpeta_fotos)) {
    fs.mkdirSync(CONFIG.carpeta_fotos, { recursive: true });
  }

  const browser = await chromium.launch({ headless: CONFIG.headless });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  console.log('\n[1/4] Iniciando sesión...');
  await page.goto('https://admin.nexoagentes.pe/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(3000);
  await page.waitForSelector('input[type="email"], input[name="email"], #email', { timeout: 15000 }).catch(() => {});
  await page.fill('input[type="email"], input[name="email"], #email', CONFIG.email).catch(() => {});
  await sleep(500);
  await page.fill('input[type="password"], input[name="password"], #password', CONFIG.password).catch(() => {});
  await sleep(500);
  await page.click('button[type="submit"], input[type="submit"], [class*="login-btn"], [class*="submit"]').catch(() => {});
  await sleep(4000);

  // Verificar login exitoso
  const currentUrl = page.url();
  if (currentUrl.includes('login')) {
    console.log('✗ ERROR: Login fallido. Verifica email y contraseña en CONFIG.');
    await browser.close();
    process.exit(1);
  }
  console.log('✓ Login exitoso');

  // ── OBTENER IDs DE PROYECTOS ───────────────────────────────────────────────
  console.log('\n[2/4] Obteniendo lista de proyectos...');
  const ids = await obtenerIdsProyectos(page, CONFIG);
  console.log(`✓ ${ids.length} proyectos encontrados`);

  // ── SCRAPEAR CADA PROYECTO ─────────────────────────────────────────────────
  console.log('\n[3/4] Extrayendo datos de cada proyecto...');
  const proyectos = [];

  for (let i = 0; i < ids.length; i++) {
    console.log(`[${i + 1}/${ids.length}] Proyecto ID: ${ids[i]}`);
    const data = await scrapeProyecto(page, ids[i], CONFIG);

    if (!data) continue;

    // Filtrar por distrito si está configurado
    if (CONFIG.distritos_filtro.length > 0) {
      const distritoNorm = data.distrito.toLowerCase();
      const enFiltro = CONFIG.distritos_filtro.some(d =>
        distritoNorm.includes(d.toLowerCase()) || d.toLowerCase().includes(distritoNorm)
      );
      if (!enFiltro) {
        console.log(`  ↷ Saltando (distrito "${data.distrito}" no está en filtro)`);
        continue;
      }
    }

    // Descargar foto principal
    if (CONFIG.descargar_fotos && data.fotos.length > 0) {
      const ext = data.fotos[0].split('?')[0].split('.').pop() || 'jpg';
      const filename = `${slugify(data.nombre)}-${data.id_nexo}.${ext}`;
      const destino = path.join(CONFIG.carpeta_fotos, filename);

      if (!fs.existsSync(destino)) {
        try {
          await descargarImagen(data.fotos[0], destino);
          data.foto_local = destino;
          console.log(`  ✓ Foto descargada: ${filename}`);
        } catch (e) {
          console.log(`  ✗ No se pudo descargar foto: ${e.message}`);
        }
      } else {
        data.foto_local = destino;
        console.log(`  ✓ Foto ya existe: ${filename}`);
      }
    }

    proyectos.push(data);
    await sleep(CONFIG.delay_entre_paginas);
  }

  await browser.close();

  // ── GENERAR ARCHIVOS ───────────────────────────────────────────────────────
  console.log('\n[4/4] Generando archivos...');

  // Raw JSON para debug
  fs.writeFileSync('nexo-raw.json', JSON.stringify(proyectos, null, 2));
  console.log(`✓ nexo-raw.json — datos crudos de ${proyectos.length} proyectos`);

  // data.js para DepaMatch
  const dataJS = generarDataJS(proyectos);
  fs.writeFileSync('nexo-data.js', dataJS);
  console.log(`✓ nexo-data.js — listo para copiar a DepaMatch`);

  // Resumen
  console.log('\n═══════════════════════════════════════════');
  console.log('  COMPLETADO');
  console.log('═══════════════════════════════════════════');
  console.log(`  Proyectos scrapeados:  ${proyectos.length}`);
  console.log(`  Fotos descargadas:     ${proyectos.filter(p => p.foto_local).length}`);
  console.log('');
  console.log('  PRÓXIMOS PASOS:');
  console.log('  1. Revisar nexo-raw.json para verificar los datos');
  console.log('  2. Copiar el contenido de nexo-data.js a depamatch-next/lib/data.js');
  console.log('  3. Copiar la carpeta imagenes/ a depamatch-next/public/assets/proyectos/');
  console.log('  4. git add . && git commit -m "update proyectos" && git push');
  console.log('  5. Vercel hace el rebuild automático en ~1 minuto');
  console.log('═══════════════════════════════════════════');
}

main().catch(err => {
  console.error('ERROR FATAL:', err);
  process.exit(1);
});
