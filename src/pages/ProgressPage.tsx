import { Download, Printer, Target } from 'lucide-react';
import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ALL_SUBSECTIONS, CURRICULUM_MODULES, getSubsectionById } from '../data/curriculum/index.ts';

export const ProgressPage: React.FC = () => {
  const { user, progress, attempts, feedback, openLearnSubsection, openQuizForSubsection, setActiveNav } = useApp();

  const totalSec = Object.values(progress.timeSpentSeconds).reduce((a, b) => a + b, 0);
  const completedCount = progress.completedSubsections.length;

  // Compute per-subsection quiz stats
  const subStats = new Map<string, { count: number; avg: number; best: number }>();
  const grouped = new Map<string, number[]>();
  for (const a of attempts) {
    const arr = grouped.get(a.subsectionId) ?? [];
    arr.push(a.percentage);
    grouped.set(a.subsectionId, arr);
  }
  for (const [id, list] of grouped.entries()) {
    subStats.set(id, {
      count: list.length,
      avg: Math.round(list.reduce((x, y) => x + y, 0) / list.length),
      best: Math.max(...list),
    });
  }

  const weakTopics = Array.from(subStats.entries())
    .filter(([, st]) => st.avg < 70)
    .map(([id, st]) => ({ sub: getSubsectionById(id)!, stats: st }))
    .filter((x) => Boolean(x.sub));

  const downloadReport = () => {
    const lines = [
      'AlgebraLab — Student Progress & Revision Report',
      `Student: ${user ? `${user.name} (${user.email})` : 'Guest Session'}`,
      `Generated: ${new Date().toISOString()}`,
      `Completed Subsections: ${completedCount} / ${ALL_SUBSECTIONS.length}`,
      `Total Study Time: ${Math.round(totalSec / 60)} minutes`,
      '',
      '--- Quiz Attempts ---',
      ...attempts.map(
        (a) =>
          `${a.completedAt.slice(0, 10)} | ${getSubsectionById(a.subsectionId)?.title ?? a.subsectionId} | ${a.score}/${a.total} (${a.percentage}%)`
      ),
      '',
      '--- Weak Topics (<70% average) ---',
      ...(weakTopics.length > 0
        ? weakTopics.map((w) => `${w.sub.title}: ${w.stats.avg}% average`)
        : ['None detected']),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'algebralab-progress-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-math">
            My Progress & Personal Revision Centre
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Track completed subsections, study time, quiz history, bookmarks, personal notes, and targeted revision priorities.
          </p>
        </div>
        <div className="flex gap-2 no-print">
          <button
            type="button"
            onClick={downloadReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" /> Export Report
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B1F3A] dark:bg-teal-600 text-white text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-4">
          <div className="text-xs text-slate-500">Subsections Completed</div>
          <div className="text-2xl font-bold font-mono-math tabular-nums mt-1">
            {completedCount} / {ALL_SUBSECTIONS.length}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-4">
          <div className="text-xs text-slate-500">Tracked Study Time</div>
          <div className="text-2xl font-bold font-mono-math tabular-nums mt-1">
            {Math.max(1, Math.round(totalSec / 60))} min
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-4">
          <div className="text-xs text-slate-500">Bookmarks Saved</div>
          <div className="text-2xl font-bold font-mono-math tabular-nums mt-1">
            {progress.bookmarks.length}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-4">
          <div className="text-xs text-slate-500">Weak Areas (&lt;70%)</div>
          <div className="text-2xl font-bold font-mono-math tabular-nums mt-1">
            {weakTopics.length}
          </div>
        </div>
      </div>

      {/* Personal Revision Centre */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-base">Revision Priorities (Topics Below 70%)</h3>
            <button
              type="button"
              onClick={() => setActiveNav('revision')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
            >
              <Target className="w-3.5 h-3.5" /> Open Full Revision Centre
            </button>
          </div>
          {weakTopics.length === 0 ? (
            <p className="text-xs text-slate-500">
              No weak topics detected yet from your recorded quiz scores. Any subsection averaging below 70% will appear here with targeted revision summaries.
            </p>
          ) : (
            <div className="space-y-3">
              {weakTopics.map(({ sub, stats }) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{sub.title}</span>
                    <span className="font-mono-math">{stats.avg}% avg</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-700 dark:text-slate-300">
                    {sub.revisionSummary.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => openLearnSubsection(sub.id)}
                      className="font-semibold underline"
                    >
                      Open Lesson
                    </button>
                    <button
                      type="button"
                      onClick={() => openQuizForSubsection(sub.id)}
                      className="font-semibold text-teal-700 dark:text-teal-400 underline"
                    >
                      Retake Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
          <h3 className="font-bold text-base">Bookmarked Subsections & Instructor Feedback</h3>
          {progress.bookmarks.length === 0 ? (
            <p className="text-xs text-slate-500">No bookmarked lessons yet.</p>
          ) : (
            <div className="space-y-2">
              {progress.bookmarks.map((id) => {
                const sub = getSubsectionById(id);
                if (!sub) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <span className="font-semibold">{sub.title}</span>
                    <button
                      type="button"
                      onClick={() => openLearnSubsection(id)}
                      className="text-teal-700 dark:text-teal-400 font-semibold hover:underline"
                    >
                      Open
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {feedback.length > 0 && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Faculty Feedback
              </div>
              {feedback.map((f) => (
                <div key={f.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-xs space-y-1">
                  <div className="font-semibold">
                    {f.teacherName} · {new Date(f.createdAt).toLocaleDateString()}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{f.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Module Breakdown */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <h3 className="font-bold text-base">Module-by-Module Completion</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CURRICULUM_MODULES.map((m) => {
            const done = m.subsections.filter((s) =>
              progress.completedSubsections.includes(s.id)
            ).length;
            const pct = Math.round((done / m.subsections.length) * 100);
            return (
              <div
                key={m.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>
                    Module {m.number}: {m.title}
                  </span>
                  <span className="font-mono-math tabular-nums">
                    {done}/{m.subsections.length} ({pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-teal-600" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
