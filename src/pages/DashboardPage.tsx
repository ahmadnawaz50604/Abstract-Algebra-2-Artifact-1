import {
  ArrowRight,
  Award,
  BookOpen,
  Compass,
  FileCheck2,
  FileSpreadsheet,
  GitBranch,
  GraduationCap,
  Layers,
  Shapes,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import React from 'react';
import { MathText } from '../components/MathText.tsx';
import { useApp } from '../context/AppContext.tsx';
import { ALL_SUBSECTIONS, CURRICULUM_MODULES, getSubsectionById } from '../data/curriculum/index.ts';

export const DashboardPage: React.FC = () => {
  const {
    user,
    progress,
    attempts,
    achievements,
    assignments,
    feedback,
    setActiveNav,
    openLearnSubsection,
    openQuizForSubsection,
    setAuthModalOpen,
  } = useApp();

  const totalSubsections = ALL_SUBSECTIONS.length;
  const completedCount = progress.completedSubsections.length;
  const completionPct = Math.round((completedCount / totalSubsections) * 100);

  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
      : null;

  const continueSub =
    getSubsectionById(progress.lastVisitedSubsectionId ?? '') ??
    ALL_SUBSECTIONS.find((s) => !progress.completedSubsections.includes(s.id)) ??
    ALL_SUBSECTIONS[0];

  // Identify weak topics (average < 70%)
  const scoresBySub = new Map<string, number[]>();
  for (const a of attempts) {
    const arr = scoresBySub.get(a.subsectionId) ?? [];
    arr.push(a.percentage);
    scoresBySub.set(a.subsectionId, arr);
  }
  const weakSubsections = Array.from(scoresBySub.entries())
    .map(([id, scores]) => ({
      id,
      avg: Math.round(scores.reduce((x, y) => x + y, 0) / scores.length),
      sub: getSubsectionById(id),
    }))
    .filter((x) => x.avg < 70 && x.sub)
    .sort((a, b) => a.avg - b.avg);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Algebra II · Artifact 1 · Finite Groups, Permutations &amp; Symmetries
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif-math text-[#0B1F3A] dark:text-white">
              {user ? `Welcome back, ${user.name}` : 'Finite Abelian, Permutation & Dihedral Groups'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              <MathText text="Explore finite group theory rigorously across Artifact 1: direct products $\\mathbb{Z}_{n_1} \\times \\dots \\times \\mathbb{Z}_{n_k}$, classification of finite abelian groups (including Order 72), permutations in $S_n$ and $A_n$, dihedral symmetries $D_n$ ($1, \\rho, \\mu$), cyclic generators $\\varphi(n)$, and Cayley tables." />
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => openLearnSubsection(continueSub.id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#102A43] dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-sm font-semibold whitespace-nowrap transition-colors"
            >
              <span>Continue: {continueSub.title.split(':')[0]}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {!user && (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
              >
                <span>Sign In to Save Records</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Key Metric Summary Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Curriculum Progress
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-[#0B1F3A] dark:text-white">
            {completedCount} / {totalSubsections}
          </div>
          <div className="mt-1 text-xs text-teal-700 dark:text-teal-400 tabular-nums">
            {completionPct}% subsections completed
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Quiz Average
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-[#0B1F3A] dark:text-white">
            {avgScore !== null ? `${avgScore}%` : '—'}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {attempts.length} recorded attempt{attempts.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Weak Topics Detected
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-[#0B1F3A] dark:text-white">
            {weakSubsections.length}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {weakSubsections.length > 0 ? 'Review available in Progress' : 'No topics below 70%'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Earned Badges
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-[#0B1F3A] dark:text-white">
            {achievements.length}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Awarded on verified mastery
          </div>
        </div>
      </section>

      {/* Computational Laboratories Quick Access */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#0B1F3A] dark:text-white">
            Computational Laboratories & Visualizers
          </h3>
          <button
            type="button"
            onClick={() => setActiveNav('explorer')}
            className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
          >
            Open Group Explorer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              nav: 'classifier' as const,
              icon: Layers,
              title: 'Finite Abelian Group Classifier',
              desc: 'Factor any order n into elementary divisors and invariant factors d₁ | d₂ | ⋯ | dᵣ, including order 72.',
            },
            {
              nav: 'permutations' as const,
              icon: GitBranch,
              title: 'Permutation Lab (S₂–S₅)',
              desc: 'Compose right-to-left, decompose disjoint cycles, factor transpositions, and check parity & Aₙ.',
            },
            {
              nav: 'dihedral' as const,
              icon: Shapes,
              title: 'Dihedral Group Visualizer (D₃–D₈)',
              desc: 'Interactive polygon symmetry canvas & step-by-step product simplifier using 1, ρ, and μ.',
            },
            {
              nav: 'cyclic' as const,
              icon: Compass,
              title: 'Cyclic Group & Generator Calculator',
              desc: 'Compute Euler totient φ(n), generators of ℤₙ, and browse comparison table n = 1..100.',
            },
            {
              nav: 'cayley' as const,
              icon: FileSpreadsheet,
              title: 'Cayley Table Generator & Axiom Auditor',
              desc: 'Generate dynamic tables for arbitrary ℤₙ or Custom Finite Sets, audit all group axioms, and inspect cells.',
            },
            {
              nav: 'demolab' as const,
              icon: Sparkles,
              title: 'Interactive Demonstration Lab (A–E)',
              desc: 'Explore cyclic orbits, Euler totient circles, permutation composition, inversion parity crossings, and Dₙ polygons.',
            },
            {
              nav: 'mockexam' as const,
              icon: FileCheck2,
              title: 'Mock Examination Centre',
              desc: 'Take timed comprehensive or midterm Artifact 1 papers with question flagging and module diagnostics.',
            },
            {
              nav: 'revision' as const,
              icon: Target,
              title: 'Personal Revision Centre',
              desc: 'Analyze weak quiz/exam topics, review missed questions, and launch targeted practice drills.',
            },
            {
              nav: 'tutor' as const,
              icon: Sparkles,
              title: 'AI Mathematics Tutor (Optional)',
              desc: 'Get step-by-step hints, mistake explanations, similar practice problems, and study recommendations.',
            },
            {
              nav: 'exercises' as const,
              icon: GraduationCap,
              title: 'Exercise Centre & Guided Problems',
              desc: 'Practice all 9 Artifact 1 Guided Problems with hints and full step-by-step solutions.',
            },
          ].map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.nav}
                type="button"
                onClick={() => setActiveNav(tool.nav)}
                className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 hover:border-teal-600 dark:hover:border-teal-500 transition-colors flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2.5 text-sm font-bold text-[#0B1F3A] dark:text-white">
                    <Icon className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{tool.title}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 inline-flex items-center gap-1">
                  Launch tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Curriculum Overview + Weak Topics / Faculty Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>{CURRICULUM_MODULES.length} Curriculum Modules (Artifact 1)</span>
            </h3>
            <button
              type="button"
              onClick={() => setActiveNav('learn')}
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
            >
              View All Lessons
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {CURRICULUM_MODULES.map((mod) => {
              const done = mod.subsections.filter((s) =>
                progress.completedSubsections.includes(s.id)
              ).length;
              return (
                <div
                  key={mod.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#0B1F3A] dark:text-white">
                      Module {mod.number}: {mod.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {mod.subsections.length} subsections · {done}/{mod.subsections.length} completed
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => openLearnSubsection(mod.subsections[0].id)}
                      className="text-xs font-semibold text-[#0B1F3A] dark:text-slate-200 hover:text-teal-600"
                    >
                      Open Lesson
                    </button>
                    <button
                      type="button"
                      onClick={() => openQuizForSubsection(mod.subsections[0].id)}
                      className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                    >
                      Quiz
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
            <h3 className="font-bold text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span>Recommended Next Steps</span>
            </h3>
            {weakSubsections.length > 0 ? (
              <div className="space-y-2.5">
                {weakSubsections.slice(0, 3).map((w) => (
                  <div
                    key={w.id}
                    className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs space-y-1"
                  >
                    <div className="font-semibold text-amber-900 dark:text-amber-200">
                      Revise: {w.sub!.title}
                    </div>
                    <div className="text-amber-700 dark:text-amber-300 tabular-nums">
                      Current quiz average: {w.avg}%
                    </div>
                    <button
                      type="button"
                      onClick={() => openLearnSubsection(w.id)}
                      className="font-semibold underline text-amber-900 dark:text-amber-100"
                    >
                      Open revision summary
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Complete subsection quizzes or Mock Examinations to unlock personalized weak-topic detection and targeted practice drills.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveNav('revision')}
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  Open Personal Revision Centre
                </button>
              </div>
            )}
          </div>

          {assignments.length > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-2.5">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-600" />
                <span>Active Course Assignments</span>
              </h3>
              {assignments.slice(0, 2).map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                >
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-slate-500 tabular-nums">Due: {a.dueDate}</div>
                  <button
                    type="button"
                    onClick={() => openQuizForSubsection(a.subsectionId)}
                    className="font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                  >
                    Launch Assigned Quiz
                  </button>
                </div>
              ))}
            </div>
          )}

          {feedback.length > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-2">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Instructor Feedback</span>
              </h3>
              {feedback.slice(-2).map((fb) => (
                <div key={fb.id} className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="font-semibold text-[#0B1F3A] dark:text-white">
                    {fb.teacherName}
                  </div>
                  <p>{fb.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
