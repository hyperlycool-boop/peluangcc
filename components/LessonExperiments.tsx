'use client';

import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { materials } from '@/lib/materials';
import {
  createDrawState,
  drawBall,
  frequencyDomain,
  frequencyDrawDuration,
  frequencyPoints,
  splitFrequencyPath,
} from '@/lib/experiment-motion';
import { useHydrated } from '@/lib/use-hydrated';
import { RollingNumber } from './RollingNumber';

interface ExperimentProps {
  quiet: boolean;
}

const faces = [1, 2, 3, 4, 5, 6];
const setText = (values: number[]) => values.length ? `{${values.join(', ')}}` : '∅';

function DiceChoices({ selected, onToggle }: { selected: number[]; onToggle: (n: number) => void }) {
  return <div className="experiment-dice">{faces.map(n => <button key={n} type="button" aria-label={`Sisi ${n}`} aria-pressed={selected.includes(n)} onClick={() => onToggle(n)}>
    <DieFace value={n} />
    <span>{n}</span>
  </button>)}</div>;
}

function DieFace({ value }: { value: number }) {
  const pips = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]][value];
  return <span className="pip-face" aria-hidden="true">{Array.from({ length: 9 }, (_, p) => <i key={p} className={pips.includes(p) ? 'pip on' : 'pip'} />)}</span>;
}

function SampleExperiment({ quiet }: ExperimentProps) {
  const [selected, setSelected] = useState([1, 3, 5]);
  const [result, setResult] = useState<number | null>(null);
  const [roll, setRoll] = useState(0);
  return <>
    <p>Pilih sisi untuk membentuk kejadian A, lalu lempar dadu. Semua enam hasil tetap berada di ruang sampel S.</p>
    <DiceChoices selected={selected} onToggle={n => setSelected(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n].sort())} />
    <div className="die-result-stage" aria-hidden="true"><div key={roll} className={`result-die ${roll ? 'result-die-roll' : ''}`}><DieFace value={result ?? 1} /></div><span>{result === null ? 'Siap dilempar' : `Hasil lemparan: ${result}`}</span></div>
    <div className="experiment-controls"><button onClick={() => setSelected([5, 6])}>Coba: angka lebih dari 4</button><button className="experiment-primary" onClick={() => { setResult(Math.floor(Math.random() * 6) + 1); setRoll(r => r + 1); }}>Lempar dadu ↗</button></div>
    <div className="experiment-result" role="status"><span className="experiment-equation">A = {setText(selected)} · P(A) = <RollingNumber value={selected.length} quiet={quiet} />/6</span>
      {result === null ? <span>Belum ada lemparan.</span> : <span key={roll} className="experiment-arrive">Hasil <strong>{result}</strong> {selected.includes(result) ? 'termasuk A.' : 'tidak termasuk A.'} S tetap = {'{1, 2, 3, 4, 5, 6}'}.</span>}
    </div>
  </>;
}

function ComplementExperiment({ quiet }: ExperimentProps) {
  const [selected, setSelected] = useState([6]);
  const [showComplement, setShowComplement] = useState(false);
  const other = faces.filter(n => !selected.includes(n));
  return <>
    <p>Pilih hasil untuk kejadian A. Bagian sisanya otomatis menjadi Aᶜ: tidak ada hasil yang hilang atau dihitung dua kali.</p>
    <DiceChoices selected={selected} onToggle={n => setSelected(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n].sort())} />
    <div className={`complement-balance ${showComplement ? 'show-complement' : ''}`} role="img" aria-label={`Peluang A ${selected.length}/6, komplemen ${other.length}/6`}>
      <div className="balance-fill" style={{ transform: `scaleX(${selected.length / 6})` }} />
      <div className="complement-focus" style={{ transform: `translateX(${selected.length / 6 * 100}%) scaleX(${other.length / 6})`, opacity: showComplement ? 1 : 0 }} />
      <div className="balance-ticks">{faces.map(n => <span key={n} />)}</div>
    </div>
    <div className="balance-labels"><span>A · {selected.length}/6</span><span>Aᶜ · {other.length}/6</span></div>
    <div className="experiment-controls"><button aria-pressed={showComplement} onClick={() => setShowComplement(v => !v)}>{showComplement ? 'Lihat kejadian A' : 'Lihat komplemen Aᶜ'}</button><button onClick={() => { setSelected([6]); setShowComplement(true); }}>Coba: bukan angka 6</button></div>
    <div className="experiment-result" role="status"><span className="experiment-equation">P(A) + P(Aᶜ) = <RollingNumber value={selected.length} quiet={quiet} />/6 + <RollingNumber value={other.length} quiet={quiet} />/6 = 1</span><span>{showComplement ? `Aᶜ = ${setText(other)} · P(Aᶜ) = 1 − ${selected.length}/6 = ${other.length}/6` : `A = ${setText(selected)} · P(A) = ${selected.length}/6`}</span></div>
  </>;
}

