"use client";

import { useState } from 'react';
import {
  PLAYGROUND_MAX_ROLLS,
  PLAYGROUND_TOOLS,
  eventStats,
  rollTool,
  tallyRolls,
  toggleMember,
  type PlaygroundTool,
} from '@/lib/playground';
import type { Outcome } from '@/lib/math';

const BATCHES = [1, 10, 100] as const;

function percent(value: number) {
  return `${(value * 100).toFixed(1).replace('.', ',')}%`;
}

/** Colour names on the spinner get a colour; every other outcome stays neutral. */
const SWATCH: Record<string, string> = { Merah: '#cf4500', Biru: '#2f5f9e', Hijau: '#3d8a5a' };

interface ToolState {
  rolls: readonly Outcome[];
  members: readonly Outcome[];
}

const INITIAL: Record<PlaygroundTool['id'], ToolState> = {
  dadu: { rolls: [], members: ['1', '3', '5'] },
  koin: { rolls: [], members: ['Angka'] },
  spinner: { rolls: [], members: ['Merah'] },
};

export default function Playground() {
  const [toolId, setToolId] = useState<PlaygroundTool['id']>('dadu');
  const [state, setState] = useState(INITIAL);

  const tool = PLAYGROUND_TOOLS.find((candidate) => candidate.id === toolId) ?? PLAYGROUND_TOOLS[0];
  const { rolls, members } = state[tool.id];
  const tally = tallyRolls(tool, rolls);
  const stats = eventStats(tool, members, rolls);
  const last = rolls.length ? rolls[rolls.length - 1] : null;
  const tallest = Math.max(1, ...tool.outcomes.map((outcome) => tally[outcome]));
  const atLimit = rolls.length >= PLAYGROUND_MAX_ROLLS;

  const update = (patch: Partial<ToolState>) =>
    setState((previous) => ({ ...previous, [tool.id]: { ...previous[tool.id], ...patch } }));

  const roll = (count: number) => {
    const room = PLAYGROUND_MAX_ROLLS - rolls.length;
    const batch = Array.from({ length: Math.min(count, room) }, () => rollTool(tool, Math.random));
    if (batch.length) update({ rolls: [...rolls, ...batch] });
  };

  return (
    <div className="pg">
      <div className="pg-tools" role="radiogroup" aria-label="Alat">
        {PLAYGROUND_TOOLS.map((candidate) => (
          <button
            key={candidate.id}
            type="button"
            role="radio"
            aria-checked={candidate.id === tool.id}
            className={`pg-tool${candidate.id === tool.id ? ' is-on' : ''}`}
            onClick={() => setToolId(candidate.id)}
          >
            {candidate.label}
          </button>
        ))}
      </div>

      <div className="pg-grid">
        <div className="pg-panel pg-stage">
          <div
            // The key restarts the pop animation on every roll; CSS removes it for calm modes.
            key={rolls.length}
            className="pg-result mono"
            style={last && SWATCH[last] ? { background: SWATCH[last], color: 'white', borderColor: SWATCH[last] } : undefined}
            aria-hidden="true"
          >
            {last ?? '?'}
          </div>
          <p className="pg-live" aria-live="polite">
            {last ? `Hasil terakhir: ${last}. Lemparan ke-${rolls.length}.` : 'Belum ada lemparan.'}
          </p>
          <div className="pg-buttons">
            {BATCHES.map((count) => (
              <button
                key={count}
                type="button"
                className={`button ${count === 1 ? 'primary' : 'pg-secondary'}`}
                aria-disabled={atLimit}
                onClick={() => roll(count)}
              >
                {tool.verb}
                {count > 1 ? ` ${count}×` : ''}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="pg-reset"
            aria-disabled={rolls.length === 0}
            onClick={() => update({ rolls: [] })}
          >
            Ulangi dari nol
          </button>
          {atLimit && <p className="pg-note">Batas {PLAYGROUND_MAX_ROLLS} lemparan tercapai.</p>}
        </div>

        <div className="pg-panel">
          <h2 className="pg-heading">Kejadian A</h2>
          <p className="pg-hint">Tekan hasil untuk memasukkan atau mengeluarkannya dari A.</p>
          <div className="pg-chips" role="group" aria-label="Anggota kejadian A">
            {tool.outcomes.map((outcome) => {
              const inEvent = members.includes(outcome);
              return (
                <button
                  key={outcome}
                  type="button"
                  className={`pg-chip mono${inEvent ? ' is-on' : ''}`}
                  aria-pressed={inEvent}
                  onClick={() => update({ members: toggleMember(tool, members, outcome) })}
                >
                  {SWATCH[outcome] && <span className="pg-swatch" style={{ background: SWATCH[outcome] }} aria-hidden="true" />}
                  {outcome}
                </button>
              );
            })}
          </div>

          <dl className="pg-stats">
            <div>
              <dt>Teoretis</dt>
              <dd className="mono">
                n(A)/n(S) = {stats.favourable}/{stats.sampleSize} = {percent(stats.theoretical)}
              </dd>
            </div>
            <div>
              <dt>Teramati</dt>
              <dd className="mono">
                {stats.observed === null
                  ? 'belum ada lemparan'
                  : `${stats.hits}/${stats.trials} = ${percent(stats.observed)}`}
              </dd>
            </div>
          </dl>

          <ul className="pg-bars" aria-label="Banyak kemunculan tiap hasil">
            {tool.outcomes.map((outcome) => (
              <li key={outcome} className={members.includes(outcome) ? 'in-event' : ''}>
                <span className="pg-bar-count mono">{tally[outcome]}</span>
                <span className="pg-bar-track">
                  <span className="pg-bar-fill" style={{ height: `${(tally[outcome] / tallest) * 100}%` }} />
                </span>
                <span className="pg-bar-label mono">{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
