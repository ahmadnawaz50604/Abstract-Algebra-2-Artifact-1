import type { AssessmentDifficulty, CurriculumModule, LessonSubsection } from '../../types/algebra.ts';
import { MODULES_1_TO_4 } from './modules1to4.ts';
import { MODULES_5_TO_8 } from './modules5to8.ts';

export const CURRICULUM_MODULES: CurriculumModule[] = [
  ...MODULES_1_TO_4,
  ...MODULES_5_TO_8,
];

export const ALL_SUBSECTIONS: LessonSubsection[] = CURRICULUM_MODULES.flatMap(
  (m) => m.subsections
);

export function getSubsectionById(id: string): LessonSubsection | undefined {
  return ALL_SUBSECTIONS.find((s) => s.id === id);
}

export function getModuleById(id: string): CurriculumModule | undefined {
  return CURRICULUM_MODULES.find((m) => m.id === id);
}

export interface GuidedExerciseItem {
  id: string;
  number?: number;
  title: string;
  difficulty: AssessmentDifficulty;
  topicTag: string;
  subsectionId: string;
  kind: 'guided' | 'fill_blank' | 'true_false' | 'multi_select' | 'matching' | 'proof';
  prompt: string;
  hint: string;
  expectedAnswers?: string[]; // accepted normalized short answers
  options?: string[];
  correctIndices?: number[];
  pairs?: { left: string; right: string }[];
  solutionSummary: string;
  solutionSteps: string[];
}

