import { ArrowRight } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { computeOrderDistribution, formatZnProduct } from '../math/abelian.ts';
import { dihedralCenter, dihedralOrder, formatDihedral, generateDn } from '../math/dihedral.ts';
import { eulerPhi, orderInZn } from '../math/numberTheory.ts';
import { formatCycleNotation, permOrder, summarizeSn } from '../math/permutations.ts';

type ExplorerFamily = 'cyclic' | 'direct' | 'dihedral' | 'symmetric' | 'alternating';

export const GroupExplorerPage: React.FC = () => {
  const { setActiveNav } = useApp();
  const [family, setFamily] = useState<ExplorerFamily>('dihedral');
  const [nParam, setNParam] = useState(4);
  const [dpModuli, setDpModuli] = useState<[number, number]>([2, 6]);

  const summary = useMemo(() => {
    if (family === 'cyclic') {
      const elements = Array.from({ length: nParam }, (_, k) => ({
        label: String(k),
        order: orderInZn(k, nParam),
      }));
      const dist: Record<number, number> = {};
      elements.forEach((e) => (dist[e.order] = (dist[e.order] ?? 0) + 1));
      return {
        name: `ℤ_${nParam}`,
        order: nParam,
        isAbelian: true,
        isCyclic: true,
        center: `ℤ_${nParam} (all ${nParam} elements)`,
        generators: `${eulerPhi(nParam)} single-element generators`,
        elements,
        dist,
      };
    }

    if (family === 'direct') {
      const [a, b] = dpModuli;
      const dist = computeOrderDistribution([a, b]);
      const elements: { label: string; order: number }[] = [];
      for (let i = 0; i < a; i++) {
        for (let j = 0; j < b; j++) {
          const oa = orderInZn(i, a);
          const ob = orderInZn(j, b);
          const g = (x: number, y: number): number => (y === 0 ? x : g(y, x % y));
          elements.push({ label: `(${i}, ${j})`, order: (oa * ob) / g(oa, ob) });
        }
      }
      const maxOrd = Math.max(...Object.keys(dist).map(Number));
      return {
        name: formatZnProduct([a, b]),
        order: a * b,
        isAbelian: true,
        isCyclic: maxOrd === a * b,
        center: `Entire group (${a * b} elements)`,
        generators: maxOrd === a * b ? 'Cyclic (single generator exists)' : 'Requires ≥ 2 generators',
        elements,
        dist,
      };
    }

    if (family === 'dihedral') {
      const els = generateDn(nParam);
      const elements = els.map((e) => ({ label: formatDihedral(e), order: dihedralOrder(e) }));
      const dist: Record<number, number> = {};
      elements.forEach((e) => (dist[e.order] = (dist[e.order] ?? 0) + 1));
      const center = dihedralCenter(nParam).map((e) => formatDihedral(e)).join(', ');
      return {
        name: `D_${nParam}`,
        order: 2 * nParam,
        isAbelian: false,
        isCyclic: false,
        center: `{${center}}`,
        generators: '2 generators: {ρ, μ}',
        elements,
        dist,
      };
    }

    const deg = Math.min(5, Math.max(2, nParam));
    const s = summarizeSn(deg);
    const chosen = family === 'alternating' ? s.alternating : s.elements;
    const dist: Record<number, number> = {};
    const elements = chosen.map((p) => {
      const o = permOrder(p);
      dist[o] = (dist[o] ?? 0) + 1;
      return { label: formatCycleNotation(p), order: o };
    });
    return {
      name: family === 'alternating' ? `A_${deg}` : `S_${deg}`,
      order: chosen.length,
      isAbelian: chosen.length <= 3,
      isCyclic: chosen.length <= 3,
      center: chosen.length <= 3 ? `Entire group` : '{ι}',
      generators: family === 'alternating' ? '3-cycles' : 'Transpositions {(1,2), (1,2,...,n)}',
      elements,
      dist,
    };
  }, [family, nParam, dpModuli]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-serif-math">Artifact 1 Group Explorer</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Inspect structural invariants, centers, element listings, and order profiles across cyclic, direct-product, dihedral, symmetric, and alternating groups.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveNav('cayley')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold whitespace-nowrap self-start"
          >
            <span>Open in Cayley Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ['cyclic', 'Cyclic ℤₙ'],
              ['direct', 'Direct Product ℤₘ × ℤₙ'],
              ['dihedral', 'Dihedral Dₙ (1, ρ, μ)'],
              ['symmetric', 'Symmetric Sₙ'],
              ['alternating', 'Alternating Aₙ'],
            ] as [ExplorerFamily, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setFamily(id);
                if ((id === 'symmetric' || id === 'alternating') && nParam > 5) setNParam(4);
                if (id === 'dihedral' && nParam < 3) setNParam(4);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold border ${
                family === id
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {family === 'direct' ? (
          <div className="flex flex-wrap gap-4 items-center text-xs">
            <label className="flex items-center gap-2">
              <span className="font-semibold">m:</span>
              <input
                type="number"
                min={2}
                max={12}
                value={dpModuli[0]}
                onChange={(e) => setDpModuli([Math.max(2, Math.min(12, Number(e.target.value))), dpModuli[1]])}
                className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="font-semibold">n:</span>
              <input
                type="number"
                min={2}
                max={12}
                value={dpModuli[1]}
                onChange={(e) => setDpModuli([dpModuli[0], Math.max(2, Math.min(12, Number(e.target.value)))])}
                className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math"
              />
            </label>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold">Parameter n = {nParam}</span>
            <input
              type="range"
              min={family === 'dihedral' ? 3 : 2}
              max={family === 'symmetric' || family === 'alternating' ? 5 : 24}
              value={nParam}
              onChange={(e) => setNParam(Number(e.target.value))}
              className="w-56 accent-teal-600"
            />
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-4">
          <div className="text-xs text-slate-500">Group</div>
          <div className="text-lg font-bold font-mono-math mt-1">{summary.name}</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-4">
          <div className="text-xs text-slate-500">Order |G|</div>
          <div className="text-lg font-bold font-mono-math tabular-nums mt-1">{summary.order}</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-4">
          <div className="text-xs text-slate-500">Abelian</div>
          <div className="text-sm font-bold mt-1.5 text-teal-700 dark:text-teal-400">
            {summary.isAbelian ? 'Yes (Abelian)' : 'No (Nonabelian)'}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-4">
          <div className="text-xs text-slate-500">Cyclic</div>
          <div className="text-sm font-bold mt-1.5">{summary.isCyclic ? 'Yes' : 'No'}</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-4">
          <div className="text-xs text-slate-500">Center Z(G)</div>
          <div className="text-xs font-bold font-mono-math mt-1.5">{summary.center}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
          <h3 className="font-bold text-base">Order Histogram</h3>
          <div className="space-y-2">
            {Object.entries(summary.dist)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([ord, cnt]) => {
                const pct = Math.round((cnt / summary.order) * 100);
                return (
                  <div key={ord} className="flex items-center gap-3 text-xs">
                    <span className="w-16 font-mono-math">ord {ord}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-teal-600" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-14 text-right font-mono-math tabular-nums">{cnt}</span>
                  </div>
                );
              })}
          </div>
          <div className="pt-2 text-xs text-slate-500">Generators: {summary.generators}</div>
        </section>

        <section className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
          <h3 className="font-bold text-base">
            Elements & Orders ({summary.elements.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
            {summary.elements.slice(0, 120).map((el, i) => (
              <div
                key={i}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between font-mono-math"
              >
                <span className="truncate">{el.label}</span>
                <span className="text-teal-700 dark:text-teal-400 font-semibold ml-1">
                  {el.order}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
