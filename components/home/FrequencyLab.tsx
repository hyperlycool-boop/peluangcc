"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { dice } from '@/lib/math';
import {
  MAX_ROLLS,
  WATCHED_EVENT,
  addRolls,
  emptyTally,
  eventCount,
  frequencyHistory,
  observedFrequency,
  rollDie,
  theoreticalProbability,
  totalRolls,
} from '@/lib/frequency';
import type { Outcome } from '@/lib/math';

const BATCHES = [1, 10, 100, 1000] as const;
const CHART = { width: 560, height: 220, padX: 36, padTop: 14, padBottom: 30 };

function percent(value: number) {
  return `${(value * 100).toFixed(1).replace('.', ',')}%`;
}

/** Running frequency of the watched event against the theoretical line. */
function HistoryChart({ rolls, target }: { rolls: readonly Outcome[]; target: number }) {
  const points = useMemo(() => frequencyHistory(rolls), [rolls]);
  const plotWidth = CHART.width - CHART.padX * 2;
  const plotHeight = CHART.height - CHART.padTop - CHART.padBottom;
  const lastRoll = points.length ? points[points.length - 1].rolls : 1;
  const x = (count: number) => CHART.padX + (lastRoll <= 1 ? 0 : ((count - 1) / (lastRoll - 1)) * plotWidth);
  const y = (frequency: number) => CHART.padTop + (1 - frequency) * plotHeight;

  const line = points.map((point) => `${x(point.rolls).toFixed(1)},${y(point.frequency).toFixed(1)}`).join(' ');

  return (
    <svg
      className="freq-chart"
      viewBox={`0 0 ${CHART.width} ${CHART.height}`}
      role="img"
      aria-label={
        points.length
          ? `Grafik frekuensi relatif setelah ${lastRoll} lemparan, mendekati garis peluang teoretis ${percent(target)}.`
          : 'Grafik frekuensi relatif. Lempar dadu untuk mengisinya.'
      }
    >
      {[0, 0.5, 1].map((tick) => (
        <g key={tick}>
          <line className="freq-grid" x1={CHART.padX} x2={CHART.width - CHART.padX} y1={y(tick)} y2={y(tick)} />
          <text className="freq-axis" x={CHART.padX - 8} y={y(tick) + 4} textAnchor="end">
            {tick === 0 ? '0' : tick === 1 ? '1' : '0,5'}
          </text>
        </g>
      ))}
      <line
        className="freq-target"
        x1={CHART.padX}
        x2={CHART.width - CHART.padX}
        y1={y(target)}
        y2={y(target)}
      />
      <text className="freq-axis" x={CHART.width - CHART.padX} y={y(target) - 8} textAnchor="end">
        P(A) = {String(target).replace('.', ',')}
      </text>
      {points.length > 1 && <polyline className="freq-line" points={line} fill="none" />}
      {points.length === 1 && <circle className="freq-dot" cx={x(points[0].rolls)} cy={y(points[0].frequency)} r={4} />}
      <text className="freq-axis" x={CHART.padX} y={CHART.height - 8}>
        1
      </text>
      <text className="freq-axis" x={CHART.width - CHART.padX} y={CHART.height - 8} textAnchor="end">
        {points.length ? `${lastRoll} lemparan` : 'lemparan'}
      </text>
    </svg>
  );
}

export default function FrequencyLab({ quiet }: { quiet: boolean }) {
  const [rolls, setRolls] = useState<readonly Outcome[]>([]);

  const tally = useMemo(() => addRolls(emptyTally(), rolls), [rolls]);
  const total = totalRolls(tally);
  const hits = eventCount(tally);
  const observed = observedFrequency(tally);
  const target = theoreticalProbability();
  const lastRoll = rolls.length ? rolls[rolls.length - 1] : null;
  const mostCommon = Math.max(1, ...dice.outcomes.map((outcome) => tally[outcome]));
  const atLimit = total >= MAX_ROLLS;

  const roll = (count: number) => {
    const room = MAX_ROLLS - rolls.length;
    const batch = Array.from({ length: Math.min(count, room) }, () => rollDie(Math.random));
    if (batch.length) setRolls((previous) => [...previous, ...batch]);
  };

  const gap = observed === null ? null : Math.abs(observed - target);

  return (
    <section id="coba" className={`lab-section freq-lab${quiet ? ' is-quiet' : ''}`}>
      <div className="section-title">
        <div>
          <h2>Coba sendiri.</h2>
        </div>
        <p>
          Lempar dadu berkali-kali. Semakin banyak lemparan, frekuensi hasil ganjil makin dekat ke
          peluang teoretisnya.
        </p>
      </div>

      <div className="freq-grid-layout">
        <div className="freq-panel freq-controls">
          <div className="freq-die" aria-hidden="true">
            <span className="freq-die-face mono">{lastRoll ?? '?'}</span>
          </div>
          <div className="freq-buttons" role="group" aria-label="Jumlah lemparan">
            {BATCHES.map((count) => (
              <button
                key={count}
                type="button"
                className={`button ${count === 1 ? 'primary' : 'freq-secondary'}`}
                onClick={() => roll(count)}
                aria-disabled={atLimit}
              >
                Lempar {count}×
              </button>
            ))}
          </div>
          <button type="button" className="freq-reset" onClick={() => setRolls([])} aria-disabled={total === 0}>
            Ulangi dari nol
          </button>
          {atLimit && <p className="freq-note">Batas {MAX_ROLLS} lemparan tercapai. Ulangi dari nol untuk mencoba lagi.</p>}
        </div>

        <div className="freq-panel">
          <p className="freq-readout" aria-live="polite">
            {observed === null ? (
              <>Belum ada lemparan. Tekan &ldquo;Lempar 1×&rdquo; untuk memulai.</>
            ) : (
              <>
                <span className="freq-big">{percent(observed)}</span> hasil ganjil dari {total}{' '}
                lemparan ({hits} kali). Peluang teoretisnya {percent(target)}, selisih{' '}
                {percent(gap ?? 0)}.
              </>
            )}
          </p>
          <HistoryChart rolls={rolls} target={target} />
          <ul className="freq-bars" aria-label="Banyak kemunculan tiap sisi">
            {dice.outcomes.map((outcome) => {
              const inEvent = (WATCHED_EVENT.members as readonly string[]).includes(outcome);
              return (
                <li key={outcome} className={inEvent ? 'in-event' : ''}>
                  <span className="freq-bar-label mono">{outcome}</span>
                  <span className="freq-bar-track">
                    <span className="freq-bar-fill" style={{ height: `${(tally[outcome] / mostCommon) * 100}%` }} />
                  </span>
                  <span className="freq-bar-count mono">{tally[outcome]}</span>
                </li>
              );
            })}
          </ul>
          <p className="freq-legend">Batang oranye adalah sisi yang termasuk A = {'{1, 3, 5}'}.</p>
        </div>
      </div>

      <p className="freq-more">
        Ingin mencoba koin, spinner, atau kejadianmu sendiri?{' '}
        <Link href="/playground">Buka taman bermain</Link>
      </p>
    </section>
  );
}
