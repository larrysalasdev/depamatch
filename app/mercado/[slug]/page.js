// app/mercado/[slug]/page.js — SSG: una página por distrito, generada en build time
import { DISTRITOS_SEO, COMPARATIVAS_SEO } from '@/lib/data';
import { Nav, Footer, Breadcrumbs } from '@/components/shared/Nav';
import { notFound } from 'next/navigation';

// Genera rutas estáticas para todos los distritos en /lib/data.js
export async function generateStaticParams() {
  return Object.keys(DISTRITOS_SEO).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const d = DISTRITOS_SEO[params.slug];
  if (!d) return {};
  return {
    title: `Departamentos en ${d.nombre} 2025: Precio m², seguridad y proyectos`,
    description: `Precio m² en ${d.nombre}: S/ ${d.precio_m2.toLocaleString('es-PE')}. Seguridad: ${d.nivel_seguridad}. Plusvalía proyectada: ${d.proyeccion_plusvalia_3y} a 3 años. ${d.proyectos_activos} proyectos activos. Datos BCRP y DataCrim.`,
    keywords: d.keywords_long_tail || [],
    alternates: { canonical: `https://depamatch.pe/mercado/${params.slug}` },
    openGraph: {
      title: `Departamentos en ${d.nombre} 2025 — DepaMatch`,
      description: `Precio m² S/ ${d.precio_m2.toLocaleString('es-PE')} · Plusvalía ${d.proyeccion_plusvalia_3y} · ${d.nivel_seguridad}`,
    },
  };
}

const MES_ACTUAL = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(new Date());

function secColor(score) {
  if (score >= 65) return '#22c55e';
  if (score >= 45) return '#f59e0b';
  return '#ef4444';
}
function barWidth(score, max = 100) { return `${Math.min(100, (score / max) * 100)}%`; }

