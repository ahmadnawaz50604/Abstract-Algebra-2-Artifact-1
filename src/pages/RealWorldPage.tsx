import { CheckCircle2, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { DihedralSvgDiagram } from '../components/DihedralSvgDiagram.tsx';
import { MathText } from '../components/MathText.tsx';
import { REAL_WORLD_SCENARIOS } from '../data/curriculum/index.ts';
import { createDihedralElement, formatDihedral } from '../math/dihedral.ts';

export const RealWorldPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState(REAL_WORLD_SCENARIOS[0].id);
  const [rotStep, setRotStep] = useState(1);
  const [reflect, setReflect] = useState<0 | 1>(0);
  const [pickedOption, setPickedOption] = useState<Record<string, number>>({});

  const scenario =
    REAL_WORLD_SCENARIOS.find((s) => s.id === selectedId) ?? REAL_WORLD_SCENARIOS[0];
  const diagramEl = createDihedralElement(
    scenario.visualN,
    scenario.allowReflections ? reflect : 0,
    rotStep % scenario.visualN
  );

  const selectedAnswer = pickedOption[scenario.id];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold font-serif-math">
            Real-World Group Theory & Mathematical Modeling Audits
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Explore genuine symmetry, puzzle parity, and scheduling applications—and verify honestly when a real-world system is a group versus when it fails closure or invertibility.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {REAL_WORLD_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => {
                setSelectedId(sc.id);
                setRotStep(1);
                setReflect(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                sc.id === scenario.id
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
              }`}
            >
              {sc.domain}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 flex flex-col items-center space-y-4">
          <DihedralSvgDiagram
            element={diagramEl}
            size={280}
            showAxis={scenario.allowReflections}
          />
          <div className="w-full space-y-3 text-xs">
            <div className="flex items-center justify-between font-mono-math">
              <span>Current State: {formatDihedral(diagramEl)}</span>
              <span>
                {scenario.isGenuineGroup ? 'Genuine Group Model' : 'Non-Group Warning'}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Rotation step k</span>
                <span className="font-mono-math">{rotStep % scenario.visualN}</span>
              </div>
              <input
                type="range"
                min={0}
                max={scenario.visualN - 1}
                value={rotStep % scenario.visualN}
                onChange={(e) => setRotStep(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>
            {scenario.allowReflections && (
              <button
                type="button"
                onClick={() => setReflect((r) => (r === 0 ? 1 : 0))}
                className="w-full py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold hover:border-teal-500"
              >
                {reflect === 0 ? 'Apply Mirror Reflection μ' : 'Clear Mirror Reflection'}
              </button>
            )}
          </div>
        </section>

        <section className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
            <div className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              {scenario.domain} · Model: {scenario.groupModel}
            </div>
            <h3 className="text-lg font-bold font-serif-math">{scenario.title}</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <MathText text={scenario.summary} />
            </p>

            <div className="space-y-1.5 text-xs">
              <div className="font-bold uppercase tracking-wide text-slate-500">
                Algebraic Structure
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                {scenario.algebraicBreakdown.map((b, i) => (
                  <li key={i}>
                    <MathText text={b} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              {Object.entries(scenario.axiomAudit).map(([axiom, detail]) => (
                <div
                  key={axiom}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1"
                >
                  <div className="font-bold capitalize">{axiom}</div>
                  <div className="text-slate-600 dark:text-slate-300">
                    <MathText text={detail} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-3">
            <h4 className="font-bold text-sm">Applied Understanding Check</h4>
            <p className="text-sm font-medium">
              <MathText text={scenario.question.prompt} />
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {scenario.question.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setPickedOption((prev) => ({ ...prev, [scenario.id]: idx }))
                  }
                  className={`text-left px-3.5 py-2.5 rounded-lg border text-xs ${
                    selectedAnswer === idx
                      ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                      : 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {selectedAnswer !== undefined && (
              <div
                className={`p-3 rounded-lg text-xs space-y-1 ${
                  selectedAnswer === scenario.question.correctIndex
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                    : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {selectedAnswer === scenario.question.correctIndex ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Correct
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" /> Incorrect
                    </>
                  )}
                </div>
                <div>
                  <MathText text={scenario.question.explanation} />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
