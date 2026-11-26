import { CheckCircle2, Eye, Lightbulb, Sparkles, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { MathText } from '../components/MathText.tsx';
import { useApp } from '../context/AppContext.tsx';
import { EXERCISE_CENTRE_PROBLEMS, type GuidedExerciseItem } from '../data/curriculum/index.ts';
import type { AssessmentDifficulty } from '../types/algebra.ts';

export const ExerciseCentrePage: React.FC = () => {
  const { submitExercise, exerciseSubmissions, openLearnSubsection, launchTutor } = useApp();
  const [filter, setFilter] = useState<'all' | 'guided' | AssessmentDifficulty>('all');

  const [fillAnswers, setFillAnswers] = useState<Record<string, string>>({});
  const [multiAnswers, setMultiAnswers] = useState<Record<string, number[]>>({});
  const [matchAnswers, setMatchAnswers] = useState<Record<string, Record<string, string>>>({});
  const [hintsShown, setHintsShown] = useState<Record<string, boolean>>({});
  const [solutionsShown, setSolutionsShown] = useState<Record<string, boolean>>({});
  const [feedbackMap, setFeedbackMap] = useState<
    Record<string, { checked: boolean; isCorrect: boolean }>
  >({});

  const visible = EXERCISE_CENTRE_PROBLEMS.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'guided') return item.number !== undefined;
    return item.difficulty === filter;
  });

  const checkExercise = async (item: GuidedExerciseItem) => {
    let isCorrect = false;
    let recordedAnswer = '';

    if (item.kind === 'fill_blank') {
      const raw = (fillAnswers[item.id] ?? '').trim().toLowerCase().replace(/\s+/g, '');
      const accepted = (item.expectedAnswers ?? []).map((a) =>
        a.trim().toLowerCase().replace(/\s+/g, '')
      );
      isCorrect = accepted.includes(raw);
      recordedAnswer = fillAnswers[item.id] ?? '';
    } else if (item.kind === 'true_false' || item.kind === 'multi_select' || item.kind === 'proof') {
      const picked = [...(multiAnswers[item.id] ?? [])].sort((a, b) => a - b);
      const expected = [...(item.correctIndices ?? [])].sort((a, b) => a - b);
      isCorrect = JSON.stringify(picked) === JSON.stringify(expected);
      recordedAnswer = picked.map((i) => item.options?.[i] ?? i).join('; ');
    } else if (item.kind === 'matching' && item.pairs) {
      const userMap = matchAnswers[item.id] ?? {};
      isCorrect = item.pairs.every((p) => userMap[p.left] === p.right);
      recordedAnswer = JSON.stringify(userMap);
    }

    setFeedbackMap((prev) => ({ ...prev, [item.id]: { checked: true, isCorrect } }));
    await submitExercise({
      exerciseId: item.id,
      title: item.title,
      difficulty: item.difficulty,
      answer: recordedAnswer,
      isCorrect,
      hintsUsed: hintsShown[item.id] ? 1 : 0,
    });
  };

  const solvedCount = new Set(
    exerciseSubmissions.filter((s) => s.isCorrect).map((s) => s.exerciseId)
  ).size;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-serif-math">
              Exercise Centre & 9 Artifact 1 Guided Problems
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Attempt problems before revealing step-by-step solutions. Includes fill-in-the-blank, true/false, multiple-select, matching, and guided algebraic proofs.
            </p>
          </div>
          <div className="text-xs font-mono-math font-semibold text-teal-700 dark:text-teal-400">
            Solved: {solvedCount} / {EXERCISE_CENTRE_PROBLEMS.length}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {(
            [
              ['all', 'All Exercises'],
              ['guided', '9 Guided Problems'],
              ['Beginner', 'Beginner'],
              ['Intermediate', 'Intermediate'],
              ['Advanced', 'Advanced'],
              ['Challenge', 'Challenge'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg border font-semibold ${
                filter === key
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="space-y-4">
        {visible.map((item) => {
          const fb = feedbackMap[item.id];
          const rightChoices = item.pairs ? [...item.pairs.map((p) => p.right)].sort() : [];
          return (
            <section
              key={item.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-slate-500">
                  {item.topicTag} · {item.difficulty} ·{' '}
                  <span className="capitalize">{item.kind.replace('_', ' ')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => openLearnSubsection(item.subsectionId)}
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  Open Related Lesson
                </button>
              </div>

              <h3 className="text-base font-bold text-[#0B1F3A] dark:text-white">
                {item.title}
              </h3>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <MathText text={item.prompt} />
              </p>

              {/* Input Widget per Kind */}
              {item.kind === 'fill_blank' && (
                <input
                  type="text"
                  value={fillAnswers[item.id] ?? ''}
                  onChange={(e) =>
                    setFillAnswers((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                  placeholder="Enter your answer..."
                  className="w-full max-w-md px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math text-sm"
                />
              )}

              {(item.kind === 'true_false' || item.kind === 'multi_select' || item.kind === 'proof') &&
                item.options && (
                  <div className="space-y-2">
                    {item.options.map((opt, idx) => {
                      const selectedList = multiAnswers[item.id] ?? [];
                      const checked = selectedList.includes(idx);
                      return (
                        <label
                          key={idx}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs cursor-pointer hover:border-teal-500"
                        >
                          <input
                            type={item.kind === 'true_false' ? 'radio' : 'checkbox'}
                            name={`ex-${item.id}`}
                            checked={checked}
                            onChange={() => {
                              if (item.kind === 'true_false') {
                                setMultiAnswers((prev) => ({ ...prev, [item.id]: [idx] }));
                              } else {
                                setMultiAnswers((prev) => ({
                                  ...prev,
                                  [item.id]: checked
                                    ? selectedList.filter((i) => i !== idx)
                                    : [...selectedList, idx],
                                }));
                              }
                            }}
                            className="mt-0.5 accent-teal-600"
                          />
                          <span className="font-mono-math">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

              {item.kind === 'matching' && item.pairs && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {item.pairs.map((pair) => (
                    <div
                      key={pair.left}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <span className="font-mono-math font-semibold">{pair.left}</span>
                      <select
                        value={matchAnswers[item.id]?.[pair.left] ?? ''}
                        onChange={(e) =>
                          setMatchAnswers((prev) => ({
                            ...prev,
                            [item.id]: {
                              ...(prev[item.id] ?? {}),
                              [pair.left]: e.target.value,
                            },
                          }))
                        }
                        className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        <option value="">Select match...</option>
                        {rightChoices.map((rc) => (
                          <option key={rc} value={rc}>
                            {rc}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => checkExercise(item)}
                  className="px-4 py-2 rounded-lg bg-[#0B1F3A] dark:bg-teal-600 text-white text-xs font-semibold"
                >
                  Check Answer
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setHintsShown((h) => ({ ...h, [item.id]: !h[item.id] }))
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>{hintsShown[item.id] ? 'Hide Hint' : 'Hint'}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSolutionsShown((s) => ({ ...s, [item.id]: !s[item.id] }))
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{solutionsShown[item.id] ? 'Hide Solution' : 'Reveal Solution'}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    launchTutor({
                      mode: fb?.checked && !fb.isCorrect ? 'explain_wrong' : 'step_hint',
                      contextTitle: item.title,
                      prompt:
                        fb?.checked && !fb.isCorrect
                          ? `Exercise: ${item.prompt}\nMy answer attempt: ${fillAnswers[item.id] ?? 'selection mismatch'}\nCorrect summary: ${item.solutionSummary}\nHelp me understand my mathematical mistake step-by-step.`
                          : `Give me structured step-by-step hints (without spoiling the final answer) for: ${item.prompt}`,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-teal-600 text-teal-700 dark:text-teal-400 text-xs font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{fb?.checked && !fb.isCorrect ? 'Explain Mistake' : 'AI Step Hint'}</span>
                </button>
              </div>

              {fb?.checked && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    fb.isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                      : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                  }`}
                >
                  {fb.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Correct! {item.solutionSummary}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>Not quite — check the hint or verify your calculation.</span>
                    </>
                  )}
                </div>
              )}

              {hintsShown[item.id] && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
                  Hint: <MathText text={item.hint} />
                </div>
              )}

              {solutionsShown[item.id] && (
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <div className="font-bold text-teal-700 dark:text-teal-400">
                    Solution: <MathText text={item.solutionSummary} />
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                    {item.solutionSteps.map((st, idx) => (
                      <li key={idx}>
                        <MathText text={st} />
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
