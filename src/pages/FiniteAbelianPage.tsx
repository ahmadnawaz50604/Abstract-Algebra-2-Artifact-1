import React, { useMemo, useState } from 'react';
import { MathText } from '../components/MathText.tsx';
import {
  addDirectProductTuples,
  computeOrderDistribution,
  directProductToCanonical,
  enumerateDirectProduct,
  formatTuple,
  formatZnProduct,
  inverseDirectProductTuple,
  isDirectProductCyclic,
  orderDirectProductTuple,
} from '../math/abelian.ts';

const PRESETS: { label: string; moduli: number[] }[] = [
  { label: 'ℤ₂ × ℤ₂', moduli: [2, 2] },
  { label: 'ℤ₄', moduli: [4] },
  { label: 'ℤ₂ × ℤ₄', moduli: [2, 4] },
  { label: 'ℤ₂ × ℤ₆', moduli: [2, 6] },
  { label: 'ℤ₃ × ℤ₃', moduli: [3, 3] },
  { label: 'ℤ₄ × ℤ₄', moduli: [4, 4] },
  { label: 'ℤ₂ × ℤ₄ × ℤ₃', moduli: [2, 4, 3] },
];

export const FiniteAbelianPage: React.FC = () => {
  const [moduliInput, setModuliInput] = useState('2, 4');
  const [moduli, setModuli] = useState<number[]>([2, 4]);
  const [error, setError] = useState('');
  const [tupleA, setTupleA] = useState<number[]>([1, 1]);
  const [tupleB, setTupleB] = useState<number[]>([1, 2]);

  const applyModuli = (next: number[]) => {
    setModuli(next);
    setModuliInput(next.join(', '));
    setTupleA(next.map((m) => (m > 1 ? 1 : 0)));
    setTupleB(next.map((m) => Math.min(2, m - 1)));
    setError('');
  };

  const handleApplyInput = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = moduliInput
      .split(/[\s,×x]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n) && n > 0);
    if (parts.length === 0 || parts.some((n) => !Number.isInteger(n) || n < 2 || n > 60)) {
      setError('Enter 1 to 4 integer moduli between 2 and 60 (e.g. 2, 4 or 2, 2, 9).');
      return;
    }
    const prod = parts.reduce((a, b) => a * b, 1);
    if (prod > 256) {
      setError(`Group order ${prod} exceeds interactive enumeration limit of 256.`);
      return;
    }
    applyModuli(parts);
  };

  const analysis = useMemo(() => {
    const order = moduli.reduce((a, b) => a * b, 1);
    const elements = enumerateDirectProduct(moduli, 256);
    const orderDist = computeOrderDistribution(moduli);
    const canonical = directProductToCanonical(moduli);
    const cyclic = isDirectProductCyclic(moduli);
    const maxOrder = Math.max(...Object.keys(orderDist).map(Number));
    const sumAB = addDirectProductTuples(tupleA, tupleB, moduli);
    const invA = inverseDirectProductTuple(tupleA, moduli);
    const ordA = orderDirectProductTuple(tupleA, moduli);
    return {
      order,
      elements,
      orderDist,
      canonical,
      cyclic,
      maxOrder,
      sumAB,
      invA,
      ordA,
    };
  }, [moduli, tupleA, tupleB]);

  return (
    <div className="space-y-6">
      {/* Header & Presets */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold font-serif-math">
            Finite Abelian Group Builder & Direct Product Laboratory
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Construct direct products <span className="font-mono-math">ℤₙ₁ × ⋯ × ℤₙₖ</span>, compute tuple operations, inspect element order distributions, and contrast equal-order groups like <span className="font-mono-math">ℤ₄</span> vs <span className="font-mono-math">ℤ₂ × ℤ₂</span>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyModuli(p.moduli)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono-math border transition-colors ${
                JSON.stringify(p.moduli) === JSON.stringify(moduli)
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleApplyInput} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Custom Cyclic Moduli (comma-separated, e.g. 2, 6)
            </label>
            <input
              type="text"
              value={moduliInput}
              onChange={(e) => setModuliInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono-math"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold"
          >
            Build Group
          </button>
        </form>
        {error && <div className="text-xs text-red-600 dark:text-red-400">{error}</div>}
      </section>

      {/* Structural Properties & Tuple Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-4">
          <h3 className="font-bold text-base">
            Structural Analysis of {formatZnProduct(moduli)}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500">Group Order |G|</div>
              <div className="text-lg font-bold font-mono-math mt-0.5">{analysis.order}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500">Cyclicity</div>
              <div className="text-sm font-bold mt-1 text-teal-700 dark:text-teal-400">
                {analysis.cyclic ? `Cyclic (≅ ℤ_${analysis.order})` : `Non-cyclic (max order ${analysis.maxOrder})`}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500">Elementary Divisors</div>
              <div className="text-sm font-bold font-mono-math mt-1">
                {analysis.canonical.elementaryLabel}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500">Invariant Factors</div>
              <div className="text-sm font-bold font-mono-math mt-1">
                {analysis.canonical.invariantLabel}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Order Distribution
            </div>
            <div className="space-y-1.5">
              {Object.entries(analysis.orderDist).map(([ord, cnt]) => {
                const pct = Math.round((cnt / analysis.order) * 100);
                return (
                  <div key={ord} className="flex items-center gap-3 text-xs">
                    <span className="w-20 font-mono-math tabular-nums">Order {ord}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-teal-600" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-20 text-right font-mono-math tabular-nums">
                      {cnt} el ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-4">
          <h3 className="font-bold text-base">Componentwise Operation & Order Lab</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500">Element a</div>
              <div className="flex flex-wrap gap-2">
                {moduli.map((m, i) => (
                  <select
                    key={i}
                    value={tupleA[i] ?? 0}
                    onChange={(e) => {
                      const next = [...tupleA];
                      next[i] = Number(e.target.value);
                      setTupleA(next);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono-math"
                  >
                    {Array.from({ length: m }, (_, v) => (
                      <option key={v} value={v}>
                        {v} (mod {m})
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500">Element b</div>
              <div className="flex flex-wrap gap-2">
                {moduli.map((m, i) => (
                  <select
                    key={i}
                    value={tupleB[i] ?? 0}
                    onChange={(e) => {
                      const next = [...tupleB];
                      next[i] = Number(e.target.value);
                      setTupleB(next);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono-math"
                  >
                    {Array.from({ length: m }, (_, v) => (
                      <option key={v} value={v}>
                        {v} (mod {m})
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-sm font-mono-math">
            <div>
              a + b = {formatTuple(tupleA)} + {formatTuple(tupleB)} ={' '}
              <span className="font-bold text-teal-700 dark:text-teal-400">
                {formatTuple(analysis.sumAB)}
              </span>
            </div>
            <div>
              −a = <span className="font-bold">{formatTuple(analysis.invA)}</span>
            </div>
            <div>
              ord(a) = <span className="font-bold">{analysis.ordA}</span>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <MathText text="Notice why $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$ and $\\mathbb{Z}_4$ both have order $4$ yet are non-isomorphic: in $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$, every non-identity element has order $2$ and none has order $4$, whereas $\\mathbb{Z}_4$ contains elements $1$ and $3$ of order $4$." />
          </div>
        </section>
      </div>

      {/* Full Element Table */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base">
            All Elements & Orders in {formatZnProduct(moduli)} ({analysis.elements.length} elements)
          </h3>
          <span className="text-xs text-slate-500">Closure & inverses verified</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-72 overflow-y-auto pr-1">
          {analysis.elements.map((el, idx) => (
            <div
              key={idx}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between font-mono-math"
            >
              <span>{formatTuple(el)}</span>
              <span className="text-teal-700 dark:text-teal-400 font-semibold">
                {orderDirectProductTuple(el, moduli)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
