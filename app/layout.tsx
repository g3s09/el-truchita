import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Esquites El Truchita | Al carbón',
  description: 'Esquites al carbón, preparados al momento en Zacapoaxtla, Puebla.',
  manifest: '/manifest.webmanifest',
  themeColor: '#0a0a09',
  icons: {
    icon: [
      { url: '/app-icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/app-icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/app-icon-512.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'El Truchita',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
