'use client';

import dynamic from 'next/dynamic';
// ─── AppShell.jsx ─────────────────────────────────────────────────────────────
// Este componente es el contenedor 'use client' de toda la app interactiva.
// Todo el código de depamatch.jsx vive aquí — no se reescribió nada, solo
// se adaptó el import/export para Next.js App Router.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine,
  LineChart, Line, CartesianGrid, Legend, AreaChart, Area,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';

import {
  INDECOPI_DATA, DATACRIM_DATA, DATACRIM_PREDIOS, BCRP_DATA, TASAS_SBS, DISTRITOS_SEO,
  calcularScores,
} from '@/lib/data';

// ─── HOOK: carga proyectos desde Supabase via API ─────────────────────────────
function useProyectos() {
  const [PROYECTOS, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/proyectos')
      .then(r => r.json())
      .then(data => {
        // Normalizar campos para compatibilidad con scoring engine
        const proyectos = data.map(p => ({
          ...p,
          modelos: p.modelos || [],
          acabados_lista: p.acabados_lista || [],
          electrodomesticos: p.electrodomesticos || [],
          extras_equipamiento: p.extras_equipamiento || [],
          depas_total: p.unidades_disponibles || 0,
          imagen: p.fotos?.[0] || null,
          imagen_color: '#1a1a2e',
        }));
        // Calcular scores igual que lib/data.js
        const conScores = proyectos.map(p => ({ ...p, scores: calcularScores(p) }));
        setProyectos(conScores);
      })
      .catch(err => console.error('Error cargando proyectos:', err))
      .finally(() => setLoading(false));
  }, []);

  return { PROYECTOS, loading };
}

// ─── BRAND ────────────────────────────────────────────────────────────────────
const LOGO = '/assets/logo.png';
// ─── HOOK MOBILE ──────────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 640 : false);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

