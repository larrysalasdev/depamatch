// ─── lib/data.js — FUENTE ÚNICA DE VERDAD ────────────────────────────────────
// Todos los datos de DepaMatch viven aquí.
// La app React los importa en cliente. Las páginas SEO los usan en servidor (SSG).

// ─── SCORING ENGINE v2 ───────────────────────────────────────────────────────
// Datos BCRP/ASEI/INEI actualizados 2024-2025
export const BENCHMARK_M2 = {
  Surquillo: 6850, "San Miguel": 6150, Lince: 5900,
  "Jesús María": 7100, "La Victoria": 6750,
  Magdalena: 6400, "Pueblo Libre": 6100,
};
export const DELICTIVO = {
  Surquillo: 42, "San Miguel": 31, Lince: 55, "Jesús María": 28, "La Victoria": 78,
};
export const UBICACION_TIER = {
  "Jesús María": 90, Surquillo: 87, Lince: 80, "San Miguel": 78, "La Victoria": 72,
};
const ACCESIBILIDAD_VIA = {
  "Av. Paseo de la República": 25, "Av. Principal": 20,
  "Av. Tomás Marsano": 20, "Av. La Marina": 18,
  "Av. Arenales": 18, "Av. Costanera": 15, "Jr.": 5, "Ca.": 3,
};

// ── AMENITIES: calidad sobre cantidad ────────────────────────────────────────
// Score base: 40 pts (proyecto sin áreas comunes = exclusividad, no penalización)
// Cada amenity suma según su valor diferencial real de mercado.
// Máximo efectivo: ~60 pts adicionales → score 97 con 3-4 amenities diferenciales.
const AMENITY_PESO = {
  // Diferencial alto — exclusivos o poco comunes en Lima Moderna
  "Piscina climatizada": 18, "Piscina": 14, "Coworking": 13,
  "Terraza rooftop": 13, "Terraza panorámica": 12, "Terraza 360°": 12,
  "Sala de cine": 11, "Squash": 11, "Spa": 12, "Sauna": 9,
  "Pet zone": 8, "Bicicletero techado": 7,
  // Diferencial medio — valorados pero comunes en proyectos nuevos
  "Gimnasio": 8, "Lobby premium": 9, "Lobby de diseño": 8,
  "Sala Bar": 7, "Jardin interior": 8, "Jardín interior": 8,
  "Sala de Niños": 6, "Zona kids": 6, "Área de juegos para niños": 6,
  "Sala de usos Múltiples": 5, "Terraza social": 5, "Azotea social": 6,
  "Zona de Lavandería": 4, "Sala de reuniones": 6,
  // Básicos — presentes en casi todo proyecto nuevo
  "Lobby": 3, "Terraza": 4, "Zona de Parrillas": 4, "Jardin de niños": 5,
};
// Bonus por cantidad RAZONABLE (3-5 amenities bien elegidos > 8 mediocres)
// Se aplica como factor, no suma lineal
function calcAmenScore(amenities) {
  const lista = amenities || [];
  let pts = 0;
  for (const a of lista) pts += AMENITY_PESO[a] || 2;
  // Factor de rendimiento decreciente: cada amenity adicional suma menos
  // Base 40 = proyecto sin áreas comunes (exclusividad o producto boutique)
  // Un proyecto con 0 amenities NO es penalizado, es un producto diferente
  const base = lista.length === 0 ? 42 : 40; // bonus mínimo si apostó por exclusividad
  const score = base + Math.round(pts * (lista.length <= 3 ? 1.0 : lista.length <= 6 ? 0.85 : 0.70));
  return Math.min(97, Math.max(40, score));
}

// ── ACABADOS: lógica según tu especificación de mercado ──────────────────────
// Prioridades: SPC > porcelanato importado > porcelanato | cuarzo > granito |
// LED embutidas > LED | cerraduras smart | domótica | muebles lacados > melamina
const ACABADOS_PESO = {
  // PISOS — diferencial máximo
  "Piso SPC 5.5mm": 24, "Piso SPC": 20,
  "Piso porcelanato importado": 16, "Porcelanato importado": 16,
  "Piso porcelanato": 12, "Porcelanato": 12,
  "Piso cerámico": 5, "Cerámica premium": 8, "Cerámica": 5,
  // MESADAS COCINA
  "Mesada de cuarzo": 16, "Tablero de cuarzo": 16, "Cuarzo blanco": 16, "Cuarzo": 14,
  "Mesada de granito": 10, "Granito": 10,
  "Mesada de acero": 6,
  // MUEBLES COCINA
  "Muebles de cocina lacados": 11, "Muebles de cocina melamina premium": 7,
  "Muebles de cocina melamina": 5, "Muebles de cocina": 5,
  // ILUMINACIÓN
  "Luminarias LED embutidas": 12, "Luminarias LED": 9, "Luminarias": 5,
  // TECNOLOGÍA / DOMÓTICA — diferencial top
  "Panel domótico": 20, "Domótica": 18, "Home automation": 18,
  "Cerradura inteligente": 12, "Cerradura digital": 10, "Cerradura smart": 12,
  "Tomacorrientes USB": 6, "Tomacorrientes inteligentes": 9,
  // VENTANAS
  "Ventanas piso-techo": 13, "Ventanas doble vidrio": 10, "Muro cortina": 14,
  // CLOSETS Y CARPINTERÍA
  "Closets a medida": 11, "Closets en melamina": 6,
  "Melamine premium": 7, "Melamine": 4,
  // BAÑOS
  "Ducha italiana": 8, "Tina": 9, "Sanitarios importados": 7,
  // PINTURA — papel tapiz es estándar, pintura premium es diferencial
  "Pintura latex premium": 6, "Pintura lavable": 3, "Pintura latex": 3,
  "Papel tapiz": 3,
  // OTROS
  "Piso SPC": 20, "Carpintería metálica": 6,
};

// ── EQUIPAMIENTO: artefactos entregados + extras diferenciales ───────────────
// La cantidad Y calidad de lo que se entrega como regalo importa.
// Extras como mantenimiento gratis, alianzas con hoteles/amenities externos, etc.
const ELECTRO_PESO = {
  // Electrodomésticos de cocina — lo más común como regalo
  "Cocina empotrada": 14, "Encimera a gas": 12, "Cooktop vitrocerámica": 13,
  "Horno empotrado": 13, "Campana extractora": 11, "Microondas empotrado": 9,
  "Refrigeradora": 12, "Lavavajillas": 10,
  // Lavandería
  "Lavadora": 11, "Secadora": 9, "Lavaseca": 14,
  // Climatización — diferencial alto en Lima
  "Aire acondicionado": 12, "Aire acondicionado por habitación": 15,
  "Calentador solar": 9, "Calentador a gas": 6, "Termo eléctrico": 5,
  // EXTRAS DIFERENCIALES — los que marcan la diferencia real
  "1 año mantenimiento gratis": 15,
  "6 meses mantenimiento gratis": 9,
  "Alianza amenities hotel": 18, "Acceso club privado": 15,
  "Seguro multirriesgo 1 año": 10,
  "Membresía gimnasio externo": 8,
  "Cocina a gas": 8,
};

