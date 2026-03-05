/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTA: Para deploy en Vercel, NO uses output:'export'
  // Vercel maneja SSG automáticamente cuando usas generateStaticParams.
  // Descomenta la línea de abajo SOLO si vas a subir a S3, Netlify, o hosting estático puro:
  // output: 'export',

  images: {
    // Permite imágenes externas (picsum, etc.)
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },

  // ISR: las páginas SEO se regeneran cada hora en background
  // (en Vercel - en hosting estático se regeneran en cada `npm run build`)
  experimental: {},
};

module.exports = nextConfig;
