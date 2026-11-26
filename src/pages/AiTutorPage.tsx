import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Compass,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Send,
  Sparkles,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MathText } from '../components/MathText.tsx';
import { useApp } from '../context/AppContext.tsx';
import { getSubsectionById } from '../data/curriculum/index.ts';
import { api } from '../services/api.ts';
import type { TutorMode } from '../types/algebra.ts';

interface ChatMessage {
  role: 'user' | 'assistant';
  mode?: TutorMode;
  text: string;
}

const TUTOR_MODES: {
  id: TutorMode;
  label: string;
  desc: string;
  placeholder: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'explain_definition',
    label: 'Explain Definitions',
    desc: 'Formal Artifact 1 definitions, concrete examples, and key properties.',
    placeholder: 'e.g., Explain what an invariant-factor decomposition means in Module 3.',
    icon: BookOpen,
  },
  {
    id: 'step_hint',
    label: 'Step-by-Step Hints',
    desc: 'Guided hints without spoiling the complete proof or computation.',
    placeholder: 'e.g., Give me a step-by-step hint to simplify (μρ²)(μρ) in D₅.',
    icon: Lightbulb,
  },
  {
    id: 'explain_wrong',
    label: 'Explain Wrong Answer',
    desc: 'Paste a question and what you picked to see why it is wrong.',
    placeholder: 'e.g., Why is (1,2,3)(4,5) NOT an even permutation in S₅?',
    icon: AlertCircle,
  },
  {
    id: 'similar_exercise',
    label: 'Generate Similar Exercise',
    desc: 'Creates a fresh Artifact 1 practice problem with verified solution.',
    placeholder: 'e.g., Generate a problem like finding all elements of order 2 in D₆.',
    icon: Compass,
  },
  {
    id: 'recommend_lessons',
    label: 'Recommend Lessons',
    desc: 'Suggests Module 1–8 lessons tailored to your quiz history.',
    placeholder: 'e.g., Recommend which Artifact 1 lessons I should study next.',
    icon: CheckCircle2,
  },
  {
    id: 'spot_mistake',
    label: 'Understand My Mistake',
    desc: 'Paste your steps so the tutor can pinpoint the exact algebraic slip.',
    placeholder: 'e.g., I computed (1,2)(1,3) left-to-right and got (1,2,3). Where did I go wrong?',
    icon: HelpCircle,
  },
];

const QUICK_STARTERS: { mode: TutorMode; label: string; prompt: string }[] = [
  {
    mode: 'explain_definition',
    label: 'Elementary divisors vs invariant factors',
    prompt: 'Explain the difference between elementary divisors and invariant factors for a finite abelian group of order 72.',
  },
  {
    mode: 'step_hint',
    label: 'Hint: Simplify (μρ³)(μρ²) in D₆',
    prompt: 'Give me step-by-step hints to simplify (μρ³)(μρ²) in D₆ using ρ and μ without giving away the final answer right away.',
  },
  {
    mode: 'explain_wrong',
    label: 'Why Z₂ × Z₂ ≇ Z₄',
    prompt: 'A student thought Z₂ × Z₂ is isomorphic to Z₄ because both have order 4. Explain why that answer is incorrect.',
  },
  {
    mode: 'similar_exercise',
    label: 'Practice: Generators of Z₁₈ & φ(18)',
    prompt: 'Generate a practice exercise similar to finding φ(20) and listing all generators of Z₂₀, with a hint and verified solution.',
  },
  {
    mode: 'spot_mistake',
    label: 'Audit left-to-right S₄ mistake',
    prompt: 'I multiplied (1,3,2)(2,4) in S₄ left-to-right and got (1,3,4,2). Explain the mathematical mistake in my steps.',
  },
];

