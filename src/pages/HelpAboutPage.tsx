import { CheckCircle2, Download, Play, XCircle } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { runMathValidationSuite } from '../math/validation.ts';

export const HelpAboutPage: React.FC = () => {
  const [results, setResults] = useState(() => runMathValidationSuite());
  const allPass = useMemo(() => results.every((r) => r.passed), [results]);
  const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-xl font-bold font-serif-math">
            About AlgebraLab — Artifact 1 Platform &amp; Notation Guide
          </h2>
          {!isFileProtocol && (
            <a
              href="/api/export/html"
              download="AlgebraLab-Artifact1.html"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B1F3A] text-white dark:bg-teal-600 text-xs font-semibold hover:opacity-95"
            >
              <Download className="w-3.5 h-3.5" /> Download Standalone HTML
            </a>
          )}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          AlgebraLab is a dedicated university-level interactive learning platform for Algebra II Artifact 1, featuring computational laboratories, interactive lessons, timed Mock Examinations, a Personal Revision Centre, and an optional AI Mathematics Tutor.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-sm">Standard Dihedral &amp; Permutation Notation</div>
            <p className="text-slate-600 dark:text-slate-300">
              Identity: <span className="font-mono-math font-bold">1</span> · Rotation:{' '}
              <span className="font-mono-math font-bold">ρ</span> · Reflection:{' '}
              <span className="font-mono-math font-bold">μ</span> · Standard elements:{' '}
              <span className="font-mono-math">1, ρ, …, ρⁿ⁻¹, μ, μρ, …, μρⁿ⁻¹</span> with relations{' '}
              <span className="font-mono-math">ρⁿ = 1, μ² = 1, ρᵏμ = μρⁿ⁻ᵏ</span>. Permutations in <span className="font-mono-math">Sₙ</span> compose right-to-left.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-sm">Artifact 1 Scope Guarantee</div>
            <p className="text-slate-600 dark:text-slate-300">
              Covers strictly Artifact 1 (Modules 1–8): Fundamentals of Finite Groups, Finite Abelian Groups &amp; Order-72 Classification, Permutation Groups (<span className="font-mono-math">Sₙ, Aₙ</span>), Dihedral Groups (<span className="font-mono-math">Dₙ</span>), Cyclic Generators &amp; Euler’s <span className="font-mono-math">φ(n)</span>, Cayley Tables, and Real-World Group Modeling. Topics outside Artifact 1 (Sylow, quotient groups, homomorphisms, rings) are excluded.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base">
              Live Mathematical Verification Suite ({results.filter((r) => r.passed).length}/{results.length} Passed)
            </h3>
            <p className="text-xs text-slate-500">
              Executes exact computational checks across order 72, φ(1..20), S₅ parity, D₆/D₈ orders, ℤ₂×ℤ₂ vs ℤ₄, Cayley axioms, and 796 dihedral vertex pairs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setResults(runMathValidationSuite())}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold"
          >
            <Play className="w-3.5 h-3.5" /> Re-Run Suite
          </button>
        </div>

        <div className="text-xs font-semibold text-teal-700 dark:text-teal-400">
          {allPass ? `All ${results.length} mathematical engine checks verified.` : 'Check failed.'}
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {results.map((r) => (
            <div key={r.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
              <div>
                <div className="font-semibold">
                  {r.id}. {r.name}
                </div>
                <div className="text-slate-500 font-mono-math mt-0.5">{r.details}</div>
              </div>
              <span
                className={`inline-flex items-center gap-1 font-semibold shrink-0 ${
                  r.passed ? 'text-teal-700 dark:text-teal-400' : 'text-red-600'
                }`}
              >
                {r.passed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Pass
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" /> Fail
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
