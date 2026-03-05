import './globals.css';

export const metadata = {
  metadataBase: new URL('https://depamatch.pe'),
  title: {
    default: 'DepaMatch — El match perfecto para tu departamento en Lima',
    template: '%s | DepaMatch',
  },
  description: 'DepaMatch analiza proyectos de departamentos en estreno en Lima con datos de BCRP, DataCrim, INDECOPI y SBS. Encuentra el match perfecto para tu perfil.',
  keywords: ['departamentos lima', 'departamentos en venta lima', 'proyectos inmobiliarios lima 2025', 'precio m2 lima'],
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    siteName: 'DepaMatch',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-PE">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        background: '#0D0D0D',
        color: '#F0F0F0',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}>
        {children}
      </body>
    </html>
  );
}
