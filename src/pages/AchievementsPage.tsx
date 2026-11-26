import { Award, Lock, Printer } from 'lucide-react';
import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ALL_SUBSECTIONS } from '../data/curriculum/index.ts';

const ALL_BADGE_DEFINITIONS = [
  {
    id: 'first_module',
    title: 'Axiom Initiate',
    description: 'Complete your first Algebra II curriculum subsection.',
  },
  {
    id: 'curriculum_explorer',
    title: 'Structure Scholar',
    description: 'Complete at least 8 curriculum subsections across modules.',
  },
  {
    id: 'artifact_master',
    title: 'Artifact 1 Laureate',
    description: 'Complete all 24 subsections of Artifact 1.',
  },
  {
    id: 'quiz_distinction',
    title: 'Theorem Verified',
    description: 'Achieve 80% or higher on any subsection self-assessment quiz.',
  },
  {
    id: 'perfect_proof',
    title: 'Exact Isomorphism',
    description: 'Score 100% on a subsection self-assessment quiz.',
  },
  {
    id: 'abelian_classifier',
    title: 'Order-72 Architect',
    description: 'Score 70% or higher on a Module 3 Finite Abelian Classification quiz.',
  },
  {
    id: 'permutation_analyst',
    title: 'Cycle & Parity Master',
    description: 'Score 70% or higher on a Module 4 Permutation Group quiz.',
  },
  {
    id: 'dihedral_symmetrist',
    title: 'Dihedral Symmetrist',
    description: 'Score 70% or higher on a Module 5 Dihedral Group (1, ρ, μ) quiz.',
  },
  {
    id: 'problem_solver',
    title: 'Guided Problem Solver',
    description: 'Solve at least 5 interactive exercises in the Exercise Centre.',
  },
  {
    id: 'mock_exam_scholar',
    title: 'Mock Exam Distinction',
    description: 'Score 75% or higher on a timed Artifact 1 Mock Examination.',
  },
  {
    id: 'revision_strategist',
    title: 'Targeted Revision Strategist',
    description: 'Complete a targeted weak-topic drill in the Personal Revision Centre with 70%+ accuracy.',
  },
];

export const AchievementsPage: React.FC = () => {
  const { user, achievements, progress, attempts } = useApp();
  const earnedMap = new Map(achievements.map((a) => [a.id, a]));
  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
      : 0;
  const eligibleForCertificate = progress.completedSubsections.length >= 6 && attempts.length >= 1;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-math">Achievements & Platform Certificate</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Badges are awarded strictly upon verified completion of curriculum subsections, quizzes, and exercises.
          </p>
        </div>
        <div className="text-sm font-mono-math font-bold text-teal-700 dark:text-teal-400">
          {achievements.length} / {ALL_BADGE_DEFINITIONS.length} Earned
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_BADGE_DEFINITIONS.map((def) => {
          const earned = earnedMap.get(def.id);
          return (
            <div
              key={def.id}
              className={`rounded-xl border p-5 space-y-2 ${
                earned
                  ? 'border-teal-500 bg-white dark:bg-[#0D1A2D]'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm flex items-center gap-2">
                  {earned ? (
                    <Award className="w-4 h-4 text-teal-600 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span>{def.title}</span>
                </div>
                <span className="text-[11px] font-mono-math text-slate-500">
                  {earned ? new Date(earned.earnedAt).toLocaleDateString() : 'Locked'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{def.description}</p>
            </div>
          );
        })}
      </div>

      {/* Printable Platform Record Certificate */}
      <section className="rounded-xl border-2 border-[#0B1F3A] dark:border-teal-600 bg-white dark:bg-[#0D1A2D] p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
            AlgebraLab Platform Learning Record Certificate
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1F3A] dark:bg-teal-600 text-white text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" /> Print Certificate
          </button>
        </div>

        <h3 className="text-2xl font-bold font-serif-math text-[#0B1F3A] dark:text-white">
          Artifact 1 — Finite Abelian, Permutation &amp; Dihedral Groups
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {eligibleForCertificate ? (
            <>
              Awarded to <span className="font-bold">{user?.name ?? 'Registered Learner'}</span> for
              completing{' '}
              <span className="font-mono-math font-bold">
                {progress.completedSubsections.length}/{ALL_SUBSECTIONS.length}
              </span>{' '}
              curriculum subsections and recording an average assessment score of{' '}
              <span className="font-mono-math font-bold">{avgScore}%</span>.
            </>
          ) : (
            <>
              Complete at least 6 curriculum subsections and 1 self-assessment quiz to unlock your named platform learning certificate (current progress:{' '}
              {progress.completedSubsections.length}/6 subsections, {attempts.length}/1 quiz).
            </>
          )}
        </p>
        <div className="pt-2 text-[11px] text-slate-500">
          Note: This certificate documents verified progress inside the AlgebraLab Artifact 1 interactive learning environment.
        </div>
      </section>
    </div>
  );
};
