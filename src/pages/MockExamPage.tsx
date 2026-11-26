import {
  Award,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  Flag,
  Printer,
  Sparkles,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MathText } from '../components/MathText.tsx';
import { useApp } from '../context/AppContext.tsx';
import { CURRICULUM_MODULES, getSubsectionById } from '../data/curriculum/index.ts';
import {
  STATIC_QUESTION_BANK,
  type ShuffledQuizQuestion,
} from '../data/questionBank/index.ts';
import type { MockExamRecord } from '../types/algebra.ts';

interface ExamTemplate {
  id: string;
  title: string;
  subtitle: string;
  moduleNumbers: number[];
  questionCount: number;
  durationMinutes: number;
}

const EXAM_TEMPLATES: ExamTemplate[] = [
  {
    id: 'comprehensive',
    title: 'Comprehensive Artifact 1 Final Mock Exam',
    subtitle: 'Balanced 24-question timed paper covering all 8 modules (3 questions per module).',
    moduleNumbers: [1, 2, 3, 4, 5, 6, 7, 8],
    questionCount: 24,
    durationMinutes: 30,
  },
  {
    id: 'midterm_a',
    title: 'Midterm Paper A: Abelian Groups & Permutations',
    subtitle: '16 questions focusing on Group Axioms, Direct Products, Order 72, and Sₙ / Aₙ Parity.',
    moduleNumbers: [1, 2, 3, 4],
    questionCount: 16,
    durationMinutes: 20,
  },
  {
    id: 'midterm_b',
    title: 'Midterm Paper B: Dihedral, Cyclic & Cayley Tables',
    subtitle: '16 questions focusing on Dₙ (ρ, μ), Euler’s φ(n), Cayley Tables, and Modeling.',
    moduleNumbers: [5, 6, 7, 8],
    questionCount: 16,
    durationMinutes: 20,
  },
];

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildMockExamPaper(template: ExamTemplate): ShuffledQuizQuestion[] {
  const perModule = Math.max(1, Math.floor(template.questionCount / template.moduleNumbers.length));
  const chosenIds = new Set<string>();
  const picked = [];

  for (const modNum of template.moduleNumbers) {
    const mod = CURRICULUM_MODULES.find((m) => m.number === modNum);
    if (!mod) continue;
    const pool = shuffleArray(
      STATIC_QUESTION_BANK.filter(
        (q) =>
          q.moduleId === mod.id &&
          (q.difficulty === 'Intermediate' || q.difficulty === 'Advanced' || q.difficulty === 'Beginner')
      )
    );
    for (const q of pool.slice(0, perModule)) {
      chosenIds.add(q.id);
      picked.push(q);
    }
  }

  if (picked.length < template.questionCount) {
    const modIdSet = new Set(
      CURRICULUM_MODULES.filter((m) => template.moduleNumbers.includes(m.number)).map((m) => m.id)
    );
    const extras = shuffleArray(
      STATIC_QUESTION_BANK.filter((q) => modIdSet.has(q.moduleId) && !chosenIds.has(q.id))
    );
    picked.push(...extras.slice(0, template.questionCount - picked.length));
  }

  return shuffleArray(picked).map((q) => {
    const indexed = q.options.map((text, idx) => ({
      text,
      isCorrect: idx === q.correctIndex,
    }));
    const mixed = shuffleArray(indexed);
    return {
      originalId: q.id,
      question: q,
      shuffledOptions: mixed.map((m) => m.text) as [string, string, string, string],
      correctShuffledIndex: mixed.findIndex((m) => m.isCorrect),
    };
  });
}

function getGradeBand(pct: number): string {
  if (pct >= 85) return 'First Class / Distinction';
  if (pct >= 70) return 'Upper Second / Merit';
  if (pct >= 55) return 'Pass Standing';
  return 'Revision Recommended';
}

