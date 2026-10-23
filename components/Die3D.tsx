"use client";

import { motion } from 'motion/react';
import type { MotionValue } from 'motion/react';

interface Die3DProps {
  size?: number; // in pixels
  rotateX: MotionValue<number> | number;
  rotateY: MotionValue<number> | number;
  rotateZ?: MotionValue<number> | number;
  translateY?: MotionValue<number> | number;
  shadowScale?: MotionValue<number> | number;
  shadowOpacity?: MotionValue<number> | number;
  highlightFace?: number | null;
  onClick?: () => void;
  isRolling?: boolean;
}

export default function Die3D({
  size = 130,
  rotateX,
  rotateY,
  rotateZ = 0,
  translateY = 0,
  shadowScale = 1,
  shadowOpacity = 0.35,
  highlightFace = null,
  onClick,
  isRolling = false,
}: Die3DProps) {
  const half = size / 2;

  // Standard opposite faces on a die sum to 7:
  // 1 (Front) vs 6 (Back)
  // 2 (Top) vs 5 (Bottom)
  // 3 (Right) vs 4 (Left)
  const faces = [
    {
      value: 1,
      name: 'front',
      transform: `translateZ(${half}px)`,
      accent: true,
      dots: [{ top: '50%', left: '50%' }],
    },
    {
      value: 6,
      name: 'back',
      transform: `rotateY(180deg) translateZ(${half}px)`,
      accent: false,
      dots: [
        { top: '25%', left: '25%' },
        { top: '50%', left: '25%' },
        { top: '75%', left: '25%' },
        { top: '25%', left: '75%' },
        { top: '50%', left: '75%' },
        { top: '75%', left: '75%' },
      ],
    },
    {
      value: 2,
      name: 'top',
      transform: `rotateX(90deg) translateZ(${half}px)`,
      accent: false,
      dots: [
        { top: '28%', left: '28%' },
        { top: '72%', left: '72%' },
      ],
    },
    {
      value: 5,
      name: 'bottom',
      transform: `rotateX(-90deg) translateZ(${half}px)`,
      accent: false,
      dots: [
        { top: '25%', left: '25%' },
        { top: '25%', left: '75%' },
        { top: '50%', left: '50%' },
        { top: '75%', left: '25%' },
        { top: '75%', left: '75%' },
      ],
    },
    {
      value: 3,
      name: 'right',
      transform: `rotateY(90deg) translateZ(${half}px)`,
      accent: false,
      dots: [
        { top: '25%', left: '25%' },
        { top: '50%', left: '50%' },
        { top: '75%', left: '75%' },
      ],
    },
    {
      value: 4,
      name: 'left',
      transform: `rotateY(-90deg) translateZ(${half}px)`,
      accent: false,
      dots: [
        { top: '28%', left: '28%' },
        { top: '28%', left: '72%' },
        { top: '72%', left: '28%' },
        { top: '72%', left: '72%' },
      ],
    },
  ];

  return (
    <div
      className="die-stage"
      style={{
        width: size * 1.8,
        height: size * 2.2,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? 'Dadu 3D interaktif. Bergulir mengikuti konsep materi.' : undefined}
      aria-hidden={!onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* 3D Cube with perspective preservation */}
      <motion.div
        className={`die-cube ${isRolling ? 'die-is-tossing' : ''}`}
        style={{
          width: size,
          height: size,
          rotateX,
          rotateY,
          rotateZ,
          y: translateY,
        }}
      >
        {faces.map((f) => {
          const isHighlighted = highlightFace === f.value;

          return (
            <div
              key={f.value}
              className={`die-face die-face-${f.name} ${f.accent ? 'die-face-ace' : ''} ${
                isHighlighted ? 'die-face-highlighted' : ''
              }`}
              style={{
                width: size,
                height: size,
                transform: f.transform,
              }}
            >
              {/* Subtle inner reflection sheen */}
              <div className="die-face-sheen" />

              {/* Face value badge when highlighted */}
              {isHighlighted && (
                <div className="die-face-highlight-badge">
                  <span>Hasil Terpilih: {f.value}</span>
                </div>
              )}

              {/* Pips */}
              {f.dots.map((dot, idx) => (
                <span
                  key={idx}
                  className={`die-pip ${
                    f.accent || isHighlighted ? 'die-pip-accent' : ''
                  }`}
                  style={{
                    top: dot.top,
                    left: dot.left,
                    width: size * 0.175,
                    height: size * 0.175,
                  }}
                />
              ))}
            </div>
          );
        })}
      </motion.div>

      {/* Dynamic contact shadow on ground floor */}
      <motion.div
        className="die-floor-shadow"
        style={{
          width: size * 1.15,
          height: size * 0.38,
          scale: shadowScale,
          opacity: shadowOpacity,
        }}
      />
    </div>
  );
}
