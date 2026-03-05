// ─── lib/data.js — FUENTE ÚNICA DE VERDAD ────────────────────────────────────
// Todos los datos de DepaMatch viven aquí.
// La app React los importa en cliente. Las páginas SEO los usan en servidor (SSG).

// ─── SCORING ENGINE ──────────────────────────────────────────────────────────
export const BENCHMARK_M2 = {
  Surquillo: 6850, "San Miguel": 6150, Lince: 5900,
  "Jesús María": 7100, "La Victoria": 6750,
};
export const DELICTIVO = {
  Surquillo: 42, "San Miguel": 31, Lince: 55, "Jesús María": 28, "La Victoria": 78,
};
export const UBICACION_TIER = {
  "Jesús María": 90, Surquillo: 87, Lince: 80, "San Miguel": 78, "La Victoria": 72,
};
const ACCESIBILIDAD_VIA = {
  "Av. Paseo de la República": 25,
  "Av. Principal": 20,
  "Av. Tomás Marsano": 20,
  "Av. La Marina": 18,
  "Av. Arenales": 18,
  "Av. Costanera": 15,
  "Jr.": 5,
  "Ca.": 3,
};
const AMENITY_PESO = {
  Piscina: 15, "Terraza rooftop": 12, "Terraza panorámica": 10, "Terraza 360°": 10,
  Coworking: 8, Gimnasio: 8, "Sala de niños": 7, "Zona kids": 7,
  "Lobby exclusivo": 8, "Lobby premium": 7, "Lobby de diseño": 6, "Lobby corporativo": 7,
  "Sala de reuniones": 6, "Sala de negocios": 7, Bicicletero: 4,
  "Zona BBQ": 5, "Área de parrillas": 5, "Terraza social": 5, "Azotea social": 6,
  "Área verde": 4, "Juegos infantiles": 4, Depósitos: 3, Lobby: 2, Terraza: 4,
};
const ACABADOS_PESO = {
  "Piso SPC": 20, "Cuarzo blanco": 18, Cuarzo: 15, Granito: 14,
  "Piso porcelanato importado": 16, "Piso porcelanato": 12, "Piso cerámico": 6,
  "Luminarias LED embutidas": 10, "Luminarias LED": 8, "Luminarias": 5,
  "Ventanas piso-techo": 12, "Ventanas doble vidrio": 9,
  "Tablero de cuarzo": 12, "Closets a medida": 10,
  "Muebles de cocina lacados": 9, "Muebles de cocina melamina": 5, "Muebles de cocina": 5,
  "Ducha italiana": 7, Tina: 8, "Pintura lavable": 3, "Pintura latex premium": 4, "Pintura latex": 3,
  "Melamine premium": 6, Melamine: 4, Porcelanato: 12, "Porcelanato importado": 15,
  Cerámica: 6, "Cerámica premium": 9, "Carpintería metálica": 6,
};
const ELECTRO_PESO = {
  "Campana extractora": 12, "Horno empotrado": 12, "Cocina a gas": 8,
  Encimera: 10, "Cooktop vitrocerámica": 11, Refrigeradora: 10,
  Lavadora: 10, Secadora: 8, "Microondas empotrado": 7, "Aire acondicionado": 10,
  "Calentador solar": 8, "Calentador a gas": 5, Lavavajillas: 8,
};

export function calcularScores(p) {
  const ubicacion = Math.min(97, UBICACION_TIER[p.distrito] || 70);
  const seguridad = Math.min(97, Math.max(20, 100 - (DELICTIVO[p.distrito] || 50)));

  let accBonus = 5;
  for (const [via, pts] of Object.entries(ACCESIBILIDAD_VIA)) {
    if (p.direccion.includes(via)) { accBonus = pts; break; }
  }
  const accDistrito = { Lince: 8, "La Victoria": 8, Surquillo: 5, "Jesús María": 4, "San Miguel": 2 };
  const accesibilidad = Math.min(97, 62 + accBonus + (accDistrito[p.distrito] || 0));

  let amenPts = 0;
  for (const a of p.amenities || []) amenPts += AMENITY_PESO[a] || 2;
  const amenities = Math.min(97, Math.max(30, Math.round(35 + amenPts)));

  let acabPts = 0;
  if (p.acabados_lista?.length) {
    for (const a of p.acabados_lista) acabPts += ACABADOS_PESO[a] || 3;
    acabPts = Math.min(50, acabPts);
  } else {
    const pm2 = p.precio_desde / p.area_desde;
    acabPts = Math.round((pm2 / (BENCHMARK_M2[p.distrito] || 6500)) * 40);
  }
  const acabados = Math.min(97, Math.max(40, Math.round(47 + acabPts)));

  let equipPts = 0;
  if (p.electrodomesticos?.length) {
    for (const e of p.electrodomesticos) equipPts += ELECTRO_PESO[e] || 5;
    equipPts = Math.min(70, equipPts);
  }
  const equipamiento = Math.min(97, Math.max(20, Math.round(20 + equipPts)));

  const bench = BENCHMARK_M2[p.distrito] || 6500;
  const precio = Math.min(97, Math.max(40, Math.round(50 + (bench * p.area_desde / p.precio_desde) * 28)));

  return { ubicacion, seguridad, accesibilidad, amenities, acabados, equipamiento, precio };
}

