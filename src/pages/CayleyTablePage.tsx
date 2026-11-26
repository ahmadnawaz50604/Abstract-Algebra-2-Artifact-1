import { CheckCircle2, Download, Printer } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { buildCayleyTable, type CayleyGroupKind } from '../math/cayley.ts';

type PresetKey =
  | 'Z4'
  | 'Z2xZ2'
  | 'Z6'
  | 'Z2xZ4'
  | 'D3'
  | 'D4'
  | 'D5'
  | 'D6'
  | 'S3'
  | 'S4'
  | 'A4';

const PRESETS: { key: PresetKey; label: string; spec: CayleyGroupKind }[] = [
  { key: 'Z4', label: 'ℤ₄', spec: { type: 'cyclic', n: 4 } },
  { key: 'Z2xZ2', label: 'ℤ₂ × ℤ₂', spec: { type: 'direct_product', moduli: [2, 2] } },
  { key: 'Z6', label: 'ℤ₆', spec: { type: 'cyclic', n: 6 } },
  { key: 'Z2xZ4', label: 'ℤ₂ × ℤ₄', spec: { type: 'direct_product', moduli: [2, 4] } },
  { key: 'D3', label: 'D₃ (1, ρ, μ)', spec: { type: 'dihedral', n: 3 } },
  { key: 'D4', label: 'D₄ (1, ρ, μ)', spec: { type: 'dihedral', n: 4 } },
  { key: 'D5', label: 'D₅ (1, ρ, μ)', spec: { type: 'dihedral', n: 5 } },
  { key: 'D6', label: 'D₆ (1, ρ, μ)', spec: { type: 'dihedral', n: 6 } },
  { key: 'S3', label: 'S₃', spec: { type: 'symmetric', n: 3 } },
  { key: 'A4', label: 'A₄', spec: { type: 'alternating', n: 4 } },
  { key: 'S4', label: 'S₄ (24×24)', spec: { type: 'symmetric', n: 4 } },
];

export const CayleyTablePage: React.FC = () => {
  const [preset, setPreset] = useState<PresetKey>('D4');
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>({ r: 1, c: 4 });

  const spec = PRESETS.find((p) => p.key === preset)!.spec;
  const table = useMemo(() => buildCayleyTable(spec), [spec]);

  const exportCsv = () => {
    const header = ['*', ...table.labels].join(',');
    const rows = table.matrix.map((row, rIdx) =>
      [table.labels[rIdx], ...row.map((val) => `"${table.labels[val]}"`)].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cayley-${preset}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    const payload = {
      title: table.title,
      order: table.order,
      elements: table.labels,
      matrix: table.matrix.map((row) => row.map((idx) => table.labels[idx])),
      axioms: table.axioms,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cayley-${preset}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-serif-math">Cayley Table Generator & Axiom Auditor</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Click any cell <span className="font-mono-math">(row a, col b)</span> to inspect{' '}
              <span className="font-mono-math">a * b</span> versus{' '}
              <span className="font-mono-math">b * a</span> and verify closure, associativity, identity, inverses, and Latin square structure.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 no-print">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-teal-500"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              type="button"
              onClick={exportJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-teal-500"
            >
              <Download className="w-3.5 h-3.5" /> JSON
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1F3A] dark:bg-teal-600 text-white text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => {
                setPreset(p.key);
                setActiveCell({ r: 0, c: 0 });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-math font-semibold border ${
                preset === p.key
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* Axiom Verification & Cell Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-2.5">
          <h3 className="font-bold text-sm">Verified Axiom Diagnostics</h3>
          <div className="space-y-1.5 text-xs">
            {[
              ['Closure verified', table.axioms.closed],
              ['Associativity (a*b)*c = a*(b*c)', table.axioms.associative],
              [`Identity (${table.labels[table.identityIndex]})`, table.axioms.hasIdentity],
              ['Every element invertible', table.axioms.allHaveInverses],
              ['Latin square rows & cols', table.axioms.isLatinSquare],
            ].map(([lbl, ok], idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span>{lbl as string}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {ok ? 'Pass' : 'Fail'}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Commutativity (Abelian)</span>
              <span className="font-semibold">
                {table.axioms.isAbelian ? 'Abelian (Symmetric)' : 'Nonabelian (Asymmetric)'}
              </span>
            </div>
          </div>
        </section>

        <section className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
          <h3 className="font-bold text-sm">Cell Operation Inspector · {table.title}</h3>
          {activeCell && activeCell.r < table.order && activeCell.c < table.order ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-math">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="text-slate-500 font-sans font-semibold">Row × Column</div>
                <div className="text-base font-bold">
                  ({table.labels[activeCell.r]}) * ({table.labels[activeCell.c]}) ={' '}
                  <span className="text-teal-700 dark:text-teal-400">
                    {table.labels[table.matrix[activeCell.r][activeCell.c]]}
                  </span>
                </div>
                <div>
                  ord({table.labels[activeCell.r]}) = {table.orders[activeCell.r]} · inverse ={' '}
                  {table.labels[table.inverses[activeCell.r]]}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="text-slate-500 font-sans font-semibold">Swapped Order Comparison</div>
                <div className="text-base font-bold">
                  ({table.labels[activeCell.c]}) * ({table.labels[activeCell.r]}) ={' '}
                  <span className="text-[#0B1F3A] dark:text-slate-100">
                    {table.labels[table.matrix[activeCell.c][activeCell.r]]}
                  </span>
                </div>
                <div className="font-sans">
                  {table.matrix[activeCell.r][activeCell.c] === table.matrix[activeCell.c][activeCell.r]
                    ? 'This pair commutes (a * b = b * a).'
                    : 'Non-commuting pair (a * b ≠ b * a)!'}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {/* Table Matrix */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 overflow-x-auto">
        <table className="text-xs font-mono-math border-collapse mx-auto">
          <thead>
            <tr>
              <th className="p-2 border border-slate-200 dark:border-slate-700 bg-[#0B1F3A] text-white">
                *
              </th>
              {table.labels.map((lbl, cIdx) => (
                <th
                  key={cIdx}
                  className={`p-2 border border-slate-200 dark:border-slate-700 font-bold whitespace-nowrap ${
                    activeCell?.c === cIdx
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {lbl}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.matrix.map((row, rIdx) => (
              <tr key={rIdx}>
                <th
                  className={`p-2 border border-slate-200 dark:border-slate-700 font-bold text-left whitespace-nowrap ${
                    activeCell?.r === rIdx
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {table.labels[rIdx]}
                </th>
                {row.map((val, cIdx) => {
                  const isSel = activeCell?.r === rIdx && activeCell?.c === cIdx;
                  const isIdentity = val === table.identityIndex;
                  return (
                    <td
                      key={cIdx}
                      onClick={() => setActiveCell({ r: rIdx, c: cIdx })}
                      className={`p-2 border border-slate-200 dark:border-slate-700 text-center cursor-pointer whitespace-nowrap transition-colors ${
                        isSel
                          ? 'bg-teal-600 text-white font-bold'
                          : isIdentity
                          ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-semibold'
                          : activeCell?.r === rIdx || activeCell?.c === cIdx
                          ? 'bg-slate-50 dark:bg-slate-800/50'
                          : ''
                      }`}
                    >
                      {table.labels[val]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