const C = {
  teal: '#2EDFC4', yellow: '#FFD600', black: '#0D0D0D',
  card: '#141414', card2: '#1A1A1A', border: '#ffffff12',
  text: '#F0F0F0', muted: '#ccc', dim: '#bbb',
  green: '#22c55e', red: '#ef4444', orange: '#f59e0b', blue: '#3b82f6',
};
const S = {
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 },
  btnPrimary: { background: `linear-gradient(135deg,${C.teal},#1FC4AB)`, color: C.black, border: 'none', borderRadius: 12, padding: '13px 20px', fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 20px ${C.teal}40` },
  btnYellow: { background: `linear-gradient(135deg,${C.yellow},#F5C800)`, color: C.black, border: 'none', borderRadius: 12, padding: '13px 20px', fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 20px ${C.yellow}50` },
  btnGhost: { background: '#ffffff0D', color: '#ccc', border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  input: { width: '100%', background: '#ffffff08', border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  tag: (color) => ({ background: color + '20', color, border: `1px solid ${color}40`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }),
};
const etapaColor = { 'Entrega Inmediata': '#22c55e', 'En Construcción': '#f59e0b', 'En Planos': '#3b82f6' };

function calcScore(proyecto, perfil) {
  const w = perfil?.objetivo === 'negocio'
    ? { ubicacion: 0.08, seguridad: 0.08, accesibilidad: 0.08, amenities: 0.08, acabados: 0.06, equipamiento: 0.04, precio: 0.38, per: 10 }
    : perfil?.objetivo === 'vivir'
    ? { ubicacion: 0.20, seguridad: 0.20, accesibilidad: 0.16, amenities: 0.14, acabados: 0.14, equipamiento: 0.10, precio: 0.06, per: 0 }
    : { ubicacion: 0.15, seguridad: 0.15, accesibilidad: 0.13, amenities: 0.12, acabados: 0.11, equipamiento: 0.08, precio: 0.26, per: 5 };
  const s = proyecto.scores;
  let score = s.ubicacion * w.ubicacion + s.seguridad * w.seguridad + s.accesibilidad * w.accesibilidad
    + (s.amenities || s.equipamiento || 0) * w.amenities + s.acabados * w.acabados
    + (s.equipamiento || 0) * w.equipamiento + s.precio * w.precio;
  score += (proyecto.reputacion - 3) * 1.5;
  score += w.per > 0 ? Math.max(0, (22 - proyecto.per)) * w.per : 0;
  if (perfil?.presupuesto && proyecto.precio_desde > perfil.presupuesto * 1.15) score -= 15;
  return Math.min(99, Math.max(30, Math.round(score)));
}

function cuota(precio, años, tasa) {
  const p = precio * 0.90, r = tasa / 100 / 12, n = años * 12;
  return Math.round(p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
}

// ─── SVG MAP ─────────────────────────────────────────────────────────────────
// MapaFallback reemplazado por MapaLeaflet — carga dinámica para evitar errores SSR

const MapaLeaflet = dynamic(() => import('./MapaLeaflet'), { ssr: false, loading: () => (
  <div style={{ width: '100%', height: '100%', background: '#111', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 12 }}>
    Cargando mapa...
  </div>
) });

// ─── INDECOPI PANEL ───────────────────────────────────────────────────────────
function IndecopiPanel({ proyecto }) {
  const data = INDECOPI_DATA[proyecto.inmobiliaria];
  const inm  = proyecto.inmobiliaria || proyecto.nombre;

  // Si no hay data → A+ por defecto
  const d = data || {
    calificacion: 'A+', color: '#22c55e', descripcion: 'Sin sanciones registradas',
    total_sanciones: 0, total_monto_uit: 0,
    nota_entidades: 'No se encontraron registros bajo este nombre comercial en el periodo consultado.',
    entidades: [],
    fuente: 'INDECOPI · Ranking Proveedores Sancionados · 06/03/2022–05/03/2026',
  };

  const CAL_LABEL = { 'A+': 'Sin sanciones', A: 'Sanciones menores', B: 'Sanciones moderadas', C: 'Sanciones significativas' };
  const CAL_ICON  = { 'A+': '✓', A: '✓', B: '⚠', C: '✕' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Header calificación */}
      <div style={{ ...S.card, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Badge calificación */}
        <div style={{ background: d.color + '18', border: `2px solid ${d.color}`, borderRadius: 14, width: 64, height: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ color: d.color, fontWeight: 900, fontSize: 22, lineHeight: 1 }}>{d.calificacion}</div>
          <div style={{ color: d.color + '99', fontSize: 8, marginTop: 2 }}>INDECOPI</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 13, marginBottom: 1 }}>{inm}</div>
          <div style={{ color: '#ccc', fontSize: 9, marginBottom: 5 }}>{d.tipo_legal || 'Promotora Inmobiliaria'}</div>
          <div style={{ color: d.color, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
            {CAL_ICON[d.calificacion]} {CAL_LABEL[d.calificacion]}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(() => { const sc = d.total_sanciones === 0 ? '#22c55e' : d.total_sanciones <= 3 ? '#f59e0b' : '#ef4444'; return (
              <span style={{ background: sc + '20', border: '1px solid ' + sc, borderRadius: 5, fontSize: 9, color: sc, padding: '2px 7px', fontWeight: 800 }}>
                {d.total_sanciones} sancion{d.total_sanciones !== 1 ? 'es' : ''}
              </span>
            ); })()}
            {d.total_monto_uit > 0 && (() => { const sc = d.total_sanciones === 0 ? '#22c55e' : d.total_sanciones <= 3 ? '#f59e0b' : '#ef4444'; return (
              <span style={{ background: sc, borderRadius: 5, fontSize: 9, color: '#fff', padding: '2px 7px', fontWeight: 800 }}>
                {d.total_monto_uit} UIT
              </span>
            ); })()}
          </div>
        </div>
      </div>

      {/* Entidades identificadas */}
      {d.entidades && d.entidades.length > 0 && (
        <div style={{ ...S.card, padding: 16 }}>
          <div style={{ color: '#aaa', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Entidades identificadas en INDECOPI
          </div>
          {d.entidades.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < d.entidades.length - 1 ? '1px solid #ffffff08' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#ccc', fontSize: 10, fontWeight: 600, marginBottom: 2 }}>{e.razon_social}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: e.sanciones > 0 ? '#f59e0b' : '#22c55e', fontSize: 9 }}>
                    {e.sanciones > 0 ? `⚠ ${e.sanciones} sanciones` : '✓ Sin sanciones'}
                  </span>
                  {e.monto_uit > 0 && <span style={{ color: '#ccc', fontSize: 9 }}>· {e.monto_uit} UIT</span>}
                  {e.posicion_ranking && <span style={{ color: '#bbb', fontSize: 9 }}>· Rank #{e.posicion_ranking}</span>}
                </div>
              </div>
              {/* Mini barra sanciones */}
              <div style={{ width: 50, height: 4, background: '#ffffff08', borderRadius: 2, flexShrink: 0 }}>
                <div style={{ height: '100%', width: `${Math.min(100, (e.sanciones / 10) * 100)}%`, background: e.sanciones > 5 ? '#ef4444' : e.sanciones > 2 ? '#f59e0b' : '#22c55e', borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nota sobre entidades múltiples */}
      {d.nota_entidades && (
        <div style={{ background: '#ffffff05', border: '1px solid #ffffff10', borderRadius: 10, padding: '10px 12px', fontSize: 9, color: '#fff', lineHeight: 1.6 }}>
          ℹ️ {d.nota_entidades}
        </div>
      )}

      {/* Periodo sanciones + Fundación */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {d.periodo_sanciones && (
          <div style={{ background: '#7c3aed15', border: '1px solid #7c3aed50', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ color: '#a78bfa', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>📅 Periodo sanciones</div>
            <div style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{d.periodo_sanciones}</div>
            <div style={{ color: '#a78bfa', fontSize: 8, marginTop: 2, fontWeight: 600 }}>Fuente: INDECOPI</div>
            {d.entidades && d.entidades.filter(e => e.sanciones > 0).length > 0 && (
              <div style={{ marginTop: 8, borderTop: '1px solid #7c3aed30', paddingTop: 7, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {d.entidades.filter(e => e.sanciones > 0).map((e, i) => (
                  <div key={i} style={{ fontSize: 8, color: '#c4b5fd', lineHeight: 1.4 }}>
                    <span style={{ color: '#e2d9ff', fontWeight: 700 }}>{e.razon_social}</span>
                    <br/>
                    <span>{e.sanciones} sanción{e.sanciones !== 1 ? 'es' : ''}{e.anios_sanciones ? ' · ' + e.anios_sanciones : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {d.fecha_fundacion && (
          <div style={{ background: '#7c3aed15', border: '1px solid #7c3aed50', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ color: '#a78bfa', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>🏢 En el mercado desde</div>
            <div style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{d.fecha_fundacion}</div>
            <div style={{ color: '#a78bfa', fontSize: 8, marginTop: 2, fontWeight: 800 }}>{d.anios_mercado} años de trayectoria</div>
          </div>
        )}
      </div>

      {/* Proyectos entregados / en construcción / en planos */}
      {(d.proyectos_entregados != null || d.proyectos_construccion != null) && (
        <div style={{ ...S.card, padding: 14 }}>
          <div style={{ color: '#aaa', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>🏗️ Trayectoria de proyectos</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
            {d.proyectos_entregados != null && (
              <div style={{ background: '#22c55e10', border: '1px solid #22c55e30', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ color: '#22c55e', fontWeight: 900, fontSize: 20, lineHeight: 1 }}>{d.proyectos_entregados}</div>
                <div style={{ color: '#22c55e', fontSize: 8, marginTop: 3, fontWeight: 600 }}>Entregados</div>
              </div>
            )}
            {d.proyectos_construccion != null && (
              <div style={{ background: '#f59e0b10', border: '1px solid #f59e0b30', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ color: '#f59e0b', fontWeight: 900, fontSize: 20, lineHeight: 1 }}>{d.proyectos_construccion}</div>
                <div style={{ color: '#f59e0b', fontSize: 8, marginTop: 3, fontWeight: 600 }}>En construcción</div>
              </div>
            )}
            {d.proyectos_planos != null && (
              <div style={{ background: '#3b82f610', border: '1px solid #3b82f630', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ color: '#3b82f6', fontWeight: 900, fontSize: 20, lineHeight: 1 }}>{d.proyectos_planos}</div>
                <div style={{ color: '#3b82f6', fontSize: 8, marginTop: 3, fontWeight: 600 }}>En planos</div>
              </div>
            )}
          </div>
          {d.fuente_proyectos && (
            <div style={{ color: '#bbb', fontSize: 8, marginTop: 8 }}>Fuente: {d.fuente_proyectos}</div>
          )}
        </div>
      )}

      {/* Certificaciones y reconocimientos */}
      {((d.certificaciones && d.certificaciones.length > 0) || (d.reconocimientos && d.reconocimientos.length > 0)) && (
        <div style={{ ...S.card, padding: 14 }}>
          <div style={{ color: '#aaa', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>🏅 Certificaciones y reconocimientos</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(d.certificaciones || []).map((c, i) => (
              <span key={i} style={{ background: '#2EDFC415', border: '1px solid #2EDFC440', borderRadius: 6, fontSize: 9, color: '#2EDFC4', padding: '3px 8px', fontWeight: 700 }}>✓ {c}</span>
            ))}
            {(d.reconocimientos || d.premios || []).map((p, i) => (
              <span key={i} style={{ background: '#FFD60015', border: '1px solid #FFD60040', borderRadius: 6, fontSize: 9, color: '#FFD600', padding: '3px 8px', fontWeight: 700 }}>🏆 {p}</span>
            ))}
          </div>
        </div>
      )}

      {/* Fuente y fecha */}
      <div style={{ fontSize: 9, lineHeight: 1.7 }}>
        <span style={{ color: '#fff', fontWeight: 700 }}>📋 {d.fuente}</span><br/>
        <span style={{ color: '#fff', fontWeight: 700 }}>⚠️ El ranking incluye sanciones absolutas (multas y amonestaciones). No refleja volumen de operaciones ni es proporcional al tamaño de la empresa.</span>
      </div>
    </div>
  );
}

// ─── DATACRIM PANEL ───────────────────────────────────────────────────────────
function DataCrimPanel({ distrito, proyectoId, proyectos = [] }) {
  const PROYECTOS = proyectos;
  const dp = proyectoId ? DATACRIM_PREDIOS[proyectoId] : null;
  const dd = DATACRIM_DATA[distrito];
  const d = dp ? { ...dp, tasa_por_1000_hab: null, por_categoria: null, esPredio: true }
               : dd ? { ...dd, esPredio: false } : null;

  if (!d) return <div style={{ color: '#ddd', padding: 20, fontSize: 12 }}>Sin datos disponibles</div>;

  const CAT_COLORS = ['#2EDFC4','#ef4444','#8b5cf6','#6b7280'];
  const TOP_COLORS = ['#2EDFC4','#818cf8','#f472b6','#34d399','#fb923c'];
  const PROJ_COLORS = ['#2EDFC4','#818cf8','#f472b6','#34d399','#fb923c','#facc15','#60a5fa','#a78bfa','#4ade80','#f87171','#38bdf8','#c084fc','#86efac'];

  const maxDelito = Math.max(...(d.top_delitos || []).map(x => x.casos), 1);
  const R = 38, CX = 48, CY = 48, circ = 2 * Math.PI * R;

  const catKeys  = dd?.por_categoria ? Object.keys(dd.por_categoria) : [];
  const totalCat = dd?.por_categoria ? Object.values(dd.por_categoria).reduce((a,b)=>a+b,0) : 0;
  let offset = 0;
  const donutSegments = catKeys.map((cat, i) => {
    const pct = totalCat > 0 ? dd.por_categoria[cat] / totalCat : 0;
    const dash = pct * circ;
    const seg  = { cat, pct, dash, offset, color: CAT_COLORS[i] };
    offset += dash;
    return seg;
  });

  // Para la comparativa — bubble chart simulado con CSS
  const sortedPredios = Object.entries(DATACRIM_PREDIOS).sort((a,b) => b[1].score_seguridad - a[1].score_seguridad);
  const maxTotal = Math.max(...Object.values(DATACRIM_PREDIOS).map(p => p.total_500m_2024));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Badge fuente */}
      <div style={{ display: 'flex', gap: 8 }}>
        <span style={{ background: d.esPredio ? '#2EDFC420' : '#ffffff08', border: `1px solid ${d.esPredio ? '#2EDFC4' : '#333'}`, borderRadius: 6, fontSize: 9, color: d.esPredio ? '#2EDFC4' : '#ccc', padding: '3px 8px', fontWeight: 700 }}>
          {d.esPredio ? '📍 Radio 500m del predio · INEI 2024' : '🏙️ Datos por distrito · INEI 2024'}
        </span>
      </div>

      {/* Score + stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{ ...S.card, padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 72, height: 72 }}>
            <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="36" cy="36" r="28" fill="none" stroke="#ffffff08" strokeWidth="7" />
              <circle cx="36" cy="36" r="28" fill="none" stroke={d.color} strokeWidth="7"
                strokeDasharray={`${(d.score_seguridad/100)*176} 176`} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ color: d.color, fontWeight: 900, fontSize: 18, lineHeight: 1 }}>{d.score_seguridad}</div>
              <div style={{ color: '#ccc', fontSize: 8 }}>/100</div>
            </div>
          </div>
          <div style={{ color: d.color, fontWeight: 800, fontSize: 10, marginTop: 6, textAlign: 'center' }}>{d.nivel}</div>
        </div>
        <div style={{ ...S.card, padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 22, lineHeight: 1 }}>
            {d.esPredio ? d.total_500m_2024 : dd?.total_denuncias_2024?.toLocaleString()}
          </div>
          <div style={{ color: '#ddd', fontSize: 9, marginTop: 4 }}>{d.esPredio ? 'denuncias en 500m' : 'denuncias distrito'}</div>
          <div style={{ color: '#ccc', fontSize: 9, marginTop: 2 }}>{d.esPredio ? '📍 radio 500m · 2024' : `📊 ${dd?.tasa_por_1000_hab}/1,000 hab.`}</div>
        </div>
        <div style={{ ...S.card, padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: d.pct_violentos < 8 ? '#22c55e' : d.pct_violentos < 14 ? '#f59e0b' : '#ef4444', fontWeight: 900, fontSize: 22, lineHeight: 1 }}>
            {d.pct_violentos}%
          </div>
          <div style={{ color: '#ddd', fontSize: 9, marginTop: 4 }}>delitos violentos</div>
          <div style={{ color: '#ccc', fontSize: 9, marginTop: 2 }}>
            {d.esPredio ? `🔴 ${d.violentos_500m} casos 500m` : `🔴 ${dd?.tasa_violentos_1000}/1,000 hab.`}
          </div>
        </div>
      </div>

      {/* 1. Comparativo 500m vs distrito — PRIMERO */}
      {d.esPredio && dd && (
        <div style={{ ...S.card, padding: 16 }}>
          <div style={{ color: '#aaa', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
            Comparativo · Entorno 500m vs Distrito completo
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background: '#2EDFC408', border: '1px solid #2EDFC430', borderRadius: 10, padding: 12 }}>
              <div style={{ color: '#2EDFC4', fontSize: 9, fontWeight: 700, marginBottom: 8 }}>📍 Radio 500m</div>
              <div style={{ color: '#fff', fontWeight: 900, fontSize: 22, lineHeight: 1 }}>{d.total_500m_2024}</div>
              <div style={{ color: '#ddd', fontSize: 9, marginTop: 2, marginBottom: 8 }}>denuncias 2024</div>
              <div style={{ fontSize: 9, display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: '#ddd' }}>Violentos</span>
                <span style={{ color: d.pct_violentos < 8 ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>{d.violentos_500m} ({d.pct_violentos}%)</span>
              </div>
              <div style={{ fontSize: 9, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#ddd' }}>Score</span>
                <span style={{ color: d.color, fontWeight: 700 }}>{d.score_seguridad}/100</span>
              </div>
            </div>
            <div style={{ background: '#ffffff05', border: '1px solid #ffffff12', borderRadius: 10, padding: 12 }}>
              <div style={{ color: '#aaa', fontSize: 9, fontWeight: 700, marginBottom: 8 }}>🏙️ {distrito}</div>
              <div style={{ color: '#fff', fontWeight: 900, fontSize: 22, lineHeight: 1 }}>{dd.total_denuncias_2024?.toLocaleString()}</div>
              <div style={{ color: '#ddd', fontSize: 9, marginTop: 2, marginBottom: 8 }}>denuncias 2024</div>
              <div style={{ fontSize: 9, display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: '#ddd' }}>Tasa</span>
                <span style={{ color: '#ccc', fontWeight: 700 }}>{dd.tasa_por_1000_hab}/1,000 hab.</span>
              </div>
              <div style={{ fontSize: 9, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#ddd' }}>Score distrito</span>
                <span style={{ color: dd.color, fontWeight: 700 }}>{dd.score_seguridad}/100</span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 9, color: '#ccc', marginTop: 10, lineHeight: 1.5 }}>
            💡 El entorno 500m refleja el riesgo real del predio, independiente del promedio distrital.
          </div>
        </div>
      )}

      {/* 3. Top delitos */}
      <div style={{ ...S.card, padding: 16 }}>
        <div style={{ color: '#aaa', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          {d.esPredio ? 'Delitos más frecuentes · 500m del predio' : `Delitos más frecuentes · ${distrito}`}
        </div>
        {(d.top_delitos || []).map((item, i) => {
          const pct = Math.round((item.casos / maxDelito) * 100);
          const col = TOP_COLORS[i];
          return (
            <div key={item.tipo} style={{ marginBottom: i < (d.top_delitos.length-1) ? 10 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#ccc', fontSize: 10 }}>
                  <span style={{ color: col, fontWeight: 800, marginRight: 6, fontSize: 11 }}>#{i+1}</span>
                  {item.tipo}
                </span>
                <span style={{ color: col, fontWeight: 800, fontSize: 11 }}>{item.casos.toLocaleString()}</span>
              </div>
              <div style={{ height: 5, background: '#ffffff08', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${col}88,${col})`, borderRadius: 3 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Comparativa — 6 proyectos más cercanos */}
      {d.esPredio && (() => {
        // Calcular distancia euclidiana a cada proyecto y tomar los 6 más cercanos (+ el actual)
        const thisProy = PROYECTOS.find(p => p.id === proyectoId);
        if (!thisProy) return null;
        const dist = (p) => Math.sqrt(Math.pow(p.lat - thisProy.lat, 2) + Math.pow(p.lng - thisProy.lng, 2));
        const cercanos = [...PROYECTOS]
          .sort((a, b) => dist(a) - dist(b))
          .slice(0, 6) // el propio + 5 cercanos
          .map(p => [String(p.id), DATACRIM_PREDIOS[p.id]])
          .filter(([, pp]) => pp)
          .sort((a, b) => b[1].score_seguridad - a[1].score_seguridad);
        const maxTotalLocal = Math.max(...cercanos.map(([,pp]) => pp.total_500m_2024));
        return (
          <div style={{ ...S.card, padding: 16 }}>
            <div style={{ color: '#aaa', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
              Comparativa · 6 proyectos más cercanos · Radio 500m
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {cercanos.map(([pid, pp], idx) => {
                const isThis = pp.nombre === d.nombre;
                const col = PROJ_COLORS[idx % PROJ_COLORS.length];
                const shortName = pp.nombre
                  .replace(' - SAN MIGUEL','').replace(' - SURQUILLO','')
                  .replace(' - JESÚS MARÍA','').replace(' | ',' / ');
                const barW = Math.round((pp.total_500m_2024 / maxTotalLocal) * 100);
                // Distancia en metros aprox
                const pRef = PROYECTOS.find(p => String(p.id) === pid);
                const km = pRef ? Math.round(Math.sqrt(Math.pow((pRef.lat - thisProy.lat)*111,2) + Math.pow((pRef.lng - thisProy.lng)*111,2)) * 10) / 10 : null;
                return (
                  <div key={pid} style={{
                    background: isThis ? `${col}22` : '#ffffff06',
                    border: `1px solid ${isThis ? col : '#ffffff10'}`,
                    borderRadius: 10, padding: '10px 12px',
                    boxShadow: isThis ? `0 0 12px ${col}40` : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ background: col, color: '#000', fontWeight: 900, fontSize: 8, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {idx+1}
                      </span>
                      <span style={{ color: isThis ? '#fff' : '#aaa', fontSize: 9, fontWeight: isThis ? 700 : 400, lineHeight: 1.2 }}>
                        {shortName}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 5 }}>
                      <span style={{ color: col, fontWeight: 900, fontSize: 20, lineHeight: 1 }}>{pp.score_seguridad}</span>
                      <span style={{ color: '#bbb', fontSize: 8 }}>/100</span>
                    </div>
                    <div style={{ height: 3, background: '#ffffff08', borderRadius: 2, marginBottom: 4 }}>
                      <div style={{ height: '100%', width: `${barW}%`, background: col, borderRadius: 2, opacity: 0.7 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#ccc', fontSize: 8 }}>{pp.total_500m_2024} denuncias</span>
                      {!isThis && km !== null && <span style={{ color: '#bbb', fontSize: 8 }}>{km} km</span>}
                      {isThis && <span style={{ color: col, fontSize: 8, fontWeight: 700 }}>este predio</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 12, fontSize: 9, color: '#ccc', lineHeight: 1.5 }}>
              ⚠️ Score pondera 60% volumen total y 40% delitos violentos · Fuente: INEI DataCrim 2024
            </div>
          </div>
        );
      })()}

      <div style={{ fontSize: 9, color: '#ccc', lineHeight: 1.6 }}>
        📊 Fuente: INEI DataCrim · API ArcGIS · Modalidad de Delitos 2024
      </div>
    </div>
  );
}


// ─── MI PROPIEDAD PANEL ──────────────────────────────────────────────────────
function MiPropiedadPanel({ proyectos }) {
  // ── Hooks siempre primero, sin returns condicionales antes ──
  const [dormSel, setDormSel] = useState(1);
  const [areaSel, setAreaSel] = useState(null);

  const p0 = proyectos?.[0];
  if (!p0) return null;

  const distSlug = Object.keys(DISTRITOS_SEO || {}).find(k =>
    (DISTRITOS_SEO[k]?.nombre || '').toLowerCase() === (p0.distrito || '').toLowerCase()
  );
  const distData  = DISTRITOS_SEO?.[distSlug] || {};
  const pm2Dist   = BCRP_DATA.precio_m2[p0.distrito]    || 6500;
  const yld       = BCRP_DATA.yield_alquiler[p0.distrito] || 5.5;
  const pm2Alq    = Math.round(pm2Dist * yld / 100 / 12);
  const modelos   = p0.modelos || [];
  const dormGrupos = [...new Set(modelos.map(m => m.dormitorios))].sort();
  // Sincronizar dormSel al primer grupo disponible si aún es el default
  const dormActual = dormGrupos.includes(dormSel) ? dormSel : (dormGrupos[0] || 1);

  const modelosSel = modelos.filter(m => m.dormitorios === dormActual);
  const areaMedia  = modelosSel.length > 0
    ? Math.round(modelosSel.reduce((s, m) => s + m.area, 0) / modelosSel.length) : 60;
  const areaFinal  = areaSel || areaMedia;

  // KPIs calculadora
  const alqMes   = Math.round(pm2Alq * areaFinal);
  const precioRef = modelosSel.length > 0
    ? Math.round(modelosSel.find(m => m.area === areaFinal)?.precio
        || modelosSel.reduce((s, m) => s + m.precio, 0) / modelosSel.length)
    : pm2Dist * areaFinal;
  const añosRec  = precioRef > 0 ? Math.round(precioRef / (alqMes * 12)) : Math.round(100 / yld);
  const rentNeta = precioRef > 0 ? ((alqMes * 12 / precioRef) * 100).toFixed(1) : yld.toFixed(1);

  // Data gráfico scatter: área vs alquiler estimado para todas las tipologías del grupo
  const chartData = modelosSel.map(m => ({
    nombre: m.nombre,
    area:   m.area,
    alq:    Math.round(pm2Alq * m.area),
    precio: Math.round(m.precio / 1000),
  }));

  // Colores entorno
  const entorno = [
    { icon: '🚌', label: 'Transporte',        items: distData.transporte          || [] },
    { icon: '🏫', label: 'Colegios cercanos',  items: distData.colegios_cercanos   || [] },
    { icon: '🏥', label: 'Salud',              items: distData.hospitales_cercanos || [] },
    { icon: '🛡️', label: 'Seguridad',          items: [
      `Índice ${distData.indice_seguridad || '—'}/100 · ${distData.nivel_seguridad || '—'}`,
      `${distData.delitos_mes || '—'} delitos/mes`,
      `Patrullaje: ${distData.patrullaje || '—'}`,
    ]},
  ];

  return (
    <>
      {/* ── Calculadora ── */}
      <div style={{ marginBottom: 18, background: '#1e1e1e', border: `1.5px solid ${C.teal}45`,
                    borderRadius: 14, padding: '14px 14px 12px' }}>
        <div style={{ color: C.teal, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: 1, marginBottom: 6 }}>💰 Calculadora de alquiler</div>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 900, marginBottom: 12 }}>
          {p0.nombre}
        </div>

        {/* Selector dormitorios */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {dormGrupos.map(d => (
            <button key={d} onClick={() => { setDormSel(d); setAreaSel(null); }}
              style={{ background: dormActual === d ? C.teal + '25' : '#ffffff08',
                       border: `1px solid ${dormActual === d ? C.teal : '#ffffff20'}`,
                       borderRadius: 8, padding: '5px 14px', cursor: 'pointer',
                       fontFamily: 'inherit', color: dormActual === d ? C.teal : '#ccc',
                       fontWeight: 700, fontSize: 11 }}>
              {d} dorm
            </button>
          ))}
        </div>

        {/* Chips tipología */}
        <div style={{ color: '#ccc', fontSize: 10, marginBottom: 6 }}>
          Selecciona la tipología para ver su alquiler estimado:
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {modelosSel.map(m => (
            <button key={m.nombre} onClick={() => setAreaSel(m.area === areaSel ? null : m.area)}
              style={{ background: areaFinal === m.area ? C.yellow + '22' : '#ffffff06',
                       border: `1.5px solid ${areaFinal === m.area ? C.yellow : '#ffffff18'}`,
                       borderRadius: 10, padding: '7px 12px', cursor: 'pointer',
                       fontFamily: 'inherit', textAlign: 'center', minWidth: 70 }}>
              <div style={{ color: areaFinal === m.area ? C.yellow : '#fff', fontWeight: 800, fontSize: 13 }}>{m.area} m²</div>
              <div style={{ color: '#ccc', fontSize: 8, marginTop: 1 }}>{m.nombre}</div>
              <div style={{ color: '#bbb', fontSize: 8 }}>S/ {(m.precio/1000).toFixed(0)}k</div>
            </button>
          ))}
        </div>

        {/* KPIs resultado */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>

          {/* Card 1: Alquiler estimado — "al mes" alineado baseline con el monto */}
          <div style={{ background: '#ffffff09', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ color: '#ccc', fontSize: 8, textTransform: 'uppercase',
                          letterSpacing: 0.3, marginBottom: 4 }}>Alquiler est.</div>
            <div style={{ color: C.teal, fontSize: 16, fontWeight: 900, lineHeight: 1 }}>
              S/ {alqMes.toLocaleString()}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 4 }}>
              <span style={{ color: C.teal, fontSize: 9, fontWeight: 600, opacity: 0.85 }}>al mes</span>
              <span style={{ color: '#555', fontSize: 9 }}>·</span>
              <span style={{ color: '#bbb', fontSize: 8 }}>{areaFinal} m²</span>
            </div>
          </div>

          {/* Cards 2 y 3: genéricos */}
          {[
            { label: 'Yield bruto', valor: `${rentNeta}%`,      sub: 'retorno anual', color: C.yellow },
            { label: 'Recupero',    valor: `~${añosRec} años`,  sub: 'vía alquiler',  color: '#ddd'   },
          ].map(k => (
            <div key={k.label} style={{ background: '#ffffff09', borderRadius: 10,
                                        padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ color: '#ccc', fontSize: 8, textTransform: 'uppercase',
                            letterSpacing: 0.3, marginBottom: 3 }}>{k.label}</div>
              <div style={{ color: k.color, fontSize: 15, fontWeight: 900,
                            lineHeight: 1.1 }}>{k.valor}</div>
              <div style={{ color: '#bbb', fontSize: 8, marginTop: 3 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Nota metodológica */}
        <div style={{ background: '#ffffff08', borderRadius: 8, padding: '8px 12px',
                      fontSize: 9, color: '#ccc', lineHeight: 1.6, marginTop: 2 }}>
          💡 Calculado con precio/m² alquiler de <strong style={{color:'#fff'}}>{p0.distrito}</strong> · S/ {pm2Alq}/m²/mes
          · yield {yld}% bruto · Urbania jun-2025. Varía según piso y orientación.
        </div>
      </div>

      {/* ── Gráfico: área vs alquiler mensual por tipología ── */}
      {chartData.length > 1 && (
        <div style={{ marginBottom: 18, background: '#1a1a1a', border: '1px solid #ffffff18',
                      borderRadius: 14, padding: '12px 14px' }}>
          <div style={{ marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #ffffff18' }}>
            <div style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>
              Alquiler estimado por tipología disponible
            </div>
            <div style={{ color: '#ccc', fontSize: 9, marginTop: 1 }}>
              Según área de cada flat · yield {yld}% · {p0.distrito}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={Math.min(chartData.length * 28 + 36, 220)}>
            <BarChart layout="vertical" data={chartData}
              margin={{ top: 0, right: 60, bottom: 0, left: -4 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="nombre"
                tick={{ fill: '#ccc', fontSize: 9 }} width={58} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: `1px solid ${C.teal}50`,
                                borderRadius: 8, fontSize: 10 }}
              labelStyle={{ color: '#fff', fontWeight: 700 }}
              itemStyle={{ color: C.yellow }}
                formatter={(v, name) => name === 'alq'
                  ? [`S/ ${v.toLocaleString()}/mes`, 'Alquiler est.']
                  : [`S/ ${(v*1000).toLocaleString()}`, 'Precio compra']}
              />
              <Bar dataKey="alq" fill={C.teal} radius={[0,4,4,0]}
                label={{ position: 'right', fill: '#ddd', fontSize: 8,
                         formatter: v => `S/ ${v.toLocaleString()}/mes` }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Factores de plusvalía a 500m ── */}
      <div style={{ marginBottom: 18, background: '#1a1a1a', border: '1px solid #ffffff18',
                    borderRadius: 14, padding: '12px 14px' }}>
        <div style={{ color: '#fff', fontSize: 12, fontWeight: 800, marginBottom: 3 }}>🏙️ Factores de plusvalía a 500m</div>
        <div style={{ color: '#ccc', fontSize: 9, marginBottom: 10 }}>Qué hay cerca que impacta el valor de tu propiedad</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10, overflow: 'hidden' }}>
          {[
            { icon: '🚇', label: 'Transporte masivo',   impacto: '+3–8%',  detalle: distData.transporte?.slice(0,2).join(', ')          || 'Av. principales y corredores',  color: '#22c55e' },
            { icon: '🏫', label: 'Colegios y universidades', impacto: '+2–5%', detalle: distData.colegios_cercanos?.slice(0,2).join(', ')|| 'Zona educativa consolidada',    color: C.yellow  },
            { icon: '🏥', label: 'Centros de salud',    impacto: '+1–4%',  detalle: distData.hospitales_cercanos?.slice(0,1).join(', ') || 'Clínicas y EsSalud cercanos',   color: '#3b82f6' },
            { icon: '🛍️', label: 'Comercio y servicios', impacto: '+2–6%', detalle: 'Supermercados, bancos y gastronomía',                                                  color: '#ec4899' },
            { icon: '🌳', label: 'Parques y áreas verdes', impacto: '+1–3%', detalle: 'Espacios de recreación urbana',                                                       color: '#22c55e' },
            { icon: '🏗️', label: 'Inversión pública',   impacto: '+4–10%', detalle: `PBI Construcción Lima +${BCRP_DATA.macro.pbi_construccion_2025}% · 2025`,             color: C.teal    },
          ].map(f => (
            <div key={f.label} style={{ background: '#ffffff10', borderRadius: 10, padding: '8px 8px', display: 'flex', gap: 6, alignItems: 'flex-start', minWidth: 0, overflow: 'hidden' }}>
              <span style={{ fontSize: 14, lineHeight: 1.2, flexShrink: 0 }}>{f.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontSize: 9, fontWeight: 800, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.label}</div>
                <div style={{ color: '#ccc', fontSize: 8, marginTop: 1, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.detalle}</div>
                <div style={{ color: f.color, fontSize: 9, fontWeight: 700, marginTop: 3 }}>{f.impacto} en valor</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: C.teal + '10', border: `1px solid ${C.teal}30`, borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: C.teal, fontSize: 11, fontWeight: 800 }}>Impacto acumulado estimado</div>
            <div style={{ color: '#ccc', fontSize: 9, marginTop: 1 }}>suma de factores de ubicación sobre el precio/m²</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 900 }}>+S/ {Math.round(pm2Dist * 0.12).toLocaleString()}/m²</div>
            <div style={{ color: '#ccc', fontSize: 8 }}>sobre precio base del distrito</div>
          </div>
        </div>
      </div>

      {/* ── Entorno 500m ── */}
      <div style={{ background: '#1a1a1a', border: '1px solid #ffffff18',
                    borderRadius: 14, padding: '12px 14px' }}>
        <div style={{ color: '#fff', fontSize: 12, fontWeight: 800, marginBottom: 10 }}>
          📍 Entorno a 500m — {p0.distrito}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {entorno.map(sec => (
            <div key={sec.label}
              style={{ background: '#ffffff12', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ color: '#fff', fontSize: 10, fontWeight: 800,
                            marginBottom: 6 }}>{sec.icon} {sec.label}</div>
              {sec.items.slice(0, 3).map(item => (
                <div key={item}
                  style={{ color: '#ccc', fontSize: 9, lineHeight: 1.8,
                           display: 'flex', gap: 5, alignItems: 'flex-start' }}>
                  <span style={{ color: C.teal, flexShrink: 0 }}>·</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* Plusvalía link */}
        <div style={{ marginTop: 10, background: C.teal + '10',
                      border: `1px solid ${C.teal}30`, borderRadius: 10,
                      padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>📈</span>
          <div>
            <div style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>
              Proyección plusvalía 3 años en {p0.distrito}
            </div>
            <div style={{ color: C.teal, fontSize: 18, fontWeight: 900, lineHeight: 1.1 }}>
              {BCRP_DATA.proyeccion_3y[p0.distrito] || '—'}
            </div>
            <div style={{ color: '#ccc', fontSize: 9, marginTop: 1 }}>
              {distData.descripcion ? distData.descripcion.slice(0, 100) + '…' : ''}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── BCRP PANEL ──────────────────────────────────────────────────────────────
function BCRPPanel({ proyectos }) {
  const [tab, setTab] = useState('distrito');
  const isMobile = useIsMobile();
  const distritos = [...new Set(proyectos.map(p => p.distrito))];
  const allDistritos = BCRP_DATA.ranking_plusvalia;
  const colors = [C.teal, C.yellow, '#3b82f6', '#22c55e', '#f59e0b', '#ec4899'];
  const m = BCRP_DATA.macro;

  // Resaltar distritos del proyecto
  const isPropio = (d) => distritos.includes(d);

  const tabStyle = (t) => ({
    padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
    background: tab === t ? C.yellow : '#ffffff0D',
    color: tab === t ? '#000' : '#aaa',
    border: `1px solid ${tab === t ? C.yellow : '#ffffff22'}`,
    boxShadow: tab === t ? `0 2px 10px ${C.yellow}50` : 'none',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  });

  return (
    <div style={{ ...S.card, padding: 20 }}>
      {/* Header */}
      <div style={{ color: C.teal, fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 2 }}>BCRP · BANCO CENTRAL DE RESERVA DEL PERÚ</div>
      <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Plusvalía & Rentabilidad — Lima Metropolitana</div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['distrito','📍 Mi Distrito'],['propiedad','🏠 Mi Propiedad'],['comparativa','🔍 Compara Distritos'],['oportunidad','💡 Oportunidad']].map(([t,l]) => (
          <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {/* ── TAB: DISTRITO ── */}
      {tab === 'distrito' && (
        <>
          {distritos.map((d, i) => {
            const yoy  = BCRP_DATA.variacion_yoy[d] || 0;
            const yld  = BCRP_DATA.yield_alquiler[d] || 0;
            const pm2  = BCRP_DATA.precio_m2[d] || 0;
            const proj = BCRP_DATA.proyeccion_3y[d] || 'N/D';
            const alqMes = BCRP_DATA.alquiler_mensual[d] || 0;
            const años = Math.round(100 / yld);
            const pm2alq = Math.round(pm2 * yld / 100 / 12);
            return (
              <div key={d} style={{ background: C.teal + '14', border: `1px solid ${C.teal}55`, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
                {/* Encabezado */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ color: '#fff', fontSize: 16, fontWeight: 900 }}>{d}</div>
                    <div style={{ color: '#ccc', fontSize: 10, marginTop: 1 }}>Mercado inmobiliario residencial</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: C.teal, fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{proj}</div>
                    <div style={{ color: '#ccc', fontSize: 9 }}>plusvalía 3 años</div>
                  </div>
                </div>
                {/* 4 KPIs horizontales */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}>
                  {[
                    { label: 'Precio m²',     valor: `S/ ${pm2.toLocaleString()}`,  sub: yoy >= 0 ? `▲ +${yoy}% este año` : `▼ ${yoy}% este año`, subColor: yoy >= 0 ? '#22c55e' : '#ef4444' },
                    { label: 'Yield bruto',   valor: `${yld}%`,                     sub: 'retorno anual alquiler',                                  subColor: C.yellow },
                    { label: 'Alquiler/m²',   valor: `S/ ${pm2alq}`,                sub: 'por m² al mes',                                          subColor: '#ccc' },
                    { label: 'Recupero inv.', valor: `~${años} años`,               sub: 'solo por alquiler',                                      subColor: '#ccc' },
                  ].map(k => (
                    <div key={k.label} style={{ background: '#ffffff12', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ color: '#ccc', fontSize: 8, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.3 }}>{k.label}</div>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 900, lineHeight: 1.1 }}>{k.valor}</div>
                      <div style={{ color: k.subColor, fontSize: 8, marginTop: 3 }}>{k.sub}</div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
          {/* Gráfico histórico */}
          <div style={{ marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid #ffffff12` }}>
            <div style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>Evolución histórica del precio m²</div>
            <div style={{ color: '#ccc', fontSize: 9, marginTop: 1 }}>variación % anual real · soles constantes 2009 · BCRP</div>
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 190 : 130}>
            <AreaChart data={BCRP_DATA.historico} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="año" tick={{ fill: '#bbb', fontSize: 10 }} />
              <YAxis tick={{ fill: '#bbb', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: `1px solid ${C.teal}50`, borderRadius: 8, fontSize: 11 }} labelStyle={{ color: '#fff', fontWeight: 700 }} itemStyle={{ color: '#ddd' }} formatter={(v, name) => [`${v}%`, name]} />
              {distritos.map((d, i) => (
                <Area key={d} type="monotone" dataKey={d} stroke={colors[i % colors.length]} fill={colors[i % colors.length] + '20'} strokeWidth={2} dot={false} />
              ))}
            </AreaChart>
          </ResponsiveContainer>

          {/* ── Gráfico 2: Precio m² vs Yield (scatter) ── */}
          {(() => {
            const sd = BCRP_DATA.ranking_plusvalia.map(d => ({
              nombre: d, pm2: BCRP_DATA.precio_m2[d] || 0,
              yield: BCRP_DATA.yield_alquiler[d] || 0, propio: distritos.includes(d),
            }));
            return (
              <>
                <div style={{ marginTop: 20, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #ffffff12' }}>
                  <div style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>Precio m² vs Rentabilidad — Lima Moderna</div>
                  <div style={{ color: '#ccc', fontSize: 9, marginTop: 1 }}>Arriba-izquierda = más rentable y accesible · Urbania 2025 <span style={{color:C.teal}}>● Tu zona</span></div>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="pm2" name="Precio m²" type="number" domain={[4500,8500]}
                      tick={{ fill: '#bbb', fontSize: 9 }} tickFormatter={v => `S/${(v/1000).toFixed(1)}k`} label={{ value: 'Precio m²', position: 'insideBottom', fill: '#bbb', fontSize: 8, offset: -2 }} />
                    <YAxis dataKey="yield" name="Yield" type="number" domain={[4,8]}
                      tick={{ fill: '#bbb', fontSize: 9 }} tickFormatter={v => `${v}%`} />
                    <Tooltip
                      contentStyle={{ background: '#1a1a1a', border: `1px solid ${C.teal}60`, borderRadius: 8, fontSize: 10 }}
                      labelStyle={{ color: '#fff', fontWeight: 800, fontSize: 11 }}
                      itemStyle={{ color: '#ddd' }}
                      formatter={(v, name) => [name === 'Precio m²' ? `S/ ${v.toLocaleString()}` : `${v}%`, name]}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.nombre || ''}
                    />
                    <Scatter data={sd.filter(d => !d.propio)} fill={C.teal + '55'} r={5} />
                    <Scatter data={sd.filter(d => d.propio)} fill={C.teal} r={8} />
                  </ScatterChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {sd.map(d => (
                    <div key={d.nombre} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: d.propio ? 9 : 7, height: d.propio ? 9 : 7, borderRadius: '50%',
                        background: d.propio ? C.teal : C.teal + '55' }} />
                      <span style={{ color: d.propio ? '#fff' : '#bbb', fontSize: 8, fontWeight: d.propio ? 800 : 400 }}>{d.nombre}</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}

          {/* ── Gráfico 3: Proyección plusvalía 3 años por distrito ── */}
          {(() => {
            const barData = [...BCRP_DATA.ranking_plusvalia]
              .map(d => ({
                nombre: d,
                proy: parseInt((BCRP_DATA.proyeccion_3y[d] || '0').replace(/[^0-9]/g,'')),
                propio: distritos.includes(d),
              }))
              .sort((a,b) => b.proy - a.proy);
            return (
              <>
                <div style={{ marginTop: 20, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #ffffff12' }}>
                  <div style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>Proyección plusvalía 3 años por distrito</div>
                  <div style={{ color: '#ccc', fontSize: 9, marginTop: 1 }}>Estimación BCRP/ASEI 2025 · % acumulado</div>
                </div>
                <ResponsiveContainer width="100%" height={barData.length * 30 + 20}>
                  <BarChart layout="vertical" data={barData} margin={{ top: 0, right: 52, bottom: 0, left: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="nombre" tick={{ fill: '#ccc', fontSize: 9 }} width={90} />
                    <Tooltip
                      contentStyle={{ background: '#1a1a1a', border: `1px solid ${C.teal}60`, borderRadius: 8, fontSize: 10 }}
                      labelStyle={{ color: '#fff', fontWeight: 800 }}
                      itemStyle={{ color: C.yellow }}
                      formatter={v => [`+${v}%`, 'Plusvalía 3 años']}
                    />
                    <Bar dataKey="proy" radius={[0,4,4,0]}
                      label={{ position: 'right', fill: '#ddd', fontSize: 9, formatter: v => `+${v}%` }}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.propio ? C.teal : C.teal + '50'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            );
          })()}
        </>
      )}


      {/* ── TAB: MI PROPIEDAD ── */}
      {tab === 'propiedad' && <MiPropiedadPanel proyectos={proyectos} />}

      {/* ── TAB: COMPARA DISTRITOS ── */}
      {tab === 'comparativa' && (
        <>
          <div style={{ color: '#ddd', fontSize: 11, marginBottom: 10 }}>Ranking por precio m² · de mayor a menor — Lima Moderna · Urbania/BCRP 2025</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {allDistritos.map((d, i) => {
              const pm2 = BCRP_DATA.precio_m2[d] || 0;
              const yoy = BCRP_DATA.variacion_yoy[d] || 0;
              const maxPm2 = 8000;
              const pct = Math.min(pm2 / maxPm2 * 100, 100);
              const propio = isPropio(d);
              return (
                <div key={d} style={{ background: propio ? C.teal + '0d' : '#ffffff05', border: `1px solid ${propio ? C.teal + '50' : '#ffffff10'}`, borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {propio && <span style={{ background: C.teal, color: '#000', fontSize: 8, fontWeight: 800, padding: '1px 5px', borderRadius: 4 }}>TU ZONA</span>}
                      <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{d}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ color: '#ccc', fontSize: 12, fontWeight: 700 }}>S/ {pm2.toLocaleString()}/m²</span>
                      <span style={{ color: yoy >= 0 ? '#22c55e' : '#ef4444', fontSize: 11, fontWeight: 700, minWidth: 42, textAlign: 'right' }}>{yoy >= 0 ? '▲' : '▼'} {Math.abs(yoy)}%</span>
                    </div>
                  </div>
                  <div style={{ background: '#ffffff10', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: propio ? C.teal : colors[i % colors.length], borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ color: '#bbb', fontSize: 9 }}>Yield: <span style={{ color: C.yellow }}>{BCRP_DATA.yield_alquiler[d]}%</span></span>
                    <span style={{ color: '#bbb', fontSize: 9 }}>Proy. 3a: <span style={{ color: C.teal }}>{BCRP_DATA.proyeccion_3y[d]}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}


      {/* ── TAB: CONTEXTO (yield + macro fusionados) ── */}
      {tab === 'oportunidad' && (() => {
        // Datos del distrito del proyecto
        const d0     = distritos[0] || allDistritos[0];
        const yoy0   = BCRP_DATA.variacion_yoy[d0]  || 0;
        const yield0 = BCRP_DATA.yield_alquiler[d0] || 0;
        const proj0  = BCRP_DATA.proyeccion_3y[d0]  || '+0%';
        const proj0n = parseInt(proj0.replace('%','').replace('+',''));

        // Alquiler estimado por propiedad: precio_promedio × yield_distrito / 12
        const alqEst = proyectos.map(p => {
          const pm2Dist = BCRP_DATA.precio_m2[p.distrito] || BCRP_DATA.precio_m2[d0] || 6500;
          const pm2AlqDist = Math.round(pm2Dist * (BCRP_DATA.yield_alquiler[p.distrito] || yield0) / 100 / 12);
          const areaMin = p.area_desde || 50;
          const areaMid = p.area_hasta ? Math.round((p.area_desde + p.area_hasta) / 2) : p.area_desde;
          const alqMin = pm2AlqDist * areaMin;
          const alqMid = pm2AlqDist * areaMid;
          return { nombre: p.nombre, alqMin, alqMid, areaMin, areaMid, pm2AlqDist, distrito: p.distrito };
        });

        const signals = [
          {
            label: 'Precio m² en tu zona',
            icon: '🏠',
            valor: `${yoy0 >= 0 ? '+' : ''}${yoy0}% este año`,
            detalle: yoy0 >= 2 ? 'Sube más que el promedio Lima' : yoy0 >= 0 ? 'Precio estable, bajo riesgo' : 'Leve corrección en curso',
            dot: yoy0 >= 2 ? '🟢' : yoy0 >= 0 ? '🟡' : '🔴',
            color: yoy0 >= 2 ? '#22c55e' : yoy0 >= 0 ? C.yellow : '#ef4444',
          },
          {
            label: 'Si lo alquilas',
            icon: '🔑',
            valor: `${yield0}% bruto/año`,
            detalle: (() => {
              const pm2v = BCRP_DATA.precio_m2[d0] || 6500;
              const pm2a = Math.round(pm2v * yield0 / 100 / 12);
              const años = Math.round(100 / yield0);
              const lines = alqEst.length > 0
                ? alqEst.map(a => {
                    const rango = a.areaMin === a.areaMid
                      ? `S/ ${a.alqMin.toLocaleString()}/mes (${a.areaMin} m²)`
                      : `S/ ${a.alqMin.toLocaleString()}–${a.alqMid.toLocaleString()}/mes (${a.areaMin}–${a.areaMid} m²)`;
                    return `🏠 Proyecto ${a.nombre}: ${rango}`;
                  })
                : [`🏠 Estimado: S/ ${Math.round(pm2v * 60 * yield0 / 100 / 12).toLocaleString()}/mes (60 m²)`];
              return lines.join('\n') + `\n💡 Costo/m² venta S/ ${pm2v.toLocaleString()} · alquiler S/ ${pm2a}/m²/mes\n⏱ Recuperas tu inversión en ~${años} años`;
            })(),
            multiline: true,
            dot: yield0 >= 5.5 ? '🟢' : yield0 >= 4.5 ? '🟡' : '🔴',
            color: yield0 >= 5.5 ? '#22c55e' : yield0 >= 4.5 ? C.yellow : '#ef4444',
          },
          {
            label: 'Plusvalía proyectada · 3 años',
            icon: '📈',
            valor: proj0,
            detalle: proj0n >= 20 ? 'Alto potencial de revalorización' : proj0n >= 12 ? 'Crecimiento moderado proyectado' : 'Zona consolidada, upside moderado',
            dot: proj0n >= 20 ? '🟢' : proj0n >= 12 ? '🟡' : '🔴',
            color: proj0n >= 20 ? '#22c55e' : proj0n >= 12 ? C.yellow : '#ef4444',
          },
          {
            label: 'Momento del mercado',
            icon: '📊',
            valor: `Tasa BCRP ${m.tasa_referencia_bcrp}%`,
            detalle: `Construcción +${m.pbi_construccion_2025}% en 2025 · Tasas bajando → crédito más accesible`,
            dot: '🟢',
            color: '#22c55e',
          },
        ];

        const verdes = signals.filter(s => s.dot === '🟢').length;
        const dictamen = verdes >= 3
          ? { texto: 'Buena oportunidad de compra', color: '#22c55e', bg: '#22c55e12', borde: '#22c55e35', emoji: '🟢' }
          : verdes === 2
          ? { texto: 'Oportunidad a evaluar', color: C.yellow, bg: C.yellow + '12', borde: C.yellow + '40', emoji: '🟡' }
          : { texto: 'Hay señales de cautela', color: '#ef4444', bg: '#ef444412', borde: '#ef444435', emoji: '🔴' };

        return (
          <>
            {/* Semáforo */}
            <div style={{ background: dictamen.bg, border: `1px solid ${dictamen.borde}`, borderRadius: 12, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 26 }}>{dictamen.emoji}</span>
              <div>
                <div style={{ color: dictamen.color, fontWeight: 900, fontSize: 14 }}>{dictamen.texto}</div>
                <div style={{ color: '#ccc', fontSize: 10, marginTop: 1 }}>{verdes} de 4 señales positivas · <strong style={{ color: '#fff' }}>{d0}</strong></div>
              </div>
            </div>

            {/* 4 señales en 2 columnas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {signals.map(s => (
                <div key={s.label} style={{ background: '#ffffff06', border: `1px solid ${s.color}22`, borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <span style={{ fontSize: 12 }}>{s.dot}</span>
                    <span style={{ color: '#ccc', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>{s.label}</span>
                  </div>
                  <div style={{ color: s.color, fontSize: 14, fontWeight: 900, lineHeight: 1.1, marginBottom: 4 }}>{s.valor}</div>
                  <div style={{ color: '#ddd', fontSize: 9, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{s.detalle}</div>
                </div>
              ))}
            </div>

            {/* Gráfico: evolución histórica precio m² en el distrito */}
            <div style={{ marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid #ffffff12` }}>
              <div style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>
                📈 Cómo ha subido el precio m² en {d0}
              </div>
              <div style={{ color: '#ccc', fontSize: 9, marginTop: 2 }}>variación % anual · soles constantes · Fuente: BCRP/Urbania</div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={BCRP_DATA.historico} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="gradOp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.teal} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={C.teal} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="año" tick={{ fill: '#bbb', fontSize: 9 }} />
                <YAxis tick={{ fill: '#bbb', fontSize: 9 }} tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: `1px solid ${C.teal}50`, borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#fff', fontWeight: 700 }}
                  itemStyle={{ color: C.teal }}
                  formatter={v => [`${v}%`, 'Var. precio m²']}
                />
                <ReferenceLine y={0} stroke="#ffffff20" />
                <Area type="monotone" dataKey={d0} stroke={C.teal} fill="url(#gradOp)" strokeWidth={2} dot={{ fill: C.teal, r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </>
        );
      })()}

      <div style={{ color: '#bbb', fontSize: 9, marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>{BCRP_DATA.fuente}</div>
    </div>
  );
}

// ─── SIMULADOR ────────────────────────────────────────────────────────────────
function SimuladorCredito({ proyectos }) {
  const [años, setAños] = useState(20);
  const [cuotaInit, setCuotaInit] = useState(10);
  const [bancoIdx, setBancoIdx] = useState(0); // por defecto el más barato
  const tasaSeleccionada = TASAS_SBS[bancoIdx];
  return (
    <div style={{ ...S.card, padding: 20 }}>
      <div style={{ color: C.teal, fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>SBS · TASAS REALES</div>
      <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Simulador de Crédito Hipotecario</div>

      {/* Selector de banco */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: '#ddd', fontSize: 11, marginBottom: 8 }}>Banco / entidad financiera:</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TASAS_SBS.map((t, i) => (
            <button key={t.banco} onClick={() => setBancoIdx(i)}
              style={{ background: bancoIdx === i ? C.teal + '25' : '#ffffff08', border: `1px solid ${bancoIdx === i ? C.teal : C.border}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', transition: 'all 0.15s' }}>
              <div style={{ color: bancoIdx === i ? C.teal : '#aaa', fontWeight: 900, fontSize: 14 }}>{t.tasa}%</div>
              <div style={{ color: bancoIdx === i ? C.teal : '#ccc', fontSize: 9 }}>{t.banco}</div>
              {i === 0 && <div style={{ color: C.green, fontSize: 8, fontWeight: 700 }}>MEJOR TASA</div>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ color: '#ddd', fontSize: 11, marginBottom: 6 }}>Plazo: <strong style={{ color: '#fff' }}>{años} años</strong></div>
          <input type="range" min="10" max="30" value={años} onChange={e => setAños(+e.target.value)}
            style={{ width: '100%', accentColor: C.teal }} />
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ color: '#ddd', fontSize: 11, marginBottom: 6 }}>Cuota inicial: <strong style={{ color: '#fff' }}>{cuotaInit}%</strong></div>
          <input type="range" min="5" max="40" value={cuotaInit} onChange={e => setCuotaInit(+e.target.value)}
            style={{ width: '100%', accentColor: C.yellow }} />
        </div>
      </div>
      {proyectos.slice(0, 3).map(p => {
        const tasa = tasaSeleccionada.tasa;
        const r = tasa / 100 / 12, n = años * 12;
        const monto = p.precio_desde * (1 - cuotaInit / 100);
        const c = Math.round(monto * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
        return (
          <div key={p.id} style={{ background: '#ffffff05', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{p.nombre}</div>
                <div style={{ color: '#ddd', fontSize: 11 }}>{p.distrito} · {p.etapa}</div>
                <div style={{ color: '#bbb', fontSize: 10, marginTop: 2 }}>
                  Precio: S/ {p.precio_desde.toLocaleString()} · Inicial: S/ {Math.round(p.precio_desde * cuotaInit / 100).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                <div style={{ color: C.teal, fontWeight: 900, fontSize: 20 }}>S/ {c.toLocaleString()}</div>
                <div style={{ color: '#ddd', fontSize: 10 }}>/mes · {tasaSeleccionada.banco}</div>
                <div style={{ color: '#bbb', fontSize: 10 }}>{tasa}% · {años} años</div>
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ color: '#ddd', fontSize: 10, marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>Fuente: SBS Perú · sbs.gob.pe</div>
    </div>
  );
}

// ─── PROPERTY CARD ────────────────────────────────────────────────────────────
function PropertyCard({ p, score, onSelect, isSelected, onDetail, onMapHighlight }) {
  const [hov, setHov] = useState(false);
  const [hovDetail, setHovDetail] = useState(false);
  const ec = etapaColor[p.etapa];
  return (
    <div
      onClick={() => onDetail(p)}
      onMouseEnter={() => { setHov(true); onMapHighlight(p.id); }}
      onMouseLeave={() => { setHov(false); onMapHighlight(null); }}
      style={{ ...S.card, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s', transform: hov ? 'translateY(-3px)' : 'none', borderColor: isSelected ? C.yellow : hov ? C.teal + '44' : C.border, borderWidth: '1px', borderStyle: 'solid', borderRadius: 16, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', height: 160, overflow: 'hidden', background: p.imagen_color }}>
        <img src={p.imagen} alt={p.nombre}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,#00000077 25%,transparent 100%)' }} />
        <span style={{ position: 'absolute', top: 10, left: 10, background: ec + 'ee', color: '#000', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 20 }}>{p.etapa}</span>
        {score && (
          <span style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444ee', color: '#fff', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 900 }}>
            {score}% match
          </span>
        )}
        <div style={{ position: 'absolute', bottom: 8, left: 10 }}>
          <div style={{ color: '#ffffff88', fontSize: 9 }}>Desde</div>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(14px, 2vw, 20px)' }}>S/ {p.precio_desde.toLocaleString()}</div>
        </div>
      </div>
      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 900, color: '#fff', fontSize: 'clamp(12px, 1.2vw, 15px)', marginBottom: 2 }}>{p.nombre}</div>
        <div style={{ color: '#ddd', fontSize: 'clamp(10px, 1vw, 12px)', marginBottom: 8 }}>📍 {p.direccion}</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{ ...S.tag('#aaa'), fontSize: 'clamp(9px, 0.9vw, 11px)', padding: '2px 6px' }}>🛏 {p.dormitorios.join(',')}d</span>
          <span style={{ ...S.tag('#aaa'), fontSize: 'clamp(9px, 0.9vw, 11px)', padding: '2px 6px' }}>📐 {p.area_desde}–{p.area_hasta}m²</span>
          <span style={{ ...S.tag('#aaa'), fontSize: 'clamp(9px, 0.9vw, 11px)', padding: '2px 6px' }}>🏦 {p.banco_sponsor}</span>
        </div>
        {[
          ['📍 Ubic.', p.scores.ubicacion, C.teal],
          ['🛡️ Seg.', p.scores.seguridad, C.green],
          ['🏠 Acab.', p.scores.acabados, C.yellow],
          ['🏢 Amen.', p.scores.amenities, '#8b5cf6'],
        ].map(([l, v, c]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ color: '#ddd', fontSize: 9, width: 46, flexShrink: 0 }}>{l}</span>
            <div style={{ flex: 1, background: '#ffffff0a', borderRadius: 3, height: 4 }}>
              <div style={{ width: `${v}%`, background: c, height: '100%', borderRadius: 3 }} />
            </div>
            <span style={{ color: '#aaa', fontSize: 9, width: 20, textAlign: 'right' }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 10 }}>
          <button
            onClick={e => { e.stopPropagation(); onDetail(p); }}
            onMouseEnter={() => setHovDetail(true)}
            onMouseLeave={() => setHovDetail(false)}
            style={{ flex: 1, ...S.btnGhost, padding: '8px 10px', fontSize: 11, background: hovDetail ? C.teal + '25' : '#ffffff0D', color: hovDetail ? C.teal : '#ccc', transition: 'background 0.2s, color 0.2s' }}>
            Ver
          </button>
          <button onClick={e => { e.stopPropagation(); onSelect(p); }} style={{ flex: 1, ...(isSelected ? S.btnYellow : S.btnPrimary), padding: '8px 10px', fontSize: 11 }}>
            {isSelected ? '✓ Comparando' : 'Comparar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PROPERTY DETAIL DRAWER ───────────────────────────────────────────────────
function PropertyDetail({ p, onClose, proyectos = [] }) {
  const PROYECTOS = proyectos;
  const [tab, setTab] = useState('info');
  const [lightbox, setLightbox] = useState(null);
  const dc = DATACRIM_DATA[p.distrito];
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 1100, display: 'flex', alignItems: 'flex-end' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.card, width: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px 20px 0 0', maxWidth: 680, margin: '0 auto' }}>
        <div style={{ position: 'relative', height: 200, background: p.imagen_color }}>
          <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,#141414 0%,transparent 60%)' }} />
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: '#000000aa', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✕</button>
          <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>{p.nombre}</div>
            <div style={{ color: '#ddd', fontSize: 12 }}>📍 {p.direccion}</div>
          </div>
        </div>
        <div style={{ padding: '0 16px 16px' }}>
          {/* ── TABS ── */}
          <div style={{ position: 'relative' }}>
            <div id="tabs-scroll" style={{ display: 'flex', gap: 4, padding: '12px 0', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`#tabs-scroll::-webkit-scrollbar{display:none}`}</style>
              {[
                { id: 'info',      label: '📋 Info'       },
                { id: 'tipologias',label: '🏠 Tipologías'  },
                { id: 'indecopi',  label: '⚖️ INDECOPI'   },
                { id: 'seguridad', label: '🛡️ Seguridad'  },
                { id: 'plusvalia', label: '📈 Plusvalía'   },
                { id: 'credito',   label: '🏦 Crédito'     },
                { id: 'scores',    label: '📊 Scores'      },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{
                    background: tab === t.id ? C.teal : '#ffffff0D',
                    color: tab === t.id ? '#000' : '#aaa',
                    border: `1px solid ${tab === t.id ? C.teal : '#ffffff22'}`,
                    borderRadius: 8, padding: '7px 13px', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                    boxShadow: tab === t.id ? `0 2px 10px ${C.teal}40` : 'none',
                    transition: 'all 0.15s',
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
            {/* Flecha "más pestañas" solo en mobile */}
            <style>{`
              @media (min-width: 640px) { .tabs-arrow { display: none !important; } }
              @keyframes tabs-bounce { 0%,100%{transform:translateY(-50%) translateX(0)} 50%{transform:translateY(-50%) translateX(4px)} }
            `}</style>
            <div className="tabs-arrow" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'linear-gradient(to right,transparent,#141414 40%)', paddingLeft: 24, paddingRight: 4, pointerEvents: 'none', animation: 'tabs-bounce 1.4s ease-in-out infinite' }}>
              <span style={{ color: C.teal, fontSize: 18, fontWeight: 900 }}>›</span>
            </div>
          </div>

          {tab === 'info' && (
            <div>
              <p style={{ color: '#ddd', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{p.descripcion}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 16 }}>
                {[
                  ['💰 Precio desde', `S/ ${p.precio_desde.toLocaleString()}`],
                  ['📐 Áreas', `${p.area_desde}–${p.area_hasta}m²`],
                  ['🛏 Dormitorios', p.dormitorios.join(', ')],
                  ['🏗️ Pisos', p.pisos],
                  ['📅 Entrega', p.entrega],
                  ['💵 Cuota inicial', `Desde ${p.cuota_inicial_min}%`],
                  ['🏦 Banco', p.banco_sponsor],
                  ['📊 PER', `${p.per}x`],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: '#ffffff05', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ color: '#bbb', fontSize: 10 }}>{l}</div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{v}</div>
                  </div>
                ))}
                {/* Reputación INDECOPI — calculada desde data real */}
                {(() => {
                  const ind = INDECOPI_DATA[p.inmobiliaria];
                  const sanciones = ind?.total_sanciones ?? 0;
                  const score = sanciones === 0 ? '5/5' : sanciones <= 2 ? '4/5' : sanciones <= 5 ? '3/5' : '2/5';
                  return (
                    <div style={{ background: '#ffffff05', borderRadius: 8, padding: '8px 12px' }}>
                      <div style={{ color: '#bbb', fontSize: 10 }}>⭐ Reputación INDECOPI</div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{score}</div>
                    </div>
                  );
                })()}
                {/* Card especial Depas: disponibles / totales en la misma línea */}
                {/* Depas disponibles: suma de unidades reales por tipología (= consistente con pestaña Tipologías) */}
                {(() => {
                  const dispReal = (p.modelos || []).reduce((s, m) => s + (m.unidades || 0), 0);
                  const dispColor = dispReal === 0 ? '#ef4444' : dispReal <= 3 ? '#f59e0b' : '#22c55e';
                  return (
                    <div style={{ background: '#ffffff05', borderRadius: 8, padding: '8px 12px' }}>
                      <div style={{ color: '#bbb', fontSize: 10 }}>🏘️ Depas</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ color: dispReal > 0 ? dispColor : '#ef4444', fontWeight: 700, fontSize: 13 }}>
                          {dispReal} <span style={{ color: '#aaa', fontSize: 10, fontWeight: 400 }}>disp.</span>
                        </span>
                        {p.depas_total ? (
                          <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
                            <span style={{ color: '#444', fontSize: 11 }}>/</span> {p.depas_total} <span style={{ color: '#aaa', fontSize: 10, fontWeight: 400 }}>totales</span>
                          </span>
                        ) : (
                          <span style={{ color: '#555', fontSize: 9, fontStyle: 'italic' }}>total n/d</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
              {p.amenities?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#bbb', fontSize: 11, marginBottom: 6 }}>ÁREAS COMUNES</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {p.amenities.map(a => <span key={a} style={{ ...S.tag(C.teal), fontSize: 10 }}>{a}</span>)}
                  </div>
                </div>
              )}
              {p.acabados_lista?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#bbb', fontSize: 11, marginBottom: 6 }}>ACABADOS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {p.acabados_lista.map(a => <span key={a} style={{ ...S.tag(C.yellow), fontSize: 10 }}>{a}</span>)}
                  </div>
                </div>
              )}
              {p.electrodomesticos?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#bbb', fontSize: 11, marginBottom: 6 }}>ELECTRODOMÉSTICOS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {p.electrodomesticos.map(e => <span key={e} style={{ ...S.tag('#8b5cf6'), fontSize: 10 }}>{e}</span>)}
                  </div>
                </div>
              )}
              {/* Fotos dentro de info */}
              {(p.fotos?.length > 0 || p.youtube_url) && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ color: '#bbb', fontSize: 11, marginBottom: 8 }}>FOTOS</div>
                  {p.fotos?.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6, marginBottom: 12 }}>
                      {p.fotos.map((foto, i) => (
                        <div key={i} onClick={() => setLightbox(foto)}
                          style={{ borderRadius: 10, overflow: 'hidden', aspectRatio: '16/9', background: '#1a1a1a', position: 'relative', cursor: 'zoom-in' }}>
                          <img src={foto} alt={`${p.nombre} ${i+1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.onerror = null; e.target.style.opacity = '0.3'; }} />
                          <div style={{ position: 'absolute', bottom: 4, right: 4, background: '#000000aa', borderRadius: 4, padding: '2px 4px', fontSize: 10 }}>🔍</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {p.youtube_url && (
                    <div>
                      <div style={{ color: '#bbb', fontSize: 11, marginBottom: 8 }}>🎬 Tour Virtual</div>
                      <div style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9' }}>
                        <iframe src={p.youtube_url} style={{ width: '100%', height: '100%', border: 'none' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {tab === 'tipologias' && (
            <div>
              <div style={{ color: '#ddd', fontSize: 12, marginBottom: 12 }}>
                {(p.modelos?.length || 0)} tipologías disponibles
              </div>
              {p.modelos?.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                  {p.modelos.map((m, i) => (
                    <div key={i} style={{ background: '#ffffff05', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'row' }}>
                      {/* Planito izquierda — click abre lightbox */}
                      <div onClick={() => m.plano_url && setLightbox(m.plano_url)}
                        style={{ width: 'min(35%, 120px)', flexShrink: 0, background: '#0a0a0a', position: 'relative', cursor: m.plano_url ? 'zoom-in' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {m.plano_url ? (
                          <>
                            <img src={m.plano_url} alt={`Plano ${m.nombre}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                            <div style={{ position: 'absolute', bottom: 4, right: 4, background: '#000000aa', borderRadius: 4, padding: '2px 4px', fontSize: 10 }}>🔍</div>
                          </>
                        ) : (
                          <span style={{ color: '#aaa', fontSize: 20 }}>📐</span>
                        )}
                      </div>
                      {/* Info derecha */}
                      <div style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 11 }}>{m.nombre}</div>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          <span style={{ ...S.tag('#aaa'), fontSize: 9, padding: '1px 5px' }}>🛏 {m.dormitorios}d</span>
                          <span style={{ ...S.tag('#aaa'), fontSize: 9, padding: '1px 5px' }}>🚿 {m.banos}b</span>
                          <span style={{ ...S.tag('#aaa'), fontSize: 9, padding: '1px 5px' }}>📐 {m.area}m²</span>
                          {m.unidades != null && (
                            <span style={{ ...S.tag(m.unidades <= 2 ? '#ef4444' : m.unidades <= 5 ? '#f59e0b' : '#22c55e'), fontSize: 9, padding: '1px 5px' }}>
                              🏠 {m.unidades} disp.
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ color: C.teal, fontWeight: 900, fontSize: 13 }}>S/ {(m.precio || 0).toLocaleString()}</span>
                          <span style={{ color: '#aaa', fontSize: 9 }}>S/ {m.area ? Math.round((m.precio||0)/m.area).toLocaleString() : '—'}/m²</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#ddd', textAlign: 'center', padding: 40 }}>Sin tipologías registradas</div>
              )}
            </div>
          )}
          {tab === 'indecopi' && <IndecopiPanel proyecto={p} />}
          {tab === 'scores' && (
            <div>
              <div style={{ background: '#FFD60010', border: '1px solid #FFD60030', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 11, color: '#ddd', lineHeight: 1.6 }}>
                ℹ️ Scores calculados automáticamente desde BCRP, DataCrim PNP, INDECOPI y datos del proyecto.
              </div>
              {[
                ['📍 Ubicación', p.scores.ubicacion, C.teal, 'Tier de distrito · Fuente: BCRP precio m² 2024'],
                ['🛡️ Seguridad', p.scores.seguridad, C.green, 'DataCrim PNP/INEI · 100 − índice delictivo'],
                ['🚌 Accesibilidad', p.scores.accesibilidad, C.blue, 'Tipo de vía registrada + conectividad del distrito'],
                ['🏢 Amenities', p.scores.amenities, '#8b5cf6', 'Áreas comunes ponderadas: piscina, gym, coworking…'],
                ['🏠 Acabados', p.scores.acabados, C.yellow, 'Materiales interiores: piso SPC, cuarzo, luminarias LED…'],
                ['🔌 Equipamiento', p.scores.equipamiento, C.orange, 'Electrodomésticos incluidos: campana, horno, encimera…'],
                ['💰 Precio/Valor', p.scores.precio, C.teal, 'Precio real vs benchmark m² BCRP del distrito'],
              ].map(([l, v, c, desc]) => (
                <div key={l} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#ccc', fontSize: 12, fontWeight: 700 }}>{l}</span>
                    <span style={{ color: c, fontSize: 12, fontWeight: 900 }}>{v}/100</span>
                  </div>
                  <div style={{ background: '#ffffff0a', borderRadius: 4, height: 6, marginBottom: 3 }}>
                    <div style={{ width: `${v}%`, background: c, height: '100%', borderRadius: 4 }} />
                  </div>
                  <div style={{ color: '#bbb', fontSize: 10 }}>{desc}</div>
                </div>
              ))}
            </div>
          )}
          {tab === 'seguridad' && <DataCrimPanel distrito={p.distrito} proyectoId={p.id} proyectos={proyectos} />}
          {tab === 'plusvalia' && <BCRPPanel proyectos={[p]} />}
          {tab === 'credito' && <SimuladorCredito proyectos={[p]} />}
        </div>
      </div>

      {/* Lightbox plano */}
      {lightbox && (
        <div onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: '#000000ee', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'relative', maxWidth: '95vw', maxHeight: '90vh' }}>
            <img src={lightbox} alt="Plano ampliado"
              style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12, display: 'block' }} />
            <button onClick={() => setLightbox(null)}
              style={{ position: 'absolute', top: -14, right: -14, background: '#333', border: 'none', color: '#fff', borderRadius: '50%', width: 32, height: 32, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            <div style={{ textAlign: 'center', color: '#ddd', fontSize: 11, marginTop: 8 }}>Toca fuera para cerrar</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── INVESTIGACION DASHBOARD ──────────────────────────────────────────────────
function InvestigacionDashboard({ proyectos }) {
  const [tab, setTab] = useState('indecopi');
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { id: 'indecopi', label: '⚖️ INDECOPI' },
          { id: 'datacrim', label: '🛡️ DataCrim' },
          { id: 'bcrp', label: '📈 BCRP Plusvalía' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ background: tab === t.id ? C.teal + '20' : 'transparent', color: tab === t.id ? C.teal : '#ccc', border: tab === t.id ? `1px solid ${C.teal}40` : `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'indecopi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {proyectos.map(p => <IndecopiPanel key={p.id} proyecto={p} />)}
        </div>
      )}
      {tab === 'datacrim' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...new Set(proyectos.map(p => p.distrito))].map(d => (
            <div key={d}>
              <div style={{ color: '#bbb', fontSize: 10, fontWeight: 700, marginBottom: 6 }}>DISTRITO: {d.toUpperCase()}</div>
              <DataCrimPanel distrito={d} proyectos={proyectos} />
            </div>
          ))}
        </div>
      )}
      {tab === 'bcrp' && <BCRPPanel proyectos={proyectos} />}
    </div>
  );
}

// ─── COMPARE PANEL ────────────────────────────────────────────────────────────
function ComparePanel({ proyectos, perfil, onReset }) {
  if (proyectos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#bbb' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚖️</div>
        <div style={{ color: '#fff', fontWeight: 700, marginBottom: 8 }}>Agrega proyectos para comparar</div>
        <div style={{ fontSize: 13 }}>Ve a la pestaña Match y haz click en "+ Comparar" en las cards</div>
      </div>
    );
  }
  const vars = [
    { key: 'ubicacion', label: '📍 Ubicación', color: C.teal },
    { key: 'seguridad', label: '🛡️ Seguridad', color: C.green },
    { key: 'accesibilidad', label: '🚌 Accesibilidad', color: C.blue },
    { key: 'amenities', label: '🏢 Amenities', color: '#8b5cf6' },
    { key: 'acabados', label: '🏠 Acabados', color: C.yellow },
    { key: 'equipamiento', label: '🔌 Equipamiento', color: C.orange },
    { key: 'precio', label: '💰 Precio/Valor', color: C.teal },
  ];
  const radarData = vars.map(v => {
    const obj = { variable: v.label.split(' ')[1] };
    proyectos.forEach(p => { obj[p.nombre] = p.scores[v.key]; });
    return obj;
  });
  const colors2 = [C.teal, C.yellow, '#8b5cf6', '#ef4444'];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Comparando {proyectos.length} proyectos</div>
        <button onClick={onReset} style={{ ...S.btnGhost, padding: '6px 14px', fontSize: 11 }}>Limpiar</button>
      </div>
      {/* RADAR ARRIBA */}
      <div style={{ ...S.card, padding: 20, marginBottom: 24 }}>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, marginBottom: 4 }}>⚡ Radar comparativo de scores</div>
        <div style={{ color: '#bbb', fontSize: 11, marginBottom: 12 }}>Visualización simultánea de las 7 variables</div>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke={C.border} />
            <PolarAngleAxis dataKey="variable" tick={{ fill: '#aaa', fontSize: 11 }} />
            {proyectos.map((p, i) => (
              <Radar key={p.id} name={p.nombre} dataKey={p.nombre}
                stroke={colors2[i]} fill={colors2[i]} fillOpacity={0.12} strokeWidth={2} />
            ))}
            <Legend wrapperStyle={{ fontSize: 11, color: '#ddd' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16, marginBottom: 24 }}>
        {proyectos.map((p, i) => (
          <div key={p.id} style={{ ...S.card, padding: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors2[i], flexShrink: 0 }} />
              <div style={{ color: '#fff', fontWeight: 800 }}>{p.nombre}</div>
            </div>
            <div style={{ color: C.teal, fontWeight: 900, fontSize: 20 }}>S/ {p.precio_desde.toLocaleString()}</div>
            <div style={{ color: '#bbb', fontSize: 11, margin: '4px 0 10px' }}>{p.distrito} · {p.etapa}</div>
            {vars.map(v => (
              <div key={v.key} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ color: '#bbb', fontSize: 10, width: 90, flexShrink: 0 }}>{v.label}</span>
                <div style={{ flex: 1, background: '#ffffff0a', borderRadius: 3, height: 4 }}>
                  <div style={{ width: `${p.scores[v.key]}%`, background: v.color, height: '100%', borderRadius: 3 }} />
                </div>
                <span style={{ color: '#ccc', fontSize: 10, width: 24, textAlign: 'right' }}>{p.scores[v.key]}</span>
              </div>
            ))}
            {perfil && (
              <div style={{ marginTop: 10, padding: '6px 10px', background: C.teal + '15', borderRadius: 8, textAlign: 'center' }}>
                <span style={{ color: C.teal, fontWeight: 900 }}>{calcScore(p, perfil)}% match</span>
                <span style={{ color: '#bbb', fontSize: 10 }}> con tu perfil</span>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}

// ─── MAPA TOGGLE ─────────────────────────────────────────────────────────────
function MapaToggle({ filtered, compareList, onAddCompare, mapHighlight, setMapHighlight, proyectos = [] }) {
  const PROYECTOS = proyectos;
  const [open, setOpen] = useState(true);
  const selIds = compareList.map(p => p.id);
  const highlighted = PROYECTOS.find(x => x.id === mapHighlight);
  return (
    <div style={{ ...S.card, overflow: 'hidden', marginBottom: 4 }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ padding: '11px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15 }}>🗺️</span>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>Mapa Lima</span>
          <span style={{ color: '#bbb', fontSize: 11 }}>{filtered.length} proyectos · hover = resalta · click pin = comparar</span>
        </div>
        <span style={{ color: C.teal, fontSize: 13, transform: open ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s', display: 'inline-block' }}>▲</span>
      </div>
      {open && (
        <div style={{ borderTop: `1px solid ${C.border}` }}>
          <div style={{ padding: '8px 14px', background: '#111', borderBottom: `1px solid ${C.border}`, minHeight: 38, display: 'flex', alignItems: 'center', gap: 10 }}>
            {highlighted ? (
              <>
                <img src={highlighted.imagen} alt={highlighted.nombre}
                  style={{ width: 48, height: 34, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                  onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 12 }}>{highlighted.nombre}</span>
                <span style={{ color: C.teal, fontSize: 11 }}>S/ {highlighted.precio_desde.toLocaleString()}</span>
                <span style={{ color: DATACRIM_DATA[highlighted.distrito]?.color || '#ccc', fontSize: 10 }}>
                  🛡️ {DATACRIM_DATA[highlighted.distrito]?.nivel}
                </span>
                <span style={{ color: C.yellow, fontSize: 10 }}>📈 {BCRP_DATA.proyeccion_3y[highlighted.distrito] || 'N/D'}</span>
                <button onClick={e => { e.stopPropagation(); onAddCompare(highlighted); }}
                  style={{ ...compareList.some(x => x.id === highlighted.id) ? S.btnYellow : S.btnPrimary, padding: '4px 12px', fontSize: 10, marginLeft: 'auto' }}>
                  {compareList.some(x => x.id === highlighted.id) ? '✓ Comparar' : 'Comparar'}
                </button>
              </>
            ) : (
              <span style={{ color: '#aaa', fontSize: 11 }}>← Pasa el cursor sobre una card</span>
            )}
          </div>
          <div style={{ height: 320, overflow: 'hidden' }}>
            <MapaLeaflet
              proyectos={filtered.map(p => ({ ...p, pin_color: DATACRIM_DATA[p.distrito]?.color || '#2EDFC4' }))}
              selected={selIds}
              onSelect={id => { const p = PROYECTOS.find(x => x.id === id); if (p) onAddCompare(p); }}
              highlight={mapHighlight} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MATCH TAB ────────────────────────────────────────────────────────────────
function MatchTab({ perfil, onAddCompare, compareList, proyectos = [] }) {
  const PROYECTOS = proyectos;
  const isMobile = useIsMobile();
  const [filtroEtapa, setFiltroEtapa] = useState('Todos');
  const [filtroDistrito, setFiltroDistrito] = useState('Todos');
  const [sortBy, setSortBy] = useState('score');
  const [search, setSearch] = useState('');
  const [mapHighlight, setMapHighlight] = useState(null);
  const [detailP, setDetailP] = useState(null);
  const distritos = ['Todos', ...new Set(PROYECTOS.map(p => p.distrito))];
  const filtered = PROYECTOS
    .map(p => ({ ...p, score: calcScore(p, perfil) }))
    .filter(p => {
      if (filtroEtapa !== 'Todos' && p.etapa !== filtroEtapa) return false;
      if (filtroDistrito !== 'Todos' && p.distrito !== filtroDistrito) return false;
      if (search && !p.nombre.toLowerCase().includes(search.toLowerCase()) && !p.distrito.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => sortBy === 'score' ? b.score - a.score : sortBy === 'precio' ? a.precio_desde - b.precio_desde : a.per - b.per);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 140 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#bbb' }}>🔍</span>
          <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...S.input, paddingLeft: 32, fontSize: 12 }} />
        </div>
        <select value={filtroDistrito} onChange={e => setFiltroDistrito(e.target.value)} style={{ ...S.input, width: 'auto', fontSize: 12 }}>
          {distritos.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filtroEtapa} onChange={e => setFiltroEtapa(e.target.value)} style={{ ...S.input, width: 'auto', fontSize: 12 }}>
          <option value="Todos">Todas las etapas</option>
          <option value="Entrega Inmediata">Entrega Inmediata</option>
          <option value="En Construcción">En Construcción</option>
          <option value="En Planos">En Planos</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...S.input, width: 'auto', fontSize: 12 }}>
          <option value="score">Mejor Match</option>
          <option value="precio">Menor precio</option>
          <option value="per">Mejor PER</option>
        </select>
        <span style={{ color: '#bbb', fontSize: 11 }}>{filtered.length} proyectos</span>
      </div>
      <MapaToggle filtered={filtered} compareList={compareList} onAddCompare={onAddCompare} mapHighlight={mapHighlight} setMapHighlight={setMapHighlight} proyectos={PROYECTOS} />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 14, marginTop: 16 }}>
        {filtered.map(p => (
          <PropertyCard key={p.id} p={p} score={perfil ? p.score : null}
            isSelected={compareList.some(x => x.id === p.id)}
            onSelect={() => onAddCompare(p)} onDetail={setDetailP} onMapHighlight={setMapHighlight} />
        ))}
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#bbb', gridColumn: '1/-1' }}>Sin resultados</div>}
      </div>
      {detailP && <PropertyDetail p={detailP} onClose={() => setDetailP(null)} proyectos={filtered} />}
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({ onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const [perfil, setPerfil] = useState({ nombre: '', objetivo: 'vivir', presupuesto: 400000, cuota_inicial: 10, dormitorios: [2], area_min: 50, fecha_entrega: 'cualquiera', distrito: 'Todos', financia: true, años_credito: 20 });
  const update = (k, v) => setPerfil(p => ({ ...p, [k]: v }));
  const toggleDorm = (d) => update('dormitorios', perfil.dormitorios.includes(d) ? perfil.dormitorios.filter(x => x !== d) : [...perfil.dormitorios, d]);

  const steps = [
    <div key={0} style={{ textAlign: 'center', padding: '12px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏡</div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 8 }}>¿Cómo te llamamos?</h2>
      <input value={perfil.nombre} onChange={e => update('nombre', e.target.value)} placeholder="Tu nombre"
        style={{ ...S.input, textAlign: 'center', fontSize: 18, maxWidth: 280, margin: '16px auto 0' }} />
    </div>,
    <div key={1} style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 20 }}>¿Para qué buscas el departamento?</h2>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[['vivir', '🏡', 'Para vivir', 'Mi hogar principal'], ['negocio', '📈', 'Inversión', 'Alquilar y rentabilizar'], ['ambos', '⚖️', 'Ambos', 'Vivir y luego alquilar']].map(([v, icon, label, sub]) => (
          <button key={v} onClick={() => update('objetivo', v)}
            style={{ background: perfil.objetivo === v ? C.teal + '20' : '#ffffff08', border: `2px solid ${perfil.objetivo === v ? C.teal : C.border}`, borderRadius: 14, padding: '16px 20px', cursor: 'pointer', minWidth: 140 }}>
            <div style={{ fontSize: 28 }}>{icon}</div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, marginTop: 6 }}>{label}</div>
            <div style={{ color: '#ccc', fontSize: 11 }}>{sub}</div>
          </button>
        ))}
      </div>
    </div>,
    <div key={2}>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 20, textAlign: 'center' }}>¿Cuál es tu presupuesto?</h2>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <span style={{ color: C.teal, fontWeight: 900, fontSize: 32 }}>S/ {perfil.presupuesto.toLocaleString()}</span>
      </div>
      <input type="range" min="100000" max="1200000" step="10000" value={perfil.presupuesto}
        onChange={e => update('presupuesto', +e.target.value)}
        style={{ width: '100%', accentColor: C.teal, marginBottom: 20 }} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#ddd', fontSize: 11, marginBottom: 6 }}>Cuota inicial: <strong style={{ color: '#fff' }}>{perfil.cuota_inicial}%</strong></div>
          <input type="range" min="5" max="50" value={perfil.cuota_inicial} onChange={e => update('cuota_inicial', +e.target.value)}
            style={{ width: '100%', accentColor: C.yellow }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#ddd', fontSize: 11, marginBottom: 6 }}>Plazo crédito: <strong style={{ color: '#fff' }}>{perfil.años_credito} años</strong></div>
          <input type="range" min="10" max="30" value={perfil.años_credito} onChange={e => update('años_credito', +e.target.value)}
            style={{ width: '100%', accentColor: C.teal }} />
        </div>
      </div>
      <div style={{ background: C.teal + '10', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
        <span style={{ color: '#ddd', fontSize: 12 }}>Cuota estimada: </span>
        <span style={{ color: C.teal, fontWeight: 900 }}>S/ {cuota(perfil.presupuesto, perfil.años_credito, 7.53).toLocaleString()}/mes</span>
        <span style={{ color: '#bbb', fontSize: 10 }}> (tasa ref. 8.45% BCP)</span>
      </div>
    </div>,
    <div key={3}>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 20, textAlign: 'center' }}>¿Cuántos dormitorios?</h2>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
        {[1, 2, 3].map(d => (
          <button key={d} onClick={() => toggleDorm(d)}
            style={{ background: perfil.dormitorios.includes(d) ? C.teal + '20' : '#ffffff08', border: `2px solid ${perfil.dormitorios.includes(d) ? C.teal : C.border}`, borderRadius: 12, padding: '14px 22px', cursor: 'pointer', color: perfil.dormitorios.includes(d) ? C.teal : '#ddd', fontWeight: 800, fontSize: 18 }}>
            {d}
          </button>
        ))}
      </div>
      <div style={{ color: '#ddd', fontSize: 12, marginBottom: 8 }}>Área mínima: <strong style={{ color: '#fff' }}>{perfil.area_min}m²</strong></div>
      <input type="range" min="30" max="150" value={perfil.area_min} onChange={e => update('area_min', +e.target.value)}
        style={{ width: '100%', accentColor: C.teal }} />
    </div>,
    <div key={4}>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 20, textAlign: 'center' }}>¿Alguna preferencia de zona?</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Todos', 'Surquillo', 'Jesús María', 'San Miguel', 'Lince', 'La Victoria'].map(d => (
          <button key={d} onClick={() => update('distrito', d)}
            style={{ background: perfil.distrito === d ? C.teal + '20' : '#ffffff08', border: `2px solid ${perfil.distrito === d ? C.teal : C.border}`, borderRadius: 20, padding: '8px 16px', cursor: 'pointer', color: perfil.distrito === d ? C.teal : '#ddd', fontWeight: 700, fontSize: 12 }}>
            {d === 'Todos' ? 'Sin preferencia' : d}
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.black, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#bbb', cursor: 'pointer', fontSize: 18 }}>←</button>
        <div style={{ flex: 1, height: 4, background: '#ffffff0a', borderRadius: 2 }}>
          <div style={{ width: `${((step + 1) / steps.length) * 100}%`, background: C.teal, height: '100%', borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
        <span style={{ color: '#bbb', fontSize: 12 }}>{step + 1}/{steps.length}</span>
      </div>
      <div style={{ flex: 1, padding: '40px 20px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        {steps[step]}
      </div>
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ ...S.btnGhost, flex: 1 }}>Atrás</button>}
        {step < steps.length - 1
          ? <button onClick={() => setStep(s => s + 1)} style={{ ...S.btnPrimary, flex: 2 }} disabled={step === 0 && !perfil.nombre.trim()}>Siguiente →</button>
          : <button onClick={() => onComplete(perfil)} style={{ ...S.btnYellow, flex: 2 }}>🎯 Ver mi Match</button>
        }
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────

// ─── TICKER ───────────────────────────────────────────────────────────────────
const TICKER_FALLBACK = [
  { dot: '#2EDFC4', label: '📊 Precio m² Lima', value: 'S/ 6,792/m²', sub: 'Urbania · Oct 2025' },
  { dot: '#22c55e', label: '📈 Alza real m² Lima', value: '+21% desde 2019', sub: 'BCRP · ASEI 2024' },
  { dot: '#f59e0b', label: '🏙️ Lima Centro', value: '+32% en 5 años', sub: 'mayor crecimiento · ASEI' },
  { dot: '#ef4444', label: '🏦 Tasa hipotecaria', value: '8.45% TEA', sub: 'promedio · SBS 2025' },
  { dot: '#2EDFC4', label: '🏗️ Surquillo m²', value: 'S/ 6,850/m²', sub: '+10.5% vs 2023 · BCRP' },
  { dot: '#22c55e', label: '💰 Precio 85m² Lima', value: 'S/ 7,328/m²', sub: 'BCRP Sep 2024' },
  { dot: '#8b5cf6', label: '📉 Precio real ajustado', value: 'S/ 6,623/m²', sub: 'índice hedónico · BCRP' },
  { dot: '#f59e0b', label: '🌆 San Isidro m²', value: '~S/ 9,000/m²', sub: 'zona premium · Urbania' },
  { dot: '#ef4444', label: '🏠 Jesús María m²', value: 'S/ 5,650/m²', sub: 'BCRP 2025' },
  { dot: '#2EDFC4', label: '📊 PER Lima Moderna', value: '18.5x', sub: 'saludable < 20x · BCRP' },
  { dot: '#22c55e', label: '🔑 Cuota inicial mín.', value: 'desde 5%', sub: 'BCP · BBVA · Scotia · Interbank' },
  { dot: '#8b5cf6', label: '🏘️ Lima vs 2019', value: '+23% nominal', sub: 'S/ 5,950 → S/ 7,328 · ASEI' },
];

function MarketTicker() {
  const [items, setItems] = useState(TICKER_FALLBACK);
  useEffect(() => {
    fetch('/api/ticker')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length >= 6) setItems(data); })
      .catch(() => {});
  }, []);
  const doubled = [...items, ...items];
  return (
    <div style={{ background: '#050505', borderBottom: '1px solid #1a1a1a', overflow: 'hidden', height: 30, display: 'flex', alignItems: 'center' }}>
      <style>{`
        @keyframes dm-ticker { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        .dm-ticker-wrap { display: flex; animation: dm-ticker 60s linear infinite; white-space: nowrap; will-change: transform; }
        .dm-ticker-wrap:hover { animation-play-state: paused; cursor: default; }
      `}</style>
      <div className="dm-ticker-wrap">
        {doubled.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 24px', borderRight: '1px solid #222', lineHeight: '30px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.dot, flexShrink: 0, boxShadow: `0 0 8px ${item.dot}` }} />
            <span style={{ color: '#ddd', fontWeight: 600, fontSize: 11 }}>{item.label}</span>
            <span style={{ color: item.dot, fontWeight: 800, fontSize: 12 }}>{item.value}</span>
            <span style={{ color: '#ccc', fontSize: 10 }}>{item.sub}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Home({ onStartMatch, proyectos = [] }) {
  const PROYECTOS = proyectos;
  return (
    <div style={{ minHeight: '100vh', background: C.black }}>
      <MarketTicker />
      <style suppressHydrationWarning>{`.dm-home-grid{grid-template-columns:repeat(2,1fr)}.dm-home-grid>*{min-width:0}@media(min-width:640px){.dm-home-grid{grid-template-columns:repeat(4,1fr)}}`}</style>
      <nav style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <img src={LOGO} alt="DepaMatch" style={{ height: 36, objectFit: 'contain' }}
          onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
        <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
          <a href="/mercado" style={{ color: '#ddd', textDecoration: 'none' }}>Mercado Lima</a>
          <a href="/guia/precio-m2-lima-2025" style={{ color: '#ddd', textDecoration: 'none' }}>Precio m²</a>
        </div>
        <button onClick={() => onStartMatch(null)} style={{ ...S.btnYellow, padding: '9px 18px', fontSize: 13 }}>Hacer mi Match</button>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 20px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.teal + '15', border: `1px solid ${C.teal}30`, borderRadius: 20, padding: '4px 14px', fontSize: 11, fontWeight: 700, color: C.teal, marginBottom: 24 }}>
          🏠 Lima Moderna · 12 proyectos verificados
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(32px,6vw,56px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
          El <span style={{ color: C.teal }}>match perfecto</span><br />para tu departamento
        </h1>
        <p style={{ color: '#ddd', fontSize: 18, maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Análisis inteligente con datos de BCRP, DataCrim, INDECOPI y SBS. No te vendemos un depa, te ayudamos a elegir el correcto.
        </p>
        <button onClick={() => onStartMatch(null)} style={{ ...S.btnPrimary, padding: '16px 36px', fontSize: 16 }}>
          🎯 Hacer mi Match — es gratis
        </button>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
          {['Gratis siempre', 'Datos oficiales BCRP', 'DataCrim seguridad', 'INDECOPI verificado'].map(t => (
            <span key={t} style={{ ...S.tag('#aaa'), fontSize: 10 }}>✓ {t}</span>
          ))}
        </div>
      </div>

      {/* Proyectos destacados */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 80px' }}>
        <div style={{ color: '#bbb', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>PROYECTOS DESTACADOS</div>
        <div style={{ display: 'grid', gap: 14 }} className="dm-home-grid">
          {PROYECTOS.slice(0, 4).map(p => (
            <PropertyCard key={p.id} p={p} score={null}
              isSelected={false}
              onSelect={() => onStartMatch(p)}
              onDetail={() => {}}
              onMapHighlight={() => {}} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button onClick={() => onStartMatch(null)} style={{ ...S.btnGhost, padding: '11px 24px' }}>
            Ver todos los proyectos →
          </button>
        </div>
      </div>

      {/* Links SEO */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '32px 20px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ color: '#bbb', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>ANÁLISIS DE MERCADO</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
          {[
            { href: '/mercado/surquillo', label: 'Precio m² en Surquillo' },
            { href: '/mercado/jesus-maria', label: 'Departamentos Jesús María' },
            { href: '/mercado/san-miguel', label: 'Proyectos San Miguel' },
            { href: '/mercado/lince', label: 'Precio m² en Lince' },
            { href: '/mercado/la-victoria', label: 'Plusvalía La Victoria' },
            { href: '/comparar/surquillo-vs-jesus-maria', label: 'Surquillo vs Jesús María' },
          ].map(l => (
            <a key={l.href} href={l.href}
              style={{ background: '#ffffff05', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#ddd', fontSize: 12, textDecoration: 'none', display: 'block' }}>
              → {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ perfil, onReset, proyectos = [], loading = false }) {
  const PROYECTOS = proyectos;
  const [activeTab, setActiveTab] = useState('match');
  const [compareList, setCompareList] = useState([]);
  const toggleCompare = (p) => setCompareList(l => l.some(x => x.id === p.id) ? l.filter(x => x.id !== p.id) : l.length < 4 ? [...l, p] : l);
  const tabs = [
    { id: 'match', label: '🎯 Match' },
    { id: 'comparar', label: `⚖️ Comparar${compareList.length > 0 ? ` (${compareList.length})` : ''}` },
    { id: 'investigar', label: '🔬 Investigar' },
    { id: 'credito', label: '🏦 Crédito' },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: `3px solid #ffffff22`, borderTop: `3px solid #00BFA5`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#888', fontSize: 14 }}>Cargando proyectos…</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.black }}>
      <MarketTicker />
      <nav style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58, position: 'sticky', top: 0, zIndex: 100, gap: 8 }}>
        <img src={LOGO} alt="DepaMatch" style={{ height: 34, objectFit: 'contain' }}
          onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
        <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
          {tabs.map(t => {
            const TAB_COL = { match: C.teal, comparar: C.yellow, investigar: '#8b5cf6', credito: '#3b82f6' };
            const col = TAB_COL[t.id] || C.teal;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ background: activeTab === t.id ? col + '22' : 'transparent', color: activeTab === t.id ? col : '#ccc', border: activeTab === t.id ? `1px solid ${col}50` : '1px solid transparent', borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                {t.label}
              </button>
            );
          })}
        </div>
        <button onClick={onReset} style={{ ...S.btnGhost, padding: '6px 12px', fontSize: 11, flexShrink: 0 }}>← Salir</button>
      </nav>
      <div style={{ background: `linear-gradient(90deg,${C.yellow}12,${C.yellow}06)`, borderBottom: `1px solid ${C.border}`, padding: '8px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#bbb', fontSize: 11 }}>Perfil:</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{perfil.nombre}</span>
          <span style={{ ...S.tag(C.teal), fontSize: 10 }}>{perfil.objetivo === 'vivir' ? '🏡 Vivir' : perfil.objetivo === 'negocio' ? '📈 Inversión' : '⚖️ Ambos'}</span>
          <span style={{ ...S.tag('#aaa'), fontSize: 10 }}>S/ {perfil.presupuesto.toLocaleString()}</span>
          <span style={{ ...S.tag('#aaa'), fontSize: 10 }}>{perfil.dormitorios.join('/')} dorm</span>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        {activeTab === 'match' && <MatchTab perfil={perfil} onAddCompare={toggleCompare} compareList={compareList} proyectos={PROYECTOS} />}
        {activeTab === 'comparar' && <ComparePanel proyectos={compareList} perfil={perfil} onReset={() => setCompareList([])} />}
        {activeTab === 'investigar' && <InvestigacionDashboard proyectos={compareList.length > 0 ? compareList : PROYECTOS.slice(0, 4)} />}
        {activeTab === 'credito' && <SimuladorCredito proyectos={compareList.length > 0 ? compareList : PROYECTOS.slice(0, 3)} />}
      </div>
    </div>
  );
}

// ─── APP ROOT (export default) ────────────────────────────────────────────────
export default function AppShell() {
  const { PROYECTOS, loading } = useProyectos();
  const [screen, setScreen] = useState('home');
  const [perfil, setPerfil] = useState(null);
  if (screen === 'home') return <Home onStartMatch={p => { if (p) setPerfil({ objetivo: 'ambos', presupuesto: p.precio_desde, cuota_inicial: 10, dormitorios: [2], area_min: p.area_desde, años_credito: 20, nombre: '' }); setScreen('onboarding'); }} proyectos={PROYECTOS} />;
  if (screen === 'onboarding') return <Onboarding onComplete={p => { setPerfil(p); setScreen('dashboard'); }} onBack={() => setScreen('home')} />;
  return <Dashboard perfil={perfil} onReset={() => { setPerfil(null); setScreen('home'); }} proyectos={PROYECTOS} loading={loading} />;
}