export function calcMatchScore(proyecto, perfil) {
  const w = perfil?.objetivo === "negocio"
    ? { ubicacion: 0.10, seguridad: 0.10, accesibilidad: 0.10, acabados: 0.10, equipamiento: 0.05, amenities: 0.05, precio: 0.40 }
    : perfil?.objetivo === "vivir"
    ? { ubicacion: 0.20, seguridad: 0.20, accesibilidad: 0.16, acabados: 0.12, equipamiento: 0.08, amenities: 0.14, precio: 0.10 }
    : { ubicacion: 0.16, seguridad: 0.16, accesibilidad: 0.14, acabados: 0.11, equipamiento: 0.07, amenities: 0.10, precio: 0.26 };
  const s = proyecto.scores;
  let score = s.ubicacion * w.ubicacion + s.seguridad * w.seguridad + s.accesibilidad * w.accesibilidad
    + s.acabados * w.acabados + s.equipamiento * w.equipamiento + s.amenities * w.amenities + s.precio * w.precio;
  score += (proyecto.reputacion - 3) * 1.5;
  if (perfil?.presupuesto && proyecto.precio_desde > perfil.presupuesto * 1.15) score -= 15;
  return Math.min(99, Math.max(30, Math.round(score)));
}

// ─── PROYECTOS ────────────────────────────────────────────────────────────────
const PROYECTOS_RAW = [
  {
    id: 1, nombre: "MATE", inmobiliaria: "Real Edificaciones SAC",
    ruc: "20562827936", direccion: "Av. Principal 499, La Calera",
    distrito: "Surquillo", lat: -12.1128, lng: -77.0003, zona: "Lima Moderna",
    precio_desde: 310500, precio_hasta: 750000, moneda: "S/",
    area_desde: 43, area_hasta: 90, dormitorios: [1, 2, 3], pisos: 17, depas: 106,
    etapa: "En Construcción", cuota_inicial_min: 10, entrega: "2026",
    amenities: ["Lobby de diseño", "Terraza panorámica", "Zona de juegos", "Gimnasio"],
    acabados_lista: ["Porcelanato", "Luminarias LED", "Muebles de cocina", "Pintura latex premium"],
    electrodomesticos: ["Campana extractora", "Cocina a gas", "Calentador a gas"],
    descripcion: "Moderno edificio en La Calera de Surquillo. 12 años de experiencia de Real Edificaciones.",
    imagen: "https://picsum.photos/seed/mate-surquillo/800/500",
    imagen_color: "#0D7C66", per: 18.5, reputacion: 4.5, banco_sponsor: "BCP",
  },
  {
    id: 2, nombre: "Principal 775", inmobiliaria: "Real Edificaciones SAC",
    ruc: "20562827936", direccion: "Av. Principal 775, La Calera",
    distrito: "Surquillo", lat: -12.1105, lng: -77.0010, zona: "Lima Moderna",
    precio_desde: 499120, precio_hasta: 920000, moneda: "S/",
    area_desde: 58, area_hasta: 120, dormitorios: [2, 3], pisos: 18, depas: 90,
    etapa: "En Construcción", cuota_inicial_min: 10, entrega: "2026",
    amenities: ["Lobby premium", "Terraza 360°", "Gimnasio", "Sala de reuniones", "Zona BBQ"],
    acabados_lista: ["Porcelanato importado", "Cuarzo", "Luminarias LED embutidas", "Muebles de cocina", "Ventanas doble vidrio"],
    electrodomesticos: ["Campana extractora", "Horno empotrado", "Cooktop vitrocerámica", "Calentador solar"],
    descripcion: "La Calera, zona exclusiva de Surquillo. A un paso de Miraflores. Acabados de primera.",
    imagen: "https://picsum.photos/seed/principal775/800/500",
    imagen_color: "#1a3a5c", per: 19.2, reputacion: 4.5, banco_sponsor: "BCP",
  },
  {
    id: 3, nombre: "Nitoa 6", inmobiliaria: "Vitaín Inmobiliaria SAC",
    ruc: "20492484831", direccion: "Ca. Los Ruiseñores 114",
    distrito: "Surquillo", lat: -12.1200, lng: -77.0050, zona: "Lima Moderna",
    precio_desde: 215000, precio_hasta: 480000, moneda: "S/",
    area_desde: 39, area_hasta: 75, dormitorios: [1, 2, 3], pisos: 14, depas: 96,
    etapa: "En Construcción", cuota_inicial_min: 5, entrega: "2026",
    amenities: ["Lobby moderno", "Terraza social", "Área de parrillas", "Bicicletero"],
    acabados_lista: ["Cerámica premium", "Luminarias LED", "Melamine", "Pintura latex"],
    electrodomesticos: ["Calentador a gas"],
    descripcion: "Vitaín Inmobiliaria (18 años). A pasos del Óvalo Higuereta.",
    imagen: "https://picsum.photos/seed/nitoa6-surq/800/500",
    imagen_color: "#1d6a8a", per: 17.8, reputacion: 4.2, banco_sponsor: "BBVA",
  },
  {
    id: 4, nombre: "Marsano 2670", inmobiliaria: "Grupo Ekko SAC",
    ruc: "20601234567", direccion: "Av. Tomás Marsano 2670",
    distrito: "Surquillo", lat: -12.1180, lng: -77.0040, zona: "Lima Moderna",
    precio_desde: 268000, precio_hasta: 560000, moneda: "S/",
    area_desde: 57, area_hasta: 95, dormitorios: [1, 2, 3], pisos: 13, depas: 117,
    etapa: "En Construcción", cuota_inicial_min: 5, entrega: "2026",
    amenities: ["Lobby", "Azotea social", "Coworking", "Gimnasio"],
    acabados_lista: ["Porcelanato", "Luminarias LED", "Melamine premium", "Pintura latex premium"],
    electrodomesticos: ["Campana extractora", "Calentador a gas"],
    descripcion: "Una cuadra del Óvalo Higuereta. Flats y dúplex modernos. Límite Miraflores.",
    imagen: "https://picsum.photos/seed/marsano2670/800/500",
    imagen_color: "#2d2d2d", per: 18.0, reputacion: 4.0, banco_sponsor: "Scotiabank",
  },
  {
    id: 5, nombre: "Park San Miguel", inmobiliaria: "Constructora Premium SAC",
    ruc: "20512345678", direccion: "Jr. Gran Mariscal Ramon Castilla 740",
    distrito: "San Miguel", lat: -12.0773, lng: -77.0842, zona: "Lima Centro-Moderna",
    precio_desde: 399900, precio_hasta: 750000, moneda: "S/",
    area_desde: 80, area_hasta: 160, dormitorios: [3], pisos: 15, depas: 70,
    etapa: "En Construcción", cuota_inicial_min: 10, entrega: "2027",
    amenities: ["Lobby exclusivo", "Piscina", "Gimnasio", "Sala de niños", "Coworking", "Terraza rooftop"],
    acabados_lista: ["Piso SPC", "Cuarzo blanco", "Luminarias LED embutidas", "Muebles de cocina", "Ventanas doble vidrio", "Carpintería metálica"],
    electrodomesticos: ["Campana extractora", "Horno empotrado", "Cooktop vitrocerámica", "Microondas empotrado", "Aire acondicionado", "Calentador solar"],
    descripcion: "Proyecto exclusivo. Mayor cantidad de áreas comunes por depa en la zona.",
    imagen: "https://picsum.photos/seed/parksanmig/800/500",
    imagen_color: "#1e40af", per: 20.5, reputacion: 4.6, banco_sponsor: "BCP",
  },
  {
    id: 6, nombre: "La Marina 3420", inmobiliaria: "Abril Grupo Inmobiliario SAC",
    ruc: "20523456789", direccion: "Av. La Marina 3420",
    distrito: "San Miguel", lat: -12.0800, lng: -77.0870, zona: "Lima Centro-Moderna",
    precio_desde: 200818, precio_hasta: 420000, moneda: "S/",
    area_desde: 42, area_hasta: 80, dormitorios: [1, 2, 3], pisos: 12, depas: 88,
    etapa: "Entrega Inmediata", cuota_inicial_min: 5, entrega: "Inmediata",
    amenities: ["Lobby", "Terraza", "Zona de parrillas", "Sala de reuniones"],
    acabados_lista: ["Cerámica", "Luminarias", "Melamine", "Pintura latex"],
    electrodomesticos: ["Calentador a gas"],
    descripcion: "Entrega inmediata en San Miguel. Cerca a Plaza San Miguel y la Costanera.",
    imagen: "https://picsum.photos/seed/marina3420/800/500",
    imagen_color: "#0369a1", per: 16.8, reputacion: 3.9, banco_sponsor: "BBVA",
  },
  {
    id: 7, nombre: "Alameda San Miguel", inmobiliaria: "Abril Grupo Inmobiliario SAC",
    ruc: "20523456789", direccion: "Av. Costanera 980",
    distrito: "San Miguel", lat: -12.0750, lng: -77.0900, zona: "Lima Centro-Moderna",
    precio_desde: 182000, precio_hasta: 350000, moneda: "S/",
    area_desde: 40, area_hasta: 72, dormitorios: [1, 2], pisos: 10, depas: 80,
    etapa: "Entrega Inmediata", cuota_inicial_min: 5, entrega: "Inmediata",
    amenities: ["Lobby", "Área verde", "Zona BBQ", "Juegos infantiles"],
    acabados_lista: ["Cerámica", "Luminarias LED", "Pintura latex"],
    electrodomesticos: ["Calentador a gas"],
    descripcion: "Junto a la Costanera, acceso a La Marina.",
    imagen: "https://picsum.photos/seed/alameda-sm/800/500",
    imagen_color: "#15803d", per: 16.2, reputacion: 4.1, banco_sponsor: "Interbank",
  },
  {
    id: 8, nombre: "Lince 360", inmobiliaria: "Abril Grupo Inmobiliario SAC",
    ruc: "20523456789", direccion: "Av. Paseo de la República 2500",
    distrito: "Lince", lat: -12.0870, lng: -77.0360, zona: "Lima Moderna",
    precio_desde: 204614, precio_hasta: 480000, moneda: "S/",
    area_desde: 37, area_hasta: 80, dormitorios: [1, 2, 3], pisos: 16, depas: 120,
    etapa: "En Planos", cuota_inicial_min: 10, entrega: "2027",
    amenities: ["Lobby", "Terraza", "Coworking", "Gimnasio", "Sala de reuniones"],
    acabados_lista: ["Porcelanato", "Luminarias LED", "Melamine premium", "Pintura latex premium"],
    electrodomesticos: ["Campana extractora", "Calentador a gas"],
    descripcion: "Sobre el Paseo de la República, Lince. Acceso directo al Metropolitano.",
    imagen: "https://picsum.photos/seed/lince360/800/500",
    imagen_color: "#7c3aed", per: 17.5, reputacion: 4.1, banco_sponsor: "Scotiabank",
  },
  {
    id: 9, nombre: "Incentric San Miguel", inmobiliaria: "Vitaín Inmobiliaria SAC",
    ruc: "20492484831", direccion: "Jr. San Martín 650",
    distrito: "San Miguel", lat: -12.0820, lng: -77.0860, zona: "Lima Centro-Moderna",
    precio_desde: 229824, precio_hasta: 490000, moneda: "S/",
    area_desde: 45, area_hasta: 90, dormitorios: [1, 2, 3], pisos: 14, depas: 102,
    etapa: "En Construcción", cuota_inicial_min: 5, entrega: "2026",
    amenities: ["Lobby", "Terraza con vista", "Zona kids", "Gimnasio", "Bicicletero"],
    acabados_lista: ["Porcelanato", "Luminarias LED", "Muebles de cocina", "Pintura latex premium"],
    electrodomesticos: ["Campana extractora", "Calentador a gas"],
    descripcion: "Vitaín Inmobiliaria (18 años). Céntrico en San Miguel, a metros de La Marina y PUCP.",
    imagen: "https://picsum.photos/seed/incentric/800/500",
    imagen_color: "#0891b2", per: 17.2, reputacion: 4.2, banco_sponsor: "GNB",
  },
  {
    id: 10, nombre: "Jesús María 698", inmobiliaria: "Ekko Grupo Inmobiliario SAC",
    ruc: "20601234567", direccion: "Av. Arenales 698",
    distrito: "Jesús María", lat: -12.0750, lng: -77.0500, zona: "Lima Moderna",
    precio_desde: 258121, precio_hasta: 590000, moneda: "S/",
    area_desde: 46, area_hasta: 100, dormitorios: [1, 2, 3], pisos: 15, depas: 95,
    etapa: "En Construcción", cuota_inicial_min: 10, entrega: "2026",
    amenities: ["Lobby de diseño", "Terraza social", "Piscina", "Gimnasio", "Sala de niños", "Coworking"],
    acabados_lista: ["Porcelanato importado", "Cuarzo", "Luminarias LED embutidas", "Muebles de cocina", "Ventanas doble vidrio"],
    electrodomesticos: ["Campana extractora", "Horno empotrado", "Cooktop vitrocerámica", "Calentador solar"],
    descripcion: "Av. Arenales, Jesús María. Zona residencial consolidada, alta plusvalía.",
    imagen: "https://picsum.photos/seed/jesusmaria698/800/500",
    imagen_color: "#b45309", per: 19.0, reputacion: 4.4, banco_sponsor: "BCP",
  },
  {
    id: 11, nombre: "La Victoria Plaza", inmobiliaria: "Desarrollo Urbano SAC",
    ruc: "20534567890", direccion: "Av. Paseo de la República 2099",
    distrito: "La Victoria", lat: -12.0640, lng: -77.0280, zona: "Lima Centro",
    precio_desde: 469000, precio_hasta: 890000, moneda: "S/",
    area_desde: 60, area_hasta: 130, dormitorios: [2, 3], pisos: 20, depas: 140,
    etapa: "En Planos", cuota_inicial_min: 10, entrega: "2028",
    amenities: ["Lobby corporativo", "Terraza panorámica", "Piscina", "Gimnasio", "Sala de negocios", "Zona kids"],
    acabados_lista: ["Piso SPC", "Cuarzo blanco", "Luminarias LED embutidas", "Muebles de cocina", "Carpintería metálica"],
    electrodomesticos: ["Campana extractora", "Horno empotrado", "Cooktop vitrocerámica", "Aire acondicionado", "Calentador solar"],
    descripcion: "Santa Catalina-La Victoria. Mayor crecimiento de plusvalía (+42% a 3 años).",
    imagen: "https://picsum.photos/seed/lavictoriaplaza/800/500",
    imagen_color: "#9d174d", per: 21.5, reputacion: 4.3, banco_sponsor: "BBVA",
  },
  {
    id: 12, nombre: "Pumacahua 1015", inmobiliaria: "Abril Grupo Inmobiliario SAC",
    ruc: "20523456789", direccion: "Jr. Brigadier Mateo Pumacahua 1015",
    distrito: "Jesús María", lat: -12.0770, lng: -77.0510, zona: "Lima Moderna",
    precio_desde: 350000, precio_hasta: 680000, moneda: "S/",
    area_desde: 52, area_hasta: 105, dormitorios: [2, 3], pisos: 14, depas: 85,
    etapa: "En Construcción", cuota_inicial_min: 10, entrega: "2026",
    amenities: ["Lobby", "Terraza BBQ", "Sala de reuniones", "Bicicletero", "Depósitos"],
    acabados_lista: ["Porcelanato importado", "Cuarzo", "Luminarias LED embutidas", "Muebles de cocina lacados"],
    electrodomesticos: ["Campana extractora", "Horno empotrado", "Encimera"],
    descripcion: "Corazón de Jesús María, cerca al Campo de Marte.",
    imagen: "https://picsum.photos/seed/pumacahua1015/800/500",
    imagen_color: "#065f46", per: 18.8, reputacion: 4.2, banco_sponsor: "BCP",
  },
];

