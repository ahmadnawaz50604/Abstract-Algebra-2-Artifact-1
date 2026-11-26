import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { CayleyGroupKind } from '../math/cayley.ts';
import { api } from '../services/api.ts';
import type {
  AssignmentRecord,
  EarnedAchievement,
  ExerciseSubmission,
  MCQQuestion,
  MockExamRecord,
  NavSectionId,
  PublicUser,
  QuestionHistoryState,
  QuizAttempt,
  StudentProgressRecord,
  TeacherContentItem,
  TeacherFeedbackItem,
  TutorMode,
  UserRole,
} from '../types/algebra.ts';

interface AppContextValue {
  user: PublicUser | null;
  authLoading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeNav: NavSectionId;
  setActiveNav: (nav: NavSectionId) => void;
  selectedSubsectionId: string;
  setSelectedSubsectionId: (id: string) => void;
  quizTargetSubsectionId: string;
  setQuizTargetSubsectionId: (id: string) => void;
  openLearnSubsection: (subsectionId: string) => void;
  openQuizForSubsection: (subsectionId: string) => void;
  cayleySpec: CayleyGroupKind;
  setCayleySpec: (spec: CayleyGroupKind) => void;
  openCayleyForSpec: (spec: CayleyGroupKind) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  // AI Tutor launcher & shared state
  tutorOpen: boolean;
  setTutorOpen: (open: boolean) => void;
  tutorRequest: {
    id: number;
    prompt: string;
    mode: TutorMode;
    contextTitle?: string;
    autoSend?: boolean;
  } | null;
  launchTutor: (opts: {
    prompt: string;
    mode?: TutorMode;
    contextTitle?: string;
    autoSend?: boolean;
    openPage?: boolean;
  }) => void;

  // Student learning state
  progress: StudentProgressRecord;
  attempts: QuizAttempt[];
  mockExams: MockExamRecord[];
  questionHistory: Record<string, QuestionHistoryState>;
  exerciseSubmissions: ExerciseSubmission[];
  achievements: EarnedAchievement[];
  feedback: TeacherFeedbackItem[];
  assignments: AssignmentRecord[];
  customQuestions: MCQQuestion[];
  teacherContent: TeacherContentItem[];

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshState: () => Promise<void>;
  toggleCompletedSubsection: (subsectionId: string) => Promise<void>;
  toggleBookmark: (subsectionId: string) => Promise<void>;
  saveNote: (subsectionId: string, note: string) => Promise<void>;
  recordTimeSpent: (subsectionId: string, addSeconds: number) => Promise<void>;
  submitQuizAttempt: (
    attempt: Omit<QuizAttempt, 'id' | 'studentId' | 'completedAt'>,
    historyState: QuestionHistoryState
  ) => Promise<void>;
  submitExercise: (
    submission: Omit<ExerciseSubmission, 'id' | 'studentId' | 'submittedAt'>
  ) => Promise<void>;
  saveMockExam: (record: MockExamRecord) => Promise<void>;
}

const DEFAULT_PROGRESS: StudentProgressRecord = {
  completedSubsections: [],
  bookmarks: [],
  notes: {},
  timeSpentSeconds: {},
};

