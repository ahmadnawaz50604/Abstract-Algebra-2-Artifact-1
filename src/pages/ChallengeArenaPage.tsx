import { CheckCircle2, Clock, Sparkles, Swords, Trophy, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MathText } from '../components/MathText.tsx';
import { useApp } from '../context/AppContext.tsx';
import { STATIC_QUESTION_BANK, type ShuffledQuizQuestion } from '../data/questionBank/index.ts';

function pickArenaRound(): ShuffledQuizQuestion[] {
  const candidates = STATIC_QUESTION_BANK.filter(
    (q) => q.difficulty === 'Intermediate' || q.difficulty === 'Advanced'
  );
  const arr = [...candidates];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 10).map((q) => {
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

export const ChallengeArenaPage: React.FC = () => {
  const { submitExercise, launchTutor } = useApp();
  const [status, setStatus] = useState<'idle' | 'playing' | 'done'>('idle');
  const [round, setRound] = useState<ShuffledQuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [lastFeedback, setLastFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    correctText: string;
  } | null>(null);

  useEffect(() => {
    if (status !== 'playing') return;
    const t = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setStatus('done');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [status]);

  const startRound = () => {
    setRound(pickArenaRound());
    setIdx(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSecondsLeft(300);
    setLastFeedback(null);
    setStatus('playing');
  };

  const answerCurrent = async (optIdx: number) => {
    if (lastFeedback) return;
    const q = round[idx];
    const isCorrect = optIdx === q.correctShuffledIndex;
    const nextScore = isCorrect ? score + 1 : score;
    const nextStreak = isCorrect ? streak + 1 : 0;
    setScore(nextScore);
    setStreak(nextStreak);
    setBestStreak((b) => Math.max(b, nextStreak));
    setLastFeedback({
      isCorrect,
      explanation: q.question.explanation,
      correctText: q.shuffledOptions[q.correctShuffledIndex],
    });
    if (idx === round.length - 1) {
      await submitExercise({
        exerciseId: `arena-${Date.now()}`,
        title: 'Artifact 1 Challenge Arena Sprint',
        difficulty: 'Challenge',
        answer: `${nextScore}/10`,
        isCorrect: nextScore >= 7,
        hintsUsed: 0,
      }).catch(() => {});
    }
  };

  const nextQuestion = () => {
    setLastFeedback(null);
    if (idx + 1 >= round.length) {
      setStatus('done');
    } else {
      setIdx((i) => i + 1);
    }
  };

  return (
    <div className="space-y-6">
      {status === 'idle' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-8 text-center max-w-2xl mx-auto space-y-5">
          <Swords className="w-10 h-10 text-teal-600 mx-auto" />
          <h2 className="text-2xl font-bold font-serif-math">Artifact 1 Challenge Arena</h2>
          <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <MathText text="Test speed and algebraic precision across 10 mixed Intermediate and Advanced Artifact 1 problems spanning Order-72 Abelian Classifications, Symmetric Group $S_n$ Parity, Dihedral $D_n$ Products ($\\mu, \\rho$), and Euler Totient Generators in 5 minutes." />
          </div>

          <div>
            <button
              type="button"
              onClick={startRound}
              className="px-6 py-3 rounded-lg bg-[#0B1F3A] dark:bg-teal-600 text-white text-sm font-semibold"
            >
              Enter 10-Question Sprint
            </button>
          </div>
        </section>
      )}

      {status === 'playing' && round[idx] && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 max-w-3xl mx-auto space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs font-mono-math">
            <span>
              Question {idx + 1} / {round.length}
            </span>
            <span>
              Score: {score} · Streak: {streak}
            </span>
            <span className="inline-flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
            </span>
          </div>

          <div className="text-base font-semibold text-[#0B1F3A] dark:text-white">
            <MathText text={round[idx].question.prompt} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {round[idx].shuffledOptions.map((opt, oIdx) => (
              <button
                key={oIdx}
                type="button"
                disabled={lastFeedback !== null}
                onClick={() => answerCurrent(oIdx)}
                className={`text-left px-4 py-3 rounded-lg border text-xs transition-colors ${
                  lastFeedback && oIdx === round[idx].correctShuffledIndex
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
                }`}
              >
                <span className="font-mono-math font-bold mr-2">
                  {String.fromCharCode(65 + oIdx)}.
                </span>
                <MathText text={opt} />
              </button>
            ))}
          </div>

          {lastFeedback && (
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div
                className={`font-bold flex items-center gap-1.5 ${
                  lastFeedback.isCorrect
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {lastFeedback.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Correct!
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" /> Incorrect — Answer: {lastFeedback.correctText}
                  </>
                )}
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                <MathText text={lastFeedback.explanation} />
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold"
                >
                  {idx + 1 >= round.length ? 'Finish Arena Sprint' : 'Next Question'}
                </button>
                {!lastFeedback.isCorrect && (
                  <button
                    type="button"
                    onClick={() =>
                      launchTutor({
                        mode: 'explain_wrong',
                        contextTitle: 'Challenge Arena',
                        prompt: `Question: ${round[idx].question.prompt}\nCorrect answer: ${lastFeedback.correctText}\nExplain why this answer is right and highlight any common mistake.`,
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-teal-600 text-teal-700 dark:text-teal-400 font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Explain with AI Tutor
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {status === 'done' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-8 text-center max-w-xl mx-auto space-y-4">
          <Trophy className="w-10 h-10 text-teal-600 mx-auto" />
          <h2 className="text-2xl font-bold font-mono-math">
            Arena Complete: {score} / {round.length} ({Math.round((score / Math.max(1, round.length)) * 100)}%)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Peak accuracy streak: {bestStreak} consecutive correct answers.
          </p>
          <button
            type="button"
            onClick={startRound}
            className="px-5 py-2.5 rounded-lg bg-[#0B1F3A] dark:bg-teal-600 text-white text-sm font-semibold"
          >
            Play Another Sprint
          </button>
        </section>
      )}
    </div>
  );
};
