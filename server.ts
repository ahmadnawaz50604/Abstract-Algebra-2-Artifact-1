import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
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
} from './src/types/algebra.ts';

dotenv.config();

const ADMIN_EMAIL = 'ahmadnawaz50604@gmail.com';
const IS_SERVERLESS = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION
);
const DATA_DIR = IS_SERVERLESS
  ? path.join(os.tmpdir(), 'algebralab-data')
  : path.resolve(process.cwd(), '.data');
const DB_PATH = path.join(DATA_DIR, 'algebralab-db.json');
const SECRET_PATH = path.join(DATA_DIR, '.session-secret');

let memoryDbCache: DatabaseSchema | null = null;
let memorySecretCache: string | null = null;

interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastActiveAt: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  progress: Record<string, StudentProgressRecord>;
  quizAttempts: QuizAttempt[];
  questionHistory: Record<string, Record<string, QuestionHistoryState>>; // studentId -> subsectionId -> state
  exerciseSubmissions: ExerciseSubmission[];
  achievements: Record<string, EarnedAchievement[]>;
  assignments: AssignmentRecord[];
  customQuestions: MCQQuestion[];
  questionVersions: QuestionVersionRecord[];
  feedback: TeacherFeedbackItem[];
  teacherContent: TeacherContentItem[];
  auditLogs: AuditLogEntry[];
}

function ensureDataDir(): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return true;
  } catch {
    return false;
  }
}

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    return process.env.SESSION_SECRET;
  }
  if (memorySecretCache) {
    return memorySecretCache;
  }
  if (IS_SERVERLESS) {
    const seed =
      process.env.VERCEL_PROJECT_ID ||
      process.env.VERCEL_URL ||
      'algebralab-serverless-ephemeral-secret';
    memorySecretCache = crypto.createHash('sha256').update(seed).digest('hex');
    return memorySecretCache;
  }
  try {
    if (ensureDataDir()) {
      if (fs.existsSync(SECRET_PATH)) {
        memorySecretCache = fs.readFileSync(SECRET_PATH, 'utf8').trim();
        if (memorySecretCache) return memorySecretCache;
      }
      const secret = crypto.randomBytes(32).toString('hex');
      fs.writeFileSync(SECRET_PATH, secret, { mode: 0o600 });
      memorySecretCache = secret;
      return secret;
    }
  } catch {
    // Fall back to in-memory secret if filesystem is read-only
  }
  memorySecretCache = crypto.randomBytes(32).toString('hex');
  return memorySecretCache;
}

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt ?? crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { hash, salt: actualSalt };
}

function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const candidate = crypto.scryptSync(password, salt, 64);
  const existing = Buffer.from(storedHash, 'hex');
  if (candidate.length !== existing.length) return false;
  return crypto.timingSafeEqual(candidate, existing);
}

function toPublicUser(u: StoredUser): PublicUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
    lastActiveAt: u.lastActiveAt,
  };
}

