"use client";

import { motion } from 'motion/react';

/** A short pause between sections: one idea, one big number. */
export default function RhythmBand({
  variant,
  quiet,
}: {
  variant: 'complement';
  quiet: boolean;
}) {
  const content = (
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
      initial={quiet ? false : { opacity: 0, y: 16 }}
      whileInView={quiet ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {content}
    </motion.aside>
  );
}
