import React, { useMemo, useState } from 'react';
import {
  composePermWithTrace,
  cycleType,
  formatCycleNotation,
  formatTranspositions,
  formatTwoRowLines,
  invertPerm,
  parseCycleString,
  parseTwoRowArrays,
  permOrder,
  permParity,
  summarizeSn,
} from '../math/permutations.ts';

export const PermutationLabPage: React.FC = () => {
  const [n, setN] = useState(5);
  const [inputMode, setInputMode] = useState<'cycle' | 'tworow'>('cycle');
  const [sigmaCycle, setSigmaCycle] = useState('(1 2 3)(4 5)');
  const [tauCycle, setTauCycle] = useState('(1 4)(2 3)');
  const [sigmaTwoRow, setSigmaTwoRow] = useState('2 3 1 5 4');
  const [tauTwoRow, setTauTwoRow] = useState('4 3 2 1 5');
  const [explorerFilter, setExplorerFilter] = useState<'all' | 'even' | 'odd'>('all');
  const [selectedTraceX, setSelectedTraceX] = useState<number>(1);

  const parsed = useMemo(() => {
    try {
      const sigma =
        inputMode === 'cycle'
          ? parseCycleString(sigmaCycle, n)
          : parseTwoRowArrays(sigmaTwoRow.trim().split(/[\s,]+/).map(Number), n);
      const tau =
        inputMode === 'cycle'
          ? parseCycleString(tauCycle, n)
          : parseTwoRowArrays(tauTwoRow.trim().split(/[\s,]+/).map(Number), n);

      const { result: prodST, steps: stepsST } = composePermWithTrace(sigma, tau);
      const { result: prodTS } = composePermWithTrace(tau, sigma);
      return {
        error: '',
        sigma,
        tau,
        prodST,
        stepsST,
        prodTS,
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Invalid permutation input.',
        sigma: null,
        tau: null,
        prodST: null,
        stepsST: [],
        prodTS: null,
      };
    }
  }, [n, inputMode, sigmaCycle, tauCycle, sigmaTwoRow, tauTwoRow]);

  const snSummary = useMemo(() => (n <= 5 ? summarizeSn(n) : null), [n]);

  const changeDegree = (nextN: number) => {
    const safeN = Math.max(2, Math.min(12, Math.trunc(nextN) || 2));
    setN(safeN);
    setSelectedTraceX(1);
    if (safeN === 2) {
      setSigmaCycle('(1 2)');
      setTauCycle('ι');
      setSigmaTwoRow('2 1');
      setTauTwoRow('1 2');
    } else if (safeN === 3) {
      setSigmaCycle('(1 2)');
      setTauCycle('(1 3)');
      setSigmaTwoRow('2 1 3');
      setTauTwoRow('3 2 1');
    } else if (safeN === 4) {
      setSigmaCycle('(1 3 2)');
      setTauCycle('(2 4)');
      setSigmaTwoRow('3 1 2 4');
      setTauTwoRow('1 4 3 2');
    } else if (safeN === 5) {
      setSigmaCycle('(1 2 3)(4 5)');
      setTauCycle('(1 4)(2 3)');
      setSigmaTwoRow('2 3 1 5 4');
      setTauTwoRow('4 3 2 1 5');
    } else {
      const shifted = Array.from({ length: safeN }, (_, i) => ((i + 1) % safeN) + 1);
      const swapped = Array.from({ length: safeN }, (_, i) =>
        i === 0 ? 2 : i === 1 ? 1 : i + 1
      );
      setSigmaCycle(`(1 2 3)(4 ${safeN})`);
      setTauCycle(`(1 ${safeN})(2 3)`);
      setSigmaTwoRow(shifted.join(' '));
      setTauTwoRow(swapped.join(' '));
    }
  };

  const renderPermCard = (title: string, p: NonNullable<typeof parsed.sigma>) => {
    const twoRow = formatTwoRowLines(p);
    return (
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 space-y-2 text-xs">
        <div className="font-bold text-sm text-[#0B1F3A] dark:text-white">{title}</div>
        <div className="font-mono-math">
          Disjoint Cycles:{' '}
          <span className="font-bold text-teal-700 dark:text-teal-400">
            {formatCycleNotation(p)}
          </span>
        </div>
        <div className="font-mono-math bg-white dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 inline-block">
          <div>[ {twoRow.top} ]</div>
          <div>[ {twoRow.bottom} ]</div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono-math">
          <div>Order: {permOrder(p)}</div>
          <div>Parity: {permParity(p)}</div>
          <div>Cycle type: [{cycleType(p).join(', ')}]</div>
          <div>Inverse: {formatCycleNotation(invertPerm(p))}</div>
        </div>
        <div className="font-mono-math text-slate-600 dark:text-slate-300">
          Transpositions: {formatTranspositions(p)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-serif-math">
              Permutation Lab & Symmetric Group Explorer (Sₙ / Aₙ)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Right-to-left composition <span className="font-mono-math">(στ)(x) = σ(τ(x))</span>, disjoint cycle decomposition, transposition factorization, and parity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[2, 3, 4, 5].map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => changeDegree(deg)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono-math border ${
                  n === deg
                    ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                S_{deg}
              </button>
            ))}
            <label className="flex items-center gap-1.5 text-xs ml-1">
              <span className="font-semibold">Custom n (2–12):</span>
              <input
                type="number"
                min={2}
                max={12}
                value={n}
                onChange={(e) => changeDegree(Number(e.target.value))}
                className="w-16 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math font-bold"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold">Input Notation:</span>
          <button
            type="button"
            onClick={() => setInputMode('cycle')}
            className={`px-3 py-1.5 rounded-lg border font-semibold ${
              inputMode === 'cycle'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            Cycle Notation
          </button>
          <button
            type="button"
            onClick={() => setInputMode('tworow')}
            className={`px-3 py-1.5 rounded-lg border font-semibold ${
              inputMode === 'tworow'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            Two-Row Bottom Mapping
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inputMode === 'cycle' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Left Permutation σ (applied second)
                </label>
                <input
                  type="text"
                  value={sigmaCycle}
                  onChange={(e) => setSigmaCycle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Right Permutation τ (applied first)
                </label>
                <input
                  type="text"
                  value={tauCycle}
                  onChange={(e) => setTauCycle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math text-sm"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Bottom Row of σ for [1..{n}]
                </label>
                <input
                  type="text"
                  value={sigmaTwoRow}
                  onChange={(e) => setSigmaTwoRow(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Bottom Row of τ for [1..{n}]
                </label>
                <input
                  type="text"
                  value={tauTwoRow}
                  onChange={(e) => setTauTwoRow(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math text-sm"
                />
              </div>
            </>
          )}
        </div>

        {parsed.error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
            {parsed.error}
          </div>
        )}
      </section>

      {/* Composition Results & Trace */}
      {parsed.sigma && parsed.tau && parsed.prodST && parsed.prodTS && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderPermCard('Left Factor σ', parsed.sigma)}
            {renderPermCard('Right Factor τ', parsed.tau)}
          </div>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
            <h3 className="font-bold text-base">
              Right-to-Left Composition: στ vs τσ
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderPermCard('Product στ (apply τ first, then σ)', parsed.prodST)}
              {renderPermCard('Reverse Product τσ (apply σ first, then τ)', parsed.prodTS)}
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Interactive Element-by-Element Trace for (στ)(x) = σ(τ(x)) — Click any x
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {parsed.stepsST.map((st) => {
                  const active = selectedTraceX === st.element;
                  return (
                    <button
                      key={st.element}
                      type="button"
                      onClick={() => setSelectedTraceX(st.element)}
                      className={`p-2.5 rounded-lg border text-xs font-mono-math text-center transition-colors ${
                        active
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/50'
                          : 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
                      }`}
                    >
                      {st.element} → {st.afterRight} →{' '}
                      <span className="font-bold text-teal-700 dark:text-teal-400">
                        {st.afterLeft}
                      </span>
                    </button>
                  );
                })}
              </div>
              {(() => {
                const chosen =
                  parsed.stepsST.find((s) => s.element === selectedTraceX) ?? parsed.stepsST[0];
                if (!chosen) return null;
                return (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-mono-math">
                    Step-by-step for x = {chosen.element}: apply right factor τ({chosen.element}) ={' '}
                    <span className="font-bold">{chosen.afterRight}</span>, then apply left factor σ(
                    {chosen.afterRight}) ={' '}
                    <span className="font-bold text-teal-700 dark:text-teal-400">
                      {chosen.afterLeft}
                    </span>{' '}
                    ⇒ (στ)({chosen.element}) = {chosen.afterLeft}.
                  </div>
                );
              })()}
            </div>
          </section>
        </>
      )}

      {/* Symmetric & Alternating Group Explorer */}
      {snSummary && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base">
                Full Group Listing: S_{n} (|S_{n}| = {snSummary.total}, |A_{n}| = {snSummary.evenCount} even, {snSummary.oddCount} odd)
              </h3>
              <div className="text-xs text-slate-500 mt-0.5 font-mono-math">
                Order counts:{' '}
                {Object.entries(snSummary.orderDistribution)
                  .map(([o, c]) => `ord ${o}: ${c}`)
                  .join(' · ')}
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              {(['all', 'even', 'odd'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setExplorerFilter(f)}
                  className={`px-3 py-1.5 rounded-lg border font-semibold capitalize ${
                    explorerFilter === f
                      ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {f === 'all' ? `All (${snSummary.total})` : f === 'even' ? `A_${n} Even (${snSummary.evenCount})` : `Odd (${snSummary.oddCount})`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-80 overflow-y-auto pr-1">
            {snSummary.elements
              .filter((p) => explorerFilter === 'all' || permParity(p) === explorerFilter)
              .map((p, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono-math flex items-center justify-between"
                >
                  <span className="truncate font-semibold">{formatCycleNotation(p)}</span>
                  <span className="text-[11px] text-slate-500 ml-1 shrink-0">
                    o:{permOrder(p)} · {permParity(p)[0]}
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
};