export function calcularScores(p) {
  // ── Ubicación (datos BCRP/DISTRITOS actualizado) ──
  const ubicacion = Math.min(97, UBICACION_TIER[p.distrito] || 70);

  // ── Seguridad (DataCrim PNP 2024) ──
  const seguridad = Math.min(97, Math.max(20, 100 - (DELICTIVO[p.distrito] || 50)));

  // ── Accesibilidad ──
  let accBonus = 5;
  for (const [via, pts] of Object.entries(ACCESIBILIDAD_VIA)) {
    if (p.direccion.includes(via)) { accBonus = pts; break; }
  }
  const accDistrito = { Lince: 8, "La Victoria": 8, Surquillo: 5, "Jesús María": 4, "San Miguel": 2 };
  const accesibilidad = Math.min(97, 62 + accBonus + (accDistrito[p.distrito] || 0));

  // ── Amenities: calidad > cantidad, sin penalizar proyectos boutique ──
  const amenities = calcAmenScore(p.amenities);

  // ── Acabados: datos reales si existen, fallback por precio/m² representativo ──
  let acabPts = 0;
  if (p.acabados_lista?.length) {
    for (const a of p.acabados_lista) acabPts += ACABADOS_PESO[a] || 3;
    acabPts = Math.min(55, acabPts);
  } else {
    // Fallback: precio/m² representativo (promedio rango) vs benchmark distrito
    const pm2Rep = (p.precio_desde + (p.precio_hasta || p.precio_desde)) /
                   (p.area_desde + (p.area_hasta || p.area_desde));
    const ratio = pm2Rep / (BENCHMARK_M2[p.distrito] || 6500);
    // ratio > 1.05 = premium, 0.80-1.05 = medio, < 0.80 = básico
    acabPts = ratio > 1.10 ? 42 : ratio > 1.00 ? 34 : ratio > 0.85 ? 26 : ratio > 0.70 ? 16 : 8;
  }
  const acabados = Math.min(97, Math.max(40, Math.round(47 + acabPts)));

  // ── Equipamiento: artefactos + extras diferenciales ──
  let equipPts = 0;
  if (p.electrodomesticos?.length) {
    for (const e of p.electrodomesticos) equipPts += ELECTRO_PESO[e] || 5;
    equipPts = Math.min(75, equipPts);
  }
  // Extras diferenciales fuera de electrodomésticos
  for (const ex of p.extras_equipamiento || []) {
    equipPts += ELECTRO_PESO[ex] || 5;
  }
  equipPts = Math.min(75, equipPts);
  const equipamiento = Math.min(97, Math.max(20, Math.round(20 + equipPts)));

  // ── Precio: relación valor/precio vs benchmark del distrito ──
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

// ─── PROYECTOS (v2) ────────────────────────────────────────────────────────────────
const PROYECTOS_RAW = [
  {
    id: 1, nombre: "LUMA - SAN MIGUEL", inmobiliaria: "GRUPO MG",
    ruc: "", direccion: "Av. La Paz 1641",
    distrito: "San Miguel", lat: -12.074269830357485, lng: -77.09553037282942, zona: "Lima Moderna",
    precio_desde: 214650, precio_hasta: 369552, moneda: "S/",
    area_desde: 40.33, area_hasta: 63.67,
    dormitorios: [1, 2, 3], pisos: 15, depas: 105,
    depas_total: 219, depas_total: 219,
    etapa: "En Construcción", cuota_inicial_min: 50, entrega: "2027",
    amenities: ["Gimnasio", "Lobby", "Piscina", "Sala Bar", "Sala de Niños", "Sala de usos Múltiples", "Zona de Parrillas"],
    acabados_lista: [],
    electrodomesticos: [],
    extras_equipamiento: [],
    descripcion: "Proyecto moderno, diseño enfocado en la eficiencia energética y la funcionalidad, con departamentos de espacios amplios y luminosos. Departamentos de 1 y 2 dormitorios. Diseñado para brindar una exper",
    imagen: "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-68f7bc577175b_b.jpg",
    imagen_color: "#1a4a2e", per: 18.5, reputacion: 4, banco_sponsor: "INTERBANK",
    fotos: ["https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-68f7bc577175b_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-695ff055d7b98_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-68f7bc6ede1f3_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-68f7bc87bb746_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-68f7bc9c8d00a_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-68f7bcb8ac65a_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-68f7bcd51e769_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-68f7bceaca2ae_b.jpg"],
    youtube_url: "https://www.youtube.com/embed/-933qdQzqOY?picture-in-picture=1&accelerometer=1&gyroscope=1",
    modelos: [
      {
            "nombre": "Flat A9",
            "dormitorios": 1,
            "banos": 1,
            "area": 40.7,
            "precio": 216500,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e1fa25c23d_xm.png"
      },
      {
            "nombre": "Flat A8",
            "dormitorios": 1,
            "banos": 1,
            "area": 40.48,
            "precio": 219448,
            "unidades": 7,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e1f72a7011_xm.png"
      },
      {
            "nombre": "Flat A7",
            "dormitorios": 3,
            "banos": 2,
            "area": 63.04,
            "precio": 340808,
            "unidades": 7,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/planos-luma-san-miguel-68b86b5cef611_xm.png"
      },
      {
            "nombre": "Flat A6b",
            "dormitorios": 2,
            "banos": 2,
            "area": 63.67,
            "precio": 369552,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/planos-luma-san-miguel-68b86b1931215_xm.png"
      },
      {
            "nombre": "Flat A6",
            "dormitorios": 2,
            "banos": 2,
            "area": 53.05,
            "precio": 299470,
            "unidades": 7,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e1f079eaaa_xm.png"
      },
      {
            "nombre": "Flat A5b",
            "dormitorios": 2,
            "banos": 2,
            "area": 55.27,
            "precio": 322512,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e1bd17593c_xm.png"
      },
      {
            "nombre": "Flat A5",
            "dormitorios": 2,
            "banos": 2,
            "area": 55.66,
            "precio": 291300,
            "unidades": 10,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e1ee40a216_xm.png"
      },
      {
            "nombre": "Flat A4",
            "dormitorios": 2,
            "banos": 2,
            "area": 55.79,
            "precio": 303108,
            "unidades": 9,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e1eb8b458e_xm.png"
      },
      {
            "nombre": "Flat A3",
            "dormitorios": 1,
            "banos": 1,
            "area": 40.43,
            "precio": 215150,
            "unidades": 7,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e1e25c761d_xm.png"
      },
      {
            "nombre": "Flat A16",
            "dormitorios": 2,
            "banos": 2,
            "area": 50.96,
            "precio": 267800,
            "unidades": 6,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e20d35984a_xm.png"
      },
      {
            "nombre": "Flat A15",
            "dormitorios": 2,
            "banos": 2,
            "area": 51.38,
            "precio": 269900,
            "unidades": 8,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e20b075dd8_xm.png"
      },
      {
            "nombre": "Flat A14",
            "dormitorios": 2,
            "banos": 2,
            "area": 52.46,
            "precio": 275300,
            "unidades": 7,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e2091e843b_xm.png"
      },
      {
            "nombre": "Flat A13",
            "dormitorios": 2,
            "banos": 2,
            "area": 51.9,
            "precio": 262120,
            "unidades": 7,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e2073c0f55_xm.png"
      },
      {
            "nombre": "Flat A12",
            "dormitorios": 2,
            "banos": 2,
            "area": 50.81,
            "precio": 272131,
            "unidades": 6,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e203f582c4_xm.png"
      },
      {
            "nombre": "Flat A11",
            "dormitorios": 2,
            "banos": 2,
            "area": 51.03,
            "precio": 268150,
            "unidades": 6,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e2004c4cbc_xm.png"
      },
      {
            "nombre": "Flat A10",
            "dormitorios": 2,
            "banos": 2,
            "area": 51.07,
            "precio": 268350,
            "unidades": 8,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e1fc5e0c55_xm.png"
      },
      {
            "nombre": "Flat A1",
            "dormitorios": 1,
            "banos": 1,
            "area": 40.33,
            "precio": 214650,
            "unidades": 7,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e1de1add5d_xm.png"
      }
],
  },
  {
    id: 2, nombre: "Vista Tower", inmobiliaria: "QUATRO INMOBILIARIA",
    ruc: "", direccion: "Av. Tomas Marsano 2619, Surquillo",
    distrito: "Surquillo", lat: -12.106446628330005, lng: -77.02698161439235, zona: "Lima Moderna",
    precio_desde: 228252, precio_hasta: 476104, moneda: "S/",
    area_desde: 68.5, area_hasta: 68.5,
    dormitorios: [1, 2, 3], pisos: 15, depas: 74,
    depas_total: null, depas_total: null,
    etapa: "En Construcción", cuota_inicial_min: 20, entrega: "2027",
    amenities: ["Gimnasio", "Lobby", "Sala de Niños", "Sala de usos Múltiples", "Terraza", "Zona de Lavandería", "Zona de Parrillas"],
    acabados_lista: [],
    electrodomesticos: [],
    extras_equipamiento: [],
    descripcion: "Imagina despertar cada día con la serenidad de la naturaleza a tus pies. Con salida directa a parque, VistaTower te invita a descubrir un espacio donde el parque se convierte en tu extensión personal.",
    imagen: "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-6984c7c97f2ba_b.jpg",
    imagen_color: "#1a3a5c", per: 18.5, reputacion: 4, banco_sponsor: "SCOTIABANK",
    fotos: ["https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-6984c7c97f2ba_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-68f66c19bfcb9_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-68f669dad03c9_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-68f6694586b26_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-68f668e407324_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-68f668d53c18f_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-68f668c99d747_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-68f668aef0247_b.jpg"],
    youtube_url: "https://www.youtube.com/embed/qU50koZTqqg?picture-in-picture=1&accelerometer=1&gyroscope=1",
    modelos: [
      {
            "nombre": "Flat J",
            "dormitorios": 2,
            "banos": 2,
            "area": 57.5,
            "precio": 392185,
            "unidades": 9,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913ae4069f2f_xm.jpg"
      },
      {
            "nombre": "Flat I",
            "dormitorios": 2,
            "banos": 2,
            "area": 52.5,
            "precio": 360821,
            "unidades": 10,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913ae3184483_xm.jpg"
      },
      {
            "nombre": "Flat H",
            "dormitorios": 2,
            "banos": 2,
            "area": 49.5,
            "precio": 360292,
            "unidades": 8,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-698d0aa7363a9_xm.jpg"
      },
      {
            "nombre": "Flat G",
            "dormitorios": 1,
            "banos": 1,
            "area": 41,
            "precio": 313763,
            "unidades": 6,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913ae0d1ca34_xm.jpg"
      },
      {
            "nombre": "Flat F",
            "dormitorios": 1,
            "banos": 1,
            "area": 28,
            "precio": 228252,
            "unidades": 6,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913adfc58305_xm.jpg"
      },
      {
            "nombre": "Flat E",
            "dormitorios": 2,
            "banos": 2,
            "area": 51,
            "precio": 371469,
            "unidades": 8,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913adecafd15_xm.jpg"
      },
      {
            "nombre": "Flat C",
            "dormitorios": 1,
            "banos": 1,
            "area": 36,
            "precio": 280867,
            "unidades": 12,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913adc928ab6_xm.jpg"
      },
      {
            "nombre": "Flat B",
            "dormitorios": 3,
            "banos": 2,
            "area": 68.5,
            "precio": 476104,
            "unidades": 12,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913adb482d7a_xm.jpg"
      },
      {
            "nombre": "Flat A",
            "dormitorios": 1,
            "banos": 1,
            "area": 38.5,
            "precio": 302396,
            "unidades": 3,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913ad9d0a63e_xm.jpg"
      }
],
  },
  {
    id: 3, nombre: "Supra Tower", inmobiliaria: "QUATRO INMOBILIARIA",
    ruc: "", direccion: "Avenida Los Patriotas 415",
    distrito: "San Miguel", lat: -12.08057097684937, lng: -77.09539747479998, zona: "Lima Moderna",
    precio_desde: 234288, precio_hasta: 535297, moneda: "S/",
    area_desde: 101.5, area_hasta: 101.5,
    dormitorios: [1, 2], pisos: 15, depas: 85,
    depas_total: null, depas_total: null,
    etapa: "En Construcción", cuota_inicial_min: 20, entrega: "2026",
    amenities: ["Gimnasio", "Jardin de niños", "Lobby", "Piscina", "Sala Bar", "Sala de Niños", "Sala de usos Múltiples", "Terraza", "Zona de Parrillas"],
    acabados_lista: [],
    electrodomesticos: [],
    extras_equipamiento: [],
    descripcion: "Supra es un moderno proyecto en San Miguel, en una ubicación estratégica y en un vecindario familiar para sentirse en casa todos los días.",
    imagen: "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-6984c7a4eb4ca_b.jpg",
    imagen_color: "#1a4a2e", per: 18.5, reputacion: 4, banco_sponsor: "BCP",
    fotos: ["https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-6984c7a4eb4ca_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-68f67552d5972_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-68f675440dad6_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-68f676e9d7e52_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-68f67a1b0328c_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-68f67a10e7f76_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-68f67a07ce70a_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-68f679fe38b35_b.jpg"],
    youtube_url: "https://www.youtube.com/embed/5nYyn-V5PzE?picture-in-picture=1&accelerometer=1&gyroscope=1",
    modelos: [
      {
            "nombre": "Flat S",
            "dormitorios": 2,
            "banos": 2,
            "area": 53.5,
            "precio": 331696,
            "unidades": 9,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/planos-supra-tower-692786d6a0a70_xm.jpg"
      },
      {
            "nombre": "Flat R",
            "dormitorios": 2,
            "banos": 2,
            "area": 52.5,
            "precio": 343156,
            "unidades": 2,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/planos-supra-tower-692786b5a7bcc_xm.jpg"
      },
      {
            "nombre": "Flat P",
            "dormitorios": 2,
            "banos": 2,
            "area": 55,
            "precio": 333892,
            "unidades": 12,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/planos-supra-tower-6927869f3ebba_xm.jpg"
      },
      {
            "nombre": "Flat M",
            "dormitorios": 2,
            "banos": 2,
            "area": 101.5,
            "precio": 535297,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/planos-supra-tower-6927865baaa17_xm.jpg"
      },
      {
            "nombre": "Flat K",
            "dormitorios": 2,
            "banos": 2,
            "area": 84.7,
            "precio": 485627,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/planos-supra-tower-692786326b798_xm.jpg"
      },
      {
            "nombre": "Flat J",
            "dormitorios": 1,
            "banos": 1,
            "area": 52,
            "precio": 352767,
            "unidades": 9,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913ae4069f2f_xm.jpg"
      },
      {
            "nombre": "Flat G",
            "dormitorios": 2,
            "banos": 2,
            "area": 58,
            "precio": 346645,
            "unidades": 6,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913ae0d1ca34_xm.jpg"
      },
      {
            "nombre": "Flat F",
            "dormitorios": 2,
            "banos": 2,
            "area": 57.3,
            "precio": 342461,
            "unidades": 6,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913adfc58305_xm.jpg"
      },
      {
            "nombre": "Flat E2",
            "dormitorios": 1,
            "banos": 1,
            "area": 34.3,
            "precio": 234288,
            "unidades": 11,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/planos-supra-tower-6927856fa970a_xm.jpg"
      },
      {
            "nombre": "Flat E1",
            "dormitorios": 1,
            "banos": 1,
            "area": 33,
            "precio": 248262,
            "unidades": 3,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/planos-supra-tower-6927855dc6fc0_xm.jpg"
      },
      {
            "nombre": "Flat D",
            "dormitorios": 2,
            "banos": 2,
            "area": 65.5,
            "precio": 393503,
            "unidades": 10,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913addad2702_xm.jpg"
      },
      {
            "nombre": "Flat B",
            "dormitorios": 2,
            "banos": 2,
            "area": 62.3,
            "precio": 401135,
            "unidades": 12,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913adb482d7a_xm.jpg"
      },
      {
            "nombre": "Flat A",
            "dormitorios": 2,
            "banos": 2,
            "area": 66,
            "precio": 417482,
            "unidades": 3,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913ad9d0a63e_xm.jpg"
      }
],
  },
  {
    id: 4, nombre: "Albamar | Aura", inmobiliaria: "ALBAMAR GRUPO INMOBILIARIO",
    ruc: "", direccion: "Calle Gerard Blanchere 103 Esq Av. Tomás Marsano 1649, Surquillo",
    distrito: "Surquillo", lat: -12.102881899200815, lng: -77.02090817061273, zona: "Lima Moderna",
    precio_desde: 238900, precio_hasta: 736300, moneda: "S/",
    area_desde: 29.62, area_hasta: 140.55,
    dormitorios: [1, 2, 3], pisos: 15, depas: 55,
    depas_total: null, depas_total: null,
    etapa: "En Construcción", cuota_inicial_min: 30, entrega: "2027",
    amenities: ["Gimnasio", "Lobby", "Sala Bar", "Sala de usos Múltiples", "Zona de Parrillas"],
    acabados_lista: [],
    electrodomesticos: [],
    extras_equipamiento: [],
    descripcion: "Nace al lado del Barrio Aurora, donde Surquillo y Miraflores se encuentran. Vive rodeado de estilo, parques y centros comerciales Aquí, la energía de la ciudad se siente, se vive y se conecta.",
    imagen: "https://dp34qvsykz8fe.cloudfront.net/customers/albamar-grupo-inmobiliario/3683-albamar-aura/departamentos-surquillo-699cc23ae4470_b.jpg",
    imagen_color: "#1a3a5c", per: 18.5, reputacion: 4, banco_sponsor: "INTERBANK",
    fotos: ["https://dp34qvsykz8fe.cloudfront.net/customers/albamar-grupo-inmobiliario/3683-albamar-aura/departamentos-surquillo-699cc23ae4470_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/albamar-grupo-inmobiliario/3683-albamar-aura/departamentos-surquillo-699795841067a_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/departamentos-surquillo-6809481989f89_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/departamentos-surquillo-6809556a47bf8_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/departamentos-surquillo-6809555969fff_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/departamentos-surquillo-680955b012dd5_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/departamentos-surquillo-6809562ca1ed7_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/departamentos-surquillo-6809567354e75_b.jpg"],
    youtube_url: "https://www.youtube.com/embed/_eS3j5FKVCA?picture-in-picture=1&accelerometer=1&gyroscope=1",
    modelos: [
      {
            "nombre": "Duplex TIPO 3K",
            "dormitorios": 3,
            "banos": 2,
            "area": 94.37,
            "precio": 644800,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/planos-albamar-aura-67b8b89e20df7_xm.png"
      },
      {
            "nombre": "Duplex TIPO 2J",
            "dormitorios": 3,
            "banos": 2,
            "area": 140.55,
            "precio": 736300,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/planos-albamar-aura-6864127038e7e_xm.png"
      },
      {
            "nombre": "Duplex TIPO 1I",
            "dormitorios": 2,
            "banos": 2,
            "area": 68.6,
            "precio": 472300,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/planos-albamar-aura-68641218783d5_xm.png"
      },
      {
            "nombre": "Flat TIPO 6F",
            "dormitorios": 2,
            "banos": 2,
            "area": 55.69,
            "precio": 391400,
            "unidades": 8,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/planos-albamar-aura-686412f60ce5b_xm.png"
      },
      {
            "nombre": "Flat TIPO 5E",
            "dormitorios": 1,
            "banos": 1,
            "area": 29.62,
            "precio": 238900,
            "unidades": 10,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/planos-albamar-aura-686412e226769_xm.png"
      },
      {
            "nombre": "Flat TIPO 4D",
            "dormitorios": 2,
            "banos": 2,
            "area": 56.7,
            "precio": 386800,
            "unidades": 13,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/planos-albamar-aura-686412cda5e56_xm.png"
      },
      {
            "nombre": "Flat TIPO 3C",
            "dormitorios": 2,
            "banos": 2,
            "area": 54.66,
            "precio": 410600,
            "unidades": 5,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/planos-albamar-aura-686412b05ca73_xm.png"
      },
      {
            "nombre": "Flat TIPO 2B",
            "dormitorios": 3,
            "banos": 2,
            "area": 70.33,
            "precio": 438900,
            "unidades": 14,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/planos-albamar-aura-686412580aa36_xm.png"
      },
      {
            "nombre": "Flat TIPO 1A",
            "dormitorios": 1,
            "banos": 1,
            "area": 35.56,
            "precio": 281100,
            "unidades": 2,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/planos-albamar-aura-686411c563802_xm.png"
      }
],
  },
  {
    id: 5, nombre: "Proyecto Libertad", inmobiliaria: "GRUPO INMOBILIARIO COMUNIDAD",
    ruc: "", direccion: "Avenida La Libertad 200",
    distrito: "San Miguel", lat: -12.079792111220133, lng: -77.09602768461193, zona: "Lima Moderna",
    precio_desde: 240000, precio_hasta: 388000, moneda: "S/",
    area_desde: 30, area_hasta: 60,
    dormitorios: [1, 2, 3], pisos: 15, depas: 39,
    depas_total: null, depas_total: null,
    etapa: "En Planos", cuota_inicial_min: 60, entrega: "2026",
    amenities: ["Gimnasio", "Lobby", "Piscina", "Sala de cine", "Terraza", "Zona de Parrillas"],
    acabados_lista: [],
    electrodomesticos: [],
    extras_equipamiento: [],
    descripcion: "'Libertad' es mucho más que un proyecto inmobiliario. Es la puerta de entrada hacia una vida independiente y emocionante. Con metrajes inteligentes y precios accesibles, te brindamos la oportunidad d",
    imagen: "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-67a546323b99d_b.jpg",
    imagen_color: "#1a4a2e", per: 18.5, reputacion: 4, banco_sponsor: "SCOTIABANK",
    fotos: ["https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-67a546323b99d_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-664bbb85c04eb_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-664d090f6fb8e_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-67a546d57dd7a_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-67a54704321a0_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-67a546ed3138c_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-67a546bcdb255_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-67a546a7cbb14_b.jpg"],
    youtube_url: null,
    modelos: [
      {
            "nombre": "Duplex F",
            "dormitorios": 1,
            "banos": 1,
            "area": 42,
            "precio": 337000,
            "unidades": 4,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/planos-proyecto-libertad-664b86f090eb7_xm.jpg"
      },
      {
            "nombre": "Flat E",
            "dormitorios": 2,
            "banos": 2,
            "area": 48,
            "precio": 329000,
            "unidades": 8,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913adecafd15_xm.jpg"
      },
      {
            "nombre": "Flat C",
            "dormitorios": 2,
            "banos": 2,
            "area": 47,
            "precio": 330000,
            "unidades": 12,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913adc928ab6_xm.jpg"
      },
      {
            "nombre": "Flat B",
            "dormitorios": 3,
            "banos": 2,
            "area": 60,
            "precio": 388000,
            "unidades": 12,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913adb482d7a_xm.jpg"
      },
      {
            "nombre": "Flat A",
            "dormitorios": 1,
            "banos": 1,
            "area": 30,
            "precio": 240000,
            "unidades": 3,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/planos-vista-tower-6913ad9d0a63e_xm.jpg"
      }
],
  },
  {
    id: 6, nombre: "Quiñones Park", inmobiliaria: "MULTIURBE",
    ruc: "", direccion: "Intisuyo 499, San Miguel",
    distrito: "San Miguel", lat: -12.07511376386756, lng: -77.09063821902431, zona: "Lima Moderna",
    precio_desde: 245000, precio_hasta: 450000, moneda: "S/",
    area_desde: 29.98, area_hasta: 60.8,
    dormitorios: [1, 2], pisos: 10, depas: 33,
    depas_total: 33, depas_total: 33,
    etapa: "En Construcción", cuota_inicial_min: 10, entrega: "2026",
    amenities: ["Lobby", "Sala de usos Múltiples", "Zona de Parrillas"],
    acabados_lista: [],
    electrodomesticos: [],
    extras_equipamiento: [],
    descripcion: "Nuestro exclusivo edificio de 10 pisos, estratégicamente ubicado frente al hermoso parque Quiñones, redefine el concepto de vivir bien. Cuenta con excelentes acabados y amplias áreas sociales. Además,",
    imagen: "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-688be0027187b_b.jpg",
    imagen_color: "#1a4a2e", per: 18.5, reputacion: 4, banco_sponsor: "INTERBANK",
    fotos: ["https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-688be0027187b_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-66f8160cd5c0f_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-66f816a1afc79_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-66f816604cd31_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-66f8174b997a5_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-66f8173714651_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-66f816b8846ec_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-66f81718ac8ba_b.jpg"],
    youtube_url: "https://www.youtube.com/embed/UQ8Sh6Zlr6g?picture-in-picture=1&accelerometer=1&gyroscope=1",
    modelos: [
      {
            "nombre": "Flat Tipo 6",
            "dormitorios": 2,
            "banos": 2,
            "area": 58.02,
            "precio": 435000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/planos-quinones-park-681261616016d_xm.png"
      },
      {
            "nombre": "Flat Tipo 3",
            "dormitorios": 1,
            "banos": 1,
            "area": 29.98,
            "precio": 245000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/planos-quinones-park-6824b98c9bbac_xm.png"
      },
      {
            "nombre": "Flat Tipo 2A",
            "dormitorios": 2,
            "banos": 2,
            "area": 60.8,
            "precio": 450000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/planos-quinones-park-6824b9ece7646_xm.png"
      }
],
  },
  {
    id: 7, nombre: "DANAUS - SURQUILLO", inmobiliaria: "GRUPO MG",
    ruc: "", direccion: "Av. Tomás Marsano 2379",
    distrito: "Surquillo", lat: -12.102958671075562, lng: -77.01942388721014, zona: "Lima Moderna",
    precio_desde: 252000, precio_hasta: 455000, moneda: "S/",
    area_desde: 80.35, area_hasta: 80.35,
    dormitorios: [1, 2, 3], pisos: 15, depas: 165,
    depas_total: 345, depas_total: 345,
    etapa: "En Planos", cuota_inicial_min: 50, entrega: "2027",
    amenities: ["Gimnasio", "Lobby", "Piscina", "Sala Bar", "Sala de usos Múltiples", "Zona de Parrillas"],
    acabados_lista: [],
    electrodomesticos: [],
    extras_equipamiento: [],
    descripcion: "* Los precios publicados ya incluyen los descuentos de campaña Danaus está ubicado en Av. Tomás Marsano Nº2379 Urb. Los Sauces 2ª Etapa, distrito de Surquillo, Lima, vive frente a Miraflores y muy cer",
    imagen: "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-6927670ebc355_b.jpg",
    imagen_color: "#1a3a5c", per: 18.5, reputacion: 4, banco_sponsor: "INTERBANK",
    fotos: ["https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-6927670ebc355_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-6931e8eee783b_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-6927676c88f8e_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-691fa99aae44f_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-6927670ebc355_s.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-6931e8eee783b_s.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-6927676c88f8e_s.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-691fa99aae44f_s.jpg"],
    youtube_url: null,
    modelos: [
      {
            "nombre": "Duplex 5a",
            "dormitorios": 2,
            "banos": 2,
            "area": 69.05,
            "precio": 421000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a60e28f7d3_xm.png"
      },
      {
            "nombre": "Duplex 4a",
            "dormitorios": 1,
            "banos": 1,
            "area": 52.45,
            "precio": 323000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a60b0a310c_xm.png"
      },
      {
            "nombre": "Duplex 3b",
            "dormitorios": 2,
            "banos": 2,
            "area": 72.1,
            "precio": 440000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a607714f82_xm.png"
      },
      {
            "nombre": "Duplex 2a",
            "dormitorios": 1,
            "banos": 1,
            "area": 53.85,
            "precio": 327000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a600d03917_xm.png"
      },
      {
            "nombre": "Duplex 1c",
            "dormitorios": 1,
            "banos": 1,
            "area": 49.8,
            "precio": 303000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a5fe027110_xm.png"
      },
      {
            "nombre": "Flat 9d",
            "dormitorios": 1,
            "banos": 1,
            "area": 43.9,
            "precio": 273000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a6270ad968_xm.png"
      },
      {
            "nombre": "Flat 9c",
            "dormitorios": 2,
            "banos": 2,
            "area": 48.3,
            "precio": 294000,
            "unidades": 22,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a623a0c492_xm.png"
      },
      {
            "nombre": "Flat 9a",
            "dormitorios": 1,
            "banos": 1,
            "area": 40.35,
            "precio": 316000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a61f259514_xm.png"
      },
      {
            "nombre": "Flat 9",
            "dormitorios": 2,
            "banos": 2,
            "area": 52,
            "precio": 367000,
            "unidades": 10,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a662d9cb95_xm.png"
      },
      {
            "nombre": "Flat 8b",
            "dormitorios": 2,
            "banos": 2,
            "area": 52.85,
            "precio": 325000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a61bb5ff02_xm.png"
      },
      {
            "nombre": "Flat 8a",
            "dormitorios": 2,
            "banos": 2,
            "area": 52.5,
            "precio": 407000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a6198236f8_xm.png"
      },
      {
            "nombre": "Flat 8",
            "dormitorios": 1,
            "banos": 1,
            "area": 43.7,
            "precio": 271000,
            "unidades": 33,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a65e913213_xm.png"
      },
      {
            "nombre": "Flat 7b",
            "dormitorios": 1,
            "banos": 1,
            "area": 40.5,
            "precio": 252000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a615b698d6_xm.png"
      },
      {
            "nombre": "Flat 7a",
            "dormitorios": 3,
            "banos": 3,
            "area": 57.36,
            "precio": 455000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a6133d6d80_xm.png"
      },
      {
            "nombre": "Flat 6a",
            "dormitorios": 1,
            "banos": 1,
            "area": 41.05,
            "precio": 256000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus-surquillo/planos-danaus-surquillo-6995ea6e6e4ba_xm.png"
      },
      {
            "nombre": "Flat 3a",
            "dormitorios": 2,
            "banos": 2,
            "area": 53,
            "precio": 326000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a6038abf3a_xm.png"
      },
      {
            "nombre": "Flat 2",
            "dormitorios": 1,
            "banos": 1,
            "area": 43.55,
            "precio": 270000,
            "unidades": 33,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a6400ae017_xm.png"
      },
      {
            "nombre": "Flat 1b",
            "dormitorios": 2,
            "banos": 2,
            "area": 48,
            "precio": 292000,
            "unidades": 22,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a5fb59a24e_xm.png"
      },
      {
            "nombre": "Flat 1a",
            "dormitorios": 2,
            "banos": 2,
            "area": 50.35,
            "precio": 391000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus-surquillo/planos-danaus-surquillo-697b979b0b6c8_xm.png"
      },
      {
            "nombre": "Flat 11",
            "dormitorios": 1,
            "banos": 1,
            "area": 40,
            "precio": 285000,
            "unidades": 10,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a66a2464b3_xm.png"
      },
      {
            "nombre": "Flat 10f",
            "dormitorios": 1,
            "banos": 1,
            "area": 40.45,
            "precio": 272000,
            "unidades": 3,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a636ccf398_xm.png"
      },
      {
            "nombre": "Flat 10e",
            "dormitorios": 1,
            "banos": 1,
            "area": 54.1,
            "precio": 371000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a6341486a6_xm.png"
      },
      {
            "nombre": "Flat 10d",
            "dormitorios": 2,
            "banos": 2,
            "area": 54.1,
            "precio": 371000,
            "unidades": 2,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a631f8d5cd_xm.png"
      },
      {
            "nombre": "Flat 10c",
            "dormitorios": 2,
            "banos": 2,
            "area": 63.85,
            "precio": 441000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a63017004c_xm.png"
      },
      {
            "nombre": "Flat 10b",
            "dormitorios": 3,
            "banos": 3,
            "area": 63.85,
            "precio": 448000,
            "unidades": 2,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus-surquillo/planos-danaus-surquillo-6995e9f58963a_xm.png"
      },
      {
            "nombre": "Flat 10a",
            "dormitorios": 1,
            "banos": 1,
            "area": 47,
            "precio": 366000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a629824592_xm.png"
      },
      {
            "nombre": "Flat 1",
            "dormitorios": 2,
            "banos": 2,
            "area": 51.7,
            "precio": 365000,
            "unidades": 11,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a63c09cb27_xm.png"
      }
],
  },
  {
    id: 8, nombre: "ALBORADA III - SAN MIGUEL", inmobiliaria: "GRUPO MG",
    ruc: "", direccion: "Av. La paz 839",
    distrito: "San Miguel", lat: -12.07943899422627, lng: -77.09055696838038, zona: "Lima Moderna",
    precio_desde: 252000, precio_hasta: 508460, moneda: "S/",
    area_desde: 48.35, area_hasta: 108.2,
    dormitorios: [1, 2, 3], pisos: 15, depas: 66,
    depas_total: 244, depas_total: 244,
    etapa: "En Construcción", cuota_inicial_min: 50, entrega: "2026",
    amenities: ["Gimnasio", "Lobby", "Sala de Niños", "Terraza", "Zona de Parrillas"],
    acabados_lista: [],
    electrodomesticos: [],
    extras_equipamiento: [],
    descripcion: "Proyecto en construcción con moderna arquitectura en diseño y distribución lo cual permite tener los departamentos con ambientes más confortables de la zona donde Tu Familia podrá disfrutar de su vivi",
    imagen: "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/departamentos-san-miguel-68f7f72880222_b.jpg",
    imagen_color: "#1a4a2e", per: 18.5, reputacion: 4, banco_sponsor: "BCP, PICHINCHA",
    fotos: ["https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/departamentos-san-miguel-68f7f72880222_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/departamentos-san-miguel-695fefae5edd8_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/departamentos-san-miguel-68f7f749b9987_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/departamentos-san-miguel-687e5a59e9627_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/departamentos-san-miguel-687e5a3c56fa8_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii/departamentos-san-miguel-664cb61ca3939_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/departamentos-san-miguel-687e5a1db59d0_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/departamentos-san-miguel-687e59e4a92f8_b.jpg"],
    youtube_url: null,
    modelos: [
      {
            "nombre": "Duplex B6",
            "dormitorios": 1,
            "banos": 2,
            "area": 66.7,
            "precio": 317660,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686edacfad50d_xm.png"
      },
      {
            "nombre": "Duplex A9",
            "dormitorios": 2,
            "banos": 2,
            "area": 66.3,
            "precio": 321540,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ed2cc47036_xm.png"
      },
      {
            "nombre": "Duplex A8a",
            "dormitorios": 1,
            "banos": 2,
            "area": 67.5,
            "precio": 324800,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ed29375bf7_xm.png"
      },
      {
            "nombre": "Duplex A7b",
            "dormitorios": 1,
            "banos": 2,
            "area": 71.3,
            "precio": 339540,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ed1beb26a0_xm.png"
      },
      {
            "nombre": "Duplex A6f",
            "dormitorios": 2,
            "banos": 2,
            "area": 73.7,
            "precio": 351360,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ed0d885adb_xm.png"
      },
      {
            "nombre": "Duplex A4e",
            "dormitorios": 2,
            "banos": 2,
            "area": 71.4,
            "precio": 340720,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ecbdc8c66f_xm.png"
      },
      {
            "nombre": "Duplex A1b",
            "dormitorios": 1,
            "banos": 2,
            "area": 79.2,
            "precio": 371000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-687003112eb26_xm.png"
      },
      {
            "nombre": "Duplex A11",
            "dormitorios": 2,
            "banos": 2,
            "area": 108.2,
            "precio": 508460,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ed33f3851c_xm.png"
      },
      {
            "nombre": "Duplex A10",
            "dormitorios": 2,
            "banos": 2,
            "area": 67.5,
            "precio": 321300,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ed30a46548_xm.png"
      },
      {
            "nombre": "Flat B4",
            "dormitorios": 3,
            "banos": 2,
            "area": 64.3,
            "precio": 334500,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ed9b6e490f_xm.png"
      },
      {
            "nombre": "Flat B3",
            "dormitorios": 2,
            "banos": 2,
            "area": 55,
            "precio": 288000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ed8b47c1ca_xm.png"
      },
      {
            "nombre": "Flat B2a",
            "dormitorios": 3,
            "banos": 2,
            "area": 64.8,
            "precio": 343480,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ed6cec76fc_xm.png"
      },
      {
            "nombre": "Flat B2",
            "dormitorios": 3,
            "banos": 2,
            "area": 65.5,
            "precio": 314300,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ed7c7a1c11_xm.png"
      },
      {
            "nombre": "Flat B1",
            "dormitorios": 3,
            "banos": 2,
            "area": 65,
            "precio": 347050,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ed64e827c8_xm.png"
      },
      {
            "nombre": "Flat A8",
            "dormitorios": 3,
            "banos": 2,
            "area": 63.2,
            "precio": 341640,
            "unidades": 7,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e1f72a7011_xm.png"
      },
      {
            "nombre": "Flat A7a",
            "dormitorios": 2,
            "banos": 2,
            "area": 53.8,
            "precio": 292760,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ed11bb3f14_xm.png"
      },
      {
            "nombre": "Flat A6b",
            "dormitorios": 3,
            "banos": 2,
            "area": 71,
            "precio": 382200,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/planos-luma-san-miguel-68b86b1931215_xm.png"
      },
      {
            "nombre": "Flat A6a",
            "dormitorios": 3,
            "banos": 2,
            "area": 63.5,
            "precio": 343200,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ece8c5652b_xm.png"
      },
      {
            "nombre": "Flat A6",
            "dormitorios": 3,
            "banos": 2,
            "area": 66,
            "precio": 336400,
            "unidades": 7,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e1f079eaaa_xm.png"
      },
      {
            "nombre": "Flat A5",
            "dormitorios": 2,
            "banos": 2,
            "area": 57,
            "precio": 309400,
            "unidades": 10,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e1ee40a216_xm.png"
      },
      {
            "nombre": "Flat A4d",
            "dormitorios": 1,
            "banos": 2,
            "area": 48.35,
            "precio": 252000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ecb2f4870c_xm.png"
      },
      {
            "nombre": "Flat A4b",
            "dormitorios": 2,
            "banos": 2,
            "area": 57.4,
            "precio": 311480,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ecad0a34ba_xm.png"
      },
      {
            "nombre": "Flat A4a",
            "dormitorios": 2,
            "banos": 2,
            "area": 67,
            "precio": 351100,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-686ec9ca5d59d_xm.png"
      },
      {
            "nombre": "Flat A3a",
            "dormitorios": 2,
            "banos": 2,
            "area": 67.4,
            "precio": 353220,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-687135047f448_xm.png"
      },
      {
            "nombre": "Flat A3",
            "dormitorios": 3,
            "banos": 2,
            "area": 65.2,
            "precio": 332480,
            "unidades": 7,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e1e25c761d_xm.png"
      },
      {
            "nombre": "Flat A2b",
            "dormitorios": 2,
            "banos": 2,
            "area": 60.1,
            "precio": 337540,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/planos-alborada-iii-san-miguel-687003ef17c4e_xm.png"
      },
      {
            "nombre": "Flat A12",
            "dormitorios": 3,
            "banos": 2,
            "area": 62.9,
            "precio": 316360,
            "unidades": 6,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e203f582c4_xm.png"
      },
      {
            "nombre": "Flat A1",
            "dormitorios": 2,
            "banos": 2,
            "area": 66.9,
            "precio": 367570,
            "unidades": 7,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma/planos-luma-688e1de1add5d_xm.png"
      }
],
  },
  {
    id: 9, nombre: "Villa Elenia", inmobiliaria: "GRUPO CARAL",
    ruc: "", direccion: "Av. Angamos Este 1425",
    distrito: "Surquillo", lat: -12.107571057927968, lng: -77.02691071393785, zona: "Lima Moderna",
    precio_desde: 253000, precio_hasta: 494673, moneda: "S/",
    area_desde: 40.32, area_hasta: 74.83,
    dormitorios: [1, 2, 3], pisos: 15, depas: 113,
    depas_total: null, depas_total: null,
    etapa: "En Planos", cuota_inicial_min: 100, entrega: "2028",
    amenities: ["Área de juegos para niños", "Gimnasio", "Sala Bar", "Sala de Niños", "Sala de usos Múltiples", "Terraza", "Zona de Parrillas"],
    acabados_lista: [],
    electrodomesticos: [],
    extras_equipamiento: [],
    descripcion: "Villa Elenia es un proyecto ubicado en Surquillo, un distrito que ha evolucionado y hoy te acerca a todo lo que necesitas. Cuenta con departamentos de 1, 2 y 3 dormitorios desde 38 m2 hasta 100 m2 y",
    imagen: "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e464ec6062_b.jpg",
    imagen_color: "#1a3a5c", per: 18.5, reputacion: 4, banco_sponsor: "BCP",
    fotos: ["https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e464ec6062_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e46c4bfc88_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e47f1a56e9_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e47e53bad6_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e48458328e_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e4839cf80b_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e482d53dd8_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e481f02289_b.jpg"],
    youtube_url: null,
    modelos: [
      {
            "nombre": "Flat X6",
            "dormitorios": 3,
            "banos": 2,
            "area": 74.83,
            "precio": 494673,
            "unidades": 7,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/planos-villa-elenia-691e493e0f46f_xm.jpg"
      },
      {
            "nombre": "Flat X4",
            "dormitorios": 2,
            "banos": 2,
            "area": 56.05,
            "precio": 366390,
            "unidades": 4,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/planos-villa-elenia-691e3a8c6ce0a_xm.png"
      },
      {
            "nombre": "Flat X3",
            "dormitorios": 1,
            "banos": 1,
            "area": 40.32,
            "precio": 253000,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/planos-villa-elenia-691e4142ab507_xm.png"
      },
      {
            "nombre": "Flat X10",
            "dormitorios": 2,
            "banos": 2,
            "area": 56.73,
            "precio": 338588,
            "unidades": 18,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/planos-villa-elenia-691e33c214714_xm.png"
      },
      {
            "nombre": "Flat X09",
            "dormitorios": 2,
            "banos": 2,
            "area": 54.61,
            "precio": 315421,
            "unidades": 14,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/planos-villa-elenia-691e33a26b0bd_xm.png"
      },
      {
            "nombre": "Flat X06",
            "dormitorios": 3,
            "banos": 2,
            "area": 74.59,
            "precio": 475566,
            "unidades": 7,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/planos-villa-elenia-691e344465b77_xm.png"
      },
      {
            "nombre": "Flat X05",
            "dormitorios": 2,
            "banos": 2,
            "area": 57.34,
            "precio": 364908,
            "unidades": 11,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/planos-villa-elenia-691e32fd51d67_xm.png"
      },
      {
            "nombre": "Flat X03",
            "dormitorios": 3,
            "banos": 2,
            "area": 68.1,
            "precio": 422781,
            "unidades": 13,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/planos-villa-elenia-691e308853c86_xm.png"
      },
      {
            "nombre": "Flat X02",
            "dormitorios": 3,
            "banos": 2,
            "area": 69.37,
            "precio": 405950,
            "unidades": 19,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/planos-villa-elenia-691e33e1f1512_xm.png"
      },
      {
            "nombre": "Flat X01",
            "dormitorios": 3,
            "banos": 2,
            "area": 67.76,
            "precio": 396529,
            "unidades": 19,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/planos-villa-elenia-691e2f6c4a319_xm.png"
      }
],
  },
  {
    id: 10, nombre: "CAPRI Santa Catalina", inmobiliaria: "PROYEC INMOBILIARIA",
    ruc: "", direccion: "Pasaje Capri 120",
    distrito: "La Victoria", lat: -12.069745340311353, lng: -77.02361518872351, zona: "Lima Moderna",
    precio_desde: 263283, precio_hasta: 398412, moneda: "S/",
    area_desde: 40.03, area_hasta: 62.63,
    dormitorios: [1, 2, 3], pisos: 15, depas: 80,
    depas_total: null, depas_total: null,
    etapa: "En Planos", cuota_inicial_min: 10, entrega: "2027",
    amenities: ["Gimnasio", "Lobby", "Sala Bar", "Sala de Niños", "Terraza", "Zona de Parrillas"],
    acabados_lista: [],
    electrodomesticos: [],
    extras_equipamiento: [],
    descripcion: "Descubre Capri, un espacio inspirado en la esencia mediterránea, donde la tranquilidad y la modernidad se encuentran. Ubicado estratégicamente en un pasaje exclusivo, a pocos pasos de parques y rodead",
    imagen: "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-69939bb735af2_b.jpg",
    imagen_color: "#4a1a1a", per: 18.5, reputacion: 4, banco_sponsor: "SCOTIABANK",
    fotos: ["https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-69939bb735af2_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-69a4bb360ef2a_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-69a4b3c61c6f6_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-69a4b35ee5297_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-68d1c723132c5_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-69a4b3212a41d_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-69a4b9fd39dfd_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-69a4b9ca5b361_b.jpg"],
    youtube_url: "https://www.youtube.com/embed/Yx0QFlvkFYg?picture-in-picture=1&accelerometer=1&gyroscope=1",
    modelos: [
      {
            "nombre": "Flat Tipo X08",
            "dormitorios": 1,
            "banos": 1,
            "area": 40.03,
            "precio": 267096,
            "unidades": 8,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/planos-capri-santa-catalina-687152a032162_xm.png"
      },
      {
            "nombre": "Flat Tipo X07",
            "dormitorios": 2,
            "banos": 2,
            "area": 50.16,
            "precio": 337404,
            "unidades": 14,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/planos-capri-santa-catalina-6871526bbe803_xm.png"
      },
      {
            "nombre": "Flat Tipo X06",
            "dormitorios": 2,
            "banos": 2,
            "area": 48.9,
            "precio": 328848,
            "unidades": 8,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/planos-capri-santa-catalina-6871522f72f5a_xm.png"
      },
      {
            "nombre": "Flat Tipo X05",
            "dormitorios": 3,
            "banos": 2,
            "area": 62.31,
            "precio": 398412,
            "unidades": 11,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/planos-capri-santa-catalina-687152f78bc02_xm.png"
      },
      {
            "nombre": "Flat Tipo X04A",
            "dormitorios": 3,
            "banos": 2,
            "area": 57.06,
            "precio": 368373,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/planos-capri-santa-catalina-68715416161a5_xm.png"
      },
      {
            "nombre": "Flat Tipo X03A",
            "dormitorios": 2,
            "banos": 2,
            "area": 49.59,
            "precio": 320571,
            "unidades": 4,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/planos-capri-santa-catalina-687153c129bc5_xm.png"
      },
      {
            "nombre": "Flat Tipo X03",
            "dormitorios": 2,
            "banos": 2,
            "area": 48.39,
            "precio": 316014,
            "unidades": 10,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/planos-capri-santa-catalina-687151bade16d_xm.png"
      },
      {
            "nombre": "Flat Tipo X02",
            "dormitorios": 2,
            "banos": 2,
            "area": 49.19,
            "precio": 321222,
            "unidades": 11,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/planos-capri-santa-catalina-68715191d1b79_xm.png"
      },
      {
            "nombre": "Flat Tipo X01",
            "dormitorios": 1,
            "banos": 1,
            "area": 40.05,
            "precio": 263283,
            "unidades": 11,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/planos-capri-santa-catalina-6871517240cc2_xm.png"
      },
      {
            "nombre": "Flat Tipo 1601",
            "dormitorios": 2,
            "banos": 2,
            "area": 62.63,
            "precio": 381207,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/planos-capri-santa-catalina-68715491a0e7d_xm.png"
      },
      {
            "nombre": "Flat Tipo 1208",
            "dormitorios": 1,
            "banos": 1,
            "area": 44.04,
            "precio": 288300,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/planos-capri-santa-catalina-687153601a65a_xm.png"
      }
],
  },
  {
    id: 11, nombre: "ALLURE - JESÚS MARÍA", inmobiliaria: "GRUPO MG",
    ruc: "", direccion: "Av. Húsares de Junín Nº 661",
    distrito: "Jesús María", lat: -12.07611986959548, lng: -77.04923207264208, zona: "Lima Moderna",
    precio_desde: 265000, precio_hasta: 495797, moneda: "S/",
    area_desde: 40, area_hasta: 80,
    dormitorios: [1, 2], pisos: 15, depas: 212,
    depas_total: null, depas_total: null,
    etapa: "En Planos", cuota_inicial_min: 50, entrega: "2027",
    amenities: ["Gimnasio", "Jardin interior", "Lobby", "Piscina", "Sala Bar", "Sala de usos Múltiples", "Zona de Parrillas"],
    acabados_lista: [],
    electrodomesticos: [],
    extras_equipamiento: [],
    descripcion: "Allure, está ubicado en una zona residencial de Jesús María, Av. Húsares de Junín Nº 661, muy cerca a parques, universidades, centros médicos, Bancos, supermercados y vías principales que conectan con",
    imagen: "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/departamentos-jesus-maria-68ff86dd57347_b.jpg",
    imagen_color: "#3a1a4a", per: 18.5, reputacion: 4, banco_sponsor: "BCP",
    fotos: ["https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/departamentos-jesus-maria-68ff86dd57347_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/departamentos-jesus-maria-695ff0c5bc606_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/departamentos-jesus-maria-68ff86f2b5cac_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/departamentos-jesus-maria-68ffe7cfdc9fb_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/departamentos-jesus-maria-68ffe811c9862_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure/departamentos-jesus-maria-6894d885884d3_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/departamentos-jesus-maria-68ffe7e47dc88_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/departamentos-jesus-maria-68ffe7fbcf817_b.jpg"],
    youtube_url: "https://www.youtube.com/embed/qVYdTzPguHE?picture-in-picture=1&accelerometer=1&gyroscope=1",
    modelos: [
      {
            "nombre": "Duplex 7b",
            "dormitorios": 2,
            "banos": 2,
            "area": 57.64,
            "precio": 370368,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/planos-allure-jesus-maria-696e6b57da1d1_xm.png"
      },
      {
            "nombre": "Duplex 5c",
            "dormitorios": 2,
            "banos": 2,
            "area": 80,
            "precio": 495797,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/planos-allure-jesus-maria-696e695a45a61_xm.png"
      },
      {
            "nombre": "Flat 9",
            "dormitorios": 1,
            "banos": 1,
            "area": 45.24,
            "precio": 316108,
            "unidades": 10,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a662d9cb95_xm.png"
      },
      {
            "nombre": "Flat 7",
            "dormitorios": 1,
            "banos": 1,
            "area": 40.9,
            "precio": 266580,
            "unidades": 33,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a65b4724ef_xm.png"
      },
      {
            "nombre": "Flat 6",
            "dormitorios": 1,
            "banos": 1,
            "area": 40,
            "precio": 265000,
            "unidades": 28,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-6924b2b6bef84_xm.png"
      },
      {
            "nombre": "Flat 5",
            "dormitorios": 1,
            "banos": 1,
            "area": 40.12,
            "precio": 265756,
            "unidades": 32,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a64c0b3944_xm.png"
      },
      {
            "nombre": "Flat 4",
            "dormitorios": 2,
            "banos": 2,
            "area": 56.93,
            "precio": 365966,
            "unidades": 31,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a6488751bb_xm.png"
      },
      {
            "nombre": "Flat 3",
            "dormitorios": 1,
            "banos": 1,
            "area": 41,
            "precio": 267200,
            "unidades": 32,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a64486e7e8_xm.png"
      },
      {
            "nombre": "Flat 2",
            "dormitorios": 2,
            "banos": 2,
            "area": 55.62,
            "precio": 385654,
            "unidades": 33,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a6400ae017_xm.png"
      },
      {
            "nombre": "Flat 1",
            "dormitorios": 2,
            "banos": 2,
            "area": 55.35,
            "precio": 378310,
            "unidades": 11,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/planos-danaus-696a63c09cb27_xm.png"
      }
],
  },
  {
    id: 12, nombre: "Residencial Leyendas II", inmobiliaria: "MULTIURBE",
    ruc: "", direccion: "Calle Cayrucachi 186 . San Miguel",
    distrito: "San Miguel", lat: -12.074359792474498, lng: -77.09143720080594, zona: "Lima Moderna",
    precio_desde: 269000, precio_hasta: 649000, moneda: "S/",
    area_desde: 41.1, area_hasta: 93.3,
    dormitorios: [1, 3, 4], pisos: 15, depas: 40,
    depas_total: null, depas_total: null,
    etapa: "En Planos", cuota_inicial_min: 10, entrega: "2026",
    amenities: ["Lobby", "Sala de usos Múltiples", "Terraza", "Zona de Parrillas"],
    acabados_lista: [],
    electrodomesticos: [],
    extras_equipamiento: [],
    descripcion: "Residencial Las Leyendas es un lugar exclusivo con pocos vecinos, en una zona tranquila y segura. Ubicado a una cuadra del Parque Quiñones. Diseñado por Brand Arquitectos, especialistas en desarrollo",
    imagen: "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-696649b911fb0_b.jpg",
    imagen_color: "#1a4a2e", per: 18.5, reputacion: 4, banco_sponsor: "BCP, INTERBANK",
    fotos: ["https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-696649b911fb0_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-6876d14a5fabb_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-6876da6fd2dc1_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-6876d1949a2c2_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-6876d1694f296_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-6876d15a5aa0d_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-696649b911fb0_s.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-6876d14a5fabb_s.jpg"],
    youtube_url: null,
    modelos: [
      {
            "nombre": "Flat Tipo3",
            "dormitorios": 4,
            "banos": 2,
            "area": 93.3,
            "precio": 649000,
            "unidades": 2,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/planos-residencial-leyendas-ii-688a7f84c7636_xm.png"
      },
      {
            "nombre": "Flat Tipo2",
            "dormitorios": 3,
            "banos": 2,
            "area": 70.1,
            "precio": 480000,
            "unidades": 3,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/planos-residencial-leyendas-ii-688a7f59ccb2c_xm.png"
      },
      {
            "nombre": "Flat Tipo1",
            "dormitorios": 1,
            "banos": 1,
            "area": 41.1,
            "precio": 269000,
            "unidades": 3,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/planos-residencial-leyendas-ii-688a7f45e161d_xm.png"
      }
],
  },
  {
    id: 13, nombre: "Element", inmobiliaria: "EDIFICA",
    ruc: "", direccion: "Avenida Tomás Marsano 385",
    distrito: "Surquillo", lat: -12.107381207147446, lng: -77.01800542978195, zona: "Lima Moderna",
    precio_desde: 278168, precio_hasta: 507498, moneda: "S/",
    area_desde: 28.91, area_hasta: 60.13,
    dormitorios: [1, 2, 3], pisos: 15, depas: 48,
    depas_total: null, depas_total: null,
    etapa: "En Construcción", cuota_inicial_min: 20, entrega: "2026",
    amenities: ["Jardin interior", "Lobby", "Piscina", "Sala Bar", "Zona de Lavandería", "Zona de Parrillas"],
    acabados_lista: [],
    electrodomesticos: [],
    extras_equipamiento: [],
    descripcion: "En ELEMENT encontrarás el equilibrio perfecto entre modernidad y confort. Ubicado en la zona más dinámica y céntrica de Surquillo, ELEMENT es el proyecto ideal para quienes quieren dar el primer paso",
    imagen: "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-6799083fb44e3_b.jpg",
    imagen_color: "#1a3a5c", per: 18.5, reputacion: 4, banco_sponsor: "SCOTIABANK",
    fotos: ["https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-6799083fb44e3_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-67083b1d2288c_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-67083b73d7bb6_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-67083b869e97c_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-67083b30a6fdd_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-67083b5ad3e28_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-67083b445d60e_b.jpg", "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-67083b9c13997_b.jpg"],
    youtube_url: "https://www.youtube.com/embed/PMGOneG0iBw?picture-in-picture=1&accelerometer=1&gyroscope=1",
    modelos: [
      {
            "nombre": "Flat 8B",
            "dormitorios": 2,
            "banos": 2,
            "area": 55.77,
            "precio": 435359,
            "unidades": 3,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/planos-element-682de9df11140_xm.jpg"
      },
      {
            "nombre": "Flat 8A",
            "dormitorios": 2,
            "banos": 2,
            "area": 56.25,
            "precio": 424892,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/planos-element-682de9a11658d_xm.jpg"
      },
      {
            "nombre": "Flat 6A",
            "dormitorios": 1,
            "banos": 1,
            "area": 39.87,
            "precio": 342874,
            "unidades": 13,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/planos-element-682de95d2be8a_xm.jpg"
      },
      {
            "nombre": "Flat 3B",
            "dormitorios": 1,
            "banos": 1,
            "area": 36.43,
            "precio": 336825,
            "unidades": 2,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/planos-element-682de90145a25_xm.jpg"
      },
      {
            "nombre": "Flat 2A",
            "dormitorios": 1,
            "banos": 1,
            "area": 28.91,
            "precio": 278168,
            "unidades": 8,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/planos-element-682de8c5325d2_xm.jpg"
      },
      {
            "nombre": "Flat 1B",
            "dormitorios": 1,
            "banos": 1,
            "area": 30.31,
            "precio": 297102,
            "unidades": 1,
        "plano_url": null
      },
      {
            "nombre": "Flat 1A",
            "dormitorios": 1,
            "banos": 1,
            "area": 30.72,
            "precio": 283166,
            "unidades": 4,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/planos-element-682de73541052_xm.jpg"
      },
      {
            "nombre": "Flat 16A",
            "dormitorios": 2,
            "banos": 2,
            "area": 57.43,
            "precio": 490652,
            "unidades": 1,
        "plano_url": null
      },
      {
            "nombre": "Flat 13E",
            "dormitorios": 3,
            "banos": 2,
            "area": 60.13,
            "precio": 507498,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/planos-element-683505e314b4f_xm.jpg"
      },
      {
            "nombre": "Flat 12B",
            "dormitorios": 1,
            "banos": 1,
            "area": 40.19,
            "precio": 329993,
            "unidades": 5,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/planos-element-682deaf095108_xm.jpg"
      },
      {
            "nombre": "Flat 11D",
            "dormitorios": 1,
            "banos": 1,
            "area": 41.14,
            "precio": 349563,
            "unidades": 1,
        "plano_url": null
      },
      {
            "nombre": "Flat 11C",
            "dormitorios": 1,
            "banos": 1,
            "area": 41.41,
            "precio": 339993,
            "unidades": 4,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/planos-element-682deaba1b20d_xm.jpg"
      },
      {
            "nombre": "Flat 11B",
            "dormitorios": 1,
            "banos": 1,
            "area": 41.67,
            "precio": 329427,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/planos-element-682dea9719d2e_xm.jpg"
      },
      {
            "nombre": "Flat 10B",
            "dormitorios": 1,
            "banos": 1,
            "area": 40.13,
            "precio": 344625,
            "unidades": 1,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/planos-element-682dea7397193_xm.jpg"
      },
      {
            "nombre": "Flat 10A",
            "dormitorios": 1,
            "banos": 1,
            "area": 40.39,
            "precio": 337440,
            "unidades": 2,
        "plano_url": "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/planos-element-682dea448d7d4_xm.jpg"
      }
],
  }
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
  "GRUPO MG": {
    proyectos_entregados: 30,
    proyectos_construccion: 5,
    proyectos_planos: 2,
    familias: "1,000+",
    certificaciones: ["Miembro ASEI"],
    reconocimientos: ["21 años en el mercado"],
    fuente_proyectos: "grupomg.pe · Nexo Inmobiliario 2025",
    fecha_fundacion: "2004",
    anios_mercado: 21,
    periodo_sanciones: "2022-2026",
    tipo_legal: "Promotora Inmobiliaria",
    calificacion: "B",
    color: "#f59e0b",
    descripcion: "Sanciones menores registradas",
    total_sanciones: 3,
    total_monto_uit: 5.19,
    nota_entidades: "Grupo MG opera bajo múltiples razones sociales (MG Villa S.A.C., MG Hogar S.A.C.). Se consolidan todas las entidades identificadas en el sector.",
    entidades: [{"razon_social": "MG VILLA S.A.C.", "sanciones": 2, "monto_uit": 2.0, "posicion_ranking": 238, "anios_sanciones": "2022-2026"}, {"razon_social": "MG HOGAR S.A.C.", "sanciones": 1, "monto_uit": 3.19, "posicion_ranking": 305, "anios_sanciones": "2022-2026"}],
    periodo_sanciones: "Periodo 2022-2026 · 3 sanciones consolidadas en 2 entidades del grupo",
    fuente: "INDECOPI · Ranking Proveedores Sancionados · 06/03/2022–05/03/2026",
  },
  "QUATRO INMOBILIARIA": {
    proyectos_entregados: 20,
    proyectos_construccion: 4,
    proyectos_planos: 2,
    familias: "1,800+",
    certificaciones: ["Miembro ASEI"],
    reconocimientos: ["200,000 m² construidos"],
    fuente_proyectos: "quatroinmobiliaria.pe · Nexo Inmobiliario 2025",
    fecha_fundacion: "2013",
    anios_mercado: 12,
    tipo_legal: "Promotora Inmobiliaria",
    calificacion: "A+",
    color: "#22c55e",
    descripcion: "Sin sanciones registradas",
    total_sanciones: 0,
    total_monto_uit: 0.0,
    nota_entidades: "No se encontraron registros bajo este nombre comercial en el periodo consultado.",
    entidades: [],
    fuente: "INDECOPI · Ranking Proveedores Sancionados · 06/03/2022–05/03/2026",
  },
  "ALBAMAR GRUPO INMOBILIARIO": {
    proyectos_entregados: 36,
    proyectos_construccion: 15,
    proyectos_planos: 3,
    familias: "3,500+",
    certificaciones: ["Best Place to Live", "EDGE", "LEED", "Mi Vivienda Verde"],
    reconocimientos: ["Best Place to Live · 5 años consecutivos", "Top 10 ventas ASEI"],
    fuente_proyectos: "albamar.com.pe · Gestión Feb & Ago 2025",
    fecha_fundacion: "2005",
    anios_mercado: 20,
    periodo_sanciones: "2022-2026",
    tipo_legal: "Grupo Inmobiliario",
    calificacion: "A",
    color: "#84cc16",
    descripcion: "Sanciones menores históricas",
    total_sanciones: 3,
    total_monto_uit: 5.95,
    nota_entidades: "Albamar opera bajo múltiples razones sociales (Corporación Albamar S.A.C., Promotora Albamar Marsano S.A.C.). Se consolidan todas las entidades identificadas.",
    entidades: [{"razon_social": "CORPORACION ALBAMAR S.A.C.", "sanciones": 2, "monto_uit": 2.0, "posicion_ranking": 236, "anios_sanciones": "2022-2026"}, {"razon_social": "PROMOTORA ALBAMAR MARSANO S.A.C.", "sanciones": 1, "monto_uit": 3.95, "posicion_ranking": 295, "anios_sanciones": "2022-2026"}],
    periodo_sanciones: "Periodo 2022-2026 · 3 sanciones consolidadas en 2 entidades del grupo",
    fuente: "INDECOPI · Ranking Proveedores Sancionados · 06/03/2022–05/03/2026",
  },
  "GRUPO CARAL": {
    proyectos_entregados: 28,
    proyectos_construccion: 8,
    proyectos_planos: 3,
    familias: "4,000+",
    certificaciones: ["EDGE", "Mi Vivienda Verde", "Miembro ASEI"],
    reconocimientos: ["GRI Awards Andean 2024 · 2° lugar Sostenible", "GRI Awards Andean 2024 · 3° lugar Residencial", "Premio Arquitectura y Ciudad CAPECO 2020"],
    fuente_proyectos: "grupocaral.com.pe · Caretas Sep 2024 · ACRES Ene 2025",
    fecha_fundacion: "2010",
    anios_mercado: 15,
    periodo_sanciones: "2022-2026",
    tipo_legal: "Grupo Inmobiliario",
    calificacion: "B",
    color: "#f59e0b",
    descripcion: "Sanciones menores registradas",
    total_sanciones: 5,
    total_monto_uit: 14.84,
    nota_entidades: "Grupo Caral opera bajo múltiples razones sociales (Caral Edificaciones S.A.C., JC Caral Magdalena S.A.C.). Se consolidan todas las entidades identificadas.",
    entidades: [{"razon_social": "CARAL EDIFICACIONES S.A.C.", "sanciones": 1, "monto_uit": 0.5, "posicion_ranking": 394, "anios_sanciones": "2022-2026"}, {"razon_social": "JC CARAL MAGDALENA S.A.C.", "sanciones": 4, "monto_uit": 14.34, "posicion_ranking": 116, "anios_sanciones": "2022-2026"}],
    periodo_sanciones: "Periodo 2022-2026 · 5 sanciones consolidadas en 2 entidades del grupo",
    fuente: "INDECOPI · Ranking Proveedores Sancionados · 06/03/2022–05/03/2026",
  },
  "EDIFICA": {
    proyectos_entregados: 26,
    proyectos_construccion: 12,
    proyectos_planos: 4,
    familias: "3,000+",
    certificaciones: ["LEED", "EDGE", "Miembro ASEI"],
    reconocimientos: ["S/ 700M+ facturación 2025", "30% crecimiento 2024–2025"],
    fuente_proyectos: "edifica.com.pe · Gestión Ene 2026",
    fecha_fundacion: "2005",
    anios_mercado: 20,
    periodo_sanciones: "2022-2026",
    tipo_legal: "Promotora Inmobiliaria",
    calificacion: "B",
    color: "#f59e0b",
    descripcion: "Sanciones registradas en múltiples entidades",
    total_sanciones: 9,
    total_monto_uit: 25.7,
    nota_entidades: "Edifica opera bajo múltiples razones sociales. Se identificaron 5 entidades del grupo en el ranking INDECOPI. Las sanciones corresponden a distintas personas jurídicas, no necesariamente al proyecto específico.",
    entidades: [{"razon_social": "PROYECTOS INMOBILIARIA EDIFICA S.A.C.", "sanciones": 3, "monto_uit": 0.0, "posicion_ranking": 178, "anios_sanciones": "2022-2026"}, {"razon_social": "INVERSIONES INMOBILIARIAS EDIFICA S.A.C.", "sanciones": 2, "monto_uit": 1.0, "posicion_ranking": 248, "anios_sanciones": "2022-2026"}, {"razon_social": "DESARROLLO Y PROYECTOS EDIFICA VEINTE S.A.C.", "sanciones": 2, "monto_uit": 1.5, "posicion_ranking": 243, "anios_sanciones": "2022-2026"}, {"razon_social": "EDIFICA NEWCO S.A.C.", "sanciones": 1, "monto_uit": 11.6, "posicion_ranking": 268, "anios_sanciones": "2022-2026"}, {"razon_social": "GERENCIA Y CONSTRUCCION EDIFICA S.A.C.", "sanciones": 1, "monto_uit": 11.6, "posicion_ranking": 269, "anios_sanciones": "2022-2026"}],
    periodo_sanciones: "Periodo 2022-2026 · 9 sanciones en 5 entidades del grupo",
    fuente: "INDECOPI · Ranking Proveedores Sancionados · 06/03/2022–05/03/2026",
  },
  "GRUPO INMOBILIARIO COMUNIDAD": {
    proyectos_entregados: 3,
    proyectos_construccion: 2,
    proyectos_planos: 1,
    familias: "300+",
    certificaciones: ["Mi Vivienda Verde"],
    reconocimientos: ["Infraestructura ecosostenible"],
    fuente_proyectos: "Nexo Inmobiliario 2025",
    fecha_fundacion: "2013",
    anios_mercado: 12,
    periodo_sanciones: "2022-2026",
    tipo_legal: "Promotora Inmobiliaria",
    calificacion: "A",
    color: "#84cc16",
    descripcion: "Sanción menor registrada",
    total_sanciones: 1,
    total_monto_uit: 6.0,
    nota_entidades: null,
    entidades: [{"razon_social": "GRUPO INMOBILIARIO COMUNIDAD S.A.C.", "sanciones": 1, "monto_uit": 6.0, "posicion_ranking": 278, "anios_sanciones": "2022-2026"}],
    periodo_sanciones: "Periodo 2022-2026 · 1 sanción en 1 entidad",
    fuente: "INDECOPI · Ranking Proveedores Sancionados · 06/03/2022–05/03/2026",
  },
  "MULTIURBE": {
    proyectos_entregados: 2,
    proyectos_construccion: 3,
    proyectos_planos: 1,
    familias: "150+",
    certificaciones: ["Mi Vivienda Verde"],
    reconocimientos: ["Empresa emergente · fundada 2021"],
    fuente_proyectos: "multiurbe.com 2025",
    fecha_fundacion: "2021",
    anios_mercado: 4,
    tipo_legal: "Promotora Inmobiliaria",
    calificacion: "A+",
    color: "#22c55e",
    descripcion: "Sin sanciones registradas",
    total_sanciones: 0,
    total_monto_uit: 0.0,
    nota_entidades: "No se encontraron registros bajo este nombre comercial en el periodo consultado.",
    entidades: [],
    fuente: "INDECOPI · Ranking Proveedores Sancionados · 06/03/2022–05/03/2026",
  },
  "PROYEC INMOBILIARIA": {
    proyectos_entregados: 19,
    proyectos_construccion: 2,
    proyectos_planos: 1,
    familias: "900+",
    certificaciones: ["Miembro ASEI"],
    reconocimientos: ["28 años de trayectoria (desde 1996)"],
    fuente_proyectos: "proyec.com.pe · Instagram 2025",
    fecha_fundacion: "1996",
    anios_mercado: 29,
    tipo_legal: "Promotora Inmobiliaria",
    calificacion: "A+",
    color: "#22c55e",
    descripcion: "Sin sanciones registradas",
    total_sanciones: 0,
    total_monto_uit: 0.0,
    nota_entidades: "No se encontraron registros bajo este nombre comercial en el periodo consultado.",
    entidades: [],
    fuente: "INDECOPI · Ranking Proveedores Sancionados · 06/03/2022–05/03/2026",
  },
};

export const DATACRIM_DATA = {
  "Lima (Cercado)": {
    total_denuncias_2024: 26068,
    tasa_por_1000_hab: 95.9,
    tasa_violentos_1000: 5.87,
    pct_delitos_violentos: 6,
    pct_delitos_patrimonio: 85,
    poblacion_estimada: 271814,
    score_seguridad: 75,
    nivel: "SEGURO",
    color: "#84cc16",
    por_categoria: {"Delitos contra el patrimonio": 22067, "Delitos contra la vida y salud": 1059, "Delitos contra la libertad": 1012, "Otros delitos": 644},
    top_delitos: [{"tipo": "Hurto", "casos": 8307}, {"tipo": "Robo", "casos": 3233}, {"tipo": "Hurto agravado", "casos": 1601}, {"tipo": "Estafa y defraudaciones", "casos": 1279}, {"tipo": "Robo agravado", "casos": 891}],
  },
  "Barranco": {
    total_denuncias_2024: 1474,
    tasa_por_1000_hab: 43.5,
    tasa_violentos_1000: 4.72,
    pct_delitos_violentos: 11,
    pct_delitos_patrimonio: 60,
    poblacion_estimada: 33903,
    score_seguridad: 79,
    nivel: "SEGURO",
    color: "#84cc16",
    por_categoria: {"Delitos contra el patrimonio": 888, "Delitos contra la vida y salud": 102, "Delitos contra la libertad": 130, "Otros delitos": 68},
    top_delitos: [{"tipo": "Hurto", "casos": 202}, {"tipo": "Robo", "casos": 162}, {"tipo": "Hurto agravado", "casos": 83}, {"tipo": "Robo agravado", "casos": 71}, {"tipo": "Hurto de vehiculo", "casos": 54}],
  },
  "Miraflores": {
    total_denuncias_2024: 3716,
    tasa_por_1000_hab: 37.4,
    tasa_violentos_1000: 1.77,
    pct_delitos_violentos: 5,
    pct_delitos_patrimonio: 87,
    poblacion_estimada: 99337,
    score_seguridad: 88,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    por_categoria: {"Delitos contra el patrimonio": 3235, "Delitos contra la vida y salud": 141, "Delitos contra la libertad": 104, "Otros delitos": 99},
    top_delitos: [{"tipo": "Hurto", "casos": 1390}, {"tipo": "Robo", "casos": 430}, {"tipo": "Hurto agravado", "casos": 230}, {"tipo": "Estafa y defraudaciones", "casos": 205}, {"tipo": "Robo agravado", "casos": 109}],
  },
  "Jesús María": {
    total_denuncias_2024: 10936,
    tasa_por_1000_hab: 152.4,
    tasa_violentos_1000: 17.25,
    pct_delitos_violentos: 11,
    pct_delitos_patrimonio: 84,
    poblacion_estimada: 71780,
    score_seguridad: 40,
    nivel: "PRECAUCIÓN",
    color: "#ef4444",
    por_categoria: {"Delitos contra el patrimonio": 9152, "Delitos contra la vida y salud": 361, "Delitos contra la libertad": 498, "Otros delitos": 264},
    top_delitos: [{"tipo": "Hurto", "casos": 1961}, {"tipo": "Robo", "casos": 1936}, {"tipo": "Robo agravado", "casos": 802}, {"tipo": "Hurto agravado", "casos": 727}, {"tipo": "Estafa y defraudaciones", "casos": 649}],
  },
  "Lince": {
    total_denuncias_2024: 5190,
    tasa_por_1000_hab: 91.9,
    tasa_violentos_1000: 7.53,
    pct_delitos_violentos: 8,
    pct_delitos_patrimonio: 71,
    poblacion_estimada: 56463,
    score_seguridad: 70,
    nivel: "SEGURO",
    color: "#84cc16",
    por_categoria: {"Delitos contra el patrimonio": 3674, "Delitos contra la vida y salud": 548, "Delitos contra la libertad": 416, "Otros delitos": 118},
    top_delitos: [{"tipo": "Hurto", "casos": 970}, {"tipo": "Robo", "casos": 609}, {"tipo": "Hurto agravado", "casos": 337}, {"tipo": "Robo agravado", "casos": 265}, {"tipo": "Estafa y defraudaciones", "casos": 257}],
  },
  "Pueblo Libre": {
    total_denuncias_2024: 1443,
    tasa_por_1000_hab: 18.5,
    tasa_violentos_1000: 0.5,
    pct_delitos_violentos: 3,
    pct_delitos_patrimonio: 85,
    poblacion_estimada: 78114,
    score_seguridad: 92,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    por_categoria: {"Delitos contra el patrimonio": 1233, "Delitos contra la vida y salud": 48, "Delitos contra la libertad": 56, "Otros delitos": 56},
    top_delitos: [{"tipo": "Hurto", "casos": 395}, {"tipo": "Estafa y defraudaciones", "casos": 180}, {"tipo": "Robo", "casos": 114}, {"tipo": "Hurto agravado", "casos": 61}, {"tipo": "Hurto de vehiculo", "casos": 34}],
  },
  "Magdalena del Mar": {
    total_denuncias_2024: 1631,
    tasa_por_1000_hab: 29.5,
    tasa_violentos_1000: 2.82,
    pct_delitos_violentos: 10,
    pct_delitos_patrimonio: 81,
    poblacion_estimada: 55314,
    score_seguridad: 85,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    por_categoria: {"Delitos contra el patrimonio": 1317, "Delitos contra la vida y salud": 41, "Delitos contra la libertad": 114, "Otros delitos": 58},
    top_delitos: [{"tipo": "Hurto", "casos": 256}, {"tipo": "Hurto agravado", "casos": 137}, {"tipo": "Robo", "casos": 119}, {"tipo": "Estafa y defraudaciones", "casos": 102}, {"tipo": "Robo agravado", "casos": 72}],
  },
  "La Victoria": {
    total_denuncias_2024: 10682,
    tasa_por_1000_hab: 58.3,
    tasa_violentos_1000: 3.12,
    pct_delitos_violentos: 5,
    pct_delitos_patrimonio: 92,
    poblacion_estimada: 183375,
    score_seguridad: 84,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    por_categoria: {"Delitos contra el patrimonio": 9832, "Delitos contra la vida y salud": 173, "Delitos contra la libertad": 245, "Otros delitos": 161},
    top_delitos: [{"tipo": "Hurto", "casos": 4404}, {"tipo": "Hurto agravado", "casos": 1544}, {"tipo": "Robo", "casos": 677}, {"tipo": "Estafa y defraudaciones", "casos": 574}, {"tipo": "Robo agravado", "casos": 371}],
  },
  "San Borja": {
    total_denuncias_2024: 6341,
    tasa_por_1000_hab: 60.3,
    tasa_violentos_1000: 4.54,
    pct_delitos_violentos: 8,
    pct_delitos_patrimonio: 81,
    poblacion_estimada: 105076,
    score_seguridad: 79,
    nivel: "SEGURO",
    color: "#84cc16",
    por_categoria: {"Delitos contra el patrimonio": 5164, "Delitos contra la vida y salud": 388, "Delitos contra la libertad": 264, "Otros delitos": 149},
    top_delitos: [{"tipo": "Hurto", "casos": 1058}, {"tipo": "Robo", "casos": 704}, {"tipo": "Hurto agravado", "casos": 483}, {"tipo": "Robo agravado", "casos": 308}, {"tipo": "Estafa y defraudaciones", "casos": 229}],
  },
  "San Isidro": {
    total_denuncias_2024: 3780,
    tasa_por_1000_hab: 56.3,
    tasa_violentos_1000: 1.18,
    pct_delitos_violentos: 2,
    pct_delitos_patrimonio: 85,
    poblacion_estimada: 67086,
    score_seguridad: 90,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    por_categoria: {"Delitos contra el patrimonio": 3223, "Delitos contra la vida y salud": 86, "Delitos contra la libertad": 114, "Otros delitos": 92},
    top_delitos: [{"tipo": "Hurto", "casos": 1196}, {"tipo": "Robo", "casos": 355}, {"tipo": "Estafa y defraudaciones", "casos": 321}, {"tipo": "Hurto agravado", "casos": 134}, {"tipo": "Hurto de vehiculo", "casos": 127}],
  },
  "Surquillo": {
    total_denuncias_2024: 4440,
    tasa_por_1000_hab: 49.7,
    tasa_violentos_1000: 0.73,
    pct_delitos_violentos: 1,
    pct_delitos_patrimonio: 91,
    poblacion_estimada: 89283,
    score_seguridad: 91,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    por_categoria: {"Delitos contra el patrimonio": 4033, "Delitos contra la vida y salud": 81, "Delitos contra la libertad": 144, "Otros delitos": 95},
    top_delitos: [{"tipo": "Hurto", "casos": 2152}, {"tipo": "Estafa y defraudaciones", "casos": 301}, {"tipo": "Robo", "casos": 235}, {"tipo": "Hurto agravado", "casos": 160}, {"tipo": "Hurto de vehiculo", "casos": 50}],
  },
  "San Miguel": {
    total_denuncias_2024: 3454,
    tasa_por_1000_hab: 26.6,
    tasa_violentos_1000: 0.72,
    pct_delitos_violentos: 3,
    pct_delitos_patrimonio: 84,
    poblacion_estimada: 129743,
    score_seguridad: 91,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    por_categoria: {"Delitos contra el patrimonio": 2908, "Delitos contra la vida y salud": 84, "Delitos contra la libertad": 149, "Otros delitos": 124},
    top_delitos: [{"tipo": "Hurto", "casos": 844}, {"tipo": "Robo", "casos": 410}, {"tipo": "Estafa y defraudaciones", "casos": 360}, {"tipo": "Hurto agravado", "casos": 180}, {"tipo": "Hurto de vehiculo", "casos": 85}],
  },
  "Santiago de Surco": {
    total_denuncias_2024: 11715,
    tasa_por_1000_hab: 32.8,
    tasa_violentos_1000: 1.4,
    pct_delitos_violentos: 4,
    pct_delitos_patrimonio: 87,
    poblacion_estimada: 357577,
    score_seguridad: 89,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    por_categoria: {"Delitos contra el patrimonio": 10155, "Delitos contra la vida y salud": 433, "Delitos contra la libertad": 471, "Otros delitos": 271},
    top_delitos: [{"tipo": "Hurto", "casos": 4015}, {"tipo": "Robo", "casos": 1338}, {"tipo": "Hurto agravado", "casos": 684}, {"tipo": "Estafa y defraudaciones", "casos": 654}, {"tipo": "Hurto de vehiculo", "casos": 374}],
  },
};

export const BCRP_DATA = {
  // ── Precio m² por distrito (S/ corrientes) · Fuente: Urbania/BCRP 2025 ──
  precio_m2: {
    Surquillo:      6850,
    "San Miguel":   6150,
    Lince:          6000,
    "Jesús María":  7200,
    "La Victoria":  5800,
    Magdalena:      6400,
    "Pueblo Libre": 6100,
  },
  // ── Variación YoY precio m² (%) · Fuente: Urbania Index jun-2025 ──
  variacion_yoy: {
    Surquillo:      +2.1,
    "San Miguel":   +1.8,
    Lince:          +3.4,   // mayor crecimiento Lima Moderna 2025
    "Jesús María":  -0.8,   // leve corrección verificada Infobae may-2025
    "La Victoria":  +8.2,   // emergente, mayor alza
    Magdalena:      +2.6,
    "Pueblo Libre": +1.4,
  },
  // ── Yield alquiler bruto anual (%) · Fuente: Urbania Index jun-2025 ──
  yield_alquiler: {
    Surquillo:      6.0,
    "San Miguel":   5.5,
    Lince:          6.0,   // top 2 Lima jun-2025
    "Jesús María":  5.6,
    "La Victoria":  6.5,   // zona emergente Santa Catalina
    Magdalena:      5.3,
    "Pueblo Libre": 4.9,
  },
  // ── Alquiler mensual promedio (S/) · Fuente: Urbania Index jun-2025 ──
  alquiler_mensual: {
    Surquillo:      3417,
    "San Miguel":   2950,
    Lince:          3578,
    "Jesús María":  3391,
    "La Victoria":  2800,
    Magdalena:      3358,
    "Pueblo Libre": 2700,
  },
  // ── Proyección plusvalía 3 años (%) · Estimación BCRP/ASEI 2025 ──
  proyeccion_3y: {
    "La Victoria":  "+32%",
    Surquillo:      "+22%",
    Lince:          "+21%",
    "Jesús María":  "+18%",
    Magdalena:      "+17%",
    "San Miguel":   "+16%",
    "Pueblo Libre": "+14%",
  },
  // ── Histórico var % precio m² real (soles constantes 2009) · Fuente: BCRP ──
  historico: [
    { año: "2019", Surquillo: 5.2, "San Miguel": 4.1, Lince: 3.8, "Jesús María": 5.8, "La Victoria": 2.1 },
    { año: "2020", Surquillo: 3.1, "San Miguel": 2.8, Lince: 2.2, "Jesús María": 3.5, "La Victoria": 1.2 },
    { año: "2021", Surquillo: 6.8, "San Miguel": 5.9, Lince: 4.5, "Jesús María": 7.1, "La Victoria": 5.5 },
    { año: "2022", Surquillo: 9.2, "San Miguel": 7.8, Lince: 6.1, "Jesús María": 9.8, "La Victoria": 11.2 },
    { año: "2023", Surquillo: 8.1, "San Miguel": 6.9, Lince: 5.8, "Jesús María": 8.5, "La Victoria": 12.5 },
    { año: "2024", Surquillo: 8.2, "San Miguel": 7.4, Lince: 6.2, "Jesús María": 8.0, "La Victoria": 12.4 },
    { año: "2025P", Surquillo: 8.5, "San Miguel": 7.6, Lince: 6.5, "Jesús María": 8.2, "La Victoria": 13.1 },
  ],
  ranking_plusvalia: ["La Victoria", "Surquillo", "Lince", "Jesús María", "Magdalena", "San Miguel", "Pueblo Libre"],
  // ── Indicadores macro · Fuente: BCRP Reporte Inflación Dic-2025 / INEI ──
  macro: {
    pbi_peru_2024:         3.3,   // % crecimiento real 2024 (BCRP Mar-2025)
    pbi_construccion_2024: 4.8,   // % sector construcción cierre 2024 (INEI/BCRP)
    pbi_construccion_2025: 5.2,   // % proyección 2025 (BCRP RI Dic-2025)
    inflacion_2024:        2.0,   // % acumulada cierre 2024 (BCRP)
    inflacion_meta:        2.0,   // % meta BCRP (rango 1-3%)
    tipo_cambio:           3.76,  // S/ por USD promedio 2024 (BCRP)
    tipo_cambio_proyeccion: 3.80, // S/ por USD expectativa fin 2025 (BCRP)
    tasa_referencia_bcrp:  4.75,  // % tasa política monetaria (feb-2025)
    ventas_q1_2025:        30,    // % crecimiento ventas vs Q1-2024 (Infobae may-2025)
    yield_promedio_lima:   5.27,  // % yield bruto promedio Lima (Urbania jun-2025)
    precio_m2_promedio:    6821,  // S/ precio promedio Lima Metropolitana 2025 (CAPECO)
    aumento_real_5y:       21,    // % aumento real vs 2019 ajustado por BCRP (ASEI sep-2024)
  },
  fuente: "BCRP · Urbania Index · INEI · ASEI · CAPECO — 2024-2025",
};

// Tasas TEA crédito hipotecario en soles · Fuente: SBS Perú · marzo 2025
export const TASAS_SBS = [
  { banco: "BBVA",              tasa: 7.53, destacado: true  },
  { banco: "GNB Sudamericana",  tasa: 7.90, destacado: false },
  { banco: "Interbank",         tasa: 7.94, destacado: false },
  { banco: "Scotiabank",        tasa: 8.00, destacado: false },
  { banco: "BanBif",            tasa: 8.37, destacado: false },
  { banco: "BCP",               tasa: 8.62, destacado: false },
  { banco: "Pichincha",         tasa: 8.96, destacado: false },
  { banco: "Banco del Comercio",tasa: 10.29, destacado: false },
];

export const DATACRIM_PREDIOS = {
  1: {
    nombre: "LUMA - SAN MIGUEL",
    total_500m_2024: 495,
    violentos_500m: 7,
    pct_violentos: 1,
    score_seguridad: 82,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    top_delitos: [{"tipo": "Hurto", "casos": 150}, {"tipo": "Estafa y defraudaciones", "casos": 40}, {"tipo": "Robo", "casos": 32}, {"tipo": "Hurto agravado", "casos": 20}, {"tipo": "Robo agravado", "casos": 3}],
  },
  2: {
    nombre: "Vista Tower",
    total_500m_2024: 727,
    violentos_500m: 24,
    pct_violentos: 3,
    score_seguridad: 63,
    nivel: "MODERADO",
    color: "#f59e0b",
    top_delitos: [{"tipo": "Hurto", "casos": 404}, {"tipo": "Hurto agravado", "casos": 54}, {"tipo": "Robo", "casos": 49}, {"tipo": "Estafa y defraudaciones", "casos": 36}, {"tipo": "Robo agravado", "casos": 16}],
  },
  3: {
    nombre: "Supra Tower",
    total_500m_2024: 476,
    violentos_500m: 11,
    pct_violentos: 2,
    score_seguridad: 81,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    top_delitos: [{"tipo": "Hurto", "casos": 106}, {"tipo": "Estafa y defraudaciones", "casos": 49}, {"tipo": "Robo", "casos": 34}, {"tipo": "Hurto agravado", "casos": 15}, {"tipo": "Robo agravado armado", "casos": 4}],
  },
  4: {
    nombre: "Albamar | Aura",
    total_500m_2024: 464,
    violentos_500m: 10,
    pct_violentos: 2,
    score_seguridad: 82,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    top_delitos: [{"tipo": "Hurto", "casos": 142}, {"tipo": "Robo", "casos": 32}, {"tipo": "Estafa y defraudaciones", "casos": 25}, {"tipo": "Hurto agravado", "casos": 15}, {"tipo": "Robo agravado", "casos": 5}],
  },
  5: {
    nombre: "Proyecto Libertad",
    total_500m_2024: 460,
    violentos_500m: 10,
    pct_violentos: 2,
    score_seguridad: 83,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    top_delitos: [{"tipo": "Hurto", "casos": 100}, {"tipo": "Estafa y defraudaciones", "casos": 47}, {"tipo": "Robo", "casos": 35}, {"tipo": "Hurto agravado", "casos": 18}, {"tipo": "Robo agravado armado", "casos": 4}],
  },
  6: {
    nombre: "Quiñones Park",
    total_500m_2024: 438,
    violentos_500m: 13,
    pct_violentos: 3,
    score_seguridad: 82,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    top_delitos: [{"tipo": "Hurto", "casos": 150}, {"tipo": "Robo", "casos": 76}, {"tipo": "Estafa y defraudaciones", "casos": 44}, {"tipo": "Hurto agravado", "casos": 20}, {"tipo": "Robo agravado", "casos": 6}],
  },
  7: {
    nombre: "DANAUS - SURQUILLO",
    total_500m_2024: 483,
    violentos_500m: 9,
    pct_violentos: 2,
    score_seguridad: 82,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    top_delitos: [{"tipo": "Hurto", "casos": 145}, {"tipo": "Robo", "casos": 41}, {"tipo": "Estafa y defraudaciones", "casos": 25}, {"tipo": "Hurto agravado", "casos": 20}, {"tipo": "Robo agravado", "casos": 5}],
  },
  8: {
    nombre: "ALBORADA III - SAN MIGUEL",
    total_500m_2024: 387,
    violentos_500m: 7,
    pct_violentos: 2,
    score_seguridad: 88,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    top_delitos: [{"tipo": "Hurto", "casos": 120}, {"tipo": "Estafa y defraudaciones", "casos": 40}, {"tipo": "Robo", "casos": 32}, {"tipo": "Hurto agravado", "casos": 17}, {"tipo": "Robo agravado armado", "casos": 3}],
  },
  9: {
    nombre: "Villa Elenia",
    total_500m_2024: 831,
    violentos_500m: 29,
    pct_violentos: 3,
    score_seguridad: 56,
    nivel: "MODERADO",
    color: "#f59e0b",
    top_delitos: [{"tipo": "Hurto", "casos": 462}, {"tipo": "Robo", "casos": 69}, {"tipo": "Hurto agravado", "casos": 69}, {"tipo": "Estafa y defraudaciones", "casos": 39}, {"tipo": "Robo agravado", "casos": 19}],
  },
  10: {
    nombre: "CAPRI Santa Catalina",
    total_500m_2024: 435,
    violentos_500m: 26,
    pct_violentos: 6,
    score_seguridad: 76,
    nivel: "SEGURO",
    color: "#84cc16",
    top_delitos: [{"tipo": "Robo", "casos": 131}, {"tipo": "Hurto", "casos": 125}, {"tipo": "Robo agravado", "casos": 17}, {"tipo": "Hurto agravado", "casos": 17}, {"tipo": "Estafa y defraudaciones", "casos": 8}],
  },
  11: {
    nombre: "ALLURE - JESÚS MARÍA",
    total_500m_2024: 967,
    violentos_500m: 44,
    pct_violentos: 5,
    score_seguridad: 42,
    nivel: "PRECAUCIÓN",
    color: "#ef4444",
    top_delitos: [{"tipo": "Hurto", "casos": 239}, {"tipo": "Hurto agravado", "casos": 96}, {"tipo": "Estafa y defraudaciones", "casos": 93}, {"tipo": "Robo", "casos": 58}, {"tipo": "Robo agravado", "casos": 30}],
  },
  12: {
    nombre: "Residencial Leyendas II",
    total_500m_2024: 433,
    violentos_500m: 6,
    pct_violentos: 1,
    score_seguridad: 86,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    top_delitos: [{"tipo": "Hurto", "casos": 166}, {"tipo": "Estafa y defraudaciones", "casos": 47}, {"tipo": "Robo", "casos": 40}, {"tipo": "Hurto agravado", "casos": 21}, {"tipo": "Robo agravado", "casos": 3}],
  },
  13: {
    nombre: "Element",
    total_500m_2024: 551,
    violentos_500m: 11,
    pct_violentos: 2,
    score_seguridad: 78,
    nivel: "MUY SEGURO",
    color: "#22c55e",
    top_delitos: [{"tipo": "Hurto", "casos": 125}, {"tipo": "Robo", "casos": 61}, {"tipo": "Estafa y defraudaciones", "casos": 26}, {"tipo": "Hurto agravado", "casos": 22}, {"tipo": "Microcomercializacion drogas", "casos": 7}],
  },
};