function FrequencyExperiment({ quiet }: ExperimentProps) {
  const [{ tosses, prevCount, batch }, setRun] = useState({ tosses: [] as boolean[], prevCount: 0, batch: 0 });
  const successes = tosses.filter(Boolean).length;
  const domain = frequencyDomain(tosses.length);
  const { settled, fresh } = splitFrequencyPath(tosses, prevCount, domain);
  const [endX, endY] = frequencyPoints(tosses, domain).at(-1) ?? [40, 110];
  const drawDuration = frequencyDrawDuration(tosses.length - prevCount, quiet);
  // Crossing a domain step rescales the whole line at once; jump the dot with it instead of sweeping across.
  const dotDuration = frequencyDomain(prevCount) === domain ? drawDuration : 0;
  const coinBase = Math.max(0, tosses.length - 12);
  const add = (n: number) => setRun(r => ({ tosses: [...r.tosses, ...Array.from({ length: n }, () => Math.random() < .5)], prevCount: r.tosses.length, batch: r.batch + 1 }));
  return <>
    <p>Lempar koin adil dan amati proporsi sisi angka. Garis berasal dari percobaanmu sendiri; hasilnya bisa berada di atas atau di bawah ½.</p>
    <svg className="frequency-chart" viewBox="0 0 600 225" role="img" aria-label={`Grafik frekuensi relatif dari ${tosses.length} lemparan, ${successes} angka`}>
      <path d="M40 25V190H565" fill="none" stroke="#b8afa7" />
      <path d="M40 110H565" fill="none" stroke="#cf4500" strokeDasharray="5 6" />
      <text x="8" y="35">1</text><text x="5" y="115">½</text><text x="8" y="194">0</text>
      <text x="420" y="100">P(angka) = 0,5</text><text x="40" y="217">1</text><text x="565" y="217" textAnchor="end">{domain} lemparan</text>
      {settled && <polyline points={settled} fill="none" stroke="#141413" strokeWidth="2.5" strokeLinejoin="round" />}
      {fresh && <motion.polyline key={batch} points={fresh} fill="none" stroke="#141413" strokeWidth="2.5" strokeLinejoin="round" initial={{ pathLength: quiet ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: drawDuration, ease: 'easeOut' }} />}
      {tosses.length > 0 && <motion.circle r="5" fill="#cf4500" initial={false} animate={{ cx: endX, cy: endY }} transition={{ duration: dotDuration, ease: 'easeOut' }} />}
      {!tosses.length && <text x="115" y="65">Mulai percobaan untuk menggambar grafik.</text>}
    </svg>
    <div className="coin-history" aria-label="Hasil 12 lemparan terakhir">{tosses.slice(-12).map((s, i) => <span key={coinBase + i} className={`coin experiment-arrive ${s ? 'coin-angka' : ''}`}>{s ? 'A' : 'G'}</span>)}</div>
    <small>A = angka · G = gambar · menampilkan maksimal 12 hasil terakhir</small>
    <div className="experiment-controls"><button className="experiment-primary" disabled={tosses.length >= 1000} onClick={() => add(1)}>Lempar 1 kali</button><button disabled={tosses.length > 990} onClick={() => add(10)}>+10 lemparan</button><button disabled={tosses.length > 900} onClick={() => add(100)}>+100 lemparan</button><button onClick={() => setRun(r => ({ tosses: [], prevCount: 0, batch: r.batch + 1 }))}>Ulangi</button></div>
    <div className="experiment-result" role="status"><span className="experiment-equation">{tosses.length ? `Frekuensi relatif = ${successes}/${tosses.length} = ${(successes / tosses.length).toFixed(3)}` : 'Belum ada data percobaan.'}</span><span>Angka teramati: {successes} · Frekuensi harapan: 0,5 × {tosses.length} = {tosses.length / 2}. Hasil nyata tidak harus sama dengan harapan.</span></div>
  </>;
}

