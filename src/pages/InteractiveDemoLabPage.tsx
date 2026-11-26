import {
  CheckCircle2,
  Compass,
  GitBranch,
  Layers,
  Play,
  RotateCcw,
  Shapes,
  Sparkles,
  StepForward,
  XCircle,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { DihedralSvgDiagram } from '../components/DihedralSvgDiagram.tsx';
import { buildCayleyTable } from '../math/cayley.ts';
import {
  createDihedralElement,
  dihedralDescription,
  dihedralInverse,
  dihedralOrder,
  formatDihedral,
  generateDn,
  multiplyDihedral,
  parseDihedralExpression,
} from '../math/dihedral.ts';
import {
  coprimesBelow,
  cyclicSubgroupZn,
  eulerPhi,
  gcd,
  inverseInZn,
  mod,
  orderInZn,
  toSubscript,
} from '../math/numberTheory.ts';
import {
  composePermWithTrace,
  computePermutationInversions,
  formatCycleNotation,
  formatTranspositions,
  formatTwoRowLines,
  invertPerm,
  parseCycleString,
  parseTwoRowArrays,
  permOrder,
  permParity,
} from '../math/permutations.ts';

type DemoId = 'demoA' | 'demoB' | 'demoC' | 'demoD' | 'demoE';

export const InteractiveDemoLabPage: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<DemoId>('demoA');

  // Demo A: Cyclic Group Explorer (Z_n)
  const [cyclicN, setCyclicN] = useState<number>(7);
  const [cyclicA, setCyclicA] = useState<number>(2);
  const [cyclicStepCount, setCyclicStepCount] = useState<number>(3);

  // Demo B: Generators & Euler's Totient Visualizer
  const [totientN, setTotientN] = useState<number>(12);
  const [totientHoverA, setTotientHoverA] = useState<number>(5);

  // Demo C: Permutation Composition
  const [permN, setPermN] = useState<number>(4);
  const [permMode, setPermMode] = useState<'cycle' | 'tworow'>('cycle');
  const [sigmaStr, setSigmaStr] = useState<string>('(1 2 3)');
  const [tauStr, setTauStr] = useState<string>('(2 4)');
  const [sigmaRowStr, setSigmaRowStr] = useState<string>('2 3 1 4');
  const [tauRowStr, setTauRowStr] = useState<string>('1 4 3 2');
  const [traceX, setTraceX] = useState<number>(1);

  // Demo D: Permutation Parity & Inversions
  const [parityN, setParityN] = useState<number>(5);
  const [parityBottom, setParityBottom] = useState<number[]>([3, 1, 5, 2, 4]);
  const [selectedInversionIdx, setSelectedInversionIdx] = useState<number | null>(null);

  // Demo E: Dihedral Group Explorer (D_n)
  const [dihN, setDihN] = useState<number>(4);
  const [dihIdSym, setDihIdSym] = useState<'1' | 't'>('1');
  const [dihRef, setDihRef] = useState<0 | 1>(0);
  const [dihK, setDihK] = useState<number>(1);
  const [dihLeftExpr, setDihLeftExpr] = useState<string>('μρ');
  const [dihRightExpr, setDihRightExpr] = useState<string>('ρ²');

  // --- Computations for Demo A ---
  const safeCyclicN = Math.max(1, Math.min(24, Math.trunc(cyclicN) || 1));
  const safeCyclicA = mod(Math.trunc(cyclicA) || 0, safeCyclicN);
  const cyclicOrderA = orderInZn(safeCyclicA, safeCyclicN);
  const cyclicSubgroup = useMemo(
    () => cyclicSubgroupZn(safeCyclicA, safeCyclicN),
    [safeCyclicA, safeCyclicN]
  );
  const effectiveSteps = Math.max(1, Math.min(cyclicOrderA, cyclicStepCount));
  const cyclicTrail = useMemo(() => {
    const items: { step: number; prev: number; next: number; expr: string }[] = [];
    let cur = 0;
    for (let k = 1; k <= effectiveSteps; k++) {
      const next = mod(cur + safeCyclicA, safeCyclicN);
      items.push({
        step: k,
        prev: cur,
        next,
        expr:
          k === 1
            ? `${safeCyclicA} mod ${safeCyclicN} = ${next}`
            : `${cur} ⊕ ${safeCyclicA} = (${cur} + ${safeCyclicA}) mod ${safeCyclicN} = ${next}`,
      });
      cur = next;
    }
    return items;
  }, [effectiveSteps, safeCyclicA, safeCyclicN]);

  // --- Computations for Demo B ---
  const safeTotientN = Math.max(1, Math.min(24, Math.trunc(totientN) || 1));
  const safeTotientA = mod(Math.trunc(totientHoverA) || 0, safeTotientN);
  const totientData = useMemo(() => {
    const generators = coprimesBelow(safeTotientN);
    const phi = eulerPhi(safeTotientN);
    const elements = Array.from({ length: safeTotientN }, (_, a) => {
      const g = a === 0 ? safeTotientN : gcd(a, safeTotientN);
      const ord = orderInZn(a, safeTotientN);
      const isGen = safeTotientN === 1 ? true : g === 1;
      return { a, gcdVal: g, ord, isGen };
    });
    const selectedSubgroup = cyclicSubgroupZn(safeTotientA, safeTotientN);
    return { generators, phi, elements, selectedSubgroup };
  }, [safeTotientN, safeTotientA]);

  // --- Computations for Demo C ---
  const permComposition = useMemo(() => {
    try {
      const sigma =
        permMode === 'cycle'
          ? parseCycleString(sigmaStr, permN)
          : parseTwoRowArrays(sigmaRowStr.trim().split(/[\s,]+/).map(Number), permN);
      const tau =
        permMode === 'cycle'
          ? parseCycleString(tauStr, permN)
          : parseTwoRowArrays(tauRowStr.trim().split(/[\s,]+/).map(Number), permN);
      const st = composePermWithTrace(sigma, tau);
      const ts = composePermWithTrace(tau, sigma);
      return { error: '', sigma, tau, st, ts };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Invalid permutation.',
        sigma: null,
        tau: null,
        st: null,
        ts: null,
      };
    }
  }, [permMode, sigmaStr, tauStr, sigmaRowStr, tauRowStr, permN]);

  // --- Computations for Demo D ---
  const parityData = useMemo(() => {
    const p = { n: parityN, mapping: parityBottom };
    const inv = computePermutationInversions(p);
    return {
      perm: p,
      ...inv,
      cycles: formatCycleNotation(p, true),
      transpositions: formatTranspositions(p),
      order: permOrder(p),
    };
  }, [parityN, parityBottom]);

  // --- Computations for Demo E ---
  const dihElements = useMemo(() => generateDn(dihN), [dihN]);
  const dihCurrent = createDihedralElement(dihN, dihRef, dihK % dihN);
  const dihCayley = useMemo(
    () => buildCayleyTable({ type: 'dihedral', n: dihN, identitySymbol: dihIdSym }),
    [dihN, dihIdSym]
  );
  const dihCompose = useMemo(() => {
    try {
      const left = parseDihedralExpression(dihLeftExpr, dihN, dihIdSym);
      const right = parseDihedralExpression(dihRightExpr, dihN, dihIdSym);
      const { result, steps } = multiplyDihedral(left, right, dihIdSym);
      return { error: '', left, right, result, steps };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Invalid dihedral expression.',
        left: null,
        right: null,
        result: null,
        steps: [],
      };
    }
  }, [dihLeftExpr, dihRightExpr, dihN, dihIdSym]);

  const demoTabs: { id: DemoId; label: string; sub: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'demoA', label: 'A. Cyclic Explorer', sub: 'ℤₙ Sequences', icon: Compass },
    { id: 'demoB', label: 'B. Generators & φ(n)', sub: 'Circle & Orders', icon: Sparkles },
    { id: 'demoC', label: 'C. Permutations', sub: 'Right-to-Left Sₙ', icon: GitBranch },
    { id: 'demoD', label: 'D. Parity & Inversions', sub: 'Crossing Strands', icon: Layers },
    { id: 'demoE', label: 'E. Dihedral Dₙ', sub: 'Symmetry & Table', icon: Shapes },
  ];

  const resetCurrentDemo = () => {
    if (activeDemo === 'demoA') {
      setCyclicN(7);
      setCyclicA(2);
      setCyclicStepCount(1);
    } else if (activeDemo === 'demoB') {
      setTotientN(12);
      setTotientHoverA(5);
    } else if (activeDemo === 'demoC') {
      setPermN(4);
      setPermMode('cycle');
      setSigmaStr('(1 2 3)');
      setTauStr('(2 4)');
      setSigmaRowStr('2 3 1 4');
      setTauRowStr('1 4 3 2');
      setTraceX(1);
    } else if (activeDemo === 'demoD') {
      setParityN(5);
      setParityBottom([3, 1, 5, 2, 4]);
      setSelectedInversionIdx(null);
    } else {
      setDihN(4);
      setDihIdSym('1');
      setDihRef(0);
      setDihK(1);
      setDihLeftExpr('μρ');
      setDihRightExpr('ρ²');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Demo Switcher */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-serif-math">
              Interactive Mathematical Demonstration Lab
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Manipulate arbitrary group parameters live, trace step-by-step operations visually, and inspect underlying theorems without page reloads.
            </p>
          </div>
          <button
            type="button"
            onClick={resetCurrentDemo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:border-teal-500 whitespace-nowrap self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Active Demo
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {demoTabs.map((t) => {
            const Icon = t.icon;
            const active = activeDemo === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveDemo(t.id)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  active
                    ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                    : 'border-slate-200 dark:border-slate-700 hover:border-teal-500 bg-slate-50/70 dark:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold whitespace-nowrap">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t.label}</span>
                </div>
                <div
                  className={`text-[11px] mt-0.5 ${
                    active ? 'text-teal-200 dark:text-teal-50' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {t.sub}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==================== DEMO A: CYCLIC GROUP EXPLORER ==================== */}
      {activeDemo === 'demoA' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Visual Stage */}
          <section className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 flex flex-col items-center justify-between space-y-4">
            <div className="w-full flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-[#0B1F3A] dark:text-white">
                Modular Subgroup Orbit in ℤ{toSubscript(safeCyclicN)}
              </span>
              <span className="font-mono-math">
                0 → {cyclicTrail.map((t) => t.next).join(' → ')}
              </span>
            </div>

            {(() => {
              const size = 300;
              const cx = size / 2;
              const cy = size / 2;
              const r = 108;
              const visitedNodes = new Set([0, ...cyclicTrail.map((t) => t.next)]);
              const currentTip = cyclicTrail[cyclicTrail.length - 1]?.next ?? 0;

              const coords = (k: number) => {
                const angle = -Math.PI / 2 + (2 * Math.PI * k) / safeCyclicN;
                return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
              };

              return (
                <svg
                  width={size}
                  height={size}
                  viewBox={`0 0 ${size} ${size}`}
                  className="max-w-full h-auto select-none"
                  role="img"
                  aria-label={`Modular clock showing cyclic orbit of ${safeCyclicA} in Z_${safeCyclicN}`}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity={0.15}
                    strokeDasharray="4 4"
                  />
                  {/* Step chords */}
                  {cyclicTrail.map((step, i) => {
                    const p1 = coords(step.prev);
                    const p2 = coords(step.next);
                    const isLast = i === cyclicTrail.length - 1;
                    return (
                      <line
                        key={step.step}
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={isLast ? '#0d9488' : '#0284c7'}
                        strokeWidth={isLast ? 3 : 1.75}
                        strokeOpacity={isLast ? 1 : 0.65}
                      />
                    );
                  })}
                  {/* Nodes */}
                  {Array.from({ length: safeCyclicN }, (_, k) => {
                    const { x, y } = coords(k);
                    const isVisited = visitedNodes.has(k);
                    const isCurrent = k === currentTip;
                    const isZero = k === 0;
                    return (
                      <g
                        key={k}
                        onClick={() => {
                          setCyclicA(k);
                          setCyclicStepCount(orderInZn(k, safeCyclicN));
                        }}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r={isCurrent ? 15 : 12}
                          fill={
                            isCurrent
                              ? '#0d9488'
                              : isZero
                              ? '#0b1f3a'
                              : isVisited
                              ? '#0284c7'
                              : '#e2e8f0'
                          }
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                        <text
                          x={x}
                          y={y + 4}
                          textAnchor="middle"
                          fill={isVisited || isCurrent || isZero ? '#ffffff' : '#334155'}
                          className="text-[11px] font-bold font-mono-math"
                        >
                          {k}
                        </text>
                      </g>
                    );
                  })}
                  <text
                    x={cx}
                    y={cy - 4}
                    textAnchor="middle"
                    className="fill-slate-800 dark:fill-slate-100 text-sm font-bold font-mono-math"
                  >
                    ⟨{safeCyclicA}⟩ ⊆ ℤ{toSubscript(safeCyclicN)}
                  </text>
                  <text
                    x={cx}
                    y={cy + 14}
                    textAnchor="middle"
                    className="fill-teal-700 dark:fill-teal-400 text-xs font-mono-math font-semibold"
                  >
                    ord({safeCyclicA}) = {cyclicOrderA}
                  </text>
                </svg>
              );
            })()}

            <div className="w-full p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-[#0B1F3A] dark:text-white">
                Learning Takeaway
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Starting from 0 and repeatedly adding <span className="font-mono-math font-bold">{safeCyclicA}</span> modulo{' '}
                <span className="font-mono-math font-bold">{safeCyclicN}</span> hits 0 for the first time at step{' '}
                <span className="font-mono-math font-bold">{cyclicOrderA}</span>, confirming{' '}
                <span className="font-mono-math">ord({safeCyclicA}) = {safeCyclicN} / gcd({safeCyclicN}, {safeCyclicA}) = {cyclicOrderA}</span>.
              </p>
            </div>
          </section>

          {/* Controls & Step-by-Step Deck */}
          <section className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
            <h3 className="font-bold text-base">
              Control Parameters & Repeated Addition Trace
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="space-y-1.5">
                <span className="font-semibold block">Modulus n (1..24): {safeCyclicN}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={cyclicN}
                    onChange={(e) => {
                      const nextN = Math.max(1, Math.min(24, Math.trunc(Number(e.target.value)) || 1));
                      setCyclicN(nextN);
                      setCyclicA((prev) => mod(prev, nextN));
                      setCyclicStepCount(1);
                    }}
                    className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math font-bold"
                  />
                  <input
                    type="range"
                    min={1}
                    max={24}
                    value={safeCyclicN}
                    onChange={(e) => {
                      const nextN = Number(e.target.value);
                      setCyclicN(nextN);
                      setCyclicA((prev) => mod(prev, nextN));
                      setCyclicStepCount(1);
                    }}
                    className="flex-1 accent-teal-600"
                  />
                </div>
              </label>

              <label className="space-y-1.5">
                <span className="font-semibold block">
                  Element a ∈ {'{'}0..{safeCyclicN - 1}{'}'}: {safeCyclicA}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={Math.max(0, safeCyclicN - 1)}
                    value={safeCyclicA}
                    onChange={(e) => {
                      setCyclicA(mod(Math.trunc(Number(e.target.value)) || 0, safeCyclicN));
                      setCyclicStepCount(1);
                    }}
                    className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math font-bold"
                  />
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, safeCyclicN - 1)}
                    value={safeCyclicA}
                    onChange={(e) => {
                      setCyclicA(Number(e.target.value));
                      setCyclicStepCount(1);
                    }}
                    className="flex-1 accent-teal-600"
                  />
                </div>
              </label>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCyclicStepCount((s) => Math.min(cyclicOrderA, s + 1))}
                disabled={effectiveSteps >= cyclicOrderA}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white font-semibold disabled:opacity-40"
              >
                <StepForward className="w-3.5 h-3.5" /> Add {safeCyclicA} Again
              </button>
              <button
                type="button"
                onClick={() => setCyclicStepCount(cyclicOrderA)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1F3A] text-white font-semibold"
              >
                <Play className="w-3.5 h-3.5" /> Run Until Identity 0
              </button>
              <button
                type="button"
                onClick={() => setCyclicStepCount(1)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold"
              >
                Restart Trail
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono-math tabular-nums">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="font-sans text-slate-500">Order ord({safeCyclicA})</div>
                <div className="text-base font-bold mt-0.5">{cyclicOrderA}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="font-sans text-slate-500">Inverse (−{safeCyclicA})</div>
                <div className="text-base font-bold mt-0.5">{inverseInZn(safeCyclicA, safeCyclicN)}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="font-sans text-slate-500">Generates ℤ{toSubscript(safeCyclicN)}?</div>
                <div className="text-sm font-bold mt-1 text-teal-700 dark:text-teal-400">
                  {cyclicOrderA === safeCyclicN ? 'Yes (Generator)' : 'Proper Subgroup'}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs font-mono-math">
              {cyclicTrail.map((item) => (
                <div
                  key={item.step}
                  className={`px-3 py-2 rounded-lg border flex items-center justify-between ${
                    item.next === 0
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-800 font-bold text-teal-800 dark:text-teal-300'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span>
                    Step {item.step}: {item.expr}
                  </span>
                  {item.next === 0 && <span>Identity reached</span>}
                </div>
              ))}
            </div>

            <div className="text-xs font-mono-math text-slate-600 dark:text-slate-300">
              Subgroup ⟨{safeCyclicA}⟩ = {'{'}
              {cyclicSubgroup.join(', ')}
              {'}'} (|⟨{safeCyclicA}⟩| = {cyclicOrderA})
            </div>
          </section>
        </div>
      )}

      {/* ==================== DEMO B: GENERATORS & EULER TOTIENT ==================== */}
      {activeDemo === 'demoB' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-base">
                Circular Generator Map & Number Line for ℤ{toSubscript(safeTotientN)}
              </h3>
              <span className="text-xs font-mono-math text-teal-700 dark:text-teal-400 font-semibold">
                φ({safeTotientN}) = {totientData.phi} generator{totientData.phi === 1 ? '' : 's'}
              </span>
            </div>

            {/* Circular Representation */}
            <div className="flex justify-center">
              {(() => {
                const size = 280;
                const cx = size / 2;
                const cy = size / 2;
                const r = 100;
                const coords = (k: number) => {
                  const angle = -Math.PI / 2 + (2 * Math.PI * k) / safeTotientN;
                  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
                };
                const orbit = totientData.selectedSubgroup;
                return (
                  <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="max-w-full h-auto select-none"
                    role="img"
                    aria-label={`Generator wheel for Z_${safeTotientN}`}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity={0.15}
                    />
                    {/* Chords for selected element's subgroup */}
                    {orbit.length > 1 &&
                      orbit.map((val, idx) => {
                        const nextVal = orbit[(idx + 1) % orbit.length];
                        const p1 = coords(val);
                        const p2 = coords(nextVal);
                        return (
                          <line
                            key={`${val}-${nextVal}`}
                            x1={p1.x}
                            y1={p1.y}
                            x2={p2.x}
                            y2={p2.y}
                            stroke="#0d9488"
                            strokeWidth={1.6}
                            strokeOpacity={0.55}
                          />
                        );
                      })}
                    {totientData.elements.map((el) => {
                      const { x, y } = coords(el.a);
                      const isSel = el.a === safeTotientA;
                      return (
                        <g
                          key={el.a}
                          onClick={() => setTotientHoverA(el.a)}
                          className="cursor-pointer"
                        >
                          <circle
                            cx={x}
                            cy={y}
                            r={isSel ? 15 : 12}
                            fill={el.isGen ? '#0d9488' : '#334155'}
                            stroke={isSel ? '#f59e0b' : '#ffffff'}
                            strokeWidth={isSel ? 3 : 1.5}
                          />
                          <text
                            x={x}
                            y={y + 4}
                            textAnchor="middle"
                            fill="#ffffff"
                            className="text-[11px] font-bold font-mono-math"
                          >
                            {el.a}
                          </text>
                        </g>
                      );
                    })}
                    <text
                      x={cx}
                      y={cy - 4}
                      textAnchor="middle"
                      className="fill-slate-800 dark:fill-slate-100 text-xs font-bold font-mono-math"
                    >
                      a = {safeTotientA}
                    </text>
                    <text
                      x={cx}
                      y={cy + 13}
                      textAnchor="middle"
                      className="fill-teal-700 dark:fill-teal-400 text-[11px] font-mono-math font-semibold"
                    >
                      gcd({safeTotientA}, {safeTotientN}) = {safeTotientA === 0 ? safeTotientN : gcd(safeTotientA, safeTotientN)}
                    </text>
                  </svg>
                );
              })()}
            </div>

            {/* Number-Line Representation */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-500">
                Modular Number Line (Click any element to inspect its generated subgroup)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {totientData.elements.map((el) => {
                  const isSel = el.a === safeTotientA;
                  return (
                    <button
                      key={el.a}
                      type="button"
                      onClick={() => setTotientHoverA(el.a)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono-math transition-colors ${
                        isSel
                          ? 'ring-2 ring-amber-500 border-amber-500 font-bold'
                          : 'border-slate-200 dark:border-slate-700'
                      } ${
                        el.isGen
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>{el.a}</div>
                      <div className="text-[10px] opacity-85">o:{el.ord}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2 font-semibold">
                <span>Modulus n (1..24):</span>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={totientN}
                  onChange={(e) => {
                    const next = Math.max(1, Math.min(24, Math.trunc(Number(e.target.value)) || 1));
                    setTotientN(next);
                    setTotientHoverA((prev) => mod(prev, next));
                  }}
                  className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math font-bold"
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[1, 5, 7, 8, 10, 12, 15].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setTotientN(q);
                      setTotientHoverA(q === 1 ? 0 : 1);
                    }}
                    className={`px-2.5 py-1 rounded border font-mono-math ${
                      safeTotientN === q
                        ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    ℤ_{q}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 space-y-1">
                <div className="font-semibold text-teal-800 dark:text-teal-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Generators ({totientData.generators.length} = φ({safeTotientN}))
                </div>
                <div className="font-mono-math font-bold text-sm">
                  {'{'}{totientData.generators.join(', ')}{'}'}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-slate-400" /> Non-Generators ({safeTotientN - totientData.generators.length})
                </div>
                <div className="font-mono-math text-sm">
                  {'{'}{totientData.elements.filter((e) => !e.isGen).map((e) => e.a).join(', ') || '∅'}{'}'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div className="font-bold text-sm font-mono-math">
                Inspecting a = {safeTotientA} in ℤ{toSubscript(safeTotientN)}
              </div>
              <div className="font-mono-math">
                gcd({safeTotientA}, {safeTotientN}) ={' '}
                <span className="font-bold">
                  {safeTotientA === 0 ? safeTotientN : gcd(safeTotientA, safeTotientN)}
                </span>{' '}
                · ord({safeTotientA}) ={' '}
                <span className="font-bold">{orderInZn(safeTotientA, safeTotientN)}</span>
              </div>
              <div className="font-mono-math text-slate-600 dark:text-slate-300">
                ⟨{safeTotientA}⟩ = {'{'}{totientData.selectedSubgroup.join(', ')}{'}'}
              </div>
              <p className="text-slate-600 dark:text-slate-300 pt-1">
                {safeTotientN === 1
                  ? 'For the trivial group ℤ₁ = {0}, element 0 trivially generates all of ℤ₁, and φ(1) = 1.'
                  : orderInZn(safeTotientA, safeTotientN) === safeTotientN
                  ? `Because gcd(${safeTotientA}, ${safeTotientN}) = 1, the subgroup ⟨${safeTotientA}⟩ visits every residue 0..${safeTotientN - 1}, so ${safeTotientA} generates ℤ${toSubscript(safeTotientN)}.`
                  : `Because gcd(${safeTotientA}, ${safeTotientN}) = ${gcd(safeTotientA, safeTotientN)} > 1, multiples of ${safeTotientA} only hit multiples of ${gcd(safeTotientA, safeTotientN)}, leaving a proper subgroup of size ${orderInZn(safeTotientA, safeTotientN)}.`}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-[#0B1F3A] dark:text-white">Learning Takeaway</div>
              <p className="text-slate-600 dark:text-slate-300">
                An element <span className="font-mono-math">a ∈ ℤₙ</span> generates <span className="font-mono-math">ℤₙ</span> iff{' '}
                <span className="font-mono-math font-bold">gcd(a, n) = 1</span>, because only coprime steps divide <span className="font-mono-math">n</span> down to order{' '}
                <span className="font-mono-math">n / 1 = n</span>. Counting coprime elements directly defines Euler&apos;s totient{' '}
                <span className="font-mono-math font-bold">φ(n)</span>.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* ==================== DEMO C: PERMUTATION COMPOSITION ==================== */}
      {activeDemo === 'demoC' && (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base">
                  Permutation Composer in S{toSubscript(permN)} (Right-to-Left Textbook Convention)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  In <span className="font-mono-math font-semibold">(στ)(x) = σ(τ(x))</span>, the{' '}
                  <span className="font-semibold">right permutation τ acts FIRST</span>, and the{' '}
                  <span className="font-semibold">left permutation σ acts SECOND</span>.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <label className="flex items-center gap-1.5 font-semibold">
                  <span>Degree n (2..8):</span>
                  <input
                    type="number"
                    min={2}
                    max={8}
                    value={permN}
                    onChange={(e) => {
                      const nxt = Math.max(2, Math.min(8, Math.trunc(Number(e.target.value)) || 2));
                      setPermN(nxt);
                      setTraceX(1);
                      setSigmaStr('(1 2)');
                      setTauStr(nxt >= 3 ? '(1 3)' : 'ι');
                      setSigmaRowStr(Array.from({ length: nxt }, (_, i) => (i === 0 ? 2 : i === 1 ? 1 : i + 1)).join(' '));
                      setTauRowStr(
                        Array.from({ length: nxt }, (_, i) =>
                          nxt >= 3 ? (i === 0 ? 3 : i === 2 ? 1 : i + 1) : i + 1
                        ).join(' ')
                      );
                    }}
                    className="w-16 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math font-bold"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setPermMode('cycle')}
                  className={`px-3 py-1 rounded border font-semibold ${
                    permMode === 'cycle'
                      ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Cycle Notation
                </button>
                <button
                  type="button"
                  onClick={() => setPermMode('tworow')}
                  className={`px-3 py-1 rounded border font-semibold ${
                    permMode === 'tworow'
                      ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Two-Line Notation
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {permMode === 'cycle' ? (
                <>
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">
                      Left Factor σ (applied SECOND)
                    </label>
                    <input
                      type="text"
                      value={sigmaStr}
                      onChange={(e) => setSigmaStr(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">
                      Right Factor τ (applied FIRST)
                    </label>
                    <input
                      type="text"
                      value={tauStr}
                      onChange={(e) => setTauStr(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math text-sm"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">
                      Bottom row of σ for [1..{permN}]
                    </label>
                    <input
                      type="text"
                      value={sigmaRowStr}
                      onChange={(e) => setSigmaRowStr(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">
                      Bottom row of τ for [1..{permN}]
                    </label>
                    <input
                      type="text"
                      value={tauRowStr}
                      onChange={(e) => setTauRowStr(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math text-sm"
                    />
                  </div>
                </>
              )}
            </div>

            {permComposition.error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                {permComposition.error}
              </div>
            )}
          </section>

          {permComposition.sigma && permComposition.tau && permComposition.st && permComposition.ts && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <section className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
                <h4 className="font-bold text-sm">
                  Resulting Product στ vs Reverse τσ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono-math">
                  {[
                    { title: 'σ (Applied Second)', p: permComposition.sigma },
                    { title: 'τ (Applied First)', p: permComposition.tau },
                    { title: 'Product στ', p: permComposition.st.result },
                    { title: 'Reverse τσ', p: permComposition.ts.result },
                  ].map((item) => {
                    const two = formatTwoRowLines(item.p);
                    return (
                      <div
                        key={item.title}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5"
                      >
                        <div className="font-sans font-bold text-slate-700 dark:text-slate-200">
                          {item.title}
                        </div>
                        <div className="text-teal-700 dark:text-teal-400 font-bold">
                          {formatCycleNotation(item.p, true)}
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-1.5 rounded border border-slate-200 dark:border-slate-800 inline-block text-[11px]">
                          <div>[ {two.top} ]</div>
                          <div>[ {two.bottom} ]</div>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          ord = {permOrder(item.p)} · {permParity(item.p)} · inv = {formatCycleNotation(invertPerm(item.p), true)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
                <h4 className="font-bold text-sm">
                  Step-by-Step Composition Trace (στ)(x) = σ(τ(x))
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-math">
                  {permComposition.st.steps.map((st) => (
                    <button
                      key={st.element}
                      type="button"
                      onClick={() => setTraceX(st.element)}
                      className={`p-2.5 rounded-lg border text-center transition-colors ${
                        traceX === st.element
                          ? 'bg-teal-600 text-white border-teal-600 font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
                      }`}
                    >
                      {st.element} → {st.afterRight} → {st.afterLeft}
                    </button>
                  ))}
                </div>
                {(() => {
                  const chosen =
                    permComposition.st.steps.find((s) => s.element === traceX) ??
                    permComposition.st.steps[0];
                  return (
                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-mono-math space-y-1">
                      <div>1. Start with x = {chosen.element}</div>
                      <div>2. Apply right permutation first: τ({chosen.element}) = {chosen.afterRight}</div>
                      <div>3. Apply left permutation second: σ({chosen.afterRight}) = {chosen.afterLeft}</div>
                      <div className="font-bold text-teal-700 dark:text-teal-400">
                        ⇒ (στ)({chosen.element}) = {chosen.afterLeft}
                      </div>
                    </div>
                  );
                })()}
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-semibold text-[#0B1F3A] dark:text-white">Learning Takeaway</div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Because permutations act as functions from right to left, <span className="font-mono-math">στ</span> generally differs from{' '}
                    <span className="font-mono-math">τσ</span> for <span className="font-mono-math">n ≥ 3</span>, making <span className="font-mono-math">Sₙ</span> nonabelian. Notice also that{' '}
                    <span className="font-mono-math">ι</span> acts as the two-sided identity permutation.
                  </p>
                </div>
              </section>
            </div>
          )}
        </div>
      )}

      {/* ==================== DEMO D: PERMUTATION PARITY & INVERSIONS ==================== */}
      {activeDemo === 'demoD' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SVG Crossing Strand Diagram */}
          <section className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-base">
                Crossing-Strand Inversion Diagram for S{toSubscript(parityN)}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold ${
                  parityData.parity === 'even'
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                }`}
              >
                {parityData.parity === 'even' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {parityData.parity === 'even' ? 'Even Permutation (+1)' : 'Odd Permutation (−1)'}
              </span>
            </div>

            {(() => {
              const w = 420;
              const h = 230;
              const padX = 44;
              const topY = 46;
              const botY = 184;
              const stepX = parityN > 1 ? (w - 2 * padX) / (parityN - 1) : 0;
              const xForVal = (v: number) => padX + (v - 1) * stepX;

              const activeInv =
                selectedInversionIdx !== null ? parityData.inversions[selectedInversionIdx] : null;

              return (
                <svg
                  viewBox={`0 0 ${w} ${h}`}
                  className="w-full h-auto max-w-md mx-auto select-none"
                  role="img"
                  aria-label="Bipartite crossing strand diagram illustrating permutation inversions"
                >
                  <text x={14} y={topY + 4} className="fill-slate-400 text-[11px] font-mono-math">
                    i
                  </text>
                  <text x={10} y={botY + 4} className="fill-slate-400 text-[11px] font-mono-math">
                    σ(i)
                  </text>
                  {/* Strands connecting top i to bottom sigma(i) */}
                  {parityBottom.map((val, idx) => {
                    const i = idx + 1;
                    const x1 = xForVal(i);
                    const x2 = xForVal(val);
                    const isHighlighted = activeInv && (activeInv.i === i || activeInv.j === i);
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={topY}
                        x2={x2}
                        y2={botY}
                        stroke={isHighlighted ? '#dc2626' : '#0d9488'}
                        strokeWidth={isHighlighted ? 3.5 : 2}
                        strokeOpacity={activeInv && !isHighlighted ? 0.25 : 0.85}
                      />
                    );
                  })}
                  {/* Nodes */}
                  {Array.from({ length: parityN }, (_, idx) => {
                    const k = idx + 1;
                    const x = xForVal(k);
                    return (
                      <g key={k}>
                        <circle cx={x} cy={topY} r={14} fill="#0b1f3a" stroke="#ffffff" strokeWidth={2} />
                        <text
                          x={x}
                          y={topY + 4}
                          textAnchor="middle"
                          fill="#ffffff"
                          className="text-xs font-bold font-mono-math"
                        >
                          {k}
                        </text>
                        <circle cx={x} cy={botY} r={14} fill="#0f766e" stroke="#ffffff" strokeWidth={2} />
                        <text
                          x={x}
                          y={botY + 4}
                          textAnchor="middle"
                          fill="#ffffff"
                          className="text-xs font-bold font-mono-math"
                        >
                          {k}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              );
            })()}

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-[#0B1F3A] dark:text-white">Learning Takeaway</div>
              <p className="text-slate-600 dark:text-slate-300">
                Every crossing in the strand diagram corresponds 1-to-1 with an inversion pair{' '}
                <span className="font-mono-math">(i &lt; j, σ(i) &gt; σ(j))</span>. Since{' '}
                <span className="font-mono-math font-bold">N(σ) = {parityData.count}</span>,{' '}
                <span className="font-mono-math font-bold">
                  sgn(σ) = (−1)^{parityData.count} = {parityData.sign === 1 ? '+1' : '−1'}
                </span>
                , classifying <span className="font-mono-math">{parityData.cycles}</span> as{' '}
                <span className="font-bold">{parityData.parity}</span>.
              </p>
            </div>
          </section>

          {/* Interactive Builder & Inversion List */}
          <section className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <label className="flex items-center gap-2 font-semibold">
                <span>Degree n (2..8):</span>
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={parityN}
                  onChange={(e) => {
                    const nxt = Math.max(2, Math.min(8, Math.trunc(Number(e.target.value)) || 2));
                    setParityN(nxt);
                    setParityBottom(Array.from({ length: nxt }, (_, i) => i + 1));
                    setSelectedInversionIdx(null);
                  }}
                  className="w-16 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math font-bold"
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setParityBottom(Array.from({ length: parityN }, (_, i) => i + 1));
                    setSelectedInversionIdx(null);
                  }}
                  className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Identity ι
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setParityBottom(Array.from({ length: parityN }, (_, i) => parityN - i));
                    setSelectedInversionIdx(null);
                  }}
                  className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Full Reverse
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setParityBottom(
                      Array.from({ length: parityN }, (_, i) => ((i + 1) % parityN) + 1)
                    );
                    setSelectedInversionIdx(null);
                  }}
                  className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  n-Cycle
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-semibold text-slate-500">
                Click adjacent swap buttons below to construct any permutation interactively:
              </div>
              <div className="flex flex-wrap items-center gap-1.5 font-mono-math">
                {parityBottom.map((val, idx) => (
                  <React.Fragment key={idx}>
                    <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-center">
                      <div className="text-[10px] text-slate-400">σ({idx + 1})</div>
                      <div className="text-sm font-bold">{val}</div>
                    </div>
                    {idx < parityBottom.length - 1 && (
                      <button
                        type="button"
                        title={`Swap positions ${idx + 1} and ${idx + 2}`}
                        onClick={() => {
                          const next = [...parityBottom];
                          [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                          setParityBottom(next);
                          setSelectedInversionIdx(null);
                        }}
                        className="px-2 py-1 rounded border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 font-sans font-semibold"
                      >
                        ⇄
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono-math tabular-nums">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="font-sans text-slate-500">Inversions N(σ)</div>
                <div className="text-base font-bold mt-0.5">{parityData.count}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="font-sans text-slate-500">sgn(σ) = (−1)^N</div>
                <div className="text-base font-bold mt-0.5 text-teal-700 dark:text-teal-400">
                  {parityData.sign === 1 ? '+1' : '−1'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="font-sans text-slate-500">Cycle Form</div>
                <div className="text-sm font-bold mt-1 truncate">{parityData.cycles}</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-500">
                Detected Inversions (click any pair to highlight its crossing strands):
              </div>
              {parityData.inversions.length === 0 ? (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  Zero inversions: σ is the identity permutation ι (even).
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {parityData.inversions.map((inv, idx) => (
                    <button
                      key={`${inv.i}-${inv.j}`}
                      type="button"
                      onClick={() =>
                        setSelectedInversionIdx((cur) => (cur === idx ? null : idx))
                      }
                      className={`px-2.5 py-1 rounded border text-xs font-mono-math ${
                        selectedInversionIdx === idx
                          ? 'bg-red-600 text-white border-red-600 font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:border-red-400'
                      }`}
                    >
                      ({inv.i} &lt; {inv.j}: σ({inv.i})={inv.valI} &gt; σ({inv.j})={inv.valJ})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ==================== DEMO E: DIHEDRAL GROUP EXPLORER ==================== */}
      {activeDemo === 'demoE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 flex flex-col items-center space-y-4">
              <div className="w-full flex flex-wrap items-center justify-between gap-2 text-xs">
                <label className="flex items-center gap-2 font-semibold">
                  <span>Polygon n (3..12):</span>
                  <input
                    type="number"
                    min={3}
                    max={12}
                    value={dihN}
                    onChange={(e) => {
                      const val = Math.max(3, Math.min(12, Math.trunc(Number(e.target.value)) || 3));
                      setDihN(val);
                      setDihK((k) => k % val);
                    }}
                    className="w-16 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math font-bold"
                  />
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Identity:</span>
                  {(['1', 't'] as const).map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setDihIdSym(sym)}
                      className={`px-2 py-1 rounded border font-mono-math font-bold ${
                        dihIdSym === sym
                          ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              <DihedralSvgDiagram element={dihCurrent} size={270} identitySymbol={dihIdSym} />

              <div className="w-full p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="font-mono-math font-bold text-sm">
                  {formatDihedral(dihCurrent, dihIdSym)} · ord = {dihedralOrder(dihCurrent)} · inverse ={' '}
                  {formatDihedral(dihedralInverse(dihCurrent), dihIdSym)}
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  {dihedralDescription(dihCurrent)}
                </div>
              </div>
            </section>

            <section className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
              <h3 className="font-bold text-base">
                Dihedral Element Selector & Composition Step Player (D{toSubscript(dihN)})
              </h3>

              <div className="flex flex-wrap gap-1.5">
                {dihElements.map((el) => {
                  const active = dihRef === el.ref && dihK % dihN === el.k;
                  return (
                    <button
                      key={`${el.ref}-${el.k}`}
                      type="button"
                      onClick={() => {
                        setDihRef(el.ref);
                        setDihK(el.k);
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-mono-math font-semibold ${
                        active
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
                      }`}
                    >
                      {formatDihedral(el, dihIdSym)}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="space-y-1">
                  <span className="font-semibold text-slate-500 block">Left Element (applied 2nd)</span>
                  <input
                    type="text"
                    value={dihLeftExpr}
                    onChange={(e) => setDihLeftExpr(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-semibold text-slate-500 block">Right Element (applied 1st)</span>
                  <input
                    type="text"
                    value={dihRightExpr}
                    onChange={(e) => setDihRightExpr(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math"
                  />
                </label>
              </div>

              {dihCompose.error ? (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-200">
                  {dihCompose.error}
                </div>
              ) : (
                dihCompose.result && (
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono-math font-bold text-sm">
                        ({formatDihedral(dihCompose.left!, dihIdSym)})(
                        {formatDihedral(dihCompose.right!, dihIdSym)}) ={' '}
                        <span className="text-teal-700 dark:text-teal-400">
                          {formatDihedral(dihCompose.result, dihIdSym)}
                        </span>
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setDihRef(0);
                            setDihK(0);
                          }}
                          className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-semibold"
                        >
                          Reset ({dihIdSym})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDihRef(dihCompose.right!.ref);
                            setDihK(dihCompose.right!.k);
                          }}
                          className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-semibold"
                        >
                          1. Apply {formatDihedral(dihCompose.right!, dihIdSym)}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDihRef(dihCompose.result!.ref);
                            setDihK(dihCompose.result!.k);
                          }}
                          className="px-2 py-1 rounded bg-teal-600 text-white font-semibold"
                        >
                          2. Result ({formatDihedral(dihCompose.result, dihIdSym)})
                        </button>
                      </div>
                    </div>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-600 dark:text-slate-300">
                      {dihCompose.steps.map((s, idx) => (
                        <li key={idx}>
                          {s.step}: <span className="font-mono-math font-semibold">{s.expression}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )
              )}

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="font-semibold text-[#0B1F3A] dark:text-white">Learning Takeaway</div>
                <p className="text-slate-600 dark:text-slate-300">
                  Every symmetry of a regular <span className="font-mono-math">{dihN}</span>-gon simplifies via{' '}
                  <span className="font-mono-math">ρ^{dihN} = {dihIdSym}</span>,{' '}
                  <span className="font-mono-math">μ² = {dihIdSym}</span>, and{' '}
                  <span className="font-mono-math">ρμ = μρ^{dihN - 1}</span>. Click any cell in the synchronized table below to animate its product on the polygon.
                </p>
              </div>
            </section>
          </div>

          {/* Synchronized D_n Cayley Table */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3 overflow-x-auto">
            <div className="text-xs font-semibold text-slate-500">
              Synchronized Cayley Table of D{toSubscript(dihN)} (Order {2 * dihN}) — Click any cell to load into composer &amp; polygon
            </div>
            <table className="text-xs font-mono-math border-collapse mx-auto tabular-nums">
              <thead>
                <tr>
                  <th className="p-2 border border-slate-200 dark:border-slate-700 bg-[#0B1F3A] text-white">
                    ∘
                  </th>
                  {dihCayley.labels.map((lbl, idx) => (
                    <th
                      key={idx}
                      className="p-2 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 whitespace-nowrap"
                    >
                      {lbl}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dihCayley.matrix.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <th className="p-2 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-left whitespace-nowrap">
                      {dihCayley.labels[rIdx]}
                    </th>
                    {row.map((val, cIdx) => (
                      <td
                        key={cIdx}
                        onClick={() => {
                          setDihLeftExpr(dihCayley.labels[rIdx]);
                          setDihRightExpr(dihCayley.labels[cIdx]);
                          const resEl = dihElements[val];
                          setDihRef(resEl.ref);
                          setDihK(resEl.k);
                        }}
                        className="p-2 border border-slate-200 dark:border-slate-700 text-center cursor-pointer hover:bg-teal-600 hover:text-white transition-colors whitespace-nowrap"
                      >
                        {dihCayley.labels[val]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  );
};
