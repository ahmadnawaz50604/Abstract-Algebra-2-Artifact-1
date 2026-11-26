import { Download, Plus, Shield, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ALL_SUBSECTIONS, getSubsectionById } from '../data/curriculum/index.ts';
import { api, type TeacherOverviewBundle } from '../services/api.ts';
import type { TeacherContentItem, UserRole } from '../types/algebra.ts';

type PortalTab =
  | 'analytics'
  | 'students'
  | 'assignments'
  | 'questions'
  | 'feedback'
  | 'content'
  | 'admin';

export const TeacherPortalPage: React.FC = () => {
  const { user, setAuthModalOpen, refreshState } = useApp();
  const [tab, setTab] = useState<PortalTab>('analytics');
  const [overview, setOverview] = useState<TeacherOverviewBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Assignment form
  const [asgnTitle, setAsgnTitle] = useState('');
  const [asgnDesc, setAsgnDesc] = useState('');
  const [asgnSub, setAsgnSub] = useState('m3-s3');
  const [asgnDue, setAsgnDue] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10)
  );

  // Feedback form
  const [fbStudentId, setFbStudentId] = useState('');
  const [fbMsg, setFbMsg] = useState('');

  // Custom question form
  const [qSub, setQSub] = useState('m5-s2');
  const [qPrompt, setQPrompt] = useState('');
  const [qOpts, setQOpts] = useState<[string, string, string, string]>(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState<0 | 1 | 2 | 3>(0);
  const [qExp, setQExp] = useState('');

  // Teacher content form
  const [tcSub, setTcSub] = useState('m3-s3');
  const [tcTitle, setTcTitle] = useState('');
  const [tcKind, setTcKind] = useState<TeacherContentItem['kind']>('note');
  const [tcBody, setTcBody] = useState('');

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

  const loadOverview = async () => {
    if (!isTeacherOrAdmin) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getTeacherOverview();
      setOverview(data);
      if (!fbStudentId && data.students.length > 0) {
        setFbStudentId(data.students[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load Teacher Portal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  if (!user || !isTeacherOrAdmin) {
    return (
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-8 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold text-xs uppercase tracking-wider">
          <Shield className="w-4 h-4" /> Role-Based Access Control
        </div>
        <h2 className="text-xl font-bold font-serif-math">Teacher & Administrator Portal</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {!user
            ? 'Sign in with a Teacher or Administrator account to manage assignments, inspect class analytics, customize question banks, and post student feedback.'
            : `Your current account (${user.email}) has role "${user.role}". Only accounts promoted to Teacher or Administrator by the platform admin (ahmadnawaz50604@gmail.com) may access faculty facilities.`}
        </p>
        {!user && (
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-[#0B1F3A] dark:bg-teal-600 text-white text-sm font-semibold"
          >
            Sign In (Demo Teacher Available)
          </button>
        )}
      </section>
    );
  }

  const exportCsvAnalytics = () => {
    if (!overview) return;
    const rows = [
      ['Student Name', 'Email', 'Completed Subsections', 'Quiz Attempts', 'Average Score (%)'].join(','),
      ...overview.students.map((st) => {
        const prog = overview.progress[st.id]?.completedSubsections.length ?? 0;
        const stAttempts = overview.quizAttempts.filter((a) => a.studentId === st.id);
        const avg =
          stAttempts.length > 0
            ? Math.round(stAttempts.reduce((s, a) => s + a.percentage, 0) / stAttempts.length)
            : 0;
        return [`"${st.name}"`, st.email, prog, stAttempts.length, avg].join(',');
      }),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'algebralab-class-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
              {user.role === 'admin' ? 'Administrator & Faculty Console' : 'Faculty Teacher Portal'}
            </div>
            <h2 className="text-xl font-bold font-serif-math">
              Course Analytics, Assignments & Question Bank
            </h2>
          </div>
          <button
            type="button"
            onClick={exportCsvAnalytics}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold self-start"
          >
            <Download className="w-3.5 h-3.5" /> Export Class CSV
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {(
            [
              ['analytics', 'Analytics'],
              ['students', 'Student Management'],
              ['assignments', 'Assignments'],
              ['questions', 'Question Bank'],
              ['feedback', 'Written Feedback'],
              ['content', 'Supplementary Content'],
              ...(user.role === 'admin' ? ([['admin', 'Role Security (Admin)']] as const) : []),
            ] as [PortalTab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-3 py-1.5 rounded-lg border font-semibold ${
                tab === id
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
      </section>

      {loading && !overview && (
        <div className="p-6 text-sm text-slate-500">Loading faculty records...</div>
      )}

      {overview && tab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-4">
              <div className="text-xs text-slate-500">Enrolled Students</div>
              <div className="text-2xl font-bold font-mono-math mt-1">{overview.students.length}</div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-4">
              <div className="text-xs text-slate-500">Total Quiz Attempts</div>
              <div className="text-2xl font-bold font-mono-math mt-1">{overview.quizAttempts.length}</div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-4">
              <div className="text-xs text-slate-500">Class Mean Score</div>
              <div className="text-2xl font-bold font-mono-math text-teal-700 dark:text-teal-400 mt-1">
                {overview.quizAttempts.length > 0
                  ? `${Math.round(
                      overview.quizAttempts.reduce((s, a) => s + a.percentage, 0) /
                        overview.quizAttempts.length
                    )}%`
                  : '—'}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-4">
              <div className="text-xs text-slate-500">Active Assignments</div>
              <div className="text-2xl font-bold font-mono-math mt-1">{overview.assignments.length}</div>
            </div>
          </div>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
            <h3 className="font-bold text-base">Subsection Performance Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                    <th className="py-2 pr-3">Subsection</th>
                    <th className="py-2 pr-3 text-right">Attempts</th>
                    <th className="py-2 text-right">Mean Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ALL_SUBSECTIONS.map((s) => {
                    const list = overview.quizAttempts.filter((a) => a.subsectionId === s.id);
                    if (list.length === 0) return null;
                    const mean = Math.round(
                      list.reduce((x, y) => x + y.percentage, 0) / list.length
                    );
                    return (
                      <tr key={s.id}>
                        <td className="py-2 pr-3 font-medium">{s.title}</td>
                        <td className="py-2 pr-3 text-right font-mono-math">{list.length}</td>
                        <td
                          className={`py-2 text-right font-mono-math font-bold ${
                            mean < 70 ? 'text-amber-600' : 'text-teal-700 dark:text-teal-400'
                          }`}
                        >
                          {mean}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {overview && tab === 'students' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3 text-right">Completed</th>
                <th className="py-2 pr-3 text-right">Quiz Avg</th>
                <th className="py-2 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {overview.students.map((st) => {
                const done = overview.progress[st.id]?.completedSubsections.length ?? 0;
                const stA = overview.quizAttempts.filter((a) => a.studentId === st.id);
                const avg =
                  stA.length > 0
                    ? `${Math.round(stA.reduce((x, y) => x + y.percentage, 0) / stA.length)}%`
                    : '—';
                return (
                  <tr key={st.id}>
                    <td className="py-2.5 pr-3 font-semibold">{st.name}</td>
                    <td className="py-2.5 pr-3 font-mono-math text-slate-500">{st.email}</td>
                    <td className="py-2.5 pr-3 text-right font-mono-math">
                      {done}/{ALL_SUBSECTIONS.length}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono-math font-semibold">{avg}</td>
                    <td className="py-2.5 text-right font-mono-math">
                      {new Date(st.lastActiveAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {overview && tab === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await api.createAssignment({
                title: asgnTitle,
                description: asgnDesc,
                subsectionId: asgnSub,
                dueDate: asgnDue,
                questionCount: 10,
                timeLimitMinutes: 15,
              });
              setAsgnTitle('');
              setAsgnDesc('');
              await loadOverview();
              await refreshState();
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3"
          >
            <h3 className="font-bold text-base">Create Course Assignment</h3>
            <input
              required
              placeholder="Assignment title..."
              value={asgnTitle}
              onChange={(e) => setAsgnTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <select
              value={asgnSub}
              onChange={(e) => setAsgnSub(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              {ALL_SUBSECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={asgnDue}
              onChange={(e) => setAsgnDue(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <textarea
              rows={2}
              placeholder="Instructions..."
              value={asgnDesc}
              onChange={(e) => setAsgnDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Publish Assignment
            </button>
          </form>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
            <h3 className="font-bold text-base">Published Assignments</h3>
            {overview.assignments.map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-slate-500">
                    {getSubsectionById(a.subsectionId)?.title} · Due {a.dueDate}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await api.deleteAssignment(a.id);
                    await loadOverview();
                    await refreshState();
                  }}
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </section>
        </div>
      )}

      {overview && tab === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await api.saveQuestion({
                subsectionId: qSub,
                prompt: qPrompt,
                options: qOpts,
                correctIndex: qCorrect,
                explanation: qExp,
                difficulty: 'Intermediate',
              });
              setQPrompt('');
              setQOpts(['', '', '', '']);
              setQExp('');
              await loadOverview();
              await refreshState();
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3"
          >
            <h3 className="font-bold text-base">Add Custom Question to Bank</h3>
            <select
              value={qSub}
              onChange={(e) => setQSub(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              {ALL_SUBSECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <textarea
              required
              rows={2}
              placeholder="Question prompt (standard notation ρ, μ for Dₙ)..."
              value={qPrompt}
              onChange={(e) => setQPrompt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            {qOpts.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="qCorrect"
                  checked={qCorrect === idx}
                  onChange={() => setQCorrect(idx as 0 | 1 | 2 | 3)}
                />
                <input
                  required
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  value={opt}
                  onChange={(e) => {
                    const next = [...qOpts] as [string, string, string, string];
                    next[idx] = e.target.value;
                    setQOpts(next);
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
            ))}
            <input
              required
              placeholder="Explanation..."
              value={qExp}
              onChange={(e) => setQExp(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold"
            >
              Save Question
            </button>
          </form>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
            <h3 className="font-bold text-base">
              Faculty Custom Questions ({overview.customQuestions.length}) · Version History ({overview.questionVersions.length})
            </h3>
            {overview.customQuestions.length === 0 ? (
              <p className="text-xs text-slate-500">
                No faculty-authored questions added yet (all 1,307 built-in verified MCQs remain active).
              </p>
            ) : (
              overview.customQuestions.map((cq) => (
                <div
                  key={cq.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold">{cq.prompt}</div>
                    <div className="text-slate-500">
                      {getSubsectionById(cq.subsectionId)?.title} · v{cq.version ?? 1}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await api.deleteQuestion(cq.id);
                      await loadOverview();
                      await refreshState();
                    }}
                    className="p-1.5 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </section>
        </div>
      )}

      {overview && tab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!fbStudentId) return;
              await api.postFeedback(fbStudentId, fbMsg);
              setFbMsg('');
              await loadOverview();
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3"
          >
            <h3 className="font-bold text-base">Send Written Feedback to Student</h3>
            <select
              value={fbStudentId}
              onChange={(e) => setFbStudentId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              {overview.students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.email})
                </option>
              ))}
            </select>
            <textarea
              required
              rows={3}
              placeholder="Write constructive feedback..."
              value={fbMsg}
              onChange={(e) => setFbMsg(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold"
            >
              Send Feedback
            </button>
          </form>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
            <h3 className="font-bold text-base">Sent Feedback History</h3>
            {overview.feedback.map((f) => (
              <div
                key={f.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1"
              >
                <div className="font-semibold">
                  To: {overview.users.find((u) => u.id === f.studentId)?.name ?? f.studentId}
                </div>
                <p className="text-slate-600 dark:text-slate-300">{f.message}</p>
              </div>
            ))}
          </section>
        </div>
      )}

      {overview && tab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await api.createTeacherContent({
                subsectionId: tcSub,
                title: tcTitle,
                kind: tcKind,
                body: tcBody,
              });
              setTcTitle('');
              setTcBody('');
              await loadOverview();
              await refreshState();
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3"
          >
            <h3 className="font-bold text-base">Add Supplementary Lesson Material</h3>
            <select
              value={tcSub}
              onChange={(e) => setTcSub(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              {ALL_SUBSECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <select
              value={tcKind}
              onChange={(e) => setTcKind(e.target.value as TeacherContentItem['kind'])}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              <option value="note">Faculty Note</option>
              <option value="example">Additional Example</option>
              <option value="revision">Revision Tip</option>
              <option value="guided_hint">Guided Hint</option>
            </select>
            <input
              required
              placeholder="Title..."
              value={tcTitle}
              onChange={(e) => setTcTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <textarea
              required
              rows={3}
              placeholder="Supplementary explanation..."
              value={tcBody}
              onChange={(e) => setTcBody(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold"
            >
              Publish Note
            </button>
          </form>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
            <h3 className="font-bold text-base">Published Teacher Supplements</h3>
            {overview.teacherContent.map((tc) => (
              <div
                key={tc.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex justify-between gap-3"
              >
                <div>
                  <div className="font-semibold">{tc.title}</div>
                  <div className="text-slate-500">{getSubsectionById(tc.subsectionId)?.title}</div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{tc.body}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await api.deleteTeacherContent(tc.id);
                    await loadOverview();
                    await refreshState();
                  }}
                  className="p-1.5 text-red-600 self-start"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </section>
        </div>
      )}

      {overview && tab === 'admin' && user.role === 'admin' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-4">
          <h3 className="font-bold text-base">Administrator Role-Based Access Control</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Current Role</th>
                  <th className="py-2">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {overview.users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2 pr-3 font-semibold">{u.name}</td>
                    <td className="py-2 pr-3 font-mono-math">{u.email}</td>
                    <td className="py-2 pr-3 capitalize">{u.role}</td>
                    <td className="py-2">
                      <select
                        value={u.role}
                        onChange={async (e) => {
                          await api.updateUserRole(u.id, e.target.value as UserRole);
                          await loadOverview();
                        }}
                        className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        <option value="student">student</option>
                        <option value="teacher">teacher</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
