'use client';

import { useId, useState } from 'react';
import { motion } from 'motion/react';
import {
  ANCHOR,
  COMPOUND_SCENARIOS,
  PEOPLE,
  SEATING,
  SEAT_COUNT,
  alternatingSeating,
  compoundScenario,
  evaluateCompound,
  fraction,
  isAlternating,
  recordSeating,
  seatingBlock,
  shuffleSeating,
  type CompoundOperation,
  type CompoundScenarioId,
  type Person,
  type ScenarioItem,
  type SeatingStats,
} from '@/lib/exercise-visualization';

interface ExperimentProps {
  quiet: boolean;
}

const round = (n: number) => Math.round(n * 10) / 10;
/** 5040 -> "5.040" without depending on the runtime locale, so server and client markup match. */
const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const percent = (part: number, whole: number) => `${((part / whole) * 100).toFixed(1).replace('.', ',')}%`;

/* ---------- Soal 3 · Ruang sampel: meja bundar ---------- */

const TABLE = { cx: 200, cy: 150, ring: 105 };
const SEAT_POSITIONS = Array.from({ length: SEAT_COUNT }, (_, i) => {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / SEAT_COUNT;
  return [round(TABLE.cx + TABLE.ring * Math.cos(angle)), round(TABLE.cy + TABLE.ring * Math.sin(angle))] as const;
});

type SeatingView = 'awal' | 'acak' | 'contoh';

