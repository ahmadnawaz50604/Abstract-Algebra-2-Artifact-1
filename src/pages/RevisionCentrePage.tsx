import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { MathText } from '../components/MathText.tsx';
import { useApp } from '../context/AppContext.tsx';
import {
  ALL_SUBSECTIONS,
  CURRICULUM_MODULES,
  getSubsectionById,
} from '../data/curriculum/index.ts';
import {
  STATIC_QUESTION_BANK,
  type ShuffledQuizQuestion,
} from '../data/questionBank/index.ts';

function buildTargetedDrill(subsectionIds: string[], count = 6): ShuffledQuizQuestion[] {
  const idSet = new Set(subsectionIds);
  const pool =
    idSet.size > 0
      ? STATIC_QUESTION_BANK.filter((q) => idSet.has(q.subsectionId))
      : STATIC_QUESTION_BANK;
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(count, arr.length)).map((q) => {
    const indexed = q.options.map((text, idx) => ({
      text,
      isCorrect: idx === q.correctIndex,
    }));
    for (let i = indexed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
    }
    return {
      originalId: q.id,
      question: q,
      shuffledOptions: indexed.map((x) => x.text) as [string, string, string, string],
      correctShuffledIndex: indexed.findIndex((x) => x.isCorrect),
    };
  });
}

const FORMULA_CARDS = [
  {
    title: 'Direct Product Element Order',
    formula: '$\\operatorname{ord}(a_1, \\dots, a_k) = \\operatorname{lcm}(\\operatorname{ord}(a_1), \\dots, \\operatorname{ord}(a_k))$',
    note: '$\\mathbb{Z}_m \\times \\mathbb{Z}_n \\cong \\mathbb{Z}_{mn} \\iff \\gcd(m, n) = 1$.',
  },
  {
    title: 'Finite Abelian Classification (Order 72)',
    formula: '$n = p_1^{e_1}\\cdots p_r^{e_r} \\implies \\text{count} = \\prod p(e_i)$',
    note: '$72 = 2^3 \\cdot 3^2 \\implies p(3)p(2) = 3 \\cdot 2 = 6$ non-isomorphic abelian groups.',
  },
  {
    title: 'Symmetric Group Parity & Composition',
    formula: '$(\\sigma\\tau)(x) = \\sigma(\\tau(x))$ (right-to-left)',
    note: 'A $k$-cycle equals $k-1$ transpositions; $|A_n| = n!/2$ for $n \\ge 2$.',
  },
  {
    title: 'Dihedral Group $D_n$ Relations',
    formula: '$\\rho^n = 1,\\quad \\mu^2 = 1,\\quad \\rho^k\\mu = \\mu\\rho^{n-k}$',
    note: 'Every reflection $\\mu\\rho^k$ has order $2$; $\\operatorname{ord}(\\rho^k) = n / \\gcd(n, k)$.',
  },
  {
    title: 'Cyclic Subgroups & Euler’s Totient',
    formula: '$\\operatorname{ord}_{\\mathbb{Z}_n}(a) = \\frac{n}{\\gcd(n, a)},\\quad |\\text{Generators}(\\mathbb{Z}_n)| = \\varphi(n)$',
    note: '$\\varphi(p^e) = p^{e-1}(p - 1)$ and $\\varphi(mn) = \\varphi(m)\\varphi(n)$ when $\\gcd(m, n) = 1$.',
  },
  {
    title: 'Cayley Table Axiom Signatures',
    formula: 'Latin square $\\iff$ group cancellation; Symmetric across main diagonal $\\iff$ abelian',
    note: 'Row & column matching the header confirms the identity element.',
  },
];