export const PROYECTOS = PROYECTOS_RAW.map((p) => ({ ...p, scores: calcularScores(p) }));

// ─── DATOS SEO POR DISTRITO ───────────────────────────────────────────────────
export const DISTRITOS_SEO = {
  surquillo: {
    nombre: "Surquillo", slug: "surquillo", zona: "Lima Moderna",
    descripcion: "Distrito consolidado colindante con Miraflores y San Borja. Alta densidad de proyectos de estreno con excelente conectividad y creciente plusvalía.",
    precio_m2: 6850, precio_m2_anterior: 6200,
    indice_seguridad: 58, nivel_seguridad: "Moderado",
    proyeccion_plusvalia_3y: "+27%", proyeccion_plusvalia_anual: "8.2%",
    delitos_mes: 38, patrullaje: "Alto",
    transporte: ["Metropolitano Línea 1", "Av. Tomás Marsano", "Av. Angamos"],
    colegios_cercanos: ["Colegio San Agustín", "Villa María", "Recoleta"],
    hospitales_cercanos: ["Clínica Delgado", "Hospital Rebagliati"],
    faqs: [
      { q: "¿Es seguro vivir en Surquillo?", a: "Surquillo tiene índice de seguridad moderado (58/100). La zona de La Calera, donde se concentran los proyectos de estreno, tiene mayor patrullaje policial. Según DataCrim PNP registra 38 delitos/mes, un 18% por debajo del promedio de Lima." },
      { q: "¿Cuánto cuesta el m² en Surquillo?", a: "El precio promedio por m² en Surquillo es S/ 6,850 según BCRP (2024). Los proyectos de estreno oscilan entre S/ 5,600/m² y S/ 8,600/m² en La Calera." },
      { q: "¿Qué plusvalía tiene Surquillo?", a: "Surquillo proyecta 27% de plusvalía en 3 años (8.2% anual) según BCRP. La cercanía con Miraflores y la consolidación de La Calera son los principales motores." },
      { q: "¿Es buena inversión comprar en Surquillo?", a: "Sí. Con PER promedio 18x, precio m² 25% por debajo de Miraflores y proyección +27% a 3 años, Surquillo tiene excelente relación precio-crecimiento en Lima Moderna." },
    ],
  },
  "jesus-maria": {
    nombre: "Jesús María", slug: "jesus-maria", zona: "Lima Moderna",
    descripcion: "El distrito más seguro de Lima Moderna. Residencial consolidado, colinda con San Isidro. Alta demanda sostenida y menor oferta generan presión alcista de precios.",
    precio_m2: 7100, precio_m2_anterior: 6350,
    indice_seguridad: 72, nivel_seguridad: "Bajo",
    proyeccion_plusvalia_3y: "+26%", proyeccion_plusvalia_anual: "8.0%",
    delitos_mes: 19, patrullaje: "Muy Alto",
    transporte: ["Av. Brasil", "Av. Salaverry", "Av. Arenales"],
    colegios_cercanos: ["Colegio Santa Úrsula", "La Inmaculada", "San Ignacio de Loyola"],
    hospitales_cercanos: ["Clínica San Borja", "Hospital Nacional", "Clínica San Felipe"],
    faqs: [
      { q: "¿Por qué Jesús María es el distrito más seguro?", a: "Jesús María tiene el índice delictivo más bajo de Lima Moderna: solo 19 delitos/mes según DataCrim PNP. El distrito tiene patrullaje calificado como Muy Alto y amplia red de cámaras." },
      { q: "¿Cuánto cuesta el m² en Jesús María?", a: "El precio promedio por m² en Jesús María es S/ 7,100 según BCRP (2024), el más alto de Lima Moderna después de Miraflores, reflejo de la alta demanda sostenida." },
      { q: "¿Vale la pena comprar en Jesús María a ese precio?", a: "Sí, porque tiene la menor oferta de Lima Moderna, lo que sostiene precios. Con proyección +26% a 3 años y colindancia con San Isidro, el precio es justificado por fundamentales reales." },
    ],
  },
  "san-miguel": {
    nombre: "San Miguel", slug: "san-miguel", zona: "Lima Centro-Moderna",
    descripcion: "Distrito costero con acceso al mar y excelente conectividad vial. La presencia de la PUCP y el Mall Plaza generan demanda sostenida de 1 y 2 dormitorios.",
    precio_m2: 6150, precio_m2_anterior: 5700,
    indice_seguridad: 69, nivel_seguridad: "Bajo-Moderado",
    proyeccion_plusvalia_3y: "+24%", proyeccion_plusvalia_anual: "7.4%",
    delitos_mes: 22, patrullaje: "Alto",
    transporte: ["Av. La Marina", "Av. Universitaria", "Costanera"],
    colegios_cercanos: ["PUCP", "La Recoleta San Miguel", "Colegio Mater Christi"],
    hospitales_cercanos: ["Clínica San Pablo", "Hospital Naval"],
    faqs: [
      { q: "¿Vale la pena comprar en San Miguel?", a: "San Miguel ofrece el menor precio/m² de Lima Moderna (S/ 6,150) con buena seguridad y alta conectividad. Ideal para primera vivienda o inversión de entrada, especialmente 1-2 dormitorios cerca de La Marina o la PUCP." },
      { q: "¿Cuánto cuesta el m² en San Miguel?", a: "El precio promedio es S/ 6,150/m² según BCRP (2024), un 13% por debajo del promedio de Lima Moderna, convirtiéndolo en el mejor punto de entrada al mercado." },
    ],
  },
  lince: {
    nombre: "Lince", slug: "lince", zona: "Lima Moderna",
    descripcion: "Ubicación privilegiada con acceso directo al Metropolitano. En proceso de densificación con proyectos de nueva generación al precio más accesible de Lima Moderna.",
    precio_m2: 5900, precio_m2_anterior: 5500,
    indice_seguridad: 45, nivel_seguridad: "Moderado-Alto",
    proyeccion_plusvalia_3y: "+20%", proyeccion_plusvalia_anual: "6.2%",
    delitos_mes: 51, patrullaje: "Moderado",
    transporte: ["Metropolitano Paseo de la República", "Av. Arequipa", "Av. Petit Thouars"],
    colegios_cercanos: ["IEP República del Perú", "Colegio Leoncio Prado"],
    hospitales_cercanos: ["Hospital Lince", "Clínica San Borja"],
    faqs: [
      { q: "¿Lince es buena zona para vivir?", a: "Lince tiene ubicación central — acceso directo al Metropolitano, a minutos de Miraflores y San Isidro. El índice de seguridad es moderado (45/100), pero el Paseo de la República tiene mayor vigilancia." },
      { q: "¿Por qué los precios en Lince son los más bajos de Lima Moderna?", a: "Lince combina ubicación central con S/ 5,900/m², el más accesible de Lima Moderna, porque está en proceso de consolidación residencial. Eso implica mayor potencial de plusvalía para compradores tempranos." },
    ],
  },
  "la-victoria": {
    nombre: "La Victoria", slug: "la-victoria", zona: "Lima Centro",
    descripcion: "El distrito con mayor proyección de plusvalía de Lima (+42% a 3 años). Santa Catalina lidera la renovación urbana con proyectos premium junto al Paseo de la República.",
    precio_m2: 6750, precio_m2_anterior: 5800,
    indice_seguridad: 22, nivel_seguridad: "Alto",
    proyeccion_plusvalia_3y: "+42%", proyeccion_plusvalia_anual: "12.4%",
    delitos_mes: 89, patrullaje: "En mejora",
    transporte: ["Metropolitano", "Av. Paseo de la República", "Línea 1 Metro"],
    colegios_cercanos: ["Colegio La Salle", "Santa Catalina"],
    hospitales_cercanos: ["Hospital Dos de Mayo", "Clínica Maison de Santé"],
    faqs: [
      { q: "¿Por qué La Victoria tiene la mayor plusvalía de Lima?", a: "La Victoria (zona Santa Catalina) está en plena renovación urbana con acceso al Metropolitano, Línea 1 del Metro y el Paseo de la República. Con precio m² aún 27% por debajo de Miraflores, tiene el mayor potencial de apreciación: +42% proyectado a 3 años según BCRP." },
      { q: "¿Es seguro comprar en La Victoria?", a: "Hay que distinguir zonas: Santa Catalina tiene mejor seguridad que el resto del distrito. Es una compra para inversores que priorizan rentabilidad futura sobre comodidad inmediata." },
    ],
  },
};

