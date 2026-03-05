// app/sitemap.js — Generado automáticamente por Next.js en build time
// Google lo encuentra en https://depamatch.pe/sitemap.xml

import { DISTRITOS_SEO, COMPARATIVAS_SEO, GUIAS_SEO } from '@/lib/data';

export default function sitemap() {
  const base = 'https://depamatch.pe';
  const now = new Date().toISOString();

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/mercado`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },

    ...Object.keys(DISTRITOS_SEO).map(slug => ({
      url: `${base}/mercado/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),

    ...COMPARATIVAS_SEO.map(c => ({
      url: `${base}/comparar/${c.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),

    ...GUIAS_SEO.map(g => ({
      url: `${base}/guia/${g.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
  ];
}
