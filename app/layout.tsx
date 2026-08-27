import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Esquites El Truchita | Al carbón',
  description: 'Esquites al carbón, preparados al momento en Zacapoaxtla, Puebla.',
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
