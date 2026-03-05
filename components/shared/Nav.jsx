// ─── components/shared/Nav.jsx ────────────────────────────────────────────────
export function Nav() {
  return (
    <>
      <style>{`
        .dm-nav{background:rgba(20,20,20,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.07);padding:0 20px;display:flex;align-items:center;justify-content:space-between;height:60px;position:sticky;top:0;z-index:100;}
        .dm-logo{font-family:'Space Grotesk',sans-serif;font-weight:900;font-size:20px;color:#fff;text-decoration:none;display:flex;align-items:center;}
        .dm-logo span{color:#2EDFC4;}
        .dm-nav-links{display:flex;gap:20px;align-items:center;}
        .dm-nav-links a{color:#666;font-size:13px;text-decoration:none;transition:color .2s;}
        .dm-nav-links a:hover{color:#fff;}
        .dm-nav-cta{background:linear-gradient(135deg,#FFD600,#F5C800);color:#000;padding:8px 16px;border-radius:10px;font-weight:800;font-size:13px;text-decoration:none;}
        .dm-nav-cta:hover{opacity:.9;}
        @media(max-width:600px){.dm-nav-links{display:none;}}
      `}</style>
      <nav className="dm-nav">
        <a href="/" className="dm-logo">Depa<span>Match</span></a>
        <div className="dm-nav-links">
          <a href="/mercado">Mercado</a>
          <a href="/guia/precio-m2-lima-2025">Precio m²</a>
          <a href="/guia/checklist-comprar-departamento-estreno">Guías</a>
          <a href="/" className="dm-nav-cta">🎯 Hacer mi Match</a>
        </div>
      </nav>
    </>
  );
}

export function Footer() {
  return (
    <footer style={{background:'#141414',borderTop:'1px solid rgba(255,255,255,0.07)',padding:'40px 20px',textAlign:'center',marginTop:'auto'}}>
      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:900,color:'#fff',marginBottom:12}}>
        Depa<span style={{color:'#2EDFC4'}}>Match</span>
      </div>
      <div style={{display:'flex',gap:20,justifyContent:'center',flexWrap:'wrap',marginBottom:16}}>
        {[
          ['/mercado','Mercado Lima'],
          ['/guia/precio-m2-lima-2025','Precio m²'],
          ['/guia/bono-mi-vivienda-2025','Bono Mi Vivienda'],
          ['/guia/per-inmobiliario-lima','PER Inmobiliario'],
          ['/comparar/surquillo-vs-jesus-maria','Comparar Distritos'],
        ].map(([href,label])=>(
          <a key={href} href={href} style={{color:'#444',fontSize:13,textDecoration:'none'}}>{label}</a>
        ))}
      </div>
      <div style={{color:'#2a2a2a',fontSize:12}}>
        © {new Date().getFullYear()} DepaMatch · Vale Real Estate SAC ·
        Datos: BCRP, DataCrim PNP/INEI, SBS, INDECOPI
      </div>
    </footer>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <div style={{padding:'12px 20px',maxWidth:900,margin:'0 auto',fontSize:12,color:'#444'}}>
      {items.map((item, i) => (
        <span key={i}>
          {i < items.length - 1
            ? <><a href={item.url} style={{color:'#444',textDecoration:'none'}}>{item.label}</a><span style={{margin:'0 6px'}}>›</span></>
            : <span style={{color:'#555'}}>{item.label}</span>
          }
        </span>
      ))}
    </div>
  );
}
