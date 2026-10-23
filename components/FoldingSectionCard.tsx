"use client";

import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { FOLD_BREAKPOINTS } from '@/lib/folding';

interface FoldingSectionCardProps {
  children: ReactNode;
  id?: string;
  className?: string;
  enabled?: boolean;
  quiet?: boolean;
  sectionNumber?: string;
  sectionTitle?: string;
}

export default function FoldingSectionCard({
  children,
  id,
  className = '',
  enabled = true,
  quiet = false,
  sectionNumber,
  sectionTitle,
}: FoldingSectionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const systemReduced = useReducedMotion();
  const isQuiet = Boolean(quiet || systemReduced || !enabled);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  const rawRotX = useTransform(
    scrollYProgress,
    FOLD_BREAKPOINTS.progress as unknown as number[],
    FOLD_BREAKPOINTS.rotateX as unknown as number[]
  );

  const rawTranslateZ = useTransform(
    scrollYProgress,
    FOLD_BREAKPOINTS.progress as unknown as number[],
    FOLD_BREAKPOINTS.translateZ as unknown as number[]
  );

  const rawScale = useTransform(
    scrollYProgress,
    FOLD_BREAKPOINTS.progress as unknown as number[],
    FOLD_BREAKPOINTS.scale as unknown as number[]
  );

  const rawCreaseOpacity = useTransform(
    scrollYProgress,
    FOLD_BREAKPOINTS.progress as unknown as number[],
    FOLD_BREAKPOINTS.creaseOpacity as unknown as number[]
  );

  const rotX = isQuiet ? 0 : rawRotX;
  const translateZ = isQuiet ? 0 : rawTranslateZ;
  const scale = isQuiet ? 1 : rawScale;
  const creaseOpacity = isQuiet ? 0 : rawCreaseOpacity;

  return (
    <div className={`folding-section-wrapper ${enabled ? 'has-perspective' : ''}`}>
      <motion.div
        ref={cardRef}
        id={id}
        className={`folding-section-card ${enabled ? 'is-folding' : 'is-flat'} ${className}`}
        style={{
          rotateX: rotX,
          translateZ: translateZ,
          scale: scale,
          transformOrigin: '50% 0%',
        }}
      >
        {/* 3D Dynamic Crease Lighting Layer */}
        {enabled && (
          <motion.div
            className="folding-crease-overlay"
            style={{ opacity: creaseOpacity }}
            aria-hidden="true"
          />
        )}

        {/* Optional decorative card index badge */}
        {sectionNumber && (
          <div className="section-card-index-pill font-mono" aria-hidden="true">
            <span>{sectionNumber}</span>
            {sectionTitle && <span>· {sectionTitle}</span>}
          </div>
        )}

        {children}
      </motion.div>
    </div>
  );
}
