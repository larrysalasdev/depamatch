// ─── nexo-to-supabase.js ──────────────────────────────────────────────────────
// Lee nexo-raw.json (generado por nexoagentes-scraper.js)
// Convierte y hace upsert a Supabase (proyectos + modelos)
//
// USO: node nexo-to-supabase.js
// REQUIERE: SUPABASE_URL y SUPABASE_SERVICE_KEY en env vars
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Faltan env vars: SUPABASE_URL y SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Prefer': 'resolution=merge-duplicates',
};

// ─── Coordenadas por distrito ──────────────────────────────────────────────
const COORDS = {
  'Surquillo':         { lat: -12.1077, lng: -77.0227 },
  'San Miguel':        { lat: -12.0771, lng: -77.0926 },
  'Jesús María':       { lat: -12.0771, lng: -77.0537 },
  'Jesus Maria':       { lat: -12.0771, lng: -77.0537 },
  'Lince':             { lat: -12.0857, lng: -77.0340 },
  'La Victoria':       { lat: -12.0656, lng: -77.0232 },
  'Miraflores':        { lat: -12.1191, lng: -77.0283 },
  'San Borja':         { lat: -12.1008, lng: -77.0009 },
  'Magdalena del Mar': { lat: -12.0893, lng: -77.0721 },
  'Cercado de Lima':   { lat: -12.0553, lng: -77.0311 },
  'Barranco':          { lat: -12.1463, lng: -77.0211 },
  'Pueblo Libre':      { lat: -12.0769, lng: -77.0638 },
  'San Isidro':        { lat: -12.0977, lng: -77.0340 },
};

const DISTRITO_NORMALIZE = {
  'jesus maria':    'Jesús María',
  'jesus maría':    'Jesús María',
  'san miguel':     'San Miguel',
  'surquillo':      'Surquillo',
  'lince':          'Lince',
  'la victoria':    'La Victoria',
  'miraflores':     'Miraflores',
  'san borja':      'San Borja',
  'magdalena del mar': 'Magdalena del Mar',
  'magdalena':      'Magdalena del Mar',
  'cercado de lima': 'Cercado de Lima',
  'barranco':       'Barranco',
  'pueblo libre':   'Pueblo Libre',
  'san isidro':     'San Isidro',
};

function normalizeDistrito(raw) {
  const key = (raw || '').toLowerCase().trim();
  return DISTRITO_NORMALIZE[key] || raw;
}

function getCoords(distrito) {
  return COORDS[distrito] || { lat: -12.09, lng: -77.04 };
}

function normEtapa(etapa) {
  if (!etapa) return 'En Construcción';
  const e = etapa.toLowerCase();
  if (e.includes('plano')) return 'En Planos';
  if (e.includes('entrega') || e.includes('inmediata')) return 'Entrega Inmediata';
  return 'En Construcción';
}

function fixNombreModelo(nombre) {
  return (nombre || '').split('\n')[0].trim();
}

function fixModeloPrecio(modelo) {
  const match = modelo.nombre.match(/Desde S\/\.\s*([\d,\.]+)/);
  if (match) {
    return parseInt(match[1].replace(/\./g, '').replace(/,/g, '')) || modelo.precio;
  }
  if (modelo.precio < 50000) {
    const nums = modelo.nombre.match(/\b\d{5,6}\b/g);
    if (nums) return parseInt(nums[0]);
  }
  return modelo.precio;
}

async function supabaseUpsert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase ${table} error: ${err}`);
  }
  return res.json();
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  nexo-to-supabase.js — DepaMatch');
  console.log('═══════════════════════════════════════════');

  const rawPath = path.join(__dirname, 'nexo-raw.json');
  if (!fs.existsSync(rawPath)) {
    console.error('❌ No encontré nexo-raw.json');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  console.log(`✓ nexo-raw.json cargado: ${raw.length} proyectos`);

  let proyectosOk = 0;
  let modelosOk = 0;
  let errores = 0;

  for (const p of raw) {
    if (!p || !p.nombre || !p.precio_desde) continue;

    const distrito = normalizeDistrito(p.distrito);
    const coords = getCoords(distrito);

    // Modelos limpios
    const modelosLimpios = (p.modelos || [])
      .map(m => ({
        nombre: fixNombreModelo(m.nombre),
        dormitorios: (() => {
          const match = m.nombre.match(/(\d+)\s*dorm/i);
          return match ? parseInt(match[1]) : (m.dormitorios || 0);
        })(),
        banos: m.banos || 0,
        area: m.area || 0,
        precio: fixModeloPrecio(m),
        comision_pct: m.comision_pct || 2,
        unidades: m.unidades || null,
        pisos_texto: m.pisos_texto || null,
      }))
      .filter(m => m.precio > 50000 && m.nombre.length > 1);

    // Deduplicar modelos por nombre
    const modelosUnicos = modelosLimpios.filter((m, idx, arr) =>
      arr.findIndex(x => x.nombre === m.nombre) === idx
    );

    // Proyecto
    const proyecto = {
      id_nexo:             p.id_nexo,
      url_nexo:            p.url_nexo || '',
      nombre:              p.nombre,
      inmobiliaria:        p.inmobiliaria || '',
      direccion:           p.direccion || '',
      distrito,
      lat:                 coords.lat + (Math.random() - 0.5) * 0.005,
      lng:                 coords.lng + (Math.random() - 0.5) * 0.005,
      etapa:               normEtapa(p.etapa),
      fecha_entrega:       p.fecha_entrega || '',
      pisos:               p.pisos || 0,
      precio_desde:        p.precio_desde,
      dormitorios:         p.dormitorios || [],
      area_desde:          p.area_desde || 0,
      area_hasta:          p.area_hasta || 0,
      unidades_disponibles: p.unidades_disponibles || null,
      banco:               p.banco || '',
      condicion_pago:      p.condicion_pago || '',
      comision_pct:        p.comision_pct || 2,
      descripcion:         (p.descripcion || '').slice(0, 500),
      amenities:           p.amenities || [],
      fotos:               p.fotos || [],
      youtube_url:         p.youtube_url || '',
      foto_local:          p.foto_local || '',
    };

    try {
      const result = await supabaseUpsert('proyectos', proyecto);
      const proyectoId = result[0]?.id;

      if (proyectoId && modelosUnicos.length > 0) {
        // Primero borrar modelos viejos del proyecto
        await fetch(`${SUPABASE_URL}/rest/v1/modelos?proyecto_id=eq.${proyectoId}`, {
          method: 'DELETE',
          headers: HEADERS,
        });

        // Insertar modelos nuevos
        const modelosConId = modelosUnicos.map(m => ({
          ...m,
          proyecto_id: proyectoId,
          id_nexo: p.id_nexo,
        }));

        await supabaseUpsert('modelos', modelosConId);
        modelosOk += modelosUnicos.length;
      }

      proyectosOk++;
      console.log(`  ✓ ${p.nombre} — ${modelosUnicos.length} modelos`);
    } catch (err) {
      errores++;
      console.error(`  ✗ ${p.nombre}: ${err.message}`);
    }
  }

  console.log('═══════════════════════════════════════════');
  console.log(`  Proyectos: ${proyectosOk} ok, ${errores} errores`);
  console.log(`  Modelos:   ${modelosOk} actualizados`);
  console.log('═══════════════════════════════════════════');

  if (errores > 0) process.exit(1);
}

main().catch(err => {
  console.error('ERROR FATAL:', err);
  process.exit(1);
});
