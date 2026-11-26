import {
  divisors,
  eulerPhi,
  formatPrimeFactorization,
  formatPrimeFactorizationLatex,
  gcd,
  integerPartitions,
  lcm,
  lcmArray,
  mod,
  orderInZn,
  primeFactorization,
  toSubscript,
} from './numberTheory.ts';

export interface AbelianGroupClassificationItem {
  index: number;
  elementaryDivisors: number[];
  invariantFactors: number[];
  elementaryLabel: string;
  elementaryLatex: string;
  invariantLabel: string;
  invariantLatex: string;
  isCyclic: boolean;
  maxElementOrder: number;
  primePartitionsDetail: { prime: number; partition: number[]; factors: number[] }[];
  orderDistribution: Record<number, number>;
}

export interface AbelianClassificationResult {
  order: number;
  primeFactorizationText: string;
  primeFactorizationLatex: string;
  totalGroups: number;
  groups: AbelianGroupClassificationItem[];
  reasoningSteps: string[];
}

export function formatZnProduct(moduli: number[]): string {
  if (moduli.length === 0) return 'ℤ₁';
  return moduli.map((m) => `ℤ${toSubscript(m)}`).join(' × ');
}

export function formatZnProductLatex(moduli: number[]): string {
  if (moduli.length === 0) return '\\mathbb{Z}_1';
  return moduli.map((m) => `\\mathbb{Z}_{${m}}`).join(' \\times ');
}

/**
 * Computes exact distribution of element orders in Z_{m_1} x ... x Z_{m_k}
 * via convolution of divisor counts (each Z_m has phi(d) elements of order d for d | m).
 */
export function computeOrderDistribution(moduli: number[]): Record<number, number> {
  if (moduli.length === 0) return { 1: 1 };
  let dist = new Map<number, number>([[1, 1]]);
  for (const m of moduli) {
    const next = new Map<number, number>();
    const divs = divisors(m);
    for (const [ordA, cntA] of dist.entries()) {
      for (const d of divs) {
        const cntB = eulerPhi(d);
        const newOrd = lcm(ordA, d);
        next.set(newOrd, (next.get(newOrd) ?? 0) + cntA * cntB);
      }
    }
    dist = next;
  }
  const obj: Record<number, number> = {};
  const keys = Array.from(dist.keys()).sort((a, b) => a - b);
  for (const k of keys) {
    obj[k] = dist.get(k)!;
  }
  return obj;
}

/**
 * Given prime-power factor lists per prime (e.g. [[4,2], [3,3]]), computes invariant factors d1 | d2 | ... | dr
 */
export function elementaryToInvariantFactors(
  primeParts: { prime: number; partition: number[] }[]
): number[] {
  if (primeParts.length === 0) return [1];
  const maxLen = Math.max(...primeParts.map((p) => p.partition.length));
  // Align each prime's partition (descending) to the right of a maxLen array
  const columns = new Array<number>(maxLen).fill(1);
  for (const { prime, partition } of primeParts) {
    const asc = [...partition].sort((a, b) => a - b);
    const offset = maxLen - asc.length;
    for (let i = 0; i < asc.length; i++) {
      columns[offset + i] *= Math.pow(prime, asc[i]);
    }
  }
  return columns.filter((c) => c > 1);
}

