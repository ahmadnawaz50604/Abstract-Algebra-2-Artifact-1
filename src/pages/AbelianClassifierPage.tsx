import React, { useMemo, useState } from 'react';
import { KatexFormula } from '../components/MathText.tsx';
import { classifyAbelianGroups } from '../math/abelian.ts';

const SAMPLE_ORDERS = [4, 8, 12, 16, 24, 36, 72, 108, 360];

export const AbelianClassifierPage: React.FC = () => {
  const [orderInput, setOrderInput] = useState(72);

  const safeOrder = Math.max(1, Math.min(50000, Math.trunc(orderInput) || 1));

  const classification = useMemo(() => {
    try {
      return { error: '', data: classifyAbelianGroups(safeOrder) };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Unable to classify order.',
        data: null,
      };
    }
  }, [safeOrder]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold font-serif-math">
            Finite Abelian Group Classifier (Fundamental Theorem)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Enter any finite group order <span className="font-mono-math">n</span> to compute all non-isomorphic abelian groups in both elementary-divisor (primary-factor) and invariant-factor (<span className="font-mono-math">d₁ | d₂ | ⋯ | dᵣ</span>) forms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Benchmarks:</span>
          {SAMPLE_ORDERS.map((ord) => (
            <button
              key={ord}
              type="button"
              onClick={() => setOrderInput(ord)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-math font-semibold border ${
                safeOrder === ord
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              n = {ord}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-xs">
            <span className="font-semibold">Order n (1..50,000):</span>
            <input
              type="number"
              min={1}
              max={50000}
              value={orderInput}
              onChange={(e) => setOrderInput(Number(e.target.value))}
              className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math"
            />
          </label>
        </div>
      </section>

      {classification.data && (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5">
              <div className="text-xs text-slate-500">Prime Factorization</div>
              <div className="mt-2 text-lg font-bold font-mono-math">
                {classification.data.order} = {classification.data.primeFactorizationText}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5">
              <div className="text-xs text-slate-500">Non-Isomorphic Abelian Groups</div>
              <div className="mt-2 text-2xl font-bold font-mono-math text-teal-700 dark:text-teal-400 tabular-nums">
                {classification.data.totalGroups}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5">
              <div className="text-xs text-slate-500">Cyclic Representative</div>
              <div className="mt-2 text-lg font-bold font-mono-math">
                ℤ_{classification.data.order}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-3">
            <h3 className="font-bold text-base">Mathematical Derivation</h3>
            <ol className="list-decimal pl-5 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              {classification.data.reasoningSteps.map((st, idx) => (
                <li key={idx}>{st}</li>
              ))}
            </ol>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
            <h3 className="font-bold text-base">
              Complete Classification Table for Order {classification.data.order}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                    <th className="py-2 pr-3">#</th>
                    <th className="py-2 pr-3">Prime Partitions</th>
                    <th className="py-2 pr-3">Elementary-Divisor Form (Thm 9.12)</th>
                    <th className="py-2 pr-3">Invariant-Factor Form (Thm 9.14)</th>
                    <th className="py-2 pr-3 text-right">Max Element Order</th>
                    <th className="py-2 text-right">Cyclic?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {classification.data.groups.map((g) => (
                    <tr key={g.index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 pr-3 font-mono-math">{g.index}</td>
                      <td className="py-2.5 pr-3 font-mono-math text-slate-600 dark:text-slate-300">
                        {g.primePartitionsDetail
                          .map((p) => `${p.prime}: [${p.partition.join('+')}]`)
                          .join(' · ') || '—'}
                      </td>
                      <td className="py-2.5 pr-3">
                        <KatexFormula latex={g.elementaryLatex} />
                      </td>
                      <td className="py-2.5 pr-3 font-semibold text-teal-700 dark:text-teal-400">
                        <KatexFormula latex={g.invariantLatex} />
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono-math tabular-nums font-semibold">
                        {g.maxElementOrder}
                      </td>
                      <td className="py-2.5 text-right font-semibold">
                        {g.isCyclic ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
