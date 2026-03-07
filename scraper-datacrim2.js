const https = require('https');
const fs = require('fs');

const BASE = 'https://arcgis3.inei.gob.pe:6443/arcgis/rest/services/Datacrim/DATACRIM002_AGS_PUNTOSDELITOS/MapServer';

const DISTRITOS = {
  '150131': 'Surquillo', '150136': 'San Miguel', '150117': 'Jesus Maria',
  '150118': 'Lince', '150122': 'La Victoria', '150130': 'San Isidro',
  '150128': 'San Borja', '150101': 'Lima', '150116': 'Miraflores',
  '150102': 'Barranco', '150120': 'Pueblo Libre', '150121': 'Magdalena', '150140': 'Surco',
};

const MODALIDADES_2024 = {
  263: 'Robo agravado', 264: 'Robo agravado a mano armada', 265: 'Robo',
  266: 'Hurto', 267: 'Hurto agravado', 268: 'Hurto de vehiculo',
  269: 'Asalto y robo de vehiculos', 270: 'Homicidio calificado',
  271: 'Homicidio por arma de fuego', 272: 'Hurto agravado en casa habitada',
  273: 'Robo frustrado', 274: 'Robo agravado nocturno',
  275: 'Microcomercializacion de drogas', 276: 'Hurto frustrado', 277: 'Estafa y defraudaciones',
};

const GENERICOS_2024 = {
  50: 'Delitos contra el patrimonio', 51: 'Delitos contra la vida y salud',
  52: 'Delitos contra la libertad', 53: 'Otros delitos',
};

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { rejectUnauthorized: false }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function queryCount(layerId, ubigeos, field = 'ubigeo_hecho') {
  const ubiStr = ubigeos.map(u => `'${u}'`).join(',');
  const where = encodeURIComponent(`${field} IN (${ubiStr})`);
  const stats = encodeURIComponent(JSON.stringify([{ statisticType: 'count', onStatisticField: 'OBJECTID', outStatisticFieldName: 'total' }]));
  const url = `${BASE}/${layerId}/query?f=json&where=${where}&outFields=${field}&groupByFieldsForStatistics=${field}&outStatistics=${stats}`;
  try {
    const res = await fetch(url);
    const result = {};
    if (res.features) res.features.forEach(f => { result[f.attributes[field]] = f.attributes.total || 0; });
    return result;
  } catch(e) { console.error(`  Error capa ${layerId}:`, e.message); return {}; }
}

async function main() {
  const ubigeos = Object.keys(DISTRITOS);
  const resultado = {};
  ubigeos.forEach(u => { resultado[u] = { distrito: DISTRITOS[u], total_2024: 0, por_tipo: {}, por_categoria: {} }; });

  // Totales ya obtenidos
  const totales = { '150101':26068,'150102':1474,'150116':3716,'150117':10936,'150118':5190,'150120':1443,'150121':1631,'150122':10682,'150128':6341,'150130':3780,'150131':4440,'150136':3454,'150140':11715 };
  ubigeos.forEach(u => { resultado[u].total_2024 = totales[u] || 0; });

  console.log('Consultando categorías genéricas 2024...');
  for (const [layerId, nombre] of Object.entries(GENERICOS_2024)) {
    console.log(`  Capa ${layerId}: ${nombre}`);
    // Capa genérica usa CCDD+CCPP+CCDI como ubigeo — construir desde NOMBDIST o usar ubigeo_hecho
    const counts = await queryCount(parseInt(layerId), ubigeos, 'ubigeo_hecho');
    ubigeos.forEach(u => { resultado[u].por_categoria[nombre] = counts[u] || 0; });
    await new Promise(r => setTimeout(r, 600));
  }

  console.log('Consultando modalidades 2024...');
  for (const [layerId, nombre] of Object.entries(MODALIDADES_2024)) {
    console.log(`  Capa ${layerId}: ${nombre}`);
    const counts = await queryCount(parseInt(layerId), ubigeos, 'ubigeo_hecho');
    ubigeos.forEach(u => { resultado[u].por_tipo[nombre] = counts[u] || 0; });
    await new Promise(r => setTimeout(r, 600));
  }

  fs.writeFileSync('datacrim-resultado.json', JSON.stringify(resultado, null, 2));
  console.log('\n✅ Guardado en datacrim-resultado.json');
  console.log('\nPreview Surquillo:');
  const s = resultado['150131'];
  console.log('Total:', s.total_2024);
  console.log('Categorías:', s.por_categoria);
  console.log('Top tipos:', Object.entries(s.por_tipo).sort((a,b) => b[1]-a[1]).slice(0,5));
}

main().catch(console.error);
