import { lcmArray } from './numberTheory.ts';

export interface Permutation {
  n: number;
  /** mapping[i] is image of (i + 1), values in 1..n */
  mapping: number[];
}

export interface CompositionTraceStep {
  element: number;
  afterRight: number;
  afterLeft: number;
}

export function identityPerm(n: number): Permutation {
  return {
    n,
    mapping: Array.from({ length: n }, (_, i) => i + 1),
  };
}

export function isIdentityPerm(p: Permutation): boolean {
  return p.mapping.every((v, idx) => v === idx + 1);
}

/**
 * Right-to-left composition (Fraleigh Sec 4): (sigma * tau)(x) = sigma(tau(x)).
 */
export function composePerm(sigma: Permutation, tau: Permutation): Permutation {
  if (sigma.n !== tau.n) {
    throw new Error(`Cannot compose permutations of different degrees (${sigma.n} vs ${tau.n}).`);
  }
  const mapping = tau.mapping.map((y) => sigma.mapping[y - 1]);
  return { n: sigma.n, mapping };
}

export function composePermWithTrace(
  sigma: Permutation,
  tau: Permutation
): { result: Permutation; steps: CompositionTraceStep[] } {
  const result = composePerm(sigma, tau);
  const steps: CompositionTraceStep[] = [];
  for (let x = 1; x <= sigma.n; x++) {
    const y = tau.mapping[x - 1];
    const z = sigma.mapping[y - 1];
    steps.push({ element: x, afterRight: y, afterLeft: z });
  }
  return { result, steps };
}

export function invertPerm(p: Permutation): Permutation {
  const inv = new Array<number>(p.n);
  for (let i = 0; i < p.n; i++) {
    inv[p.mapping[i] - 1] = i + 1;
  }
  return { n: p.n, mapping: inv };
}

export function toDisjointCycles(p: Permutation): {
  cycles: number[][];
  fixedPoints: number[];
} {
  const visited = new Array<boolean>(p.n).fill(false);
  const cycles: number[][] = [];
  const fixedPoints: number[] = [];

  for (let start = 1; start <= p.n; start++) {
    if (visited[start - 1]) continue;
    const cycle: number[] = [];
    let curr = start;
    while (!visited[curr - 1]) {
      visited[curr - 1] = true;
      cycle.push(curr);
      curr = p.mapping[curr - 1];
    }
    if (cycle.length === 1) {
      fixedPoints.push(cycle[0]);
    } else {
      cycles.push(cycle);
    }
  }
  return { cycles, fixedPoints };
}

export function formatCycleNotation(p: Permutation, useIota = true): string {
  const { cycles } = toDisjointCycles(p);
  if (cycles.length === 0) {
    return useIota ? 'ι' : '(1)';
  }
  return cycles.map((c) => `(${c.join(', ')})`).join('');
}

export function formatCycleNotationCompact(p: Permutation, useIota = true): string {
  const { cycles } = toDisjointCycles(p);
  if (cycles.length === 0) {
    return useIota ? 'ι' : '(1)';
  }
  return cycles.map((c) => `(${c.join(' ')})`).join('');
}

export function formatTwoRowLines(p: Permutation): { top: string; bottom: string } {
  const top = Array.from({ length: p.n }, (_, i) => String(i + 1)).join(' ');
  const bottom = p.mapping.map(String).join(' ');
  return { top, bottom };
}

export function formatTwoRowLatex(p: Permutation): string {
  const top = Array.from({ length: p.n }, (_, i) => i + 1).join(' & ');
  const bottom = p.mapping.join(' & ');
  return `\\begin{pmatrix} ${top} \\\\ ${bottom} \\end{pmatrix}`;
}

export function permOrder(p: Permutation): number {
  const { cycles } = toDisjointCycles(p);
  if (cycles.length === 0) return 1;
  return lcmArray(cycles.map((c) => c.length));
}

/**
 * Expresses p as a product of transpositions (right-to-left) using Fraleigh's expansion:
 * (a1, a2, ..., ak) = (a1, ak)(a1, a_{k-1})...(a1, a2)
 */
export function toTranspositions(p: Permutation): [number, number][] {
  const { cycles } = toDisjointCycles(p);
  const transpositions: [number, number][] = [];
  for (const cycle of cycles) {
    for (let i = cycle.length - 1; i >= 1; i--) {
      transpositions.push([cycle[0], cycle[i]]);
    }
  }
  return transpositions;
}

export function formatTranspositions(p: Permutation): string {
  const trans = toTranspositions(p);
  if (trans.length === 0) return '(1, 2)(1, 2)';
  return trans.map(([a, b]) => `(${a}, ${b})`).join('');
}

export function permParity(p: Permutation): 'even' | 'odd' {
  const trans = toTranspositions(p);
  return trans.length % 2 === 0 ? 'even' : 'odd';
}

export function permSign(p: Permutation): 1 | -1 {
  return permParity(p) === 'even' ? 1 : -1;
}

export interface PermutationInversion {
  i: number;
  j: number;
  valI: number;
  valJ: number;
}

export function computePermutationInversions(p: Permutation): {
  inversions: PermutationInversion[];
  count: number;
  sign: 1 | -1;
  parity: 'even' | 'odd';
} {
  const inversions: PermutationInversion[] = [];
  for (let i = 1; i <= p.n; i++) {
    const valI = p.mapping[i - 1];
    for (let j = i + 1; j <= p.n; j++) {
      const valJ = p.mapping[j - 1];
      if (valI > valJ) {
        inversions.push({ i, j, valI, valJ });
      }
    }
  }
  const count = inversions.length;
  const parity: 'even' | 'odd' = count % 2 === 0 ? 'even' : 'odd';
  const sign: 1 | -1 = parity === 'even' ? 1 : -1;
  return { inversions, count, sign, parity };
}

