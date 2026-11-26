import {
  Award,
  BookOpen,
  Calculator,
  CheckSquare,
  Compass,
  Download,
  FileCheck2,
  FileSpreadsheet,
  GitBranch,
  Globe,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Layers,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Search,
  Shapes,
  Sparkles,
  Sun,
  Swords,
  Target,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ALL_SUBSECTIONS, CURRICULUM_MODULES, EXERCISE_CENTRE_PROBLEMS, REAL_WORLD_SCENARIOS, getSubsectionById } from '../data/curriculum/index.ts';
import { api } from '../services/api.ts';
import type { NavSectionId, TutorMode } from '../types/algebra.ts';
import { MathText } from './MathText.tsx';

export interface NavItemConfig {
  id: NavSectionId;
  label: string;
  group: 'Learning' | 'Computational Labs' | 'Practice & Assessment' | 'Records & Portal';
  icon: React.FC<{ className?: string }>;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard', group: 'Learning', icon: LayoutDashboard },
  { id: 'learn', label: 'Learn Mathematics', group: 'Learning', icon: BookOpen },
  { id: 'abelian', label: 'Finite Abelian Groups', group: 'Learning', icon: Layers },
  { id: 'explorer', label: 'Group Explorer', group: 'Computational Labs', icon: Compass },
  { id: 'permutations', label: 'Permutation Lab', group: 'Computational Labs', icon: GitBranch },
  { id: 'dihedral', label: 'Dihedral Group Visualizer', group: 'Computational Labs', icon: Shapes },
  { id: 'cyclic', label: 'Cyclic Group & Generator Calculator', group: 'Computational Labs', icon: Calculator },
  { id: 'classifier', label: 'Finite Abelian Group Classifier', group: 'Computational Labs', icon: Layers },
  { id: 'cayley', label: 'Cayley Table Generator', group: 'Computational Labs', icon: FileSpreadsheet },
  { id: 'demolab', label: 'Interactive Demo Lab', group: 'Computational Labs', icon: Sparkles },
  { id: 'assessment', label: 'Self-Assessment', group: 'Practice & Assessment', icon: CheckSquare },
  { id: 'mockexam', label: 'Mock Examination', group: 'Practice & Assessment', icon: FileCheck2 },
  { id: 'revision', label: 'Personal Revision Centre', group: 'Practice & Assessment', icon: Target },
  { id: 'exercises', label: 'Exercise Centre', group: 'Practice & Assessment', icon: GraduationCap },
  { id: 'realworld', label: 'Real-World Problems', group: 'Practice & Assessment', icon: Globe },
  { id: 'challenge', label: 'Challenge Arena', group: 'Practice & Assessment', icon: Swords },
  { id: 'tutor', label: 'AI Mathematics Tutor', group: 'Practice & Assessment', icon: Sparkles },
  { id: 'progress', label: 'My Progress', group: 'Records & Portal', icon: TrendingUp },
  { id: 'achievements', label: 'Achievements', group: 'Records & Portal', icon: Award },
  { id: 'teacher', label: 'Teacher Portal', group: 'Records & Portal', icon: User },
  { id: 'help', label: 'Help & About', group: 'Records & Portal', icon: HelpCircle },
];