export const EXERCISE_CENTRE_PROBLEMS: GuidedExerciseItem[] = [
  {
    id: 'gp-1',
    number: 1,
    title: 'Guided Problem 1: Classify All Finite Abelian Groups of Order 72',
    difficulty: 'Advanced',
    topicTag: 'Finite Abelian Classification',
    subsectionId: 'm3-s3',
    kind: 'fill_blank',
    prompt:
      'Using the Fundamental Theorem of Finite Abelian Groups, how many non-isomorphic abelian groups of order 72 exist? Enter the integer count (and verify both elementary-divisor and invariant-factor forms in your step-by-step check).',
    hint: 'Factor $72 = 2^3 \\cdot 3^2$, then multiply the integer partition counts $p(3) \\cdot p(2)$.',
    expectedAnswers: ['6'],
    solutionSummary: '6 non-isomorphic abelian groups of order 72.',
    solutionSteps: [
      'Factor $72 = 2^3 \\cdot 3^2$.',
      'Exponent $3$ has $p(3) = 3$ partitions ($[3], [2,1], [1,1,1] \\to \\mathbb{Z}_8, \\mathbb{Z}_4\\times\\mathbb{Z}_2, \\mathbb{Z}_2^3$).',
      'Exponent $2$ has $p(2) = 2$ partitions ($[2], [1,1] \\to \\mathbb{Z}_9, \\mathbb{Z}_3\\times\\mathbb{Z}_3$).',
      'Total = $3 \\times 2 = 6$. Invariant-factor forms: $\\mathbb{Z}_{72}$, $\\mathbb{Z}_3\\times\\mathbb{Z}_{24}$, $\\mathbb{Z}_2\\times\\mathbb{Z}_{36}$, $\\mathbb{Z}_6\\times\\mathbb{Z}_{12}$, $\\mathbb{Z}_2\\times\\mathbb{Z}_2\\times\\mathbb{Z}_{18}$, and $\\mathbb{Z}_2\\times\\mathbb{Z}_6\\times\\mathbb{Z}_6$.',
    ],
  },
  {
    id: 'gp-2',
    number: 2,
    title: 'Guided Problem 2: Tabulate φ(n) & Generators of ℤₙ',
    difficulty: 'Intermediate',
    topicTag: 'Cyclic Generators & Totient',
    subsectionId: 'm6-s2',
    kind: 'fill_blank',
    prompt:
      'Compute Euler’s totient $\\varphi(20)$, which equals the exact number of generators of $\\mathbb{Z}_{20}$.',
    hint: 'Factor $20 = 2^2 \\cdot 5$ and apply $\\varphi(p^e) = p^{e-1}(p-1)$.',
    expectedAnswers: ['8'],
    solutionSummary: '$\\varphi(20) = 8$ generators: $\\{1, 3, 7, 9, 11, 13, 17, 19\\}$.',
    solutionSteps: [
      '$20 = 2^2 \\cdot 5$.',
      '$\\varphi(20) = \\varphi(4)\\varphi(5) = 2 \\cdot 4 = 8$.',
      'Integers $1 \\le k < 20$ with $\\gcd(k, 20) = 1$ are $1, 3, 7, 9, 11, 13, 17, 19$.',
    ],
  },
  {
    id: 'gp-3',
    number: 3,
    title: 'Guided Problem 3: Even Permutations in S₅ (|A₅|)',
    difficulty: 'Intermediate',
    topicTag: 'Permutation Parity',
    subsectionId: 'm4-s3',
    kind: 'fill_blank',
    prompt:
      'How many even permutations exist in the symmetric group $S_5$? (That is, find $|A_5|$.)',
    hint: 'Compute $|S_5| = 5!$ and divide by 2 using Fraleigh Theorem 8.16.',
    expectedAnswers: ['60'],
    solutionSummary: '$|A_5| = 5!/2 = 120/2 = 60$ even permutations.',
    solutionSteps: [
      '$|S_5| = 5! = 120$.',
      'Multiplying by transposition $(1, 2)$ gives a bijection between even and odd permutations.',
      'Hence $|A_5| = 120/2 = 60$.',
    ],
  },
  {
    id: 'gp-4',
    number: 4,
    title: 'Guided Problem 4: Element Orders in D₆ and D₈',
    difficulty: 'Intermediate',
    topicTag: 'Dihedral Groups',
    subsectionId: 'm5-s3',
    kind: 'fill_blank',
    prompt:
      'How many elements of order $2$ exist in the dihedral group $D_8$ (symmetries of a regular octagon)? Remember to count both reflections $\\mu\\rho^k$ and any half-turn rotation $\\rho^k$.',
    hint: 'Count all 8 reflections plus check $\\operatorname{ord}(\\rho^4)$.',
    expectedAnswers: ['9'],
    solutionSummary: '9 elements of order 2 in $D_8$ (all 8 reflections $\\mu\\rho^k$ plus $\\rho^4$).',
    solutionSteps: [
      'Every reflection $\\mu\\rho^k$ ($k = 0..7$) has order $2$ — that is $8$ elements.',
      'Among rotations $\\rho^k$, $\\operatorname{ord}(\\rho^k) = 8/\\gcd(8, k) = 2$ occurs when $\\gcd(8, k) = 4$, i.e., $k = 4$ ($\\rho^4$).',
      'Total elements of order $2$ in $D_8$ is $8 + 1 = 9$. (In $D_6$, similarly $6 + 1 = 7$.)',
    ],
  },
  {
    id: 'gp-5',
    number: 5,
    title: 'Guided Problem 5: Show ℤ₂ × ℤ₂ Has No Element of Order 4 vs ℤ₄',
    difficulty: 'Foundational' as AssessmentDifficulty,
    topicTag: 'Structural Contrast',
    subsectionId: 'm2-s3',
    kind: 'fill_blank',
    prompt:
      'What is the maximum order of any element in $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$, whereas $\\mathbb{Z}_4$ has two elements of order 4?',
    hint: 'Compute $(a, b) + (a, b)$ in $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$ for any $a, b \\in \\{0, 1\\}$.',
    expectedAnswers: ['2'],
    solutionSummary: 'Maximum element order in $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$ is $2$ (no element has order $4$).',
    solutionSteps: [
      'For every $(a, b) \\in \\mathbb{Z}_2 \\times \\mathbb{Z}_2$, $(a, b) + (a, b) = (2a \\bmod 2, 2b \\bmod 2) = (0, 0)$.',
      'Thus $(1,0), (0,1), (1,1)$ all have order $2$, and $(0,0)$ has order $1$.',
      'By contrast, in $\\mathbb{Z}_4$, $1$ and $3$ both have order $4$, proving $\\mathbb{Z}_2 \\times \\mathbb{Z}_2 \\not\\cong \\mathbb{Z}_4$.',
    ],
  },
  {
    id: 'gp-6',
    number: 6,
    title: 'Guided Problem 6: Element of Order 6 in S₅ & Its Parity',
    difficulty: 'Intermediate',
    topicTag: 'Permutation Orders & Parity',
    subsectionId: 'm4-s3',
    kind: 'true_false',
    prompt:
      'True or False: The permutation $\\sigma = (1, 2, 3)(4, 5) \\in S_5$ has order $6$ and is an EVEN permutation.',
    hint: 'Express $(1, 2, 3)(4, 5)$ as transpositions: $(1, 3)(1, 2)(4, 5)$.',
    options: ['True', 'False'],
    correctIndices: [1],
    solutionSummary: 'False — $(1, 2, 3)(4, 5)$ has order $6$, but it is an ODD permutation (3 transpositions).',
    solutionSteps: [
      'Order = $\\operatorname{lcm}(3, 2) = 6$.',
      'Factor into transpositions: $(1, 2, 3)(4, 5) = (1, 3)(1, 2)(4, 5)$ ($3$ transpositions).',
      'Because $3$ is odd, $\\sigma$ is an ODD permutation (so $\\sigma \\notin A_5$).',
    ],
  },
  {
    id: 'gp-7',
    number: 7,
    title: 'Guided Problem 7: Dihedral Product Simplification in D₅',
    difficulty: 'Intermediate',
    topicTag: 'Dihedral Algebra',
    subsectionId: 'm5-s2',
    kind: 'fill_blank',
    prompt:
      'In standard notation for $D_5$, simplify $(\\mu\\rho^2)(\\mu\\rho)$ into standard form (use 1, ρ, μ, e.g. rho^4 or ρ⁴).',
    hint: 'Apply $\\rho^2\\mu = \\mu\\rho^{5-2} = \\mu\\rho^3$ and $\\mu^2 = 1$.',
    expectedAnswers: ['ρ⁴', 'ρ^4', 'rho^4', 'rho4'],
    solutionSummary: '$(\\mu\\rho^2)(\\mu\\rho) = \\rho^4$.',
    solutionSteps: [
      '$(\\mu\\rho^2)(\\mu\\rho) = \\mu(\\rho^2\\mu)\\rho$.',
      'Use $\\rho^2\\mu = \\mu\\rho^{5-2} = \\mu\\rho^3$: $\\mu(\\mu\\rho^3)\\rho = \\mu^2\\rho^4$.',
      'Apply $\\mu^2 = 1$ to get $1 \\cdot \\rho^4 = \\rho^4$.',
    ],
  },
  {
    id: 'gp-8',
    number: 8,
    title: 'Guided Problem 8: Non-Isomorphic Abelian Groups of Order 360',
    difficulty: 'Challenge',
    topicTag: 'Abelian Classification',
    subsectionId: 'm3-s3',
    kind: 'fill_blank',
    prompt:
      'How many non-isomorphic finite abelian groups of order $360 = 2^3 \\cdot 3^2 \\cdot 5^1$ exist?',
    hint: 'Multiply $p(3) \\cdot p(2) \\cdot p(1)$.',
    expectedAnswers: ['6'],
    solutionSummary: '$p(3)p(2)p(1) = 3 \\cdot 2 \\cdot 1 = 6$ non-isomorphic abelian groups.',
    solutionSteps: [
      '$360 = 8 \\cdot 9 \\cdot 5 = 2^3 \\cdot 3^2 \\cdot 5^1$.',
      'Partition counts: $p(3)=3$, $p(2)=2$, $p(1)=1$.',
      '$3 \\times 2 \\times 1 = 6$.',
    ],
  },
  {
    id: 'gp-9',
    number: 9,
    title: 'Guided Problem 9: Right-to-Left Permutation Product in S₄',
    difficulty: 'Beginner',
    topicTag: 'Permutation Composition',
    subsectionId: 'm4-s2',
    kind: 'fill_blank',
    prompt:
      'Compute the disjoint cycle form of $(1, 3, 2)(2, 4)$ in $S_4$ using Fraleigh’s right-to-left convention.',
    hint: 'Apply $(2, 4)$ first, then $(1, 3, 2)$. Start tracing from 1.',
    expectedAnswers: ['(1, 3, 2, 4)', '(1,3,2,4)', '(1 3 2 4)', '(1324)'],
    solutionSummary: '$(1, 3, 2)(2, 4) = (1, 3, 2, 4)$.',
    solutionSteps: [
      '$1 \\to 1 \\to 3$; $3 \\to 3 \\to 2$; $2 \\to 4 \\to 4$; $4 \\to 2 \\to 1$.',
      'Hence the product is the single 4-cycle $(1, 3, 2, 4)$.',
    ],
  },
  // Additional multi-format exercises across levels
  {
    id: 'ex-multi-1',
    title: 'Select All Groups Isomorphic to ℤ₁₂',
    difficulty: 'Intermediate',
    topicTag: 'Direct Products',
    subsectionId: 'm2-s2',
    kind: 'multi_select',
    prompt: 'Select EVERY direct product below that is cyclic (isomorphic to $\\mathbb{Z}_{12}$).',
    hint: 'A direct product $\\mathbb{Z}_m \\times \\mathbb{Z}_n$ is cyclic iff $\\gcd(m, n) = 1$.',
    options: [
      'ℤ₃ × ℤ₄',
      'ℤ₂ × ℤ₆',
      'ℤ₂ × ℤ₂ × ℤ₃',
      'ℤ₁₂',
    ],
    correctIndices: [0, 3],
    solutionSummary: 'Only $\\mathbb{Z}_3 \\times \\mathbb{Z}_4$ and $\\mathbb{Z}_{12}$ are cyclic ($\gcd(3,4)=1$, whereas $\\gcd(2,6)=2 > 1$).',
    solutionSteps: [
      '$\\gcd(3, 4) = 1 \\implies \\mathbb{Z}_3 \\times \\mathbb{Z}_4 \\cong \\mathbb{Z}_{12}$.',
      'In $\\mathbb{Z}_2 \\times \\mathbb{Z}_6$ and $\\mathbb{Z}_2 \\times \\mathbb{Z}_2 \\times \\mathbb{Z}_3$, maximum element order is $6 < 12$.',
    ],
  },
  {
    id: 'ex-match-1',
    title: 'Matching: Group Elements to Their Exact Orders',
    difficulty: 'Intermediate',
    topicTag: 'Element Orders',
    subsectionId: 'm6-s1',
    kind: 'matching',
    prompt: 'Match each group element on the left with its exact order on the right.',
    hint: 'Use $n/\\gcd(n,k)$ for rotations/$\mathbb{Z}_n$, $2$ for reflections, and $\\operatorname{lcm}$ for disjoint cycles.',
    pairs: [
      { left: 'μρ³ in D₆', right: 'Order 2' },
      { left: 'ρ² in D₆', right: 'Order 3' },
      { left: '5 in ℤ₁₂', right: 'Order 12' },
      { left: '(1, 2, 3, 4)(5, 6) in S₆', right: 'Order 4' },
    ],
    solutionSummary: 'μρ³ has order 2; ρ² in D₆ has order 3; 5 in ℤ₁₂ has order 12; (1,2,3,4)(5,6) has order lcm(4,2) = 4.',
    solutionSteps: [
      'Reflections $\\mu\\rho^k$ always have order 2.',
      '$\\operatorname{ord}(\\rho^2) = 6/\\gcd(6,2) = 3$.',
      '$\\gcd(5, 12) = 1 \\implies \\operatorname{ord}(5) = 12$.',
      '$\\operatorname{lcm}(4, 2) = 4$.',
    ],
  },
  {
    id: 'ex-proof-1',
    title: 'Guided Proof: Every Reflection in Dₙ Has Order 2',
    difficulty: 'Challenge',
    topicTag: 'Dihedral Proofs',
    subsectionId: 'm5-s3',
    kind: 'proof',
    prompt:
      'Prove algebraically in standard dihedral notation that $(\\mu\\rho^k)^2 = 1$ for every $0 \\le k \\le n - 1$ in $D_n$. Check the required reasoning steps below.',
    hint: 'Use associativity and the commutation law $\\rho^k\\mu = \\mu\\rho^{n-k}$.',
    options: [
      'Write (μρᵏ)² = (μρᵏ)(μρᵏ) = μ(ρᵏμ)ρᵏ',
      'Apply ρᵏμ = μρⁿ⁻ᵏ to get μ(μρⁿ⁻ᵏ)ρᵏ',
      'Apply μ² = 1 and ρⁿ = 1 to conclude 1·ρⁿ = 1',
    ],
    correctIndices: [0, 1, 2],
    solutionSummary: '$(\\mu\\rho^k)^2 = \\mu(\\rho^k\\mu)\\rho^k = \\mu^2\\rho^{n-k+k} = 1 \\cdot \\rho^n = 1$, and $\\mu\\rho^k \\ne 1$, so $\\operatorname{ord}(\\mu\\rho^k) = 2$.',
    solutionSteps: [
      'Step 1: Expand $(\\mu\\rho^k)^2 = \\mu(\\rho^k\\mu)\\rho^k$.',
      'Step 2: Apply the relation $\\rho^k\\mu = \\mu\\rho^{n-k}$ to obtain $\\mu(\\mu\\rho^{n-k})\\rho^k$.',
      'Step 3: Regroup $(\\mu^2)(\\rho^{n-k}\\rho^k) = 1 \\cdot \\rho^n = 1$. Since $\\mu\\rho^k \\ne 1$, order is strictly $2$.',
    ],
  },
];

