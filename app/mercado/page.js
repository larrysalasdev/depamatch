// app/mercado/page.js — SSG: generado en build, leído perfectamente por Google
import { DISTRITOS_SEO, COMPARATIVAS_SEO, GUIAS_SEO, BCRP_DATA } from '@/lib/data';
import { Nav, Footer, Breadcrumbs } from '@/components/shared/Nav';

export const metadata = {
  title: 'Precio m² en Lima 2025 por distrito — Surquillo, Jesús María, San Miguel',
  description: 'Ranking actualizado del precio por metro cuadrado en Lima Moderna: Jesús María S/ 7,100, Surquillo S/ 6,850, San Miguel S/ 6,150, Lince S/ 5,900. Datos BCRP Q4 2024.',
  keywords: ['precio m2 lima 2025', 'mercado inmobiliario lima moderna', 'departamentos estreno lima precios', 'precio metro cuadrado distritos lima'],
  alternates: { canonical: 'https://depamatch.pe/mercado' },
  openGraph: { title: 'Precio m² en Lima 2025 — DepaMatch', description: 'Ranking de precios por m² en Lima Moderna con datos BCRP, seguridad DataCrim y proyección de plusvalía.' },
};

const MES_ACTUAL = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(new Date());

export default function MercadoPage() {
  const distritos = Object.values(DISTRITOS_SEO).sort((a, b) => b.precio_m2 - a.precio_m2);
  const totalProyectos = distritos.reduce((s, d) => s + (d.proyectos_activos || 0), 0);
  const avgM2 = Math.round(distritos.reduce((s, d) => s + d.precio_m2, 0) / distritos.length);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Mercado inmobiliario Lima 2025 — Precios m² por distrito',
    description: metadata.description,
    url: 'https://depamatch.pe/mercado',
    publisher: { '@type': 'Organization', name: 'DepaMatch', url: 'https://depamatch.pe' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Nav />
      <Breadcrumbs items={[{ label: 'DepaMatch', url: '/' }, { label: 'Mercado Lima', url: '/mercado' }]} />

      {/* HERO */}
      <section className="seo-hero">
        <div className="seo-badge">🏙️ Lima Metropolitana · Actualizado {MES_ACTUAL}</div>
        <h1 className="seo-h1">Precio m² en Lima 2025:<br /><em>Ranking por distrito</em></h1>
        <p className="seo-lead">
          Datos verificados del BCRP, DataCrim PNP e INDECOPI. El análisis más completo
          del mercado inmobiliario de Lima para compradores e inversores.
        </p>
        <div className="seo-stats">
          <div className="seo-stat">
            <div className="seo-stat-val">{distritos.length}</div>
            <div className="seo-stat-label">Distritos analizados</div>
          </div>
          <div className="seo-stat">
            <div className="seo-stat-val yellow">S/ {avgM2.toLocaleString('es-PE')}</div>
            <div className="seo-stat-label">Precio m² promedio</div>
          </div>
          <div className="seo-stat">
            <div className="seo-stat-val">{totalProyectos}</div>
            <div className="seo-stat-label">Proyectos activos</div>
          </div>
        </div>
      </section>

      <main className="seo-wrapper">

        {/* RANKING TABLA */}
        <div className="seo-card">
          <div className="seo-card-eyebrow">RANKING · BCRP Q4 2024</div>
          <div className="seo-card-title">Precio m² por distrito — Lima Moderna</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Distrito</th>
                  <th>Precio m²</th>
                  <th>Plusvalía 3yr</th>
                  <th>Seguridad</th>
                  <th>Proyectos</th>
                </tr>
              </thead>
              <tbody>
                {distritos.map((d, i) => (
                  <tr key={d.slug}>
                    <td style={{ color: '#444', fontWeight: 700 }}>#{i + 1}</td>
                    <td>
                      <a href={`/mercado/${d.slug}`} style={{ color: '#fff', fontWeight: 700, textDecoration: 'none' }}>
                        {d.nombre}
                      </a>
                      <div style={{ fontSize: 10, color: '#555' }}>{d.zona}</div>
                    </td>
                    <td><span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 900, color: 'var(--teal)', fontSize: 15 }}>S/ {d.precio_m2.toLocaleString('es-PE')}</span></td>
                    <td style={{ color: 'var(--yellow)', fontWeight: 700 }}>{d.proyeccion_plusvalia_3y}</td>
                    <td style={{ color: d.indice_seguridad >= 65 ? 'var(--green)' : d.indice_seguridad >= 45 ? 'var(--orange)' : 'var(--red)' }}>
                      {d.nivel_seguridad}
                    </td>
                    <td style={{ color: '#888' }}>{d.proyectos_activos || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sources">
            Fuente: Banco Central de Reserva del Perú (BCRP) · Reporte de Estabilidad Financiera Q4 2024 ·
            <a href="https://estadisticas.bcrp.gob.pe" target="_blank" rel="noopener noreferrer"> estadisticas.bcrp.gob.pe</a>
          </div>
        </div>

        {/* ANÁLISIS DE PLUSVALÍA */}
        <div className="seo-card">
          <div className="seo-card-eyebrow">ANÁLISIS · MEJOR INVERSIÓN</div>
          <div className="seo-card-title">¿Qué distrito tiene la mayor plusvalía en Lima?</div>
          <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            La Victoria (zona Santa Catalina) lidera con proyección del <strong style={{ color: 'var(--yellow)' }}>+42% en 3 años</strong>, seguida por Surquillo (+27%) y Jesús María (+26%). La renovación urbana de Santa Catalina,
            su acceso al Metropolitano y la Línea 1 del Metro, y el precio aún 27% por debajo de Miraflores son los factores que explican esa ventaja.
          </p>
          <div className="data-grid">
            {BCRP_DATA.ranking_plusvalia.map((d, i) => {
              const info = Object.values(DISTRITOS_SEO).find(x => x.nombre === d);
              return (
                <a key={d} href={`/mercado/${info?.slug}`} className="data-cell" style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ color: '#444', fontSize: 10, marginBottom: 4 }}>#{i + 1}</div>
                  <div className="data-cell-val" style={{ color: 'var(--yellow)', fontSize: 20 }}>{BCRP_DATA.proyeccion_3y[d]}</div>
                  <div className="data-cell-label">{d}</div>
                  <div className="data-cell-sub">S/ {(BCRP_DATA.precio_m2[d] || 0).toLocaleString('es-PE')}/m²</div>
                </a>
              );
            })}
          </div>
        </div>

        {/* PÁGINAS DE DISTRITO */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>ANÁLISIS POR DISTRITO</div>
          <div className="related-grid">
            {distritos.map(d => (
              <a key={d.slug} href={`/mercado/${d.slug}`} className="related-card">
                <div className="related-card-eye">{d.zona.toUpperCase()}</div>
                <div className="related-card-title">{d.nombre}</div>
                <div className="related-card-sub">S/ {d.precio_m2.toLocaleString('es-PE')}/m² · {d.proyeccion_plusvalia_3y} plusvalía</div>
              </a>
            ))}
          </div>
        </div>

        {/* COMPARATIVAS */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>COMPARATIVAS POPULARES</div>
          <div className="related-grid">
            {COMPARATIVAS_SEO.map(c => (
              <a key={c.slug} href={`/comparar/${c.slug}`} className="related-card">
                <div className="related-card-eye">⚔️ COMPARATIVA</div>
                <div className="related-card-title">{c.titulo}</div>
                <div className="related-card-sub">{c.descripcion.slice(0, 70)}…</div>
              </a>
            ))}
          </div>
        </div>

        {/* GUÍAS */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>GUÍAS DE COMPRA</div>
          <div className="related-grid">
            {GUIAS_SEO.map(g => (
              <a key={g.slug} href={`/guia/${g.slug}`} className="related-card">
                <div className="related-card-eye">{g.categoria.toUpperCase()}</div>
                <div className="related-card-title">{g.titulo}</div>
                <div className="related-card-sub">{g.tiempo_lectura} de lectura</div>
              </a>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="cta-banner">
          <h3>¿No sabes qué distrito es el tuyo?</h3>
          <p>El Match Inteligente de DepaMatch analiza tu perfil y recomienda el mejor proyecto según tu presupuesto, objetivo y prioridades. Gratis, en 3 minutos.</p>
          <a href="/" className="btn-primary">🎯 Hacer mi Match gratis</a>
        </div>

      </main>
      <Footer />
    </>
  );
}
