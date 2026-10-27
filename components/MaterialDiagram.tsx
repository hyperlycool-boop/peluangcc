"use client";

interface MaterialDiagramProps {
  index: number;
  quiet?: boolean;
}

const DIAGRAM_LABELS = [
  'Ruang sampel dadu dengan hasil ganjil disorot',
  'Kejadian A dan komplemennya',
  'Ilustrasi fluktuasi frekuensi relatif, bukan data simulasi',
  'Himpunan A dan B yang beririsan',
  'Pohon dua pengambilan bola tanpa pengembalian',
] as const;

export default function MaterialDiagram({ index, quiet = false }: MaterialDiagramProps) {
  const label = DIAGRAM_LABELS[index] ?? 'Diagram representasi konsep materi';

  return (
    <svg
      className={`material-diagram ${quiet ? 'diagram-quiet' : ''}`}
      viewBox="0 0 440 220"
      role="img"
      aria-label={label}
    >
      <rect x="10" y="10" width="420" height="200" rx="35" fill="#f3f0ee" />
      <text x="28" y="40" fontSize="14" fill="#736b65">
        {index === 4 ? '3 merah · 2 biru' : 'S'}
      </text>

      {index === 0 && (
        <>
          <ellipse cx="155" cy="115" rx="95" ry="72" fill="#efb3a3" />
          {[1, 3, 5, 2, 4, 6].map((n, i) => (
            <g key={n} className="sample-pop" style={{ animationDelay: `${i * 50}ms` }}>
              <circle
                cx={i < 3 ? 100 + i * 55 : 280}
                cy={i < 3 ? 115 : 65 + (i - 3) * 50}
                r="18"
                fill={i < 3 ? '#cf4500' : '#fff'}
              />
              <text
                x={i < 3 ? 100 + i * 55 : 280}
                y={i < 3 ? 121 : 71 + (i - 3) * 50}
                textAnchor="middle"
                fill={i < 3 ? 'white' : '#141413'}
              >
                {n}
              </text>
            </g>
          ))}
          <text x="150" y="175" textAnchor="middle">
            A · ganjil
          </text>
        </>
      )}

      {index === 1 && (
        <>
          <rect className="complement-glow" x="20" y="20" width="400" height="180" rx="30" fill="#f6cf7b" />
          <circle cx="170" cy="110" r="70" fill="#cf4500" />
          <text x="160" y="118" fontSize="26" fill="white">
            A
          </text>
          <text x="310" y="118" fontSize="26">
            Aᶜ
          </text>
        </>
      )}

      {index === 2 && (
        <>
          <path d="M50 45V180H395" fill="none" stroke="#94877b" />
          <path d="M50 110H395" stroke="#cf4500" strokeDasharray="6 5" />
          <text x="345" y="100" fontSize="13">
            P(A)
          </text>
          <path
            className="frequency-trace"
            d="M50 55L75 155L100 78L125 140L150 92L175 125L200 100L225 119L250 105L275 115L300 107L325 113L350 108L390 111"
            fill="none"
            stroke="#141413"
            strokeWidth="3"
          />
          <text x="55" y="200" fontSize="12">
            Ilustrasi tren · bukan data percobaan
          </text>
        </>
      )}

      {index === 3 && (
        <>
          <circle cx="170" cy="110" r="75" fill="#efb3a3" />
          <circle
            className="venn-reveal"
            cx="270"
            cy="110"
            r="75"
            fill="#f6cf7b"
            style={{ mixBlendMode: 'multiply' }}
          />
          <text x="135" y="118" fontSize="26">
            A
          </text>
          <text x="285" y="118" fontSize="26">
            B
          </text>
          <text x="210" y="118" fontSize="22">
            ∩
          </text>
        </>
      )}

      {index === 4 && (
        <>
          <path
            className="frequency-trace"
            d="M70 110L220 60L370 40M220 60L370 95M70 110L220 160L370 140M220 160L370 190"
            fill="none"
            stroke="#cf4500"
            strokeWidth="2"
          />
          {[
            [70, 110, 'S'],
            [220, 60, 'M'],
            [220, 160, 'B'],
          ].map(([x, y, t]) => (
            <g key={t}>
              <circle cx={x} cy={y} r="18" fill="white" />
              <text x={x} y={Number(y) + 5} textAnchor="middle">
                {t}
              </text>
            </g>
          ))}
          <text x="130" y="65">
            3/5
          </text>
          <text x="130" y="165">
            2/5
          </text>
          <text x="300" y="36">
            2/4
          </text>
          <text x="300" y="110">
            2/4
          </text>
          <text x="300" y="138">
            3/4
          </text>
          <text x="300" y="207">
            1/4
          </text>
        </>
      )}
    </svg>
  );
}