export const MockExamPage: React.FC = () => {
  const { mockExams, saveMockExam, openLearnSubsection, launchTutor, setActiveNav } = useApp();
  const [selectedTemplateId, setSelectedTemplateId] = useState(EXAM_TEMPLATES[0].id);
  const [phase, setPhase] = useState<'lobby' | 'exam' | 'results'>('lobby');
  const [paper, setPaper] = useState<ShuffledQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(1800);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [latestResult, setLatestResult] = useState<MockExamRecord | null>(null);

  const activeTemplate =
    EXAM_TEMPLATES.find((t) => t.id === selectedTemplateId) ?? EXAM_TEMPLATES[0];

  const submitExam = async () => {
    if (phase !== 'exam') return;
    let totalCorrect = 0;
    const modTotals = new Map<string, { title: string; correct: number; total: number }>();
    const missedItems: MockExamRecord['missedItems'] = [];

    paper.forEach((item, idx) => {
      const picked = answers[idx];
      const ok = picked === item.correctShuffledIndex;
      if (ok) totalCorrect++;

      const mod = CURRICULUM_MODULES.find((m) => m.id === item.question.moduleId);
      const mId = item.question.moduleId;
      const entry = modTotals.get(mId) ?? {
        title: mod ? `Module ${mod.number}: ${mod.title}` : mId,
        correct: 0,
        total: 0,
      };
      entry.total += 1;
      if (ok) entry.correct += 1;
      modTotals.set(mId, entry);

      if (!ok) {
        missedItems.push({
          questionId: item.originalId,
          subsectionId: item.question.subsectionId,
          prompt: item.question.prompt,
          selectedText: picked !== undefined ? item.shuffledOptions[picked] : null,
          correctText: item.shuffledOptions[item.correctShuffledIndex],
          explanation: item.question.explanation,
        });
      }
    });

    const total = paper.length;
    const percentage = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;
    const record: MockExamRecord = {
      id: `${Date.now()}`,
      examTitle: activeTemplate.title,
      score: totalCorrect,
      total,
      percentage,
      durationSeconds: elapsedSeconds,
      completedAt: new Date().toISOString(),
      moduleBreakdown: Array.from(modTotals.entries()).map(([moduleId, val]) => ({
        moduleId,
        moduleTitle: val.title,
        correct: val.correct,
        total: val.total,
      })),
      missedItems,
    };

    setLatestResult(record);
    setPhase('results');
    await saveMockExam(record).catch(() => {});
  };

  useEffect(() => {
    if (phase !== 'exam') return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
      setSecondsLeft((r) => {
        if (r <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 'exam' && secondsLeft === 0) {
      submitExam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase]);

  const startExam = () => {
    const built = buildMockExamPaper(activeTemplate);
    setPaper(built);
    setCurrentIndex(0);
    setAnswers({});
    setFlagged({});
    setSecondsLeft(activeTemplate.durationMinutes * 60);
    setElapsedSeconds(0);
    setLatestResult(null);
    setPhase('exam');
  };

  const downloadTranscript = () => {
    if (!latestResult) return;
    const lines = [
      `AlgebraLab — ${latestResult.examTitle}`,
      `Score: ${latestResult.score}/${latestResult.total} (${latestResult.percentage}%) — ${getGradeBand(latestResult.percentage)}`,
      `Duration: ${Math.floor(latestResult.durationSeconds / 60)}m ${latestResult.durationSeconds % 60}s`,
      '',
      '--- Module Diagnostic ---',
      ...latestResult.moduleBreakdown.map(
        (m) => `${m.moduleTitle}: ${m.correct}/${m.total}`
      ),
      '',
      '--- Question Transcript ---',
      ...paper.map((q, idx) => {
        const picked = answers[idx] !== undefined ? q.shuffledOptions[answers[idx]] : 'Unanswered';
        const correct = q.shuffledOptions[q.correctShuffledIndex];
        return `Q${idx + 1}: ${q.question.prompt}\nYour Answer: ${picked}\nCorrect Answer: ${correct}\nExplanation: ${q.question.explanation}\n`;
      }),
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `artifact1-mock-exam-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentQ = paper[currentIndex];

  return (
    <div className="space-y-6">
      {phase === 'lobby' && (
        <>
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold font-serif-math flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-teal-600" />
                <span>Artifact 1 Mock Examination Centre</span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Simulate realistic timed university exams strictly spanning Artifact 1 (Modules 1–8). Missed questions automatically feed into your Personal Revision Centre.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EXAM_TEMPLATES.map((tpl) => {
                const selected = tpl.id === selectedTemplateId;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`text-left p-4 rounded-xl border space-y-2 transition-colors ${
                      selected
                        ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/30 dark:border-teal-500'
                        : 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
                    }`}
                  >
                    <div className="font-bold text-sm text-[#0B1F3A] dark:text-white">
                      {tpl.title}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{tpl.subtitle}</p>
                    <div className="text-xs font-mono-math text-teal-700 dark:text-teal-400 font-semibold">
                      {tpl.questionCount} questions · {tpl.durationMinutes} min
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={startExam}
                className="px-6 py-2.5 rounded-lg bg-[#0B1F3A] dark:bg-teal-600 text-white text-sm font-semibold"
              >
                Begin Timed Examination
              </button>
              <span className="text-xs text-slate-500">
                Both question order and options are randomized; answers stay hidden until final submission.
              </span>
            </div>
          </section>

          {mockExams.length > 0 && (
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-3">
              <h3 className="font-bold text-base">Past Mock Examination History</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {mockExams.slice(0, 6).map((ex) => (
                  <div
                    key={ex.id}
                    className="py-2.5 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-[#0B1F3A] dark:text-white">
                        {ex.examTitle}
                      </div>
                      <div className="text-slate-500">
                        {new Date(ex.completedAt).toLocaleString()} · {getGradeBand(ex.percentage)}
                      </div>
                    </div>
                    <div className="font-mono-math font-bold text-teal-700 dark:text-teal-400">
                      {ex.score}/{ex.total} ({ex.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {phase === 'exam' && currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-semibold text-teal-700 dark:text-teal-400">
                Question {currentIndex + 1} of {paper.length} ·{' '}
                {getSubsectionById(currentQ.question.subsectionId)?.title}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono-math font-bold text-[#0B1F3A] dark:text-white">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
              </span>
            </div>

            <div className="text-base font-semibold text-[#0B1F3A] dark:text-white leading-relaxed">
              <MathText text={currentQ.question.prompt} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.shuffledOptions.map((opt, oIdx) => {
                const selected = answers[currentIndex] === oIdx;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => setAnswers((p) => ({ ...p, [currentIndex]: oIdx }))}
                    className={`text-left px-4 py-3 rounded-lg border text-xs transition-colors ${
                      selected
                        ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                        : 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
                    }`}
                  >
                    <span className="font-mono-math font-bold mr-2">
                      {String.fromCharCode(65 + oIdx)}.
                    </span>
                    <MathText text={opt} />
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentIndex >= paper.length - 1}
                  onClick={() => setCurrentIndex((i) => Math.min(paper.length - 1, i + 1))}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFlagged((p) => ({ ...p, [currentIndex]: !p[currentIndex] }))
                }
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold ${
                  flagged[currentIndex]
                    ? 'border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{flagged[currentIndex] ? 'Flagged for Review' : 'Flag Question'}</span>
              </button>
            </div>
          </section>

          <aside className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-4">
            <div className="text-sm font-bold">Question Navigator</div>
            <div className="grid grid-cols-6 gap-2">
              {paper.map((_, idx) => {
                const isCurr = idx === currentIndex;
                const isAns = answers[idx] !== undefined;
                const isFlag = flagged[idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg font-mono-math text-xs font-bold border ${
                      isCurr
                        ? 'border-teal-600 ring-2 ring-teal-500/40 bg-[#0B1F3A] text-white dark:bg-teal-600'
                        : isFlag
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                          : isAns
                            ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300'
                            : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-slate-500 space-y-1">
              <div>
                Answered: {Object.keys(answers).length} / {paper.length}
              </div>
              <div>
                Flagged: {Object.values(flagged).filter(Boolean).length}
              </div>
            </div>
            <button
              type="button"
              onClick={submitExam}
              className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold"
            >
              Submit Examination
            </button>
          </aside>
        </div>
      )}

      {phase === 'results' && latestResult && (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                  {latestResult.examTitle}
                </div>
                <h2 className="text-2xl font-bold font-mono-math mt-1 flex items-center gap-2">
                  <Award className="w-6 h-6 text-teal-600" />
                  <span>
                    {latestResult.score}/{latestResult.total} ({latestResult.percentage}%)
                  </span>
                </h2>
                <div className="text-xs text-slate-500 mt-1">
                  Standing: {getGradeBand(latestResult.percentage)} · Time:{' '}
                  {Math.floor(latestResult.durationSeconds / 60)}m{' '}
                  {latestResult.durationSeconds % 60}s
                </div>
              </div>
              <div className="flex flex-wrap gap-2 no-print">
                <button
                  type="button"
                  onClick={downloadTranscript}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" /> Export Transcript
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNav('revision')}
                  className="px-3.5 py-2 rounded-lg bg-[#0B1F3A] text-white text-xs font-semibold"
                >
                  Open Revision Centre
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('lobby')}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold"
                >
                  New Mock Exam
                </button>
              </div>
            </div>

            {/* Module-by-module Diagnostic Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {latestResult.moduleBreakdown.map((m) => {
                const pct = Math.round((m.correct / Math.max(1, m.total)) * 100);
                return (
                  <div
                    key={m.moduleId}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                  >
                    <div className="font-semibold truncate">{m.moduleTitle}</div>
                    <div className="flex items-center justify-between font-mono-math">
                      <span>
                        {m.correct}/{m.total}
                      </span>
                      <span className={pct < 70 ? 'text-amber-600 font-bold' : 'text-teal-600 font-bold'}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            {paper.map((item, idx) => {
              const picked = answers[idx];
              const isCorrect = picked === item.correctShuffledIndex;
              const subTitle = getSubsectionById(item.question.subsectionId)?.title ?? '';
              return (
                <div
                  key={item.originalId}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500">
                      Question {idx + 1} · {subTitle}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
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
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#0B1F3A] dark:text-white">
                    <MathText text={item.question.prompt} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500">Your answer: </span>
                      <span className="font-mono-math font-semibold">
                        {picked !== undefined ? item.shuffledOptions[picked] : 'No selection'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Correct answer: </span>
                      <span className="font-mono-math font-semibold text-teal-700 dark:text-teal-400">
                        {item.shuffledOptions[item.correctShuffledIndex]}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300">
                    Explanation: <MathText text={item.question.explanation} />
                  </div>
                  {!isCorrect && (
                    <div className="flex flex-wrap gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => openLearnSubsection(item.question.subsectionId)}
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
                            contextTitle: subTitle,
                            prompt: `Mock Exam Question: ${item.question.prompt}\nMy selected answer: ${picked !== undefined ? item.shuffledOptions[picked] : 'Unanswered'}\nCorrect answer: ${item.shuffledOptions[item.correctShuffledIndex]}\nExplain why my selection is incorrect and generate 1 similar Artifact 1 practice problem.`,
                          })
                        }
                        className="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400 underline"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Explain Mistake with AI Tutor
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        </div>
      )}
    </div>
  );
};
