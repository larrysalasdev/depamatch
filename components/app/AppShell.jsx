'use client';

// ─── AppShell.jsx ─────────────────────────────────────────────────────────────
// Este componente es el contenedor 'use client' de toda la app interactiva.
// Todo el código de depamatch.jsx vive aquí — no se reescribió nada, solo
// se adaptó el import/export para Next.js App Router.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  LineChart, Line, CartesianGrid, Legend, AreaChart, Area,
} from 'recharts';

import {
  PROYECTOS, INDECOPI_DATA, DATACRIM_DATA, BCRP_DATA, TASAS_SBS,
} from '@/lib/data';

// ─── BRAND ────────────────────────────────────────────────────────────────────
const LOGO = '/assets/logo.png';
const C = {
  teal: '#2EDFC4', yellow: '#FFD600', black: '#0D0D0D',
  card: '#141414', card2: '#1A1A1A', border: '#ffffff12',
  text: '#F0F0F0', muted: '#888', dim: '#555',
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
function MapaFallback({ proyectos, selected, onSelect, highlight }) {
  const [hovered, setHovered] = useState(null);
  const bounds = { minLat: -12.130, maxLat: -12.050, minLng: -77.110, maxLng: -76.990 };
  const toXY = (lat, lng, w, h) => ({
    x: ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * w,
    y: ((lat - bounds.maxLat) / (bounds.minLat - bounds.maxLat)) * h,
  });
  return (
    <div style={{ position: 'relative', width: '100%', background: '#111', borderRadius: 12 }}>
      <svg width="100%" viewBox="0 0 500 360" style={{ display: 'block' }}>
        <rect width="500" height="360" fill="#111" rx="12" />
        {[40, 80, 120, 160, 200, 240, 280, 320].map(y => <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#1e1e1e" strokeWidth="1" />)}
        {[50, 100, 150, 200, 250, 300, 350, 400, 450].map(x => <line key={x} x1={x} y1="0" x2={x} y2="360" stroke="#1e1e1e" strokeWidth="1" />)}
        {[
          { d: 'Surquillo', x: 396, y: 225, w: 104, h: 135, c: '#2EDFC410', bc: '#2EDFC440' },
          { d: 'San Miguel', x: 0, y: 67, w: 167, h: 135, c: '#22c55e10', bc: '#22c55e40' },
          { d: 'Lince', x: 250, y: 112, w: 125, h: 113, c: '#f59e0b10', bc: '#f59e0b40' },
          { d: 'Jesús María', x: 167, y: 67, w: 125, h: 113, c: '#3b82f610', bc: '#3b82f640' },
          { d: 'La Victoria', x: 292, y: 22, w: 104, h: 113, c: '#ef444410', bc: '#ef444440' },
          { d: 'Miraflores', x: 250, y: 270, w: 120, h: 90, c: '#8b5cf610', bc: '#8b5cf620' },
        ].map(z => (
          <g key={z.d}>
            <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="6" fill={z.c} stroke={z.bc} strokeWidth="1" />
            <text x={z.x + z.w / 2} y={z.y + z.h / 2} textAnchor="middle" dominantBaseline="middle" fill="#555" fontSize="8" fontWeight="700">{z.d}</text>
          </g>
        ))}
        {proyectos.map(p => {
          const { x, y } = toXY(p.lat, p.lng, 500, 360);
          const isSel = selected.includes(p.id);
          const isHi = highlight === p.id || hovered === p.id;
          const dc = DATACRIM_DATA[p.distrito];
          const pinColor = dc?.color || C.teal;
          return (
            <g key={p.id} style={{ cursor: 'pointer' }}
              onClick={() => onSelect(p.id)}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}>
              <circle cx={x} cy={y} r={isHi ? 10 : isSel ? 9 : 7}
                fill={isHi ? C.yellow : isSel ? C.teal : pinColor}
                stroke="#000" strokeWidth="1.5"
                style={{ transition: 'r 0.15s, fill 0.15s' }} />
              {(isHi || isSel) && (
                <text x={x} y={y - 14} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="800"
                  style={{ pointerEvents: 'none' }}>{p.nombre}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── INDECOPI PANEL ───────────────────────────────────────────────────────────
function IndecopiPanel({ proyecto }) {
  const data = INDECOPI_DATA[proyecto.ruc];
  if (!data) return null;
  const calColor = { 'A+': C.teal, A: '#22c55e', B: C.yellow, C: '#ef4444' }[data.calificacion] || '#888';
  return (
    <div style={{ ...S.card, padding: 16 }}>
      <div style={{ color: C.teal, fontSize: 10, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>INDECOPI · VERIFICADO</div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div style={{ background: calColor + '20', border: `2px solid ${calColor}`, borderRadius: 12, padding: '8px 16px', textAlign: 'center' }}>
          <div style={{ color: calColor, fontWeight: 900, fontSize: 22 }}>{data.calificacion}</div>
          <div style={{ color: '#555', fontSize: 9 }}>INDECOPI</div>
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{data.razon_social}</div>
          <div style={{ color: data.sanciones.length === 0 ? C.green : C.orange, fontSize: 11, marginTop: 3 }}>{data.estado}</div>
          <div style={{ color: '#555', fontSize: 10 }}>RUC: {proyecto.ruc} · Consulta: {data.ultima_consulta}</div>
        </div>
      </div>
      {data.sanciones.length > 0 && data.sanciones.map((s, i) => (
        <div key={i} style={{ background: '#ef444410', border: '1px solid #ef444430', borderRadius: 8, padding: '8px 12px', fontSize: 11, marginBottom: 6 }}>
          <span style={{ color: '#ef4444', fontWeight: 700 }}>{s.fecha}</span>
          <span style={{ color: '#ccc', margin: '0 8px' }}>·</span>
          <span style={{ color: '#ccc' }}>{s.motivo}</span>
          <span style={{ color: '#888', margin: '0 8px' }}>·</span>
          <span style={{ color: C.yellow }}>{s.monto}</span>
          <span style={{ color: '#666', marginLeft: 8 }}>({s.estado})</span>
        </div>
      ))}
    </div>
  );
}

// ─── DATACRIM PANEL ───────────────────────────────────────────────────────────
function DataCrimPanel({ distrito }) {
  const d = DATACRIM_DATA[distrito];
  if (!d) return null;
  return (
    <div style={{ ...S.card, padding: 16 }}>
      <div style={{ color: C.teal, fontSize: 10, fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>DATACRIM · PNP / INEI</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Índice delictivo', val: d.indice, color: d.color },
          { label: 'Delitos/mes', val: d.delitos_mes, color: '#ccc' },
          { label: 'vs Lima promedio', val: d.vs_lima, color: d.indice < 50 ? C.green : '#ef4444' },
        ].map(m => (
          <div key={m.label} style={{ background: '#ffffff05', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', textAlign: 'center', flex: 1, minWidth: 80 }}>
            <div style={{ color: m.color, fontWeight: 900, fontSize: 18 }}>{m.val}</div>
            <div style={{ color: '#555', fontSize: 9 }}>{m.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#555', fontWeight: 700, marginBottom: 4 }}>Zonas seguras</div>
          {d.zonas_seguras.map(z => <div key={z} style={{ color: C.green, padding: '2px 0' }}>✓ {z}</div>)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#555', fontWeight: 700, marginBottom: 4 }}>Patrullaje</div>
          <div style={{ color: '#ccc' }}>{d.patrullaje} · {d.camaras} cámaras</div>
          <div style={{ color: '#555', marginTop: 4 }}>Tendencia: {d.tendencia}</div>
        </div>
      </div>
    </div>
  );
}

// ─── BCRP PANEL ──────────────────────────────────────────────────────────────
function BCRPPanel({ proyectos }) {
  const distritos = [...new Set(proyectos.map(p => p.distrito))];
  const colors = [C.teal, C.yellow, '#3b82f6', '#22c55e', '#f59e0b', '#ec4899'];
  return (
    <div style={{ ...S.card, padding: 20 }}>
      <div style={{ color: C.teal, fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>BCRP · BANCO CENTRAL DE RESERVA DEL PERÚ</div>
      <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Plusvalía por Distrito — Lima Metropolitana</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: 8, marginBottom: 20 }}>
        {distritos.map((d, i) => (
          <div key={d} style={{ background: colors[i % colors.length] + '12', border: `1px solid ${colors[i % colors.length]}25`, borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ color: colors[i % colors.length], fontWeight: 900, fontSize: 20 }}>{BCRP_DATA.proyeccion_3y[d] || 'N/D'}</div>
            <div style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{d}</div>
            <div style={{ color: '#666', fontSize: 9 }}>Proyección 3 años</div>
            <div style={{ color: '#888', fontSize: 11, marginTop: 4 }}>S/ {(BCRP_DATA.precio_m2[d] || 0).toLocaleString()}/m²</div>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={BCRP_DATA.historico} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="año" tick={{ fill: '#666', fontSize: 10 }} />
          <YAxis tick={{ fill: '#666', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: '#1a1a1a', border: `1px solid ${C.border}`, borderRadius: 8, color: '#fff', fontSize: 11 }} />
          {distritos.map((d, i) => (
            <Area key={d} type="monotone" dataKey={d} stroke={colors[i % colors.length]} fill={colors[i % colors.length] + '20'} strokeWidth={2} dot={false} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ color: '#444', fontSize: 10, marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>{BCRP_DATA.fuente}</div>
    </div>
  );
}

// ─── SIMULADOR ────────────────────────────────────────────────────────────────
function SimuladorCredito({ proyectos }) {
  const [años, setAños] = useState(20);
  const [cuotaInit, setCuotaInit] = useState(10);
  return (
    <div style={{ ...S.card, padding: 20 }}>
      <div style={{ color: C.teal, fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>SBS · TASAS REALES</div>
      <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Simulador de Crédito Hipotecario</div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ color: '#888', fontSize: 11, marginBottom: 6 }}>Plazo: <strong style={{ color: '#fff' }}>{años} años</strong></div>
          <input type="range" min="10" max="30" value={años} onChange={e => setAños(+e.target.value)}
            style={{ width: '100%', accentColor: C.teal }} />
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ color: '#888', fontSize: 11, marginBottom: 6 }}>Cuota inicial: <strong style={{ color: '#fff' }}>{cuotaInit}%</strong></div>
          <input type="range" min="5" max="40" value={cuotaInit} onChange={e => setCuotaInit(+e.target.value)}
            style={{ width: '100%', accentColor: C.yellow }} />
        </div>
      </div>
      {proyectos.slice(0, 3).map(p => {
        const mejorTasa = TASAS_SBS[0].tasa;
        const c = Math.round(p.precio_desde * (1 - cuotaInit / 100) * (mejorTasa / 100 / 12) * Math.pow(1 + mejorTasa / 100 / 12, años * 12) / (Math.pow(1 + mejorTasa / 100 / 12, años * 12) - 1));
        return (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{p.nombre}</div>
              <div style={{ color: '#555', fontSize: 11 }}>Inicial: S/ {Math.round(p.precio_desde * cuotaInit / 100).toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: C.teal, fontWeight: 900, fontSize: 16 }}>S/ {c.toLocaleString()}/mes</div>
              <div style={{ color: '#555', fontSize: 10 }}>tasa {mejorTasa}% · {años} años</div>
            </div>
          </div>
        );
      })}
      <div style={{ marginTop: 16 }}>
        <div style={{ color: '#888', fontSize: 11, marginBottom: 8 }}>Tasas hipotecarias — SBS Perú</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TASAS_SBS.slice(0, 5).map(t => (
            <div key={t.banco} style={{ background: '#ffffff08', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', textAlign: 'center' }}>
              <div style={{ color: C.teal, fontWeight: 900, fontSize: 13 }}>{t.tasa}%</div>
              <div style={{ color: '#555', fontSize: 9 }}>{t.banco}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ color: '#444', fontSize: 10, marginTop: 10 }}>Fuente: SBS Perú · sbs.gob.pe</div>
    </div>
  );
}

// ─── PROPERTY CARD ────────────────────────────────────────────────────────────
function PropertyCard({ p, score, onSelect, isSelected, onDetail, onMapHighlight }) {
  const [hov, setHov] = useState(false);
  const ec = etapaColor[p.etapa];
  return (
    <div
      onMouseEnter={() => { setHov(true); onMapHighlight(p.id); }}
      onMouseLeave={() => { setHov(false); onMapHighlight(null); }}
      style={{ ...S.card, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s', transform: hov ? 'translateY(-3px)' : 'none', borderColor: isSelected ? C.yellow : hov ? C.teal + '44' : C.border, borderWidth: '1px', borderStyle: 'solid', borderRadius: 16 }}>
      <div style={{ position: 'relative', height: 150, overflow: 'hidden', background: p.imagen_color }}>
        <img src={p.imagen} alt={p.nombre}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,#000000cc 40%,transparent 100%)' }} />
        <span style={{ position: 'absolute', top: 10, left: 10, background: ec + 'ee', color: '#000', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 20 }}>{p.etapa}</span>
        {score && (
          <span style={{ position: 'absolute', top: 10, right: 10, background: score >= 80 ? '#22c55eee' : score >= 65 ? '#f59e0bee' : '#888ee', color: '#000', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 900 }}>
            {score}% match
          </span>
        )}
        <div style={{ position: 'absolute', bottom: 8, left: 10 }}>
          <div style={{ color: '#ffffff88', fontSize: 9 }}>Desde</div>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{p.moneda} {p.precio_desde.toLocaleString()}</div>
        </div>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontWeight: 900, color: '#fff', fontSize: 15, marginBottom: 2 }}>{p.nombre}</div>
        <div style={{ color: '#888', fontSize: 11, marginBottom: 10 }}>📍 {p.direccion}</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ ...S.tag('#aaa'), fontSize: 10 }}>🛏 {p.dormitorios.join(',')} dorm</span>
          <span style={{ ...S.tag('#aaa'), fontSize: 10 }}>📐 {p.area_desde}–{p.area_hasta}m²</span>
          <span style={{ ...S.tag('#aaa'), fontSize: 10 }}>🏦 {p.banco_sponsor}</span>
        </div>
        {[
          ['📍 Ubic.', p.scores.ubicacion, C.teal],
          ['🛡️ Seg.', p.scores.seguridad, C.green],
          ['🏠 Acab.', p.scores.acabados, C.yellow],
          ['🏢 Amen.', p.scores.amenities, '#8b5cf6'],
        ].map(([l, v, c]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ color: '#555', fontSize: 9, width: 46, flexShrink: 0 }}>{l}</span>
            <div style={{ flex: 1, background: '#ffffff0a', borderRadius: 3, height: 4 }}>
              <div style={{ width: `${v}%`, background: c, height: '100%', borderRadius: 3 }} />
            </div>
            <span style={{ color: '#666', fontSize: 9, width: 20, textAlign: 'right' }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <button onClick={() => onDetail(p)} style={{ flex: 1, ...S.btnGhost, padding: '8px 10px', fontSize: 11 }}>Ver detalle</button>
          <button onClick={() => onSelect(p)} style={{ flex: 1, ...(isSelected ? S.btnYellow : S.btnPrimary), padding: '8px 10px', fontSize: 11 }}>
            {isSelected ? '✓ En comparar' : '+ Comparar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PROPERTY DETAIL DRAWER ───────────────────────────────────────────────────
function PropertyDetail({ p, onClose }) {
  const [tab, setTab] = useState('info');
  const dc = DATACRIM_DATA[p.distrito];
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.card, width: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px 20px 0 0', maxWidth: 680, margin: '0 auto' }}>
        <div style={{ position: 'relative', height: 200, background: p.imagen_color }}>
          <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,#141414 0%,transparent 60%)' }} />
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: '#000000aa', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✕</button>
          <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>{p.nombre}</div>
            <div style={{ color: '#888', fontSize: 12 }}>📍 {p.direccion}</div>
          </div>
        </div>
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', gap: 4, padding: '12px 0', overflowX: 'auto' }}>
            {['info', 'scores', 'seguridad', 'plusvalia', 'credito'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ background: tab === t ? C.teal + '20' : 'transparent', color: tab === t ? C.teal : '#666', border: tab === t ? `1px solid ${C.teal}40` : '1px solid transparent', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                {t === 'info' ? '📋 Info' : t === 'scores' ? '📊 Scores' : t === 'seguridad' ? '🛡️ Seguridad' : t === 'plusvalia' ? '📈 Plusvalía' : '🏦 Crédito'}
              </button>
            ))}
          </div>
          {tab === 'info' && (
            <div>
              <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{p.descripcion}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 16 }}>
                {[
                  ['💰 Precio desde', `${p.moneda} ${p.precio_desde.toLocaleString()}`],
                  ['📐 Áreas', `${p.area_desde}–${p.area_hasta}m²`],
                  ['🛏 Dormitorios', p.dormitorios.join(', ')],
                  ['🏗️ Pisos', p.pisos],
                  ['🏘️ Depas', p.depas],
                  ['📅 Entrega', p.entrega],
                  ['💵 Cuota inicial', `Desde ${p.cuota_inicial_min}%`],
                  ['🏦 Banco', p.banco_sponsor],
                  ['📊 PER', `${p.per}x`],
                  ['⭐ Reputación', `${p.reputacion}/5`],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: '#ffffff05', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ color: '#555', fontSize: 10 }}>{l}</div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{v}</div>
                  </div>
                ))}
              </div>
              {p.amenities?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#555', fontSize: 11, marginBottom: 6 }}>ÁREAS COMUNES</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {p.amenities.map(a => <span key={a} style={{ ...S.tag(C.teal), fontSize: 10 }}>{a}</span>)}
                  </div>
                </div>
              )}
              {p.acabados_lista?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#555', fontSize: 11, marginBottom: 6 }}>ACABADOS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {p.acabados_lista.map(a => <span key={a} style={{ ...S.tag(C.yellow), fontSize: 10 }}>{a}</span>)}
                  </div>
                </div>
              )}
              {p.electrodomesticos?.length > 0 && (
                <div>
                  <div style={{ color: '#555', fontSize: 11, marginBottom: 6 }}>ELECTRODOMÉSTICOS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {p.electrodomesticos.map(e => <span key={e} style={{ ...S.tag('#8b5cf6'), fontSize: 10 }}>{e}</span>)}
                  </div>
                </div>
              )}
              <div style={{ marginTop: 16 }}>
                <IndecopiPanel proyecto={p} />
              </div>
            </div>
          )}
          {tab === 'scores' && (
            <div>
              <div style={{ background: '#FFD60010', border: '1px solid #FFD60030', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 11, color: '#888', lineHeight: 1.6 }}>
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
                  <div style={{ color: '#555', fontSize: 10 }}>{desc}</div>
                </div>
              ))}
            </div>
          )}
          {tab === 'seguridad' && <DataCrimPanel distrito={p.distrito} />}
          {tab === 'plusvalia' && <BCRPPanel proyectos={[p]} />}
          {tab === 'credito' && <SimuladorCredito proyectos={[p]} />}
        </div>
      </div>
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
            style={{ background: tab === t.id ? C.teal + '20' : 'transparent', color: tab === t.id ? C.teal : '#666', border: tab === t.id ? `1px solid ${C.teal}40` : `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
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
              <div style={{ color: '#555', fontSize: 10, fontWeight: 700, marginBottom: 6 }}>DISTRITO: {d.toUpperCase()}</div>
              <DataCrimPanel distrito={d} />
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
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16, marginBottom: 24 }}>
        {proyectos.map((p, i) => (
          <div key={p.id} style={{ ...S.card, padding: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors2[i], flexShrink: 0 }} />
              <div style={{ color: '#fff', fontWeight: 800 }}>{p.nombre}</div>
            </div>
            <div style={{ color: C.teal, fontWeight: 900, fontSize: 20 }}>{p.moneda} {p.precio_desde.toLocaleString()}</div>
            <div style={{ color: '#555', fontSize: 11, margin: '4px 0 10px' }}>{p.distrito} · {p.etapa}</div>
            {vars.map(v => (
              <div key={v.key} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ color: '#555', fontSize: 10, width: 90, flexShrink: 0 }}>{v.label}</span>
                <div style={{ flex: 1, background: '#ffffff0a', borderRadius: 3, height: 4 }}>
                  <div style={{ width: `${p.scores[v.key]}%`, background: v.color, height: '100%', borderRadius: 3 }} />
                </div>
                <span style={{ color: '#666', fontSize: 10, width: 24, textAlign: 'right' }}>{p.scores[v.key]}</span>
              </div>
            ))}
            {perfil && (
              <div style={{ marginTop: 10, padding: '6px 10px', background: C.teal + '15', borderRadius: 8, textAlign: 'center' }}>
                <span style={{ color: C.teal, fontWeight: 900 }}>{calcScore(p, perfil)}% match</span>
                <span style={{ color: '#555', fontSize: 10 }}> con tu perfil</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ ...S.card, padding: 20 }}>
        <div style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>Radar de scores comparativo</div>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke={C.border} />
            <PolarAngleAxis dataKey="variable" tick={{ fill: '#666', fontSize: 10 }} />
            {proyectos.map((p, i) => (
              <Radar key={p.id} name={p.nombre} dataKey={p.nombre}
                stroke={colors2[i]} fill={colors2[i]} fillOpacity={0.1} strokeWidth={2} />
            ))}
            <Legend wrapperStyle={{ fontSize: 11, color: '#888' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── MAPA TOGGLE ─────────────────────────────────────────────────────────────
function MapaToggle({ filtered, compareList, onAddCompare, mapHighlight, setMapHighlight }) {
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
          <span style={{ color: '#555', fontSize: 11 }}>{filtered.length} proyectos · hover = resalta · click pin = comparar</span>
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
                <span style={{ color: C.teal, fontSize: 11 }}>{highlighted.moneda} {highlighted.precio_desde.toLocaleString()}</span>
                <span style={{ color: DATACRIM_DATA[highlighted.distrito]?.color || '#888', fontSize: 10 }}>
                  🛡️ {DATACRIM_DATA[highlighted.distrito]?.nivel}
                </span>
                <span style={{ color: C.yellow, fontSize: 10 }}>📈 {BCRP_DATA.proyeccion_3y[highlighted.distrito] || 'N/D'}</span>
                <button onClick={e => { e.stopPropagation(); onAddCompare(highlighted); }}
                  style={{ ...compareList.some(x => x.id === highlighted.id) ? S.btnYellow : S.btnPrimary, padding: '4px 12px', fontSize: 10, marginLeft: 'auto' }}>
                  {compareList.some(x => x.id === highlighted.id) ? '✓ Comparar' : '+ Comparar'}
                </button>
              </>
            ) : (
              <span style={{ color: '#333', fontSize: 11 }}>← Pasa el cursor sobre una card</span>
            )}
          </div>
          <div style={{ height: 320, overflow: 'hidden' }}>
            <MapaFallback proyectos={filtered} selected={selIds}
              onSelect={id => { const p = PROYECTOS.find(x => x.id === id); if (p) onAddCompare(p); }}
              highlight={mapHighlight} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MATCH TAB ────────────────────────────────────────────────────────────────
function MatchTab({ perfil, onAddCompare, compareList }) {
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
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#555' }}>🔍</span>
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
        <span style={{ color: '#555', fontSize: 11 }}>{filtered.length} proyectos</span>
      </div>
      <MapaToggle filtered={filtered} compareList={compareList} onAddCompare={onAddCompare} mapHighlight={mapHighlight} setMapHighlight={setMapHighlight} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 14, marginTop: 16 }}>
        {filtered.map(p => (
          <PropertyCard key={p.id} p={p} score={perfil ? p.score : null}
            isSelected={compareList.some(x => x.id === p.id)}
            onSelect={() => onAddCompare(p)} onDetail={setDetailP} onMapHighlight={setMapHighlight} />
        ))}
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#555', gridColumn: '1/-1' }}>Sin resultados</div>}
      </div>
      {detailP && <PropertyDetail p={detailP} onClose={() => setDetailP(null)} />}
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
            <div style={{ color: '#666', fontSize: 11 }}>{sub}</div>
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
          <div style={{ color: '#888', fontSize: 11, marginBottom: 6 }}>Cuota inicial: <strong style={{ color: '#fff' }}>{perfil.cuota_inicial}%</strong></div>
          <input type="range" min="5" max="50" value={perfil.cuota_inicial} onChange={e => update('cuota_inicial', +e.target.value)}
            style={{ width: '100%', accentColor: C.yellow }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#888', fontSize: 11, marginBottom: 6 }}>Plazo crédito: <strong style={{ color: '#fff' }}>{perfil.años_credito} años</strong></div>
          <input type="range" min="10" max="30" value={perfil.años_credito} onChange={e => update('años_credito', +e.target.value)}
            style={{ width: '100%', accentColor: C.teal }} />
        </div>
      </div>
      <div style={{ background: C.teal + '10', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
        <span style={{ color: '#888', fontSize: 12 }}>Cuota estimada: </span>
        <span style={{ color: C.teal, fontWeight: 900 }}>S/ {cuota(perfil.presupuesto, perfil.años_credito, 8.45).toLocaleString()}/mes</span>
        <span style={{ color: '#555', fontSize: 10 }}> (tasa ref. 8.45% BCP)</span>
      </div>
    </div>,
    <div key={3}>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 20, textAlign: 'center' }}>¿Cuántos dormitorios?</h2>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
        {[1, 2, 3].map(d => (
          <button key={d} onClick={() => toggleDorm(d)}
            style={{ background: perfil.dormitorios.includes(d) ? C.teal + '20' : '#ffffff08', border: `2px solid ${perfil.dormitorios.includes(d) ? C.teal : C.border}`, borderRadius: 12, padding: '14px 22px', cursor: 'pointer', color: perfil.dormitorios.includes(d) ? C.teal : '#888', fontWeight: 800, fontSize: 18 }}>
            {d}
          </button>
        ))}
      </div>
      <div style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>Área mínima: <strong style={{ color: '#fff' }}>{perfil.area_min}m²</strong></div>
      <input type="range" min="30" max="150" value={perfil.area_min} onChange={e => update('area_min', +e.target.value)}
        style={{ width: '100%', accentColor: C.teal }} />
    </div>,
    <div key={4}>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 20, textAlign: 'center' }}>¿Alguna preferencia de zona?</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Todos', 'Surquillo', 'Jesús María', 'San Miguel', 'Lince', 'La Victoria'].map(d => (
          <button key={d} onClick={() => update('distrito', d)}
            style={{ background: perfil.distrito === d ? C.teal + '20' : '#ffffff08', border: `2px solid ${perfil.distrito === d ? C.teal : C.border}`, borderRadius: 20, padding: '8px 16px', cursor: 'pointer', color: perfil.distrito === d ? C.teal : '#888', fontWeight: 700, fontSize: 12 }}>
            {d === 'Todos' ? 'Sin preferencia' : d}
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.black, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: 18 }}>←</button>
        <div style={{ flex: 1, height: 4, background: '#ffffff0a', borderRadius: 2 }}>
          <div style={{ width: `${((step + 1) / steps.length) * 100}%`, background: C.teal, height: '100%', borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
        <span style={{ color: '#555', fontSize: 12 }}>{step + 1}/{steps.length}</span>
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
function Home({ onStartMatch }) {
  return (
    <div style={{ minHeight: '100vh', background: C.black }}>
      <nav style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <img src={LOGO} alt="DepaMatch" style={{ height: 36, objectFit: 'contain' }}
          onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
        <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
          <a href="/mercado" style={{ color: '#888', textDecoration: 'none' }}>Mercado Lima</a>
          <a href="/guia/precio-m2-lima-2025" style={{ color: '#888', textDecoration: 'none' }}>Precio m²</a>
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
        <p style={{ color: '#888', fontSize: 18, maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Análisis inteligente con datos de BCRP, DataCrim, INDECOPI y SBS. No te vendemos un depa, te ayudamos a elegir el correcto.
        </p>
        <button onClick={() => onStartMatch(null)} style={{ ...S.btnPrimary, padding: '16px 36px', fontSize: 16 }}>
          🎯 Hacer mi Match — es gratis
        </button>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
          {['Gratis siempre', 'Datos oficiales BCRP', 'DataCrim seguridad', 'INDECOPI verificado'].map(t => (
            <span key={t} style={{ ...S.tag('#555'), fontSize: 10 }}>✓ {t}</span>
          ))}
        </div>
      </div>

      {/* Proyectos destacados */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 80px' }}>
        <div style={{ color: '#555', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>PROYECTOS DESTACADOS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {PROYECTOS.slice(0, 3).map(p => (
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
        <div style={{ color: '#555', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>ANÁLISIS DE MERCADO</div>
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
              style={{ background: '#ffffff05', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#888', fontSize: 12, textDecoration: 'none', display: 'block' }}>
              → {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ perfil, onReset }) {
  const [activeTab, setActiveTab] = useState('match');
  const [compareList, setCompareList] = useState([]);
  const toggleCompare = (p) => setCompareList(l => l.some(x => x.id === p.id) ? l.filter(x => x.id !== p.id) : l.length < 4 ? [...l, p] : l);
  const tabs = [
    { id: 'match', label: '🎯 Match' },
    { id: 'comparar', label: `⚖️ Comparar${compareList.length > 0 ? ` (${compareList.length})` : ''}` },
    { id: 'investigar', label: '🔬 Investigar' },
    { id: 'credito', label: '🏦 Crédito' },
  ];
  return (
    <div style={{ minHeight: '100vh', background: C.black }}>
      <nav style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58, position: 'sticky', top: 0, zIndex: 100, gap: 8 }}>
        <img src={LOGO} alt="DepaMatch" style={{ height: 34, objectFit: 'contain' }}
          onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
        <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ background: activeTab === t.id ? C.teal + '18' : 'transparent', color: activeTab === t.id ? C.teal : '#666', border: activeTab === t.id ? `1px solid ${C.teal}40` : '1px solid transparent', borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={onReset} style={{ ...S.btnGhost, padding: '6px 12px', fontSize: 11, flexShrink: 0 }}>← Salir</button>
      </nav>
      <div style={{ background: `linear-gradient(90deg,${C.teal}08,${C.yellow}08)`, borderBottom: `1px solid ${C.border}`, padding: '8px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#555', fontSize: 11 }}>Perfil:</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{perfil.nombre}</span>
          <span style={{ ...S.tag(C.teal), fontSize: 10 }}>{perfil.objetivo === 'vivir' ? '🏡 Vivir' : perfil.objetivo === 'negocio' ? '📈 Inversión' : '⚖️ Ambos'}</span>
          <span style={{ ...S.tag('#aaa'), fontSize: 10 }}>S/ {perfil.presupuesto.toLocaleString()}</span>
          <span style={{ ...S.tag('#aaa'), fontSize: 10 }}>{perfil.dormitorios.join('/')} dorm</span>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        {activeTab === 'match' && <MatchTab perfil={perfil} onAddCompare={toggleCompare} compareList={compareList} />}
        {activeTab === 'comparar' && <ComparePanel proyectos={compareList} perfil={perfil} onReset={() => setCompareList([])} />}
        {activeTab === 'investigar' && <InvestigacionDashboard proyectos={compareList.length > 0 ? compareList : PROYECTOS.slice(0, 4)} />}
        {activeTab === 'credito' && <SimuladorCredito proyectos={compareList.length > 0 ? compareList : PROYECTOS.slice(0, 3)} />}
      </div>
    </div>
  );
}

// ─── APP ROOT (export default) ────────────────────────────────────────────────
export default function AppShell() {
  const [screen, setScreen] = useState('home');
  const [perfil, setPerfil] = useState(null);
  if (screen === 'home') return <Home onStartMatch={p => { if (p) setPerfil({ objetivo: 'ambos', presupuesto: p.precio_desde, cuota_inicial: 10, dormitorios: [2], area_min: p.area_desde, años_credito: 20, nombre: '' }); setScreen('onboarding'); }} />;
  if (screen === 'onboarding') return <Onboarding onComplete={p => { setPerfil(p); setScreen('dashboard'); }} onBack={() => setScreen('home')} />;
  return <Dashboard perfil={perfil} onReset={() => { setPerfil(null); setScreen('home'); }} />;
}
