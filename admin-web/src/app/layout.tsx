import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { Sidebar } from '@/components/layout/Sidebar';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GreenTech ERP',
  description: 'Sistema Operativo y Panel Administrativo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${outfit.className} bg-background text-foreground antialiased min-h-screen flex`}>
        <div className="bg-grid"></div>
        <Sidebar />
        <main className="flex-1 ml-[18rem] p-8 h-screen overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