function createInitialDb(): DatabaseSchema {
  const now = new Date().toISOString();
  const earlier = new Date(Date.now() - 86400000 * 3).toISOString();
  const demoStudentPass = hashPassword('AlgebraStudent!2026');
  const demoTeacherPass = hashPassword('AlgebraFaculty!2026');

  const users: StoredUser[] = [
    {
      id: 'stu-demo-1',
      email: 'amina.rashid@university.edu',
      name: 'Amina Rashid',
      role: 'student',
      passwordHash: demoStudentPass.hash,
      salt: demoStudentPass.salt,
      createdAt: earlier,
      lastActiveAt: now,
    },
    {
      id: 'stu-demo-2',
      email: 'david.okafor@university.edu',
      name: 'David Okafor',
      role: 'student',
      passwordHash: demoStudentPass.hash,
      salt: demoStudentPass.salt,
      createdAt: earlier,
      lastActiveAt: now,
    },
    {
      id: 'tea-demo-1',
      email: 'prof.halima@university.edu',
      name: 'Dr. Halima Mansoor',
      role: 'teacher',
      passwordHash: demoTeacherPass.hash,
      salt: demoTeacherPass.salt,
      createdAt: earlier,
      lastActiveAt: now,
    },
  ];

  return {
    users,
    progress: {
      'stu-demo-1': {
        completedSubsections: ['m1-s1', 'm1-s2', 'm2-s1', 'm3-s1', 'm5-s1'],
        bookmarks: ['m3-s3', 'm5-s2'],
        notes: {
          'm5-s2': 'Remember dihedral identity rotation is 1 and ρᵏμ = μρⁿ⁻ᵏ (never use r or s).',
        },
        timeSpentSeconds: { 'm1-s1': 640, 'm2-s1': 720, 'm5-s1': 580 },
        lastVisitedSubsectionId: 'm5-s2',
      },
      'stu-demo-2': {
        completedSubsections: ['m1-s1', 'm4-s1'],
        bookmarks: ['m4-s2'],
        notes: {},
        timeSpentSeconds: { 'm1-s1': 420, 'm4-s1': 510 },
        lastVisitedSubsectionId: 'm4-s2',
      },
    },
    quizAttempts: [
      {
        id: 'att-seed-1',
        studentId: 'stu-demo-1',
        subsectionId: 'm3-s1',
        moduleId: 'm3',
        mode: 'untimed',
        score: 9,
        total: 10,
        percentage: 90,
        durationSeconds: 310,
        cycleNumber: 1,
        completedAt: earlier,
        items: [],
      },
      {
        id: 'att-seed-2',
        studentId: 'stu-demo-1',
        subsectionId: 'm5-s2',
        moduleId: 'm5',
        mode: 'timed',
        score: 5,
        total: 10,
        percentage: 50,
        durationSeconds: 420,
        cycleNumber: 1,
        completedAt: now,
        items: [],
      },
      {
        id: 'att-seed-3',
        studentId: 'stu-demo-2',
        subsectionId: 'm4-s2',
        moduleId: 'm4',
        mode: 'untimed',
        score: 6,
        total: 10,
        percentage: 60,
        durationSeconds: 390,
        cycleNumber: 1,
        completedAt: now,
        items: [],
      },
    ],
    questionHistory: {},
    exerciseSubmissions: [],
    achievements: {
      'stu-demo-1': [
        {
          id: 'first_module',
          title: 'Axiom Initiate',
          description: 'Completed your first Algebra II curriculum subsection.',
          earnedAt: earlier,
        },
      ],
    },
    assignments: [
      {
        id: 'asgn-1',
        title: 'Week 2: Classification of Order 72 & Dihedral Relations',
        description:
          'Complete the Order 72 classification mastery quiz and verify D₅ reduction identities using 1, ρ, and μ.',
        subsectionId: 'm3-s3',
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
        questionCount: 10,
        timeLimitMinutes: 15,
        createdBy: 'tea-demo-1',
        createdAt: earlier,
        assignedStudentIds: [],
      },
    ],
    customQuestions: [],
    questionVersions: [],
    feedback: [
      {
        id: 'fb-seed-1',
        studentId: 'stu-demo-1',
        teacherId: 'tea-demo-1',
        teacherName: 'Dr. Halima Mansoor',
        topicId: 'm5-s2',
        message:
          'Strong progress on Abelian classifications! Review the dihedral commutation rule ρᵏμ = μρⁿ⁻ᵏ in Module 5.2 before the timed quiz.',
        createdAt: now,
      },
    ],
    teacherContent: [
      {
        id: 'tc-seed-1',
        subsectionId: 'm5-s2',
        title: 'Faculty Note: Avoiding Left-vs-Right Composition Traps in Dₙ',
        kind: 'note',
        body: 'In standard dihedral composition, operations are evaluated right-to-left: in (μρ²)(μρ), act by μρ first, then μρ². Algebraically, commute ρ² past μ using ρ²μ = μρⁿ⁻² so μ² cancels to 1.',
        createdBy: 'tea-demo-1',
        authorName: 'Dr. Halima Mansoor',
        createdAt: earlier,
      },
    ],
    auditLogs: [],
  };
}

