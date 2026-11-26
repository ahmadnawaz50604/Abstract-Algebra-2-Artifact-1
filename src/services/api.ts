import type {
  AssignmentRecord,
  AuditLogEntry,
  EarnedAchievement,
  ExerciseSubmission,
  MCQQuestion,
  PublicUser,
  QuestionHistoryState,
  QuestionVersionRecord,
  QuizAttempt,
  StudentProgressRecord,
  TeacherContentItem,
  TeacherFeedbackItem,
  UserRole,
} from '../types/algebra.ts';

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export interface StudentStateBundle {
  progress: StudentProgressRecord;
  attempts: QuizAttempt[];
  questionHistory: Record<string, QuestionHistoryState>;
  exerciseSubmissions: ExerciseSubmission[];
  achievements: EarnedAchievement[];
  feedback: TeacherFeedbackItem[];
  assignments: AssignmentRecord[];
  customQuestions: MCQQuestion[];
  teacherContent: TeacherContentItem[];
}

export interface TeacherOverviewBundle {
  users: PublicUser[];
  students: PublicUser[];
  progress: Record<string, StudentProgressRecord>;
  quizAttempts: QuizAttempt[];
  exerciseSubmissions: ExerciseSubmission[];
  assignments: AssignmentRecord[];
  customQuestions: MCQQuestion[];
  questionVersions: QuestionVersionRecord[];
  feedback: TeacherFeedbackItem[];
  teacherContent: TeacherContentItem[];
  auditLogs: AuditLogEntry[];
}

export const api = {
  getMe: () => requestJson<{ user: PublicUser | null }>('/api/auth/me'),
  login: (email: string, password: string) =>
    requestJson<{ user: PublicUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    requestJson<{ user: PublicUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  logout: () => requestJson<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),

  getSupplements: () =>
    requestJson<{ customQuestions: MCQQuestion[]; teacherContent: TeacherContentItem[] }>(
      '/api/curriculum/supplements'
    ),

  getStudentState: () => requestJson<StudentStateBundle>('/api/student/state'),

  saveProgress: (progress: Partial<StudentProgressRecord>) =>
    requestJson<{ progress: StudentProgressRecord }>('/api/student/progress', {
      method: 'POST',
      body: JSON.stringify(progress),
    }),

  saveQuizAttempt: (
    attempt: Omit<QuizAttempt, 'id' | 'studentId' | 'completedAt'>,
    historyState: QuestionHistoryState
  ) =>
    requestJson<{ attempt: QuizAttempt; historyState: QuestionHistoryState }>(
      '/api/student/quiz-attempt',
      {
        method: 'POST',
        body: JSON.stringify({ attempt, historyState }),
      }
    ),

  saveExerciseSubmission: (
    submission: Omit<ExerciseSubmission, 'id' | 'studentId' | 'submittedAt'>
  ) =>
    requestJson<{ submission: ExerciseSubmission }>('/api/student/exercise', {
      method: 'POST',
      body: JSON.stringify(submission),
    }),

  syncAchievements: (badges: EarnedAchievement[]) =>
    requestJson<{ achievements: EarnedAchievement[] }>('/api/student/achievements', {
      method: 'POST',
      body: JSON.stringify({ badges }),
    }),

  getTeacherOverview: () => requestJson<TeacherOverviewBundle>('/api/teacher/overview'),

  postFeedback: (studentId: string, message: string, topicId?: string) =>
    requestJson<{ feedback: TeacherFeedbackItem }>('/api/teacher/feedback', {
      method: 'POST',
      body: JSON.stringify({ studentId, message, topicId }),
    }),

  createAssignment: (payload: {
    title: string;
    description: string;
    subsectionId: string;
    dueDate: string;
    questionCount: number;
    timeLimitMinutes: number | null;
    assignedStudentIds?: string[];
  }) =>
    requestJson<{ assignment: AssignmentRecord }>('/api/teacher/assignments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteAssignment: (id: string) =>
    requestJson<{ ok: boolean }>(`/api/teacher/assignments/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  saveQuestion: (q: Partial<MCQQuestion>) =>
    requestJson<{ question: MCQQuestion }>('/api/teacher/questions', {
      method: 'POST',
      body: JSON.stringify(q),
    }),

  deleteQuestion: (id: string) =>
    requestJson<{ ok: boolean }>(`/api/teacher/questions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  createTeacherContent: (payload: {
    subsectionId: string;
    title: string;
    kind: TeacherContentItem['kind'];
    body: string;
  }) =>
    requestJson<{ item: TeacherContentItem }>('/api/teacher/content', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteTeacherContent: (id: string) =>
    requestJson<{ ok: boolean }>(`/api/teacher/content/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  updateUserRole: (userId: string, role: UserRole) =>
    requestJson<{ user: PublicUser }>(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  askTutor: (
    question: string,
    contextTitle?: string,
    options?: {
      mode?: string;
      history?: { role: 'user' | 'assistant'; text: string }[];
      studentContext?: string;
    }
  ) =>
    requestJson<{ reply: string }>('/api/tutor', {
      method: 'POST',
      body: JSON.stringify({
        question,
        contextTitle,
        mode: options?.mode ?? 'general',
        history: options?.history ?? [],
        studentContext: options?.studentContext,
      }),
    }),
};