export default function DistritoPage({ params }) {
  const d = DISTRITOS_SEO[params.slug];
  if (!d) notFound();

  const otros = Object.values(DISTRITOS_SEO).filter(x => x.slug !== params.slug);
  const variacion = (((d.precio_m2 - d.precio_m2_anterior) / d.precio_m2_anterior) * 100).toFixed(1);
  const sc = secColor(d.indice_seguridad);
  const comparativasRelacionadas = COMPARATIVAS_SEO.filter(c => c.distrito_a === params.slug || c.distrito_b === params.slug);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Departamentos en ${d.nombre} 2025: Precio m², seguridad y proyectos`,
    description: `Precio m² en ${d.nombre}: S/ ${d.precio_m2.toLocaleString('es-PE')}`,
    dateModified: new Date().toISOString().split('T')[0],
    publisher: { '@type': 'Organization', name: 'DepaMatch', url: 'https://depamatch.pe' },
    mainEntity: {
      '@type': 'FAQPage',
      mainEntity: d.faqs.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Nav />
      <Breadcrumbs items={[
        { label: 'DepaMatch', url: '/' },
        { label: 'Mercado Lima', url: '/mercado' },
        { label: d.nombre, url: `/mercado/${d.slug}` },
      ]} />

      {/* HERO */}
      <section className="seo-hero">
        <div className="seo-badge">📍 {d.zona} · Actualizado {MES_ACTUAL}</div>
        <h1 className="seo-h1">Departamentos en <em>{d.nombre}</em>:<br />Precios, seguridad y proyectos 2025</h1>
        <p className="seo-lead">{d.descripcion}</p>
        <div className="seo-stats">
          <div className="seo-stat">
            <div className="seo-stat-val">S/ {d.precio_m2.toLocaleString('es-PE')}</div>
            <div className="seo-stat-label">Precio m² promedio</div>
          </div>
          <div className="seo-stat">
            <div className="seo-stat-val yellow">{d.proyeccion_plusvalia_3y}</div>
            <div className="seo-stat-label">Plusvalía proyectada 3yr</div>
          </div>
          <div className="seo-stat">
            <div className="seo-stat-val" style={{ color: sc }}>{d.indice_seguridad}/100</div>
            <div className="seo-stat-label">Índice seguridad</div>
          </div>
          <div className="seo-stat">
            <div className="seo-stat-val">{d.proyectos_activos}</div>
            <div className="seo-stat-label">Proyectos activos</div>
          </div>
        </div>
      </section>

      <main className="seo-wrapper">

        {/* PRECIO M² */}
        <div className="seo-card">
          <div className="seo-card-eyebrow">ANÁLISIS DE MERCADO · BCRP 2024</div>
          <div className="seo-card-title">Precio por m² en {d.nombre}</div>
          <div className="data-grid">
            <div className="data-cell">
              <div className="data-cell-val" style={{ color: 'var(--teal)' }}>S/ {d.precio_m2.toLocaleString('es-PE')}</div>
              <div className="data-cell-label">Precio m² actual</div>
              <div className="data-cell-sub" style={{ color: Number(variacion) >= 0 ? '#22c55e' : '#ef4444' }}>
                {Number(variacion) >= 0 ? '▲' : '▼'} {Math.abs(Number(variacion))}% vs año anterior
              </div>
            </div>
            <div className="data-cell">
              <div className="data-cell-val" style={{ color: 'var(--yellow)' }}>{d.proyeccion_plusvalia_3y}</div>
              <div className="data-cell-label">Plusvalía proyectada 3yr</div>
              <div className="data-cell-sub">{d.proyeccion_plusvalia_anual} anual promedio</div>
            </div>
            <div className="data-cell">
              <div className="data-cell-val">S/ {d.precio_desde?.toLocaleString('es-PE') ?? '—'}</div>
              <div className="data-cell-label">Precio desde</div>
              <div className="data-cell-sub">Proyectos en catálogo</div>
            </div>
            <div className="data-cell">
              <div className="data-cell-val">S/ {d.precio_hasta?.toLocaleString('es-PE') ?? '—'}</div>
              <div className="data-cell-label">Precio hasta</div>
              <div className="data-cell-sub">Rango actual del mercado</div>
            </div>
          </div>
          <div className="sources">
            Fuente: Banco Central de Reserva del Perú (BCRP) · Reporte de Estabilidad Financiera Q4 2024 ·
            <a href="https://estadisticas.bcrp.gob.pe" target="_blank" rel="noopener noreferrer"> estadisticas.bcrp.gob.pe</a>
          </div>
        </div>

        {/* SEGURIDAD */}
        <div className="seo-card">
          <div className="seo-card-eyebrow">SEGURIDAD · DATACRIM PNP/INEI</div>
          <div className="seo-card-title">Índice de seguridad en {d.nombre}</div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', marginTop: 4 }}>
            <div style={{ background: `${sc}12`, border: `1px solid ${sc}25`, borderRadius: 14, padding: '18px 24px', textAlign: 'center', minWidth: 110 }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 40, fontWeight: 900, color: sc }}>{d.indice_seguridad}</div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>Índice /100</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: sc, marginTop: 4 }}>{d.nivel_seguridad}</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="progress-row">
                <span className="progress-label">Delitos/mes</span>
                <div className="progress-bg"><div className="progress-fill" style={{ width: barWidth(d.delitos_mes, 100), background: sc }} /></div>
                <span className="progress-val">{d.delitos_mes}</span>
              </div>
              <div className="progress-row">
                <span className="progress-label">Patrullaje</span>
                <div className="progress-bg">
                  <div className="progress-fill" style={{ width: d.patrullaje === 'Muy Alto' ? '90%' : d.patrullaje === 'Alto' ? '70%' : d.patrullaje === 'Moderado' ? '45%' : '25%', background: 'var(--teal)' }} />
                </div>
                <span className="progress-val" style={{ width: 60, fontSize: 10 }}>{d.patrullaje}</span>
              </div>
              <p style={{ fontSize: 12, color: '#555', marginTop: 10, lineHeight: 1.6 }}>
                Índice DataCrim calculado desde el registro de denuncias de la PNP. 100 = máxima seguridad.
              </p>
            </div>
          </div>
          <div className="sources">
            Fuente: DataCrim Ciudadano · PNP / INEI ·
            <a href="https://estadisticas.pnp.gob.pe" target="_blank" rel="noopener noreferrer"> estadisticas.pnp.gob.pe</a>
          </div>
        </div>

        {/* CONECTIVIDAD */}
        <div className="seo-card">
          <div className="seo-card-eyebrow">CONECTIVIDAD Y SERVICIOS</div>
          <div className="seo-card-title">Qué tiene cerca {d.nombre}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginTop: 8 }}>
            {[
              ['🚌 Transporte', d.transporte],
              ['🏫 Colegios', d.colegios_cercanos],
              ['🏥 Salud', d.hospitales_cercanos],
            ].map(([title, items]) => (
              <div key={title}>
                <div style={{ fontSize: 11, color: '#444', fontWeight: 700, marginBottom: 8 }}>{title}</div>
                {items.map(item => (
                  <div key={item} style={{ fontSize: 13, color: '#bbb', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{item}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="cta-banner">
          <h3>¿Buscas departamento en <em style={{ color: 'var(--teal)', fontStyle: 'normal' }}>{d.nombre}</em>?</h3>
          <p>El Match Inteligente te muestra el proyecto que mejor se adapta a tu perfil, presupuesto y objetivos. Gratis, en 3 minutos.</p>
          <a href={`/?distrito=${d.slug}`} className="btn-primary">🎯 Ver proyectos en {d.nombre}</a>
          <a href="/guia/precio-m2-lima-2025" className="btn-ghost">Ver ranking Lima →</a>
        </div>

        {/* FAQs con schema FAQPage */}
        <div className="seo-card" itemScope itemType="https://schema.org/FAQPage">
          <div className="seo-card-eyebrow">PREGUNTAS FRECUENTES</div>
          <div className="seo-card-title">Todo sobre comprar en {d.nombre}</div>
          <div>
            {d.faqs.map((f, i) => (
              <div key={i} className="faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <div className="faq-q" itemProp="name">{f.q}</div>
                <div className="faq-a" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <span itemProp="text">{f.a}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMPARATIVAS RELACIONADAS */}
        {comparativasRelacionadas.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
              COMPARAR {d.nombre.toUpperCase()} CON OTROS DISTRITOS
            </div>
            <div className="related-grid">
              {comparativasRelacionadas.map(c => (
                <a key={c.slug} href={`/comparar/${c.slug}`} className="related-card">
                  <div className="related-card-eye">⚔️ COMPARATIVA</div>
                  <div className="related-card-title">{c.titulo}</div>
                  <div className="related-card-sub">Precios · Seguridad · Plusvalía</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* OTROS DISTRITOS */}
        <div>
          <div style={{ fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>OTROS DISTRITOS EN LIMA MODERNA</div>
          <div className="related-grid">
            {otros.map(od => (
              <a key={od.slug} href={`/mercado/${od.slug}`} className="related-card">
                <div className="related-card-eye">{od.zona.toUpperCase()}</div>
                <div className="related-card-title">{od.nombre}</div>
                <div className="related-card-sub">S/ {od.precio_m2.toLocaleString('es-PE')}/m² · {od.proyeccion_plusvalia_3y} plusvalía</div>
              </a>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
