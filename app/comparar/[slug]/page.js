// app/comparar/[slug]/page.js — SSG: comparativas entre distritos
import { COMPARATIVAS_SEO, DISTRITOS_SEO } from '@/lib/data';
import { Nav, Footer, Breadcrumbs } from '@/components/shared/Nav';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return COMPARATIVAS_SEO.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const comp = COMPARATIVAS_SEO.find(c => c.slug === params.slug);
  if (!comp) return {};
  const da = DISTRITOS_SEO[comp.distrito_a];
  const db = DISTRITOS_SEO[comp.distrito_b];
  return {
    title: `${da.nombre} vs ${db.nombre} 2025: Precio m², seguridad y plusvalía`,
    description: `Comparativa completa ${da.nombre} vs ${db.nombre}: precio m², seguridad DataCrim, plusvalía BCRP. ¿Cuál es mejor para comprar departamento en Lima?`,
    keywords: comp.keywords,
    alternates: { canonical: `https://depamatch.pe/comparar/${params.slug}` },
  };
}

const MES_ACTUAL = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(new Date());

export default function CompararPage({ params }) {
  const comp = COMPARATIVAS_SEO.find(c => c.slug === params.slug);
  if (!comp) notFound();

  const da = DISTRITOS_SEO[comp.distrito_a];
  const db = DISTRITOS_SEO[comp.distrito_b];

  const metricas = [
    {
      label: 'Precio m²', unit: 'S/',
      a: `S/ ${da.precio_m2.toLocaleString('es-PE')}`,
      b: `S/ ${db.precio_m2.toLocaleString('es-PE')}`,
      winner: da.precio_m2 < db.precio_m2 ? 'a' : 'b',
      nota: 'Más bajo = mejor precio de entrada',
    },
    {
      label: 'Plusvalía 3 años',
      a: da.proyeccion_plusvalia_3y, b: db.proyeccion_plusvalia_3y,
      winner: parseFloat(da.proyeccion_plusvalia_3y) > parseFloat(db.proyeccion_plusvalia_3y) ? 'a' : 'b',
      nota: 'Mayor % = más valorización esperada',
    },
    {
      label: 'Índice seguridad',
      a: `${da.indice_seguridad}/100`, b: `${db.indice_seguridad}/100`,
      winner: da.indice_seguridad > db.indice_seguridad ? 'a' : 'b',
      nota: 'Mayor = más seguro',
    },
    {
      label: 'Delitos/mes',
      a: da.delitos_mes, b: db.delitos_mes,
      winner: da.delitos_mes < db.delitos_mes ? 'a' : 'b',
      nota: 'Menor = más tranquilo',
    },
    {
      label: 'Nivel patrullaje',
      a: da.patrullaje, b: db.patrullaje,
      winner: null, nota: '',
    },
    {
      label: 'Proyectos activos',
      a: da.proyectos_activos ?? '—', b: db.proyectos_activos ?? '—',
      winner: null, nota: '',
    },
    {
      label: 'Precio desde',
      a: `S/ ${da.precio_desde?.toLocaleString('es-PE') ?? '—'}`,
      b: `S/ ${db.precio_desde?.toLocaleString('es-PE') ?? '—'}`,
      winner: (da.precio_desde && db.precio_desde) ? (da.precio_desde < db.precio_desde ? 'a' : 'b') : null,
      nota: '',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${da.nombre} vs ${db.nombre}: ¿Dónde comprar departamento en Lima?`,
    description: comp.descripcion,
    dateModified: new Date().toISOString().split('T')[0],
    publisher: { '@type': 'Organization', name: 'DepaMatch', url: 'https://depamatch.pe' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Nav />
      <Breadcrumbs items={[
        { label: 'DepaMatch', url: '/' },
        { label: 'Mercado Lima', url: '/mercado' },
        { label: comp.titulo, url: `/comparar/${comp.slug}` },
      ]} />

      <section className="seo-hero">
        <div className="seo-badge">⚔️ Comparativa de distritos · {MES_ACTUAL}</div>
        <h1 className="seo-h1"><em>{da.nombre}</em> vs <em>{db.nombre}</em>:<br />¿Dónde comprar tu departamento?</h1>
        <p className="seo-lead">{comp.descripcion}</p>
      </section>

      <main className="seo-wrapper">

        {/* TABLA COMPARATIVA */}
        <div className="seo-card">
          <div className="seo-card-eyebrow">COMPARATIVA DIRECTA · DATOS VERIFICADOS</div>
          <div className="seo-card-title">{da.nombre} vs {db.nombre}: Métricas clave</div>
          <div style={{ overflowX: 'auto', marginTop: 8 }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th style={{ color: 'var(--teal)' }}>{da.nombre}</th>
                  <th style={{ color: 'var(--yellow)' }}>{db.nombre}</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                {metricas.map((m, i) => (
                  <tr key={i}>
                    <td style={{ color: '#666' }}>{m.label}</td>
                    <td className={m.winner === 'a' ? 'winner-cell' : ''}>{m.a}</td>
                    <td className={m.winner === 'b' ? 'winner-cell-b' : ''}>{m.b}</td>
                    <td style={{ color: '#444', fontSize: 11 }}>{m.nota}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sources">Fuentes: BCRP Q4 2024 · DataCrim PNP/INEI</div>
        </div>

        {/* PERFIL LADO A LADO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          {[da, db].map((d, i) => (
            <div key={d.slug} className="seo-card" style={{ marginBottom: 0, borderColor: i === 0 ? 'rgba(46,223,196,0.2)' : 'rgba(255,214,0,0.2)' }}>
              <div className="seo-card-eyebrow" style={{ color: i === 0 ? 'var(--teal)' : 'var(--yellow)' }}>
                {i === 0 ? 'OPCIÓN A' : 'OPCIÓN B'}
              </div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 900, fontSize: 18, color: '#fff', marginBottom: 12 }}>{d.nombre}</div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 12, lineHeight: 1.6 }}>{d.descripcion}</div>
              <div style={{ fontSize: 11, color: '#555' }}>Mejor para:</div>
              <div style={{ fontSize: 12, color: '#ccc', marginTop: 4, lineHeight: 1.6 }}>
                {d.indice_seguridad >= 65 ? '✓ Familias que priorizan seguridad' : d.indice_seguridad >= 45 ? '✓ Perfil balanceado seguridad/precio' : '✓ Inversores que priorizan plusvalía'}
              </div>
            </div>
          ))}
        </div>

        {/* VEREDICTO */}
        <div className="seo-card" style={{ borderColor: 'rgba(46,223,196,0.2)' }}>
          <div className="seo-card-eyebrow">VEREDICTO DEPAMATCH</div>
          <div className="seo-card-title">¿Cuál elegir?</div>
          <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7 }}>{comp.razon}</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <a href={`/mercado/${da.slug}`} className="btn-ghost" style={{ marginLeft: 0 }}>Ver análisis {da.nombre} →</a>
            <a href={`/mercado/${db.slug}`} className="btn-ghost" style={{ marginLeft: 0 }}>Ver análisis {db.nombre} →</a>
          </div>
        </div>

        {/* CTA */}
        <div className="cta-banner">
          <h3>¿Cuál es el mejor distrito <em style={{ color: 'var(--teal)', fontStyle: 'normal' }}>para tu perfil</em>?</h3>
          <p>El distrito ideal depende de tu presupuesto, objetivo (vivir o invertir) y prioridades personales. El Match Inteligente te lo dice en 3 minutos.</p>
          <a href="/" className="btn-primary">🎯 Hacer mi Match gratis</a>
        </div>

        {/* OTRAS COMPARATIVAS */}
        <div>
          <div style={{ fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>OTRAS COMPARATIVAS</div>
          <div className="related-grid">
            {COMPARATIVAS_SEO.filter(c => c.slug !== params.slug).map(c => (
              <a key={c.slug} href={`/comparar/${c.slug}`} className="related-card">
                <div className="related-card-eye">⚔️ COMPARATIVA</div>
                <div className="related-card-title">{c.titulo}</div>
                <div className="related-card-sub">{c.descripcion.slice(0, 65)}…</div>
              </a>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
