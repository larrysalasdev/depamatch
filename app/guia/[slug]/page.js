// app/guia/[slug]/page.js — SSG: guías de compra con contenido editorial completo
import { GUIAS_SEO, DISTRITOS_SEO, BCRP_DATA } from '@/lib/data';
import { Nav, Footer, Breadcrumbs } from '@/components/shared/Nav';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return GUIAS_SEO.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const g = GUIAS_SEO.find(g => g.slug === params.slug);
  if (!g) return {};
  return {
    title: g.titulo,
    description: g.descripcion,
    keywords: g.keywords,
    alternates: { canonical: `https://depamatch.pe/guia/${params.slug}` },
    openGraph: { title: g.titulo, description: g.descripcion },
  };
}

// ─── Contenido editorial por guía ────────────────────────────────────────────
// En producción esto viene de un CMS (Contentful, Sanity, etc.)
// Aquí está hardcodeado para el MVP — fácil de migrar
function getContenido(slug) {
  const distritos = Object.values(DISTRITOS_SEO).sort((a, b) => b.precio_m2 - a.precio_m2);

  if (slug === 'precio-m2-lima-2025') return (
    <article style={{ color: '#bbb', fontSize: 15, lineHeight: 1.8 }}>
      <p style={{ marginBottom: 16 }}>
        El precio por metro cuadrado en Lima Moderna ha crecido un promedio de
        <strong style={{ color: '#fff' }}> 7.8% anual</strong> entre 2021 y 2024,
        según el Reporte de Estabilidad Financiera del Banco Central de Reserva del Perú (BCRP).
        Entender cuánto cuesta el m² en cada distrito es el primer paso para tomar
        una decisión de compra o inversión inteligente.
      </p>

      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', margin: '28px 0 14px' }}>
        Ranking de precio m² en Lima Moderna (2025)
      </h2>
      <div style={{ marginBottom: 20 }}>
        {distritos.map((d, i) => (
          <div key={d.slug} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: i === 0 ? 'rgba(46,223,196,0.05)' : 'rgba(255,255,255,0.02)', borderRadius: 10, marginBottom: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 900, fontSize: 18, color: '#333', width: 28 }}>#{i + 1}</span>
            <a href={`/mercado/${d.slug}`} style={{ flex: 1, color: '#fff', fontWeight: 700, textDecoration: 'none' }}>{d.nombre}</a>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 900, color: 'var(--teal)', fontSize: 16 }}>S/ {d.precio_m2.toLocaleString('es-PE')}/m²</span>
            <span style={{ color: 'var(--yellow)', fontSize: 12, width: 50, textAlign: 'right' }}>{d.proyeccion_plusvalia_3y}</span>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', margin: '28px 0 14px' }}>
        ¿Por qué Jesús María tiene el precio m² más alto?
      </h2>
      <p style={{ marginBottom: 16 }}>
        Jesús María lidera el ranking con <strong style={{ color: '#fff' }}>S/ 7,100/m²</strong> por tres razones estructurales:
        es el distrito más seguro de Lima Moderna (28 puntos DataCrim), tiene la menor
        oferta de departamentos nuevos (lo que presiona precios al alza), y colinda
        directamente con San Isidro. Esta combinación genera una demanda sostenida
        que mantiene los precios altos incluso en ciclos negativos.
      </p>

      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', margin: '28px 0 14px' }}>
        ¿Dónde está el mejor precio-calidad en 2025?
      </h2>
      <p style={{ marginBottom: 16 }}>
        Para vivir: <a href="/mercado/surquillo" style={{ color: 'var(--teal)' }}>Surquillo</a> ofrece la mejor combinación de precio accesible
        (S/ 6,850/m²), seguridad moderada y alta plusvalía proyectada (+27%). Para invertir:
        <a href="/mercado/la-victoria" style={{ color: 'var(--teal)' }}> La Victoria</a> (zona Santa Catalina) tiene
        el mayor potencial de apreciación (+42% a 3 años) con precio aún por debajo de Miraflores.
      </p>

      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', margin: '28px 0 14px' }}>
        ¿Cómo se calcula el precio m² de un departamento?
      </h2>
      <p style={{ marginBottom: 16 }}>
        El precio m² se divide entre el área total del departamento (en metros cuadrados).
        Ojo: en proyectos en planos, el precio suele incluir área techada + área libre (balcón).
        Compara siempre el precio del m² techado, no el total, para tener una comparación justa.
      </p>
      <p style={{ marginBottom: 16 }}>
        Fórmula: <code style={{ background: '#1a1a1a', padding: '2px 8px', borderRadius: 4, fontSize: 13 }}>
          Precio m² = Precio total del depa ÷ Área techada (m²)
        </code>
      </p>
    </article>
  );

  if (slug === 'bono-mi-vivienda-2025') return (
    <article style={{ color: '#bbb', fontSize: 15, lineHeight: 1.8 }}>
      <p style={{ marginBottom: 16 }}>
        El Fondo MiVivienda ofrece en 2025 el <strong style={{ color: '#fff' }}>Bono del Buen Pagador (BBP)</strong> y
        el Bono de Sostenibilidad, que pueden reducir significativamente el monto del crédito hipotecario
        y la cuota mensual. Aquí está todo lo que necesitas saber para aprovecharlos.
      </p>

      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', margin: '28px 0 14px' }}>
        ¿Qué es el Bono del Buen Pagador (BBP)?
      </h2>
      <p style={{ marginBottom: 16 }}>
        Es un subsidio directo que el Estado peruano entrega al comprador como parte de la cuota inicial.
        No se devuelve — es un regalo del gobierno. El monto depende del valor del inmueble:
      </p>
      <div style={{ marginBottom: 20 }}>
        {[
          ['Hasta S/ 93,100', 'S/ 25,700', 'Mayor beneficio'],
          ['S/ 93,101 – S/ 139,700', 'S/ 20,000', 'Beneficio estándar'],
          ['S/ 139,701 – S/ 232,800', 'S/ 14,500', 'Beneficio base'],
          ['Proyectos sostenibles (sello verde)', '+S/ 5,000 adicional', 'Bono sostenibilidad'],
        ].map(([rango, monto, nota]) => (
          <div key={rango} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 6, gap: 12, flexWrap: 'wrap' }}>
            <span style={{ color: '#888' }}>{rango}</span>
            <span style={{ color: 'var(--teal)', fontWeight: 700 }}>{monto}</span>
            <span style={{ color: '#555', fontSize: 12 }}>{nota}</span>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', margin: '28px 0 14px' }}>
        Requisitos para el BBP 2025
      </h2>
      {[
        'No ser propietario de ningún inmueble en el Perú ni en el extranjero',
        'El inmueble debe ser para primera vivienda (uso habitual)',
        'El valor del inmueble no debe superar S/ 232,800',
        'No haber recibido previamente el BBP u otro subsidio estatal',
        'Contar con una capacidad de endeudamiento que permita acceder al crédito MiVivienda',
        'El proyecto debe estar afiliado al Fondo MiVivienda',
      ].map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <span style={{ color: 'var(--teal)', fontWeight: 700, flexShrink: 0 }}>✓</span>
          <span style={{ color: '#bbb', fontSize: 14 }}>{r}</span>
        </div>
      ))}

      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', margin: '28px 0 14px' }}>
        ¿Cuáles son los bancos autorizados?
      </h2>
      <p style={{ marginBottom: 16 }}>
        Los créditos MiVivienda se otorgan a través de entidades financieras autorizadas por el Fondo MiVivienda.
        Las más activas en Lima Moderna son BCP, BBVA, Interbank, Scotiabank, Caja Piura y Mi Banco.
        Las tasas varían entre 7.3% y 9.1% anual. Compara siempre la TCEA (Tasa de Costo Efectivo Anual),
        no solo la tasa nominal.
      </p>

      <div style={{ background: 'rgba(46,223,196,0.06)', border: '1px solid rgba(46,223,196,0.2)', borderRadius: 12, padding: '16px 20px', marginTop: 24 }}>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: 6 }}>💡 Consejo DepaMatch</div>
        <div style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>
          El BBP se puede combinar con el Bono de Sostenibilidad (+S/ 5,000) si el proyecto
          tiene certificación verde (EDGE, LEED o BREEAM). Pregunta al vendedor si el proyecto
          está certificado — puede ahorrarte hasta S/ 30,700 en la cuota inicial.
        </div>
      </div>
    </article>
  );

  if (slug === 'per-inmobiliario-lima') return (
    <article style={{ color: '#bbb', fontSize: 15, lineHeight: 1.8 }}>
      <p style={{ marginBottom: 16 }}>
        El <strong style={{ color: '#fff' }}>PER inmobiliario</strong> (Price-to-Earnings Ratio) es el indicador
        más usado por inversores para evaluar si un departamento está caro o barato en relación
        a los ingresos que puede generar. Aprende a usarlo para comparar proyectos en Lima.
      </p>

      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', margin: '28px 0 14px' }}>
        ¿Qué es el PER inmobiliario?
      </h2>
      <p style={{ marginBottom: 16 }}>
        El PER indica cuántos años de ingresos por alquiler necesitas para recuperar el precio de compra del departamento.
      </p>
      <div style={{ background: '#1a1a1a', padding: '14px 20px', borderRadius: 10, marginBottom: 20, fontFamily: 'monospace', fontSize: 14, color: '#ccc' }}>
        PER = Precio del departamento ÷ Ingreso anual por alquiler
      </div>
      <p style={{ marginBottom: 16 }}>
        Ejemplo: Un departamento de S/ 350,000 que se alquila por S/ 1,600/mes
        genera S/ 19,200/año. PER = 350,000 ÷ 19,200 = <strong style={{ color: 'var(--teal)' }}>18.2x</strong>.
      </p>

      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', margin: '28px 0 14px' }}>
        ¿PER bajo o alto, cuál es mejor?
      </h2>
      {[
        ['PER menor a 15x', 'Excelente', 'var(--green)', 'El inmueble genera rentabilidad alta. Poco común en Lima Moderna.'],
        ['PER 15x – 20x', 'Bueno', 'var(--teal)', 'Rango típico de Lima Moderna. Rentabilidad bruta del 5-6.7% anual.'],
        ['PER 20x – 25x', 'Aceptable', 'var(--orange)', 'Rentabilidad bruta del 4-5% anual. Compra razonable si hay plusvalía esperada.'],
        ['PER mayor a 25x', 'Caro', 'var(--red)', 'El precio de compra no se justifica por los ingresos de alquiler.'],
      ].map(([rango, eval_, color, desc]) => (
        <div key={rango} style={{ display: 'flex', gap: 14, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, marginBottom: 8, alignItems: 'flex-start' }}>
          <div style={{ minWidth: 120 }}>
            <div style={{ color, fontWeight: 700 }}>{eval_}</div>
            <div style={{ color: '#555', fontSize: 12 }}>{rango}</div>
          </div>
          <div style={{ color: '#888', fontSize: 13 }}>{desc}</div>
        </div>
      ))}

      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', margin: '28px 0 14px' }}>
        PER estimado por distrito en Lima
      </h2>
      <p style={{ marginBottom: 16, color: '#888', fontSize: 14 }}>
        Basado en precios m² BCRP y rentas promedio de mercado (Nexo Inmobiliario Q4 2024):
      </p>
      {[
        ['Surquillo', '18.5x', 'Bueno', 'var(--teal)'],
        ['Jesús María', '19.0x', 'Bueno', 'var(--teal)'],
        ['San Miguel', '16.8x', 'Bueno', 'var(--teal)'],
        ['Lince', '17.5x', 'Bueno', 'var(--teal)'],
        ['La Victoria (Santa Catalina)', '21.5x', 'Aceptable', 'var(--orange)'],
      ].map(([d, per, eval_, color]) => (
        <div key={d} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 6, gap: 10 }}>
          <a href={`/mercado/${d.toLowerCase().replace(/ \(.*\)/, '').replace(/ /g, '-')}`} style={{ color: '#ccc', textDecoration: 'none' }}>{d}</a>
          <span style={{ color, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif" }}>{per}</span>
          <span style={{ color: '#555', fontSize: 12 }}>{eval_}</span>
        </div>
      ))}
    </article>
  );

  if (slug === 'checklist-comprar-departamento-estreno') return (
    <article style={{ color: '#bbb', fontSize: 15, lineHeight: 1.8 }}>
      <p style={{ marginBottom: 16 }}>
        Comprar un departamento en estreno en el Perú implica firmar documentos vinculantes
        antes de que el inmueble exista físicamente. Por eso, la verificación previa
        es crítica. Esta checklist cubre los 15 puntos más importantes.
      </p>

      {[
        { num: '01', titulo: 'Verificar el estado registral en SUNARP', desc: 'Consulta la partida registral del terreno en sunarp.gob.pe. Confirma que el terreno está a nombre de la inmobiliaria, sin cargas ni gravámenes activos. Un terreno hipotecado puede generar problemas graves en la entrega.' },
        { num: '02', titulo: 'Consultar INDECOPI por sanciones al desarrollador', desc: 'Busca el RUC de la inmobiliaria en indecopi.gob.pe > "Registro de Infracciones y Sanciones". Sanciones por incumplimiento de plazos o publicidad engañosa son señales de alerta.' },
        { num: '03', titulo: 'Verificar la licencia de edificación municipal', desc: 'El municipio correspondiente debe haber emitido la licencia de edificación. Pide el número de expediente al vendedor y verifica en la municipalidad.' },
        { num: '04', titulo: 'Revisar el contrato de separación línea por línea', desc: 'El contrato de separación no es el contrato de compraventa, pero puede incluir cláusulas que afecten tu posición si decides no continuar. Lee el plazo y condiciones de devolución de la separación.' },
        { num: '05', titulo: 'Confirmar el metraje exacto en los planos', desc: 'El área indicada en la publicidad a veces incluye áreas comunes (prorateo). Pide los planos con el área techada del departamento, el área de balcón y el área total. Calcula el precio m² de cada una.' },
        { num: '06', titulo: 'Evaluar el precio m² vs el mercado del distrito', desc: 'Compara el precio m² del proyecto con el benchmark BCRP del distrito. Un precio 20% por encima del promedio sin diferencial claro en acabados o ubicación es señal de sobreprecio.' },
        { num: '07', titulo: 'Verificar el banco financiador del proyecto', desc: 'Un banco sólido (BCP, BBVA, Interbank, Scotiabank) financiando la construcción es una garantía adicional: los bancos hacen su propia due diligence antes de prestar al desarrollador.' },
        { num: '08', titulo: 'Revisar la memoria descriptiva de acabados', desc: 'El contrato debe incluir la memoria descriptiva de materiales. Si dice "o similar", tienes poco poder de reclamo si el resultado es inferior. Pide marcas o especificaciones técnicas concretas.' },
        { num: '09', titulo: 'Consultar el expediente de habilitación urbana', desc: 'Para proyectos en terrenos sin habilitación previa, confirma que la habilitación urbana esté aprobada o en proceso con resolución municipal.' },
        { num: '10', titulo: 'Pedir el cronograma de obra con hitos', desc: 'Un cronograma de obra con hitos concretos (casco, cerrado, acabados, entrega) te da herramientas para reclamar si hay retrasos. En Perú, el incumplimiento de plazos es la causa más frecuente de reclamos INDECOPI.' },
        { num: '11', titulo: 'Revisar el reglamento interno del edificio', desc: 'El reglamento define las reglas de la junta de propietarios, el uso de áreas comunes y las restricciones. Restricciones como "no se permiten mascotas" o "no Airbnb" pueden ser determinantes según tu uso.' },
        { num: '12', titulo: 'Calcular los gastos de mantenimiento estimados', desc: 'Pide la cuota de mantenimiento proyectada. En edificios con piscina, gimnasio y lobby de diseño, la cuota puede ser S/ 400–800/mes. Inclúyela en tu análisis financiero.' },
        { num: '13', titulo: 'Verificar la factibilidad de servicios públicos', desc: 'Confirma que el proyecto tiene factibilidad de agua y luz emitida por Sedapal y Enel/Luz del Sur. Sin factibilidad confirmada, la entrega puede retrasarse indefinidamente.' },
        { num: '14', titulo: 'Evaluar el entorno inmediato a 200 metros', desc: 'Visita el terreno en distintos horarios. Evalúa: ruido, usos del suelo adyacentes (fábricas, mercados, bares), flujo peatonal y vehicular. El plano puede mostrar parques que en realidad son lotes vacíos.' },
        { num: '15', titulo: 'Firmar la minuta con notario, no con el vendedor', desc: 'La minuta de compraventa y la escritura pública deben firmarse ante notario. Nunca entregues el pago de cuota inicial sin contrato firmado ante notario. Desconfía de inmobiliarias que presionan por cerrar sin documentación.' },
      ].map(item => (
        <div key={item.num} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 900, fontSize: 24, color: 'rgba(46,223,196,0.3)', flexShrink: 0, width: 36 }}>{item.num}</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{item.titulo}</div>
            <div style={{ color: '#888', fontSize: 13, lineHeight: 1.7 }}>{item.desc}</div>
          </div>
        </div>
      ))}
    </article>
  );

  return <p style={{ color: '#888' }}>Contenido en elaboración.</p>;
}

