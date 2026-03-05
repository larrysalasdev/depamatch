# DepaMatch — Next.js SSG

Plataforma inmobiliaria con páginas SEO estáticas + app React interactiva.

## Arquitectura

```
depamatch.pe/               → App interactiva (React client-side)
depamatch.pe/mercado        → Hub SEO: ranking precio m² Lima (SSG)
depamatch.pe/mercado/[slug] → Página por distrito (SSG) — 5 páginas
depamatch.pe/comparar/[slug]→ Comparativas entre distritos (SSG) — 4 páginas
depamatch.pe/guia/[slug]    → Guías de compra (SSG) — 4 páginas
depamatch.pe/sitemap.xml    → Auto-generado
depamatch.pe/robots.txt     → Auto-generado
```

**Total URLs indexables en build: 17**

## Cómo funciona el SEO

- Las páginas en `/mercado`, `/comparar` y `/guia` son **Server Components** de Next.js
- Usan `generateStaticParams` → Next.js las genera como HTML estático en `npm run build`
- Google las lee como HTML puro (sin JavaScript necesario) → indexación perfecta
- Cada página tiene: `<title>` único, `meta description`, `canonical`, Open Graph, Schema.org JSON-LD, `hreflang`, FAQPage schema (rich snippets)
- La app en `/` sigue siendo React client-side → no afecta el SEO de las otras rutas

## Setup local

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Deploy en Vercel (recomendado)

```bash
# Opción 1: Vercel CLI
npm i -g vercel
vercel

# Opción 2: GitHub → vercel.com → Import
# Solo conecta el repo y Vercel detecta Next.js automáticamente
```

Vercel hace el build automáticamente. Las páginas SSG se generan en cada deploy.

## Deploy en hosting estático (Netlify, S3, etc.)

```bash
# 1. Habilitar output estático en next.config.js:
#    Descomenta: output: 'export'
#    Cambia:     images: { unoptimized: true }

# 2. Build
npm run build
# Genera la carpeta /out con HTML estático puro

# 3. Subir /out a Netlify, S3 + CloudFront, etc.
```

## Agregar un nuevo distrito

1. Abrir `lib/data.js`
2. Agregar entrada en `DISTRITOS_SEO`:
```js
"nuevo-distrito": {
  nombre: "Nuevo Distrito",
  slug: "nuevo-distrito",
  precio_m2: 6500,
  // ... resto de datos
  faqs: [{ q: "...", a: "..." }],
}
```
3. Agregar proyectos del distrito en `PROYECTOS_RAW`
4. Correr `npm run build` → Next.js genera automáticamente `/mercado/nuevo-distrito`

## Agregar una nueva guía

1. En `lib/data.js`, agregar entrada en `GUIAS_SEO`
2. En `app/guia/[slug]/page.js`, agregar caso en la función `getContenido(slug)`
3. Build → la guía aparece en `/guia/[tu-slug]`

## Datos actualizados

Los datos de BCRP, DataCrim e INDECOPI están en `lib/data.js`.
Actualízalos trimestralmente con los reportes:
- **BCRP**: estadisticas.bcrp.gob.pe → Precios inmobiliarios
- **DataCrim**: estadisticas.pnp.gob.pe → Indicadores de seguridad
- **INDECOPI**: indecopi.gob.pe → Registro de infracciones y sanciones

Después de actualizar: `npm run build` → redeploy.

## Stack

- **Next.js 14** (App Router)
- **React 18**
- **Recharts** (gráficas en la app)
- **Zero CSS frameworks** (design system propio en globals.css)
- **Fonts**: Space Grotesk + Plus Jakarta Sans (Google Fonts)
