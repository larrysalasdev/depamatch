const https = require('https');
const fs = require('fs');

const PROYECTOS = [
  { id: 1,  nombre: 'LUMA - SAN MIGUEL',        lat: -12.074269830357485, lng: -77.09553037282942 },
  { id: 2,  nombre: 'Vista Tower',               lat: -12.106446628330005, lng: -77.02698161439235 },
  { id: 3,  nombre: 'Supra Tower',               lat: -12.08057097684937,  lng: -77.09539747479998 },
  { id: 4,  nombre: 'Albamar | Aura',            lat: -12.102881899200815, lng: -77.02090817061273 },
  { id: 5,  nombre: 'Proyecto Libertad',         lat: -12.079792111220133, lng: -77.09602768461193 },
  { id: 6,  nombre: 'Quiñones Park',             lat: -12.07511376386756,  lng: -77.09063821902431 },
  { id: 7,  nombre: 'DANAUS - SURQUILLO',        lat: -12.102958671075562, lng: -77.01942388721014 },
  { id: 8,  nombre: 'ALBORADA III - SAN MIGUEL', lat: -12.07943899422627,  lng: -77.09055696838038 },
  { id: 9,  nombre: 'Villa Elenia',              lat: -12.107571057927968, lng: -77.02691071393785 },
  { id: 10, nombre: 'CAPRI Santa Catalina',      lat: -12.069745340311353, lng: -77.02361518872351 },
  { id: 11, nombre: 'ALLURE - JESÚS MARÍA',      lat: -12.07611986959548,  lng: -77.04923207264208 },
  { id: 12, nombre: 'Residencial Leyendas II',   lat: -12.074359792474498, lng: -77.09143720080594 },
  { id: 13, nombre: 'Element',                   lat: -12.107381207147446, lng: -77.01800542978195 },
];

const BASE_CALOR = 'https://arcgis3.inei.gob.pe:6443/arcgis/rest/services/Datacrim/DATACRIM003_AGS_MAPA_CALOR/MapServer/0/query';
const BASE_MOD   = 'https://arcgis3.inei.gob.pe:6443/arcgis/rest/services/Datacrim/DATACRIM002_AGS_PUNTOSDELITOS/MapServer';
const RADIO_DEG  = 0.5 / 111.0; // ~500m en grados

const MODALIDADES = {
  263: 'Robo agravado',
  264: 'Robo agravado armado',
  265: 'Robo',
  266: 'Hurto',
  267: 'Hurto agravado',
  270: 'Homicidio calificado',
  271: 'Homicidio por arma de fuego',
  275: 'Microcomercializacion drogas',
  277: 'Estafa y defraudaciones',
};

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { rejectUnauthorized: false }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function bbox(lat, lng) {
  return encodeURIComponent(JSON.stringify({
    xmin: lng - RADIO_DEG, ymin: lat - RADIO_DEG,
    xmax: lng + RADIO_DEG, ymax: lat + RADIO_DEG,
    spatialReference: { wkid: 4326 }
  }));
}

async function countCalor(lat, lng) {
  const url = `${BASE_CALOR}?f=json&where=anio%3D2024&geometry=${bbox(lat,lng)}&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&inSR=4326&returnCountOnly=true`;
  try { return (await fetchJSON(url)).count || 0; } catch { return -1; }
}

async function countModalidad(layerId, lat, lng) {
  const url = `${BASE_MOD}/${layerId}/query?f=json&where=1%3D1&geometry=${bbox(lat,lng)}&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&inSR=4326&returnCountOnly=true`;
  try { return (await fetchJSON(url)).count || 0; } catch { return 0; }
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const resultado = {};
  for (const p of PROYECTOS) {
    console.log(`\n📍 ${p.nombre}`);
    const total = await countCalor(p.lat, p.lng);
    console.log(`   Total 500m 2024: ${total}`);
    await sleep(700);

    const por_tipo = {};
    for (const [layerId, nombre] of Object.entries(MODALIDADES)) {
      const count = await countModalidad(parseInt(layerId), p.lat, p.lng);
      por_tipo[nombre] = count;
      process.stdout.write(`   ${nombre}:${count} `);
      await sleep(350);
    }
    console.log();
    resultado[p.id] = { nombre: p.nombre, lat: p.lat, lng: p.lng, radio_km: 0.5, total_500m_2024: total, por_tipo };
  }
  fs.writeFileSync('datacrim-predios.json', JSON.stringify(resultado, null, 2));
  console.log('\n✅ datacrim-predios.json generado');
}
main().catch(console.error);