export const RevisionCentrePage: React.FC = () => {
  const {
    attempts,
    mockExams,
    progress,
    openLearnSubsection,
    openQuizForSubsection,
    submitExercise,
    launchTutor,
  } = useApp();

  const [drillItems, setDrillItems] = useState<ShuffledQuizQuestion[] | null>(null);
  const [drillTitle, setDrillTitle] = useState('');
  const [drillAnswers, setDrillAnswers] = useState<Record<number, number>>({});
  const [drillSubmitted, setDrillSubmitted] = useState(false);

  // Aggregate actual assessment history across quizzes and mock exams
  const topicDiagnostic = useMemo(() => {
    const scoresBySub = new Map<string, number[]>();
    for (const a of attempts) {
      const list = scoresBySub.get(a.subsectionId) ?? [];
      list.push(a.percentage);
      scoresBySub.set(a.subsectionId, list);
    }

    const missedBySub = new Map<string, number>();
    const categoryMisses = new Map<string, number>();
    const recentMistakes: {
      questionId: string;
      subsectionId: string;
      subsectionTitle: string;
      prompt: string;
      selectedText: string | null;
      correctText: string;
      explanation: string;
    }[] = [];

    const qLookup = new Map(STATIC_QUESTION_BANK.map((q) => [q.id, q]));

    for (const a of attempts) {
      for (const item of a.items) {
        if (!item.isCorrect) {
          missedBySub.set(a.subsectionId, (missedBySub.get(a.subsectionId) ?? 0) + 1);
          const qMeta = qLookup.get(item.questionId);
          if (qMeta) {
            categoryMisses.set(qMeta.category, (categoryMisses.get(qMeta.category) ?? 0) + 1);
          }
          recentMistakes.push({
            questionId: item.questionId,
            subsectionId: a.subsectionId,
            subsectionTitle: getSubsectionById(a.subsectionId)?.title ?? a.subsectionId,
            prompt: item.prompt,
            selectedText: item.selectedText,
            correctText: item.correctText,
            explanation: item.explanation,
          });
        }
      }
    }

    for (const m of mockExams) {
      for (const item of m.missedItems) {
        missedBySub.set(item.subsectionId, (missedBySub.get(item.subsectionId) ?? 0) + 1);
        const qMeta = qLookup.get(item.questionId);
        if (qMeta) {
          categoryMisses.set(qMeta.category, (categoryMisses.get(qMeta.category) ?? 0) + 1);
        }
        recentMistakes.push({
          questionId: item.questionId,
          subsectionId: item.subsectionId,
          subsectionTitle: getSubsectionById(item.subsectionId)?.title ?? item.subsectionId,
          prompt: item.prompt,
          selectedText: item.selectedText,
          correctText: item.correctText,
          explanation: item.explanation,
        });
      }
    }

    const perSub = ALL_SUBSECTIONS.map((sub) => {
      const scores = scoresBySub.get(sub.id) ?? [];
      const avg =
        scores.length > 0
          ? Math.round(scores.reduce((x, y) => x + y, 0) / scores.length)
          : null;
      const misses = missedBySub.get(sub.id) ?? 0;
      const completed = progress.completedSubsections.includes(sub.id);
      const priority: 'urgent' | 'review' | 'unassessed' | 'strong' =
        avg !== null && avg < 70
          ? 'urgent'
          : (avg !== null && avg < 85) || misses > 0
            ? 'review'
            : avg === null
              ? 'unassessed'
              : 'strong';
      return { sub, avg, attemptCount: scores.length, misses, completed, priority };
    });

    const weakSubs = perSub
      .filter((x) => x.priority === 'urgent' || x.priority === 'review')
      .sort((a, b) => (a.avg ?? 100) - (b.avg ?? 100));

    const recommendedLessons =
      weakSubs.length > 0
        ? weakSubs.slice(0, 4)
        : perSub.filter((x) => !x.completed || x.avg === null).slice(0, 4);

    const topMissedCategories = Array.from(categoryMisses.entries()).sort((a, b) => b[1] - a[1]);

    return {
      perSub,
      weakSubs,
      recommendedLessons,
      recentMistakes: recentMistakes.slice(-8).reverse(),
      topMissedCategories,
    };
  }, [attempts, mockExams, progress.completedSubsections]);

  const startPracticeDrill = (subsectionIds: string[], title: string, count = 6) => {
    const items = buildTargetedDrill(subsectionIds, count);
    setDrillItems(items);
    setDrillTitle(title);
    setDrillAnswers({});
    setDrillSubmitted(false);
  };

  const finishPracticeDrill = async () => {
    if (!drillItems || drillSubmitted) return;
    const correct = drillItems.filter((q, idx) => drillAnswers[idx] === q.correctShuffledIndex).length;
    const pct = Math.round((correct / Math.max(1, drillItems.length)) * 100);
    setDrillSubmitted(true);
    await submitExercise({
      exerciseId: `revision-drill-${Date.now()}`,
      title: `Revision Drill: ${drillTitle}`,
      difficulty: 'Intermediate',
      answer: `${correct}/${drillItems.length} (${pct}%)`,
      isCorrect: pct >= 70,
      hintsUsed: 0,
    }).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-math flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-600" />
            <span>Personal Revision Centre (Artifact 1)</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Analyzes your recorded Self-Assessment quizzes and Mock Examinations to pinpoint weak topics, recommend targeted lessons, and generate focused practice sets.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              const targetIds =
                topicDiagnostic.weakSubs.length > 0
                  ? topicDiagnostic.weakSubs.map((w) => w.sub.id)
                  : topicDiagnostic.recommendedLessons.map((r) => r.sub.id);
              startPracticeDrill(
                targetIds,
                topicDiagnostic.weakSubs.length > 0
                  ? 'My Weak Topics Focus Set'
                  : 'Foundational Unassessed Topics',
                6
              );
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B1F3A] dark:bg-teal-600 text-white text-xs font-semibold"
          >
            <Play className="w-3.5 h-3.5" /> Start Targeted Practice (6 Qs)
          </button>
          <button
            type="button"
            onClick={() =>
              launchTutor({
                mode: 'recommend_lessons',
                openPage: true,
                contextTitle: 'Personal Revision Centre',
                prompt:
                  'Look at my actual Artifact 1 assessment history and weak topics, recommend the best lessons to study next, and give me 1 warm-up practice question.',
              })
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-teal-600 text-teal-700 dark:text-teal-400 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" /> Ask AI Tutor for Study Plan
          </button>
        </div>
      </section>

      {/* Active Targeted Practice Drill Runner */}
      {drillItems && (
        <section className="rounded-xl border-2 border-teal-600 bg-white dark:bg-[#0D1A2D] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                Targeted Revision Drill
              </div>
              <h3 className="font-bold text-base">{drillTitle}</h3>
            </div>
            <div className="flex items-center gap-2">
              {!drillSubmitted ? (
                <button
                  type="button"
                  onClick={finishPracticeDrill}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold"
                >
                  Check Revision Answers
                </button>
              ) : (
                <div className="text-sm font-mono-math font-bold text-teal-700 dark:text-teal-400">
                  Score:{' '}
                  {
                    drillItems.filter((q, idx) => drillAnswers[idx] === q.correctShuffledIndex)
                      .length
                  }
                  /{drillItems.length}
                </div>
              )}
              <button
                type="button"
                onClick={() => setDrillItems(null)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {drillItems.map((item, idx) => {
              const picked = drillAnswers[idx];
              const isCorrect = picked === item.correctShuffledIndex;
              const subTitle = getSubsectionById(item.question.subsectionId)?.title ?? '';
              return (
                <div
                  key={item.originalId}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span>
                      Q{idx + 1} · {subTitle}
                    </span>
                    <span className="capitalize">{item.question.difficulty}</span>
                  </div>
                  <div className="text-sm font-semibold text-[#0B1F3A] dark:text-white">
                    <MathText text={item.question.prompt} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.shuffledOptions.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        type="button"
                        disabled={drillSubmitted}
                        onClick={() => setDrillAnswers((p) => ({ ...p, [idx]: oIdx }))}
                        className={`text-left px-3 py-2 rounded-lg border ${
                          drillSubmitted && oIdx === item.correctShuffledIndex
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 font-semibold'
                            : drillSubmitted && picked === oIdx && !isCorrect
                              ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                              : picked === oIdx
                                ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                                : 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
                        }`}
                      >
                        <span className="font-mono-math font-bold mr-1.5">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        <MathText text={opt} />
                      </button>
                    ))}
                  </div>

                  {drillSubmitted && (
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 space-y-1.5">
                      <div
                        className={`font-bold flex items-center gap-1.5 ${
                          isCorrect
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" /> Incorrect
                          </>
                        )}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">
                        <MathText text={item.question.explanation} />
                      </p>
                      {!isCorrect && (
                        <button
                          type="button"
                          onClick={() =>
                            launchTutor({
                              mode: 'explain_wrong',
                              openPage: true,
                              contextTitle: subTitle,
                              prompt: `Question: ${item.question.prompt}\nMy answer: ${picked !== undefined ? item.shuffledOptions[picked] : 'None'}\nCorrect answer: ${item.shuffledOptions[item.correctShuffledIndex]}\nExplain my mistake step by step.`,
                            })
                          }
                          className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400 font-semibold hover:underline"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Explain Mistake with AI Tutor
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Weak Topics + Recommended Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>
                {topicDiagnostic.weakSubs.length > 0
                  ? `Detected Weak Topics (${topicDiagnostic.weakSubs.length})`
                  : 'Recommended Next Lessons to Master'}
              </span>
            </h3>
            <span className="text-xs text-slate-500">
              Based on {attempts.length} quiz attempt{attempts.length === 1 ? '' : 's'} &amp;{' '}
              {mockExams.length} mock exam{mockExams.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-3">
            {topicDiagnostic.recommendedLessons.map((rec) => (
              <div
                key={rec.sub.id}
                className={`p-4 rounded-xl border space-y-2.5 text-xs ${
                  rec.priority === 'urgent'
                    ? 'border-amber-300 bg-amber-50/70 dark:bg-amber-950/20 dark:border-amber-900'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-sm text-[#0B1F3A] dark:text-white">
                    {rec.sub.title}
                  </div>
                  <div className="font-mono-math font-semibold">
                    {rec.avg !== null ? `${rec.avg}% quiz avg` : 'Not assessed yet'}
                    {rec.misses > 0 ? ` · ${rec.misses} missed Qs` : ''}
                  </div>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                  {rec.sub.revisionSummary.slice(0, 3).map((pt, i) => (
                    <li key={i}>
                      <MathText text={pt} />
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => openLearnSubsection(rec.sub.id)}
                    className="inline-flex items-center gap-1 font-semibold text-[#0B1F3A] dark:text-white underline"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Open Lesson
                  </button>
                  <button
                    type="button"
                    onClick={() => startPracticeDrill([rec.sub.id], rec.sub.title, 5)}
                    className="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400 underline"
                  >
                    <Play className="w-3.5 h-3.5" /> Practice 5 Questions
                  </button>
                  <button
                    type="button"
                    onClick={() => openQuizForSubsection(rec.sub.id)}
                    className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300 underline"
                  >
                    Full Assessment <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mistake Breakdown & Actual Missed Questions */}
        <section className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
            <h3 className="font-bold text-sm">Question Category Error Profile</h3>
            {topicDiagnostic.topMissedCategories.length === 0 ? (
              <p className="text-xs text-slate-500">
                No missed assessment items recorded yet. Complete a subsection quiz or mock exam to build your mistake profile.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {topicDiagnostic.topMissedCategories.map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="capitalize font-medium">{cat} questions</span>
                    <span className="font-mono-math font-bold text-amber-700 dark:text-amber-400">
                      {count} missed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
            <h3 className="font-bold text-sm">Recent Missed Assessment Questions</h3>
            {topicDiagnostic.recentMistakes.length === 0 ? (
              <p className="text-xs text-slate-500">
                Zero missed questions recorded so far.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {topicDiagnostic.recentMistakes.map((m, idx) => (
                  <div
                    key={`${m.questionId}-${idx}`}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
                  >
                    <div className="text-[11px] text-slate-500">{m.subsectionTitle}</div>
                    <div className="font-semibold">
                      <MathText text={m.prompt} />
                    </div>
                    <div className="text-[11px] text-red-600 dark:text-red-400">
                      Picked: {m.selectedText ?? 'Unanswered'} · Correct: {m.correctText}
                    </div>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => openLearnSubsection(m.subsectionId)}
                        className="font-semibold underline"
                      >
                        Review Lesson
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          launchTutor({
                            mode: 'explain_wrong',
                            openPage: true,
                            contextTitle: m.subsectionTitle,
                            prompt: `Question: ${m.prompt}\nMy answer: ${m.selectedText ?? 'Unanswered'}\nCorrect answer: ${m.correctText}\nExplain why my answer was wrong and how to avoid this mistake.`,
                          })
                        }
                        className="font-semibold text-teal-700 dark:text-teal-400 underline inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Ask Tutor Why
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Full Module Mastery Matrix (Modules 1-8) */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base">Artifact 1 Mastery Heatmap (Modules 1–8)</h3>
          <span className="text-xs text-slate-500">Click any topic to practice or review</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {CURRICULUM_MODULES.map((mod) => {
            const subItems = topicDiagnostic.perSub.filter((x) => x.sub.moduleId === mod.id);
            const assessed = subItems.filter((x) => x.avg !== null);
            const modAvg =
              assessed.length > 0
                ? Math.round(assessed.reduce((s, x) => s + (x.avg ?? 0), 0) / assessed.length)
                : null;
            return (
              <div
                key={mod.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="truncate">M{mod.number}: {mod.title}</span>
                  <span className="font-mono-math text-teal-700 dark:text-teal-400 shrink-0 ml-2">
                    {modAvg !== null ? `${modAvg}%` : '—'}
                  </span>
                </div>
                <div className="space-y-1">
                  {subItems.map((it) => (
                    <button
                      key={it.sub.id}
                      type="button"
                      onClick={() => startPracticeDrill([it.sub.id], it.sub.title, 5)}
                      className="w-full flex items-center justify-between text-left px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <span className="truncate pr-2">
                        {mod.number}.{it.sub.order} {it.sub.title}
                      </span>
                      <span
                        className={`font-mono-math shrink-0 ${
                          it.avg === null
                            ? 'text-slate-400'
                            : it.avg < 70
                              ? 'text-amber-600 font-bold'
                              : 'text-emerald-600 font-semibold'
                        }`}
                      >
                        {it.avg !== null ? `${it.avg}%` : 'New'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Artifact 1 Formula & Quick Revision Reference */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Artifact 1 Quick Formula &amp; Notation Reference</span>
          </h3>
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            <RotateCcw className="w-3 h-3 hidden" /> Print Sheet
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FORMULA_CARDS.map((card) => (
            <div
              key={card.title}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
            >
              <div className="font-bold text-[#0B1F3A] dark:text-white">{card.title}</div>
              <div className="text-teal-700 dark:text-teal-400 font-medium">
                <MathText text={card.formula} />
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                <MathText text={card.note} />
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
