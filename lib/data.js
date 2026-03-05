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
export const PROYECTOS_RAW = [
  {
    "id": 1,
    "id_nexo": 3796,
    "nombre": "LUMA - SAN MIGUEL",
    "inmobiliaria": "GRUPO MG",
    "direccion": "Av. La Paz 1641",
    "distrito": "San Miguel",
    "lat": -12.074269830357485,
    "lng": -77.09553037282942,
    "zona": "Lima Moderna",
    "precio_desde": 214650,
    "precio_hasta": 369552,
    "moneda": "S/",
    "area_desde": 40.33,
    "area_hasta": 63.67,
    "dormitorios": [
      1,
      2,
      3
    ],
    "pisos": 15,
    "etapa": "En Construcción",
    "cuota_inicial_min": 50,
    "entrega": "2027",
    "banco_sponsor": "INTERBANK",
    "ruc": "",
    "amenities": [
      "Gimnasio",
      "Lobby",
      "Piscina",
      "Sala Bar",
      "Sala de Niños",
      "Sala de usos Múltiples",
      "Zona de Parrillas"
    ],
    "acabados_lista": [],
    "electrodomesticos": [],
    "descripcion": "Proyecto moderno, diseño enfocado en la eficiencia energética y la funcionalidad, con departamentos de espacios amplios y luminosos. Departamentos de 1 y 2 dormitorios. Diseñado para brindar una exper",
    "imagen": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-68f7bc577175b_b.jpg",
    "imagen_color": "#1a4a2e",
    "per": 18.5,
    "reputacion": 4,
    "comision_pct": 2,
    "url_nexo": "https://admin.nexoagentes.pe/project/3796?projectTypes=1&projectTypes=2",
    "fotos": [
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-68f7bc577175b_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-695ff055d7b98_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-68f7bc6ede1f3_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-68f7bc87bb746_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-68f7bc9c8d00a_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-68f7bcb8ac65a_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-68f7bcd51e769_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3796-luma-san-miguel/departamentos-san-miguel-68f7bceaca2ae_b.jpg"
    ],
    "youtube_url": "https://www.youtube.com/embed/-933qdQzqOY?picture-in-picture=1&accelerometer=1&gyroscope=1",
    "modelos": [
      {
        "nombre": "Flat A9  Piso: 11  Solicitar cita  (1 unidad) Desde S/. 216,500  (Ref. $ 63,415)  1 dorm- 1 baños 40.7 m2Pisos: 11",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.7,
        "precio": 216500,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A8  Pisos: Entre 2 al 8  Solicitar cita  (7 unidades) Desde S/. 219,448  (Ref. $ 64,279)  1 dorm- 1 baños 40.48 m2Pisos: Entre 2 al 8",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.48,
        "precio": 219448,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A7b  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 227,544  (Ref. $ 66,650)  1 dorm- 1 baños 40.48 m2Pisos: 2",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.48,
        "precio": 227544,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A7  Pisos: Entre 3 al 11  Solicitar cita  (7 unidades) Desde S/. 340,808  (Ref. $ 99,827)  3 dorm- 2 baños 63.04 m2Pisos: Entre 3 al 11",
        "dormitorios": 3,
        "banos": 2,
        "area": 63.04,
        "precio": 340808,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A6b  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 369,552  (Ref. $ 108,246)  2 dorm- 2 baños 63.67 m2Pisos: 2",
        "dormitorios": 2,
        "banos": 2,
        "area": 63.67,
        "precio": 369552,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A6  Pisos: Entre 3 al 9  Solicitar cita  (7 unidades) Desde S/. 299,470  (Ref. $ 87,718)  2 dorm- 2 baños 53.05 m2Pisos: Entre 3 al 9",
        "dormitorios": 2,
        "banos": 2,
        "area": 53.05,
        "precio": 299470,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A5b  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 322,512  (Ref. $ 94,467)  2 dorm- 2 baños 55.27 m2Pisos: 2",
        "dormitorios": 2,
        "banos": 2,
        "area": 55.27,
        "precio": 322512,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A5  Pisos: Entre 3 al 12  Solicitar cita  (10 unidades) Desde S/. 291,300  (Ref. $ 85,325)  2 dorm- 2 baños 55.66 m2Pisos: Entre 3 al 12",
        "dormitorios": 2,
        "banos": 2,
        "area": 55.66,
        "precio": 291300,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A4  Pisos: Entre 3 al 11  Solicitar cita  (9 unidades) Desde S/. 303,108  (Ref. $ 88,784)  2 dorm- 2 baños 55.79 m2Pisos: Entre 3 al 11",
        "dormitorios": 2,
        "banos": 2,
        "area": 55.79,
        "precio": 303108,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A3  Pisos: Entre 3 al 11  Solicitar cita  (7 unidades) Desde S/. 215,150  (Ref. $ 63,020)  1 dorm- 1 baños 40.43 m2Pisos: Entre 3 al 11",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.43,
        "precio": 215150,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A2  Pisos: Entre 2 al 7  Solicitar cita  (6 unidades) Desde S/. 220,570  (Ref. $ 64,608)  1 dorm- 1 baños 40.7 m2Pisos: Entre 2 al 7",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.7,
        "precio": 220570,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A16  Pisos: Entre 4 al 11  Solicitar cita  (6 unidades) Desde S/. 267,800  (Ref. $ 78,442)  2 dorm- 2 baños 50.96 m2Pisos: Entre 4 al 11",
        "dormitorios": 2,
        "banos": 2,
        "area": 50.96,
        "precio": 267800,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A15b  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 283,088  (Ref. $ 82,920)  2 dorm- 2 baños 50.96 m2Pisos: 2",
        "dormitorios": 2,
        "banos": 2,
        "area": 50.96,
        "precio": 283088,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A15  Pisos: Entre 3 al 10  Solicitar cita  (8 unidades) Desde S/. 269,900  (Ref. $ 79,057)  2 dorm- 2 baños 51.38 m2Pisos: Entre 3 al 10",
        "dormitorios": 2,
        "banos": 2,
        "area": 51.38,
        "precio": 269900,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A14b  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 285,314  (Ref. $ 83,572)  2 dorm- 2 baños 51.38 m2Pisos: 2",
        "dormitorios": 2,
        "banos": 2,
        "area": 51.38,
        "precio": 285314,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A14  Pisos: Entre 3 al 9  Solicitar cita  (7 unidades) Desde S/. 275,300  (Ref. $ 80,639)  2 dorm- 2 baños 52.46 m2Pisos: Entre 3 al 9",
        "dormitorios": 2,
        "banos": 2,
        "area": 52.46,
        "precio": 275300,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A13  Pisos: Entre 3 al 12  Solicitar cita  (7 unidades) Desde S/. 262,120  (Ref. $ 76,778)  2 dorm- 2 baños 51.9 m2Pisos: Entre 3 al 12",
        "dormitorios": 2,
        "banos": 2,
        "area": 51.9,
        "precio": 262120,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A12b  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 288,070  (Ref. $ 84,379)  2 dorm- 2 baños 51.9 m2Pisos: 2",
        "dormitorios": 2,
        "banos": 2,
        "area": 51.9,
        "precio": 288070,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A12  Pisos: Entre 3 al 8  Solicitar cita  (6 unidades) Desde S/. 272,131  (Ref. $ 79,710)  2 dorm- 2 baños 50.81 m2Pisos: Entre 3 al 8",
        "dormitorios": 2,
        "banos": 2,
        "area": 50.81,
        "precio": 272131,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A11b  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 282,293  (Ref. $ 82,687)  2 dorm- 2 baños 50.81 m2Pisos: 2",
        "dormitorios": 2,
        "banos": 2,
        "area": 50.81,
        "precio": 282293,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A11  Pisos: Entre 3 al 9  Solicitar cita  (6 unidades) Desde S/. 268,150  (Ref. $ 78,544)  2 dorm- 2 baños 51.03 m2Pisos: Entre 3 al 9",
        "dormitorios": 2,
        "banos": 2,
        "area": 51.03,
        "precio": 268150,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A10b  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 283,459  (Ref. $ 83,028)  2 dorm- 2 baños 51.03 m2Pisos: 2",
        "dormitorios": 2,
        "banos": 2,
        "area": 51.03,
        "precio": 283459,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A10  Pisos: Entre 3 al 10  Solicitar cita  (8 unidades) Desde S/. 268,350  (Ref. $ 78,603)  2 dorm- 2 baños 51.07 m2Pisos: Entre 3 al 10",
        "dormitorios": 2,
        "banos": 2,
        "area": 51.07,
        "precio": 268350,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A1  Pisos: Entre 2 al 11  Solicitar cita  (7 unidades) Desde S/. 214,650  (Ref. $ 62,873)  1 dorm- 1 baños 40.33 m2Pisos: Entre 2 al 11",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.33,
        "precio": 214650,
        "comision_pct": 2
      }
    ]
  },
  {
    "id": 2,
    "id_nexo": 3679,
    "nombre": "Vista Tower",
    "inmobiliaria": "QUATRO INMOBILIARIA",
    "direccion": "Av. Tomas Marsano 2619, Surquillo",
    "distrito": "Surquillo",
    "lat": -12.106446628330005,
    "lng": -77.02698161439235,
    "zona": "Lima Moderna",
    "precio_desde": 228252,
    "precio_hasta": 476104,
    "moneda": "S/",
    "area_desde": 68.5,
    "area_hasta": 68.5,
    "dormitorios": [
      1,
      2,
      3
    ],
    "pisos": 15,
    "etapa": "En Construcción",
    "cuota_inicial_min": 20,
    "entrega": "2027",
    "banco_sponsor": "SCOTIABANK",
    "ruc": "",
    "amenities": [
      "Gimnasio",
      "Lobby",
      "Sala de Niños",
      "Sala de usos Múltiples",
      "Terraza",
      "Zona de Lavandería",
      "Zona de Parrillas"
    ],
    "acabados_lista": [],
    "electrodomesticos": [],
    "descripcion": "Imagina despertar cada día con la serenidad de la naturaleza a tus pies. Con salida directa a parque, VistaTower te invita a descubrir un espacio donde el parque se convierte en tu extensión personal.",
    "imagen": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-6984c7c97f2ba_b.jpg",
    "imagen_color": "#1a3a5c",
    "per": 18.5,
    "reputacion": 4,
    "comision_pct": 2,
    "url_nexo": "https://admin.nexoagentes.pe/project/3679?projectTypes=1&projectTypes=2",
    "fotos": [
      "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-6984c7c97f2ba_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-68f66c19bfcb9_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-68f669dad03c9_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-68f6694586b26_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-68f668e407324_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-68f668d53c18f_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-68f668c99d747_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3679-vista-tower/departamentos-surquillo-68f668aef0247_b.jpg"
    ],
    "youtube_url": "https://www.youtube.com/embed/qU50koZTqqg?picture-in-picture=1&accelerometer=1&gyroscope=1",
    "modelos": [
      {
        "nombre": "Flat J  Pisos: Entre 10 al 22  Solicitar cita  (9 unidades) Desde S/. 392,185  (Ref. $ 114,876)  2 dorm- 2 baños 57.5 m2Pisos: Entre 10 al 22",
        "dormitorios": 2,
        "banos": 2,
        "area": 57.5,
        "precio": 392185,
        "comision_pct": 2
      },
      {
        "nombre": "Flat I  Pisos: Entre 10 al 22  Solicitar cita  (10 unidades) Desde S/. 360,821  (Ref. $ 105,689)  2 dorm- 2 baños 52.5 m2Pisos: Entre 10 al 22",
        "dormitorios": 2,
        "banos": 2,
        "area": 52.5,
        "precio": 360821,
        "comision_pct": 2
      },
      {
        "nombre": "Flat H  Pisos: Entre 11 al 22  Solicitar cita  (8 unidades) Desde S/. 360,292  (Ref. $ 105,534)  2 dorm- 2 baños 49.5 m2Pisos: Entre 11 al 22",
        "dormitorios": 2,
        "banos": 2,
        "area": 49.5,
        "precio": 360292,
        "comision_pct": 2
      },
      {
        "nombre": "Flat G  Pisos: Entre 2 al 7  Solicitar cita  (6 unidades) Desde S/. 313,763  (Ref. $ 91,905)  1 dorm- 1 baños 41 m2Pisos: Entre 2 al 7",
        "dormitorios": 1,
        "banos": 1,
        "area": 41,
        "precio": 313763,
        "comision_pct": 2
      },
      {
        "nombre": "Flat F  Pisos: Entre 2 al 7  Solicitar cita  (6 unidades) Desde S/. 228,252  (Ref. $ 66,858)  1 dorm- 1 baños 28 m2Pisos: Entre 2 al 7",
        "dormitorios": 1,
        "banos": 1,
        "area": 28,
        "precio": 228252,
        "comision_pct": 2
      },
      {
        "nombre": "Flat E  Pisos: Entre 2 al 9  Solicitar cita  (8 unidades) Desde S/. 371,469  (Ref. $ 108,808)  2 dorm- 2 baños 51 m2Pisos: Entre 2 al 9",
        "dormitorios": 2,
        "banos": 2,
        "area": 51,
        "precio": 371469,
        "comision_pct": 2
      },
      {
        "nombre": "Flat D  Pisos: Entre 2 al 22  Solicitar cita  (10 unidades) Desde S/. 289,241  (Ref. $ 84,722)  2 dorm- 2 baños 51 m2Pisos: Entre 2 al 22",
        "dormitorios": 2,
        "banos": 2,
        "area": 51,
        "precio": 289241,
        "comision_pct": 2
      },
      {
        "nombre": "Flat C  Pisos: Entre 2 al 19  Solicitar cita  (12 unidades) Desde S/. 280,867  (Ref. $ 82,269)  1 dorm- 1 baños 36 m2Pisos: Entre 2 al 19",
        "dormitorios": 1,
        "banos": 1,
        "area": 36,
        "precio": 280867,
        "comision_pct": 2
      },
      {
        "nombre": "Flat B  Pisos: Entre 7 al 22  Solicitar cita  (12 unidades) Desde S/. 476,104  (Ref. $ 139,456)  3 dorm- 2 baños 68.5 m2Pisos: Entre 7 al 22",
        "dormitorios": 3,
        "banos": 2,
        "area": 68.5,
        "precio": 476104,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A  Pisos: 2, 3, 4  Solicitar cita  (3 unidades) Desde S/. 302,396  (Ref. $ 88,575)  1 dorm- 1 baños 38.5 m2Pisos: 2, 3, 4",
        "dormitorios": 1,
        "banos": 1,
        "area": 38.5,
        "precio": 302396,
        "comision_pct": 2
      }
    ]
  },
  {
    "id": 3,
    "id_nexo": 3202,
    "nombre": "Supra Tower",
    "inmobiliaria": "QUATRO INMOBILIARIA",
    "direccion": "Avenida Los Patriotas 415",
    "distrito": "San Miguel",
    "lat": -12.08057097684937,
    "lng": -77.09539747479998,
    "zona": "Lima Moderna",
    "precio_desde": 234288,
    "precio_hasta": 535297,
    "moneda": "S/",
    "area_desde": 101.5,
    "area_hasta": 101.5,
    "dormitorios": [
      1,
      2
    ],
    "pisos": 15,
    "etapa": "En Construcción",
    "cuota_inicial_min": 20,
    "entrega": "2026",
    "banco_sponsor": "BCP",
    "ruc": "",
    "amenities": [
      "Gimnasio",
      "Jardin de niños",
      "Lobby",
      "Piscina",
      "Sala Bar",
      "Sala de Niños",
      "Sala de usos Múltiples",
      "Terraza",
      "Zona de Parrillas"
    ],
    "acabados_lista": [],
    "electrodomesticos": [],
    "descripcion": "Supra es un moderno proyecto en San Miguel, en una ubicación estratégica y en un vecindario familiar para sentirse en casa todos los días.",
    "imagen": "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-6984c7a4eb4ca_b.jpg",
    "imagen_color": "#1a4a2e",
    "per": 18.5,
    "reputacion": 4,
    "comision_pct": 2,
    "url_nexo": "https://admin.nexoagentes.pe/project/3202?projectTypes=1&projectTypes=2",
    "fotos": [
      "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-6984c7a4eb4ca_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-68f67552d5972_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-68f675440dad6_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-68f676e9d7e52_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-68f67a1b0328c_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-68f67a10e7f76_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-68f67a07ce70a_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/quatro-inmobiliaria/3202-supra-tower/departamentos-san-miguel-68f679fe38b35_b.jpg"
    ],
    "youtube_url": "https://www.youtube.com/embed/5nYyn-V5PzE?picture-in-picture=1&accelerometer=1&gyroscope=1",
    "modelos": [
      {
        "nombre": "Flat S  Pisos: Entre 6 al 20  Solicitar cita  (9 unidades) Desde S/. 331,696  (Ref. $ 97,158)  2 dorm- 2 baños 53.5 m2Pisos: Entre 6 al 20",
        "dormitorios": 2,
        "banos": 2,
        "area": 53.5,
        "precio": 331696,
        "comision_pct": 2
      },
      {
        "nombre": "Flat R  Pisos: 6 y 11  Solicitar cita  (2 unidades) Desde S/. 343,156  (Ref. $ 100,514)  2 dorm- 2 baños 52.5 m2Pisos: 6 y 11",
        "dormitorios": 2,
        "banos": 2,
        "area": 52.5,
        "precio": 343156,
        "comision_pct": 2
      },
      {
        "nombre": "Flat P  Pisos: Entre 6 al 20  Solicitar cita  (12 unidades) Desde S/. 333,892  (Ref. $ 97,801)  2 dorm- 2 baños 55 m2Pisos: Entre 6 al 20",
        "dormitorios": 2,
        "banos": 2,
        "area": 55,
        "precio": 333892,
        "comision_pct": 2
      },
      {
        "nombre": "Flat M  Piso: 1  Solicitar cita  (1 unidad) Desde S/. 535,297  (Ref. $ 156,795)  2 dorm- 2 baños 101.5 m2Pisos: 1",
        "dormitorios": 2,
        "banos": 2,
        "area": 101.5,
        "precio": 535297,
        "comision_pct": 2
      },
      {
        "nombre": "Flat K  Piso: 1  Solicitar cita  (1 unidad) Desde S/. 485,627  (Ref. $ 142,246)  2 dorm- 2 baños 84.7 m2Pisos: 1",
        "dormitorios": 2,
        "banos": 2,
        "area": 84.7,
        "precio": 485627,
        "comision_pct": 2
      },
      {
        "nombre": "Flat J  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 352,767  (Ref. $ 103,330)  1 dorm- 1 baños 52 m2Pisos: 2",
        "dormitorios": 1,
        "banos": 1,
        "area": 52,
        "precio": 352767,
        "comision_pct": 2
      },
      {
        "nombre": "Flat H  Pisos: Entre 2 al 19  Solicitar cita  (7 unidades) Desde S/. 340,053  (Ref. $ 99,605)  2 dorm- 2 baños 55 m2Pisos: Entre 2 al 19",
        "dormitorios": 2,
        "banos": 2,
        "area": 55,
        "precio": 340053,
        "comision_pct": 2
      },
      {
        "nombre": "Flat G  Pisos: Entre 2 al 20  Solicitar cita  (15 unidades) Desde S/. 346,645  (Ref. $ 101,536)  2 dorm- 2 baños 58 m2Pisos: Entre 2 al 20",
        "dormitorios": 2,
        "banos": 2,
        "area": 58,
        "precio": 346645,
        "comision_pct": 2
      },
      {
        "nombre": "Flat F  Pisos: Entre 2 al 20  Solicitar cita  (15 unidades) Desde S/. 342,461  (Ref. $ 100,311)  2 dorm- 2 baños 57.3 m2Pisos: Entre 2 al 20",
        "dormitorios": 2,
        "banos": 2,
        "area": 57.3,
        "precio": 342461,
        "comision_pct": 2
      },
      {
        "nombre": "Flat E2  Pisos: Entre 3 al 17  Solicitar cita  (11 unidades) Desde S/. 234,288  (Ref. $ 68,626)  1 dorm- 1 baños 34.3 m2Pisos: Entre 3 al 17",
        "dormitorios": 1,
        "banos": 1,
        "area": 34.3,
        "precio": 234288,
        "comision_pct": 2
      },
      {
        "nombre": "Flat E1  Pisos: 3, 4, 5  Solicitar cita  (3 unidades) Desde S/. 248,262  (Ref. $ 72,719)  1 dorm- 1 baños 33 m2Pisos: 3, 4, 5",
        "dormitorios": 1,
        "banos": 1,
        "area": 33,
        "precio": 248262,
        "comision_pct": 2
      },
      {
        "nombre": "Flat D  Pisos: Entre 2 al 20  Solicitar cita  (10 unidades) Desde S/. 393,503  (Ref. $ 115,262)  2 dorm- 2 baños 65.5 m2Pisos: Entre 2 al 20",
        "dormitorios": 2,
        "banos": 2,
        "area": 65.5,
        "precio": 393503,
        "comision_pct": 2
      },
      {
        "nombre": "Flat B  Pisos: 10 y 14  Solicitar cita  (2 unidades) Desde S/. 401,135  (Ref. $ 117,497)  2 dorm- 2 baños 62.3 m2Pisos: 10 y 14",
        "dormitorios": 2,
        "banos": 2,
        "area": 62.3,
        "precio": 401135,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A  Pisos: 2, 3, 14, 16  Solicitar cita  (4 unidades) Desde S/. 417,482  (Ref. $ 122,285)  2 dorm- 2 baños 66 m2Pisos: 2, 3, 14, 16",
        "dormitorios": 2,
        "banos": 2,
        "area": 66,
        "precio": 417482,
        "comision_pct": 2
      }
    ]
  },
  {
    "id": 4,
    "id_nexo": 3683,
    "nombre": "Albamar | Aura",
    "inmobiliaria": "ALBAMAR GRUPO INMOBILIARIO",
    "direccion": "Calle Gerard Blanchere 103 Esq Av. Tomás Marsano 1649, Surquillo",
    "distrito": "Surquillo",
    "lat": -12.102881899200815,
    "lng": -77.02090817061273,
    "zona": "Lima Moderna",
    "precio_desde": 238900,
    "precio_hasta": 736300,
    "moneda": "S/",
    "area_desde": 29.62,
    "area_hasta": 140.55,
    "dormitorios": [
      1,
      2,
      3
    ],
    "pisos": 15,
    "etapa": "En Construcción",
    "cuota_inicial_min": 30,
    "entrega": "2027",
    "banco_sponsor": "INTERBANK",
    "ruc": "",
    "amenities": [
      "Gimnasio",
      "Lobby",
      "Sala Bar",
      "Sala de usos Múltiples",
      "Zona de Parrillas"
    ],
    "acabados_lista": [],
    "electrodomesticos": [],
    "descripcion": "Nace al lado del Barrio Aurora, donde Surquillo y Miraflores se encuentran. Vive rodeado de estilo, parques y centros comerciales Aquí, la energía de la ciudad se siente, se vive y se conecta.",
    "imagen": "https://dp34qvsykz8fe.cloudfront.net/customers/albamar-grupo-inmobiliario/3683-albamar-aura/departamentos-surquillo-699cc23ae4470_b.jpg",
    "imagen_color": "#1a3a5c",
    "per": 18.5,
    "reputacion": 4,
    "comision_pct": 2,
    "url_nexo": "https://admin.nexoagentes.pe/project/3683?projectTypes=1&projectTypes=2",
    "fotos": [
      "https://dp34qvsykz8fe.cloudfront.net/customers/albamar-grupo-inmobiliario/3683-albamar-aura/departamentos-surquillo-699cc23ae4470_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/albamar-grupo-inmobiliario/3683-albamar-aura/departamentos-surquillo-699795841067a_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/departamentos-surquillo-6809481989f89_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/departamentos-surquillo-6809556a47bf8_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/departamentos-surquillo-6809555969fff_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/departamentos-surquillo-680955b012dd5_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/departamentos-surquillo-6809562ca1ed7_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/inmobiliaria-albamar-sac/3683-albamar-aura/departamentos-surquillo-6809567354e75_b.jpg"
    ],
    "youtube_url": "https://www.youtube.com/embed/_eS3j5FKVCA?picture-in-picture=1&accelerometer=1&gyroscope=1",
    "modelos": [
      {
        "nombre": "Duplex TIPO 3K  Piso: 22  Solicitar cita  (1 unidad) Desde S/. 644,800  (Ref. $ 188,869)  3 dorm- 2 baños 94.37 m2Pisos: 22",
        "dormitorios": 3,
        "banos": 2,
        "area": 94.37,
        "precio": 644800,
        "comision_pct": 2
      },
      {
        "nombre": "Duplex TIPO 2J  Piso: 22  Solicitar cita  (1 unidad) Desde S/. 736,300  (Ref. $ 215,671)  3 dorm- 2 baños 140.55 m2Pisos: 22",
        "dormitorios": 3,
        "banos": 2,
        "area": 140.55,
        "precio": 736300,
        "comision_pct": 2
      },
      {
        "nombre": "Duplex TIPO 1I  Piso: 22  Solicitar cita  (1 unidad) Desde S/. 472,300  (Ref. $ 138,342)  2 dorm- 2 baños 68.6 m2Pisos: 22",
        "dormitorios": 2,
        "banos": 2,
        "area": 68.6,
        "precio": 472300,
        "comision_pct": 2
      },
      {
        "nombre": "Flat TIPO 6F  Piso: 2  Solicitar cita  (8 unidades) Desde S/. 391,400  (Ref. $ 114,646)  2 dorm- 2 baños 55.69 m2Pisos: 2",
        "dormitorios": 2,
        "banos": 2,
        "area": 55.69,
        "precio": 391400,
        "comision_pct": 2
      },
      {
        "nombre": "Flat TIPO 5E  Pisos: Entre 2 al 13  Solicitar cita  (10 unidades) Desde S/. 238,900  (Ref. $ 69,977)  1 dorm- 1 baños 29.62 m2Pisos: Entre 2 al 13",
        "dormitorios": 1,
        "banos": 1,
        "area": 29.62,
        "precio": 238900,
        "comision_pct": 2
      },
      {
        "nombre": "Flat TIPO 4D  Pisos: Entre 3 al 18  Solicitar cita  (13 unidades) Desde S/. 386,800  (Ref. $ 113,298)  2 dorm- 2 baños 56.7 m2Pisos: Entre 3 al 18",
        "dormitorios": 2,
        "banos": 2,
        "area": 56.7,
        "precio": 386800,
        "comision_pct": 2
      },
      {
        "nombre": "Flat TIPO 3C  Pisos: 6, 7, 8, 9, 11  Solicitar cita  (5 unidades) Desde S/. 410,600  (Ref. $ 120,269)  2 dorm- 2 baños 54.66 m2Pisos: 6, 7, 8, 9, 11",
        "dormitorios": 2,
        "banos": 2,
        "area": 54.66,
        "precio": 410600,
        "comision_pct": 2
      },
      {
        "nombre": "Flat TIPO 2B  Pisos: Entre 3 al 21  Solicitar cita  (14 unidades) Desde S/. 438,900  (Ref. $ 128,559)  3 dorm- 2 baños 70.33 m2Pisos: Entre 3 al 21",
        "dormitorios": 3,
        "banos": 2,
        "area": 70.33,
        "precio": 438900,
        "comision_pct": 2
      },
      {
        "nombre": "Flat TIPO 1A  Pisos: 4 y 11  Solicitar cita  (2 unidades) Desde S/. 281,100  (Ref. $ 82,337)  1 dorm- 1 baños 35.56 m2Pisos: 4 y 11",
        "dormitorios": 1,
        "banos": 1,
        "area": 35.56,
        "precio": 281100,
        "comision_pct": 2
      }
    ]
  },
  {
    "id": 5,
    "id_nexo": 3251,
    "nombre": "Proyecto Libertad",
    "inmobiliaria": "GRUPO INMOBILIARIO COMUNIDAD",
    "direccion": "Avenida La Libertad 200",
    "distrito": "San Miguel",
    "lat": -12.079792111220133,
    "lng": -77.09602768461193,
    "zona": "Lima Moderna",
    "precio_desde": 240000,
    "precio_hasta": 388000,
    "moneda": "S/",
    "area_desde": 30,
    "area_hasta": 60,
    "dormitorios": [
      1,
      2,
      3
    ],
    "pisos": 15,
    "etapa": "En Planos",
    "cuota_inicial_min": 60,
    "entrega": "2026",
    "banco_sponsor": "SCOTIABANK",
    "ruc": "",
    "amenities": [
      "Gimnasio",
      "Lobby",
      "Piscina",
      "Sala de cine",
      "Terraza",
      "Zona de Parrillas"
    ],
    "acabados_lista": [],
    "electrodomesticos": [],
    "descripcion": "\"Libertad\" es mucho más que un proyecto inmobiliario. Es la puerta de entrada hacia una vida independiente y emocionante. Con metrajes inteligentes y precios accesibles, te brindamos la oportunidad d",
    "imagen": "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-67a546323b99d_b.jpg",
    "imagen_color": "#1a4a2e",
    "per": 18.5,
    "reputacion": 4,
    "comision_pct": 2,
    "url_nexo": "https://admin.nexoagentes.pe/project/3251?projectTypes=1&projectTypes=2",
    "fotos": [
      "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-67a546323b99d_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-664bbb85c04eb_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-664d090f6fb8e_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-67a546d57dd7a_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-67a54704321a0_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-67a546ed3138c_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-67a546bcdb255_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/comunidad-grupo-inmobiliario/3251-proyecto-libertad/departamentos-san-miguel-67a546a7cbb14_b.jpg"
    ],
    "youtube_url": "",
    "modelos": [
      {
        "nombre": "Duplex F  Pisos: 11, 13, 15, 17  Solicitar cita  (4 unidades) Desde S/. 337,000  (Ref. $ 98,711)  1 dorm- 1 baños 42 m2Pisos: 11, 13, 15, 17",
        "dormitorios": 1,
        "banos": 1,
        "area": 42,
        "precio": 337000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat E  Pisos: Entre 4 al 20  Solicitar cita  (15 unidades) Desde S/. 329,000  (Ref. $ 96,368)  2 dorm- 2 baños 48 m2Pisos: Entre 4 al 20",
        "dormitorios": 2,
        "banos": 2,
        "area": 48,
        "precio": 329000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat C  Pisos: Entre 8 al 20  Solicitar cita  (8 unidades) Desde S/. 330,000  (Ref. $ 96,661)  2 dorm- 2 baños 47 m2Pisos: Entre 8 al 20",
        "dormitorios": 2,
        "banos": 2,
        "area": 47,
        "precio": 330000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat B  Pisos: 7, 9, 11, 12, 13  Solicitar cita  (5 unidades) Desde S/. 388,000  (Ref. $ 113,650)  3 dorm- 2 baños 60 m2Pisos: 7, 9, 11, 12, 13",
        "dormitorios": 3,
        "banos": 2,
        "area": 60,
        "precio": 388000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A  Pisos: Entre 5 al 20  Solicitar cita  (9 unidades) Desde S/. 240,000  (Ref. $ 70,299)  1 dorm- 1 baños 30 m2Pisos: Entre 5 al 20",
        "dormitorios": 1,
        "banos": 1,
        "area": 30,
        "precio": 240000,
        "comision_pct": 2
      }
    ]
  },
  {
    "id": 6,
    "id_nexo": 3421,
    "nombre": "Quiñones Park",
    "inmobiliaria": "MULTIURBE",
    "direccion": "Intisuyo 499, San Miguel",
    "distrito": "San Miguel",
    "lat": -12.07511376386756,
    "lng": -77.09063821902431,
    "zona": "Lima Moderna",
    "precio_desde": 245000,
    "precio_hasta": 450000,
    "moneda": "S/",
    "area_desde": 29.98,
    "area_hasta": 60.8,
    "dormitorios": [
      1,
      2
    ],
    "pisos": 15,
    "etapa": "En Construcción",
    "cuota_inicial_min": 10,
    "entrega": "2026",
    "banco_sponsor": "INTERBANK",
    "ruc": "",
    "amenities": [
      "Lobby",
      "Sala de usos Múltiples",
      "Zona de Parrillas"
    ],
    "acabados_lista": [],
    "electrodomesticos": [],
    "descripcion": "Nuestro exclusivo edificio de 10 pisos, estratégicamente ubicado frente al hermoso parque Quiñones, redefine el concepto de vivir bien. Cuenta con excelentes acabados y amplias áreas sociales. Además,",
    "imagen": "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-688be0027187b_b.jpg",
    "imagen_color": "#1a4a2e",
    "per": 18.5,
    "reputacion": 4,
    "comision_pct": 2,
    "url_nexo": "https://admin.nexoagentes.pe/project/3421?projectTypes=1&projectTypes=2",
    "fotos": [
      "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-688be0027187b_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-66f8160cd5c0f_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-66f816a1afc79_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-66f816604cd31_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-66f8174b997a5_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-66f8173714651_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-66f816b8846ec_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3421-quinones-park/departamentos-san-miguel-66f81718ac8ba_b.jpg"
    ],
    "youtube_url": "https://www.youtube.com/embed/UQ8Sh6Zlr6g?picture-in-picture=1&accelerometer=1&gyroscope=1",
    "modelos": [
      {
        "nombre": "Flat Tipo 6  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 435,000  (Ref. $ 127,417)  2 dorm- 2 baños 58.02 m2Pisos: 2",
        "dormitorios": 2,
        "banos": 2,
        "area": 58.02,
        "precio": 435000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat Tipo 3  Piso: 8  Solicitar cita  (1 unidad) Desde S/. 245,000  (Ref. $ 71,763)  1 dorm- 1 baños 29.98 m2Pisos: 8",
        "dormitorios": 1,
        "banos": 1,
        "area": 29.98,
        "precio": 245000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat Tipo 2A  Piso: 6  Solicitar cita  (1 unidad) Desde S/. 450,000  (Ref. $ 131,810)  2 dorm- 2 baños 60.8 m2Pisos: 6",
        "dormitorios": 2,
        "banos": 2,
        "area": 60.8,
        "precio": 450000,
        "comision_pct": 2
      }
    ]
  },
  {
    "id": 7,
    "id_nexo": 4053,
    "nombre": "DANAUS - SURQUILLO",
    "inmobiliaria": "GRUPO MG",
    "direccion": "Av. Tomás Marsano 2379",
    "distrito": "Surquillo",
    "lat": -12.102958671075562,
    "lng": -77.01942388721014,
    "zona": "Lima Moderna",
    "precio_desde": 252000,
    "precio_hasta": 455000,
    "moneda": "S/",
    "area_desde": 80.35,
    "area_hasta": 80.35,
    "dormitorios": [
      1,
      2,
      3
    ],
    "pisos": 15,
    "etapa": "En Planos",
    "cuota_inicial_min": 50,
    "entrega": "2027",
    "banco_sponsor": "INTERBANK",
    "ruc": "",
    "amenities": [
      "Gimnasio",
      "Lobby",
      "Piscina",
      "Sala Bar",
      "Sala de usos Múltiples",
      "Zona de Parrillas"
    ],
    "acabados_lista": [],
    "electrodomesticos": [],
    "descripcion": "* Los precios publicados ya incluyen los descuentos de campaña Danaus está ubicado en Av. Tomás Marsano Nº2379 Urb. Los Sauces 2ª Etapa, distrito de Surquillo, Lima, vive frente a Miraflores y muy cer",
    "imagen": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-6927670ebc355_b.jpg",
    "imagen_color": "#1a3a5c",
    "per": 18.5,
    "reputacion": 4,
    "comision_pct": 2,
    "url_nexo": "https://admin.nexoagentes.pe/project/4053?projectTypes=1&projectTypes=2",
    "fotos": [
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-6927670ebc355_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-6931e8eee783b_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-6927676c88f8e_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-691fa99aae44f_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-6927670ebc355_s.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-6931e8eee783b_s.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-6927676c88f8e_s.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/4053-danaus/departamentos-surquillo-691fa99aae44f_s.jpg"
    ],
    "youtube_url": "",
    "modelos": [
      {
        "nombre": "Duplex 5a  Piso: 36  Solicitar cita  (1 unidad) Desde S/. 421,000  (Ref. $ 123,316)  2 dorm- 2 baños 69.05 m2Pisos: 36",
        "dormitorios": 2,
        "banos": 2,
        "area": 69.05,
        "precio": 421000,
        "comision_pct": 2
      },
      {
        "nombre": "Duplex 4a  Piso: 36  Solicitar cita  (1 unidad) Desde S/. 323,000  (Ref. $ 94,610)  1 dorm- 1 baños 52.45 m2Pisos: 36",
        "dormitorios": 1,
        "banos": 1,
        "area": 52.45,
        "precio": 323000,
        "comision_pct": 2
      },
      {
        "nombre": "Duplex 3b  Piso: 36  Solicitar cita  (1 unidad) Desde S/. 440,000  (Ref. $ 128,881)  2 dorm- 2 baños 72.1 m2Pisos: 36",
        "dormitorios": 2,
        "banos": 2,
        "area": 72.1,
        "precio": 440000,
        "comision_pct": 2
      },
      {
        "nombre": "Duplex 2a  Piso: 36  Solicitar cita  (1 unidad) Desde S/. 327,000  (Ref. $ 95,782)  1 dorm- 1 baños 53.85 m2Pisos: 36",
        "dormitorios": 1,
        "banos": 1,
        "area": 53.85,
        "precio": 327000,
        "comision_pct": 2
      },
      {
        "nombre": "Duplex 1c  Piso: 36  Solicitar cita  (1 unidad) Desde S/. 303,000  (Ref. $ 88,752)  1 dorm- 1 baños 49.8 m2Pisos: 36",
        "dormitorios": 1,
        "banos": 1,
        "area": 49.8,
        "precio": 303000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 9d  Piso: 36  Solicitar cita  (1 unidad) Desde S/. 273,000  (Ref. $ 79,965)  1 dorm- 1 baños 43.9 m2Pisos: 36",
        "dormitorios": 1,
        "banos": 1,
        "area": 43.9,
        "precio": 273000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 9c  Pisos: Entre 14 al 35  Solicitar cita  (22 unidades) Desde S/. 294,000  (Ref. $ 86,116)  2 dorm- 2 baños 48.3 m2Pisos: Entre 14 al 35",
        "dormitorios": 2,
        "banos": 2,
        "area": 48.3,
        "precio": 294000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 9a  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 316,000  (Ref. $ 92,560)  1 dorm- 1 baños 40.35 m2Pisos: 2",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.35,
        "precio": 316000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 9  Pisos: Entre 2 al 12  Solicitar cita  (10 unidades) Desde S/. 367,000  (Ref. $ 107,499)  2 dorm- 2 baños 52 m2Pisos: Entre 2 al 12",
        "dormitorios": 2,
        "banos": 2,
        "area": 52,
        "precio": 367000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 8b  Piso: 36  Solicitar cita  (1 unidad) Desde S/. 325,000  (Ref. $ 95,196)  2 dorm- 2 baños 52.85 m2Pisos: 36",
        "dormitorios": 2,
        "banos": 2,
        "area": 52.85,
        "precio": 325000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 8a  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 407,000  (Ref. $ 119,215)  2 dorm- 2 baños 52.5 m2Pisos: 2",
        "dormitorios": 2,
        "banos": 2,
        "area": 52.5,
        "precio": 407000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 8  Pisos: Entre 3 al 35  Solicitar cita  (33 unidades) Desde S/. 271,000  (Ref. $ 79,379)  1 dorm- 1 baños 43.7 m2Pisos: Entre 3 al 35",
        "dormitorios": 1,
        "banos": 1,
        "area": 43.7,
        "precio": 271000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 7b  Piso: 36  Solicitar cita  (1 unidad) Desde S/. 252,000  (Ref. $ 73,814)  1 dorm- 1 baños 40.5 m2Pisos: 36",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.5,
        "precio": 252000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 7a  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 455,000  (Ref. $ 133,275)  3 dorm- 3 baños 57.36 m2Pisos: 2",
        "dormitorios": 3,
        "banos": 3,
        "area": 57.36,
        "precio": 455000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 7  Pisos: Entre 3 al 35  Solicitar cita  (33 unidades) Desde S/. 273,000  (Ref. $ 79,965)  1 dorm- 1 baños 43.9 m2Pisos: Entre 3 al 35",
        "dormitorios": 1,
        "banos": 1,
        "area": 43.9,
        "precio": 273000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 6a  Piso: 36  Solicitar cita  (1 unidad) Desde S/. 256,000  (Ref. $ 74,985)  1 dorm- 1 baños 41.05 m2Pisos: 36",
        "dormitorios": 1,
        "banos": 1,
        "area": 41.05,
        "precio": 256000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 6  Pisos: Entre 2 al 33  Solicitar cita  (28 unidades) Desde S/. 331,000  (Ref. $ 96,954)  2 dorm- 2 baños 52.85 m2Pisos: Entre 2 al 33",
        "dormitorios": 2,
        "banos": 2,
        "area": 52.85,
        "precio": 331000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 5  Pisos: Entre 2 al 34  Solicitar cita  (32 unidades) Desde S/. 252,000  (Ref. $ 73,814)  1 dorm- 1 baños 40.5 m2Pisos: Entre 2 al 34",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.5,
        "precio": 252000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 4  Pisos: Entre 2 al 34  Solicitar cita  (31 unidades) Desde S/. 256,000  (Ref. $ 74,985)  1 dorm- 1 baños 41.05 m2Pisos: Entre 2 al 34",
        "dormitorios": 1,
        "banos": 1,
        "area": 41.05,
        "precio": 256000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 3a  Piso: 35  Solicitar cita  (1 unidad) Desde S/. 326,000  (Ref. $ 95,489)  2 dorm- 2 baños 53 m2Pisos: 35",
        "dormitorios": 2,
        "banos": 2,
        "area": 53,
        "precio": 326000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 3  Pisos: Entre 2 al 33  Solicitar cita  (32 unidades) Desde S/. 331,000  (Ref. $ 96,954)  2 dorm- 2 baños 53 m2Pisos: Entre 2 al 33",
        "dormitorios": 2,
        "banos": 2,
        "area": 53,
        "precio": 331000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 2  Pisos: Entre 2 al 34  Solicitar cita  (33 unidades) Desde S/. 270,000  (Ref. $ 79,086)  1 dorm- 1 baños 43.55 m2Pisos: Entre 2 al 34",
        "dormitorios": 1,
        "banos": 1,
        "area": 43.55,
        "precio": 270000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 1b  Pisos: Entre 14 al 35  Solicitar cita  (22 unidades) Desde S/. 292,000  (Ref. $ 85,530)  2 dorm- 2 baños 48 m2Pisos: Entre 14 al 35",
        "dormitorios": 2,
        "banos": 2,
        "area": 48,
        "precio": 292000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 1a  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 391,000  (Ref. $ 114,528)  2 dorm- 2 baños 50.35 m2Pisos: 2",
        "dormitorios": 2,
        "banos": 2,
        "area": 50.35,
        "precio": 391000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 11  Pisos: Entre 3 al 36  Solicitar cita  (10 unidades) Desde S/. 285,000  (Ref. $ 83,480)  1 dorm- 1 baños 40 m2Pisos: Entre 3 al 36",
        "dormitorios": 1,
        "banos": 1,
        "area": 40,
        "precio": 285000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 10g  Piso: 36  Solicitar cita  (1 unidad) Desde S/. 271,000  (Ref. $ 79,379)  1 dorm- 1 baños 43.7 m2Pisos: 36",
        "dormitorios": 1,
        "banos": 1,
        "area": 43.7,
        "precio": 271000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 10f  Pisos: 18, 19, 20  Solicitar cita  (3 unidades) Desde S/. 272,000  (Ref. $ 79,672)  1 dorm- 1 baños 40.45 m2Pisos: 18, 19, 20",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.45,
        "precio": 272000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 10e  Piso: 17  Solicitar cita  (1 unidad) Desde S/. 371,000  (Ref. $ 108,670)  1 dorm- 1 baños 54.1 m2Pisos: 17",
        "dormitorios": 1,
        "banos": 1,
        "area": 54.1,
        "precio": 371000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 10d  Pisos: 15 y 16  Solicitar cita  (2 unidades) Desde S/. 371,000  (Ref. $ 108,670)  2 dorm- 2 baños 54.1 m2Pisos: 15 y 16",
        "dormitorios": 2,
        "banos": 2,
        "area": 54.1,
        "precio": 371000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 10c  Piso: 14  Solicitar cita  (1 unidad) Desde S/. 441,000  (Ref. $ 129,174)  2 dorm- 2 baños 63.85 m2Pisos: 14",
        "dormitorios": 2,
        "banos": 2,
        "area": 63.85,
        "precio": 441000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 10b  Pisos: 12 y 13  Solicitar cita  (2 unidades) Desde S/. 448,000  (Ref. $ 131,224)  3 dorm- 3 baños 63.85 m2Pisos: 12 y 13",
        "dormitorios": 3,
        "banos": 3,
        "area": 63.85,
        "precio": 448000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 10a  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 366,000  (Ref. $ 107,206)  1 dorm- 1 baños 47 m2Pisos: 2",
        "dormitorios": 1,
        "banos": 1,
        "area": 47,
        "precio": 366000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 10  Pisos: Entre 3 al 11  Solicitar cita  (9 unidades) Desde S/. 288,000  (Ref. $ 84,359)  1 dorm- 1 baños 40.35 m2Pisos: Entre 3 al 11",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.35,
        "precio": 288000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 1  Pisos: Entre 3 al 13  Solicitar cita  (11 unidades) Desde S/. 365,000  (Ref. $ 106,913)  2 dorm- 2 baños 51.7 m2Pisos: Entre 3 al 13",
        "dormitorios": 2,
        "banos": 2,
        "area": 51.7,
        "precio": 365000,
        "comision_pct": 2
      }
    ]
  },
  {
    "id": 8,
    "id_nexo": 3342,
    "nombre": "ALBORADA III - SAN MIGUEL",
    "inmobiliaria": "GRUPO MG",
    "direccion": "Av. La paz 839",
    "distrito": "San Miguel",
    "lat": -12.07943899422627,
    "lng": -77.09055696838038,
    "zona": "Lima Moderna",
    "precio_desde": 252000,
    "precio_hasta": 508460,
    "moneda": "S/",
    "area_desde": 48.35,
    "area_hasta": 108.2,
    "dormitorios": [
      1,
      2,
      3
    ],
    "pisos": 15,
    "etapa": "En Construcción",
    "cuota_inicial_min": 50,
    "entrega": "2026",
    "banco_sponsor": "BCP, PICHINCHA",
    "ruc": "",
    "amenities": [
      "Gimnasio",
      "Lobby",
      "Sala de Niños",
      "Terraza",
      "Zona de Parrillas"
    ],
    "acabados_lista": [],
    "electrodomesticos": [],
    "descripcion": "Proyecto en construcción con moderna arquitectura en diseño y distribución lo cual permite tener los departamentos con ambientes más confortables de la zona donde Tu Familia podrá disfrutar de su vivi",
    "imagen": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/departamentos-san-miguel-68f7f72880222_b.jpg",
    "imagen_color": "#1a4a2e",
    "per": 18.5,
    "reputacion": 4,
    "comision_pct": 2,
    "url_nexo": "https://admin.nexoagentes.pe/project/3342?projectTypes=1&projectTypes=2",
    "fotos": [
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/departamentos-san-miguel-68f7f72880222_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/departamentos-san-miguel-695fefae5edd8_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/departamentos-san-miguel-68f7f749b9987_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/departamentos-san-miguel-687e5a59e9627_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/departamentos-san-miguel-687e5a3c56fa8_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii/departamentos-san-miguel-664cb61ca3939_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/departamentos-san-miguel-687e5a1db59d0_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3342-alborada-iii-san-miguel/departamentos-san-miguel-687e59e4a92f8_b.jpg"
    ],
    "youtube_url": "",
    "modelos": [
      {
        "nombre": "Duplex B6  Piso: 18  Solicitar cita  (1 unidad) Desde S/. 317,660  (Ref. $ 93,046)  1 dorm- 2 baños 66.7 m2Pisos: 18",
        "dormitorios": 1,
        "banos": 2,
        "area": 66.7,
        "precio": 317660,
        "comision_pct": 2
      },
      {
        "nombre": "Duplex A9  Piso: 18  Solicitar cita  (1 unidad) Desde S/. 321,540  (Ref. $ 94,183)  2 dorm- 2 baños 66.3 m2Pisos: 18",
        "dormitorios": 2,
        "banos": 2,
        "area": 66.3,
        "precio": 321540,
        "comision_pct": 2
      },
      {
        "nombre": "Duplex A8a  Piso: 18  Solicitar cita  (1 unidad) Desde S/. 324,800  (Ref. $ 95,138)  1 dorm- 2 baños 67.5 m2Pisos: 18",
        "dormitorios": 1,
        "banos": 2,
        "area": 67.5,
        "precio": 324800,
        "comision_pct": 2
      },
      {
        "nombre": "Duplex A7b  Piso: 18  Solicitar cita  (1 unidad) Desde S/. 339,540  (Ref. $ 99,455)  1 dorm- 2 baños 71.3 m2Pisos: 18",
        "dormitorios": 1,
        "banos": 2,
        "area": 71.3,
        "precio": 339540,
        "comision_pct": 2
      },
      {
        "nombre": "Duplex A6f  Piso: 18  Solicitar cita  (1 unidad) Desde S/. 351,360  (Ref. $ 102,917)  2 dorm- 2 baños 73.7 m2Pisos: 18",
        "dormitorios": 2,
        "banos": 2,
        "area": 73.7,
        "precio": 351360,
        "comision_pct": 2
      },
      {
        "nombre": "Duplex A4e  Piso: 18  Solicitar cita  (1 unidad) Desde S/. 340,720  (Ref. $ 99,801)  2 dorm- 2 baños 71.4 m2Pisos: 18",
        "dormitorios": 2,
        "banos": 2,
        "area": 71.4,
        "precio": 340720,
        "comision_pct": 2
      },
      {
        "nombre": "Duplex A1b  Piso: 18  Solicitar cita  (1 unidad) Desde S/. 371,000  (Ref. $ 108,670)  1 dorm- 2 baños 79.2 m2Pisos: 18",
        "dormitorios": 1,
        "banos": 2,
        "area": 79.2,
        "precio": 371000,
        "comision_pct": 2
      },
      {
        "nombre": "Duplex A11  Piso: 18  Solicitar cita  (1 unidad) Desde S/. 508,460  (Ref. $ 148,934)  2 dorm- 2 baños 108.2 m2Pisos: 18",
        "dormitorios": 2,
        "banos": 2,
        "area": 108.2,
        "precio": 508460,
        "comision_pct": 2
      },
      {
        "nombre": "Duplex A10  Piso: 18  Solicitar cita  (1 unidad) Desde S/. 321,300  (Ref. $ 94,112)  2 dorm- 2 baños 67.5 m2Pisos: 18",
        "dormitorios": 2,
        "banos": 2,
        "area": 67.5,
        "precio": 321300,
        "comision_pct": 2
      },
      {
        "nombre": "Flat B4  Piso: 4  Solicitar cita  (1 unidad) Desde S/. 334,500  (Ref. $ 97,979)  3 dorm- 2 baños 64.3 m2Pisos: 4",
        "dormitorios": 3,
        "banos": 2,
        "area": 64.3,
        "precio": 334500,
        "comision_pct": 2
      },
      {
        "nombre": "Flat B3  Piso: 4  Solicitar cita  (1 unidad) Desde S/. 288,000  (Ref. $ 84,359)  2 dorm- 2 baños 55 m2Pisos: 4",
        "dormitorios": 2,
        "banos": 2,
        "area": 55,
        "precio": 288000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat B2a  Piso: 1  Solicitar cita  (1 unidad) Desde S/. 343,480  (Ref. $ 100,609)  3 dorm- 2 baños 64.8 m2Pisos: 1",
        "dormitorios": 3,
        "banos": 2,
        "area": 64.8,
        "precio": 343480,
        "comision_pct": 2
      },
      {
        "nombre": "Flat B2  Piso: 8  Solicitar cita  (1 unidad) Desde S/. 314,300  (Ref. $ 92,062)  3 dorm- 2 baños 65.5 m2Pisos: 8",
        "dormitorios": 3,
        "banos": 2,
        "area": 65.5,
        "precio": 314300,
        "comision_pct": 2
      },
      {
        "nombre": "Flat B1  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 347,050  (Ref. $ 101,655)  3 dorm- 2 baños 65 m2Pisos: 2",
        "dormitorios": 3,
        "banos": 2,
        "area": 65,
        "precio": 347050,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A8  Pisos: Entre 2 al 9  Solicitar cita  (7 unidades) Desde S/. 341,640  (Ref. $ 100,070)  3 dorm- 2 baños 63.2 m2Pisos: Entre 2 al 9",
        "dormitorios": 3,
        "banos": 2,
        "area": 63.2,
        "precio": 341640,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A7a  Piso: 1  Solicitar cita  (1 unidad) Desde S/. 292,760  (Ref. $ 85,753)  2 dorm- 2 baños 53.8 m2Pisos: 1",
        "dormitorios": 2,
        "banos": 2,
        "area": 53.8,
        "precio": 292760,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A7  Pisos: Entre 3 al 9  Solicitar cita  (6 unidades) Desde S/. 351,000  (Ref. $ 102,812)  3 dorm- 2 baños 65 m2Pisos: Entre 3 al 9",
        "dormitorios": 3,
        "banos": 2,
        "area": 65,
        "precio": 351000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A6b  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 382,200  (Ref. $ 111,951)  3 dorm- 2 baños 71 m2Pisos: 2",
        "dormitorios": 3,
        "banos": 2,
        "area": 71,
        "precio": 382200,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A6a  Piso: 1  Solicitar cita  (1 unidad) Desde S/. 343,200  (Ref. $ 100,527)  3 dorm- 2 baños 63.5 m2Pisos: 1",
        "dormitorios": 3,
        "banos": 2,
        "area": 63.5,
        "precio": 343200,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A6  Pisos: Entre 5 al 12  Solicitar cita  (6 unidades) Desde S/. 336,400  (Ref. $ 98,535)  3 dorm- 2 baños 66 m2Pisos: Entre 5 al 12",
        "dormitorios": 3,
        "banos": 2,
        "area": 66,
        "precio": 336400,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A5  Pisos: 2, 4, 5, 6, 8  Solicitar cita  (5 unidades) Desde S/. 309,400  (Ref. $ 90,627)  2 dorm- 2 baños 57 m2Pisos: 2, 4, 5, 6, 8",
        "dormitorios": 2,
        "banos": 2,
        "area": 57,
        "precio": 309400,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A4d  Piso: 17  Solicitar cita  (1 unidad) Desde S/. 252,000  (Ref. $ 73,814)  1 dorm- 2 baños 48.35 m2Pisos: 17",
        "dormitorios": 1,
        "banos": 2,
        "area": 48.35,
        "precio": 252000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A4b  Piso: 7  Solicitar cita  (1 unidad) Desde S/. 311,480  (Ref. $ 91,236)  2 dorm- 2 baños 57.4 m2Pisos: 7",
        "dormitorios": 2,
        "banos": 2,
        "area": 57.4,
        "precio": 311480,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A4a  Piso: 1  Solicitar cita  (1 unidad) Desde S/. 351,100  (Ref. $ 102,841)  2 dorm- 2 baños 67 m2Pisos: 1",
        "dormitorios": 2,
        "banos": 2,
        "area": 67,
        "precio": 351100,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A4  Pisos: 2, 3, 4, 5, 6  Solicitar cita  (5 unidades) Desde S/. 317,220  (Ref. $ 92,917)  2 dorm- 2 baños 57.4 m2Pisos: 2, 3, 4, 5, 6",
        "dormitorios": 2,
        "banos": 2,
        "area": 57.4,
        "precio": 317220,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A3a  Piso: 1  Solicitar cita  (1 unidad) Desde S/. 353,220  (Ref. $ 103,462)  2 dorm- 2 baños 67.4 m2Pisos: 1",
        "dormitorios": 2,
        "banos": 2,
        "area": 67.4,
        "precio": 353220,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A3  Pisos: Entre 2 al 11  Solicitar cita  (10 unidades) Desde S/. 332,480  (Ref. $ 97,387)  3 dorm- 2 baños 65.2 m2Pisos: Entre 2 al 11",
        "dormitorios": 3,
        "banos": 2,
        "area": 65.2,
        "precio": 332480,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A2b  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 337,540  (Ref. $ 98,869)  2 dorm- 2 baños 60.1 m2Pisos: 2",
        "dormitorios": 2,
        "banos": 2,
        "area": 60.1,
        "precio": 337540,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A2  Pisos: Entre 3 al 16  Solicitar cita  (12 unidades) Desde S/. 359,800  (Ref. $ 105,390)  3 dorm- 2 baños 64.3 m2Pisos: Entre 3 al 16",
        "dormitorios": 3,
        "banos": 2,
        "area": 64.3,
        "precio": 359800,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A12  Piso: 18  Solicitar cita  (1 unidad) Desde S/. 316,360  (Ref. $ 92,666)  3 dorm- 2 baños 62.9 m2Pisos: 18",
        "dormitorios": 3,
        "banos": 2,
        "area": 62.9,
        "precio": 316360,
        "comision_pct": 2
      },
      {
        "nombre": "Flat A1  Pisos: Entre 2 al 17  Solicitar cita  (14 unidades) Desde S/. 367,570  (Ref. $ 107,666)  2 dorm- 2 baños 66.9 m2Pisos: Entre 2 al 17",
        "dormitorios": 2,
        "banos": 2,
        "area": 66.9,
        "precio": 367570,
        "comision_pct": 2
      }
    ]
  },
  {
    "id": 9,
    "id_nexo": 3886,
    "nombre": "Villa Elenia",
    "inmobiliaria": "GRUPO CARAL",
    "direccion": "Av. Angamos Este 1425",
    "distrito": "Surquillo",
    "lat": -12.107571057927968,
    "lng": -77.02691071393785,
    "zona": "Lima Moderna",
    "precio_desde": 253000,
    "precio_hasta": 494673,
    "moneda": "S/",
    "area_desde": 40.32,
    "area_hasta": 74.83,
    "dormitorios": [
      1,
      2,
      3
    ],
    "pisos": 15,
    "etapa": "En Planos",
    "cuota_inicial_min": 100,
    "entrega": "2028",
    "banco_sponsor": "BCP",
    "ruc": "",
    "amenities": [
      "Área de juegos para niños",
      "Gimnasio",
      "Sala Bar",
      "Sala de Niños",
      "Sala de usos Múltiples",
      "Terraza",
      "Zona de Parrillas"
    ],
    "acabados_lista": [],
    "electrodomesticos": [],
    "descripcion": "Villa Elenia es un proyecto ubicado en Surquillo, un distrito que ha evolucionado y hoy te acerca a todo lo que necesitas. Cuenta con departamentos de 1, 2 y 3 dormitorios desde 38 m2 hasta 100 m2 y",
    "imagen": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e464ec6062_b.jpg",
    "imagen_color": "#1a3a5c",
    "per": 18.5,
    "reputacion": 4,
    "comision_pct": 2,
    "url_nexo": "https://admin.nexoagentes.pe/project/3886?projectTypes=1&projectTypes=2",
    "fotos": [
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e464ec6062_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e46c4bfc88_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e47f1a56e9_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e47e53bad6_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e48458328e_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e4839cf80b_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e482d53dd8_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-caral/3886-villa-elenia/departamentos-surquillo-691e481f02289_b.jpg"
    ],
    "youtube_url": "",
    "modelos": [
      {
        "nombre": "Flat X6  Pisos: Entre 2 al 14  Solicitar cita  (7 unidades) Desde S/. 494,673  (Ref. $ 144,895)  3 dorm- 2 baños 74.83 m2Pisos: Entre 2 al 14",
        "dormitorios": 3,
        "banos": 2,
        "area": 74.83,
        "precio": 494673,
        "comision_pct": 2
      },
      {
        "nombre": "Flat X4  Pisos: 18, 19, 20, 21  Solicitar cita  (4 unidades) Desde S/. 366,390  (Ref. $ 107,320)  2 dorm- 2 baños 56.05 m2Pisos: 18, 19, 20, 21",
        "dormitorios": 2,
        "banos": 2,
        "area": 56.05,
        "precio": 366390,
        "comision_pct": 2
      },
      {
        "nombre": "Flat X3  Piso: 21  Solicitar cita  (1 unidad) Desde S/. 253,000  (Ref. $ 74,107)  1 dorm- 1 baños 40.32 m2Pisos: 21",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.32,
        "precio": 253000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat X10  Pisos: Entre 2 al 20  Solicitar cita  (18 unidades) Desde S/. 338,588  (Ref. $ 99,176)  2 dorm- 2 baños 56.73 m2Pisos: Entre 2 al 20",
        "dormitorios": 2,
        "banos": 2,
        "area": 56.73,
        "precio": 338588,
        "comision_pct": 2
      },
      {
        "nombre": "Flat X09  Pisos: Entre 4 al 20  Solicitar cita  (14 unidades) Desde S/. 315,421  (Ref. $ 92,390)  2 dorm- 2 baños 54.61 m2Pisos: Entre 4 al 20",
        "dormitorios": 2,
        "banos": 2,
        "area": 54.61,
        "precio": 315421,
        "comision_pct": 2
      },
      {
        "nombre": "Flat X06  Pisos: Entre 3 al 15  Solicitar cita  (7 unidades) Desde S/. 475,566  (Ref. $ 139,299)  3 dorm- 2 baños 74.59 m2Pisos: Entre 3 al 15",
        "dormitorios": 3,
        "banos": 2,
        "area": 74.59,
        "precio": 475566,
        "comision_pct": 2
      },
      {
        "nombre": "Flat X05  Pisos: Entre 2 al 13  Solicitar cita  (11 unidades) Desde S/. 364,908  (Ref. $ 106,886)  2 dorm- 2 baños 57.34 m2Pisos: Entre 2 al 13",
        "dormitorios": 2,
        "banos": 2,
        "area": 57.34,
        "precio": 364908,
        "comision_pct": 2
      },
      {
        "nombre": "Flat X03  Pisos: Entre 2 al 14  Solicitar cita  (13 unidades) Desde S/. 422,781  (Ref. $ 123,837)  3 dorm- 2 baños 68.1 m2Pisos: Entre 2 al 14",
        "dormitorios": 3,
        "banos": 2,
        "area": 68.1,
        "precio": 422781,
        "comision_pct": 2
      },
      {
        "nombre": "Flat X02  Pisos: Entre 2 al 21  Solicitar cita  (19 unidades) Desde S/. 405,950  (Ref. $ 118,908)  3 dorm- 2 baños 69.37 m2Pisos: Entre 2 al 21",
        "dormitorios": 3,
        "banos": 2,
        "area": 69.37,
        "precio": 405950,
        "comision_pct": 2
      },
      {
        "nombre": "Flat X01  Pisos: Entre 2 al 21  Solicitar cita  (19 unidades) Desde S/. 396,529  (Ref. $ 116,148)  3 dorm- 2 baños 67.76 m2Pisos: Entre 2 al 21",
        "dormitorios": 3,
        "banos": 2,
        "area": 67.76,
        "precio": 396529,
        "comision_pct": 2
      }
    ]
  },
  {
    "id": 10,
    "id_nexo": 3746,
    "nombre": "CAPRI Santa Catalina",
    "inmobiliaria": "PROYEC INMOBILIARIA",
    "direccion": "Pasaje Capri 120",
    "distrito": "La Victoria",
    "lat": -12.069745340311353,
    "lng": -77.02361518872351,
    "zona": "Lima Moderna",
    "precio_desde": 263283,
    "precio_hasta": 398412,
    "moneda": "S/",
    "area_desde": 40.03,
    "area_hasta": 62.63,
    "dormitorios": [
      1,
      2,
      3
    ],
    "pisos": 15,
    "etapa": "En Planos",
    "cuota_inicial_min": 10,
    "entrega": "2027",
    "banco_sponsor": "SCOTIABANK",
    "ruc": "",
    "amenities": [
      "Gimnasio",
      "Lobby",
      "Sala Bar",
      "Sala de Niños",
      "Terraza",
      "Zona de Parrillas"
    ],
    "acabados_lista": [],
    "electrodomesticos": [],
    "descripcion": "Descubre Capri, un espacio inspirado en la esencia mediterránea, donde la tranquilidad y la modernidad se encuentran. Ubicado estratégicamente en un pasaje exclusivo, a pocos pasos de parques y rodead",
    "imagen": "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-69939bb735af2_b.jpg",
    "imagen_color": "#4a1a1a",
    "per": 18.5,
    "reputacion": 4,
    "comision_pct": 2,
    "url_nexo": "https://admin.nexoagentes.pe/project/3746?projectTypes=1&projectTypes=2",
    "fotos": [
      "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-69939bb735af2_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-69a4bb360ef2a_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-69a4b3c61c6f6_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-69a4b35ee5297_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-68d1c723132c5_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-69a4b3212a41d_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-69a4b9fd39dfd_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/proyec-inmobiliaria/3746-capri-santa-catalina/departamentos-la-victoria-69a4b9ca5b361_b.jpg"
    ],
    "youtube_url": "https://www.youtube.com/embed/Yx0QFlvkFYg?picture-in-picture=1&accelerometer=1&gyroscope=1",
    "modelos": [
      {
        "nombre": "Flat Tipo X08  Pisos: Entre 2 al 9  Solicitar cita  (8 unidades) Desde S/. 267,096  (Ref. $ 78,236)  1 dorm- 1 baños 40.03 m2Pisos: Entre 2 al 9",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.03,
        "precio": 267096,
        "comision_pct": 2
      },
      {
        "nombre": "Flat Tipo X07  Pisos: Entre 2 al 15  Solicitar cita  (14 unidades) Desde S/. 337,404  (Ref. $ 98,830)  2 dorm- 2 baños 50.16 m2Pisos: Entre 2 al 15",
        "dormitorios": 2,
        "banos": 2,
        "area": 50.16,
        "precio": 337404,
        "comision_pct": 2
      },
      {
        "nombre": "Flat Tipo X06  Pisos: Entre 3 al 15  Solicitar cita  (8 unidades) Desde S/. 328,848  (Ref. $ 96,323)  2 dorm- 2 baños 48.9 m2Pisos: Entre 3 al 15",
        "dormitorios": 2,
        "banos": 2,
        "area": 48.9,
        "precio": 328848,
        "comision_pct": 2
      },
      {
        "nombre": "Flat Tipo X05  Pisos: Entre 3 al 16  Solicitar cita  (11 unidades) Desde S/. 398,412  (Ref. $ 116,699)  3 dorm- 2 baños 62.31 m2Pisos: Entre 3 al 16",
        "dormitorios": 3,
        "banos": 2,
        "area": 62.31,
        "precio": 398412,
        "comision_pct": 2
      },
      {
        "nombre": "Flat Tipo X04A  Piso: 13  Solicitar cita  (1 unidad) Desde S/. 368,373  (Ref. $ 107,901)  3 dorm- 2 baños 57.06 m2Pisos: 13",
        "dormitorios": 3,
        "banos": 2,
        "area": 57.06,
        "precio": 368373,
        "comision_pct": 2
      },
      {
        "nombre": "Flat Tipo X04  Pisos: 6, 8, 9, 11  Solicitar cita  (4 unidades) Desde S/. 370,140  (Ref. $ 108,418)  3 dorm- 2 baños 57.06 m2Pisos: 6, 8, 9, 11",
        "dormitorios": 3,
        "banos": 2,
        "area": 57.06,
        "precio": 370140,
        "comision_pct": 2
      },
      {
        "nombre": "Flat Tipo X03A  Pisos: 13, 14, 15, 16  Solicitar cita  (4 unidades) Desde S/. 320,571  (Ref. $ 93,899)  2 dorm- 2 baños 49.59 m2Pisos: 13, 14, 15, 16",
        "dormitorios": 2,
        "banos": 2,
        "area": 49.59,
        "precio": 320571,
        "comision_pct": 2
      },
      {
        "nombre": "Flat Tipo X03  Pisos: Entre 2 al 11  Solicitar cita  (10 unidades) Desde S/. 316,014  (Ref. $ 92,564)  2 dorm- 2 baños 48.39 m2Pisos: Entre 2 al 11",
        "dormitorios": 2,
        "banos": 2,
        "area": 48.39,
        "precio": 316014,
        "comision_pct": 2
      },
      {
        "nombre": "Flat Tipo X02  Pisos: Entre 2 al 12  Solicitar cita  (11 unidades) Desde S/. 321,222  (Ref. $ 94,090)  2 dorm- 2 baños 49.19 m2Pisos: Entre 2 al 12",
        "dormitorios": 2,
        "banos": 2,
        "area": 49.19,
        "precio": 321222,
        "comision_pct": 2
      },
      {
        "nombre": "Flat Tipo X01  Pisos: Entre 3 al 14  Solicitar cita  (11 unidades) Desde S/. 263,283  (Ref. $ 77,119)  1 dorm- 1 baños 40.05 m2Pisos: Entre 3 al 14",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.05,
        "precio": 263283,
        "comision_pct": 2
      },
      {
        "nombre": "Flat Tipo 1601  Piso: 16  Solicitar cita  (1 unidad) Desde S/. 381,207  (Ref. $ 111,660)  2 dorm- 2 baños 62.63 m2Pisos: 16",
        "dormitorios": 2,
        "banos": 2,
        "area": 62.63,
        "precio": 381207,
        "comision_pct": 2
      },
      {
        "nombre": "Flat Tipo 1208  Piso: 12  Solicitar cita  (1 unidad) Desde S/. 288,300  (Ref. $ 84,446)  1 dorm- 1 baños 44.04 m2Pisos: 12",
        "dormitorios": 1,
        "banos": 1,
        "area": 44.04,
        "precio": 288300,
        "comision_pct": 2
      },
      {
        "nombre": "Flat Tipo 1008  Piso: 10  Solicitar cita  (1 unidad) Desde S/. 288,300  (Ref. $ 84,446)  1 dorm- 1 baños 44.04 m2Pisos: 10",
        "dormitorios": 1,
        "banos": 1,
        "area": 44.04,
        "precio": 288300,
        "comision_pct": 2
      }
    ]
  },
  {
    "id": 11,
    "id_nexo": 3899,
    "nombre": "ALLURE - JESÚS MARÍA",
    "inmobiliaria": "GRUPO MG",
    "direccion": "Av. Húsares de Junín Nº 661",
    "distrito": "Jesús María",
    "lat": -12.07611986959548,
    "lng": -77.04923207264208,
    "zona": "Lima Moderna",
    "precio_desde": 265000,
    "precio_hasta": 495797,
    "moneda": "S/",
    "area_desde": 40,
    "area_hasta": 80,
    "dormitorios": [
      1,
      2
    ],
    "pisos": 15,
    "etapa": "En Planos",
    "cuota_inicial_min": 50,
    "entrega": "2027",
    "banco_sponsor": "BCP",
    "ruc": "",
    "amenities": [
      "Gimnasio",
      "Jardin interior",
      "Lobby",
      "Piscina",
      "Sala Bar",
      "Sala de usos Múltiples",
      "Zona de Parrillas"
    ],
    "acabados_lista": [],
    "electrodomesticos": [],
    "descripcion": "Allure, está ubicado en una zona residencial de Jesús María, Av. Húsares de Junín Nº 661, muy cerca a parques, universidades, centros médicos, Bancos, supermercados y vías principales que conectan con",
    "imagen": "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/departamentos-jesus-maria-68ff86dd57347_b.jpg",
    "imagen_color": "#3a1a4a",
    "per": 18.5,
    "reputacion": 4,
    "comision_pct": 2,
    "url_nexo": "https://admin.nexoagentes.pe/project/3899?projectTypes=1&projectTypes=2",
    "fotos": [
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/departamentos-jesus-maria-68ff86dd57347_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/departamentos-jesus-maria-695ff0c5bc606_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/departamentos-jesus-maria-68ff86f2b5cac_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/departamentos-jesus-maria-68ffe7cfdc9fb_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/departamentos-jesus-maria-68ffe811c9862_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure/departamentos-jesus-maria-6894d885884d3_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/departamentos-jesus-maria-68ffe7e47dc88_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/grupo-mg/3899-allure-jesus-maria/departamentos-jesus-maria-68ffe7fbcf817_b.jpg"
    ],
    "youtube_url": "https://www.youtube.com/embed/qVYdTzPguHE?picture-in-picture=1&accelerometer=1&gyroscope=1",
    "modelos": [
      {
        "nombre": "Duplex 7b  Piso: 17  Solicitar cita  (1 unidad) Desde S/. 370,368  (Ref. $ 108,485)  2 dorm- 2 baños 57.64 m2Pisos: 17",
        "dormitorios": 2,
        "banos": 2,
        "area": 57.64,
        "precio": 370368,
        "comision_pct": 2
      },
      {
        "nombre": "Duplex 5c  Piso: 17  Solicitar cita  (1 unidad) Desde S/. 495,797  (Ref. $ 145,225)  2 dorm- 2 baños 80 m2Pisos: 17",
        "dormitorios": 2,
        "banos": 2,
        "area": 80,
        "precio": 495797,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 9  Pisos: Entre 3 al 11  Solicitar cita  (9 unidades) Desde S/. 316,108  (Ref. $ 92,592)  1 dorm- 1 baños 45.24 m2Pisos: Entre 3 al 11",
        "dormitorios": 1,
        "banos": 1,
        "area": 45.24,
        "precio": 316108,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 8a  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 329,680  (Ref. $ 96,567)  1 dorm- 1 baños 45.24 m2Pisos: 2",
        "dormitorios": 1,
        "banos": 1,
        "area": 45.24,
        "precio": 329680,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 8  Pisos: Entre 4 al 16  Solicitar cita  (12 unidades) Desde S/. 370,368  (Ref. $ 108,485)  2 dorm- 2 baños 57.64 m2Pisos: Entre 4 al 16",
        "dormitorios": 2,
        "banos": 2,
        "area": 57.64,
        "precio": 370368,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 7a  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 416,480  (Ref. $ 121,992)  2 dorm- 2 baños 57.64 m2Pisos: 2",
        "dormitorios": 2,
        "banos": 2,
        "area": 57.64,
        "precio": 416480,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 7  Pisos: Entre 3 al 16  Solicitar cita  (13 unidades) Desde S/. 266,580  (Ref. $ 78,084)  1 dorm- 1 baños 40.9 m2Pisos: Entre 3 al 16",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.9,
        "precio": 266580,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 6b  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 299,300  (Ref. $ 87,668)  1 dorm- 1 baños 40.9 m2Pisos: 2",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.9,
        "precio": 299300,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 6  Pisos: Entre 3 al 12  Solicitar cita  (7 unidades) Desde S/. 265,000  (Ref. $ 77,622)  1 dorm- 1 baños 40 m2Pisos: Entre 3 al 12",
        "dormitorios": 1,
        "banos": 1,
        "area": 40,
        "precio": 265000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 5b  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 293,000  (Ref. $ 85,823)  1 dorm- 1 baños 40 m2Pisos: 2",
        "dormitorios": 1,
        "banos": 1,
        "area": 40,
        "precio": 293000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 5  Pisos: Entre 3 al 11  Solicitar cita  (8 unidades) Desde S/. 265,756  (Ref. $ 77,843)  1 dorm- 1 baños 40.12 m2Pisos: Entre 3 al 11",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.12,
        "precio": 265756,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 4b  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 293,840  (Ref. $ 86,069)  1 dorm- 1 baños 40.12 m2Pisos: 2",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.12,
        "precio": 293840,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 4  Pisos: Entre 3 al 17  Solicitar cita  (13 unidades) Desde S/. 365,966  (Ref. $ 107,196)  2 dorm- 2 baños 56.93 m2Pisos: Entre 3 al 17",
        "dormitorios": 2,
        "banos": 2,
        "area": 56.93,
        "precio": 365966,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 3  Pisos: Entre 3 al 17  Solicitar cita  (13 unidades) Desde S/. 267,200  (Ref. $ 78,266)  1 dorm- 1 baños 41 m2Pisos: Entre 3 al 17",
        "dormitorios": 1,
        "banos": 1,
        "area": 41,
        "precio": 267200,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 2b  Piso: 2  Solicitar cita  (1 unidad) Desde S/. 300,000  (Ref. $ 87,873)  1 dorm- 1 baños 41 m2Pisos: 2",
        "dormitorios": 1,
        "banos": 1,
        "area": 41,
        "precio": 300000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 2  Pisos: Entre 3 al 15  Solicitar cita  (9 unidades) Desde S/. 385,654  (Ref. $ 112,963)  2 dorm- 2 baños 55.62 m2Pisos: Entre 3 al 15",
        "dormitorios": 2,
        "banos": 2,
        "area": 55.62,
        "precio": 385654,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 1  Pisos: Entre 3 al 17  Solicitar cita  (11 unidades) Desde S/. 378,310  (Ref. $ 110,811)  2 dorm- 2 baños 55.35 m2Pisos: Entre 3 al 17",
        "dormitorios": 2,
        "banos": 2,
        "area": 55.35,
        "precio": 378310,
        "comision_pct": 2
      }
    ]
  },
  {
    "id": 12,
    "id_nexo": 3871,
    "nombre": "Residencial Leyendas II",
    "inmobiliaria": "MULTIURBE",
    "direccion": "Calle Cayrucachi 186 . San Miguel",
    "distrito": "San Miguel",
    "lat": -12.074359792474498,
    "lng": -77.09143720080594,
    "zona": "Lima Moderna",
    "precio_desde": 269000,
    "precio_hasta": 649000,
    "moneda": "S/",
    "area_desde": 41.1,
    "area_hasta": 93.3,
    "dormitorios": [
      1,
      3,
      4
    ],
    "pisos": 15,
    "etapa": "En Planos",
    "cuota_inicial_min": 10,
    "entrega": "2026",
    "banco_sponsor": "BCP, INTERBANK",
    "ruc": "",
    "amenities": [
      "Lobby",
      "Sala de usos Múltiples",
      "Terraza",
      "Zona de Parrillas"
    ],
    "acabados_lista": [],
    "electrodomesticos": [],
    "descripcion": "Residencial Las Leyendas es un lugar exclusivo con pocos vecinos, en una zona tranquila y segura. Ubicado a una cuadra del Parque Quiñones. Diseñado por Brand Arquitectos, especialistas en desarrollo",
    "imagen": "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-696649b911fb0_b.jpg",
    "imagen_color": "#1a4a2e",
    "per": 18.5,
    "reputacion": 4,
    "comision_pct": 2,
    "url_nexo": "https://admin.nexoagentes.pe/project/3871?projectTypes=1&projectTypes=2",
    "fotos": [
      "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-696649b911fb0_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-6876d14a5fabb_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-6876da6fd2dc1_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-6876d1949a2c2_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-6876d1694f296_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-6876d15a5aa0d_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-696649b911fb0_s.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/multiurbe/3871-residencial-leyendas-ii/departamentos-san-miguel-6876d14a5fabb_s.jpg"
    ],
    "youtube_url": "",
    "modelos": [
      {
        "nombre": "Flat Tipo3  Pisos: 4 y 6  Solicitar cita  (2 unidades) Desde S/. 649,000  (Ref. $ 190,100)  4 dorm- 2 baños 93.3 m2Pisos: 4 y 6",
        "dormitorios": 4,
        "banos": 2,
        "area": 93.3,
        "precio": 649000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat Tipo2  Pisos: 2, 3, 4  Solicitar cita  (3 unidades) Desde S/. 480,000  (Ref. $ 140,598)  3 dorm- 2 baños 70.1 m2Pisos: 2, 3, 4",
        "dormitorios": 3,
        "banos": 2,
        "area": 70.1,
        "precio": 480000,
        "comision_pct": 2
      },
      {
        "nombre": "Flat Tipo1  Pisos: 2, 3, 5  Solicitar cita  (3 unidades) Desde S/. 269,000  (Ref. $ 78,793)  1 dorm- 1 baños 41.1 m2Pisos: 2, 3, 5",
        "dormitorios": 1,
        "banos": 1,
        "area": 41.1,
        "precio": 269000,
        "comision_pct": 2
      }
    ]
  },
  {
    "id": 13,
    "id_nexo": 3476,
    "nombre": "Element",
    "inmobiliaria": "EDIFICA",
    "direccion": "Avenida Tomás Marsano 385",
    "distrito": "Surquillo",
    "lat": -12.107381207147446,
    "lng": -77.01800542978195,
    "zona": "Lima Moderna",
    "precio_desde": 278168,
    "precio_hasta": 507498,
    "moneda": "S/",
    "area_desde": 28.91,
    "area_hasta": 60.13,
    "dormitorios": [
      1,
      2,
      3
    ],
    "pisos": 15,
    "etapa": "En Construcción",
    "cuota_inicial_min": 20,
    "entrega": "2026",
    "banco_sponsor": "SCOTIABANK",
    "ruc": "",
    "amenities": [
      "Jardin interior",
      "Lobby",
      "Piscina",
      "Sala Bar",
      "Zona de Lavandería",
      "Zona de Parrillas"
    ],
    "acabados_lista": [],
    "electrodomesticos": [],
    "descripcion": "En ELEMENT encontrarás el equilibrio perfecto entre modernidad y confort. Ubicado en la zona más dinámica y céntrica de Surquillo, ELEMENT es el proyecto ideal para quienes quieren dar el primer paso",
    "imagen": "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-6799083fb44e3_b.jpg",
    "imagen_color": "#1a3a5c",
    "per": 18.5,
    "reputacion": 4,
    "comision_pct": 2,
    "url_nexo": "https://admin.nexoagentes.pe/project/3476?projectTypes=1&projectTypes=2",
    "fotos": [
      "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-6799083fb44e3_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-67083b1d2288c_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-67083b73d7bb6_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-67083b869e97c_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-67083b30a6fdd_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-67083b5ad3e28_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-67083b445d60e_b.jpg",
      "https://dp34qvsykz8fe.cloudfront.net/customers/gerencia-de-proyectos-edifica-s-a-c/3476-element/departamentos-surquillo-67083b9c13997_b.jpg"
    ],
    "youtube_url": "https://www.youtube.com/embed/PMGOneG0iBw?picture-in-picture=1&accelerometer=1&gyroscope=1",
    "modelos": [
      {
        "nombre": "Flat 8B  Pisos: 8, 12, 13  Solicitar cita  (3 unidades) Desde S/. 435,359  (Ref. $ 127,522)  2 dorm- 2 baños 55.77 m2Pisos: 8, 12, 13",
        "dormitorios": 2,
        "banos": 2,
        "area": 55.77,
        "precio": 435359,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 8A  Piso: 4  Solicitar cita  (1 unidad) Desde S/. 424,892  (Ref. $ 124,456)  2 dorm- 2 baños 56.25 m2Pisos: 4",
        "dormitorios": 2,
        "banos": 2,
        "area": 56.25,
        "precio": 424892,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 6A  Pisos: Entre 3 al 22  Solicitar cita  (13 unidades) Desde S/. 342,874  (Ref. $ 100,432)  1 dorm- 1 baños 39.87 m2Pisos: Entre 3 al 22",
        "dormitorios": 1,
        "banos": 1,
        "area": 39.87,
        "precio": 342874,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 5B  Pisos: 4, 6, 8, 9  Solicitar cita  (4 unidades) Desde S/. 344,143  (Ref. $ 100,803)  1 dorm- 1 baños 39.87 m2Pisos: 4, 6, 8, 9",
        "dormitorios": 1,
        "banos": 1,
        "area": 39.87,
        "precio": 344143,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 4A  Pisos: Entre 3 al 22  Solicitar cita  (6 unidades) Desde S/. 342,874  (Ref. $ 100,432)  1 dorm- 1 baños 39.87 m2Pisos: Entre 3 al 22",
        "dormitorios": 1,
        "banos": 1,
        "area": 39.87,
        "precio": 342874,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 3B  Pisos: 4 y 6  Solicitar cita  (2 unidades) Desde S/. 336,825  (Ref. $ 98,660)  1 dorm- 1 baños 36.43 m2Pisos: 4 y 6",
        "dormitorios": 1,
        "banos": 1,
        "area": 36.43,
        "precio": 336825,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 2A  Pisos: Entre 4 al 22  Solicitar cita  (8 unidades) Desde S/. 278,168  (Ref. $ 81,479)  1 dorm- 1 baños 28.91 m2Pisos: Entre 4 al 22",
        "dormitorios": 1,
        "banos": 1,
        "area": 28.91,
        "precio": 278168,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 1B  Piso: 22  Solicitar cita  (1 unidad) Desde S/. 297,102  (Ref. $ 87,025)  1 dorm- 1 baños 30.31 m2Pisos: 22",
        "dormitorios": 1,
        "banos": 1,
        "area": 30.31,
        "precio": 297102,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 1A  Pisos: 4, 13, 16, 17  Solicitar cita  (4 unidades) Desde S/. 283,166  (Ref. $ 82,943)  1 dorm- 1 baños 30.72 m2Pisos: 4, 13, 16, 17",
        "dormitorios": 1,
        "banos": 1,
        "area": 30.72,
        "precio": 283166,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 16A  Piso: 20  Solicitar cita  (1 unidad) Desde S/. 490,652  (Ref. $ 143,718)  2 dorm- 2 baños 57.43 m2Pisos: 20",
        "dormitorios": 2,
        "banos": 2,
        "area": 57.43,
        "precio": 490652,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 13E  Piso: 22  Solicitar cita  (1 unidad) Desde S/. 507,498  (Ref. $ 148,652)  3 dorm- 2 baños 60.13 m2Pisos: 22",
        "dormitorios": 3,
        "banos": 2,
        "area": 60.13,
        "precio": 507498,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 12B  Pisos: 4, 6, 8, 9, 10  Solicitar cita  (5 unidades) Desde S/. 329,993  (Ref. $ 96,659)  1 dorm- 1 baños 40.19 m2Pisos: 4, 6, 8, 9, 10",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.19,
        "precio": 329993,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 11D  Piso: 22  Solicitar cita  (1 unidad) Desde S/. 349,563  (Ref. $ 102,391)  1 dorm- 1 baños 41.14 m2Pisos: 22",
        "dormitorios": 1,
        "banos": 1,
        "area": 41.14,
        "precio": 349563,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 11C  Pisos: 13, 14, 16, 17  Solicitar cita  (4 unidades) Desde S/. 339,993  (Ref. $ 99,588)  1 dorm- 1 baños 41.41 m2Pisos: 13, 14, 16, 17",
        "dormitorios": 1,
        "banos": 1,
        "area": 41.41,
        "precio": 339993,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 11B  Piso: 6  Solicitar cita  (1 unidad) Desde S/. 329,427  (Ref. $ 96,493)  1 dorm- 1 baños 41.67 m2Pisos: 6",
        "dormitorios": 1,
        "banos": 1,
        "area": 41.67,
        "precio": 329427,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 10B  Piso: 14  Solicitar cita  (1 unidad) Desde S/. 344,625  (Ref. $ 100,945)  1 dorm- 1 baños 40.13 m2Pisos: 14",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.13,
        "precio": 344625,
        "comision_pct": 2
      },
      {
        "nombre": "Flat 10A  Pisos: 8 y 10  Solicitar cita  (2 unidades) Desde S/. 337,440  (Ref. $ 98,840)  1 dorm- 1 baños 40.39 m2Pisos: 8 y 10",
        "dormitorios": 1,
        "banos": 1,
        "area": 40.39,
        "precio": 337440,
        "comision_pct": 2
      }
    ]
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