export function SeatingExperiment({ quiet }: ExperimentProps) {
  const [seats, setSeats] = useState<readonly Person[]>(PEOPLE);
  const [view, setView] = useState<SeatingView>('awal');
  const [stats, setStats] = useState<SeatingStats>({ trials: 0, hits: 0 });
  const [block, setBlock] = useState<number | null>(null);
  const [roll, setRoll] = useState(0);
  const uid = useId();

  const alternating = isAlternating(seats);
  const marker = quiet ? { duration: 0 } : ({ type: 'spring', stiffness: 380, damping: 30 } as const);

  const shuffle = (times: number) => {
    const batch = Array.from({ length: times }, () => shuffleSeating());
    const last = batch[batch.length - 1];
    setSeats(last);
    setStats((s) => batch.reduce(recordSeating, s));
    setBlock(seatingBlock(isAlternating(last)));
    setView('acak');
    setRoll((r) => r + 1);
  };
  const showExample = () => {
    setSeats(alternatingSeating());
    setBlock(0);
    setView('contoh');
    setRoll((r) => r + 1);
  };
  const reset = () => {
    setSeats(PEOPLE);
    setStats({ trials: 0, hits: 0 });
    setBlock(null);
    setView('awal');
    setRoll(0);
  };

  const verdict =
    view === 'awal' ? 'Belum diacak' : alternating ? 'Berselang-seling' : 'Ada yang sejenis bersebelahan';
  // The table is small, so it shows the outcome in terms of the event instead of the full sentence.
  const tableVerdict = view === 'awal' ? 'Belum diacak' : alternating ? 'Anggota A' : 'Bukan anggota A';

  return <>
    <p>Soal 3 · Empat laki-laki (L) dan empat perempuan (P) duduk mengelilingi meja bundar secara acak. {ANCHOR.id} dikunci di kursi pertama agar putaran meja tidak terhitung berulang; tujuh orang lainnya mengisi sisa kursi. Acak susunannya, lalu lihat seberapa sering laki-laki dan perempuan berselang-seling.</p>
    <svg className="seating-table" viewBox="55 4 290 290" role="img" aria-label={`Meja bundar dengan delapan kursi. Searah jarum jam dari atas: ${seats.map((p) => p.id).join(', ')}. ${verdict}.`}>
      <circle className="table-top" cx={TABLE.cx} cy={TABLE.cy} r="62" />
      <text className="table-verdict experiment-arrive" key={view + roll} x={TABLE.cx} y={TABLE.cy + 5} textAnchor="middle">{tableVerdict}</text>
      {SEAT_POSITIONS.map(([x, y], i) => {
        const [nx, ny] = SEAT_POSITIONS[(i + 1) % SEAT_COUNT];
        const clash = seats[i].gender === seats[(i + 1) % SEAT_COUNT].gender;
        return <g key={i} aria-hidden="true">
          <circle className="seat-spot" cx={x} cy={y} r="27" />
          <line className={`seat-link ${clash ? 'seat-link-clash' : alternating ? 'seat-link-ok' : ''}`} x1={x} y1={y} x2={nx} y2={ny} />
        </g>;
      })}
      {PEOPLE.map((person) => {
        const [x, y] = SEAT_POSITIONS[seats.findIndex((p) => p.id === person.id)];
        return <g key={person.id} className={`seat-person ${person.gender === 'L' ? 'is-man' : 'is-woman'}`} style={{ transform: `translate(${x}px, ${y}px)` }} aria-hidden="true">
          <circle r="22" />
          <text y="5" textAnchor="middle">{person.id}</text>
        </g>;
      })}
      <text className="seat-anchor" x={SEAT_POSITIONS[0][0]} y="14" textAnchor="middle" aria-hidden="true">kursi acuan</text>
    </svg>
    <div className="experiment-controls">
      <button className="experiment-primary" onClick={() => shuffle(1)}>Acak susunan ↗</button>
      <button onClick={() => shuffle(500)}>Acak 500 kali</button>
      <button onClick={showExample}>Contoh berselang-seling</button>
      <button onClick={reset} disabled={view === 'awal'}>Ulangi dari awal</button>
    </div>
    <div className="seat-blocks" aria-hidden="true">
      {Array.from({ length: SEATING.blocks }, (_, i) => <span key={i} className={`seat-block ${i === 0 ? 'is-event' : ''}`}>
        {i === 0 && 'A'}
        {block === i && <motion.i layoutId={`${uid}-block-marker`} transition={marker} className="seat-block-marker" />}
        {block === i && !quiet && <span key={roll} className="block-pulse" />}
      </span>)}
    </div>
    <p className="seat-blocks-caption">Seluruh {thousands(SEATING.space)} susunan dibagi menjadi {SEATING.blocks} kotak sama besar, masing-masing {SEATING.event} susunan. Kotak jingga memuat semua susunan berselang-seling; titik di dalam kotak menandai susunan terakhir.</p>
    <div className="experiment-result" role="status">
      <span className="experiment-equation">P(A) = {SEATING.event}/{thousands(SEATING.space)} = {fraction(SEATING.event, SEATING.space)}</span>
      <span>n(S) = 7! = {thousands(SEATING.space)} · n(A) = 3! × 4! = {SEATING.event}</span>
      <span key={roll} className={view === 'awal' ? undefined : 'experiment-arrive'}>
        {view === 'awal' && 'Belum ada susunan acak.'}
        {view === 'contoh' && 'Contoh anggota A: laki-laki dan perempuan bergantian, termasuk antara kursi terakhir dan kursi acuan.'}
        {view === 'acak' && (alternating ? 'Susunan ini berselang-seling, jadi anggota A.' : 'Ada dua orang sejenis yang bersebelahan (garis merah), jadi bukan anggota A.')}
        {stats.trials > 0 && ` Dari ${thousands(stats.trials)} susunan acak, ${thousands(stats.hits)} berselang-seling (${percent(stats.hits, stats.trials)}); teori ${fraction(SEATING.event, SEATING.space)} ≈ ${percent(SEATING.event, SEATING.space)}.`}
      </span>
    </div>
  </>;
}

/* ---------- Soal 1 dan 2 · Kejadian majemuk: bola dan kartu ---------- */

const SUIT_GLYPH: Record<string, string> = { sekop: '♠', hati: '♥', keriting: '♣', wajik: '♦' };
const SCENARIO_INTRO: Record<CompoundScenarioId, string> = {
  'soal-1': 'Soal 1 · Dalam kantong ada 6 bola merah, 4 bola biru, dan 5 bola hijau. Satu bola diambil secara acak. A = bola merah, B = bola hijau.',
  'soal-2': 'Soal 2 · Satu kartu diambil dari satu set kartu bridge (52 kartu). A = kartu As, B = kartu King.',
  'as-hati': 'Tambahan · Bukan dari soal, tetapi memperlihatkan kasus tidak saling lepas: As hati termasuk A sekaligus B. A = kartu As, B = kartu Hati.',
};

