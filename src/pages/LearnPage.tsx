import {
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Eye,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DihedralSvgDiagram } from '../components/DihedralSvgDiagram.tsx';
import { KatexFormula, MathText } from '../components/MathText.tsx';
import { useApp } from '../context/AppContext.tsx';
import { CURRICULUM_MODULES, getSubsectionById } from '../data/curriculum/index.ts';
import { classifyAbelianGroups, orderDirectProductTuple } from '../math/abelian.ts';
import { createDihedralElement, dihedralOrder, formatDihedral } from '../math/dihedral.ts';
import { coprimesBelow, cyclicSubgroupZn, eulerPhi, orderInZn } from '../math/numberTheory.ts';

export const LearnPage: React.FC = () => {
  const {
    selectedSubsectionId,
    setSelectedSubsectionId,
    setActiveNav,
    progress,
    toggleCompletedSubsection,
    toggleBookmark,
    saveNote,
    recordTimeSpent,
    openQuizForSubsection,
    teacherContent,
  } = useApp();

  const subsection = getSubsectionById(selectedSubsectionId) ?? CURRICULUM_MODULES[0].subsections[0];
  const parentModule =
    CURRICULUM_MODULES.find((m) => m.id === subsection.moduleId) ?? CURRICULUM_MODULES[0];

  const [noteDraft, setNoteDraft] = useState(progress.notes[subsection.id] ?? '');
  const [noteSavedMsg, setNoteSavedMsg] = useState('');
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // Interactive visual controls inside lessons
  const [dihedralK, setDihedralK] = useState(1);
  const [dihedralRef, setDihedralRef] = useState<0 | 1>(0);
  const [clockStep, setClockStep] = useState(5);

  useEffect(() => {
    setNoteDraft(progress.notes[subsection.id] ?? '');
    setNoteSavedMsg('');
    setDihedralK(1);
    setDihedralRef(0);
  }, [subsection.id, progress.notes]);

  // Track study time passively every 15s while reading
  useEffect(() => {
    const timer = window.setInterval(() => {
      recordTimeSpent(subsection.id, 15).catch(() => {});
    }, 15000);
    return () => window.clearInterval(timer);
  }, [subsection.id, recordTimeSpent]);

  const isCompleted = progress.completedSubsections.includes(subsection.id);
  const isBookmarked = progress.bookmarks.includes(subsection.id);
  const extraTeacherNotes = teacherContent.filter((t) => t.subsectionId === subsection.id);

  const handleSaveNote = async () => {
    await saveNote(subsection.id, noteDraft);
    setNoteSavedMsg('Note saved to your learning record.');
    setTimeout(() => setNoteSavedMsg(''), 2500);
  };

  const renderInteractiveVisual = () => {
    const { kind, defaultN = 6, defaultModuli = [2, 2] } = subsection.visualConfig;

    if (kind === 'dihedral_polygon') {
      const n = defaultN;
      const el = createDihedralElement(n, dihedralRef, dihedralK % n);
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          <DihedralSvgDiagram element={el} size={250} />
          <div className="space-y-4">
            <div className="text-sm font-semibold text-[#0B1F3A] dark:text-white">
              Current Element: <span className="font-mono-math text-teal-700 dark:text-teal-400">{formatDihedral(el)}</span> · Order{' '}
              <span className="font-mono-math">{dihedralOrder(el)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Rotation power k</span>
                <span className="font-mono-math">{dihedralK % n}</span>
              </div>
              <input
                type="range"
                min={0}
                max={n - 1}
                value={dihedralK % n}
                onChange={(e) => setDihedralK(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDihedralRef((r) => (r === 0 ? 1 : 0))}
                className="px-3 py-1.5 rounded-lg bg-[#0B1F3A] dark:bg-teal-600 text-white text-xs font-semibold"
              >
                {dihedralRef === 0 ? 'Apply Reflection μ' : 'Remove Reflection (Rotation Only)'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDihedralRef(0);
                  setDihedralK(0);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset to 1
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (kind === 'cyclic_clock') {
      const n = defaultN;
      const step = clockStep % n;
      const subgroup = cyclicSubgroupZn(step, n);
      const gens = coprimesBelow(n);
      const isGen = subgroup.length === n;
      const size = 240;
      const cx = size / 2;
      const cy = size / 2;
      const r = 86;
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity={0.18} />
            {subgroup.map((val, idx) => {
              const nextVal = subgroup[(idx + 1) % subgroup.length];
              const a1 = (-Math.PI / 2) + (2 * Math.PI * val) / n;
              const a2 = (-Math.PI / 2) + (2 * Math.PI * nextVal) / n;
              if (subgroup.length <= 1) return null;
              return (
                <line
                  key={val}
                  x1={cx + r * Math.cos(a1)}
                  y1={cy + r * Math.sin(a1)}
                  x2={cx + r * Math.cos(a2)}
                  y2={cy + r * Math.sin(a2)}
                  stroke="#0d9488"
                  strokeWidth={2}
                  strokeOpacity={0.75}
                />
              );
            })}
            {Array.from({ length: n }, (_, k) => {
              const angle = (-Math.PI / 2) + (2 * Math.PI * k) / n;
              const x = cx + r * Math.cos(angle);
              const y = cy + r * Math.sin(angle);
              const inSub = subgroup.includes(k);
              return (
                <g key={k} onClick={() => setClockStep(k)} className="cursor-pointer">
                  <circle
                    cx={x}
                    cy={y}
                    r={12}
                    fill={k === step ? '#0d9488' : inSub ? '#0b1f3a' : '#e2e8f0'}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fill={inSub || k === step ? '#ffffff' : '#334155'}
                    className="text-[10px] font-bold font-mono-math"
                  >
                    {k}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="space-y-3 text-xs">
            <div className="text-sm font-bold text-[#0B1F3A] dark:text-white">
              Subgroup ⟨{step}⟩ in ℤ_{n}
            </div>
            <div className="font-mono-math text-slate-700 dark:text-slate-300">
              Elements: {'{'}{subgroup.join(', ')}{'}'}
            </div>
            <div>
              Order: <span className="font-mono-math font-semibold">{orderInZn(step, n)}</span> ·{' '}
              <span className={isGen ? 'text-teal-700 dark:text-teal-400 font-semibold' : 'text-slate-500'}>
                {isGen ? `Generator of ℤ_${n}` : 'Proper subgroup (not a generator)'}
              </span>
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              All φ({n}) = {eulerPhi(n)} generators: {'{'}{gens.join(', ')}{'}'}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Select element a</span>
                <span className="font-mono-math">{step}</span>
              </div>
              <input
                type="range"
                min={0}
                max={n - 1}
                value={step}
                onChange={(e) => setClockStep(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>
          </div>
        </div>
      );
    }

    if (kind === 'abelian_tree_72') {
      const cls72 = classifyAbelianGroups(72);
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">Elementary Divisors</th>
                <th className="py-2 pr-3">Invariant Factors</th>
                <th className="py-2 text-right">Max Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cls72.groups.map((g) => (
                <tr key={g.index}>
                  <td className="py-2 pr-3 font-mono-math">{g.index}</td>
                  <td className="py-2 pr-3 font-mono-math">{g.elementaryLabel}</td>
                  <td className="py-2 pr-3 font-mono-math font-semibold text-teal-700 dark:text-teal-400">
                    {g.invariantLabel}
                  </td>
                  <td className="py-2 text-right font-mono-math tabular-nums">{g.maxElementOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (kind === 'direct_product') {
      const [m, n] = defaultModuli;
      const rows = Array.from({ length: m }, (_, i) => i);
      const cols = Array.from({ length: n }, (_, j) => j);
      return (
        <div className="space-y-3">
          <div className="text-xs text-slate-600 dark:text-slate-300">
            Element orders in ℤ_{m} × ℤ_{n} (computed via lcm):
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {rows.flatMap((a) =>
              cols.map((b) => (
                <div
                  key={`${a}-${b}`}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between font-mono-math"
                >
                  <span>({a}, {b})</span>
                  <span className="text-teal-700 dark:text-teal-400 font-semibold">
                    ord {orderDirectProductTuple([a, b], [m, n])}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
        <p>{subsection.visualConfig.caption}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openQuizForSubsection(subsection.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white font-semibold"
          >
            <Play className="w-3.5 h-3.5" /> Test This Concept in Self-Assessment
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Left Module/Subsection Navigator */}
      <aside className="xl:col-span-4 space-y-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-4 space-y-4">
          <h2 className="font-bold text-base text-[#0B1F3A] dark:text-white">
            Artifact 1 Curriculum (8 Modules)
          </h2>
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {CURRICULUM_MODULES.map((mod) => (
              <div key={mod.id} className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Module {mod.number}: {mod.title}
                </div>
                <div className="space-y-1">
                  {mod.subsections.map((sub) => {
                    const active = sub.id === subsection.id;
                    const done = progress.completedSubsections.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSelectedSubsectionId(sub.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors ${
                          active
                            ? 'bg-[#0B1F3A] text-white dark:bg-teal-600'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate font-medium">
                          {mod.number}.{sub.order} {sub.title}
                        </span>
                        {done && (
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              active ? 'text-teal-300' : 'text-teal-600 dark:text-teal-400'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Structured Lesson Content */}
      <article className="xl:col-span-8 space-y-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-medium text-teal-700 dark:text-teal-400">
              Module {parentModule.number}.{subsection.order} · {subsection.level} · ~{subsection.estimatedMinutes} min
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleBookmark(subsection.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                  isBookmarked
                    ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
              <button
                type="button"
                onClick={() => toggleCompletedSubsection(subsection.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0B1F3A] dark:bg-teal-600 text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-bold font-serif-math text-[#0B1F3A] dark:text-white">
            {subsection.title}
          </h2>

          {/* Learning Objectives & Prerequisites */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Learning Objectives
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4">
                {subsection.learningObjectives.map((obj, idx) => (
                  <li key={idx}>
                    <MathText text={obj} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Prerequisites & Notation
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                {subsection.prerequisites.map((p, idx) => (
                  <div key={idx}>
                    <MathText text={p} />
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                {subsection.notation.map((n, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="font-mono-math font-semibold text-teal-700 dark:text-teal-400">
                      <MathText text={n.symbol} />
                    </span>{' '}
                    — <MathText text={n.meaning} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Definitions & Theorems */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
          <h3 className="font-bold text-base">Definitions & Theorems</h3>
          <div className="space-y-3">
            {subsection.definitions.map((d, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5"
              >
                <div className="text-sm font-bold text-[#0B1F3A] dark:text-white">
                  Definition: <MathText text={d.term} />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <MathText text={d.formal} />
                </p>
                {d.latex && (
                  <div className="pt-1 text-center text-slate-900 dark:text-slate-100">
                    <KatexFormula latex={d.latex} display />
                  </div>
                )}
              </div>
            ))}
            {subsection.theorems.map((t, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 space-y-1.5"
              >
                <div className="text-sm font-bold text-teal-900 dark:text-teal-200">
                  <MathText text={t.title} />
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  <MathText text={t.statement} />
                </p>
                {t.latex && <KatexFormula latex={t.latex} display />}
              </div>
            ))}
          </div>
        </section>

        {/* Conceptual Explanation & Interactive Visual */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
          <h3 className="font-bold text-base">Conceptual Explanation</h3>
          <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {subsection.explanation.map((para, idx) => (
              <p key={idx}>
                <MathText text={para} />
              </p>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-sm font-bold text-[#0B1F3A] dark:text-white">
              Visual Exploration: {subsection.visualConfig.title}
            </div>
            {renderInteractiveVisual()}
          </div>
        </section>

        {/* Step-by-Step Worked Examples & Common Mistakes */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
          <h3 className="font-bold text-base">Step-by-Step Worked Examples</h3>
          {subsection.stepByStepExamples.map((ex, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2.5"
            >
              <div className="font-semibold text-sm text-[#0B1F3A] dark:text-white">
                <MathText text={ex.title} />
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300">
                <span className="font-semibold">Problem: </span>
                <MathText text={ex.problem} />
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                {ex.steps.map((s, si) => (
                  <li key={si}>
                    <MathText text={s} />
                  </li>
                ))}
              </ol>
              <div className="text-sm font-semibold text-teal-800 dark:text-teal-300">
                Conclusion: <MathText text={ex.conclusion} />
              </div>
            </div>
          ))}

          <div className="pt-2 space-y-2">
            <h4 className="font-bold text-sm flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4" />
              <span>Common Mistakes to Avoid</span>
            </h4>
            {subsection.commonMistakes.map((cm, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900 text-xs space-y-1"
              >
                <div className="font-semibold text-amber-900 dark:text-amber-200">
                  Pitfall: <MathText text={cm.mistake} />
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  Correction: <MathText text={cm.correction} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Practice Exercises & Revision Summary */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
          <h3 className="font-bold text-base">Practice Check & Revision Summary</h3>
          {subsection.practiceExercises.map((pe) => (
            <div
              key={pe.id}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3"
            >
              <div className="text-sm font-medium text-[#0B1F3A] dark:text-white">
                <MathText text={pe.prompt} />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setRevealedHints((h) => ({ ...h, [pe.id]: !h[pe.id] }))
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>{revealedHints[pe.id] ? 'Hide Hint' : 'Show Hint'}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRevealedSolutions((s) => ({ ...s, [pe.id]: !s[pe.id] }))
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1F3A] dark:bg-teal-600 text-white text-xs font-semibold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{revealedSolutions[pe.id] ? 'Hide Solution' : 'Reveal Step-by-Step Solution'}</span>
                </button>
              </div>
              {revealedHints[pe.id] && (
                <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                  Hint: <MathText text={pe.hint} />
                </div>
              )}
              {revealedSolutions[pe.id] && (
                <div className="text-xs bg-slate-50 dark:bg-slate-900 p-3.5 rounded-lg space-y-1.5 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-teal-700 dark:text-teal-400">
                    Answer: <MathText text={pe.answer} />
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                    {pe.solutionSteps.map((st, si) => (
                      <li key={si}>
                        <MathText text={st} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* Revision bullets */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Key Revision Takeaways
            </div>
            <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
              {subsection.revisionSummary.map((r, idx) => (
                <li key={idx}>
                  <MathText text={r} />
                </li>
              ))}
            </ul>
          </div>

          {/* Teacher Supplementary Notes (separated from core textbook content) */}
          {extraTeacherNotes.length > 0 && (
            <div className="p-4 rounded-lg border border-teal-200 dark:border-teal-900 bg-teal-50/40 dark:bg-teal-950/20 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wide text-teal-800 dark:text-teal-300">
                Faculty Supplementary Notes
              </div>
              {extraTeacherNotes.map((tc) => (
                <div key={tc.id} className="text-xs space-y-1">
                  <div className="font-semibold">
                    {tc.title} · {tc.authorName}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{tc.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* Student Personal Notes + Quiz CTA */}
          <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Personal Study Notes for this Subsection
              </label>
              <textarea
                rows={3}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Write key reminders, counterexamples, or proof ideas..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:border-teal-600"
                >
                  Save Note
                </button>
                {noteSavedMsg && <span className="text-xs text-teal-600">{noteSavedMsg}</span>}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex flex-col justify-between gap-3">
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-teal-600" />
                  <span>Ready to Verify Mastery?</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Launch a randomized 10-question quiz from our 50+ verified MCQ bank for this subsection.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openQuizForSubsection(subsection.id)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
              >
                <span>Start Subsection Quiz</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
};