export const COMPARATIVAS_SEO = [
  {
    slug: "surquillo-vs-jesus-maria",
    titulo: "Surquillo vs Jesús María",
    distrito_a: "surquillo", distrito_b: "jesus-maria",
    descripcion: "Dos de los distritos más demandados de Lima Moderna. Análisis completo de precios, seguridad, plusvalía y proyectos disponibles.",
    keywords: ["surquillo vs jesus maria", "comparar departamentos surquillo jesus maria", "donde comprar departamento surquillo o jesus maria"],
    veredicto: "jesus-maria",
    razon: "Jesús María gana en seguridad y precio premium sostenido. Surquillo ofrece mayor plusvalía proyectada y mejor precio de entrada.",
  },
  {
    slug: "san-miguel-vs-lince",
    titulo: "San Miguel vs Lince",
    distrito_a: "san-miguel", distrito_b: "lince",
    descripcion: "Los dos distritos más accesibles de Lima Moderna. ¿Cuál ofrece mejor relación precio-calidad-conectividad?",
    keywords: ["san miguel vs lince", "comparar san miguel lince precio m2", "donde invertir san miguel o lince"],
    veredicto: "san-miguel",
    razon: "San Miguel supera en seguridad y proyección de plusvalía. Lince es la mejor opción si priorizas precio mínimo y acceso directo al Metropolitano.",
  },
  {
    slug: "surquillo-vs-san-miguel",
    titulo: "Surquillo vs San Miguel",
    distrito_a: "surquillo", distrito_b: "san-miguel",
    descripcion: "Surquillo más premium y mejor ubicado, San Miguel más accesible y con salida al mar. Análisis para decidir según tu perfil.",
    keywords: ["surquillo vs san miguel departamentos", "precio m2 surquillo san miguel", "mejor distrito surquillo san miguel lima"],
    veredicto: "surquillo",
    razon: "Surquillo tiene mejor seguridad, mayor plusvalía y mejor valorización esperada. San Miguel gana en precio de entrada y ambiente costero.",
  },
  {
    slug: "jesus-maria-vs-lince",
    titulo: "Jesús María vs Lince",
    distrito_a: "jesus-maria", distrito_b: "lince",
    descripcion: "El más seguro vs. el más accesible. Análisis entre el precio premium de Jesús María y la ubicación estratégica de Lince.",
    keywords: ["jesus maria vs lince lima", "departamentos jesus maria lince precios", "comparar jesus maria lince seguridad"],
    veredicto: "jesus-maria",
    razon: "Jesús María tiene ventaja clara en seguridad y consolidación. Lince es la alternativa si el presupuesto no alcanza para Jesús María pero quieres Lima Moderna.",
  },
];

