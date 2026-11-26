import {
  addDirectProductTuples,
  classifyAbelianGroups,
  computeOrderDistribution,
  directProductToCanonical,
  formatTuple,
  formatZnProduct,
  inverseDirectProductTuple,
  isDirectProductCyclic,
  orderDirectProductTuple,
} from '../../math/abelian.ts';
import {
  createDihedralElement,
  dihedralInverse,
  dihedralOrder,
  formatDihedral,
  generateDn,
  multiplyDihedral,
} from '../../math/dihedral.ts';
import {
  coprimesBelow,
  divisors,
  eulerPhi,
  formatPrimeFactorization,
  gcd,
  inverseInZn,
  lcm,
  mod,
  orderInZn,
  primeFactorization,
} from '../../math/numberTheory.ts';
import {
  composePerm,
  formatCycleNotation,
  formatTranspositions,
  invertPerm,
  parseCycleString,
  permOrder,
  permParity,
} from '../../math/permutations.ts';
import type { AssessmentDifficulty, MCQQuestion } from '../../types/algebra.ts';

function pickUniqueOptions(
  correct: string,
  candidateDistractors: string[],
  fallbackPrefix = 'Option'
): [string, string, string, string] {
  const seen = new Set<string>([correct]);
  const distractors: string[] = [];
  for (const d of candidateDistractors) {
    if (!seen.has(d)) {
      seen.add(d);
      distractors.push(d);
      if (distractors.length === 3) break;
    }
  }
  let idx = 1;
  while (distractors.length < 3) {
    const candidate = `${fallbackPrefix} ${idx++}`;
    if (!seen.has(candidate)) {
      seen.add(candidate);
      distractors.push(candidate);
    }
  }
  return [correct, distractors[0], distractors[1], distractors[2]];
}

function makeQ(
  id: string,
  subsectionId: string,
  difficulty: AssessmentDifficulty,
  category: MCQQuestion['category'],
  prompt: string,
  correct: string,
  distractors: string[],
  explanation: string,
  tags: string[]
): MCQQuestion {
  return {
    id,
    subsectionId,
    moduleId: subsectionId.split('-')[0],
    difficulty,
    category,
    prompt,
    options: pickUniqueOptions(correct, distractors),
    correctIndex: 0,
    explanation,
    tags,
  };
}

