"use client";

import { motion } from 'motion/react';
import { theoreticalProbability } from '@/lib/frequency';

function decimal(value: number) {
  return String(value).replace('.', ',');
}

/** A short pause between sections: one idea, one big number. */
export default function RhythmBand({
  variant,
  quiet,
}: {
  variant: 'range' | 'complement';
  quiet: boolean;
}) {
  const probability = theoreticalProbability();

  const content =
    variant === 'range' ? (
      <>
        <p className="band-figure mono" aria-label="Dari 0 sampai 1">
          0 <span aria-hidden="true">→</span> 1
        </p>
        <div className="band-copy">
          <p>Setiap peluang berada di antara dua angka itu: 0 untuk yang mustahil, 1 untuk yang pasti.</p>
          <div className="band-scale" aria-hidden="true">
            <span className="band-scale-line" />
            <span className="band-scale-tick" style={{ left: '0%' }}>0</span>
            <span className="band-scale-mark" style={{ left: `${probability * 100}%` }}>
              {decimal(probability)}
            </span>
            <span className="band-scale-tick" style={{ left: '100%' }}>1</span>
          </div>
        </div>
      </>
    ) : (
      <>
        <p className="band-figure mono" aria-label="P dari A ditambah P dari A komplemen sama dengan 1">
          P(A) + P(Aᶜ) = 1
        </p>
        <div className="band-copy">
          <p>
            Sebuah kejadian dan komplemennya selalu menyumbang 1 bersama. Kalau satu sisi sulit
            dihitung, hitung sisi lainnya.
          </p>
        </div>
      </>
    );

  return (
    <motion.aside
      className={`rhythm-band band-${variant}`}
      initial={quiet ? false : { opacity: 0, y: 24 }}
      whileInView={quiet ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {content}
    </motion.aside>
  );
}