export const GUIAS_SEO = [
  {
    slug: "precio-m2-lima-2025",
    titulo: "Precio m² en Lima 2025: Ranking completo por distrito",
    descripcion: "Análisis actualizado del precio por metro cuadrado en Lima Moderna. Datos BCRP Q4 2024, tendencias y proyecciones para comprador e inversor.",
    keywords: ["precio m2 lima 2025", "precio metro cuadrado lima distritos", "cuanto cuesta m2 miraflores surquillo jesus maria"],
    tiempo_lectura: "8 min", categoria: "Análisis de mercado",
  },
  {
    slug: "bono-mi-vivienda-2025",
    titulo: "Bono Mi Vivienda 2025: Requisitos y cómo aplicar paso a paso",
    descripcion: "Todo sobre el Bono del Buen Pagador (BBP). Montos 2025, bancos autorizados, proyectos que aplican y proceso completo.",
    keywords: ["bono mi vivienda 2025", "bono buen pagador requisitos", "como aplicar mi vivienda fondo"],
    tiempo_lectura: "6 min", categoria: "Financiamiento",
  },
  {
    slug: "per-inmobiliario-lima",
    titulo: "PER Inmobiliario en Lima: qué es y cómo comparar proyectos",
    descripcion: "El Price-to-Earnings Ratio aplicado a inmuebles en Lima. Aprende a usarlo para identificar las mejores oportunidades de inversión.",
    keywords: ["per inmobiliario peru", "rentabilidad departamento lima", "como calcular rentabilidad departamento"],
    tiempo_lectura: "5 min", categoria: "Educación financiera",
  },
  {
    slug: "checklist-comprar-departamento-estreno",
    titulo: "Checklist: 15 puntos antes de comprar un departamento en estreno en Perú",
    descripcion: "Desde el estado registral SUNARP hasta la calificación INDECOPI. Todo lo que debes verificar antes de firmar cualquier documento.",
    keywords: ["checklist comprar departamento estreno peru", "que revisar antes comprar departamento", "como verificar inmobiliaria peru sunarp"],
    tiempo_lectura: "7 min", categoria: "Guía de compra",
  },
];

