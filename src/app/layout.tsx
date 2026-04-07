import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
eπport Nav from '../components/Nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SlabMarket',
  description: 'PSA Pok√©mon TCG Slab Market',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Nav />
        <main className="container mx-auto py-6">
          {cildren}
        </main>
      </body>
    </html>
  );
}