export function cycleType(p: Permutation): number[] {
  const { cycles, fixedPoints } = toDisjointCycles(p);
  return [...cycles.map((c) => c.length), ...fixedPoints.map(() => 1)].sort((a, b) => b - a);
}

/**
 * Parses cycle notation such as "(1 3 2)(4 5)", "(1,3,2)(4,5)", "(132)", "ι", "(1)", "id".
 * Applies cycles right-to-left per Fraleigh Sec 4/8.
 */
export function parseCycleString(input: string, n: number): Permutation {
  const trimmed = input.trim();
  if (!trimmed || trimmed === 'ι' || trimmed === 'iota' || trimmed === 'id' || trimmed === '(1)') {
    return identityPerm(n);
  }
  const cycleMatches = Array.from(trimmed.matchAll(/\(([^()]+)\)/g));
  if (cycleMatches.length === 0) {
    throw new Error('Cycle notation must wrap cycles in parentheses, e.g., (1, 3, 2)(4, 5) or ι.');
  }
  // Verify no stray non-whitespace characters outside parentheses
  const stripped = trimmed.replace(/\(([^()]+)\)/g, '').trim();
  if (stripped.length > 0) {
    throw new Error(`Unexpected characters "${stripped}" outside cycle parentheses.`);
  }

  const singleCycles: Permutation[] = cycleMatches.map((m) => {
    const body = m[1].trim();
    if (!body) throw new Error('Empty cycle () is invalid.');
    let nums: number[];
    if (/[\s,;]+/.test(body)) {
      nums = body
        .split(/[\s,;]+/)
        .filter(Boolean)
        .map((tok) => {
          const val = Number(tok);
          if (!Number.isInteger(val)) throw new Error(`Invalid symbol "${tok}" in cycle.`);
          return val;
        });
    } else if (n <= 9 && /^\d+$/.test(body)) {
      nums = body.split('').map(Number);
    } else {
      const val = Number(body);
      if (!Number.isInteger(val)) throw new Error(`Invalid cycle "${body}".`);
      nums = [val];
    }

    const seen = new Set<number>();
    for (const v of nums) {
      if (v < 1 || v > n) {
        throw new Error(`Element ${v} is out of range 1..${n} for S_${n}.`);
      }
      if (seen.has(v)) {
        throw new Error(`Duplicate element ${v} inside single cycle (${body}).`);
      }
      seen.add(v);
    }

    const mapping = Array.from({ length: n }, (_, i) => i + 1);
    if (nums.length >= 2) {
      for (let i = 0; i < nums.length; i++) {
        const from = nums[i];
        const to = nums[(i + 1) % nums.length];
        mapping[from - 1] = to;
      }
    }
    return { n, mapping };
  });

  // Compose right-to-left
  let acc = identityPerm(n);
  for (let i = singleCycles.length - 1; i >= 0; i--) {
    acc = composePerm(singleCycles[i], acc);
  }
  return acc;
}

export function parseTwoRowArrays(bottomRow: number[], n: number): Permutation {
  if (bottomRow.length !== n) {
    throw new Error(`Bottom row must contain exactly ${n} numbers.`);
  }
  const seen = new Set<number>();
  for (const v of bottomRow) {
    if (!Number.isInteger(v) || v < 1 || v > n) {
      throw new Error(`Value ${v} must be an integer between 1 and ${n}.`);
    }
    if (seen.has(v)) {
      throw new Error(`Value ${v} is duplicated; a permutation must be a bijection.`);
    }
    seen.add(v);
  }
  return { n, mapping: [...bottomRow] };
}

export function generateSn(n: number): Permutation[] {
  if (n < 1 || n > 6) {
    throw new Error('Full S_n enumeration is supported for 1 <= n <= 6.');
  }
  const results: Permutation[] = [];
  const nums = Array.from({ length: n }, (_, i) => i + 1);
  function backtrack(start: number) {
    if (start === n) {
      results.push({ n, mapping: [...nums] });
      return;
    }
    for (let i = start; i < n; i++) {
      [nums[start], nums[i]] = [nums[i], nums[start]];
      backtrack(start + 1);
      [nums[start], nums[i]] = [nums[i], nums[start]];
    }
  }
  backtrack(0);
  // Sort nicely: identity first, then by order and cycle notation
  return results.sort((a, b) => {
    const oa = permOrder(a);
    const ob = permOrder(b);
    if (oa !== ob) return oa - ob;
    return formatCycleNotation(a).localeCompare(formatCycleNotation(b));
  });
}

export function summarizeSn(n: number): {
  total: number;
  evenCount: number;
  oddCount: number;
  orderDistribution: Record<number, number>;
  elements: Permutation[];
  alternating: Permutation[];
} {
  const elements = generateSn(n);
  const alternating = elements.filter((p) => permParity(p) === 'even');
  const orderDistribution: Record<number, number> = {};
  for (const p of elements) {
    const ord = permOrder(p);
    orderDistribution[ord] = (orderDistribution[ord] ?? 0) + 1;
  }
  return {
    total: elements.length,
    evenCount: alternating.length,
    oddCount: elements.length - alternating.length,
    orderDistribution,
    elements,
    alternating,
  };
}