// ─── DATOS INTEGRADOS (mock hasta conectar APIs reales) ───────────────────────
export const INDECOPI_DATA = {
  "20562827936": { razon_social: "Real Edificaciones SAC", sanciones: [], estado: "Sin sanciones", calificacion: "A", ultima_consulta: "2026-02-28" },
  "20492484831": { razon_social: "Vitaín Inmobiliaria SAC", sanciones: [], estado: "Sin sanciones", calificacion: "A", ultima_consulta: "2026-02-28" },
  "20601234567": { razon_social: "Grupo Ekko SAC", sanciones: [{ fecha: "2023-06-15", motivo: "Incumplimiento de plazos", monto: "S/ 12,500", estado: "Pagada" }], estado: "Sanción histórica", calificacion: "B", ultima_consulta: "2026-02-28" },
  "20512345678": { razon_social: "Constructora Premium SAC", sanciones: [], estado: "Sin sanciones", calificacion: "A", ultima_consulta: "2026-02-28" },
  "20523456789": { razon_social: "Abril Grupo Inmobiliario SAC", sanciones: [], estado: "Sin sanciones", calificacion: "A+", ultima_consulta: "2026-02-28" },
  "20534567890": { razon_social: "Desarrollo Urbano SAC", sanciones: [{ fecha: "2024-01-10", motivo: "Publicidad engañosa", monto: "S/ 8,200", estado: "Vigente" }], estado: "Sanción vigente", calificacion: "C", ultima_consulta: "2026-02-28" },
};