export const LayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    theme,
    toggleTheme,
    activeNav,
    setActiveNav,
    openLearnSubsection,
    openQuizForSubsection,
    authModalOpen,
    setAuthModalOpen,
    tutorOpen,
    setTutorOpen,
    tutorRequest,
    attempts,
    progress,
    login,
    register,
    logout,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tutorMode, setTutorMode] = useState<TutorMode>('general');
  const [tutorPrompt, setTutorPrompt] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([
    {
      role: 'assistant',
      text: 'Welcome to the optional AlgebraLab AI Mathematics Tutor (Artifact 1). Ask me to explain definitions, give step-by-step hints, diagnose wrong answers, generate similar exercises, recommend lessons, or spot mistakes across Finite Abelian groups, $S_n / A_n$, $D_n$ (using $\\mu$ and $\\rho$), $\\mathbb{Z}_n$, and Cayley tables.',
    },
  ]);

  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  const currentNavItem = NAV_ITEMS.find((n) => n.id === activeNav) ?? NAV_ITEMS[0];

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: {
      title: string;
      subtitle: string;
      kind: string;
      onOpen: () => void;
    }[] = [];

    for (const nav of NAV_ITEMS) {
      if (nav.label.toLowerCase().includes(q)) {
        results.push({
          title: nav.label,
          subtitle: nav.group,
          kind: 'Workspace',
          onOpen: () => {
            setActiveNav(nav.id);
            setSearchOpen(false);
          },
        });
      }
    }

    for (const sub of ALL_SUBSECTIONS) {
      const mod = CURRICULUM_MODULES.find((m) => m.id === sub.moduleId);
      const haystack = [
        sub.title,
        ...sub.keywords,
        ...sub.definitions.map((d) => `${d.term} ${d.formal}`),
        ...sub.theorems.map((t) => `${t.title} ${t.statement}`),
      ]
        .join(' ')
        .toLowerCase();
      if (haystack.includes(q)) {
        results.push({
          title: sub.title,
          subtitle: `Module ${mod?.number ?? ''}: ${mod?.title ?? ''}`,
          kind: 'Lesson',
          onOpen: () => {
            openLearnSubsection(sub.id);
            setSearchOpen(false);
          },
        });
      }
    }

    for (const ex of EXERCISE_CENTRE_PROBLEMS) {
      if (`${ex.title} ${ex.prompt} ${ex.topicTag}`.toLowerCase().includes(q)) {
        results.push({
          title: ex.title,
          subtitle: `${ex.topicTag} · ${ex.difficulty}`,
          kind: 'Exercise',
          onOpen: () => {
            setActiveNav('exercises');
            setSearchOpen(false);
          },
        });
      }
    }

    for (const rw of REAL_WORLD_SCENARIOS) {
      if (`${rw.title} ${rw.domain} ${rw.groupModel}`.toLowerCase().includes(q)) {
        results.push({
          title: rw.title,
          subtitle: `${rw.domain} · ${rw.groupModel}`,
          kind: 'Application',
          onOpen: () => {
            setActiveNav('realworld');
            setSearchOpen(false);
          },
        });
      }
    }

    return results.slice(0, 14);
  }, [searchQuery, openLearnSubsection, setActiveNav]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthBusy(true);
    try {
      if (authMode === 'login') {
        await login(authEmail, authPassword);
      } else {
        await register(authName, authEmail, authPassword);
      }
      setAuthPassword('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const studentTutorContext = useMemo(() => {
    const bySub = new Map<string, number[]>();
    for (const a of attempts) {
      const list = bySub.get(a.subsectionId) ?? [];
      list.push(a.percentage);
      bySub.set(a.subsectionId, list);
    }
    const weak = Array.from(bySub.entries())
      .map(([id, vals]) => ({
        title: getSubsectionById(id)?.title ?? id,
        avg: Math.round(vals.reduce((x, y) => x + y, 0) / vals.length),
      }))
      .filter((x) => x.avg < 75);
    return `Completed ${progress.completedSubsections.length}/24 Artifact 1 subsections. ${
      weak.length > 0
        ? `Weak topics: ${weak.map((w) => `${w.title} (${w.avg}%)`).join(', ')}`
        : 'No weak quiz topics below 75% yet.'
    }`;
  }, [attempts, progress.completedSubsections.length]);

  const sendTutorPrompt = async (
    rawPrompt: string,
    modeOverride?: TutorMode,
    contextOverride?: string
  ) => {
    const prompt = rawPrompt.trim();
    if (!prompt || tutorLoading) return;
    const activeMode = modeOverride ?? tutorMode;
    setTutorPrompt('');
    setTutorMessages((prev) => [...prev, { role: 'user', text: prompt }]);
    setTutorLoading(true);
    try {
      const res = await api.askTutor(prompt, contextOverride ?? currentNavItem.label, {
        mode: activeMode,
        history: tutorMessages.slice(-4),
        studentContext: studentTutorContext,
      });
      setTutorMessages((prev) => [...prev, { role: 'assistant', text: res.reply }]);
    } catch (err) {
      setTutorMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            err instanceof Error
              ? err.message
              : 'Tutor service is currently unavailable.',
        },
      ]);
    } finally {
      setTutorLoading(false);
    }
  };

  useEffect(() => {
    if (tutorOpen && tutorRequest && tutorRequest.autoSend) {
      setTutorMode(tutorRequest.mode);
      sendTutorPrompt(tutorRequest.prompt, tutorRequest.mode, tutorRequest.contextTitle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorRequest?.id, tutorOpen]);

  const handleSendTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendTutorPrompt(tutorPrompt);
  };

  const groups: NavItemConfig['group'][] = [
    'Learning',
    'Computational Labs',
    'Practice & Assessment',
    'Records & Portal',
  ];

  const renderSidebarLinks = (closeOnPick: boolean) => (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Main Navigation">
      {groups.map((grp) => (
        <div key={grp}>
          <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {grp}
          </div>
          <div className="space-y-0.5">
            {NAV_ITEMS.filter((item) => item.group === grp).map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveNav(item.id);
                    if (closeOnPick) setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    active
                      ? 'bg-[#0B1F3A] text-white dark:bg-teal-600 dark:text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-teal-300 dark:text-white' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#091322] text-[#0B1F3A] dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] sticky top-0 h-screen">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0B1F3A] dark:bg-teal-600 flex items-center justify-center text-white font-serif-math font-bold text-lg shrink-0">
            G
          </div>
          <div className="min-w-0">
            <div className="font-bold text-base tracking-tight text-[#0B1F3A] dark:text-white truncate">
              AlgebraLab
            </div>
            <div className="text-xs text-teal-700 dark:text-teal-400 truncate">
              Artifact 1 · Group Theory
            </div>
          </div>
        </div>
        {renderSidebarLinks(false)}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          {user ? (
            <div className="flex items-center justify-between gap-2 px-2 py-1.5">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{user.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {user.role} account
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#102A43] dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-sm font-semibold transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white dark:bg-[#0D1A2D] h-full flex flex-col border-r border-slate-200 dark:border-slate-800 z-10">
            <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="font-bold text-base">AlgebraLab Navigation</div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarLinks(true)}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar Contract: Breadcrumb on left, Search + Theme + Tutor/Account on right */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0D1A2D]/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 h-15 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="hidden sm:inline text-slate-400 dark:text-slate-500 whitespace-nowrap">
                {currentNavItem.group}
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">/</span>
              <h1 className="font-semibold text-[#0B1F3A] dark:text-white truncate">
                {currentNavItem.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {typeof window !== 'undefined' && window.location.protocol !== 'file:' && (
              <a
                href="/api/export/html"
                download="AlgebraLab-Artifact1.html"
                title="Download standalone HTML file (AlgebraLab-Artifact1.html)"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                aria-label="Download standalone HTML"
              >
                <Download className="w-4 h-4 text-[#0B1F3A] dark:text-teal-400" />
                <span className="hidden md:inline">Download HTML</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <Search className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">Search Curriculum</span>
            </button>

            <button
              type="button"
              onClick={() => setTutorOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium whitespace-nowrap shrink-0 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline">Algebra Tutor</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {!user && (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="lg:hidden px-3 py-2 rounded-lg bg-[#0B1F3A] text-white text-sm font-medium whitespace-nowrap shrink-0"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-start justify-center pt-16 px-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0D1A2D] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <Search className="w-5 h-5 text-teal-600" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search theorems, order 72, dihedral μρ², Euler totient, S₅, Cayley tables..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {!searchQuery.trim() ? (
                <div className="p-5 text-sm text-slate-500 dark:text-slate-400 space-y-2">
                  <div>Quick search suggestions:</div>
                  <div className="flex flex-wrap gap-2">
                    {['order 72', 'dihedral', 'totient', 'transposition', 'Cayley', 'Klein 4-group'].map(
                      (term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setSearchQuery(term)}
                          className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs hover:border-teal-500"
                        >
                          {term}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-sm text-slate-500 text-center">
                  No matching topics or calculators found for &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                searchResults.map((res, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <button
                      type="button"
                      onClick={res.onOpen}
                      className="text-left flex-1 min-w-0"
                    >
                      <div className="text-sm font-semibold text-[#0B1F3A] dark:text-white truncate">
                        {res.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {res.kind} · {res.subtitle}
                      </div>
                    </button>
                    {res.kind === 'Lesson' && (
                      <button
                        type="button"
                        onClick={() => {
                          const match = ALL_SUBSECTIONS.find((s) => s.title === res.title);
                          if (match) {
                            openQuizForSubsection(match.id);
                            setSearchOpen(false);
                          }
                        }}
                        className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline whitespace-nowrap shrink-0"
                      >
                        Take Quiz
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Mathematics Tutor Drawer */}
      {tutorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-[#0D1A2D] h-full border-l border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Artifact 1 AI Mathematics Tutor</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Optional Artifact 1 Tutor · Consistent μ &amp; ρ notation for Dₙ
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTutorOpen(false);
                      setActiveNav('tutor');
                    }}
                    className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-teal-500"
                  >
                    Full View
                  </button>
                  <button
                    type="button"
                    onClick={() => setTutorOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ['general', 'General'],
                    ['explain_definition', 'Definition'],
                    ['step_hint', 'Hint'],
                    ['explain_wrong', 'Wrong Answer'],
                    ['similar_exercise', 'Practice'],
                    ['recommend_lessons', 'Lessons'],
                    ['spot_mistake', 'Mistake'],
                  ] as const
                ).map(([mId, label]) => (
                  <button
                    key={mId}
                    type="button"
                    onClick={() => setTutorMode(mId)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                      tutorMode === mId
                        ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {tutorMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#0B1F3A] text-white ml-8'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 mr-6'
                  }`}
                >
                  <MathText text={m.text} />
                </div>
              ))}
              {tutorLoading && (
                <div className="text-xs text-slate-500 px-2">Computing mathematical explanation...</div>
              )}
            </div>
            <form
              onSubmit={handleSendTutor}
              className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2"
            >
              <input
                type="text"
                value={tutorPrompt}
                onChange={(e) => setTutorPrompt(e.target.value)}
                placeholder="Ask e.g. 'Why is (1,2,3)(4,5) odd?' or 'Simplify (μρ²)(μρ) in D₅'"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-teal-600"
              />
              <button
                type="submit"
                disabled={tutorLoading}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold whitespace-nowrap"
              >
                Ask
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0D1A2D] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-lg">
                {authMode === 'login' ? 'Sign In to AlgebraLab' : 'Create Student Account'}
              </h2>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Tariq Al-Mansoor"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1">
                  University / Personal Email
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1">
                  Password (min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                />
              </div>
              {authError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                  {authError}
                </div>
              )}
              <button
                type="submit"
                disabled={authBusy}
                className="w-full py-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#102A43] dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-sm font-semibold transition-colors"
              >
                {authBusy ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              {authMode === 'login' && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Demo Faculty / Student Quick Fill (or register a new account):
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthEmail('amina.rashid@university.edu');
                        setAuthPassword('AlgebraStudent!2026');
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:border-teal-500"
                    >
                      Demo Student
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthEmail('prof.halima@university.edu');
                        setAuthPassword('AlgebraFaculty!2026');
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:border-teal-500"
                    >
                      Demo Teacher
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center text-xs text-slate-500">
                {authMode === 'login' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError('');
                    }}
                    className="text-teal-700 dark:text-teal-400 font-semibold hover:underline"
                  >
                    Need a student account? Register here
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError('');
                    }}
                    className="text-teal-700 dark:text-teal-400 font-semibold hover:underline"
                  >
                    Already registered? Sign in
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