export interface RealWorldScenario {
  id: string;
  title: string;
  domain: string;
  groupModel: string;
  isGenuineGroup: boolean;
  summary: string;
  visualN: number;
  allowReflections: boolean;
  algebraicBreakdown: string[];
  axiomAudit: {
    closure: string;
    associativity: string;
    identity: string;
    inverses: string;
  };
  question: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const REAL_WORLD_SCENARIOS: RealWorldScenario[] = [
  {
    id: 'rw-architecture',
    title: 'Cathedral Rose Windows & Islamic Octagonal Medallions',
    domain: 'Architecture & Tessellation',
    groupModel: 'D₈ (Order 16)',
    isGenuineGroup: true,
    summary:
      'Eightfold octagonal stone tracery exhibits 8 rotational symmetries ($45^\\circ$ increments $\\rho^k$) plus 8 bilateral mirror axes ($\\mu\\rho^k$).',
    visualN: 8,
    allowReflections: true,
    algebraicBreakdown: [
      'Rotations: $1, \\rho, \\rho^2, \\dots, \\rho^7$ ($45^\\circ$ steps).',
      'Reflections: $\\mu, \\mu\\rho, \\dots, \\mu\\rho^7$ across vertex-to-vertex and midpoint axes.',
      'Composing two reflections at $22.5^\\circ$ angle yields rotation $\\rho$ ($45^\\circ$).',
    ],
    axiomAudit: {
      closure: 'Composing any two rigid symmetries of the octagon produces another octagon-preserving symmetry.',
      associativity: 'Rigid planar isometries are functions, so composition is associative.',
      identity: 'Doing nothing ($1$) leaves every stone rib fixed.',
      inverses: 'Every rotation $\\rho^k$ is undone by $\\rho^{8-k}$; every reflection $\\mu\\rho^k$ is its own inverse.',
    },
    question: {
      prompt: 'An octagonal rose window has full mirror and rotational symmetry. What is the order of its point symmetry group?',
      options: ['8', '12', '16', '24'],
      correctIndex: 2,
      explanation: 'Full octagonal symmetry is $D_8$, which has $2 \\times 8 = 16$ elements ($8$ rotations and $8$ reflections).',
    },
  },
  {
    id: 'rw-graphics',
    title: 'Digital Graphics & CAD Tile Orientation Engine',
    domain: 'Digital Graphics',
    groupModel: 'D₄ (Order 8)',
    isGenuineGroup: true,
    summary:
      'Image-editing sprites and CSS texture tiles combine $90^\\circ$ rotations ($\\rho$) and horizontal/vertical flips ($\\mu, \\mu\\rho^2$), realizing the 8 elements of $D_4$.',
    visualN: 4,
    allowReflections: true,
    algebraicBreakdown: [
      'Flip across horizontal axis = $\\mu$. Flip across vertical axis = $\\mu\\rho^2$.',
      'Rotating $90^\\circ$ ($\rho$) then flipping horizontally ($\mu$) yields $\\mu\\rho$, NOT $\\rho\\mu = \\mu\\rho^3$.',
    ],
    axiomAudit: {
      closure: 'Every sequence of $90^\\circ$ turns and axis flips compresses to one of 8 canonical $D_4$ states.',
      associativity: 'Matrix multiplication of $2\\times 2$ orthogonal matrices is associative.',
      identity: 'Unchanged sprite ($1$).',
      inverses: 'Lossless pixel permutation guarantees exact undo for all 8 transforms.',
    },
    question: {
      prompt: 'In a $D_4$ sprite editor, a designer flips across the main axis ($\\mu$) AFTER rotating $90^\\circ$ counterclockwise ($\\rho$). Which single $D_4$ command is equivalent to $\\mu\\rho$ followed by $\\rho$ (i.e. $\\rho(\\mu\\rho)$)?',
      options: ['1', 'μ', 'μρ²', 'ρ²'],
      correctIndex: 1,
      explanation: 'Using $\\rho\\mu = \\mu\\rho^3$ in $D_4$: $\\rho(\\mu\\rho) = (\\rho\\mu)\\rho = (\\mu\\rho^3)\\rho = \\mu\\rho^4 = \\mu$.',
    },
  },
  {
    id: 'rw-kaleidoscope',
    title: '6-Fold Mirror Kaleidoscope Chamber',
    domain: 'Optics & Kaleidoscopes',
    groupModel: 'D₆ (Order 12)',
    isGenuineGroup: true,
    summary:
      'Two internal mirrors angled at $30^\\circ$ ($180^\\circ / 6$) bounce light recursively into 12 virtual sectors governed by $D_6$.',
    visualN: 6,
    allowReflections: true,
    algebraicBreakdown: [
      'Odd numbers of mirror bounces produce reflected sectors $\\mu\\rho^k$.',
      'Even numbers of bounces produce rotated sectors $\\rho^k$.',
    ],
    axiomAudit: {
      closure: 'Every ray bounce maps sectors within the 12-element $D_6$ chamber.',
      associativity: 'Composition of planar reflections is associative.',
      identity: 'Direct unreflected chamber view ($1$).',
      inverses: 'Reversing reflection order restores the original sector.',
    },
    question: {
      prompt: 'Which element in $D_6$ represents a $180^\\circ$ rotation and what is its order?',
      options: ['ρ², order 3', 'ρ³, order 2', 'μρ³, order 6', 'ρ⁵, order 2'],
      correctIndex: 1,
      explanation: 'In $D_6$, $\\rho^3$ rotates by $3 \\times 60^\\circ = 180^\\circ$, and $\\operatorname{ord}(\\rho^3) = 6/\\gcd(6,3) = 2$.',
    },
  },
  {
    id: 'rw-rubik',
    title: 'Rubik’s Cube & Sliding Puzzle Parity Constraints',
    domain: 'Combinatorial Puzzles',
    groupModel: 'Sₙ & Aₙ Parity',
    isGenuineGroup: true,
    summary:
      'Legal quarter-turns generate a huge finite subgroup of permutations where corner parity and edge parity remain strictly coupled.',
    visualN: 5,
    allowReflections: false,
    algebraicBreakdown: [
      'A single 3-cycle of corners (like an even permutation in $A_n$) is reachable, whereas swapping only two corners without changing edges violates parity.',
      'Inside $S_5$, the alternating group $A_5$ contains all $60$ even permutations.',
    ],
    axiomAudit: {
      closure: 'Any sequence of valid face turns is another valid cube state transition.',
      associativity: 'Move sequences compose associatively as permutations.',
      identity: 'Solved no-move state ($\\iota$).',
      inverses: 'Turning each face backwards in reverse order ($b^{-1}a^{-1}$) solves any scramble.',
    },
    question: {
      prompt: 'If a puzzle move performs the 3-cycle $(1, 2, 3)$ on pieces, is this move even or odd?',
      options: ['Even (2 transpositions)', 'Odd (3 transpositions)', 'Neither', 'Depends on n'],
      correctIndex: 0,
      explanation: 'A $k$-cycle factors into $k - 1$ transpositions: $(1, 2, 3) = (1, 3)(1, 2)$, which is $2$ transpositions (even).',
    },
  },
  {
    id: 'rw-circular',
    title: 'Circular Seating & Cyclic Shift Scheduling',
    domain: 'Scheduling & Arrangements',
    groupModel: 'ℤₙ (Cyclic)',
    isGenuineGroup: true,
    summary:
      'Rotating $n$ round-table seats or shift duties by $+k \\bmod n$ forms $\\mathbb{Z}_n$; everyone cycles through all seats iff $\\gcd(k, n) = 1$.',
    visualN: 6,
    allowReflections: false,
    algebraicBreakdown: [
      'If $n = 12$ and step $k = 5$, $\\gcd(5, 12) = 1$ visits all 12 stations.',
      'If $n = 12$ and step $k = 4$, $\\gcd(4, 12) = 4$ traps stations in cycles of length $3$.',
    ],
    axiomAudit: {
      closure: 'Shift $+a$ followed by $+b$ equals shift $+(a+b) \\bmod n$.',
      associativity: 'Modular addition is associative.',
      identity: 'Zero shift ($0$).',
      inverses: 'Shift $+a$ is undone by shift $+(n-a) \\bmod n$.',
    },
    question: {
      prompt: 'With $12$ rotating lab stations, how many step sizes $k \\in \\{1..11\\}$ visit every station before repeating?',
      options: ['2', '4', '6', '11'],
      correctIndex: 1,
      explanation: 'The number of generators of $\\mathbb{Z}_{12}$ is $\\varphi(12) = 4$ ($k = 1, 5, 7, 11$).',
    },
  },
  {
    id: 'rw-pinwheel',
    title: 'Turbine Pinwheels vs Symmetric Snowflakes (Pattern Recognition)',
    domain: 'Pattern Recognition',
    groupModel: 'ℤ₅ vs D₅',
    isGenuineGroup: true,
    summary:
      'Curved 5-blade turbine rotors look periodic yet lack mirror lines ($\\mathbb{Z}_5$, order 5), whereas straight-armed 5-star emblems preserve reflections ($D_5$, order 10).',
    visualN: 5,
    allowReflections: false,
    algebraicBreakdown: [
      'Turbine symmetry group: $\\mathbb{Z}_5$ (5 rotations, 0 reflections).',
      'Starfish/pentagon symmetry group: $D_5$ (5 rotations, 5 reflections).',
    ],
    axiomAudit: {
      closure: 'Rotations compose to rotations in $\\mathbb{Z}_5$.',
      associativity: 'Planar rotations compose associatively.',
      identity: '$0^\\circ$ rotation.',
      inverses: 'Counterclockwise $72^\\circ$ inverse is $288^\\circ$.',
    },
    question: {
      prompt: 'A curved 6-blade ceiling fan looks identical every $60^\\circ$ rotation, but flipping it reverses blade curvature. What is its symmetry group?',
      options: ['D₆ (order 12)', 'ℤ₆ (order 6)', 'S₆ (order 720)', 'Not a group'],
      correctIndex: 1,
      explanation: 'Without mirror symmetry, only the 6 rotational symmetries survive, forming cyclic group $\\mathbb{Z}_6$.',
    },
  },
  {
    id: 'rw-nongroup',
    title: 'Lossy Image Filters & Incomplete Moves (Non-Group Warning)',
    domain: 'Mathematical Modeling Critique',
    groupModel: 'Non-Group (Fails Inverse / Closure)',
    isGenuineGroup: false,
    summary:
      'Not every system of transformations is a group! Adding "crop", "blur", or keeping only $\\{1, \\rho, \\mu\\}$ without $\\rho^2$ breaks the group axioms.',
    visualN: 4,
    allowReflections: true,
    algebraicBreakdown: [
      'Subset $\\{1, \\rho, \\mu\\} \\subset D_4$ fails closure because $\\rho^2$ and $\\mu\\rho$ are absent.',
      'Lossy grayscale/blur filters fail invertibility because distinct inputs map to identical outputs.',
    ],
    axiomAudit: {
      closure: 'FAILS for incomplete generator subsets like $\\{1, \\rho, \\mu\\}$.',
      associativity: 'Holds for functions, yet insufficient alone.',
      identity: 'Present if no-op exists.',
      inverses: 'FAILS for lossy/irreversible filters.',
    },
    question: {
      prompt: 'Why does the set of operations {identity, rotate 90°, grayscale-desaturate} on RGB images FAIL to form a group?',
      options: [
        'It lacks an identity operation',
        'It fails both closure (missing 180°/270°) and inverses (desaturation cannot recover lost hue)',
        'Function composition is non-associative',
        'RGB pixels are infinite',
      ],
      correctIndex: 1,
      explanation: 'Repeating a $90^\\circ$ rotation gives $180^\\circ$ (violating closure), and grayscale projection cannot uniquely invert colors (violating inverses).',
    },
  },
  {
    id: 'rw-chemistry',
    title: 'Molecular Symmetries: Ammonia (NH₃) & Benzene (C₆H₆)',
    domain: 'Chemistry & Spectroscopy',
    groupModel: 'D₃ (Order 6) & D₆ (Order 12)',
    isGenuineGroup: true,
    summary:
      'Planar equilateral molecules like boron trifluoride ($BF_3$) and pyramidal $NH_3$ projected onto the horizontal plane are governed by $D_3$ ($\\rho^3 = 1$, $\\mu^2 = 1$), while planar benzene ($C_6H_6$) exhibits full $D_6$ symmetry.',
    visualN: 6,
    allowReflections: true,
    algebraicBreakdown: [
      'In $NH_3$, the three hydrogen vertices undergo permutations of $D_3 \\cong S_3$: rotations $1, \\rho, \\rho^2$ ($120^\\circ$) and three N–H mirror planes $\\mu, \\mu\\rho, \\mu\\rho^2$.',
      'In planar benzene ($C_6H_6$), six rotations ($60^\\circ$ multiples $\\rho^k$) and six mirror axes ($\\mu\\rho^k$) yield $12$ symmetry operations classifying infrared vs Raman vibrational modes.',
    ],
    axiomAudit: {
      closure: 'Composing any two symmetry operations of the molecule preserves interatomic bond distances.',
      associativity: 'Rigid 3D spatial isometries compose associatively.',
      identity: 'Null operation leaving every atom fixed ($1$).',
      inverses: 'Every $60^\\circ$ rotation $\\rho$ has inverse $\\rho^5$; every reflection $\\mu\\rho^k$ satisfies $(\\mu\\rho^k)^2 = 1$.',
    },
    question: {
      prompt: 'For the $D_3$ hydrogen-vertex symmetry of ammonia ($NH_3$), what is the inverse of the rotation $\\rho$ followed by reflection $\\mu$ (i.e., $(\\mu\\rho)^{-1}$)?',
      options: ['μρ²', 'μρ', 'ρ²', 'μ'],
      correctIndex: 1,
      explanation: 'Every element of the form $\\mu\\rho^k$ in $D_n$ is a reflection of order $2$, so $(\\mu\\rho)^{-1} = \\mu\\rho$. Indeed $(\\mu\\rho)(\\mu\\rho) = \\mu(\\rho\\mu)\\rho = \\mu(\\mu\\rho^2)\\rho = \\mu^2\\rho^3 = 1$.',
    },
  },
  {
    id: 'rw-campanology',
    title: 'Change Ringing in Bell Towers (Campanology)',
    domain: 'Music & Combinatorics',
    groupModel: 'S₄ (Order 24) & S₅ (Order 120)',
    isGenuineGroup: true,
    summary:
      'For over 350 years, English church bell-ringers have rung "Plain Bob" extents by stepping through all permutations in $S_n$ one adjacent transposition at a time without repeating any row.',
    visualN: 4,
    allowReflections: false,
    algebraicBreakdown: [
      'With $4$ bells ("Minimus"), there are $4! = 24$ distinct orders forming $S_4$; with $5$ bells ("Doubles"), there are $5! = 120$ orders forming $S_5$.',
      'Because ringers can only swap adjacent bells between consecutive pulls, every transition is a product of disjoint adjacent transpositions, toggling parity cleanly between even ($A_n$) and odd ($S_n \\setminus A_n$) rows.',
    ],
    axiomAudit: {
      closure: 'Composing any two bell-swapping permutations produces another valid permutation of the $n$ bells.',
      associativity: 'Permutation composition in $S_n$ is strictly associative.',
      identity: 'The opening sequence called "Rounds": $(1, 2, 3, 4)$ unpermuted ($\\iota$).',
      inverses: 'Reversing the swaps of any transition restores the previous bell order.',
    },
    question: {
      prompt: 'On a $4$-bell pull in $S_4$, bells $1,2$ swap AND bells $3,4$ swap simultaneously via $\\sigma = (1,2)(3,4)$. Is $\\sigma$ an even or odd permutation, and what is its order?',
      options: ['Odd, order 2', 'Even, order 2', 'Even, order 4', 'Odd, order 4'],
      correctIndex: 1,
      explanation: '$\\sigma = (1,2)(3,4)$ is a product of $2$ transpositions, so it is EVEN (inside $A_4$), and since the 2-cycles are disjoint, $\\operatorname{ord}(\\sigma) = \\operatorname{lcm}(2, 2) = 2$.',
    },
  },
  {
    id: 'rw-isbn',
    title: 'ISBN-10 vs UPC Check Digits (Cyclic Invertibility)',
    domain: 'Coding & Data Verification',
    groupModel: 'ℤ₁₁ vs ℤ₁₀ (Modular Arithmetic)',
    isGenuineGroup: true,
    summary:
      'ISBN-10 detects every single-digit error and adjacent transposition because arithmetic runs modulo prime $11$ ($\\mathbb{Z}_{11}$), where every weight $1..10$ satisfies $\\gcd(w, 11) = 1$ (a generator). By contrast, UPC mod $10$ fails for even differences.',
    visualN: 5,
    allowReflections: false,
    algebraicBreakdown: [
      'In $\\mathbb{Z}_{11}$, $\\varphi(11) = 10$, meaning all $10$ nonzero weights have unique orders dividing $10$ and generate all of $\\mathbb{Z}_{11}$.',
      'In $\\mathbb{Z}_{10}$, $\\varphi(10) = 4$ ($\{1, 3, 7, 9\}$); multiplying a weight of $2$ by $+5$ returns $0 \\pmod{10}$, masking a swap of digits differing by $5$!',
    ],
    axiomAudit: {
      closure: 'Weighted digit sums modulo $11$ (or $10$) remain inside $\\mathbb{Z}_{11}$ (or $\\mathbb{Z}_{10}$).',
      associativity: 'Modular addition is associative and commutative (abelian).',
      identity: 'Valid codewords sum to $0$ modulo the modulus.',
      inverses: 'Every digit error $+e$ has modular additive inverse $-e$.',
    },
    question: {
      prompt: 'How many integers $k \\in \\{1, 2, \\dots, 9\\}$ are generators of $\\mathbb{Z}_{10}$ (i.e., coprime to $10$)?',
      options: ['2', '4', '5', '9'],
      correctIndex: 1,
      explanation: '$\\varphi(10) = \\varphi(2)\\varphi(5) = 1 \\cdot 4 = 4$. Only $1, 3, 7, 9$ generate $\\mathbb{Z}_{10}$.',
    },
  },
  {
    id: 'rw-turret',
    title: 'Robotic Indexing Turrets & Direct-Product Controllers',
    domain: 'Robotics & Automation',
    groupModel: 'ℤ₃ × ℤ₄ ≅ ℤ₁₂ vs ℤ₂ × ℤ₆',
    isGenuineGroup: true,
    summary:
      'A factory station pairing two independent cyclic actuators of period $m$ and $n$ moves through $\\mathbb{Z}_m \\times \\mathbb{Z}_n$. Whether a single simultaneous step $(1, 1)$ visits all $mn$ states depends strictly on $\\gcd(m, n) = 1$.',
    visualN: 6,
    allowReflections: false,
    algebraicBreakdown: [
      'Pairing a $3$-slot feeder ($\mathbb{Z}_3$) with a $4$-jaw chuck ($\mathbb{Z}_4$) yields $\\mathbb{Z}_3 \\times \\mathbb{Z}_4 \\cong \\mathbb{Z}_{12}$ because $\\gcd(3, 4) = 1$, and $\\operatorname{ord}(1, 1) = \\operatorname{lcm}(3, 4) = 12$.',
      'Pairing a $2$-state clamp ($\mathbb{Z}_2$) with a $6$-slot wheel ($\mathbb{Z}_6$) caps max element order at $\\operatorname{lcm}(2, 6) = 6 < 12$, so NO single step visits all $12$ states!',
    ],
    axiomAudit: {
      closure: 'Stepping $(a_1, b_1) + (a_2, b_2)$ componentwise stays inside $\\mathbb{Z}_m \\times \\mathbb{Z}_n$.',
      associativity: 'Componentwise addition in direct products is associative and abelian.',
      identity: 'Home calibration state $(0, 0)$.',
      inverses: 'Every state $(a, b)$ returns to home via $(m - a \\bmod m, n - b \\bmod n)$.',
    },
    question: {
      prompt: 'In the controller group $\\mathbb{Z}_4 \\times \\mathbb{Z}_6$, what is the order of the step command $(2, 1)$?',
      options: ['2', '4', '6', '12'],
      correctIndex: 2,
      explanation: '$\\operatorname{ord}_4(2) = 4/\\gcd(4,2) = 2$ and $\\operatorname{ord}_6(1) = 6$, so $\\operatorname{ord}(2, 1) = \\operatorname{lcm}(2, 6) = 6$.',
    },
  },
];
