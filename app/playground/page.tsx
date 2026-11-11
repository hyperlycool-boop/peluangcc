import { ViewTransition } from 'react';
import type { Metadata } from 'next';
import { DIRECTIONAL_PAGE_TRANSITION } from '@/lib/route-transition';
import { SiteFooter, SubpageHeader } from '@/components/SiteChrome';
import Playground from '@/components/playground/Playground';

export const metadata: Metadata = {
  title: 'Taman bermain — Ruang Peluang',
  description: 'Lempar dadu, koin, dan spinner, buat kejadianmu sendiri, lalu bandingkan hasilnya dengan peluang teoretis.',
};

export default function Page() {
  return (
    <>
      <SubpageHeader />
      <ViewTransition {...DIRECTIONAL_PAGE_TRANSITION}>
        <main className="lesson playground-page">
          <h1>Taman bermain.</h1>
          <p className="lesson-intro">
            Pilih alat, lempar berkali-kali, lalu tandai hasil mana yang masuk kejadian A. Bandingkan
            yang kamu amati dengan yang dihitung.
          </p>
          <Playground />
        </main>
      </ViewTransition>
      <SiteFooter />
    </>
  );
}
