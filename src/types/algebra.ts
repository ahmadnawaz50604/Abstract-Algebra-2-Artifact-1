export type UserRole = 'student' | 'teacher' | 'admin';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  lastActiveAt: string;
}

export interface LessonSubsection {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  level: 'Beginner' | 'Foundational' | 'Intermediate' | 'University';
  estimatedMinutes: number;
  learningObjectives: string[];
  prerequisites: string[];
  definitions: { term: string; formal: string; latex?: string }[];
  notation: { symbol: string; meaning: string; latex?: string }[];
  theorems: { title: string; statement: string; latex?: string; note?: string }[];
  explanation: string[];
  stepByStepExamples: {
    title: string;
    problem: string;
    steps: string[];
    conclusion: string;
  }[];
  visualConfig: {
    kind:
      | 'group_axioms'
      | 'direct_product'
      | 'abelian_tree_72'
      | 'permutation_cycle'
      | 'dihedral_polygon'
      | 'cyclic_clock'
      | 'cayley_preview'
      | 'real_world_symmetry';
    title: string;
    caption: string;
    defaultN?: number;
    defaultModuli?: number[];
  };
  commonMistakes: { mistake: string; correction: string }[];
  practiceExercises: {
    id: string;
    prompt: string;
    hint: string;
    answer: string;
    solutionSteps: string[];
  }[];
  revisionSummary: string[];
  keywords: string[];
}

export interface CurriculumModule {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  subsections: LessonSubsection[];
}

export type AssessmentDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Challenge';

export interface MCQQuestion {
  id: string;
  subsectionId: string;
  moduleId: string;
  difficulty: AssessmentDifficulty;
  category:
    | 'definition'
    | 'theorem'
    | 'calculation'
    | 'property'
    | 'counterexample'
    | 'application'
    | 'proof';
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  tags: string[];
  version?: number;
  createdBy?: string;
  isCustom?: boolean;
}

export interface QuestionVersionRecord {
  questionId: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
  snapshot: MCQQuestion;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  subsectionId: string;
  moduleId: string;
  mode: 'untimed' | 'timed';
  score: number;
  total: number;
  percentage: number;
  durationSeconds: number;
  cycleNumber: number;
  completedAt: string;
  items: {
    questionId: string;
    prompt: string;
    selectedText: string | null;
    correctText: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface QuestionHistoryState {
  subsectionId: string;
  seenQuestionIds: string[];
  cycleNumber: number;
  totalAttempts: number;
}

export interface ExerciseSubmission {
  id: string;
  studentId: string;
  exerciseId: string;
  title: string;
  difficulty: AssessmentDifficulty;
  answer: string;
  isCorrect: boolean;
  hintsUsed: number;
  submittedAt: string;
}

export interface StudentProgressRecord {
  completedSubsections: string[];
  bookmarks: string[];
  notes: Record<string, string>;
  timeSpentSeconds: Record<string, number>;
  lastVisitedSubsectionId?: string;
}

export interface EarnedAchievement {
  id: string;
  title: string;
  description: string;
  earnedAt: string;
}

export interface TeacherFeedbackItem {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  topicId?: string;
  message: string;
  createdAt: string;
}

export interface AssignmentRecord {
  id: string;
  title: string;
  description: string;
  subsectionId: string;
  dueDate: string;
  questionCount: number;
  timeLimitMinutes: number | null;
  createdBy: string;
  createdAt: string;
  assignedStudentIds: string[]; // empty means all students
}

export interface TeacherContentItem {
  id: string;
  subsectionId: string;
  title: string;
  kind: 'note' | 'example' | 'revision' | 'guided_hint';
  body: string;
  createdBy: string;
  authorName: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export type NavSectionId =
  | 'dashboard'
  | 'learn'
  | 'abelian'
  | 'explorer'
  | 'permutations'
  | 'dihedral'
  | 'cyclic'
  | 'classifier'
  | 'cayley'
  | 'demolab'
  | 'assessment'
  | 'mockexam'
  | 'revision'
  | 'exercises'
  | 'realworld'
  | 'challenge'
  | 'tutor'
  | 'progress'
  | 'achievements'
  | 'teacher'
  | 'help';

export type TutorMode =
  | 'general'
  | 'explain_definition'
  | 'step_hint'
  | 'explain_wrong'
  | 'similar_exercise'
  | 'recommend_lessons'
  | 'spot_mistake';

export interface MockExamRecord {
  id: string;
  examTitle: string;
  score: number;
  total: number;
  percentage: number;
  durationSeconds: number;
  completedAt: string;
  moduleBreakdown: {
    moduleId: string;
    moduleTitle: string;
    correct: number;
    total: number;
  }[];
  missedItems: {
    questionId: string;
    subsectionId: string;
    prompt: string;
    selectedText: string | null;
    correctText: string;
    explanation: string;
  }[];
}

