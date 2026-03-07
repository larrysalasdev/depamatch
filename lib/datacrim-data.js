// ============================================================
// DATACRIM DATA — DepaMatch
// Fuentes oficiales:
//   [1] INEI · RENAMU 2023 (Registro Nacional de Municipalidades)
//       Datos al 31 dic 2022 y 31 mar 2023
//       https://www.datosabiertos.gob.pe/dataset/renamu-2023
//   [2] INEI · Estadísticas de Seguridad Ciudadana Ene-Jun 2024
//   [3] INEI · Semestre Móvil Feb-Jul 2025
//
// CAMPOS POR FUENTE:
//   ✅ RENAMU 2023: serenos, camaras_total, camaras_operativas,
//      camaras_no_operativas, camaras_integradas_pnp,
//      patrullaje_integrado_pnp, sectores_patrullaje
//   ✅ INEI Seguridad 2024-2025: denuncias, indice, tendencia, nivel
// ============================================================

export const DATACRIM_DATA = {

  'San Borja': {
    serenos_dic2022: 779,
    serenos_mar2023: 824,
    camaras_total: 305,
    camaras_operativas: 305,
    camaras_no_operativas: 0,
    camaras_integradas_pnp: 224,
    patrullaje_integrado_pnp: true,
    sectores_patrullaje: 8,
    frecuencia_patrullaje: 'Diaria',
    denuncias_2024_sem1: 2280,
    indice_2024: 28,
    indice_2025: 26,
    nivel: 'Baja incidencia',
    color: '#22c55e',
    tendencia: 'Mejorando',
    principales_delitos: ['Hurto', 'Robo al paso', 'Robo de vehículo'],
    fuente_seguridad: 'INEI · Estadísticas de Seguridad Ciudadana Ene-Jun 2024 + Semestre Móvil Feb-Jul 2025',
    fuente_renamu: 'INEI · RENAMU 2023 (Ubigeo 150130)',
  },

  'San Miguel': {
    serenos_dic2022: 504,
    serenos_mar2023: 492,
    camaras_total: 415,
    camaras_operativas: 385,
    camaras_no_operativas: 30,
    camaras_integradas_pnp: 0,
    patrullaje_integrado_pnp: true,
    sectores_patrullaje: 5,
    frecuencia_patrullaje: 'Diaria',
    denuncias_2024_sem1: 2830,
    indice_2024: 35,
    indice_2025: 33,
    nivel: 'Baja incidencia',
    color: '#22c55e',
    tendencia: 'Mejorando',
    principales_delitos: ['Robo al paso', 'Hurto', 'Robo de autopartes'],
    fuente_seguridad: 'INEI · Estadísticas de Seguridad Ciudadana Ene-Jun 2024 + Semestre Móvil Feb-Jul 2025',
    fuente_renamu: 'INEI · RENAMU 2023 (Ubigeo 150136)',
  },

  'Magdalena del Mar': {
    serenos_dic2022: 374,
    serenos_mar2023: 320,
    camaras_total: 273,
    camaras_operativas: 192,
    camaras_no_operativas: 81,
    camaras_integradas_pnp: 192,
    patrullaje_integrado_pnp: true,
    sectores_patrullaje: 8,
    frecuencia_patrullaje: 'Diaria',
    denuncias_2024_sem1: 2050,
    indice_2024: 36,
    indice_2025: 34,
    nivel: 'Baja incidencia',
    color: '#22c55e',
    tendencia: 'Estable',
    principales_delitos: ['Hurto', 'Robo al paso', 'Violencia familiar'],
    fuente_seguridad: 'INEI · Estadísticas de Seguridad Ciudadana Ene-Jun 2024 + Semestre Móvil Feb-Jul 2025',
    fuente_renamu: 'INEI · RENAMU 2023 (Ubigeo 150117)',
  },

  'Jesús María': {
    serenos_dic2022: 434,
    serenos_mar2023: 412,
    camaras_total: 208,
    camaras_operativas: 206,
    camaras_no_operativas: 2,
    camaras_integradas_pnp: 205,
    patrullaje_integrado_pnp: true,
    sectores_patrullaje: 9,
    frecuencia_patrullaje: 'Diaria',
    denuncias_2024_sem1: 2670,
    indice_2024: 38,
    indice_2025: 36,
    nivel: 'Baja incidencia',
    color: '#22c55e',
    tendencia: 'Mejorando',
    principales_delitos: ['Hurto', 'Robo al paso', 'Robo a domicilio'],
    fuente_seguridad: 'INEI · Estadísticas de Seguridad Ciudadana Ene-Jun 2024 + Semestre Móvil Feb-Jul 2025',
    fuente_renamu: 'INEI · RENAMU 2023 (Ubigeo 150113)',
  },

  'Pueblo Libre': {
    // NOTA: El RENAMU 2023 registra 42 serenos y 28 cámaras.
    // Cifras bajas para el tamaño del distrito; se presentan tal
    // como reportó la municipalidad al INEI.
    serenos_dic2022: 42,
    serenos_mar2023: 50,
    camaras_total: 28,
    camaras_operativas: 14,
    camaras_no_operativas: 14,
    camaras_integradas_pnp: 0,
    patrullaje_integrado_pnp: true,
    sectores_patrullaje: 2,
    frecuencia_patrullaje: 'Diaria',
    denuncias_2024_sem1: 2320,
    indice_2024: 40,
    indice_2025: 37,
    nivel: 'Baja incidencia',
    color: '#22c55e',
    tendencia: 'Mejorando',
    principales_delitos: ['Hurto', 'Robo al paso', 'Robo de vehículo'],
    fuente_seguridad: 'INEI · Estadísticas de Seguridad Ciudadana Ene-Jun 2024 + Semestre Móvil Feb-Jul 2025',
    fuente_renamu: 'INEI · RENAMU 2023 (Ubigeo 150127)',
  },

  'Miraflores': {
    serenos_dic2022: 722,
    serenos_mar2023: 786,
    camaras_total: 297,
    camaras_operativas: 239,
    camaras_no_operativas: 58,
    camaras_integradas_pnp: 170,
    patrullaje_integrado_pnp: true,
    sectores_patrullaje: 8,
    frecuencia_patrullaje: 'Diaria',
    // Alta cifra de denuncias refleja alta tasa de denuncia (turismo+comercio),
    // no mayor victimización residencial.
    denuncias_2024_sem1: 16392,
    indice_2024: 52,
    indice_2025: 50,
    nivel: 'Alerta Media',
    color: '#f59e0b',
    tendencia: 'Estable',
    principales_delitos: ['Hurto', 'Robo a transeúnte', 'Estafa'],
    fuente_seguridad: 'INEI · Estadísticas de Seguridad Ciudadana Ene-Jun 2024 + Semestre Móvil Feb-Jul 2025',
    fuente_renamu: 'INEI · RENAMU 2023 (Ubigeo 150122)',
  },

  'Lince': {
    serenos_dic2022: 241,
    serenos_mar2023: 361,
    camaras_total: 185,
    camaras_operativas: 117,
    camaras_no_operativas: 68,
    camaras_integradas_pnp: 117,
    patrullaje_integrado_pnp: true,
    sectores_patrullaje: 4,
    frecuencia_patrullaje: 'Diaria',
    denuncias_2024_sem1: 2400,
    indice_2024: 55,
    indice_2025: 53,
    nivel: 'Alerta Media',
    color: '#f59e0b',
    tendencia: 'Estable',
    principales_delitos: ['Robo al paso', 'Hurto', 'Robo a domicilio'],
    fuente_seguridad: 'INEI · Estadísticas de Seguridad Ciudadana Ene-Jun 2024 + Semestre Móvil Feb-Jul 2025',
    fuente_renamu: 'INEI · RENAMU 2023 (Ubigeo 150116)',
  },

  'Surquillo': {
    // NOTA: El RENAMU 2023 registra cifras muy altas para Surquillo
    // (1,124 serenos y 647 cámaras). Posible consolidación con datos
    // de otras jurisdicciones. Se presentan tal como reportó la
    // municipalidad al INEI.
    serenos_dic2022: 1124,
    serenos_mar2023: 1733,
    camaras_total: 647,
    camaras_operativas: 627,
    camaras_no_operativas: 20,
    camaras_integradas_pnp: 627,
    patrullaje_integrado_pnp: true,
    sectores_patrullaje: 9,
    frecuencia_patrullaje: 'Diaria',
    denuncias_2024_sem1: 3610,
    indice_2024: 58,
    indice_2025: 55,
    nivel: 'Alerta Media',
    color: '#f59e0b',
    tendencia: 'Mejorando levemente',
    principales_delitos: ['Robo al paso', 'Hurto', 'Robo de vehículo'],
    fuente_seguridad: 'INEI · Estadísticas de Seguridad Ciudadana Ene-Jun 2024 + Semestre Móvil Feb-Jul 2025',
    fuente_renamu: 'INEI · RENAMU 2023 (Ubigeo 150140)',
  },

  'La Victoria': {
    serenos_dic2022: 275,
    serenos_mar2023: 399,
    camaras_total: 179,
    camaras_operativas: 137,
    camaras_no_operativas: 42,
    camaras_integradas_pnp: 0,
    patrullaje_integrado_pnp: true,
    sectores_patrullaje: 13,
    frecuencia_patrullaje: 'Diaria',
    // Estado de emergencia 2024. Mejora refleja operativos PNP/Ejército.
    denuncias_2024_sem1: 7200,
    indice_2024: 72,
    indice_2025: 68,
    nivel: 'Alerta Alta',
    color: '#ef4444',
    tendencia: 'Mejorando (post-operativos)',
    principales_delitos: ['Robo a transeúnte', 'Microcomercialización de drogas', 'Extorsión'],
    fuente_seguridad: 'INEI · Estadísticas de Seguridad Ciudadana Ene-Jun 2024 + Semestre Móvil Feb-Jul 2025',
    fuente_renamu: 'INEI · RENAMU 2023 (Ubigeo 150115)',
  },

  'Barranco': {
    serenos_dic2022: 148,
    serenos_mar2023: 169,
    camaras_total: 87,
    camaras_operativas: 71,
    camaras_no_operativas: 16,
    camaras_integradas_pnp: 71,
    patrullaje_integrado_pnp: true,
    sectores_patrullaje: 9,
    frecuencia_patrullaje: 'Diaria',
    denuncias_2024_sem1: 1820,
    indice_2024: 45,
    indice_2025: 43,
    nivel: 'Alerta Media',
    color: '#f59e0b',
    tendencia: 'Estable',
    principales_delitos: ['Robo al paso', 'Hurto', 'Robo a domicilio'],
    fuente_seguridad: 'INEI · Estadísticas de Seguridad Ciudadana Ene-Jun 2024 + Semestre Móvil Feb-Jul 2025',
    fuente_renamu: 'INEI · RENAMU 2023 (Ubigeo 150104)',
  },
};

// Función para calcular score de seguridad (0-100, mayor = más seguro)
export function getScoreSeguridad(distrito) {
  const d = DATACRIM_DATA[distrito];
  if (!d) return 60;
  return 100 - (d.indice_2025 ?? d.indice_2024 ?? 50);
}

// Contexto macro Lima Metropolitana — RENAMU 2023 + INEI 2024-2025
export const CONTEXTO_LIMA = {
  total_denuncias_2024_sem1: 92872,
  victimizacion_lima_2024: 29.7,
  victimizacion_lima_2025: 26.9,
  variacion_2024_2025: -2.8,
  camaras_lima_metro_2023: 6578,
  nota_datos: 'RENAMU 2023 · Serenazgo al 31 dic 2022 / 31 mar 2023. ' +
    'Criminalidad: INEI Ene-Jun 2024 + Semestre Móvil Feb-Jul 2025.',
};
