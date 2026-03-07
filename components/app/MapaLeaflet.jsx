'use client';
import { useEffect, useRef, useState } from 'react';

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) return resolve(window.L);
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (document.getElementById('leaflet-js')) {
      const check = setInterval(() => { if (window.L) { clearInterval(check); resolve(window.L); } }, 50);
      return;
    }
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(window.L);
    document.head.appendChild(script);
  });
}

export default function MapaLeaflet({ proyectos, selected, onSelect, highlight }) {
  const containerRef = useRef(null);
  const mapInst      = useRef(null);
  const markersRef   = useRef({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let destroyed = false;
    loadLeaflet().then((L) => {
      if (destroyed || !containerRef.current || mapInst.current) return;

      const map = L.map(containerRef.current, {
        center: [-12.094, -77.047],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
        tap: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
      L.control.attribution({ prefix: '© OSM' }).addTo(map);
      mapInst.current = map;

      const ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(containerRef.current);

      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) map.invalidateSize();
      }, { threshold: 0.1 });
      io.observe(containerRef.current);

      [100, 300, 600, 1200].forEach(t => setTimeout(() => map.invalidateSize(), t));
      setReady(true);

      return () => { ro.disconnect(); io.disconnect(); };
    });

    return () => {
      destroyed = true;
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; markersRef.current = {}; }
    };
  }, []);

  useEffect(() => {
    const map = mapInst.current;
    const L   = window.L;
    if (!map || !L) return;

    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    proyectos.forEach(p => {
      if (!p.lat || !p.lng || p.lat === 0) return;

      const isActive = highlight === p.id || selected?.includes(p.id);

      // Color base según seguridad del distrito
      // Verde=#22c55e texto negro | Naranja=#f59e0b texto negro | Rojo=#ef4444 texto blanco
      const PINS = {
        '#22c55e': { text: '#000' },
        '#f59e0b': { text: '#000' },
        '#ef4444': { text: '#fff' },
      };
      const base = p.pin_color || '#22c55e';
      const baseText = PINS[base]?.text || '#000';

      // Normal: fondo=color, texto=baseText, borde=baseText
      // Seleccionado: invertido — fondo=baseText, texto=base, borde=base
      const bgColor    = isActive ? baseText : base;
      const textColor  = isActive ? base     : baseText;
      const borderColor = textColor;

      const scale = isActive ? 1.2 : 1;

      const precio = p.precio_desde >= 1000000
        ? `S/ ${(p.precio_desde / 1000000).toFixed(1)}M`
        : `S/ ${Math.round(p.precio_desde / 1000)}K`;

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="transform:scale(${scale});transform-origin:center bottom;">
            <div style="
              background:${bgColor};color:${textColor};
              font-size:10px;font-weight:800;
              font-family:-apple-system,sans-serif;
              padding:4px 8px;border-radius:6px;
              border:1.5px solid ${borderColor};
              box-shadow:0 2px 8px ${bgColor}88;
              white-space:nowrap;line-height:1.2;cursor:pointer;
            ">${precio}</div>
            <div style="
              width:0;height:0;margin:0 auto;
              border-left:5px solid transparent;
              border-right:5px solid transparent;
              border-top:6px solid ${bgColor};
            "></div>
          </div>`,
        iconSize: [64, 30],
        iconAnchor: [32, 30],
        tooltipAnchor: [0, -32],
      });

      const marker = L.marker([p.lat, p.lng], { icon })
        .addTo(map)
        .bindTooltip(
          `<div style="font-weight:800;font-size:12px">${p.nombre}</div>
           <div style="font-size:10px;color:#666;margin-top:2px">${p.distrito}</div>`,
          { direction: 'top', offset: [0, 0], className: 'dm-tooltip' }
        )
        .on('click', () => onSelect(p.id));

      markersRef.current[p.id] = marker;
    });

    map.invalidateSize();
  }, [ready, proyectos, selected, highlight]);

  return (
    <>
      <style>{`
        .dm-tooltip {
          background:#fff !important;
          border:1px solid #e5e7eb !important;
          border-radius:8px !important;
          padding:6px 10px !important;
          box-shadow:0 4px 12px rgba(0,0,0,0.15) !important;
        }
        .dm-tooltip::before { display:none !important; }
        .leaflet-container { font-family:-apple-system,sans-serif; }
      `}</style>
      <div ref={containerRef} style={{ width:'100%', height:'100%', borderRadius:12, background:'#111' }} />
    </>
  );
}