export function classifyAbelianGroups(n: number): AbelianClassificationResult {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error('Order n must be a positive integer.');
  }
  if (n === 1) {
    return {
      order: 1,
      primeFactorizationText: '1',
      primeFactorizationLatex: '1',
      totalGroups: 1,
      groups: [
        {
          index: 1,
          elementaryDivisors: [1],
          invariantFactors: [1],
          elementaryLabel: 'ℤ₁',
          elementaryLatex: '\\mathbb{Z}_1',
          invariantLabel: 'ℤ₁',
          invariantLatex: '\\mathbb{Z}_1',
          isCyclic: true,
          maxElementOrder: 1,
          primePartitionsDetail: [],
          orderDistribution: { 1: 1 },
        },
      ],
      reasoningSteps: ['Order 1 admits only the trivial group ℤ₁.'],
    };
  }

  const factors = primeFactorization(n);
  const perPrimePartitions = factors.map((f) => ({
    prime: f.prime,
    exponent: f.exponent,
    partitions: integerPartitions(f.exponent),
  }));

  // Cartesian product of partitions across primes
  type Combo = { prime: number; partition: number[]; factors: number[] }[];
  let combos: Combo[] = [[]];
  for (const pp of perPrimePartitions) {
    const next: Combo[] = [];
    for (const c of combos) {
      for (const part of pp.partitions) {
        next.push([
          ...c,
          {
            prime: pp.prime,
            partition: part,
            factors: part.map((exp) => Math.pow(pp.prime, exp)),
          },
        ]);
      }
    }
    combos = next;
  }

  const groups: AbelianGroupClassificationItem[] = combos.map((combo, idx) => {
    const elementaryDivisors = combo.flatMap((c) => c.factors);
    const invariantFactors = elementaryToInvariantFactors(
      combo.map((c) => ({ prime: c.prime, partition: c.partition }))
    );
    const maxElementOrder = invariantFactors[invariantFactors.length - 1] ?? 1;
    return {
      index: idx + 1,
      elementaryDivisors,
      invariantFactors,
      elementaryLabel: formatZnProduct(elementaryDivisors),
      elementaryLatex: formatZnProductLatex(elementaryDivisors),
      invariantLabel: formatZnProduct(invariantFactors),
      invariantLatex: formatZnProductLatex(invariantFactors),
      isCyclic: invariantFactors.length === 1,
      maxElementOrder,
      primePartitionsDetail: combo,
      orderDistribution: computeOrderDistribution(invariantFactors),
    };
  });

  const partitionCountsText = perPrimePartitions
    .map((p) => `p(${p.exponent}) = ${p.partitions.length} for prime ${p.prime}^${p.exponent}`)
    .join('; ');

  const reasoningSteps = [
    `Factorize n = ${n} into primes: ${formatPrimeFactorization(n)}.`,
    `By the Fundamental Theorem of Finite Abelian Groups (Fraleigh Theorem 9.12), classify each prime power separately using integer partitions: ${partitionCountsText}.`,
    `Total non-isomorphic abelian groups of order ${n}: ${groups.length}.`,
    `Convert each elementary-divisor decomposition into invariant factors d₁ | d₂ | ⋯ | dᵣ (Fraleigh Theorem 9.14) by aligning the largest prime powers in the rightmost factor.`,
  ];

  return {
    order: n,
    primeFactorizationText: formatPrimeFactorization(n),
    primeFactorizationLatex: formatPrimeFactorizationLatex(n),
    totalGroups: groups.length,
    groups,
    reasoningSteps,
  };
}

export function addDirectProductTuples(a: number[], b: number[], moduli: number[]): number[] {
  return moduli.map((m, i) => mod((a[i] ?? 0) + (b[i] ?? 0), m));
}

export function inverseDirectProductTuple(a: number[], moduli: number[]): number[] {
  return moduli.map((m, i) => mod(-(a[i] ?? 0), m));
}

export function orderDirectProductTuple(a: number[], moduli: number[]): number {
  const orders = moduli.map((m, i) => orderInZn(a[i] ?? 0, m));
  return lcmArray(orders);
}

export function formatTuple(a: number[]): string {
  return `(${a.join(', ')})`;
}

export function enumerateDirectProduct(moduli: number[], maxLimit = 256): number[][] {
  const total = moduli.reduce((acc, m) => acc * m, 1);
  if (total > maxLimit) {
    throw new Error(`Group order ${total} exceeds enumeration limit ${maxLimit}.`);
  }
  let tuples: number[][] = [[]];
  for (const m of moduli) {
    const next: number[][] = [];
    for (const prefix of tuples) {
      for (let v = 0; v < m; v++) {
        next.push([...prefix, v]);
      }
    }
    tuples = next;
  }
  return tuples;
}

export function isDirectProductCyclic(moduli: number[]): boolean {
  for (let i = 0; i < moduli.length; i++) {
    for (let j = i + 1; j < moduli.length; j++) {
      if (gcd(moduli[i], moduli[j]) !== 1) return false;
    }
  }
  return true;
}

export function directProductToCanonical(moduli: number[]): {
  elementaryDivisors: number[];
  invariantFactors: number[];
  elementaryLabel: string;
  invariantLabel: string;
} {
  const primeExps = new Map<number, number[]>();
  for (const m of moduli) {
    if (m <= 1) continue;
    for (const { prime, exponent } of primeFactorization(m)) {
      const list = primeExps.get(prime) ?? [];
      list.push(exponent);
      primeExps.set(prime, list);
    }
  }
  const primeParts = Array.from(primeExps.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([prime, exps]) => ({
      prime,
      partition: exps.sort((a, b) => b - a),
    }));

  const elementaryDivisors = primeParts.flatMap((p) =>
    p.partition.map((e) => Math.pow(p.prime, e))
  );
  const invariantFactors = elementaryToInvariantFactors(primeParts);
  return {
    elementaryDivisors: elementaryDivisors.length ? elementaryDivisors : [1],
    invariantFactors: invariantFactors.length ? invariantFactors : [1],
    elementaryLabel: formatZnProduct(elementaryDivisors),
    invariantLabel: formatZnProduct(invariantFactors),
  };
}
