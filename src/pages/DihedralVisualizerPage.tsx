import React, { useMemo, useState } from 'react';
import { DihedralSvgDiagram } from '../components/DihedralSvgDiagram.tsx';
import {
  createDihedralElement,
  dihedralCenter,
  dihedralDescription,
  dihedralInverse,
  dihedralOrder,
  dihedralToVertexPerm,
  formatDihedral,
  generateDn,
  multiplyDihedral,
  parseDihedralExpression,
  verifyDnAlgebraicConsistency,
} from '../math/dihedral.ts';

export const DihedralVisualizerPage: React.FC = () => {
  const [n, setN] = useState(5);
  const [selectedRef, setSelectedRef] = useState<0 | 1>(1);
  const [selectedK, setSelectedK] = useState(2);

  // Composition calculator inputs
  const [leftExpr, setLeftExpr] = useState('μρ²');
  const [rightExpr, setRightExpr] = useState('μρ');

  const currentEl = createDihedralElement(n, selectedRef, selectedK % n);
  const allElements = useMemo(() => generateDn(n), [n]);
  const centerEls = useMemo(() => dihedralCenter(n), [n]);
  const consistency = useMemo(() => verifyDnAlgebraicConsistency(n), [n]);

  const productData = useMemo(() => {
    try {
      const left = parseDihedralExpression(leftExpr, n, '1');
      const right = parseDihedralExpression(rightExpr, n, '1');
      const { result, steps } = multiplyDihedral(left, right, '1');
      const rev = multiplyDihedral(right, left, '1').result;
      return { error: '', left, right, result, steps, rev };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Invalid expression.',
        left: null,
        right: null,
        result: null,
        steps: [],
        rev: null,
      };
    }
  }, [leftExpr, rightExpr, n]);

  const vertexPerm = dihedralToVertexPerm(currentEl);

  return (
    <div className="space-y-6">
      {/* Header & Polygon Selector */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-serif-math">
              Dihedral Group Visualizer & Calculator (Dₙ)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Uses identity <span className="font-mono-math font-bold">1</span>, rotation{' '}
              <span className="font-mono-math font-bold">ρ</span>, reflection{' '}
              <span className="font-mono-math font-bold">μ</span>, and canonical relations{' '}
              <span className="font-mono-math">ρⁿ = 1</span>,{' '}
              <span className="font-mono-math">μ² = 1</span>,{' '}
              <span className="font-mono-math">ρᵏμ = μρⁿ⁻ᵏ</span>.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[3, 4, 5, 6, 7, 8].map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => {
                  setN(deg);
                  setSelectedK((k) => k % deg);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono-math border ${
                  n === deg
                    ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                D_{deg} ({2 * deg})
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
          <label className="flex items-center gap-2">
            <span className="font-semibold">Assign n (3..24):</span>
            <input
              type="number"
              min={3}
              max={24}
              value={n}
              onChange={(e) => {
                const raw = Math.trunc(Number(e.target.value));
                if (Number.isNaN(raw)) return;
                const val = Math.max(3, Math.min(24, raw));
                setN(val);
                setSelectedK((k) => k % val);
              }}
              className="w-16 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math font-bold text-slate-900 dark:text-white"
            />
          </label>
          <input
            type="range"
            min={3}
            max={16}
            value={Math.min(16, n)}
            onChange={(e) => {
              const val = Number(e.target.value);
              setN(val);
              setSelectedK((k) => k % val);
            }}
            className="w-36 accent-teal-600"
          />
          <div>
            Center Z(D_{n}) ={' '}
            <span className="font-mono-math font-semibold">
              {'{'}{centerEls.map((el) => formatDihedral(el, '1')).join(', ')}{'}'}
            </span>
          </div>
          <div className="text-teal-700 dark:text-teal-400 font-semibold">
            {consistency.passed
              ? `Verified all ${consistency.checkedPairs} products against vertex permutations`
              : consistency.failureMessage}
          </div>
        </div>
      </section>

      {/* Two-zone interactive visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 flex flex-col items-center justify-center space-y-4">
          <DihedralSvgDiagram element={currentEl} size={300} identitySymbol="1" />
          <div className="w-full p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
            <div className="text-sm font-bold font-mono-math text-[#0B1F3A] dark:text-white">
              Element: {formatDihedral(currentEl, '1')}
            </div>
            <div>{dihedralDescription(currentEl)}</div>
            <div className="font-mono-math">
              Order: <span className="font-bold">{dihedralOrder(currentEl)}</span> · Inverse:{' '}
              <span className="font-bold">{formatDihedral(dihedralInverse(currentEl), '1')}</span>
            </div>
            <div className="font-mono-math text-slate-600 dark:text-slate-300">
              Vertex map: [{Array.from({ length: n }, (_, i) => i).join(' ')}] ↦ [
              {vertexPerm.join(' ')}]
            </div>
          </div>
        </section>

        <section className="lg:col-span-7 space-y-6">
          {/* Standard Form Element Selector */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
            <h3 className="font-bold text-base">
              Standard Elements of D_{n} (Order {2 * n})
            </h3>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500">Rotations (ρᵏ)</div>
              <div className="flex flex-wrap gap-2">
                {allElements.slice(0, n).map((el) => {
                  const active = selectedRef === 0 && selectedK % n === el.k;
                  return (
                    <button
                      key={`r-${el.k}`}
                      type="button"
                      onClick={() => {
                        setSelectedRef(0);
                        setSelectedK(el.k);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono-math font-semibold border ${
                        active
                          ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                          : 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
                      }`}
                    >
                      {formatDihedral(el, '1')} <span className="opacity-70">(o:{dihedralOrder(el)})</span>
                    </button>
                  );
                })}
              </div>

              <div className="text-xs font-semibold text-slate-500 pt-2">Reflections (μρᵏ)</div>
              <div className="flex flex-wrap gap-2">
                {allElements.slice(n).map((el) => {
                  const active = selectedRef === 1 && selectedK % n === el.k;
                  return (
                    <button
                      key={`m-${el.k}`}
                      type="button"
                      onClick={() => {
                        setSelectedRef(1);
                        setSelectedK(el.k);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono-math font-semibold border ${
                        active
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
                      }`}
                    >
                      {formatDihedral(el, '1')} <span className="opacity-70">(o:2)</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step-by-Step Algebraic Product Simplifier */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-4">
            <h3 className="font-bold text-base">
              Dihedral Product Simplifier (1, ρ, μ)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Left Element (e.g. μρ², rho^2, 1)
                </label>
                <input
                  type="text"
                  value={leftExpr}
                  onChange={(e) => setLeftExpr(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Right Element (e.g. μρ, rho^3*mu)
                </label>
                <input
                  type="text"
                  value={rightExpr}
                  onChange={(e) => setRightExpr(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs">
              {['1', 'ρ', 'ρ²', 'μ', 'μρ', 'μρ²'].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() =>
                    setLeftExpr((prev) => {
                      const trimmed = prev.trim();
                      if (!trimmed || trimmed === '1') return sym;
                      return /[0-9⁰¹²³⁴⁵⁶⁷⁸⁹]$/.test(trimmed) && /^[0-9]/.test(sym)
                        ? `${trimmed}*${sym}`
                        : `${trimmed}${sym}`;
                    })
                  }
                  className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-mono-math hover:border-teal-500"
                >
                  +{sym} (left)
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setLeftExpr('μρ²');
                  setRightExpr('μρ');
                }}
                className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-teal-700 dark:text-teal-400 font-semibold"
              >
                Standard Example: (μρ²)(μρ)
              </button>
            </div>

            {productData.error ? (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
                {productData.error}
              </div>
            ) : (
              productData.result &&
              productData.rev && (
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold font-mono-math">
                      ({formatDihedral(productData.left!, '1')})({formatDihedral(productData.right!, '1')}) ={' '}
                      <span className="text-teal-700 dark:text-teal-400">
                        {formatDihedral(productData.result, '1')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 font-sans">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRef(0);
                          setSelectedK(0);
                        }}
                        className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] font-semibold hover:border-teal-500"
                      >
                        Step 0: Start (1)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRef(productData.right!.ref);
                          setSelectedK(productData.right!.k);
                        }}
                        className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] font-semibold hover:border-teal-500"
                      >
                        Step 1: Apply {formatDihedral(productData.right!, '1')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRef(productData.result!.ref);
                          setSelectedK(productData.result!.k);
                        }}
                        className="px-2 py-1 rounded bg-[#0B1F3A] dark:bg-teal-600 text-white text-[11px] font-semibold"
                      >
                        Step 2: Apply {formatDihedral(productData.left!, '1')} →{' '}
                        {formatDihedral(productData.result, '1')}
                      </button>
                    </div>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                    {productData.steps.map((s, idx) => (
                      <li key={idx}>
                        <span>{s.step}: </span>
                        <span className="font-mono-math font-semibold">{s.expression}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="pt-1 font-mono-math text-slate-500">
                    Reverse order ({formatDihedral(productData.right!, '1')})(
                    {formatDihedral(productData.left!, '1')}) = {formatDihedral(productData.rev, '1')}{' '}
                    {formatDihedral(productData.rev, '1') !== formatDihedral(productData.result, '1')
                      ? '(non-commuting pair!)'
                      : '(happens to commute)'}
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