export const AiTutorPage: React.FC = () => {
  const { attempts, mockExams, progress, tutorRequest, setActiveNav, openLearnSubsection } = useApp();
  const [mode, setMode] = useState<TutorMode>('explain_definition');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Welcome to the optional **AI Mathematics Tutor** for Artifact 1. Choose a tutoring mode above—explain definitions, get step-by-step hints, diagnose incorrect answers, generate similar exercises, recommend lessons, or spot calculation mistakes. For dihedral groups $D_n$, I will use $\\mu$ and $\\rho$ consistently.',
    },
  ]);

  const weakSummary = useMemo(() => {
    const bySub = new Map<string, number[]>();
    for (const a of attempts) {
      const list = bySub.get(a.subsectionId) ?? [];
      list.push(a.percentage);
      bySub.set(a.subsectionId, list);
    }
    const weakList = Array.from(bySub.entries())
      .map(([id, vals]) => ({
        id,
        avg: Math.round(vals.reduce((x, y) => x + y, 0) / vals.length),
        title: getSubsectionById(id)?.title ?? id,
      }))
      .filter((x) => x.avg < 75)
      .sort((a, b) => a.avg - b.avg);

    const recentMissed = attempts
      .flatMap((a) => a.items.filter((i) => !i.isCorrect))
      .slice(-3)
      .map((i) => `${i.prompt} (picked: ${i.selectedText ?? 'none'}, correct: ${i.correctText})`);

    const latestMock = mockExams[0]
      ? `Latest Mock Exam: ${mockExams[0].score}/${mockExams[0].total} (${mockExams[0].percentage}%)`
      : '';

    return [
      `Completed subsections: ${progress.completedSubsections.length}/24.`,
      weakList.length > 0
        ? `Weak topics (<75%): ${weakList.map((w) => `${w.title} (${w.avg}%)`).join('; ')}`
        : 'No weak quiz topics recorded below 75% yet.',
      latestMock,
      recentMissed.length > 0 ? `Recent missed items: ${recentMissed.join(' | ')}` : '',
    ]
      .filter(Boolean)
      .join(' ');
  }, [attempts, mockExams, progress.completedSubsections.length]);

  const recentMissedItems = useMemo(
    () =>
      attempts
        .slice(-5)
        .flatMap((a) =>
          a.items
            .filter((i) => !i.isCorrect)
            .map((i) => ({ ...i, subsectionTitle: getSubsectionById(a.subsectionId)?.title ?? a.subsectionId }))
        )
        .slice(-4),
    [attempts]
  );

  const sendQuestion = useCallback(
    async (questionText: string, activeMode: TutorMode, contextTitle?: string) => {
      const clean = questionText.trim();
      if (!clean || loading) return;
      setInput('');
      const nextUserMsg: ChatMessage = { role: 'user', mode: activeMode, text: clean };
      setMessages((prev) => [...prev, nextUserMsg]);
      setLoading(true);
      try {
        const res = await api.askTutor(clean, contextTitle ?? 'Artifact 1 AI Mathematics Tutor', {
          mode: activeMode,
          history: messages.slice(-4).map((m) => ({ role: m.role, text: m.text })),
          studentContext: weakSummary,
        });
        setMessages((prev) => [...prev, { role: 'assistant', mode: activeMode, text: res.reply }]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text:
              err instanceof Error
                ? err.message
                : 'The AI Tutor is unavailable right now. Please try again.',
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, weakSummary]
  );

  useEffect(() => {
    if (tutorRequest && tutorRequest.autoSend) {
      setMode(tutorRequest.mode);
      sendQuestion(tutorRequest.prompt, tutorRequest.mode, tutorRequest.contextTitle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorRequest?.id]);

  const currentModeObj = TUTOR_MODES.find((m) => m.id === mode) ?? TUTOR_MODES[0];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-serif-math flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <span>AI Mathematics Tutor (Artifact 1)</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Optional interactive tutor strictly focused on Finite Abelian Groups, Permutations ($S_n / A_n$), Dihedral Groups ($D_n$ in $\mu, \rho$), Cyclic Groups, and Cayley Tables.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                sendQuestion(
                  'Based on my assessment history, recommend which Artifact 1 lessons and practice exercises I should focus on next.',
                  'recommend_lessons'
                )
              }
              className="px-3 py-2 rounded-lg bg-[#0B1F3A] dark:bg-teal-600 text-white text-xs font-semibold"
            >
              Recommend Lessons from My History
            </button>
            <button
              type="button"
              onClick={() =>
                setMessages([
                  {
                    role: 'assistant',
                    text: 'Session cleared. Choose any Artifact 1 tutoring mode below or paste a problem you want help checking.',
                  },
                ])
              }
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Chat
            </button>
          </div>
        </div>

        {/* 6 Capability Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {TUTOR_MODES.map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  active
                    ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/30 dark:border-teal-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-teal-500'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B1F3A] dark:text-white">
                  <Icon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>{m.label}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {m.desc}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Conversation Panel */}
        <section className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] flex flex-col h-[600px]">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-teal-700 dark:text-teal-400">
              Active Mode: {currentModeObj.label}
            </span>
            <span className="text-slate-500">Dihedral notation: μ, ρ, 1 · Sₙ right-to-left</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#0B1F3A] text-white ml-10'
                    : 'bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 mr-6'
                }`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wide opacity-70 mb-1">
                  {m.role === 'user' ? 'You' : 'AI Mathematics Tutor'}
                </div>
                <div className="whitespace-pre-wrap">
                  <MathText text={m.text} />
                </div>
              </div>
            ))}
            {loading && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500">
                Verifying Artifact 1 definitions and calculations...
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendQuestion(input, mode);
            }}
            className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentModeObj.placeholder}
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-600"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold whitespace-nowrap"
            >
              <Send className="w-4 h-4" /> Ask Tutor
            </button>
          </form>
        </section>

        {/* Right Sidebar: Quick Prompts & Recent Missed Questions */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
            <h3 className="font-bold text-sm">1-Click Artifact 1 Prompts</h3>
            <div className="space-y-2">
              {QUICK_STARTERS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMode(q.mode);
                    sendQuestion(q.prompt, q.mode);
                  }}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-xs space-y-0.5 transition-colors"
                >
                  <div className="font-semibold text-[#0B1F3A] dark:text-white">{q.label}</div>
                  <div className="text-[11px] text-teal-700 dark:text-teal-400">
                    {TUTOR_MODES.find((m) => m.id === q.mode)?.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Recent Missed Questions</h3>
              <button
                type="button"
                onClick={() => setActiveNav('revision')}
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
              >
                Revision Centre
              </button>
            </div>
            {recentMissedItems.length === 0 ? (
              <p className="text-xs text-slate-500 leading-relaxed">
                Take a quiz in Self-Assessment or Mock Examination—any missed questions will appear here for instant AI mistake diagnosis.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentMissedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
                  >
                    <div className="text-[11px] text-slate-500">{item.subsectionTitle}</div>
                    <div className="font-medium line-clamp-2">
                      <MathText text={item.prompt} />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('explain_wrong');
                          sendQuestion(
                            `Question: ${item.prompt}\nMy answer: ${item.selectedText ?? 'No answer'}\nCorrect answer: ${item.correctText}\nExplain why my answer is incorrect and walk me through the exact mistake.`,
                            'explain_wrong',
                            item.subsectionTitle
                          );
                        }}
                        className="text-teal-700 dark:text-teal-400 font-semibold hover:underline"
                      >
                        Explain Mistake
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('similar_exercise');
                          sendQuestion(
                            `Generate a similar Artifact 1 practice exercise to: ${item.prompt}`,
                            'similar_exercise',
                            item.subsectionTitle
                          );
                        }}
                        className="text-slate-600 dark:text-slate-300 font-semibold hover:underline"
                      >
                        Similar Exercise
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
            <div className="font-bold text-[#0B1F3A] dark:text-white">Verified Guardrails</div>
            <p>
              The AI Tutor avoids unverified theorems, enforces $\mu$ and $\rho$ for dihedral groups, and stays strictly within Artifact 1. For exact tables and computations, pair explanations with the{' '}
              <button
                type="button"
                onClick={() => openLearnSubsection('m1-s1')}
                className="underline font-semibold text-teal-700 dark:text-teal-400"
              >
                curriculum lessons
              </button>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
