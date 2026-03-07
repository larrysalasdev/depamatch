// app/api/ticker/route.js
// Genera datos del ticker usando Claude + web search, cacheado 24h

import { NextResponse } from 'next/server';

// Cache en memoria (se resetea con cada deploy, luego se refresca solo)
let cache = { data: null, ts: 0 };
const TTL = 24 * 60 * 60 * 1000; // 24 horas

const FALLBACK = [
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

export async function GET() {
  // Servir caché si es reciente
  if (cache.data && Date.now() - cache.ts < TTL) {
    return NextResponse.json(cache.data, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' }
    });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: `Eres un analista del mercado inmobiliario peruano. Tu tarea es buscar los datos más recientes disponibles sobre el mercado inmobiliario de Lima y devolver exactamente un JSON array con 12 items. Cada item tiene: dot (color hex llamativo), label (emoji + nombre corto, max 25 chars), value (dato clave llamativo), sub (fuente + fecha corta). Responde SOLO con el JSON array, sin markdown ni texto extra. Usa datos reales y actualizados de BCRP, SBS, ASEI, Urbania, INEI. Incluye: precios m² por distrito, tasas hipotecarias, variaciones de precio, índices de accesibilidad, datos de demanda. Los colores deben ser: #2EDFC4, #22c55e, #f59e0b, #ef4444, #8b5cf6 rotando.`,
        messages: [{
          role: 'user',
          content: `Busca los datos más recientes del mercado inmobiliario de Lima Perú (precio m2, tasas, variaciones por distrito). La fecha de hoy es ${new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}. Devuelve exactamente 12 items en JSON.`
        }]
      }),
    });

    const json = await res.json();

    // Extraer texto de la respuesta
    const textBlock = json.content?.find(b => b.type === 'text');
    if (!textBlock) throw new Error('No text block');

    // Limpiar y parsear JSON
    const raw = textBlock.text.replace(/```json|```/g, '').trim();
    const items = JSON.parse(raw);

    if (!Array.isArray(items) || items.length < 6) throw new Error('Invalid data');

    cache = { data: items, ts: Date.now() };
    return NextResponse.json(items, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' }
    });

  } catch (err) {
    console.error('Ticker API error:', err.message);
    // Devolver fallback si falla
    return NextResponse.json(FALLBACK, {
      headers: { 'Cache-Control': 'public, s-maxage=3600' }
    });
  }
}