function CompoundExperiment({ quiet }: ExperimentProps) {
  const [even, setEven] = useState(false);
  const [operation, setOperation] = useState<'union' | 'intersection'>('union');
  const a = [1, 3, 5], b = even ? [2, 4, 6] : [2, 3, 5];
  const common = a.filter(n => b.includes(n));
  const answer = operation === 'union' ? faces.filter(n => a.includes(n) || b.includes(n)) : common;
  const positions: Record<number, [number, number]> = even ? { 1: [105, 90], 3: [120, 135], 5: [145, 170], 2: [360, 90], 4: [375, 135], 6: [345, 170] } : { 1: [125, 125], 3: [245, 100], 5: [245, 155], 2: [365, 125], 4: [435, 205], 6: [65, 205] };
  return <>
    <p>A berisi bilangan ganjil. Ganti anggota B, lalu bandingkan gabungan (atau) dengan irisan (dan). Hasil yang memenuhi operasi disorot jingga.</p>
    <div className="experiment-controls"><button aria-pressed={!even} onClick={() => setEven(false)}>B = bilangan prima</button><button aria-pressed={even} onClick={() => setEven(true)}>B = bilangan genap</button></div>
    <svg className="venn-experiment" viewBox="0 0 500 250" role="img" aria-label={`A ganjil, B ${even ? 'genap' : 'prima'}, ${operation === 'union' ? 'gabungan' : 'irisan'} ${setText(answer)}`}>
      <rect x="5" y="5" width="490" height="240" rx="24" fill="#f3f0ee" /><text x="25" y="32">S</text>
      <circle r="85" fill="#efb3a3" style={{ transform: `translate(${even ? 130 : 195}px, 125px)` }} /><circle r="85" fill="#f6cf7b" style={{ transform: `translate(${even ? 370 : 295}px, 125px)`, mixBlendMode: 'multiply' }} />
      <text x={even ? 80 : 140} y="65">A</text><text x={even ? 395 : 350} y="65">B</text>
      {faces.map(n => <g key={n} style={{ transform: `translate(${positions[n][0]}px, ${positions[n][1]}px)` }}><circle r="18" style={{ fill: answer.includes(n) ? '#cf4500' : '#fff' }} /><text y="6" textAnchor="middle" style={{ fill: answer.includes(n) ? '#fff' : '#141413' }}>{n}</text></g>)}
    </svg>
    <div className="experiment-controls"><button aria-pressed={operation === 'union'} onClick={() => setOperation('union')}>A ∪ B · atau</button><button aria-pressed={operation === 'intersection'} onClick={() => setOperation('intersection')}>A ∩ B · dan</button></div>
    <div className="experiment-result" role="status"><span className="experiment-equation">{operation === 'union' ? 'A ∪ B' : 'A ∩ B'} = {setText(answer)} · P = <RollingNumber value={answer.length} quiet={quiet} />/6</span><span>{operation === 'union' ? `P(A ∪ B) = 3/6 + ${b.length}/6 − ${common.length}/6 = ${answer.length}/6.` : `Ada ${common.length} hasil yang termasuk A dan B sekaligus.`} {even ? 'Ganjil dan genap saling lepas.' : '3 dan 5 berada di irisan, sehingga dihitung hanya sekali.'}</span></div>
  </>;
}

