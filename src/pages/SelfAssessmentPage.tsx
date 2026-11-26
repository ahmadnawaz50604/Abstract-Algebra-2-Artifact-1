import { CheckCircle2, Clock, Download, Printer, RefreshCw, Sparkles, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MathText } from '../components/MathText.tsx';
import { useApp } from '../context/AppContext.tsx';
import { ALL_SUBSECTIONS, CURRICULUM_MODULES, getSubsectionById } from '../data/curriculum/index.ts';
import {
  getQuestionsForSubsection,
  selectQuizBatch,
  type ShuffledQuizQuestion,
} from '../data/questionBank/index.ts';
import type { QuestionHistoryState } from '../types/algebra.ts';

export const SelfAssessmentPage: React.FC = () => {
  const {
    quizTargetSubsectionId,
    setQuizTargetSubsectionId,
    questionHistory,
    customQuestions,
    submitQuizAttempt,
    attempts,
    openLearnSubsection,
    launchTutor,
  } = useApp();

  const subsection = getSubsectionById(quizTargetSubsectionId) ?? ALL_SUBSECTIONS[0];
  const pool = getQuestionsForSubsection(subsection.id, customQuestions);
  const hist = questionHistory[subsection.id];

  const [mode, setMode] = useState<'untimed' | 'timed'>('untimed');
  const [questionCount, setQuestionCount] = useState(10);
  const [phase, setPhase] = useState<'setup' | 'active' | 'review'>('setup');

  const [batch, setBatch] = useState<ShuffledQuizQuestion[]>([]);
  const [nextHistoryPreview, setNextHistoryPreview] = useState<QuestionHistoryState | null>(null);
  const [cycleResetBanner, setCycleResetBanner] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [submittedScore, setSubmittedScore] = useState<{
    score: number;
    total: number;
    percentage: number;
    durationSeconds: number;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (phase !== 'active') return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
      if (mode === 'timed') {
        setTimeRemaining((r) => {
          if (r <= 1) {
            window.clearInterval(timer);
            return 0;
          }
          return r - 1;
        });
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, mode]);

  const finishQuiz = async () => {
    if (!nextHistoryPreview || isSubmitting) return;
    setIsSubmitting(true);
    try {
      let correct = 0;
      const items = batch.map((item, idx) => {
        const pickedIdx = answers[idx];
        const isCorrect = pickedIdx === item.correctShuffledIndex;
        if (isCorrect) correct++;
        return {
          questionId: item.originalId,
          prompt: item.question.prompt,
          selectedText:
            pickedIdx !== undefined ? item.shuffledOptions[pickedIdx] : null,
          correctText: item.shuffledOptions[item.correctShuffledIndex],
          isCorrect,
          explanation: item.question.explanation,
        };
      });
      const total = batch.length;
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
      await submitQuizAttempt(
        {
          subsectionId: subsection.id,
          moduleId: subsection.moduleId,
          mode,
          score: correct,
          total,
          percentage,
          durationSeconds: elapsedSeconds,
          cycleNumber: nextHistoryPreview.cycleNumber,
          items,
        },
        nextHistoryPreview
      );
      setSubmittedScore({ score: correct, total, percentage, durationSeconds: elapsedSeconds });
      setPhase('review');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (phase === 'active' && mode === 'timed' && timeRemaining === 0) {
      finishQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, phase, mode]);

  const startQuiz = () => {
    const selection = selectQuizBatch(
      subsection.id,
      hist,
      customQuestions,
      questionCount
    );
    setBatch(selection.questions);
    setNextHistoryPreview(selection.nextHistoryPreview);
    setCycleResetBanner(selection.cycleResetOccurred);
    setAnswers({});
    setElapsedSeconds(0);
    setTimeRemaining(questionCount * 60);
    setSubmittedScore(null);
    setPhase('active');
  };

  const downloadResults = () => {
    if (!submittedScore) return;
    const rows = [
      `AlgebraLab Self-Assessment Report`,
      `Subsection: ${subsection.title}`,
      `Score: ${submittedScore.score}/${submittedScore.total} (${submittedScore.percentage}%)`,
      `Duration: ${submittedScore.durationSeconds}s`,
      '',
      ...batch.map((q, idx) => {
        const picked = answers[idx] !== undefined ? q.shuffledOptions[answers[idx]] : 'No Answer';
        const correct = q.shuffledOptions[q.correctShuffledIndex];
        return `Q${idx + 1}: ${q.question.prompt}\nYour Answer: ${picked}\nCorrect Answer: ${correct}\nExplanation: ${q.question.explanation}\n`;
      }),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${subsection.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const seenCount = hist?.seenQuestionIds.length ?? 0;
  const unseenCount = Math.max(0, pool.length - seenCount);
  const recentForSub = attempts.filter((a) => a.subsectionId === subsection.id);

  return (
    <div className="space-y-6">
      {phase === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold font-serif-math">
                Self-Assessment & Non-Repeating Question Bank
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Every subsection includes 50+ distinct verified MCQs. Questions are drawn strictly from unseen items until the full bank is completed, with both question order and option order randomized.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Select Curriculum Subsection
              </label>
              <select
                value={subsection.id}
                onChange={(e) => setQuizTargetSubsectionId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium"
              >
                {CURRICULUM_MODULES.map((m) => (
                  <optgroup key={m.id} label={`Module ${m.number}: ${m.title}`}>
                    {m.subsections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {m.number}.{s.order} {s.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Assessment Mode
                </div>
                <div className="flex gap-2">
                  {(['untimed', 'timed'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border capitalize ${
                        mode === m
                          ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {m === 'untimed' ? 'Untimed Study' : 'Timed Exam (1 min/Q)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Questions Per Attempt
                </div>
                <div className="flex gap-2">
                  {[5, 10, 15].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`flex-1 py-2 rounded-lg text-xs font-mono-math font-semibold border ${
                        questionCount === cnt
                          ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500">Bank Size</div>
                <div className="text-lg font-bold font-mono-math mt-0.5">{pool.length}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500">Unseen in Cycle {hist?.cycleNumber ?? 1}</div>
                <div className="text-lg font-bold font-mono-math text-teal-700 dark:text-teal-400 mt-0.5">
                  {unseenCount === 0 ? `${pool.length} (New Cycle)` : unseenCount}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500">Attempts Logged</div>
                <div className="text-lg font-bold font-mono-math mt-0.5">{recentForSub.length}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={startQuiz}
                className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold"
              >
                Start Quiz Attempt
              </button>
              <button
                type="button"
                onClick={() => openLearnSubsection(subsection.id)}
                className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold"
              >
                Review Lesson First
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
            <h3 className="font-bold text-sm">Recent Attempts on This Topic</h3>
            {recentForSub.length === 0 ? (
              <p className="text-xs text-slate-500">
                No previous attempts recorded for this subsection yet.
              </p>
            ) : (
              <div className="space-y-2">
                {recentForSub
                  .slice(-6)
                  .reverse()
                  .map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold font-mono-math">
                          {a.score}/{a.total} ({a.percentage}%)
                        </div>
                        <div className="text-slate-500">
                          Cycle {a.cycleNumber} · {a.mode}
                        </div>
                      </div>
                      <span className="text-slate-400 tabular-nums">
                        {new Date(a.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>
      )}

      {phase === 'active' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs text-teal-700 dark:text-teal-400 font-semibold">
                {subsection.title} · Cycle {nextHistoryPreview?.cycleNumber ?? 1}
              </div>
              <div className="text-sm font-bold">
                Answered {Object.keys(answers).length} of {batch.length} questions
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono-math">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                {mode === 'timed'
                  ? `Remaining: ${Math.floor(timeRemaining / 60)}:${String(timeRemaining % 60).padStart(2, '0')}`
                  : `Elapsed: ${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, '0')}`}
              </span>
              <button
                type="button"
                onClick={finishQuiz}
                className="px-4 py-2 rounded-lg bg-[#0B1F3A] dark:bg-teal-600 text-white font-sans font-semibold"
              >
                Submit Assessment
              </button>
            </div>
          </div>

          {cycleResetBanner && (
            <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 text-xs text-teal-800 dark:text-teal-200 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 shrink-0" />
              <span>
                You completed every question in the previous cycle for this subsection! A fresh randomized cycle has started.
              </span>
            </div>
          )}

          <div className="space-y-6">
            {batch.map((item, qIdx) => (
              <div
                key={item.originalId}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="text-xs text-slate-500">
                  Question {qIdx + 1} · {item.question.category} · {item.question.difficulty}
                </div>
                <div className="text-sm font-semibold text-[#0B1F3A] dark:text-white">
                  <MathText text={item.question.prompt} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {item.shuffledOptions.map((opt, oIdx) => {
                    const selected = answers[qIdx] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                        className={`text-left px-3.5 py-2.5 rounded-lg border text-xs transition-colors ${
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
              </div>
            ))}
          </div>
        </section>
      )}

      {phase === 'review' && submittedScore && (
        <section className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                Assessment Complete · {subsection.title}
              </div>
              <h3 className="text-2xl font-bold font-mono-math mt-1">
                Score: {submittedScore.score} / {submittedScore.total} ({submittedScore.percentage}%)
              </h3>
              <div className="text-xs text-slate-500 mt-1">
                Time taken: {submittedScore.durationSeconds}s · Cycle {nextHistoryPreview?.cycleNumber ?? 1}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 no-print">
              <button
                type="button"
                onClick={downloadResults}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" /> Download Report
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
                onClick={() => setPhase('setup')}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold"
              >
                New Quiz
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {batch.map((item, qIdx) => {
              const picked = answers[qIdx];
              const isCorrect = picked === item.correctShuffledIndex;
              return (
                <div
                  key={item.originalId}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500">Question {qIdx + 1}</span>
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
                  <div className="flex flex-wrap gap-3 pt-1 no-print">
                    {!isCorrect && (
                      <button
                        type="button"
                        onClick={() =>
                          launchTutor({
                            mode: 'explain_wrong',
                            contextTitle: subsection.title,
                            prompt: `Question: ${item.question.prompt}\nMy answer: ${picked !== undefined ? item.shuffledOptions[picked] : 'No selection'}\nCorrect answer: ${item.shuffledOptions[item.correctShuffledIndex]}\nExplain why my answer was wrong and walk me through the exact steps.`,
                          })
                        }
                        className="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Explain Wrong Answer with AI Tutor
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        launchTutor({
                          mode: 'similar_exercise',
                          contextTitle: subsection.title,
                          prompt: `Generate a similar Artifact 1 practice problem to: ${item.question.prompt}`,
                        })
                      }
                      className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300 hover:underline"
                    >
                      Generate Similar Exercise
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