const SCENARIO_TAB: Record<CompoundScenarioId, string> = {
  'soal-1': 'Soal 1 · bola',
  'soal-2': 'Soal 2 · kartu',
  'as-hati': 'Tambahan · As atau Hati',
};

export function CompoundExerciseExperiment({ quiet }: ExperimentProps) {
  const [scenarioId, setScenarioId] = useState<CompoundScenarioId>('soal-1');
  const [operation, setOperation] = useState<CompoundOperation>('union');
  const scenario = compoundScenario(scenarioId);
  const result = evaluateCompound(scenario, operation);
  const selected = new Set(result.selected);
  const inA = new Set(scenario.a.ids);
  const inB = new Set(scenario.b.ids);
  // One row per colour (bag) or suit (deck), so groups never split across rows.
  const rows = scenario.items.reduce<ScenarioItem[][]>((acc, item) => {
    const row = acc.find((r) => r[0].tone === item.tone);
    if (row) row.push(item); else acc.push([item]);
    return acc;
  }, []);
  const doubleCounted = operation === 'union' && !result.disjoint;
  const operationName = operation === 'union' ? 'A ∪ B' : 'A ∩ B';

  return <>
    <p>{SCENARIO_INTRO[scenarioId]} Pilih operasinya, lalu lihat hasil mana yang memenuhi.</p>
    <div className="experiment-controls" role="group" aria-label="Pilih soal">
      {COMPOUND_SCENARIOS.map((s) => <button key={s.id} aria-pressed={s.id === scenarioId} onClick={() => setScenarioId(s.id)}>{SCENARIO_TAB[s.id]}</button>)}
    </div>
    <div
      key={scenarioId}
      className={`pick-grid pick-${scenario.layout}`}
      role="img"
      aria-label={`Ruang sampel ${result.nS} ${scenario.layout === 'bag' ? 'bola' : 'kartu'}. ${operationName} menyorot ${result.selected.length} di antaranya.`}
    >
      {rows.map((row, r) => <div key={row[0].tone} className="pick-row" aria-hidden="true">
        {row.map((item) => <span
          key={item.id}
          className={`pick-item ${scenario.layout === 'bag' ? `experiment-ball ${item.tone}` : `pick-card suit-${item.tone}`}`}
          data-selected={selected.has(item.id)}
          style={quiet ? undefined : { animationDelay: `${r * 40}ms` }}
        >
          {scenario.layout === 'bag' ? item.label : <><b>{item.label}</b><i>{SUIT_GLYPH[item.tone]}</i></>}
          {doubleCounted && selected.has(item.id) && inA.has(item.id) && inB.has(item.id) && <em className="pick-double">2×</em>}
        </span>)}
      </div>)}
    </div>
    <div className="experiment-controls" role="group" aria-label="Pilih operasi">
      <button aria-pressed={operation === 'union'} onClick={() => setOperation('union')}>A ∪ B · atau</button>
      <button aria-pressed={operation === 'intersection'} onClick={() => setOperation('intersection')}>A ∩ B · dan</button>
    </div>
    <div className="experiment-result" role="status">
      <span className="experiment-equation">{result.equation}</span>
      <span>n(S) = {result.nS} · n(A) = {result.nA} ({scenario.a.label}) · n(B) = {result.nB} ({scenario.b.label}) · n(A ∩ B) = {result.nIntersection}</span>
      <span key={`${scenarioId}-${operation}`} className="experiment-arrive">
        {result.disjoint
          ? 'Tidak ada hasil yang masuk A dan B sekaligus: A ∩ B = ∅, jadi kedua kejadian saling lepas dan cukup dijumlahkan.'
          : doubleCounted
            ? `${result.nIntersection} hasil (bertanda 2×) masuk A dan B sekaligus. Saat A dan B dijumlahkan, hasil itu terhitung dua kali, jadi kurangi satu salinannya.`
            : `Irisan memuat ${result.nIntersection} hasil yang masuk A dan B sekaligus. Hasil ini terhitung dua kali saat A dan B dijumlahkan.`}
      </span>
    </div>
  </>;
}