function loadDb(): DatabaseSchema {
  try {
    if (ensureDataDir() && fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      const parsed = JSON.parse(raw) as DatabaseSchema;
      memoryDbCache = parsed;
      return parsed;
    }
  } catch {
    // Fall back cleanly to memory cache or fresh seeded DB
  }
  if (memoryDbCache) {
    return memoryDbCache;
  }
  const initial = createInitialDb();
  memoryDbCache = initial;
  saveDb(initial);
  return initial;
}

function saveDb(db: DatabaseSchema) {
  memoryDbCache = db;
  try {
    if (!ensureDataDir()) return;
    const tmpPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf8');
    fs.renameSync(tmpPath, DB_PATH);
  } catch {
    // On read-only filesystems, keep in-memory state active without crashing requests
  }
}

const SESSION_SECRET = getSessionSecret();
const SESSION_COOKIE = 'algebralab_session';

function signSessionToken(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, iat: Date.now() }),
    'utf8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      uid: string;
    };
    return parsed.uid || null;
  } catch {
    return null;
  }
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  const map: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const k = part.slice(0, idx).trim();
      const v = decodeURIComponent(part.slice(idx + 1).trim());
      map[k] = v;
    }
  }
  return map;
}

interface AuthedRequest extends Request {
  currentUser?: StoredUser;
}

function attachUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE];
  if (token) {
    const uid = verifySessionToken(token);
    if (uid) {
      const db = loadDb();
      const found = db.users.find((u) => u.id === uid);
      if (found) {
        req.currentUser = found;
      }
    }
  }
  next();
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.currentUser) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  next();
}

function requireRole(...roles: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (!roles.includes(req.currentUser.role)) {
      res.status(403).json({ error: 'Insufficient role permissions.' });
      return;
    }
    next();
  };
}

