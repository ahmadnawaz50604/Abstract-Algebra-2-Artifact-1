import type { MCQQuestion, QuestionHistoryState } from '../../types/algebra.ts';
import { buildGeneratedQuestionsForAllSubsections } from './computedGenerators.ts';
import { CURATED_CONCEPTUAL_MCQS } from './curatedConceptual.ts';

function buildFullBank(): MCQQuestion[] {
  const combined = [
    ...CURATED_CONCEPTUAL_MCQS,
    ...buildGeneratedQuestionsForAllSubsections(),
  ];
  const seenPrompts = new Set<string>();
  const deduped: MCQQuestion[] = [];
  for (const q of combined) {
    const key = `${q.subsectionId}::${q.prompt.trim().toLowerCase()}`;
    if (!seenPrompts.has(key)) {
      seenPrompts.add(key);
      deduped.push(q);
    }
  }
  return deduped;
}

export const STATIC_QUESTION_BANK: MCQQuestion[] = buildFullBank();

export function getQuestionsForSubsection(
  subsectionId: string,
  customQuestions: MCQQuestion[] = []
): MCQQuestion[] {
  const base = STATIC_QUESTION_BANK.filter((q) => q.subsectionId === subsectionId);
  const custom = customQuestions.filter((q) => q.subsectionId === subsectionId);
  return [...base, ...custom];
}

export interface ShuffledQuizQuestion {
  originalId: string;
  question: MCQQuestion;
  shuffledOptions: [string, string, string, string];
  correctShuffledIndex: number;
}

function fisherYates<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Selects up to `count` questions strictly from UNSEEN questions for (student, subsection).
 * Resets cycle ONLY once the entire subsection bank has been exhausted.
 * Shuffles both question order and each question's options while preserving exact correct answer mapping.
 */
export function selectQuizBatch(
  subsectionId: string,
  history: QuestionHistoryState | undefined,
  customQuestions: MCQQuestion[] = [],
  count = 10
): {
  questions: ShuffledQuizQuestion[];
  nextHistoryPreview: QuestionHistoryState;
  cycleResetOccurred: boolean;
  remainingInCycleAfter: number;
  bankSize: number;
} {
  const pool = getQuestionsForSubsection(subsectionId, customQuestions);
  const currentCycle = history?.cycleNumber ?? 1;
  const currentAttempts = history?.totalAttempts ?? 0;
  let seenSet = new Set(history?.seenQuestionIds ?? []);

  let unseen = pool.filter((q) => !seenSet.has(q.id));
  let cycleResetOccurred = false;
  let nextCycle = currentCycle;

  if (unseen.length === 0 && pool.length > 0) {
    cycleResetOccurred = true;
    nextCycle = currentCycle + 1;
    seenSet = new Set<string>();
    unseen = [...pool];
  }

  let chosen = fisherYates(unseen).slice(0, Math.min(count, unseen.length));

  // If fewer than `count` unseen remain at the very tail of a cycle, top up from fresh new cycle only if pool > chosen
  if (chosen.length < count && pool.length > chosen.length && unseen.length < count) {
    // Keep strictly unseen to exhaust the cycle cleanly, or notify if partial batch
    // Exhausting remaining unseen questions finishes the cycle cleanly without repeating seen items!
  }

  const nextSeen = [...Array.from(seenSet), ...chosen.map((q) => q.id)];

  const shuffledBatch: ShuffledQuizQuestion[] = chosen.map((q) => {
    const indexed = q.options.map((text, idx) => ({
      text,
      isCorrect: idx === q.correctIndex,
    }));
    const mixed = fisherYates(indexed);
    return {
      originalId: q.id,
      question: q,
      shuffledOptions: mixed.map((m) => m.text) as [string, string, string, string],
      correctShuffledIndex: mixed.findIndex((m) => m.isCorrect),
    };
  });

  return {
    questions: shuffledBatch,
    nextHistoryPreview: {
      subsectionId,
      seenQuestionIds: nextSeen,
      cycleNumber: nextCycle,
      totalAttempts: currentAttempts + 1,
    },
    cycleResetOccurred,
    remainingInCycleAfter: Math.max(0, pool.length - nextSeen.length),
    bankSize: pool.length,
  };
}
