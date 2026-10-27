import type { Metadata } from 'next';
import { Sofia_Sans, JetBrains_Mono } from 'next/font/google';
import 'katex/dist/katex.min.css';
import 'lenis/dist/lenis.css';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import NavigationMarker from '@/components/NavigationMarker';

const sofia = Sofia_Sans({
  subsets: ['latin'],
  variable: '--font-sofia',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Ruang Peluang — Lihat. Coba. Pahami.',
  description: 'Fondasi pembelajaran peluang interaktif berbahasa Indonesia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${sofia.variable} ${mono.variable}`}>
        <NavigationMarker />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