export default function GuiaPage({ params }) {
  const guia = GUIAS_SEO.find(g => g.slug === params.slug);
  if (!guia) notFound();

  const otras = GUIAS_SEO.filter(g => g.slug !== params.slug);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guia.titulo,
    description: guia.descripcion,
    dateModified: new Date().toISOString().split('T')[0],
    publisher: { '@type': 'Organization', name: 'DepaMatch', url: 'https://depamatch.pe' },
    author: { '@type': 'Organization', name: 'DepaMatch' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Nav />
      <Breadcrumbs items={[
        { label: 'DepaMatch', url: '/' },
        { label: 'Guías', url: '/guia' },
        { label: guia.titulo, url: `/guia/${params.slug}` },
      ]} />

      <section className="seo-hero" style={{ textAlign: 'left', padding: '40px 20px 32px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="seo-badge" style={{ marginBottom: 16 }}>📚 {guia.categoria} · {guia.tiempo_lectura} lectura</div>
          <h1 className="seo-h1" style={{ textAlign: 'left', fontSize: 'clamp(22px,4vw,36px)' }}>{guia.titulo}</h1>
          <p className="seo-lead" style={{ textAlign: 'left', margin: '0' }}>{guia.descripcion}</p>
        </div>
      </section>

      <main className="seo-wrapper">
        <div style={{ maxWidth: 720 }}>
          {getContenido(params.slug)}
        </div>

        {/* CTA */}
        <div className="cta-banner" style={{ maxWidth: 720 }}>
          <h3>¿Listo para encontrar tu depa ideal?</h3>
          <p>Usa DepaMatch para comparar proyectos con datos de BCRP, DataCrim, INDECOPI y SBS. Gratis, en 3 minutos.</p>
          <a href="/" className="btn-primary">🎯 Hacer mi Match gratis</a>
        </div>

        {/* Otras guías */}
        <div style={{ maxWidth: 720 }}>
          <div style={{ fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>OTRAS GUÍAS</div>
          <div className="related-grid">
            {otras.map(g => (
              <a key={g.slug} href={`/guia/${g.slug}`} className="related-card">
                <div className="related-card-eye">{g.categoria.toUpperCase()}</div>
                <div className="related-card-title">{g.titulo}</div>
                <div className="related-card-sub">{g.tiempo_lectura} lectura</div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