const LOCAL_STORAGE_KEY = 'algebralab_guest_state_v1';
const MOCK_EXAM_STORAGE_PREFIX = 'algebralab_mock_exams_v1_';

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('algebralab_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });
  const [activeNav, setActiveNav] = useState<NavSectionId>('dashboard');
  const [selectedSubsectionId, setSelectedSubsectionId] = useState('m1-s1');
  const [quizTargetSubsectionId, setQuizTargetSubsectionId] = useState('m1-s1');
  const [cayleySpec, setCayleySpec] = useState<CayleyGroupKind>({ type: 'cyclic', n: 6 });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorRequest, setTutorRequest] = useState<{
    id: number;
    prompt: string;
    mode: TutorMode;
    contextTitle?: string;
    autoSend?: boolean;
  } | null>(null);

  const [progress, setProgress] = useState<StudentProgressRecord>(DEFAULT_PROGRESS);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [mockExams, setMockExams] = useState<MockExamRecord[]>(() => {
    try {
      const raw = localStorage.getItem(`${MOCK_EXAM_STORAGE_PREFIX}guest`);
      return raw ? (JSON.parse(raw) as MockExamRecord[]) : [];
    } catch {
      return [];
    }
  });
  const [questionHistory, setQuestionHistory] = useState<Record<string, QuestionHistoryState>>({});
  const [exerciseSubmissions, setExerciseSubmissions] = useState<ExerciseSubmission[]>([]);
  const [achievements, setAchievements] = useState<EarnedAchievement[]>([]);
  const [feedback, setFeedback] = useState<TeacherFeedbackItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [customQuestions, setCustomQuestions] = useState<MCQQuestion[]>([]);
  const [teacherContent, setTeacherContent] = useState<TeacherContentItem[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('algebralab_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const loadGuestState = useCallback(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          progress?: StudentProgressRecord;
          attempts?: QuizAttempt[];
          questionHistory?: Record<string, QuestionHistoryState>;
          exerciseSubmissions?: ExerciseSubmission[];
          achievements?: EarnedAchievement[];
        };
        setProgress(parsed.progress ?? DEFAULT_PROGRESS);
        setAttempts(parsed.attempts ?? []);
        setQuestionHistory(parsed.questionHistory ?? {});
        setExerciseSubmissions(parsed.exerciseSubmissions ?? []);
        setAchievements(parsed.achievements ?? []);
      } else {
        setProgress(DEFAULT_PROGRESS);
        setAttempts([]);
        setQuestionHistory({});
        setExerciseSubmissions([]);
        setAchievements([]);
      }
    } catch {
      setProgress(DEFAULT_PROGRESS);
    }
  }, []);

  const persistGuestState = useCallback(
    (next: {
      progress: StudentProgressRecord;
      attempts: QuizAttempt[];
      questionHistory: Record<string, QuestionHistoryState>;
      exerciseSubmissions: ExerciseSubmission[];
      achievements: EarnedAchievement[];
    }) => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
    },
    []
  );

  const refreshState = useCallback(async () => {
    try {
      const sup = await api.getSupplements();
      setCustomQuestions(sup.customQuestions);
      setTeacherContent(sup.teacherContent);
    } catch {
      // Ignore transient
    }

    try {
      const me = await api.getMe();
      setUser(me.user);
      if (me.user) {
        const bundle = await api.getStudentState();
        setProgress(bundle.progress);
        setAttempts(bundle.attempts);
        setQuestionHistory(bundle.questionHistory);
        setExerciseSubmissions(bundle.exerciseSubmissions);
        setAchievements(bundle.achievements);
        setFeedback(bundle.feedback);
        setAssignments(bundle.assignments);
        setCustomQuestions(bundle.customQuestions);
        setTeacherContent(bundle.teacherContent);
        try {
          const rawMocks = localStorage.getItem(`${MOCK_EXAM_STORAGE_PREFIX}${me.user.id}`);
          setMockExams(rawMocks ? (JSON.parse(rawMocks) as MockExamRecord[]) : []);
        } catch {
          setMockExams([]);
        }
      } else {
        loadGuestState();
        try {
          const rawMocks = localStorage.getItem(`${MOCK_EXAM_STORAGE_PREFIX}guest`);
          setMockExams(rawMocks ? (JSON.parse(rawMocks) as MockExamRecord[]) : []);
        } catch {
          setMockExams([]);
        }
        setFeedback([]);
        setAssignments([]);
      }
    } catch {
      loadGuestState();
    } finally {
      setAuthLoading(false);
    }
  }, [loadGuestState]);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Evaluate and award verified achievements dynamically
  const evaluateBadges = useCallback(
    async (
      nextProg: StudentProgressRecord,
      nextAttempts: QuizAttempt[],
      nextExercises: ExerciseSubmission[],
      currentBadges: EarnedAchievement[]
    ) => {
      const candidates: Omit<EarnedAchievement, 'earnedAt'>[] = [];
      if (nextProg.completedSubsections.length >= 1) {
        candidates.push({
          id: 'first_module',
          title: 'Axiom Initiate',
          description: 'Completed your first Algebra II curriculum subsection.',
        });
      }
      if (nextProg.completedSubsections.length >= 8) {
        candidates.push({
          id: 'curriculum_explorer',
          title: 'Structure Scholar',
          description: 'Completed 8 curriculum subsections across multiple algebraic families.',
        });
      }
      if (nextProg.completedSubsections.length >= 24) {
        candidates.push({
          id: 'artifact_master',
          title: 'Artifact 1 Laureate',
          description: 'Completed all 24 subsections across Finite Abelian, Permutation, and Dihedral Groups.',
        });
      }
      if (nextAttempts.some((a) => a.percentage >= 80)) {
        candidates.push({
          id: 'quiz_distinction',
          title: 'Theorem Verified',
          description: 'Achieved 80% or higher on a randomized self-assessment quiz.',
        });
      }
      if (nextAttempts.some((a) => a.percentage === 100)) {
        candidates.push({
          id: 'perfect_proof',
          title: 'Exact Isomorphism',
          description: 'Scored 100% on a subsection self-assessment without errors.',
        });
      }
      if (nextAttempts.some((a) => a.subsectionId.startsWith('m3-') && a.percentage >= 70)) {
        candidates.push({
          id: 'abelian_classifier',
          title: 'Order-72 Architect',
          description: 'Demonstrated proficiency classifying finite abelian groups.',
        });
      }
      if (nextAttempts.some((a) => a.subsectionId.startsWith('m4-') && a.percentage >= 70)) {
        candidates.push({
          id: 'permutation_analyst',
          title: 'Cycle & Parity Master',
          description: 'Mastered disjoint cycle decomposition and alternating group parity.',
        });
      }
      if (nextAttempts.some((a) => a.subsectionId.startsWith('m5-') && a.percentage >= 70)) {
        candidates.push({
          id: 'dihedral_symmetrist',
          title: 'Dihedral Symmetrist',
          description: 'Mastered Dₙ rotations ρᵏ and reflections μρᵏ cleanly.',
        });
      }
      if (nextExercises.filter((e) => e.isCorrect).length >= 5) {
        candidates.push({
          id: 'problem_solver',
          title: 'Guided Problem Solver',
          description: 'Solved at least 5 interactive exercises in the Exercise Centre.',
        });
      }
      if (
        nextExercises.some(
          (e) => e.exerciseId.startsWith('mockexam-') && e.isCorrect
        )
      ) {
        candidates.push({
          id: 'mock_exam_scholar',
          title: 'Mock Exam Distinction',
          description: 'Scored 75% or higher on a timed Artifact 1 Mock Examination.',
        });
      }
      if (
        nextExercises.some(
          (e) => e.exerciseId.startsWith('revision-drill-') && e.isCorrect
        )
      ) {
        candidates.push({
          id: 'revision_strategist',
          title: 'Targeted Revision Strategist',
          description: 'Completed a targeted weak-topic drill in the Personal Revision Centre with 70%+ accuracy.',
        });
      }

      const existingIds = new Set(currentBadges.map((b) => b.id));
      const newlyEarned = candidates
        .filter((c) => !existingIds.has(c.id))
        .map((c) => ({ ...c, earnedAt: new Date().toISOString() }));

      if (newlyEarned.length === 0) return currentBadges;
      const merged = [...currentBadges, ...newlyEarned];
      setAchievements(merged);
      if (user) {
        await api.syncAchievements(newlyEarned).catch(() => {});
      }
      return merged;
    },
    [user]
  );

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setUser(res.user);
    setAuthModalOpen(false);
    await refreshState();
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register(name, email, password);
    setUser(res.user);
    setAuthModalOpen(false);
    await refreshState();
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    await refreshState();
  };

  const openLearnSubsection = useCallback((subsectionId: string) => {
    setSelectedSubsectionId(subsectionId);
    setActiveNav('learn');
  }, []);

  const openQuizForSubsection = useCallback((subsectionId: string) => {
    setQuizTargetSubsectionId(subsectionId);
    setActiveNav('assessment');
  }, []);

  const updateProgressInternal = async (updater: (prev: StudentProgressRecord) => StudentProgressRecord) => {
    const nextProg = updater(progress);
    setProgress(nextProg);
    const nextBadges = await evaluateBadges(nextProg, attempts, exerciseSubmissions, achievements);
    if (user) {
      await api.saveProgress(nextProg).catch(() => {});
    } else {
      persistGuestState({
        progress: nextProg,
        attempts,
        questionHistory,
        exerciseSubmissions,
        achievements: nextBadges,
      });
    }
  };

  const toggleCompletedSubsection = async (subsectionId: string) => {
    await updateProgressInternal((prev) => {
      const exists = prev.completedSubsections.includes(subsectionId);
      return {
        ...prev,
        completedSubsections: exists
          ? prev.completedSubsections.filter((id) => id !== subsectionId)
          : [...prev.completedSubsections, subsectionId],
        lastVisitedSubsectionId: subsectionId,
      };
    });
  };

  const toggleBookmark = async (subsectionId: string) => {
    await updateProgressInternal((prev) => {
      const exists = prev.bookmarks.includes(subsectionId);
      return {
        ...prev,
        bookmarks: exists
          ? prev.bookmarks.filter((id) => id !== subsectionId)
          : [...prev.bookmarks, subsectionId],
      };
    });
  };

  const saveNote = async (subsectionId: string, note: string) => {
    await updateProgressInternal((prev) => ({
      ...prev,
      notes: { ...prev.notes, [subsectionId]: note },
    }));
  };

  const recordTimeSpent = async (subsectionId: string, addSeconds: number) => {
    await updateProgressInternal((prev) => ({
      ...prev,
      timeSpentSeconds: {
        ...prev.timeSpentSeconds,
        [subsectionId]: (prev.timeSpentSeconds[subsectionId] ?? 0) + addSeconds,
      },
      lastVisitedSubsectionId: subsectionId,
    }));
  };

  const submitQuizAttempt = async (
    attempt: Omit<QuizAttempt, 'id' | 'studentId' | 'completedAt'>,
    historyState: QuestionHistoryState
  ) => {
    const nextHistory = { ...questionHistory, [historyState.subsectionId]: historyState };
    setQuestionHistory(nextHistory);

    let savedAttempt: QuizAttempt = {
      ...attempt,
      id: `local-${Date.now()}`,
      studentId: user?.id ?? 'guest',
      completedAt: new Date().toISOString(),
    };

    if (user) {
      const res = await api.saveQuizAttempt(attempt, historyState);
      savedAttempt = res.attempt;
    }

    const nextAttempts = [...attempts, savedAttempt];
    setAttempts(nextAttempts);
    const nextBadges = await evaluateBadges(progress, nextAttempts, exerciseSubmissions, achievements);

    if (!user) {
      persistGuestState({
        progress,
        attempts: nextAttempts,
        questionHistory: nextHistory,
        exerciseSubmissions,
        achievements: nextBadges,
      });
    }
  };

  const submitExercise = async (
    submission: Omit<ExerciseSubmission, 'id' | 'studentId' | 'submittedAt'>
  ) => {
    let saved: ExerciseSubmission = {
      ...submission,
      id: `local-ex-${Date.now()}`,
      studentId: user?.id ?? 'guest',
      submittedAt: new Date().toISOString(),
    };
    if (user) {
      const res = await api.saveExerciseSubmission(submission);
      saved = res.submission;
    }
    const nextExercises = [...exerciseSubmissions, saved];
    setExerciseSubmissions(nextExercises);
    const nextBadges = await evaluateBadges(progress, attempts, nextExercises, achievements);
    if (!user) {
      persistGuestState({
        progress,
        attempts,
        questionHistory,
        exerciseSubmissions: nextExercises,
        achievements: nextBadges,
      });
    }
  };

  const launchTutor = useCallback(
    (opts: {
      prompt: string;
      mode?: TutorMode;
      contextTitle?: string;
      autoSend?: boolean;
      openPage?: boolean;
    }) => {
      setTutorRequest({
        id: Date.now(),
        prompt: opts.prompt,
        mode: opts.mode ?? 'general',
        contextTitle: opts.contextTitle,
        autoSend: opts.autoSend ?? true,
      });
      if (opts.openPage) {
        setActiveNav('tutor');
      } else {
        setTutorOpen(true);
      }
    },
    []
  );

  const saveMockExam = async (record: MockExamRecord) => {
    const nextMocks = [record, ...mockExams].slice(0, 20);
    setMockExams(nextMocks);
    const key = `${MOCK_EXAM_STORAGE_PREFIX}${user?.id ?? 'guest'}`;
    localStorage.setItem(key, JSON.stringify(nextMocks));
    await submitExercise({
      exerciseId: `mockexam-${record.id}`,
      title: record.examTitle,
      difficulty: 'Challenge',
      answer: `${record.score}/${record.total} (${record.percentage}%)`,
      isCorrect: record.percentage >= 75,
      hintsUsed: 0,
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        theme,
        toggleTheme,
        activeNav,
        setActiveNav,
        selectedSubsectionId,
        setSelectedSubsectionId,
        quizTargetSubsectionId,
        setQuizTargetSubsectionId,
        openLearnSubsection,
        openQuizForSubsection,
        cayleySpec,
        setCayleySpec,
        openCayleyForSpec: (spec: CayleyGroupKind) => {
          setCayleySpec(spec);
          setActiveNav('cayley');
        },
        authModalOpen,
        setAuthModalOpen,
        tutorOpen,
        setTutorOpen,
        tutorRequest,
        launchTutor,
        progress,
        attempts,
        mockExams,
        questionHistory,
        exerciseSubmissions,
        achievements,
        feedback,
        assignments,
        customQuestions,
        teacherContent,
        login,
        register,
        logout,
        refreshState,
        toggleCompletedSubsection,
        toggleBookmark,
        saveNote,
        recordTimeSpent,
        submitQuizAttempt,
        submitExercise,
        saveMockExam,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