export const DATACRIM_DATA = {
  Surquillo: { indice: 42, nivel: "Moderado", color: "#f59e0b", delitos_mes: 38, vs_lima: "-18%", tendencia: "↓", patrullaje: "Alto", camaras: 24, zonas_seguras: ["La Calera", "Av. Principal"] },
  "San Miguel": { indice: 31, nivel: "Bajo-Moderado", color: "#22c55e", delitos_mes: 22, vs_lima: "-38%", tendencia: "↓", patrullaje: "Alto", camaras: 31, zonas_seguras: ["Costanera", "Cerca PUCP"] },
  Lince: { indice: 55, nivel: "Moderado-Alto", color: "#f59e0b", delitos_mes: 51, vs_lima: "+8%", tendencia: "↑", patrullaje: "Moderado", camaras: 18, zonas_seguras: [] },
  "Jesús María": { indice: 28, nivel: "Bajo", color: "#22c55e", delitos_mes: 19, vs_lima: "-43%", tendencia: "↓", patrullaje: "Muy Alto", camaras: 42, zonas_seguras: ["Campo de Marte", "Av. Brasil"] },
  "La Victoria": { indice: 78, nivel: "Alto", color: "#ef4444", delitos_mes: 89, vs_lima: "+56%", tendencia: "↓", patrullaje: "En mejora", camaras: 15, zonas_seguras: ["Santa Catalina"] },
};