export function buildGeneratedQuestionsForAllSubsections(): MCQQuestion[] {
  const qs: MCQQuestion[] = [];
  let seq = 1;
  const nextId = (sub: string) => `gen-${sub}-${seq++}`;

  // =========================================================
  // MODULE 1: Fundamentals of Finite Groups (m1-s1, m1-s2, m1-s3)
  // =========================================================
  // m1-s1: Group axioms, modular sums, multiplicative units U(n), non-groups
  const zModSamples = [
    { n: 5, a: 3, b: 4 },
    { n: 6, a: 4, b: 5 },
    { n: 7, a: 5, b: 6 },
    { n: 8, a: 5, b: 7 },
    { n: 9, a: 7, b: 8 },
    { n: 10, a: 6, b: 9 },
    { n: 11, a: 8, b: 9 },
    { n: 12, a: 7, b: 10 },
    { n: 14, a: 9, b: 11 },
    { n: 15, a: 11, b: 13 },
    { n: 16, a: 9, b: 15 },
    { n: 18, a: 13, b: 14 },
  ];
  for (const { n, a, b } of zModSamples) {
    const sum = mod(a + b, n);
    qs.push(
      makeQ(
        nextId('m1-s1'),
        'm1-s1',
        'Beginner',
        'calculation',
        `In the finite group ⟨ℤ_${n}, +_${n}⟩, what is ${a} +_${n} ${b}?`,
        String(sum),
        [String(a + b), String(mod(sum + 1, n)), String(mod(sum + 2, n)), String(mod(a * b, n))],
        `${a} + ${b} = ${a + b}, and reducing modulo ${n} yields ${sum}.`,
        ['modular addition', `Z_${n}`]
      )
    );
    const inv = inverseInZn(a, n);
    qs.push(
      makeQ(
        nextId('m1-s1'),
        'm1-s1',
        'Beginner',
        'calculation',
        `In ⟨ℤ_${n}, +_${n}⟩, which element is the additive inverse of ${a}?`,
        String(inv),
        [String(a), String(mod(inv + 1, n)), String(mod(n - inv + 1, n)), '0'],
        `${a} + ${inv} = ${n} ≡ 0 (mod ${n}), so ${inv} is the unique inverse of ${a}.`,
        ['inverse', `Z_${n}`]
      )
    );
  }
  const multModCandidates = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26];
  for (const n of multModCandidates) {
    const units = coprimesBelow(n);
    const phi = units.length;
    qs.push(
      makeQ(
        nextId('m1-s1'),
        'm1-s1',
        'Intermediate',
        'property',
        `What is the order of the multiplicative group of units U(${n}) = {k ∈ ℤ_${n} : gcd(k, ${n}) = 1}?`,
        String(phi),
        [String(n), String(n - 1), String(phi + 1), String(Math.max(1, phi - 2))],
        `An element k ∈ ℤ_${n} has a multiplicative inverse mod ${n} iff gcd(k, ${n}) = 1, giving φ(${n}) = ${phi} elements.`,
        ['units', 'inverses']
      )
    );
  }
  const nonGroupSets = [
    { set: '{0, 2, 4} under +₆', status: 'Yes, closed subgroup of order 3', reason: '2+2=4, 2+4=0, 4+4=2 mod 6; identity 0 and inverses exist.' },
    { set: '{1, 2, 3} under +₄', status: 'No, fails closure and lacks identity 0', reason: '1 + 3 = 4 ≡ 0 ∉ {1, 2, 3}.' },
    { set: '{1, 3} under ·₄', status: 'Yes, abelian group of order 2', reason: '1·3 = 3, 3·3 = 9 ≡ 1 (mod 4).' },
    { set: '{0, 1, 2} under ·₃', status: 'No, 0 has no multiplicative inverse', reason: '0 · x = 0 ≠ 1 for all x.' },
    { set: '{1, 2, 3, 4} under ·₅', status: 'Yes, cyclic group of order 4', reason: '5 is prime, so all nonzero residues mod 5 are invertible.' },
    { set: '{0, 3, 6} under +₉', status: 'Yes, cyclic group of order 3', reason: 'Multiples of 3 mod 9 form a closed subgroup with identity 0.' },
    { set: '{1, 5, 7, 11} under ·₁₂', status: 'Yes, Klein 4-like unit group of order 4', reason: 'Every element squares to 1 mod 12 (closed, associative, identity 1, self-inverses).' },
    { set: '{0, 1, 2, 3, 4} under subtraction mod 5', status: 'No, subtraction mod 5 is not associative', reason: '(1 - 2) - 3 = -4 ≡ 1, whereas 1 - (2 - 3) = 2 (mod 5).' },
    { set: '{1, 2, 4, 8} under ·₁₅', status: 'Yes, cyclic group of order 4 generated by 2', reason: '2¹=2, 2²=4, 2³=8, 2⁴=16≡1 (mod 15).' },
    { set: '{0, 2, 4, 6} under ·₈', status: 'No, lacks multiplicative identity 1 and inverses', reason: '1 ∉ {0, 2, 4, 6} and 2·4 ≡ 0.' },
  ];
  for (const item of nonGroupSets) {
    qs.push(
      makeQ(
        nextId('m1-s1'),
        'm1-s1',
        'Intermediate',
        'counterexample',
        `Determine whether ${item.set} forms a finite group:`,
        item.status,
        [
          item.status.startsWith('Yes') ? 'No, fails associativity' : 'Yes, forms an abelian group',
          item.status.startsWith('Yes') ? 'No, lacks an identity element' : 'Yes, forms a cyclic group',
          'Only if zero is removed from every calculation',
        ],
        item.reason,
        ['group axioms']
      )
    );
  }

  // m1-s2: Uniqueness, equations a*x*b=c, inverses of products in D_n & S_n
  for (let n = 4; n <= 8; n++) {
    for (let k = 1; k < n; k++) {
      if (qs.filter((q) => q.subsectionId === 'm1-s2').length >= 47) break;
      const a = createDihedralElement(n, 0, k);
      const b = createDihedralElement(n, 1, (k + 1) % n);
      const prod = multiplyDihedral(a, b).result;
      const invProd = dihedralInverse(prod);
      const wrongOrder = multiplyDihedral(dihedralInverse(a), dihedralInverse(b)).result;
      qs.push(
        makeQ(
          nextId('m1-s2'),
          'm1-s2',
          'Intermediate',
          'calculation',
          `In D_${n}, let a = ${formatDihedral(a)} and b = ${formatDihedral(b)}. Using (ab)⁻¹ = b⁻¹a⁻¹, what is (ab)⁻¹?`,
          formatDihedral(invProd),
          [
            formatDihedral(wrongOrder),
            formatDihedral(prod),
            formatDihedral(createDihedralElement(n, 0, (n - k + 1) % n)),
            '1',
            'ρ',
          ],
          `First ab = ${formatDihedral(prod)}; because ${formatDihedral(prod)} is a reflection, its inverse is ${formatDihedral(invProd)} = b⁻¹a⁻¹.`,
          ['socks-and-shoes', `D_${n}`]
        )
      );
    }
  }
  const s4Inverses = ['(1 2 3)', '(1 3 4)', '(1 2 3 4)', '(1 4 2 3)', '(1 2)(3 4)', '(2 3 4)', '(1 4 3)', '(1 3)(2 4)', '(1 2 4)', '(1 3 2)'];
  for (const c of s4Inverses) {
    const p = parseCycleString(c, 4);
    const inv = invertPerm(p);
    qs.push(
      makeQ(
        nextId('m1-s2'),
        'm1-s2',
        'Intermediate',
        'calculation',
        `In S₄, what is the unique inverse of σ = ${formatCycleNotation(p)}?`,
        formatCycleNotation(inv),
        [
          formatCycleNotation(composePerm(p, p)),
          '(1, 4, 2)',
          'ι',
          '(2, 4, 1)',
        ],
        `Reversing the cycle mapping of ${formatCycleNotation(p)} produces ${formatCycleNotation(inv)}, satisfying σσ⁻¹ = ι.`,
        ['inverse', 'S_4']
      )
    );
  }
  const eqSamples = [
    { a: 3, b: 4, c: 2, n: 7 },
    { a: 5, b: 6, c: 1, n: 9 },
    { a: 7, b: 8, c: 3, n: 10 },
    { a: 4, b: 9, c: 5, n: 11 },
    { a: 5, b: 7, c: 2, n: 12 },
    { a: 8, b: 10, c: 4, n: 13 },
    { a: 9, b: 5, c: 3, n: 14 },
    { a: 6, b: 11, c: 4, n: 15 },
    { a: 7, b: 12, c: 5, n: 16 },
    { a: 10, b: 13, c: 2, n: 17 },
    { a: 11, b: 9, c: 6, n: 18 },
    { a: 12, b: 14, c: 7, n: 19 },
    { a: 9, b: 15, c: 8, n: 20 },
  ];
  for (const { a, b, c, n } of eqSamples) {
    const x = mod(c - a - b, n);
    qs.push(
      makeQ(
        nextId('m1-s2'),
        'm1-s2',
        'Beginner',
        'calculation',
        `Solve for x ∈ ℤ_${n} in the group equation ${a} + x + ${b} ≡ ${c} (mod ${n}).`,
        String(x),
        [String(mod(c + a + b, n)), String(mod(x + 1, n)), String(mod(a + b - c, n)), String(mod(x + 2, n))],
        `Subtract ${a} and ${b} modulo ${n}: x ≡ ${c} − ${a} − ${b} ≡ ${x} (mod ${n}).`,
        ['linear group equation', `Z_${n}`]
      )
    );
  }

  // m1-s3: Direct product arithmetic, orders, abelian vs nonabelian
  const dpPairs: { moduli: number[]; x: number[]; y: number[] }[] = [
    { moduli: [2, 3], x: [1, 2], y: [1, 2] },
    { moduli: [2, 4], x: [1, 3], y: [1, 2] },
    { moduli: [3, 4], x: [2, 3], y: [2, 2] },
    { moduli: [3, 5], x: [2, 4], y: [2, 3] },
    { moduli: [4, 6], x: [3, 5], y: [2, 4] },
    { moduli: [5, 6], x: [4, 5], y: [3, 2] },
    { moduli: [2, 3, 4], x: [1, 2, 3], y: [1, 1, 2] },
    { moduli: [2, 3, 5], x: [1, 2, 4], y: [0, 2, 3] },
    { moduli: [3, 3], x: [2, 1], y: [2, 2] },
    { moduli: [4, 4], x: [3, 2], y: [2, 3] },
    { moduli: [6, 8], x: [5, 7], y: [4, 5] },
    { moduli: [4, 10], x: [3, 7], y: [2, 8] },
  ];
  for (const { moduli, x, y } of dpPairs) {
    const sum = addDirectProductTuples(x, y, moduli);
    const invX = inverseDirectProductTuple(x, moduli);
    const totalOrder = moduli.reduce((a, b) => a * b, 1);
    const grpLabel = formatZnProduct(moduli);
    qs.push(
      makeQ(
        nextId('m1-s3'),
        'm1-s3',
        'Beginner',
        'calculation',
        `In ${grpLabel}, compute ${formatTuple(x)} + ${formatTuple(y)}.`,
        formatTuple(sum),
        [
          formatTuple(x.map((v, i) => v + y[i])),
          formatTuple(sum.map((v, i) => mod(v + 1, moduli[i]))),
          formatTuple(invX),
        ],
        `Add each coordinate modulo its own component modulus: ${formatTuple(sum)}.`,
        ['direct product', 'addition']
      )
    );
    qs.push(
      makeQ(
        nextId('m1-s3'),
        'm1-s3',
        'Beginner',
        'calculation',
        `What is the inverse of ${formatTuple(x)} in ${grpLabel}?`,
        formatTuple(invX),
        [
          formatTuple(x),
          formatTuple(sum),
          formatTuple(invX.map((v, i) => mod(v + 1, moduli[i]))),
        ],
        `Negate each coordinate modulo its modulus to obtain ${formatTuple(invX)}.`,
        ['direct product', 'inverse']
      )
    );
    qs.push(
      makeQ(
        nextId('m1-s3'),
        'm1-s3',
        'Beginner',
        'property',
        `What is the group order |${grpLabel}|?`,
        String(totalOrder),
        [
          String(moduli.reduce((a, b) => a + b, 0)),
          String(lcm(moduli[0], moduli[1])),
          String(totalOrder * 2),
        ],
        `The order of a direct product equals the product of component orders: ${moduli.join(' × ')} = ${totalOrder}.`,
        ['direct product', 'order']
      )
    );
  }
  const nonAbProducts = [
    { name: 'ℤ₂ × S₃', order: 12, abelian: false },
    { name: 'ℤ₃ × D₄', order: 24, abelian: false },
    { name: 'ℤ₂ × ℤ₃ × ℤ₅', order: 30, abelian: true },
    { name: 'ℤ₄ × D₃', order: 24, abelian: false },
    { name: 'ℤ₅ × ℤ₇', order: 35, abelian: true },
    { name: 'S₃ × S₃', order: 36, abelian: false },
    { name: 'D₄ × D₅', order: 80, abelian: false },
    { name: 'ℤ₂ × ℤ₄ × ℤ₉', order: 72, abelian: true },
    { name: 'ℤ₂ × A₄', order: 24, abelian: false },
    { name: 'ℤ₃ × ℤ₅ × ℤ₁₁', order: 165, abelian: true },
    { name: 'ℤ₄ × S₄', order: 96, abelian: false },
    { name: 'D₆ × ℤ₃', order: 36, abelian: false },
  ];
  for (const item of nonAbProducts) {
    qs.push(
      makeQ(
        nextId('m1-s3'),
        'm1-s3',
        'Intermediate',
        'property',
        `Determine the order and commutativity of ${item.name}:`,
        `Order ${item.order}, ${item.abelian ? 'abelian' : 'nonabelian'}`,
        [
          `Order ${item.order}, ${item.abelian ? 'nonabelian' : 'abelian'}`,
          `Order ${item.order / 2}, ${item.abelian ? 'abelian' : 'nonabelian'}`,
          `Order ${item.order * 2}, nonabelian`,
        ],
        `${item.name} has order ${item.order} and is ${item.abelian ? 'abelian because every factor is abelian' : 'nonabelian because it contains a nonabelian factor'}.`,
        ['abelian vs nonabelian']
      )
    );
  }

  // =========================================================
  // MODULE 2: Finite Abelian Groups (m2-s1, m2-s2, m2-s3)
  // =========================================================
  // m2-s1: cyclic subgroup sizes, generators, subgroups of Z_n
  for (let n = 6; n <= 30; n++) {
    const divs = divisors(n);
    const phi = eulerPhi(n);
    const sampleD = divs[Math.min(1, divs.length - 1)];
    const genSub = n / sampleD;
    qs.push(
      makeQ(
        nextId('m2-s1'),
        'm2-s1',
        'Beginner',
        'calculation',
        `In the cyclic group ℤ_${n}, how many subgroups exist in total?`,
        String(divs.length),
        [String(phi), String(n), String(divs.length + 2)],
        `ℤ_${n} has exactly one subgroup per divisor of ${n}; divisors are {${divs.join(', ')}}, count = ${divs.length}.`,
        ['cyclic subgroups', `Z_${n}`]
      )
    );
    if (qs.filter((q) => q.subsectionId === 'm2-s1').length < 52) {
      qs.push(
        makeQ(
          nextId('m2-s1'),
          'm2-s1',
          'Intermediate',
          'calculation',
          `In ℤ_${n}, what is the order of the cyclic subgroup ⟨${genSub}⟩?`,
          String(sampleD),
          [String(genSub), String(n), String(phi)],
          `|⟨${genSub}⟩| = ${n} / gcd(${n}, ${genSub}) = ${sampleD}.`,
          ['cyclic subgroup order']
        )
      );
    }
  }

  // m2-s2: direct products of cyclic groups: element orders & cyclicity
  const m2s2Moduli: [number, number][] = [
    [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 8], [3, 3], [3, 4], [3, 5], [3, 6],
    [3, 9], [4, 4], [4, 5], [4, 6], [4, 9], [5, 6], [6, 6], [6, 8], [6, 9], [8, 9],
  ];
  for (const [m, n] of m2s2Moduli) {
    const isCyc = isDirectProductCyclic([m, n]);
    const maxOrd = lcm(m, n);
    qs.push(
      makeQ(
        nextId('m2-s2'),
        'm2-s2',
        'Intermediate',
        'property',
        `Is ℤ_${m} × ℤ_${n} cyclic, and what is its maximum element order?`,
        `${isCyc ? 'Yes (cyclic)' : 'No (non-cyclic)'}, max order ${maxOrd}`,
        [
          `${isCyc ? 'No (non-cyclic)' : 'Yes (cyclic)'}, max order ${m * n}`,
          `${isCyc ? 'Yes (cyclic)' : 'No (non-cyclic)'}, max order ${m + n}`,
          `No (non-cyclic), max order ${gcd(m, n)}`,
        ],
        `gcd(${m}, ${n}) = ${gcd(m, n)}, so max element order is lcm(${m}, ${n}) = ${maxOrd} (${isCyc ? 'equals' : 'strictly less than'} order ${m * n}).`,
        ['direct product', 'max order']
      )
    );
    const a = Math.max(1, m - 1);
    const b = Math.max(1, Math.floor(n / 2));
    const elOrd = orderDirectProductTuple([a, b], [m, n]);
    qs.push(
      makeQ(
        nextId('m2-s2'),
        'm2-s2',
        'Intermediate',
        'calculation',
        `Compute the order of (${a}, ${b}) in ℤ_${m} × ℤ_${n}.`,
        String(elOrd),
        [
          String(orderInZn(a, m) * orderInZn(b, n)),
          String(orderInZn(a, m) + orderInZn(b, n)),
          String(gcd(orderInZn(a, m), orderInZn(b, n))),
        ],
        `ord(${a}) in ℤ_${m} is ${orderInZn(a, m)}, ord(${b}) in ℤ_${n} is ${orderInZn(b, n)}, so lcm = ${elOrd}.`,
        ['element order', 'lcm']
      )
    );
  }
  const tripleOrders: number[][] = [
    [2, 2, 3], [2, 4, 3], [2, 3, 5], [3, 3, 2], [2, 2, 2], [2, 4, 6], [3, 4, 5], [2, 6, 9], [4, 4, 3], [2, 5, 7],
  ];
  for (const modList of tripleOrders) {
    const tuple = [1, 1, 1];
    const ord = orderDirectProductTuple(tuple, modList);
    qs.push(
      makeQ(
        nextId('m2-s2'),
        'm2-s2',
        'Advanced',
        'calculation',
        `What is the order of (1, 1, 1) in ${formatZnProduct(modList)}?`,
        String(ord),
        [
          String(modList.reduce((a, b) => a * b, 1)),
          String(modList.reduce((a, b) => a + b, 0)),
          String(ord === 2 ? 4 : 2),
        ],
        `Since each coordinate 1 has order equal to its modulus, ord(1,1,1) = lcm(${modList.join(', ')}) = ${ord}.`,
        ['triple direct product']
      )
    );
  }

  // m2-s3: Structural contrast, counting elements of a specific order across groups of same order
  const sameOrderComparisons: { n: number; g1: number[]; g2: number[]; targetOrd: number }[] = [
    { n: 4, g1: [4], g2: [2, 2], targetOrd: 2 },
    { n: 4, g1: [4], g2: [2, 2], targetOrd: 4 },
    { n: 8, g1: [8], g2: [2, 4], targetOrd: 2 },
    { n: 8, g1: [2, 4], g2: [2, 2, 2], targetOrd: 2 },
    { n: 8, g1: [2, 4], g2: [2, 2, 2], targetOrd: 4 },
    { n: 9, g1: [9], g2: [3, 3], targetOrd: 3 },
    { n: 9, g1: [9], g2: [3, 3], targetOrd: 9 },
    { n: 12, g1: [12], g2: [2, 6], targetOrd: 2 },
    { n: 12, g1: [12], g2: [2, 6], targetOrd: 6 },
    { n: 12, g1: [12], g2: [2, 6], targetOrd: 12 },
    { n: 16, g1: [16], g2: [4, 4], targetOrd: 4 },
    { n: 16, g1: [4, 4], g2: [2, 8], targetOrd: 8 },
    { n: 16, g1: [4, 4], g2: [2, 2, 4], targetOrd: 2 },
    { n: 16, g1: [2, 2, 2, 2], g2: [4, 4], targetOrd: 2 },
    { n: 18, g1: [18], g2: [3, 6], targetOrd: 3 },
    { n: 18, g1: [18], g2: [3, 6], targetOrd: 9 },
    { n: 24, g1: [24], g2: [2, 12], targetOrd: 2 },
    { n: 24, g1: [2, 12], g2: [2, 2, 6], targetOrd: 2 },
    { n: 24, g1: [2, 12], g2: [2, 2, 6], targetOrd: 12 },
    { n: 27, g1: [27], g2: [3, 9], targetOrd: 3 },
    { n: 27, g1: [3, 9], g2: [3, 3, 3], targetOrd: 3 },
    { n: 36, g1: [36], g2: [6, 6], targetOrd: 6 },
    { n: 36, g1: [2, 18], g2: [3, 12], targetOrd: 2 },
    { n: 36, g1: [2, 18], g2: [3, 12], targetOrd: 3 },
    { n: 72, g1: [6, 12], g2: [2, 36], targetOrd: 12 },
  ];
  for (const cmp of sameOrderComparisons) {
    const d1 = computeOrderDistribution(cmp.g1);
    const d2 = computeOrderDistribution(cmp.g2);
    const c1 = d1[cmp.targetOrd] ?? 0;
    const c2 = d2[cmp.targetOrd] ?? 0;
    qs.push(
      makeQ(
        nextId('m2-s3'),
        'm2-s3',
        'Intermediate',
        'calculation',
        `Compare the number of elements of order ${cmp.targetOrd} in ${formatZnProduct(cmp.g1)} versus ${formatZnProduct(cmp.g2)} (both of order ${cmp.n}):`,
        `${c1} vs ${c2}`,
        [`${c2} vs ${c1 + 2}`, `${c1 + 1} vs ${c2 + 1}`, `${cmp.targetOrd} vs ${cmp.n}`],
        `${formatZnProduct(cmp.g1)} has ${c1} elements of order ${cmp.targetOrd}, whereas ${formatZnProduct(cmp.g2)} has ${c2}.`,
        ['order count', 'structural contrast']
      )
    );
    qs.push(
      makeQ(
        nextId('m2-s3'),
        'm2-s3',
        'Intermediate',
        'property',
        `What is the maximum element order in ${formatZnProduct(cmp.g2)}?`,
        String(Math.max(...Object.keys(d2).map(Number))),
        [
          String(cmp.n),
          String(Math.min(...cmp.g2)),
          String(Math.max(...Object.keys(d2).map(Number)) * 2),
        ],
        `The maximum element order in ${formatZnProduct(cmp.g2)} is lcm(${cmp.g2.join(', ')}) = ${Math.max(...Object.keys(d2).map(Number))}.`,
        ['exponent', 'structural contrast']
      )
    );
  }

  // =========================================================
  // MODULE 3: Classification of Finite Abelian Groups (m3-s1, m3-s2, m3-s3)
  // =========================================================
  const classifyOrders = [
    4, 6, 8, 9, 10, 12, 16, 18, 20, 24, 25, 27, 28, 30, 32, 36, 40, 44, 45, 48,
    49, 50, 52, 54, 60, 63, 64, 72, 75, 80, 81, 84, 90, 96, 98, 100, 108, 120, 125, 144,
    150, 160, 162, 180, 200, 216, 240, 250, 270, 300, 360,
  ];
  for (const ord of classifyOrders) {
    const cls = classifyAbelianGroups(ord);
    const nonCyclic = cls.groups[cls.groups.length - 1];
    // m3-s1: primary factor / partition reasoning
    qs.push(
      makeQ(
        nextId('m3-s1'),
        'm3-s1',
        'Intermediate',
        'calculation',
        `For order ${ord} = ${cls.primeFactorizationText}, which list is a valid elementary-divisor decomposition?`,
        nonCyclic.elementaryLabel,
        [
          ord % 2 === 0 && ord > 2 ? `ℤ_${ord / 2} × ℤ_2` : `ℤ_${ord} × ℤ_2`,
          `ℤ_${ord + 1}`,
          `ℤ_1 × ℤ_${ord}`,
        ],
        `Elementary divisors must be prime powers whose product is ${ord}: ${nonCyclic.elementaryLabel}.`,
        ['elementary divisors', `order ${ord}`]
      )
    );
    // m3-s2: invariant factor conversion
    if (cls.groups.length > 1) {
      const target = cls.groups[Math.min(1, cls.groups.length - 1)];
      qs.push(
        makeQ(
          nextId('m3-s2'),
          'm3-s2',
          'Intermediate',
          'calculation',
          `Convert the elementary-divisor group ${target.elementaryLabel} (order ${ord}) into invariant-factor form d₁ | d₂ | ⋯ | dᵣ:`,
          target.invariantLabel,
          [
            cls.groups[0].invariantLabel,
            nonCyclic.invariantLabel === target.invariantLabel ? `ℤ_${ord}` : nonCyclic.invariantLabel,
            `ℤ_${ord + 2}`,
          ],
          `Aligning the highest prime powers at the right yields invariant factors ${target.invariantLabel} with divisibility ${target.invariantFactors.join(' | ')}.`,
          ['invariant factors', `order ${ord}`]
        )
      );
    }
    // m3-s3: total count of non-isomorphic abelian groups of order ord
    qs.push(
      makeQ(
        nextId('m3-s3'),
        'm3-s3',
        cls.totalGroups >= 6 ? 'Advanced' : 'Intermediate',
        'calculation',
        `How many non-isomorphic finite abelian groups exist of order ${ord} = ${cls.primeFactorizationText}?`,
        String(cls.totalGroups),
        [
          String(cls.totalGroups + 1),
          String(cls.totalGroups + 2),
          String(Math.max(1, cls.totalGroups - 1)),
        ],
        `Factor ${ord} = ${cls.primeFactorizationText} and multiply integer partition counts of exponents to get ${cls.totalGroups} groups.`,
        ['counting abelian groups', `order ${ord}`]
      )
    );
  }
  // Extra m3-s1 and m3-s2 conversion problems from direct products
  const mixedProducts: number[][] = [
    [2, 6], [4, 6], [6, 6], [4, 12], [6, 9], [6, 10], [4, 10], [6, 12], [8, 12], [9, 12], [10, 15], [12, 18],
  ];
  for (const modList of mixedProducts) {
    const can = directProductToCanonical(modList);
    qs.push(
      makeQ(
        nextId('m3-s1'),
        'm3-s1',
        'Intermediate',
        'calculation',
        `What is the elementary-divisor decomposition of ${formatZnProduct(modList)}?`,
        can.elementaryLabel,
        [can.invariantLabel, `ℤ_${modList.reduce((a, b) => a * b, 1)}`, 'ℤ₂ × ℤ₃ × ℤ₅'],
        `Split each modulus into prime powers to get ${can.elementaryLabel}.`,
        ['elementary divisors']
      )
    );
    qs.push(
      makeQ(
        nextId('m3-s2'),
        'm3-s2',
        'Intermediate',
        'calculation',
        `What is the invariant-factor decomposition of ${formatZnProduct(modList)}?`,
        can.invariantLabel,
        [
          `ℤ_${modList.reduce((a, b) => a * b, 1) + 1}`,
          can.elementaryLabel === can.invariantLabel ? `ℤ_${modList.reduce((a, b) => a * b, 1)}` : can.elementaryLabel,
          'ℤ₂ × ℤ₂',
        ],
        `Recombining coprime prime powers right-to-left gives invariant factors ${can.invariantLabel}.`,
        ['invariant factors']
      )
    );
  }

  // =========================================================
  // MODULE 4: Permutation Groups (m4-s1, m4-s2, m4-s3)
  // =========================================================
  // m4-s1: Two-row <-> cycle conversion
  const permSeeds5 = [
    '(1 2)', '(1 3 2)', '(1 4 3 2)', '(1 2)(3 4)', '(1 3 5)', '(1 4)(2 5)',
    '(1 2 3 4 5)', '(2 4 5 3)', '(1 5 2)(3 4)', '(1 3)(2 4 5)',
    '(1 4 2)(3 5)', '(2 3)(4 5)', '(1 5 4 3)', '(1 2 4 5)', '(1 3 4)(2 5)',
    '(1 5)(2 3)', '(1 4 5)', '(2 5 4)', '(1 2 5 3)', '(3 4 5)',
    '(1 4 3)', '(1 5 3 2)', '(1 3 2 4)', '(2 3 5 4)', '(1 2)(3 5)',
  ];
  for (const s of permSeeds5) {
    const p = parseCycleString(s, 5);
    const bot = p.mapping.join(' ');
    const inv = invertPerm(p);
    qs.push(
      makeQ(
        nextId('m4-s1'),
        'm4-s1',
        'Beginner',
        'calculation',
        `In S₅, which disjoint cycle notation corresponds to two-row mapping [1 2 3 4 5] ↦ [${bot}]?`,
        formatCycleNotation(p),
        [
          formatCycleNotation(inv) === formatCycleNotation(p) ? '(1, 5, 4, 3, 2)' : formatCycleNotation(inv),
          '(1, 2, 3, 4)',
          'ι',
        ],
        `Tracing 1..5 through [${bot}] gives disjoint cycles ${formatCycleNotation(p)}.`,
        ['two-row notation', 'S_5']
      )
    );
    const fixedPts = p.mapping.filter((v, idx) => v === idx + 1);
    qs.push(
      makeQ(
        nextId('m4-s1'),
        'm4-s1',
        'Beginner',
        'property',
        `For σ = ${formatCycleNotation(p)} in S₅, which elements are fixed points (unchanged by σ)?`,
        fixedPts.length === 0 ? 'None (no fixed points)' : `{${fixedPts.join(', ')}}`,
        ['{1, 2, 3, 4, 5}', '{1}', fixedPts.length === 0 ? '{5}' : 'None (no fixed points)'],
        `Elements absent from all cycles of length ≥ 2 map to themselves: ${fixedPts.length === 0 ? 'none' : fixedPts.join(', ')}.`,
        ['fixed points', 'S_5']
      )
    );
  }

  // m4-s2: Right-to-left composition & order
  const compPairs: [string, string, number][] = [
    ['(1 2)', '(1 3)', 3], ['(1 3)', '(1 2)', 3], ['(1 2 3)', '(1 2)', 3], ['(1 2)', '(1 2 3)', 3],
    ['(1 2 3)', '(2 3 4)', 4], ['(1 3 4)', '(1 2 4)', 4], ['(1 2)(3 4)', '(1 3 2)', 4], ['(1 4 2)', '(2 3 4)', 4],
    ['(1 2 3 4)', '(1 3)', 4], ['(2 4)', '(1 2 3 4)', 4], ['(1 2 3)(4 5)', '(2 4)', 5], ['(1 3 5)', '(2 3 4)', 5],
    ['(1 4)(2 5)', '(1 2 3)', 5], ['(1 5 2)', '(2 3 5 4)', 5], ['(1 2 4 5)', '(1 3)', 5], ['(3 4 5)', '(1 3 4)', 5],
    ['(1 2 3 4 5)', '(1 2)', 5], ['(1 5)', '(1 2 3 4 5)', 5], ['(1 3 2)(4 5)', '(1 4 2)', 5], ['(2 5 3)', '(1 4 5)', 5],
    ['(1 2)(4 5)', '(2 3)(4 5)', 5], ['(1 3 4)', '(2 5)', 5], ['(1 4 5 2)', '(2 3)', 5], ['(1 5 3)', '(1 2 4)', 5],
    ['(1 2 3)', '(3 4 5)', 5],
  ];
  for (const [aStr, bStr, deg] of compPairs) {
    const a = parseCycleString(aStr, deg);
    const b = parseCycleString(bStr, deg);
    const prod = composePerm(a, b);
    const rev = composePerm(b, a);
    const ord = permOrder(prod);
    qs.push(
      makeQ(
        nextId('m4-s2'),
        'm4-s2',
        'Intermediate',
        'calculation',
        `Using Fraleigh’s right-to-left convention in S_${deg}, compute ${formatCycleNotation(a)}${formatCycleNotation(b)} in disjoint cycle form:`,
        formatCycleNotation(prod),
        [
          formatCycleNotation(rev) === formatCycleNotation(prod) ? '(1, 2, 3, 4)' : formatCycleNotation(rev),
          formatCycleNotation(invertPerm(prod)),
          'ι',
        ],
        `Apply the right factor ${formatCycleNotation(b)} first, then ${formatCycleNotation(a)}, yielding ${formatCycleNotation(prod)}.`,
        ['composition', `S_${deg}`]
      )
    );
    qs.push(
      makeQ(
        nextId('m4-s2'),
        'm4-s2',
        'Intermediate',
        'calculation',
        `What is the order of the permutation ${formatCycleNotation(prod)} in S_${deg}?`,
        String(ord),
        [String(ord + 1), String(ord === 2 ? 3 : 2), String(deg + 1)],
        `In disjoint cycle form ${formatCycleNotation(prod)}, the lcm of cycle lengths is ${ord}.`,
        ['order', `S_${deg}`]
      )
    );
  }

  // m4-s3: Transpositions, parity, A_n membership
  const parityPool: [string, number][] = [
    ['(1 2)', 4], ['(1 2 3)', 4], ['(1 2 3 4)', 4], ['(1 2)(3 4)', 4], ['(1 2)(2 3)', 4],
    ['(1 2 3)(4 5)', 5], ['(1 2 3 4 5)', 5], ['(1 3)(2 5)', 5], ['(1 4 2)(3 5)', 5], ['(1 2 3 4)', 5],
    ['(1 5)(2 4 3)', 5], ['(1 3 5)', 5], ['(1 2)(3 4)(1 5)', 5], ['(1 4 5 2)', 5], ['(2 3 4 5)', 5],
    ['(1 2 3)(2 4 5)', 5], ['(1 5 4)(2 3)', 5], ['(1 3 2 5 4)', 5], ['(1 4)(2 3)', 5], ['(1 2)(1 3)(1 4)', 5],
    ['(1 2 3 4)(4 5)', 5], ['(1 5 2 3)', 5], ['(2 4)(3 5)(1 2)', 5], ['(1 3 4 5)', 5], ['(1 4 3 2 5)', 5],
  ];
  for (const [cStr, deg] of parityPool) {
    const p = parseCycleString(cStr, deg);
    const par = permParity(p);
    const trans = formatTranspositions(p);
    qs.push(
      makeQ(
        nextId('m4-s3'),
        'm4-s3',
        'Intermediate',
        'calculation',
        `Determine the parity of σ = ${cStr} in S_${deg} (and whether σ ∈ A_${deg}):`,
        `${par === 'even' ? 'Even' : 'Odd'} (${par === 'even' ? `belongs to A_${deg}` : `not in A_${deg}`})`,
        [
          `${par === 'even' ? 'Odd' : 'Even'} (${par === 'even' ? `not in A_${deg}` : `belongs to A_${deg}`})`,
          'Neither even nor odd',
          `Even only when degree n is even`,
        ],
        `Disjoint form is ${formatCycleNotation(p)}, factoring as ${trans}, which is ${par}.`,
        ['parity', `A_${deg}`]
      )
    );
    qs.push(
      makeQ(
        nextId('m4-s3'),
        'm4-s3',
        'Intermediate',
        'calculation',
        `Express the permutation ${formatCycleNotation(p)} as a product of transpositions using Fraleigh’s expansion:`,
        trans,
        [
          '(1, 2)(3, 4)(1, 5)(2, 4)',
          '(1, 2)',
          '(1, 3)(2, 4)(1, 5)',
        ],
        `Expand each cycle (a₁,...,aₖ) = (a₁,aₖ)...(a₁,a₂) to obtain ${trans}.`,
        ['transpositions']
      )
    );
  }

  // =========================================================
  // MODULE 5: Dihedral Groups D_n (m5-s1, m5-s2, m5-s3)
  // =========================================================
  // m5-s1: Elements, orders of D_n, angles, rotation vs reflection classification
  for (let n = 3; n <= 12; n++) {
    qs.push(
      makeQ(
        nextId('m5-s1'),
        'm5-s1',
        'Beginner',
        'calculation',
        `How many total symmetries (elements) belong to the dihedral group D_${n}?`,
        String(2 * n),
        [String(n), String(n * n), String(2 * n + 2)],
        `|D_${n}| = 2n = ${2 * n}: ${n} rotations {1, ρ, …, ρ^${n - 1}} and ${n} reflections {μ, μρ, …, μρ^${n - 1}}.`,
        [`D_${n}`, 'order']
      )
    );
    const deg = ((360 / n) * 1).toFixed(1).replace(/\.0$/, '');
    qs.push(
      makeQ(
        nextId('m5-s1'),
        'm5-s1',
        'Beginner',
        'property',
        `In D_${n}, what geometric angle corresponds to the elementary counterclockwise rotation ρ?`,
        `${deg}°`,
        [`${((180 / n)).toFixed(1).replace(/\.0$/, '')}°`, `${((720 / n)).toFixed(1).replace(/\.0$/, '')}°`, '90°'],
        `Rotating a regular ${n}-gon by 1/${n} of a full turn equals 360°/${n} = ${deg}°.`,
        ['rotation', `D_${n}`]
      )
    );
  }
  const dnElementsSample = [3, 4, 5, 6, 7, 8];
  for (const n of dnElementsSample) {
    const els = generateDn(n);
    for (let i = 1; i <= 5; i++) {
      const el = els[(i * 2 + 1) % els.length];
      const lbl = formatDihedral(el);
      const isRef = el.ref === 1;
      qs.push(
        makeQ(
          nextId('m5-s1'),
          'm5-s1',
          'Beginner',
          'definition',
          `In standard form for D_${n}, is the element ${lbl} a rotation or a reflection?`,
          isRef ? 'Reflection (reverses polygon orientation)' : 'Rotation (preserves polygon orientation)',
          [
            isRef ? 'Rotation (preserves polygon orientation)' : 'Reflection (reverses polygon orientation)',
            'Identity element 1',
            'Not a valid standard element of D_n',
          ],
          `Standard reflections carry μ on the left (μρᵏ), while rotations are powers ρᵏ (or 1).`,
          ['standard form', `D_${n}`]
        )
      );
    }
  }

  // m5-s2: Products in D_n (strictly 1, rho, mu)
  for (let n = 4; n <= 8; n++) {
    for (let i = 1; i <= 3; i++) {
      for (let j = 1; j <= 3; j++) {
        if (qs.filter((q) => q.subsectionId === 'm5-s2').length >= 52) break;
        const left = createDihedralElement(n, (i % 2) as 0 | 1, i);
        const right = createDihedralElement(n, 1, j);
        const prod = multiplyDihedral(left, right).result;
        const wrong = createDihedralElement(n, ((left.ref + right.ref) % 2) as 0 | 1, (left.k + right.k) % n);
        qs.push(
          makeQ(
            nextId('m5-s2'),
            'm5-s2',
            'Intermediate',
            'calculation',
            `In D_${n}, simplify the product (${formatDihedral(left)})(${formatDihedral(right)}) to standard form:`,
            formatDihedral(prod),
            [
              formatDihedral(wrong) === formatDihedral(prod)
                ? formatDihedral(createDihedralElement(n, prod.ref, (prod.k + 1) % n))
                : formatDihedral(wrong),
              formatDihedral(createDihedralElement(n, ((prod.ref + 1) % 2) as 0 | 1, prod.k)),
              '1',
              'ρ',
            ],
            `Apply ρᵏμ = μρⁿ⁻ᵏ and μ² = 1 to reduce (${formatDihedral(left)})(${formatDihedral(right)}) = ${formatDihedral(prod)}.`,
            ['dihedral product', `D_${n}`]
          )
        );
      }
    }
  }

  // m5-s3: Orders, inverses, and center of D_n
  for (let n = 3; n <= 10; n++) {
    const els = generateDn(n);
    for (const k of [1, 2, Math.floor(n / 2), n - 1]) {
      const rot = els[k];
      const ref = els[n + k];
      const ordRot = dihedralOrder(rot);
      const invRot = dihedralInverse(rot);
      if (qs.filter((q) => q.subsectionId === 'm5-s3').length < 52) {
        qs.push(
          makeQ(
            nextId('m5-s3'),
            'm5-s3',
            'Intermediate',
            'calculation',
            `In D_${n}, what is the order of the rotation ${formatDihedral(rot)}?`,
            String(ordRot),
            [String(2), String(2 * n), String(ordRot === n ? Math.max(2, Math.floor(n / 2)) : n)],
            `ord(ρ^${k}) = ${n} / gcd(${n}, ${k}) = ${ordRot}.`,
            ['dihedral order', `D_${n}`]
          )
        );
      }
      if (qs.filter((q) => q.subsectionId === 'm5-s3').length < 52) {
        qs.push(
          makeQ(
            nextId('m5-s3'),
            'm5-s3',
            'Intermediate',
            'calculation',
            `In D_${n}, what is the inverse of ${formatDihedral(rot)} and the inverse of ${formatDihedral(ref)}?`,
            `(${formatDihedral(rot)})⁻¹ = ${formatDihedral(invRot)}, (${formatDihedral(ref)})⁻¹ = ${formatDihedral(ref)}`,
            [
              `(${formatDihedral(rot)})⁻¹ = ${formatDihedral(rot)}, (${formatDihedral(ref)})⁻¹ = ${formatDihedral(invRot)}`,
              `Both equal 1`,
              `(${formatDihedral(rot)})⁻¹ = ${formatDihedral(invRot)}, (${formatDihedral(ref)})⁻¹ = μρ^${(n - k) % n}`,
            ],
            `Rotations invert via (ρᵏ)⁻¹ = ρⁿ⁻ᵏ, while every reflection is self-inverse.`,
            ['dihedral inverse', `D_${n}`]
          )
        );
      }
    }
  }

  // =========================================================
  // MODULE 6: Element Orders, Inverses, Cyclic Generators (m6-s1, m6-s2, m6-s3)
  // =========================================================
  // m6-s1: order in Z_n
  for (let n = 8; n <= 36; n++) {
    for (const a of [2, 3, 4, 6]) {
      if (a >= n || qs.filter((q) => q.subsectionId === 'm6-s1').length >= 52) continue;
      const ord = orderInZn(a, n);
      qs.push(
        makeQ(
          nextId('m6-s1'),
          'm6-s1',
          'Beginner',
          'calculation',
          `Compute the order of element ${a} in the additive cyclic group ℤ_${n}.`,
          String(ord),
          [String(gcd(n, a)), String(n), String(ord === 2 ? n : Math.max(1, ord - 1))],
          `ord(${a}) = ${n} / gcd(${n}, ${a}) = ${n} / ${gcd(n, a)} = ${ord}.`,
          ['element order', `Z_${n}`]
        )
      );
    }
  }

  // m6-s2: phi(n) & generators of Z_n
  for (let n = 4; n <= 56; n++) {
    if (qs.filter((q) => q.subsectionId === 'm6-s2').length >= 52) break;
    const phi = eulerPhi(n);
    const gens = coprimesBelow(n);
    qs.push(
      makeQ(
        nextId('m6-s2'),
        'm6-s2',
        'Intermediate',
        'calculation',
        `Compute φ(${n}) (the exact number of generators of ℤ_${n}). Note ${n} = ${formatPrimeFactorization(n)}.`,
        String(phi),
        [String(n - 1), String(phi + 1), String(Math.max(1, phi - 2))],
        `φ(${n}) = ${phi}; the generators are {${gens.slice(0, 8).join(', ')}${gens.length > 8 ? ', …' : ''}}.`,
        ['totient', `Z_${n}`]
      )
    );
  }

  // m6-s3: inverses across Z_n, D_n, S_n
  for (let n = 7; n <= 30; n++) {
    const a = Math.floor(n / 3) + 1;
    const inv = inverseInZn(a, n);
    qs.push(
      makeQ(
        nextId('m6-s3'),
        'm6-s3',
        'Beginner',
        'calculation',
        `What is the inverse of ${a} in ℤ_${n}?`,
        String(inv),
        [String(a), String(mod(inv + 1, n)), String(mod(n - inv + 2, n))],
        `In additive group ℤ_${n}, the inverse of ${a} is (${n} − ${a}) mod ${n} = ${inv}.`,
        ['inverse', `Z_${n}`]
      )
    );
  }
  for (let n = 3; n <= 8; n++) {
    for (let k = 1; k < n; k++) {
      if (qs.filter((q) => q.subsectionId === 'm6-s3').length >= 52) break;
      const r = createDihedralElement(n, 0, k);
      const inv = dihedralInverse(r);
      qs.push(
        makeQ(
          nextId('m6-s3'),
          'm6-s3',
          'Intermediate',
          'calculation',
          `Find the inverse of ${formatDihedral(r)} in D_${n}.`,
          formatDihedral(inv),
          [
            formatDihedral(createDihedralElement(n, 1, k)),
            formatDihedral(createDihedralElement(n, 0, (k + 1) % n)),
            '1',
            'μ',
          ],
          `(${formatDihedral(r)})⁻¹ = ρ^(${n}−${k}) = ${formatDihedral(inv)}.`,
          ['dihedral inverse']
        )
      );
    }
  }

  // =========================================================
  // MODULE 7: Cayley Tables (m7-s1, m7-s2, m7-s3)
  // =========================================================
  for (let n = 3; n <= 8; n++) {
    const els = generateDn(n);
    for (let k = 1; k <= 4; k++) {
      const row = els[(k + 1) % els.length];
      const col = els[(n + k) % els.length];
      const prod = multiplyDihedral(row, col).result;
      const rev = multiplyDihedral(col, row).result;
      if (qs.filter((q) => q.subsectionId === 'm7-s1').length < 52) {
        qs.push(
          makeQ(
            nextId('m7-s1'),
            'm7-s1',
            'Intermediate',
            'calculation',
            `In the Cayley table of D_${n} (row = left operand, column = right operand), what entry sits in row ${formatDihedral(row)}, column ${formatDihedral(col)}?`,
            formatDihedral(prod),
            [
              formatDihedral(rev) === formatDihedral(prod) ? '1' : formatDihedral(rev),
              formatDihedral(row),
              formatDihedral(col),
              'ρ',
            ],
            `Row ${formatDihedral(row)} × Column ${formatDihedral(col)} computes (${formatDihedral(row)})(${formatDihedral(col)}) = ${formatDihedral(prod)}.`,
            ['Cayley table', `D_${n}`]
          )
        );
      }
      if (qs.filter((q) => q.subsectionId === 'm7-s2').length < 52) {
        qs.push(
          makeQ(
            nextId('m7-s2'),
            'm7-s2',
            'Intermediate',
            'property',
            `In a Cayley table for D_${n}, compare entry (${formatDihedral(row)}, ${formatDihedral(col)}) = ${formatDihedral(prod)} against (${formatDihedral(col)}, ${formatDihedral(row)}) = ${formatDihedral(rev)}:`,
            formatDihedral(prod) === formatDihedral(rev)
              ? 'These two entries match, though D_n overall remains nonabelian'
              : 'They differ, proving directly across the diagonal that D_n is nonabelian',
            [
              formatDihedral(prod) === formatDihedral(rev)
                ? 'They differ, proving D_n is nonabelian'
                : 'They match, proving D_n is abelian',
              'The table violates the Latin square rule',
              'The identity element 1 is missing from row μ',
            ],
            `Symmetric table cells reflect commutativity a*b = b*a; asymmetry proves nonabelian structure.`,
            ['Cayley symmetry', `D_${n}`]
          )
        );
      }
    }
  }
  // Fill remaining m7-s1, m7-s2, m7-s3 with Z_n / Z_2xZ_2 / S_3 / D_n Cayley properties
  for (let n = 4; n <= 35; n++) {
    if (qs.filter((q) => q.subsectionId === 'm7-s1').length < 52) {
      qs.push(
        makeQ(
          nextId('m7-s1'),
          'm7-s1',
          'Beginner',
          'calculation',
          `How many total cells exist inside the body of the Cayley table for ℤ_${n} (and how many times does 0 appear)?`,
          `${n * n} total cells; identity 0 appears ${n} times`,
          [
            `${n * n} total cells; identity 0 appears 1 time`,
            `${2 * n} total cells; identity 0 appears ${n} times`,
            `${n * n} total cells; identity 0 appears ${n * 2} times`,
          ],
          `An order-${n} group has an ${n}×${n} = ${n * n} table, and by the Latin square rule the identity appears once per row (${n} times total).`,
          ['Cayley size']
        )
      );
    }
    if (qs.filter((q) => q.subsectionId === 'm7-s2').length < 52) {
      const selfInversesInZn = n % 2 === 0 ? 2 : 1;
      qs.push(
        makeQ(
          nextId('m7-s2'),
          'm7-s2',
          'Intermediate',
          'property',
          `In the Cayley table of ℤ_${n}, how many times does the identity 0 appear along the MAIN diagonal (x + x ≡ 0 mod ${n})?`,
          String(selfInversesInZn),
          [String(n), String(selfInversesInZn === 2 ? 1 : 2), '0'],
          `In ℤ_${n}, 2x ≡ 0 (mod ${n}) has ${selfInversesInZn} solution(s): ${n % 2 === 0 ? `0 and ${n / 2}` : 'only 0'}.`,
          ['Cayley diagonal']
        )
      );
    }
  }
  const m7s3Combos = [
    ['ρ', 'μρ²', 'Ref × Ref = Rot'],
    ['ρ²', 'ρ³', 'Rot × Rot = Rot'],
    ['μ', 'ρ²', 'Ref × Rot = Ref'],
    ['ρ³', 'μ', 'Rot × Ref = Ref'],
  ];
  for (let n = 4; n <= 16; n++) {
    for (const [lStr, rStr, desc] of m7s3Combos) {
      if (qs.filter((q) => q.subsectionId === 'm7-s3').length >= 52) break;
      const l = lStr.startsWith('μ')
        ? createDihedralElement(n, 1, lStr.includes('2') ? 2 : 0)
        : createDihedralElement(n, 0, lStr.includes('3') ? 3 : lStr.includes('2') ? 2 : 1);
      const r = rStr.startsWith('μ')
        ? createDihedralElement(n, 1, rStr.includes('2') ? 2 : 0)
        : createDihedralElement(n, 0, rStr.includes('3') ? 3 : rStr.includes('2') ? 2 : 1);
      const res = multiplyDihedral(l, r).result;
      qs.push(
        makeQ(
          nextId('m7-s3'),
          'm7-s3',
          'Intermediate',
          'property',
          `Using D_${n} Cayley block parity (${desc}), classify the product (${formatDihedral(l)})(${formatDihedral(r)}) = ${formatDihedral(res)}:`,
          res.ref === 0 ? 'Rotation quadrant (orientation-preserving)' : 'Reflection quadrant (orientation-reversing)',
          [
            res.ref === 0 ? 'Reflection quadrant (orientation-reversing)' : 'Rotation quadrant (orientation-preserving)',
            'Outside D_n',
            'Neither quadrant',
          ],
          `Block law (${desc}) gives ${formatDihedral(res)}, which lies in the ${res.ref === 0 ? 'rotation' : 'reflection'} quadrant.`,
          ['Cayley blocks', `D_${n}`]
        )
      );
    }
  }

  // =========================================================
  // MODULE 8: Real-World Applications & Modeling (m8-s1, m8-s2, m8-s3)
  // =========================================================
  // m8-s1: Architecture, kaleidoscopes, graphics
  for (let n = 3; n <= 18; n++) {
    const angle = (180 / n).toFixed(2).replace(/\.?0+$/, '');
    qs.push(
      makeQ(
        nextId('m8-s1'),
        'm8-s1',
        'Intermediate',
        'application',
        `Two internal kaleidoscope mirrors meet at angle ${angle}°. Which symmetry group describes the resulting chamber pattern?`,
        `D_${n} (order ${2 * n})`,
        [`ℤ_${n} (order ${n})`, `D_${2 * n} (order ${4 * n})`, `S_${n} (order ${n}!)`],
        `Mirrors meeting at 180°/${n} = ${angle}° generate D_${n} with ${2 * n} total sectors.`,
        ['kaleidoscope', `D_${n}`]
      )
    );
    if (qs.filter((q) => q.subsectionId === 'm8-s1').length < 52) {
      qs.push(
        makeQ(
          nextId('m8-s1'),
          'm8-s1',
          'Beginner',
          'application',
          `An architectural dome features ${n} identical curved ribs with rotational symmetry only (no mirror planes). What is its symmetry group?`,
          `ℤ_${n} (order ${n})`,
          [`D_${n} (order ${2 * n})`, `S_${n}`, `ℤ_2 × ℤ_${n}`],
          `Curved ribs eliminate reflections, leaving the ${n} rotations of ℤ_${n}.`,
          ['architecture', `Z_${n}`]
        )
      );
    }
    if (qs.filter((q) => q.subsectionId === 'm8-s1').length < 52 && n <= 12) {
      const a = createDihedralElement(n, 1, 1);
      const b = createDihedralElement(n, 0, 2);
      const res = multiplyDihedral(b, a).result;
      qs.push(
        makeQ(
          nextId('m8-s1'),
          'm8-s1',
          'Intermediate',
          'application',
          `In a CAD tile editor with D_${n} symmetry, applying ${formatDihedral(a)} followed by ${formatDihedral(b)} (i.e. (${formatDihedral(b)})(${formatDihedral(a)})) yields:`,
          formatDihedral(res),
          [
            formatDihedral(multiplyDihedral(a, b).result) === formatDihedral(res)
              ? '1'
              : formatDihedral(multiplyDihedral(a, b).result),
            'ρ',
            'μ',
          ],
          `Compose right-to-left: (${formatDihedral(b)})(${formatDihedral(a)}) = ${formatDihedral(res)}.`,
          ['CAD graphics']
        )
      );
    }
  }

  // m8-s2: Scheduling & permutation cycles
  for (let n = 6; n <= 32; n++) {
    const gens = coprimesBelow(n);
    const nonGen = divisors(n).find((d) => d > 1 && d < n) ?? 2;
    qs.push(
      makeQ(
        nextId('m8-s2'),
        'm8-s2',
        'Intermediate',
        'application',
        `A circular ${n}-station job schedule advances workers by +k (mod ${n}) each day. How many step choices k allow every worker to visit all ${n} stations?`,
        String(gens.length),
        [String(n - 1), String(gens.length + 1), String(Math.max(1, n - gens.length))],
        `A shift +k visits all ${n} stations iff gcd(k, ${n}) = 1; there are φ(${n}) = ${gens.length} such step sizes.`,
        ['scheduling', 'cyclic generators']
      )
    );
    if (qs.filter((q) => q.subsectionId === 'm8-s2').length < 52) {
      const orbitSize = orderInZn(nonGen, n);
      qs.push(
        makeQ(
          nextId('m8-s2'),
          'm8-s2',
          'Intermediate',
          'application',
          `On a ${n}-station circular wheel, stepping by +${nonGen} (mod ${n}) restricts each worker to an orbit of how many stations?`,
          String(orbitSize),
          [String(n), String(nonGen), String(orbitSize + 1)],
          `Orbit size equals ord(${nonGen}) = ${n} / gcd(${n}, ${nonGen}) = ${orbitSize}.`,
          ['scheduling', 'orbit']
        )
      );
    }
  }

  // m8-s3: Axiom audits (genuine groups vs non-groups)
  const auditCases: { scenario: string; verdict: string; reason: string }[] = [
    { scenario: '{1, ρ, ρ²} inside D₆', verdict: 'Genuine subgroup (cyclic order 3)', reason: 'Generated by ρ in D₆? Wait: ρ³ is missing—no, {1, ρ, ρ²} is NOT closed because ρ·ρ² = ρ³ ∉ set!'.includes('wait') ? '' : 'Not a group (fails closure)' },
  ];
  void auditCases;
  for (let n = 4; n <= 20; n++) {
    // 1. Half-rotations subset {1, rho^(n/2)} when even vs {1, rho, mu}
    qs.push(
      makeQ(
        nextId('m8-s3'),
        'm8-s3',
        'Intermediate',
        'counterexample',
        `Audit the subset S = {1, ρ, μ} inside D_${n}: does S form a finite group under composition?`,
        'No — fails closure (for example, ρ² and μρ are missing)',
        [
          'Yes — forms a group of order 3',
          'Yes — forms a subgroup isomorphic to ℤ₃',
          'No — fails associativity',
        ],
        `Although 1, ρ, and μ generate D_${n}, the 3-element subset {1, ρ, μ} is not closed under composition because ρ² ∉ S.`,
        ['axiom audit', 'closure']
      )
    );
    qs.push(
      makeQ(
        nextId('m8-s3'),
        'm8-s3',
        'Intermediate',
        'property',
        `Audit the rotation subset R_${n} = {1, ρ, ρ², …, ρ^${n - 1}} inside D_${n}: does R_${n} form a group?`,
        `Yes — it forms a cyclic subgroup of order ${n} isomorphic to ℤ_${n}`,
        [
          'No — fails closure without μ',
          'No — lacks inverses',
          `Yes — it is nonabelian of order ${n}`,
        ],
        `Composing rotations yields rotations, 1 is identity, and (ρᵏ)⁻¹ = ρⁿ⁻ᵏ ∈ R_${n}.`,
        ['axiom audit', 'rotation subgroup']
      )
    );
    if (qs.filter((q) => q.subsectionId === 'm8-s3').length < 52) {
      qs.push(
        makeQ(
          nextId('m8-s3'),
          'm8-s3',
          'Intermediate',
          'counterexample',
          `Audit a sprite pipeline with operations {1, ρ, …, ρ^${n - 1}, crop_50%} on images: why is this NOT a group?`,
          'crop_50% discards pixels and has no unique inverse',
          [
            'Rotations fail closure',
            'Function composition is non-associative',
            'There is no identity operation',
          ],
          `Cropping maps infinitely many images to identical outputs, violating invertibility.`,
          ['modeling', 'lossy operation']
        )
      );
    }
  }

  // Top-ups ensuring every subsection comfortably exceeds 50 distinct MCQs
  const extraOrderChecks: [number[], number][] = [
    [[2, 2, 2], 2], [[2, 8], 8], [[4, 4], 4], [[3, 9], 9], [[5, 5], 5],
    [[2, 10], 10], [[3, 15], 15], [[4, 12], 12], [[6, 6], 6], [[2, 14], 14],
    [[3, 12], 12], [[2, 18], 18], [[4, 8], 8], [[6, 12], 12], [[2, 2, 4], 4],
  ];
  for (const [modList, targetOrd] of extraOrderChecks) {
    const dist = computeOrderDistribution(modList);
    const cnt = dist[targetOrd] ?? 0;
    const total = modList.reduce((a, b) => a * b, 1);
    qs.push(
      makeQ(
        nextId('m2-s3'),
        'm2-s3',
        'Intermediate',
        'calculation',
        `In ${formatZnProduct(modList)} (order ${total}), exactly how many elements have order ${targetOrd}?`,
        String(cnt),
        [String(cnt + 2), String(Math.max(0, cnt - 2)), String(total)],
        `Exact divisor-convolution count in ${formatZnProduct(modList)} gives ${cnt} elements of order ${targetOrd}.`,
        ['order distribution']
      )
    );
  }

  const extraPermComps: [string, string, number][] = [
    ['(1 4)', '(1 2 3 4)', 4], ['(2 3)', '(1 4 2)', 4], ['(1 3)(2 4)', '(1 2 3)', 4],
    ['(1 5 4)', '(2 3 5)', 5], ['(1 2)(3 5)', '(1 4 3)', 5], ['(2 4 5)', '(1 5)(2 3)', 5],
    ['(1 3 5 2)', '(2 4)', 5], ['(1 4 3)', '(2 5)(1 3)', 5], ['(1 5)', '(2 4 3)', 5],
  ];
  for (const [aStr, bStr, deg] of extraPermComps) {
    const a = parseCycleString(aStr, deg);
    const b = parseCycleString(bStr, deg);
    const prod = composePerm(a, b);
    qs.push(
      makeQ(
        nextId('m4-s2'),
        'm4-s2',
        'Intermediate',
        'calculation',
        `In S_${deg}, compose ${formatCycleNotation(a)}${formatCycleNotation(b)} right-to-left:`,
        formatCycleNotation(prod),
        [formatCycleNotation(composePerm(b, a)), formatCycleNotation(invertPerm(prod)), 'ι'],
        `Applying ${formatCycleNotation(b)} then ${formatCycleNotation(a)} yields ${formatCycleNotation(prod)}.`,
        ['composition']
      )
    );
  }

  const extraParityChecks: [string, number][] = [
    ['(1 2 3)(1 4)', 5], ['(1 3 5 4)', 5], ['(1 2)(3 4)(4 5)', 5], ['(2 3 4 5 1)', 5],
    ['(1 4 2 5)', 5], ['(1 2)(2 3)(3 4)', 5], ['(1 5 3)(2 4)', 5], ['(1 3 2 4 5)', 5],
  ];
  for (const [cStr, deg] of extraParityChecks) {
    const p = parseCycleString(cStr, deg);
    const par = permParity(p);
    qs.push(
      makeQ(
        nextId('m4-s3'),
        'm4-s3',
        'Intermediate',
        'property',
        `Classify ${cStr} ∈ S_${deg} as even or odd and state its order:`,
        `${par === 'even' ? 'Even' : 'Odd'}, order ${permOrder(p)}`,
        [
          `${par === 'even' ? 'Odd' : 'Even'}, order ${permOrder(p)}`,
          `${par === 'even' ? 'Even' : 'Odd'}, order ${permOrder(p) + 1}`,
          'Odd, order 1',
        ],
        `Disjoint form ${formatCycleNotation(p)} has order ${permOrder(p)} and ${par} parity.`,
        ['parity', 'order']
      )
    );
  }

  for (let n = 3; n <= 10; n++) {
    const rotK = Math.min(n - 1, 2);
    const rot = createDihedralElement(n, 0, rotK);
    const ref = createDihedralElement(n, 1, rotK);
    qs.push(
      makeQ(
        nextId('m5-s1'),
        'm5-s1',
        'Beginner',
        'definition',
        `Which reflection in D_${n} follows μρ${rotK === 1 ? '' : `^${rotK}`} in standard listing {1, ρ, …, ρ^${n - 1}, μ, μρ, …, μρ^${n - 1}}?`,
        rotK === n - 1 ? 'End of standard listing' : formatDihedral(createDihedralElement(n, 1, rotK + 1)),
        [formatDihedral(rot), '1', formatDihedral(createDihedralElement(n, 0, (rotK + 1) % n))],
        `Standard form orders reflections sequentially as μ, μρ, μρ², …, μρ^${n - 1}.`,
        ['standard listing', `D_${n}`]
      )
    );
    const prod = multiplyDihedral(createDihedralElement(n, 0, 2), createDihedralElement(n, 1, 1)).result;
    qs.push(
      makeQ(
        nextId('m5-s2'),
        'm5-s2',
        'Intermediate',
        'calculation',
        `In D_${n}, reduce ρ²(μρ) to standard form using ρ²μ = μρ^(${n}-2):`,
        formatDihedral(prod),
        [formatDihedral(createDihedralElement(n, 1, 3 % n)), formatDihedral(createDihedralElement(n, 0, (n - 1) % n)), '1'],
        `ρ²(μρ) = (ρ²μ)ρ = (μρ^${n - 2})ρ = ${formatDihedral(prod)}.`,
        ['reduction', `D_${n}`]
      )
    );
    const centerList = n % 2 === 0 ? `{1, ρ^${n / 2}}` : '{1}';
    qs.push(
      makeQ(
        nextId('m5-s3'),
        'm5-s3',
        'Advanced',
        'property',
        `Which elements form the center Z(D_${n}) (commuting with every element of D_${n})?`,
        centerList,
        [n % 2 === 0 ? '{1}' : `{1, ρ}`, '{1, μ}', `All of D_${n}`],
        `For ${n % 2 === 0 ? 'even' : 'odd'} n = ${n}, only ${centerList} commutes with both ρ and μ.`,
        ['center', `D_${n}`]
      )
    );
    qs.push(
      makeQ(
        nextId('m5-s3'),
        'm5-s3',
        'Intermediate',
        'calculation',
        `In D_${n}, how many elements in total have order exactly 2?`,
        String(n % 2 === 0 ? n + 1 : n),
        [String(n % 2 === 0 ? n : n + 1), String(2 * n), String(n - 1)],
        `All ${n} reflections μρᵏ have order 2${n % 2 === 0 ? `, plus the half-turn ρ^${n / 2}` : ''}.`,
        ['order 2 count', `D_${n}`]
      )
    );
    void ref;
  }

  for (let n = 5; n <= 16; n++) {
    const angle = (360 / n).toFixed(1).replace(/\.0$/, '');
    qs.push(
      makeQ(
        nextId('m8-s1'),
        'm8-s1',
        'Intermediate',
        'application',
        `A tile medallion with D_${n} symmetry undergoes two consecutive mirror reflections meeting at angle ${(180 / n).toFixed(1).replace(/\.0$/, '')}°. What single rotation results?`,
        `Counterclockwise rotation ρ by ${angle}°`,
        [
          `Reflection μρ`,
          `Identity 1`,
          `Rotation by ${(720 / n).toFixed(1).replace(/\.0$/, '')}°`,
        ],
        `Two reflections across mirrors angled at θ = 180°/${n} compose to a rotation of 2θ = ${angle}° = ρ.`,
        ['kaleidoscope', 'mirrors']
      )
    );
  }

  return qs;
}
