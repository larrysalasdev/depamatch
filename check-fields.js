const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { rejectUnauthorized: false }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function main() {
  // Ver campos de capa 263 (Robo agravado 2024)
  const url = 'https://arcgis3.inei.gob.pe:6443/arcgis/rest/services/Datacrim/DATACRIM002_AGS_PUNTOSDELITOS/MapServer/263/query?f=json&where=1%3D1&outFields=*&resultRecordCount=2';
  const r = await fetch(url);
  console.log('Fields:', r.fields?.map(f => f.name));
  console.log('Sample:', JSON.stringify(r.features?.[0]?.attributes));
}
main().catch(console.error);
