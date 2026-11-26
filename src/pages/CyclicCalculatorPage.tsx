import React, { useMemo, useState } from 'react';
import {
  coprimesBelow,
  cyclicSubgroupZn,
  eulerPhi,
  formatPrimeFactorization,
  inverseInZn,
  orderInZn,
} from '../math/numberTheory.ts';

const PRESET_MODULI = [4, 6, 8, 10, 12, 20];

export const CyclicCalculatorPage: React.FC = () => {
  const [n, setN] = useState(12);
  const [elementA, setElementA] = useState(5);
  const [tableFilter, setTableFilter] = useState<'all' | '1to20' | 'primes'>('1to20');
  const [trailSteps, setTrailSteps] = useState(1);

  const safeN = Math.max(1, Math.min(200, Math.trunc(n) || 1));
  const safeA = ((elementA % safeN) + safeN) % safeN;

  const detail = useMemo(() => {
    const phi = eulerPhi(safeN);
    const generators = coprimesBelow(safeN);
    const factorText = formatPrimeFactorization(safeN);
    const elementOrder = orderInZn(safeA, safeN);
    const elementInverse = inverseInZn(safeA, safeN);
    const subgroup = cyclicSubgroupZn(safeA, safeN);
    const allElements =
      safeN <= 60
        ? Array.from({ length: safeN }, (_, k) => ({
            k,
            order: orderInZn(k, safeN),
            inverse: inverseInZn(k, safeN),
            isGenerator: generators.includes(k),
          }))
        : [];
    return { phi, generators, factorText, elementOrder, elementInverse, subgroup, allElements };
  }, [safeN, safeA]);

  const tableRows = useMemo(() => {
    const all = Array.from({ length: 100 }, (_, i) => {
      const k = i + 1;
      const gens = coprimesBelow(k);
      return {
        n: k,
        factorization: formatPrimeFactorization(k),
        phi: eulerPhi(k),
        preview: gens.slice(0, 6).join(', ') + (gens.length > 6 ? ', …' : ''),
        isPrime: k > 1 && eulerPhi(k) === k - 1,
      };
    });
    if (tableFilter === '1to20') return all.slice(0, 20);
    if (tableFilter === 'primes') return all.filter((r) => r.isPrime);
    return all;
  }, [tableFilter]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold font-serif-math">
            Cyclic Group, Generator & Euler Totient Calculator (ℤₙ)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Compute <span className="font-mono-math">φ(n)</span>, identify all generators of{' '}
            <span className="font-mono-math">ℤₙ</span> via{' '}
            <span className="font-mono-math">gcd(k, n) = 1</span>, inspect element orders & inverses, and browse the full <span className="font-mono-math">n = 1..100</span> reference table.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-slate-500">Guided Presets:</span>
          {PRESET_MODULI.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setN(m);
                setElementA(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-math font-semibold border ${
                safeN === m
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              ℤ_{m}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-xs">
            <span className="font-semibold">Custom n (1..200):</span>
            <input
              type="number"
              min={1}
              max={200}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math"
            />
          </label>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
          <h3 className="font-bold text-base">Summary for ℤ_{safeN}</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Prime Factorization</span>
              <span className="font-mono-math font-semibold">{detail.factorText}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Euler Totient φ({safeN})</span>
              <span className="font-mono-math font-bold text-teal-700 dark:text-teal-400">
                {detail.phi}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500">
              Generators ({detail.generators.length})
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-mono-math text-xs max-h-36 overflow-y-auto">
              {'{'}{detail.generators.join(', ')}{'}'}
            </div>
          </div>
        </section>

        <section className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-base">Element Order, Inverse & Subgroup ⟨a⟩</h3>
            <label className="flex items-center gap-2 text-xs">
              <span>Inspect element a ∈ ℤ_{safeN}:</span>
              <input
                type="number"
                min={0}
                max={Math.max(0, safeN - 1)}
                value={safeA}
                onChange={(e) => setElementA(Number(e.target.value))}
                className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math"
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500">ord({safeA})</div>
              <div className="text-lg font-bold font-mono-math mt-0.5">{detail.elementOrder}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500">Inverse (−{safeA} mod {safeN})</div>
              <div className="text-lg font-bold font-mono-math mt-0.5">{detail.elementInverse}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500">Generates ℤ_{safeN}?</div>
              <div className="text-sm font-bold mt-1 text-teal-700 dark:text-teal-400">
                {detail.elementOrder === safeN ? 'Yes (Generator)' : 'No'}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Interactive Subgroup Trail ⟨{safeA}⟩ in ⟨ℤ_{safeN}, +_{safeN}⟩
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setTrailSteps((s) => Math.min(detail.elementOrder, s + 1))
                  }
                  disabled={trailSteps >= detail.elementOrder}
                  className="px-2.5 py-1 rounded bg-teal-600 text-white font-semibold disabled:opacity-40"
                >
                  + Step ({safeA})
                </button>
                <button
                  type="button"
                  onClick={() => setTrailSteps(detail.elementOrder)}
                  className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Show Full ⟨{safeA}⟩
                </button>
                <button
                  type="button"
                  onClick={() => setTrailSteps(1)}
                  className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 font-mono-math">
              {Array.from(
                { length: Math.min(detail.elementOrder, Math.max(1, trailSteps)) },
                (_, idx) => {
                  const k = idx + 1;
                  const val = (k * safeA) % safeN;
                  return (
                    <span
                      key={k}
                      className={`px-2 py-1 rounded border ${
                        val === 0
                          ? 'bg-teal-600 text-white border-teal-600 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {k}·{safeA} ≡ {val}
                    </span>
                  );
                }
              )}
            </div>

            <div className="font-mono-math text-slate-700 dark:text-slate-300">
              ⟨{safeA}⟩ = {'{'}{detail.subgroup.slice(0, 40).join(', ')}
              {detail.subgroup.length > 40 ? ', …' : ''}{'}'} (|⟨{safeA}⟩| = {detail.elementOrder})
            </div>
          </div>

          {detail.allElements.length > 0 && (
            <div className="overflow-x-auto max-h-56 overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                    <th className="py-1.5 pr-3">Element a</th>
                    <th className="py-1.5 pr-3">Order</th>
                    <th className="py-1.5 pr-3">Inverse</th>
                    <th className="py-1.5">Generator?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono-math tabular-nums">
                  {detail.allElements.map((row) => (
                    <tr
                      key={row.k}
                      onClick={() => setElementA(row.k)}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-1.5 pr-3 font-semibold">{row.k}</td>
                      <td className="py-1.5 pr-3">{row.order}</td>
                      <td className="py-1.5 pr-3">{row.inverse}</td>
                      <td className={row.isGenerator ? 'text-teal-700 dark:text-teal-400 font-semibold' : 'text-slate-400'}>
                        {row.isGenerator ? 'Generator' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Reference Table n = 1..100 */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-base">Euler Totient & Generator Reference Table (n = 1..100)</h3>
          <div className="flex gap-2 text-xs">
            {(
              [
                ['1to20', 'Guided n = 1..20'],
                ['all', 'Full n = 1..100'],
                ['primes', 'Primes ≤ 100'],
              ] as const
            ).map(([k, lbl]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTableFilter(k)}
                className={`px-3 py-1.5 rounded-lg border font-semibold ${
                  tableFilter === k
                    ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                <th className="py-2 pr-3">n</th>
                <th className="py-2 pr-3">Prime Factorization</th>
                <th className="py-2 pr-3">φ(n)</th>
                <th className="py-2">Generators of ℤₙ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono-math tabular-nums">
              {tableRows.map((r) => (
                <tr
                  key={r.n}
                  onClick={() => {
                    setN(r.n);
                    setElementA(1);
                  }}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="py-1.5 pr-3 font-bold">{r.n}</td>
                  <td className="py-1.5 pr-3">{r.factorization}</td>
                  <td className="py-1.5 pr-3 font-semibold text-teal-700 dark:text-teal-400">
                    {r.phi}
                  </td>
                  <td className="py-1.5 text-slate-600 dark:text-slate-300">{r.preview}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