function ConditionalExperiment({ quiet }: ExperimentProps) {
  const [replacement, setReplacement] = useState(false);
  const [{ bag, draws }, setDraw] = useState(createDrawState);
  const uid = useId();
  const drawn = draws.map(b => b.color);
  const lastSource = replacement ? draws.at(-1)?.sourceId : undefined;
  const travel = quiet ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 30 } as const;
  const firstRed = drawn[0] === 'merah';
  const redSecond = replacement ? 3 : firstRed ? 2 : 3;
  const denominator = replacement ? 5 : 4;
  const setMode = (withReplacement: boolean) => { setReplacement(withReplacement); setDraw(createDrawState()); };
  return <>
    <p>Ambil dua bola dari kantong berisi 3 merah dan 2 biru. Ubah aturan pengembalian untuk melihat kapan pengambilan pertama mengubah peluang berikutnya.</p>
    <div className="experiment-controls"><button aria-pressed={!replacement} onClick={() => setMode(false)}>Tanpa pengembalian</button><button aria-pressed={replacement} onClick={() => setMode(true)}>Dengan pengembalian</button></div>
    <div className="ball-stage"><div className="ball-bag"><span>KANTONG · {bag.length} BOLA</span><div>{bag.map(ball => <motion.i key={ball.id} layoutId={`${uid}-${ball.id}`} transition={travel} className={`experiment-ball ${ball.color}`} aria-label={`Bola ${ball.color}`}>{ball.color === 'merah' ? 'M' : 'B'}{ball.id === lastSource && !quiet && <span key={draws.length} className="ball-returned" aria-hidden="true" />}</motion.i>)}</div></div><span aria-hidden="true">→</span><div className="ball-draws">{[0, 1].map(i => <div key={i}><span>Ambil {i + 1}</span>{draws[i] ? <motion.i key={draws[i].id} layoutId={draws[i].sourceId ? undefined : `${uid}-${draws[i].id}`} transition={travel} className={`experiment-ball ${draws[i].sourceId && !quiet ? 'ball-travel' : ''} ${draws[i].color}`} aria-label={`Pengambilan ${i + 1}: ${draws[i].color}`}>{draws[i].color === 'merah' ? 'M' : 'B'}</motion.i> : <i className="ball-empty">?</i>}</div>)}</div></div>
    <div className="experiment-controls"><button className="experiment-primary" disabled={drawn.length === 2} onClick={() => setDraw(s => drawBall(s, replacement))}>Ambil bola {Math.min(drawn.length + 1, 2)}</button><button onClick={() => setDraw(createDrawState())}>Kembalikan semua</button></div>
    <div className="probability-branches"><div><strong>Jika pertama merah</strong><span>Merah → merah</span><b>3/5 × {replacement ? '3/5 = 9/25' : '2/4 = 3/10'}</b></div><div><strong>Jika pertama biru</strong><span>Biru → merah</span><b>2/5 × {replacement ? '3/5 = 6/25' : '3/4 = 3/10'}</b></div></div>
    <div className="experiment-result" role="status"><span className="experiment-equation">{!drawn.length ? 'P(merah pertama) = 3/5' : <>P(merah kedua | pertama {drawn[0]}) = <RollingNumber value={redSecond} max={denominator} quiet={quiet} />/{denominator}</>}</span><span>{drawn.length === 2 ? `Hasil percobaan: ${drawn.join(' → ')}. ` : ''}{replacement ? 'Komposisi kembali ke 3 merah dan 2 biru. Kedua pengambilan saling bebas.' : drawn.length ? `Bola pertama ${drawn[0]} tetap di luar saat mengambil bola kedua; tersisa ${denominator} bola saat itu.` : 'Tanpa pengembalian, jumlah dan komposisi bola berubah setelah pengambilan pertama.'}</span></div>
  </>;
}

const experiments = [SampleExperiment, ComplementExperiment, FrequencyExperiment, CompoundExperiment, ConditionalExperiment];

/**
 * Quiet when the caller asks (Tenang / Fokus ujian) or the system prefers reduced motion.
 * The system preference is read only after mount so the first client render matches SSR.
 */
function useExperimentQuiet(quiet?: boolean) {
  const mounted = useHydrated();
  const reduced = useReducedMotion();
  return Boolean(quiet || (mounted && reduced));
}

export function LessonExperiment({ index, quiet }: { index: number; quiet?: boolean }) {
  const isQuiet = useExperimentQuiet(quiet);
  const Experiment = experiments[index];
  if (!Experiment) return null;
  return <section className="lesson-experiments lesson-experiment" data-quiet={isQuiet} aria-label={`Eksperimen interaktif: ${materials[index].title}`}>
    <div className="experiment-card">
      <div className="eyebrow">COBA SENDIRI / VISUALISASI INTERAKTIF</div>
      <h2>Jadikan konsepnya terlihat.</h2>
      <Experiment quiet={isQuiet} />
    </div>
  </section>;
}

export default function LessonExperiments({ quiet }: { quiet?: boolean }) {
  const isQuiet = useExperimentQuiet(quiet);
  return <section id="eksperimen-materi" className="lesson-experiments" data-quiet={isQuiet}>
    <div className="section-title"><div><div className="eyebrow">LAB PROTOTIPE / 5 MATERI INTERAKTIF</div><h2>Ubah. Coba. Pahami.</h2></div><p>Setiap konsep punya ruang percobaannya sendiri. Pilih hasil, lakukan percobaan, dan lihat rumus mengikuti tindakanmu.</p></div>
    <nav className="experiment-jumps" aria-label="Pilih eksperimen materi">{materials.map((m, i) => <a key={m.slug} href={`#eksperimen-${m.slug}`}>0{i + 1} · {m.title}</a>)}</nav>
    <div className="experiment-grid">{materials.map((m, i) => { const Experiment = experiments[i]; return <article className="experiment-card" key={m.slug} id={`eksperimen-${m.slug}`}><div className="eyebrow">EKSPERIMEN 0{i + 1}</div><h3>{m.title}</h3><Experiment quiet={isQuiet} /></article>; })}</div>
  </section>;
}