function setSessionCookie(res: Response, userId: string) {
  const token = signSessionToken(userId);
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function createApiApp(): express.Express {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '1mb' }));
  app.use(attachUser);

  // Health
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Auth routes
  app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body as {
      email?: string;
      password?: string;
      name?: string;
    };
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ error: 'Enter a valid email address.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters.' });
      return;
    }

    const db = loadDb();
    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const role: UserRole = cleanEmail === ADMIN_EMAIL ? 'admin' : 'student';
    const { hash, salt } = hashPassword(password);
    const now = new Date().toISOString();
    const user: StoredUser = {
      id: `usr-${crypto.randomUUID()}`,
      email: cleanEmail,
      name: cleanName.slice(0, 80),
      role,
      passwordHash: hash,
      salt,
      createdAt: now,
      lastActiveAt: now,
    };
    db.users.push(user);
    db.progress[user.id] = {
      completedSubsections: [],
      bookmarks: [],
      notes: {},
      timeSpentSeconds: {},
    };
    db.achievements[user.id] = [];
    saveDb(db);
    setSessionCookie(res, user.id);
    res.status(201).json({ user: toPublicUser(user) });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const db = loadDb();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }
    if (cleanEmail === ADMIN_EMAIL && user.role !== 'admin') {
      user.role = 'admin';
    }
    user.lastActiveAt = new Date().toISOString();
    saveDb(db);
    setSessionCookie(res, user.id);
    res.json({ user: toPublicUser(user) });
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.json({ ok: true });
  });

  app.get('/api/auth/me', (req: AuthedRequest, res) => {
    if (!req.currentUser) {
      res.json({ user: null });
      return;
    }
    res.json({ user: toPublicUser(req.currentUser) });
  });

  // Student learning state bundle
  app.get('/api/student/state', requireAuth, (req: AuthedRequest, res) => {
    const uid = req.currentUser!.id;
    const db = loadDb();
    const progress: StudentProgressRecord = db.progress[uid] ?? {
      completedSubsections: [],
      bookmarks: [],
      notes: {},
      timeSpentSeconds: {},
    };
    const attempts = db.quizAttempts.filter((a) => a.studentId === uid);
    const questionHistory = db.questionHistory[uid] ?? {};
    const exerciseSubmissions = db.exerciseSubmissions.filter((e) => e.studentId === uid);
    const achievements = db.achievements[uid] ?? [];
    const feedback = db.feedback.filter((f) => f.studentId === uid);
    const assignments = db.assignments.filter(
      (a) => a.assignedStudentIds.length === 0 || a.assignedStudentIds.includes(uid)
    );
    res.json({
      progress,
      attempts,
      questionHistory,
      exerciseSubmissions,
      achievements,
      feedback,
      assignments,
      customQuestions: db.customQuestions,
      teacherContent: db.teacherContent,
    });
  });

  // Public supplemental content + custom questions for unauthenticated learners too
  app.get('/api/curriculum/supplements', (_req, res) => {
    const db = loadDb();
    res.json({
      customQuestions: db.customQuestions,
      teacherContent: db.teacherContent,
    });
  });

  app.post('/api/student/progress', requireAuth, (req: AuthedRequest, res) => {
    const uid = req.currentUser!.id;
    const incoming = req.body as Partial<StudentProgressRecord>;
    const db = loadDb();
    const current = db.progress[uid] ?? {
      completedSubsections: [],
      bookmarks: [],
      notes: {},
      timeSpentSeconds: {},
    };
    db.progress[uid] = {
      completedSubsections: Array.isArray(incoming.completedSubsections)
        ? incoming.completedSubsections
        : current.completedSubsections,
      bookmarks: Array.isArray(incoming.bookmarks) ? incoming.bookmarks : current.bookmarks,
      notes: incoming.notes ?? current.notes,
      timeSpentSeconds: incoming.timeSpentSeconds ?? current.timeSpentSeconds,
      lastVisitedSubsectionId:
        incoming.lastVisitedSubsectionId ?? current.lastVisitedSubsectionId,
    };
    const u = db.users.find((x) => x.id === uid);
    if (u) u.lastActiveAt = new Date().toISOString();
    saveDb(db);
    res.json({ progress: db.progress[uid] });
  });

  app.post('/api/student/quiz-attempt', requireAuth, (req: AuthedRequest, res) => {
    const uid = req.currentUser!.id;
    const { attempt, historyState } = req.body as {
      attempt: Omit<QuizAttempt, 'id' | 'studentId' | 'completedAt'>;
      historyState: QuestionHistoryState;
    };
    if (!attempt || !historyState) {
      res.status(400).json({ error: 'Missing attempt or historyState payload.' });
      return;
    }
    const db = loadDb();
    const savedAttempt: QuizAttempt = {
      ...attempt,
      id: `att-${crypto.randomUUID()}`,
      studentId: uid,
      completedAt: new Date().toISOString(),
    };
    db.quizAttempts.push(savedAttempt);
    if (!db.questionHistory[uid]) db.questionHistory[uid] = {};
    db.questionHistory[uid][historyState.subsectionId] = historyState;
    saveDb(db);
    res.status(201).json({ attempt: savedAttempt, historyState });
  });

  app.post('/api/student/exercise', requireAuth, (req: AuthedRequest, res) => {
    const uid = req.currentUser!.id;
    const body = req.body as Omit<ExerciseSubmission, 'id' | 'studentId' | 'submittedAt'>;
    const db = loadDb();
    const record: ExerciseSubmission = {
      ...body,
      id: `ex-${crypto.randomUUID()}`,
      studentId: uid,
      submittedAt: new Date().toISOString(),
    };
    db.exerciseSubmissions.push(record);
    saveDb(db);
    res.status(201).json({ submission: record });
  });

  app.post('/api/student/achievements', requireAuth, (req: AuthedRequest, res) => {
    const uid = req.currentUser!.id;
    const { badges } = req.body as { badges: EarnedAchievement[] };
    if (!Array.isArray(badges)) {
      res.status(400).json({ error: 'badges array required.' });
      return;
    }
    const db = loadDb();
    const existing = db.achievements[uid] ?? [];
    const seenIds = new Set(existing.map((b) => b.id));
    for (const b of badges) {
      if (!seenIds.has(b.id)) {
        existing.push(b);
        seenIds.add(b.id);
      }
    }
    db.achievements[uid] = existing;
    saveDb(db);
    res.json({ achievements: existing });
  });

  // Teacher & Admin Routes
  app.get('/api/teacher/overview', requireRole('teacher', 'admin'), (_req, res) => {
    const db = loadDb();
    const users = db.users.map(toPublicUser);
    const students = users.filter((u) => u.role === 'student');
    res.json({
      users,
      students,
      progress: db.progress,
      quizAttempts: db.quizAttempts,
      exerciseSubmissions: db.exerciseSubmissions,
      assignments: db.assignments,
      customQuestions: db.customQuestions,
      questionVersions: db.questionVersions,
      feedback: db.feedback,
      teacherContent: db.teacherContent,
      auditLogs: db.auditLogs,
    });
  });

  app.post('/api/teacher/feedback', requireRole('teacher', 'admin'), (req: AuthedRequest, res) => {
    const { studentId, topicId, message } = req.body as {
      studentId?: string;
      topicId?: string;
      message?: string;
    };
    if (!studentId || !message?.trim()) {
      res.status(400).json({ error: 'studentId and feedback message are required.' });
      return;
    }
    const db = loadDb();
    const item: TeacherFeedbackItem = {
      id: `fb-${crypto.randomUUID()}`,
      studentId,
      teacherId: req.currentUser!.id,
      teacherName: req.currentUser!.name,
      topicId,
      message: message.trim().slice(0, 1500),
      createdAt: new Date().toISOString(),
    };
    db.feedback.push(item);
    saveDb(db);
    res.status(201).json({ feedback: item });
  });

  app.post('/api/teacher/assignments', requireRole('teacher', 'admin'), (req: AuthedRequest, res) => {
    const { title, description, subsectionId, dueDate, questionCount, timeLimitMinutes, assignedStudentIds } =
      req.body as Partial<AssignmentRecord>;
    if (!title?.trim() || !subsectionId || !dueDate) {
      res.status(400).json({ error: 'Title, subsectionId, and dueDate are required.' });
      return;
    }
    const db = loadDb();
    const record: AssignmentRecord = {
      id: `asgn-${crypto.randomUUID()}`,
      title: title.trim(),
      description: (description ?? '').trim(),
      subsectionId,
      dueDate,
      questionCount: questionCount ?? 10,
      timeLimitMinutes: timeLimitMinutes ?? null,
      createdBy: req.currentUser!.id,
      createdAt: new Date().toISOString(),
      assignedStudentIds: Array.isArray(assignedStudentIds) ? assignedStudentIds : [],
    };
    db.assignments.push(record);
    saveDb(db);
    res.status(201).json({ assignment: record });
  });

  app.delete('/api/teacher/assignments/:id', requireRole('teacher', 'admin'), (req, res) => {
    const db = loadDb();
    db.assignments = db.assignments.filter((a) => a.id !== req.params.id);
    saveDb(db);
    res.json({ ok: true });
  });

  app.post('/api/teacher/questions', requireRole('teacher', 'admin'), (req: AuthedRequest, res) => {
    const q = req.body as Partial<MCQQuestion>;
    if (!q.prompt?.trim() || !q.subsectionId || !Array.isArray(q.options) || q.options.length !== 4) {
      res.status(400).json({ error: 'Valid prompt, subsectionId, and 4 options are required.' });
      return;
    }
    const db = loadDb();
    const now = new Date().toISOString();
    const question: MCQQuestion = {
      id: q.id || `cq-${crypto.randomUUID()}`,
      subsectionId: q.subsectionId,
      moduleId: q.subsectionId.split('-')[0],
      difficulty: q.difficulty ?? 'Intermediate',
      category: q.category ?? 'calculation',
      prompt: q.prompt.trim(),
      options: q.options as [string, string, string, string],
      correctIndex: (q.correctIndex ?? 0) as 0 | 1 | 2 | 3,
      explanation: (q.explanation ?? '').trim(),
      tags: Array.isArray(q.tags) ? q.tags : ['faculty'],
      version: 1,
      createdBy: req.currentUser!.id,
      isCustom: true,
    };
    const existingIdx = db.customQuestions.findIndex((item) => item.id === question.id);
    if (existingIdx >= 0) {
      const prev = db.customQuestions[existingIdx];
      const nextVersion = (prev.version ?? 1) + 1;
      db.questionVersions.push({
        questionId: prev.id,
        version: prev.version ?? 1,
        updatedAt: now,
        updatedBy: req.currentUser!.name,
        snapshot: prev,
      });
      question.version = nextVersion;
      db.customQuestions[existingIdx] = question;
    } else {
      db.customQuestions.push(question);
    }
    saveDb(db);
    res.status(201).json({ question });
  });

  app.delete('/api/teacher/questions/:id', requireRole('teacher', 'admin'), (req: AuthedRequest, res) => {
    const db = loadDb();
    const prev = db.customQuestions.find((q) => q.id === req.params.id);
    if (prev) {
      db.questionVersions.push({
        questionId: prev.id,
        version: prev.version ?? 1,
        updatedAt: new Date().toISOString(),
        updatedBy: req.currentUser!.name,
        snapshot: prev,
      });
      db.customQuestions = db.customQuestions.filter((q) => q.id !== req.params.id);
      saveDb(db);
    }
    res.json({ ok: true });
  });

  app.post('/api/teacher/content', requireRole('teacher', 'admin'), (req: AuthedRequest, res) => {
    const { subsectionId, title, kind, body } = req.body as Partial<TeacherContentItem>;
    if (!subsectionId || !title?.trim() || !body?.trim()) {
      res.status(400).json({ error: 'subsectionId, title, and body are required.' });
      return;
    }
    const db = loadDb();
    const item: TeacherContentItem = {
      id: `tc-${crypto.randomUUID()}`,
      subsectionId,
      title: title.trim(),
      kind: kind ?? 'note',
      body: body.trim(),
      createdBy: req.currentUser!.id,
      authorName: req.currentUser!.name,
      createdAt: new Date().toISOString(),
    };
    db.teacherContent.push(item);
    saveDb(db);
    res.status(201).json({ item });
  });

  app.delete('/api/teacher/content/:id', requireRole('teacher', 'admin'), (req, res) => {
    const db = loadDb();
    db.teacherContent = db.teacherContent.filter((c) => c.id !== req.params.id);
    saveDb(db);
    res.json({ ok: true });
  });

  // Admin-only RBAC role assignment
  app.post('/api/admin/users/:id/role', requireRole('admin'), (req: AuthedRequest, res) => {
    const { role } = req.body as { role?: UserRole };
    if (!role || !['student', 'teacher', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Valid role (student, teacher, admin) required.' });
      return;
    }
    const db = loadDb();
    const target = db.users.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    const prevRole = target.role;
    target.role = role;
    db.auditLogs.push({
      id: `aud-${crypto.randomUUID()}`,
      actorId: req.currentUser!.id,
      actorEmail: req.currentUser!.email,
      action: 'ROLE_CHANGE',
      targetId: target.id,
      details: `Changed ${target.email} role from ${prevRole} to ${role}`,
      createdAt: new Date().toISOString(),
    });
    saveDb(db);
    res.json({ user: toPublicUser(target) });
  });

  // Server-side AI Mathematics Tutor (Strictly Artifact 1, consistent μ & ρ dihedral notation)
  app.post('/api/tutor', async (req, res) => {
    const {
      question,
      contextTitle,
      mode = 'general',
      history = [],
      studentContext,
    } = req.body as {
      question?: string;
      contextTitle?: string;
      mode?: string;
      history?: { role: 'user' | 'assistant'; text: string }[];
      studentContext?: string;
    };
    if (!question || !question.trim()) {
      res.status(400).json({ error: 'Please enter a mathematical question.' });
      return;
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
      });
      return;
    }

    const modeDirectives: Record<string, string> = {
      explain_definition:
        'TASK MODE: Explain the requested Artifact 1 definition clearly. State the formal mathematical definition, give 1–2 concrete finite group examples, highlight common misconceptions, and verify every calculation explicitly.',
      step_hint:
        'TASK MODE: Provide structured STEP-BY-STEP HINTS ONLY without immediately jumping to the final numerical answer unless the student explicitly asks to verify completion. Guide the student through Step 1, Step 2, and a check question.',
      explain_wrong:
        'TASK MODE: Explain why the student’s chosen answer is mathematically incorrect, pinpoint the exact conceptual or computational mistake, and walk step-by-step to the verified correct answer.',
      similar_exercise:
        'TASK MODE: Generate 1 original, mathematically verified Artifact 1 practice exercise of similar difficulty and topic (not identical numbers/permutations), give a collapsible-style "Hint" section and a "Verified Answer & Solution" section at the bottom. Double-check your own arithmetic before outputting.',
      recommend_lessons:
        'TASK MODE: Using the student assessment history and weak topics provided (or their question topic), recommend the exact relevant Artifact 1 Modules (Modules 1–8) and subsections in AlgebraLab, explain why each helps, and suggest 1 targeted warm-up problem.',
      spot_mistake:
        'TASK MODE: Carefully audit the student’s mathematical reasoning or calculation line-by-line, identify the precise step where an invalid step or notation slip occurred (e.g., forgetting right-to-left composition or non-commutativity ρ^k μ = μ ρ^(n-k)), and show how to repair it.',
      general:
        'TASK MODE: Answer the student’s Artifact 1 question clearly, step-by-step, with exact mathematical rigor.',
    };

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const systemInstruction = `You are the optional AI Mathematics Tutor inside AlgebraLab, strictly focused on ARTIFACT 1 (University Abstract Algebra II):
Artifact 1 Topics (Modules 1–8 ONLY):
1. Fundamentals of Finite Groups (Module 1): group axioms (closure, associativity, identity, inverses), abelian vs nonabelian groups, direct products.
2. Finite Abelian Groups & Classification (Modules 2–3): cyclic groups, element orders in direct products via lcm, fundamental theorem classification into elementary divisors and invariant factors (e.g. Order 72 has p(3)p(2)=6 groups), structural contrasts (e.g. Z_2 x Z_2 vs Z_4).
3. Permutation Groups & Parity (Module 4): S_n, two-row notation, disjoint cycle decomposition, strictly RIGHT-TO-LEFT composition (στ)(x) = σ(τ(x)), cycle inverses, transpositions, even/odd parity, alternating group A_n.
4. Dihedral Groups D_n (Module 5): When explaining dihedral groups, ALWAYS use μ (reflection), ρ (rotation), and identity 1 consistently, with standard elements 1, ρ^k, and μρ^k, and relations ρ^n = 1, μ^2 = 1, ρ^k μ = μ ρ^(n-k). NEVER substitute r, s, σ, or e for dihedral elements.
5. Cyclic Groups & Generators (Module 6): generators of Z_n, Euler's totient φ(n), order formulas ord(a) = n / gcd(n, a), subgroup counts.
6. Cayley Tables & Axiom Verification (Module 7): Latin square property, abelian table symmetry, associativity verification.
7. Real-World Group Modeling & Non-Groups (Module 8): physical/geometric symmetry models and verifying when systems fail closure or invertibility.

AlgebraLab Curriculum Modules Reference (for lesson recommendations):
- Module 1: Fundamentals of Finite Groups (1.1 Group Axioms & Closure, 1.2 Identity, Inverses & Abelian Groups, 1.3 Direct Products & Finite Examples)
- Module 2: Finite Abelian Groups (2.1 Cyclic vs Non-Cyclic Groups, 2.2 Operations & Orders in Direct Products, 2.3 Structural Contrasts: Z₂×Z₂ vs Z₄)
- Module 3: Classification of Finite Abelian Groups (3.1 Prime-Power & Elementary Divisors, 3.2 Invariant-Factor Form & Partitions, 3.3 Full Order-72 Classification)
- Module 4: Permutation Groups & Parity (4.1 Two-Row & Cycle Notation, 4.2 Right-to-Left Composition & Inverses, 4.3 Transpositions, Parity & Aₙ)
- Module 5: Dihedral Groups Dₙ (5.1 Geometric Symmetries (ρ, μ), 5.2 Algebraic Simplification (ρᵏμ = μρⁿ⁻ᵏ), 5.3 Element Orders in Dₙ)
- Module 6: Cyclic Groups & Generators (6.1 Cyclic Subgroups & Order Formula, 6.2 Euler's Totient φ(n) & Generators of Zₙ, 6.3 Cyclic Comparison & Subgroup Lattice)
- Module 7: Cayley Tables & Group Properties (7.1 Reading & Constructing Cayley Tables, 7.2 Latin Square, Identity & Symmetry Tests, 7.3 Structural Comparison via Tables)
- Module 8: Real-World Applications & Modeling (8.1 Symmetry in Architecture, Optics & Puzzles, 8.2 Cyclic Scheduling & Coding Verification, 8.3 Non-Group Counterexamples)

CRITICAL ACCURACY & SCOPE RULES:
- Do NOT invent theorems, theorem numbers, or unverified calculations. Check every arithmetic operation, gcd, lcm, permutation trace, and dihedral commutation carefully before writing it.
- STRICTLY ARTIFACT 1 SCOPE ONLY: Politely decline questions about cosets, Lagrange's Theorem, normal subgroups, quotient/factor groups (G/H), homomorphism/isomorphism theorems, Sylow theorems, or ring theory, explaining that this tutor is focused strictly on Artifact 1.
- Format equations cleanly using LaTeX ($...$ or $$...$$).
${modeDirectives[mode] ?? modeDirectives.general}`;

      const recentTurnContext =
        Array.isArray(history) && history.length > 0
          ? `Recent conversation context:\n${history
              .slice(-4)
              .map((h) => `${h.role === 'user' ? 'Student' : 'Tutor'}: ${h.text}`)
              .join('\n')}\n\n`
          : '';

      const promptParts = [
        contextTitle ? `Active workspace: ${contextTitle}` : '',
        studentContext ? `Student assessment summary: ${studentContext}` : '',
        recentTurnContext,
        `Student request: ${question.trim()}`,
      ]
        .filter(Boolean)
        .join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: promptParts,
        config: {
          systemInstruction,
        },
      });

      res.json({ reply: response.text ?? 'Unable to generate an explanation.' });
    } catch (err) {
      console.error('Gemini Tutor error:', err);
      res.status(500).json({ error: 'Tutor service encountered an error. Please try again.' });
    }
  });

  return app;
}

export async function startServer() {
  const app = createApiApp();

  // Vite dev middleware or static dist serving for local/Node server runs
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`AlgebraLab server listening on http://0.0.0.0:${port}`);
  });
}

const isDirectRun =
  !process.env.VERCEL &&
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  Boolean(process.argv[1]) &&
  /server\.(ts|js|mjs|cjs)$/i.test(process.argv[1]);

if (isDirectRun) {
  startServer();
}