export const BCRP_DATA = {
  historico: [
    { año: "2019", Surquillo: 5.2, "San Miguel": 4.1, Lince: 3.8, "Jesús María": 5.8, "La Victoria": 2.1 },
    { año: "2020", Surquillo: 3.1, "San Miguel": 2.8, Lince: 2.2, "Jesús María": 3.5, "La Victoria": 1.2 },
    { año: "2021", Surquillo: 6.8, "San Miguel": 5.9, Lince: 4.5, "Jesús María": 7.1, "La Victoria": 5.5 },
    { año: "2022", Surquillo: 9.2, "San Miguel": 7.8, Lince: 6.1, "Jesús María": 9.8, "La Victoria": 11.2 },
    { año: "2023", Surquillo: 8.1, "San Miguel": 6.9, Lince: 5.8, "Jesús María": 8.5, "La Victoria": 12.5 },
    { año: "2024", Surquillo: 8.2, "San Miguel": 7.4, Lince: 6.2, "Jesús María": 8.0, "La Victoria": 12.4 },
    { año: "2025P", Surquillo: 8.5, "San Miguel": 7.6, Lince: 6.5, "Jesús María": 8.2, "La Victoria": 13.1 },
  ],
  precio_m2: { Surquillo: 6850, "San Miguel": 6150, Lince: 5900, "Jesús María": 7100, "La Victoria": 6750 },
  proyeccion_3y: { "La Victoria": "+42%", Surquillo: "+27%", "Jesús María": "+26%", "San Miguel": "+24%", Lince: "+20%" },
  ranking_plusvalia: ["La Victoria", "Surquillo", "Jesús María", "San Miguel", "Lince"],
  fuente: "BCRP — Reporte de Estabilidad Financiera",
};

export const TASAS_SBS = [
  { banco: "GNB Sudamericana", tasa: 7.33, destacado: true },
  { banco: "BanBif", tasa: 7.85, destacado: false },
  { banco: "Interbank", tasa: 8.20, destacado: false },
  { banco: "BCP", tasa: 8.45, destacado: false },
  { banco: "BBVA", tasa: 8.60, destacado: false },
  { banco: "Scotiabank", tasa: 9.10, destacado: false },
  { banco: "Pichincha", tasa: 9.85, destacado: false },
  { banco: "Caja Piura", tasa: 11.20, destacado: false },
  { banco: "Mi Banco", tasa: 17.85, destacado: false },
];
