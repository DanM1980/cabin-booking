import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// basePath מ-next.config.js
const basePath = process.env.NODE_ENV === 'production' ? '/beeri' : '';

export const metadata: Metadata = {
  title: 'נופש בארי בגולן - הזמנת צימר',
  description: 'מערכת הזמנת ימים בצימר עם לוח תאריכים אינטראקטיבי',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const backgroundStyle = {
    backgroundImage: `url('${basePath}/cabin-background.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    position: 'relative' as const,
  };

  return (
    <html lang="he" dir="rtl">
      <body className={inter.className} style={backgroundStyle}>
        {/* Overlay לבן עם שקיפות 50% */}
        <div style={{
          content: '',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.5)',
          zIndex: -1,
          pointerEvents: 'none',
        }} />
        {children}
      </body>
    </html>
  );
}

