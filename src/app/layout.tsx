import type { Metadata } from 'next';
import { Space_Grotesk, Geist_Mono, Geist } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import LayoutShell from '@/components/LayoutShell';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SHOPHAVEN (1) — Direct Artisan Collective & Factory Catalog',
  description: 'Authentic Indian ethnic wear, sarees, home textiles & electronics directly from verified weaver guilds. Transparent pricing, Cash on Delivery.',
  keywords: 'e-commerce, nothing tech aesthetic, direct manufacturer, weavers, saree, kurti, tech store, cod',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${geistMono.variable} ${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#faf8f5] text-[#141416] selection:bg-[#b91c1c] selection:text-white">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
