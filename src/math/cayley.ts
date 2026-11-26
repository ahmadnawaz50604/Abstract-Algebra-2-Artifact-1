import {
  addDirectProductTuples,
  enumerateDirectProduct,
  formatTuple,
  inverseDirectProductTuple,
  orderDirectProductTuple,
} from './abelian.ts';
import {
  dihedralInverse,
  dihedralOrder,
  formatDihedral,
  formatDihedralLatex,
  generateDn,
  multiplyDihedral,
} from './dihedral.ts';
import {
  coprimesBelow,
  eulerPhi,
  gcd,
  inverseInZn,
  mod,
  orderInZn,
  toSubscript,
} from './numberTheory.ts';
import {
  composePerm,
  composePermWithTrace,
  formatCycleNotation,
  generateSn,
  invertPerm,
  permOrder,
  permParity,
} from './permutations.ts';

export type CayleyGroupKind =
  | { type: 'cyclic'; n: number }
  | { type: 'direct_product'; moduli: number[] }
  | { type: 'dihedral'; n: number; identitySymbol?: '1' | 't' }
  | { type: 'symmetric'; n: number }
  | { type: 'alternating'; n: number }
  | { type: 'units_mod'; n: number }
  | { type: 'mult_mod'; n: number }
  | { type: 'sub_mod'; n: number }
  | {
      type: 'custom_set';
      elements: string[];
      rawCells: string[][];
      opSymbol?: string;
    };

export interface CayleyCellExplanation {
  formula: string;
  steps: string[];
  note: string;
}

export type AxiomCheckStatus = 'passed' | 'failed' | 'not_checked';

export interface AxiomReport {
  closure: {
    status: AxiomCheckStatus;
    reason: string;
    counterexample?: { rowIdx: number; colIdx: number; rowLabel: string; colLabel: string; rawValue: string };
  };
  associativity: {
    status: AxiomCheckStatus;
    reason: string;
    checkedTriples: number;
    counterexample?: {
      a: number;
      b: number;
      c: number;
      ab: number;
      ab_c: number;
      bc: number;
      a_bc: number;
      aLabel: string;
      bLabel: string;
      cLabel: string;
      abLabel: string;
      ab_cLabel: string;
      bcLabel: string;
      a_bcLabel: string;
    };
  };
  identity: {
    status: AxiomCheckStatus;
    reason: string;
    identityLabel?: string;
  };
  inverses: {
    status: AxiomCheckStatus;
    reason: string;
    missingLabels: string[];
  };
  commutativity: {
    status: AxiomCheckStatus;
    reason: string;
    counterexample?: {
      a: number;
      b: number;
      ab: number;
      ba: number;
      aLabel: string;
      bLabel: string;
      abLabel: string;
      baLabel: string;
    };
  };
  finalVerdict: 'abelian_group' | 'nonabelian_group' | 'not_a_group';
  finalSummary: string;
}

export interface CayleyTableData {
  title: string;
  notationTitle: string;
  operationSymbol: string;
  order: number;
  isGroup: boolean;
  labels: string[];
  latexLabels: string[];
  /** Index into labels, or -1 if cell holds an out-of-set/unassigned entry */
  matrix: number[][];
  /** Raw text display per cell (matches labels[matrix[r][c]] when valid, or raw custom string when unclosed) */
  rawMatrix: string[][];
  identityIndex: number;
  inverses: (number | null)[];
  orders: (number | null)[];
  cyclicMeta?: {
    n: number;
    phi: number;
    generators: number[];
    nonGenerators: number[];
    isCyclic: boolean;
    summaryText: string;
  };
  axioms: {
    closed: boolean;
    associative: boolean;
    associativityChecked: boolean;
    hasIdentity: boolean;
    allHaveInverses: boolean;
    isAbelian: boolean;
    isLatinSquare: boolean;
  };
  diagnostics: {
    associativityCounterexample: {
      a: number;
      b: number;
      c: number;
      ab: number;
      ab_c: number;
      bc: number;
      a_bc: number;
    } | null;
    noInverseIndices: number[];
    nonCommutingPair: { a: number; b: number; ab: number; ba: number } | null;
    latinSquareBadRows: number[];
  };
  axiomReport: AxiomReport;
}

const ASSOCIATIVITY_EXHAUSTIVE_MAX_ORDER = 24;

function multInverseInZn(a: number, n: number): number | null {
  if (gcd(a, n) !== 1) return null;
  for (let x = 0; x < n; x++) {
    if (mod(a * x, n) === 1) return x;
  }
  return null;
}

function multOrderInZn(a: number, n: number): number | null {
  if (gcd(a, n) !== 1) return null;
  let cur = mod(a, n);
  let k = 1;
  while (cur !== 1) {
    cur = mod(cur * a, n);
    k++;
    if (k > n + 1) return null;
  }
  return k;
}

export function evaluateTableAxioms(
  labels: string[],
  matrix: number[][],
  rawMatrix: string[][],
  op: string
): {
  identityIndex: number;
  inverses: (number | null)[];
  orders: (number | null)[];
  axioms: CayleyTableData['axioms'];
  diagnostics: CayleyTableData['diagnostics'];
  axiomReport: AxiomReport;
  isGroup: boolean;
} {
  const order = labels.length;

  // 1. Closure check
  let closureCounterexample: AxiomReport['closure']['counterexample'] | undefined;
  for (let r = 0; r < order; r++) {
    for (let c = 0; c < order; c++) {
      const idx = matrix[r]?.[c] ?? -1;
      if (idx < 0 || idx >= order) {
        closureCounterexample = {
          rowIdx: r,
          colIdx: c,
          rowLabel: labels[r],
          colLabel: labels[c],
          rawValue: rawMatrix[r]?.[c]?.trim() || '∅ (blank)',
        };
        break;
      }
    }
    if (closureCounterexample) break;
  }
  const closed = closureCounterexample === undefined;

  // 2. Identity check (checks rows/cols even if another cell is unclosed, provided row/col entries are closed)
  let identityIndex = -1;
  for (let e = 0; e < order; e++) {
    let ok = true;
    for (let x = 0; x < order; x++) {
      if (matrix[e]?.[x] !== x || matrix[x]?.[e] !== x) {
        ok = false;
        break;
      }
    }
    if (ok) {
      identityIndex = e;
      break;
    }
  }
  const hasIdentity = identityIndex !== -1;

  // 3. Inverses check
  const computedInverses: (number | null)[] = Array.from({ length: order }, () => null);
  const noInverseIndices: number[] = [];
  if (hasIdentity) {
    for (let x = 0; x < order; x++) {
      let foundInv: number | null = null;
      for (let y = 0; y < order; y++) {
        if (matrix[x]?.[y] === identityIndex && matrix[y]?.[x] === identityIndex) {
          foundInv = y;
          break;
        }
      }
      computedInverses[x] = foundInv;
      if (foundInv === null) noInverseIndices.push(x);
    }
  } else {
    for (let x = 0; x < order; x++) noInverseIndices.push(x);
  }
  const allHaveInverses = hasIdentity && noInverseIndices.length === 0;

  // 4. Associativity check (explicitly guarded against missing closure or oversized tables)
  let associativityChecked = false;
  let checkedTriples = 0;
  let associativityCounterexample: CayleyTableData['diagnostics']['associativityCounterexample'] =
    null;
  let associativityStatus: AxiomCheckStatus = 'not_checked';
  let associativityReason = '';

  if (!closed) {
    associativityStatus = 'not_checked';
    associativityReason =
      'Not checked: Closure failed, so nested products like (a * b) * c cannot be guaranteed to remain inside the set.';
  } else if (order > ASSOCIATIVITY_EXHAUSTIVE_MAX_ORDER) {
    associativityStatus = 'not_checked';
    associativityReason = `Not checked: Structure has order ${order} (> ${ASSOCIATIVITY_EXHAUSTIVE_MAX_ORDER} exhaustive triple-check cap). Exhaustive O(n³) verification was skipped rather than assumed.`;
  } else {
    associativityChecked = true;
    outer: for (let i = 0; i < order; i++) {
      for (let j = 0; j < order; j++) {
        const ab = matrix[i][j];
        for (let k = 0; k < order; k++) {
          checkedTriples++;
          const ab_c = matrix[ab][k];
          const bc = matrix[j][k];
          const a_bc = matrix[i][bc];
          if (ab_c !== a_bc) {
            associativityCounterexample = { a: i, b: j, c: k, ab, ab_c, bc, a_bc };
            break outer;
          }
        }
      }
    }
    if (associativityCounterexample) {
      associativityStatus = 'failed';
      const ex = associativityCounterexample;
      associativityReason = `Fails at (${labels[ex.a]}, ${labels[ex.b]}, ${labels[ex.c]}): (${labels[ex.a]} ${op} ${labels[ex.b]}) ${op} ${labels[ex.c]} = ${labels[ex.ab]} ${op} ${labels[ex.c]} = ${labels[ex.ab_c]}, whereas ${labels[ex.a]} ${op} (${labels[ex.b]} ${op} ${labels[ex.c]}) = ${labels[ex.a]} ${op} ${labels[ex.bc]} = ${labels[ex.a_bc]}.`;
    } else {
      associativityStatus = 'passed';
      associativityReason = `Mathematically verified across all ${checkedTriples.toLocaleString()} triples (a, b, c) ∈ G³.`;
    }
  }
  const associative = associativityChecked && associativityCounterexample === null;

  // 5. Commutativity check
  let nonCommutingPair: CayleyTableData['diagnostics']['nonCommutingPair'] = null;
  let commutativityStatus: AxiomCheckStatus = closed ? 'passed' : 'not_checked';
  let commutativityReason = '';

  if (closed) {
    outerAb: for (let i = 0; i < order; i++) {
      for (let j = i + 1; j < order; j++) {
        if (matrix[i][j] !== matrix[j][i]) {
          nonCommutingPair = { a: i, b: j, ab: matrix[i][j], ba: matrix[j][i] };
          break outerAb;
        }
      }
    }
    if (nonCommutingPair) {
      commutativityStatus = 'failed';
      commutativityReason = `Non-commuting pair found: ${labels[nonCommutingPair.a]} ${op} ${labels[nonCommutingPair.b]} = ${labels[nonCommutingPair.ab]}, whereas ${labels[nonCommutingPair.b]} ${op} ${labels[nonCommutingPair.a]} = ${labels[nonCommutingPair.ba]}.`;
    } else {
      commutativityStatus = 'passed';
      commutativityReason = `Verified a ${op} b = b ${op} a for every pair in the table (table is symmetric across the main diagonal).`;
    }
  } else {
    commutativityReason =
      'Not fully verified because one or more cells lie outside the set.';
  }
  const isAbelian = closed && nonCommutingPair === null;

  // 6. Latin Square check
  const latinSquareBadRows: number[] = [];
  let isLatinSquare = closed;
  if (closed) {
    for (let i = 0; i < order; i++) {
      const rowSet = new Set(matrix[i]);
      const colSet = new Set(matrix.map((r) => r[i]));
      if (rowSet.size !== order || colSet.size !== order) {
        isLatinSquare = false;
        if (rowSet.size !== order) latinSquareBadRows.push(i);
      }
    }
  }

  // 7. Compute element orders directly from table when closed & identity exists
  const orders: (number | null)[] = Array.from({ length: order }, (_, idx) => {
    if (!closed || !hasIdentity) return null;
    let cur = idx;
    for (let k = 1; k <= order; k++) {
      if (cur === identityIndex) return k;
      cur = matrix[cur][idx];
      if (cur < 0 || cur >= order) return null;
    }
    return null;
  });

  const isGroup = closed && associative && hasIdentity && allHaveInverses;

  const missingLabels = noInverseIndices.map((i) => labels[i]);
  const identityStatus: AxiomCheckStatus = hasIdentity ? 'passed' : 'failed';
  const inversesStatus: AxiomCheckStatus = !hasIdentity
    ? 'not_checked'
    : allHaveInverses
    ? 'passed'
    : 'failed';

  const axiomReport: AxiomReport = {
    closure: {
      status: closed ? 'passed' : 'failed',
      reason: closed
        ? `Every entry in the ${order} × ${order} table belongs to S = {${labels.join(', ')}}.`
        : `Closure fails: ${closureCounterexample!.rowLabel} ${op} ${closureCounterexample!.colLabel} = ${closureCounterexample!.rawValue}, which is not in S.`,
      counterexample: closureCounterexample,
    },
    associativity: {
      status: associativityStatus,
      reason: associativityReason,
      checkedTriples,
      counterexample: associativityCounterexample
        ? {
            ...associativityCounterexample,
            aLabel: labels[associativityCounterexample.a],
            bLabel: labels[associativityCounterexample.b],
            cLabel: labels[associativityCounterexample.c],
            abLabel: labels[associativityCounterexample.ab],
            ab_cLabel: labels[associativityCounterexample.ab_c],
            bcLabel: labels[associativityCounterexample.bc],
            a_bcLabel: labels[associativityCounterexample.a_bc],
          }
        : undefined,
    },
    identity: {
      status: identityStatus,
      reason: hasIdentity
        ? `Element "${labels[identityIndex]}" satisfies e ${op} x = x ${op} e = x for all x ∈ S.`
        : 'No element e ∈ S leaves every row and column unchanged on both sides.',
      identityLabel: hasIdentity ? labels[identityIndex] : undefined,
    },
    inverses: {
      status: inversesStatus,
      reason: !hasIdentity
        ? 'Not applicable: Inverses cannot be defined until a two-sided identity element e exists.'
        : allHaveInverses
        ? `Every element has a two-sided inverse yielding identity "${labels[identityIndex]}".`
        : `Missing two-sided inverse for: ${missingLabels.join(', ')}.`,
      missingLabels,
    },
    commutativity: {
      status: commutativityStatus,
      reason: commutativityReason,
      counterexample: nonCommutingPair
        ? {
            ...nonCommutingPair,
            aLabel: labels[nonCommutingPair.a],
            bLabel: labels[nonCommutingPair.b],
            abLabel: labels[nonCommutingPair.ab],
            baLabel: labels[nonCommutingPair.ba],
          }
        : undefined,
    },
    finalVerdict: isGroup
      ? isAbelian
        ? 'abelian_group'
        : 'nonabelian_group'
      : 'not_a_group',
    finalSummary: isGroup
      ? isAbelian
        ? `Abelian Group: All four group axioms (Closure, Associativity, Identity, Inverses) are mathematically verified, and the operation is commutative.`
        : `Nonabelian Group: All four group axioms hold, but the operation fails commutativity (witness: ${labels[nonCommutingPair!.a]} ${op} ${labels[nonCommutingPair!.b]} ≠ ${labels[nonCommutingPair!.b]} ${op} ${labels[nonCommutingPair!.a]}).`
      : `Not a Group: Fails ${[
          !closed ? 'Closure' : null,
          associativityStatus === 'failed' ? 'Associativity' : associativityStatus === 'not_checked' ? 'Associativity (unverified)' : null,
          !hasIdentity ? 'Identity' : null,
          hasIdentity && !allHaveInverses ? 'Inverses' : null,
        ]
          .filter(Boolean)
          .join(', ')}. Notice that table symmetry alone never makes a binary structure a group.`,
  };

  return {
    identityIndex,
    inverses: computedInverses,
    orders,
    axioms: {
      closed,
      associative,
      associativityChecked,
      hasIdentity,
      allHaveInverses,
      isAbelian,
      isLatinSquare,
    },
    diagnostics: {
      associativityCounterexample,
      noInverseIndices,
      nonCommutingPair,
      latinSquareBadRows,
    },
    axiomReport,
    isGroup,
  };
}

export function buildCayleyTable(spec: CayleyGroupKind): CayleyTableData {
  let labels: string[] = [];
  let latexLabels: string[] = [];
  let matrix: number[][] = [];
  let rawMatrix: string[][] = [];
  let presetOrders: (number | null)[] | null = null;
  let cyclicMeta: CayleyTableData['cyclicMeta'] | undefined;
  let title = '';
  let notationTitle = '';
  let operationSymbol = '*';

  if (spec.type === 'cyclic') {
    const n = Math.max(1, Math.min(24, Math.trunc(spec.n)));
    title = `⟨ℤ${toSubscript(n)}, ⊕⟩ (Cyclic group of order ${n})`;
    notationTitle = `⟨ℤ_${n}, +_${n}⟩`;
    operationSymbol = `⊕`;
    const els = Array.from({ length: n }, (_, i) => i);
    labels = els.map(String);
    latexLabels = els.map(String);
    matrix = els.map((a) => els.map((b) => mod(a + b, n)));
    rawMatrix = matrix.map((row) => row.map((v) => String(v)));
    presetOrders = els.map((a) => orderInZn(a, n));

    const phi = eulerPhi(n);
    const generators = coprimesBelow(n);
    const nonGenerators = els.filter((x) => !generators.includes(x));
    const summaryText =
      n === 1
        ? `ℤ₁ = {0} is the trivial cyclic group of order 1. Element 0 is both the identity and the sole generator (0 ⊕ 0 = 0), with ord(0) = 1 and φ(1) = 1.`
        : `ℤ${toSubscript(n)} = {0, 1, …, ${n - 1}} under a ⊕ b = (a + b) mod ${n} is cyclic of order ${n}. Using ord(a) = ${n} / gcd(${n}, a), an element a generates ℤ${toSubscript(n)} iff gcd(a, ${n}) = 1, giving exactly φ(${n}) = ${phi} generator${phi === 1 ? '' : 's'}: {${generators.join(', ')}}.`;

    cyclicMeta = {
      n,
      phi,
      generators,
      nonGenerators,
      isCyclic: true,
      summaryText,
    };
  } else if (spec.type === 'custom_set') {
    const cleanLabels = spec.elements.map((s) => s.trim());
    if (cleanLabels.length < 1 || cleanLabels.length > 10) {
      throw new Error('Custom Finite Set must have between 1 and 10 elements.');
    }
    if (cleanLabels.some((s) => !s)) {
      throw new Error('Every element in the Custom Finite Set must have a non-empty symbol.');
    }
    const unique = new Set(cleanLabels);
    if (unique.size !== cleanLabels.length) {
      throw new Error('All elements in the Custom Finite Set must be distinct.');
    }
    labels = cleanLabels;
    latexLabels = cleanLabels;
    operationSymbol = spec.opSymbol?.trim() || '*';
    title = `Custom Structure ⟨S, ${operationSymbol}⟩ (|S| = ${labels.length})`;
    notationTitle = `⟨{${labels.join(', ')}}, ${operationSymbol}⟩`;

    const indexByLabel = new Map<string, number>();
    labels.forEach((lbl, idx) => indexByLabel.set(lbl, idx));

    rawMatrix = Array.from({ length: labels.length }, (_, r) =>
      Array.from({ length: labels.length }, (__, c) => (spec.rawCells[r]?.[c] ?? '').trim())
    );
    matrix = rawMatrix.map((row) =>
      row.map((val) => {
        const idx = indexByLabel.get(val);
        return idx === undefined ? -1 : idx;
      })
    );
  } else if (spec.type === 'direct_product') {
    const cleanModuli = spec.moduli.map((m) => Math.max(2, Math.trunc(m)));
    const prod = cleanModuli.reduce((a, b) => a * b, 1);
    if (prod > 24) {
      throw new Error(
        `Direct product order ${prod} exceeds Cayley table limit of 24. Reduce moduli so product ≤ 24.`
      );
    }
    title = cleanModuli.map((m) => `ℤ${toSubscript(m)}`).join(' × ');
    notationTitle = `⟨${title}, +⟩`;
    operationSymbol = '+';
    const els = enumerateDirectProduct(cleanModuli, 24);
    const keyMap = new Map<string, number>();
    labels = els.map((e, i) => {
      const f = formatTuple(e);
      keyMap.set(f, i);
      return f;
    });
    latexLabels = labels;
    matrix = els.map((a) =>
      els.map((b) => keyMap.get(formatTuple(addDirectProductTuples(a, b, cleanModuli)))!)
    );
    rawMatrix = matrix.map((row) => row.map((v) => labels[v]));
    presetOrders = els.map((a) => orderDirectProductTuple(a, cleanModuli));
  } else if (spec.type === 'dihedral') {
    const n = Math.max(3, Math.min(12, Math.trunc(spec.n)));
    const idSym = spec.identitySymbol ?? '1';
    title = `D${toSubscript(n)} = {${idSym}, ρ, …, ρ${toSubscript(n - 1)}, μ, μρ, …, μρ${toSubscript(n - 1)}} (Order ${2 * n})`;
    notationTitle = `⟨D_${n}, ∘⟩`;
    operationSymbol = '∘';
    const els = generateDn(n);
    const keyMap = new Map<string, number>();
    labels = els.map((e, i) => {
      const s = formatDihedral(e, idSym);
      keyMap.set(s, i);
      return s;
    });
    latexLabels = els.map((e) => formatDihedralLatex(e, idSym));
    matrix = els.map((a) =>
      els.map((b) => keyMap.get(formatDihedral(multiplyDihedral(a, b, idSym).result, idSym))!)
    );
    rawMatrix = matrix.map((row) => row.map((v) => labels[v]));
    presetOrders = els.map(dihedralOrder);
  } else if (spec.type === 'units_mod') {
    const n = Math.max(2, Math.min(48, Math.trunc(spec.n)));
    const units = coprimesBelow(n);
    if (units.length > 24) {
      throw new Error(
        `Group U(${n}) has order φ(${n}) = ${units.length}, which exceeds Cayley table limit 24.`
      );
    }
    title = `⟨U(${n}), ·${toSubscript(n)}⟩ (Units mod ${n}, order φ(${n}) = ${units.length})`;
    notationTitle = `⟨U(${n}), ·_${n}⟩`;
    operationSymbol = `·${toSubscript(n)}`;
    const idxMap = new Map<number, number>();
    units.forEach((u, idx) => idxMap.set(u, idx));
    labels = units.map(String);
    latexLabels = labels;
    matrix = units.map((a) => units.map((b) => idxMap.get(mod(a * b, n))!));
    rawMatrix = matrix.map((row) => row.map((v) => labels[v]));
    presetOrders = units.map((a) => multOrderInZn(a, n));
  } else if (spec.type === 'mult_mod') {
    const n = Math.max(2, Math.min(20, Math.trunc(spec.n)));
    title = `⟨ℤ${toSubscript(n)}, ·${toSubscript(n)}⟩ (Multiplication mod ${n} — Non-Group Test)`;
    notationTitle = `⟨ℤ_${n}, ·_${n}⟩`;
    operationSymbol = `·${toSubscript(n)}`;
    const els = Array.from({ length: n }, (_, i) => i);
    labels = els.map(String);
    latexLabels = labels;
    matrix = els.map((a) => els.map((b) => mod(a * b, n)));
    rawMatrix = matrix.map((row) => row.map((v) => labels[v]));
    presetOrders = els.map((a) => multOrderInZn(a, n));
  } else if (spec.type === 'sub_mod') {
    const n = Math.max(2, Math.min(20, Math.trunc(spec.n)));
    title = `⟨ℤ${toSubscript(n)}, −${toSubscript(n)}⟩ (Subtraction mod ${n} — Non-Associative Test)`;
    notationTitle = `⟨ℤ_${n}, −_${n}⟩`;
    operationSymbol = `−${toSubscript(n)}`;
    const els = Array.from({ length: n }, (_, i) => i);
    labels = els.map(String);
    latexLabels = labels;
    matrix = els.map((a) => els.map((b) => mod(a - b, n)));
    rawMatrix = matrix.map((row) => row.map((v) => labels[v]));
    presetOrders = els.map(() => null);
  } else {
    const all = generateSn(spec.n);
    const els =
      spec.type === 'alternating' ? all.filter((p) => permParity(p) === 'even') : all;
    title =
      spec.type === 'alternating'
        ? `A${toSubscript(spec.n)} (Alternating group of order ${els.length})`
        : `S${toSubscript(spec.n)} (Symmetric group of order ${els.length})`;
    notationTitle = spec.type === 'alternating' ? `⟨A_${spec.n}, ∘⟩` : `⟨S_${spec.n}, ∘⟩`;
    operationSymbol = '∘';
    if (els.length > 24) {
      throw new Error(
        'Cayley table visualization is capped at group order 24 (e.g. S_4, A_4, D_12).'
      );
    }
    const keyMap = new Map<string, number>();
    labels = els.map((p, i) => {
      const s = formatCycleNotation(p, true);
      keyMap.set(s, i);
      return s;
    });
    latexLabels = labels;
    matrix = els.map((a) =>
      els.map((b) => keyMap.get(formatCycleNotation(composePerm(a, b), true))!)
    );
    rawMatrix = matrix.map((row) => row.map((v) => labels[v]));
    presetOrders = els.map(permOrder);
  }

  const audit = evaluateTableAxioms(labels, matrix, rawMatrix, operationSymbol);

  return {
    title,
    notationTitle,
    operationSymbol,
    order: labels.length,
    isGroup: audit.isGroup,
    labels,
    latexLabels,
    matrix,
    rawMatrix,
    identityIndex: audit.identityIndex,
    inverses: audit.inverses,
    orders: presetOrders ?? audit.orders,
    cyclicMeta,
    axioms: audit.axioms,
    diagnostics: audit.diagnostics,
    axiomReport: audit.axiomReport,
  };
}

export function explainCayleyProduct(
  spec: CayleyGroupKind,
  table: CayleyTableData,
  r: number,
  c: number
): CayleyCellExplanation {
  const aLabel = table.labels[r];
  const bLabel = table.labels[c];
  const resIdx = table.matrix[r][c];
  const resLabel = resIdx >= 0 ? table.labels[resIdx] : table.rawMatrix[r][c] || '∅';
  const op = table.operationSymbol;

  if (spec.type === 'cyclic') {
    const n = Math.max(1, Math.min(24, Math.trunc(spec.n)));
    const a = Number(aLabel);
    const b = Number(bLabel);
    const raw = a + b;
    return {
      formula: `${a} ⊕ ${b} = (${a} + ${b}) mod ${n} = ${raw} mod ${n} = ${resLabel}`,
      steps: [
        `Step 1 — Ordinary sum: ${a} + ${b} = ${raw}`,
        raw >= n
          ? `Step 2 — Modular reduction: subtract ${Math.floor(raw / n)} × ${n} = ${Math.floor(raw / n) * n} so ${raw} ≡ ${resLabel} (mod ${n})`
          : `Step 2 — Modular reduction: since 0 ≤ ${raw} < ${n}, ${raw} mod ${n} = ${resLabel}`,
        `Step 3 — Group properties of result ${resLabel}: ord(${resLabel}) = ${table.orders[resIdx]}, inverse = ${table.labels[table.inverses[resIdx] ?? 0]}`,
      ],
      note:
        n === 1
          ? `In ℤ₁ = {0}, the single element 0 is both identity and generator.`
          : `Additive cyclic group ⟨ℤ${toSubscript(n)}, ⊕⟩ has order ${n} and identity 0.`,
    };
  }

  if (spec.type === 'custom_set') {
    if (resIdx < 0) {
      return {
        formula: `${aLabel} ${op} ${bLabel} = ${resLabel} ∉ S`,
        steps: [
          `Look up row "${aLabel}" and column "${bLabel}" in your custom table.`,
          `Entry "${resLabel}" is not a member of S = {${table.labels.join(', ')}}.`,
        ],
        note: `Because this entry lies outside S, the Closure axiom immediately fails.`,
      };
    }
    return {
      formula: `${aLabel} ${op} ${bLabel} = ${resLabel}`,
      steps: [
        `Row "${aLabel}" intersects Column "${bLabel}" at "${resLabel}" ∈ S.`,
        `Mirror entry (${bLabel} ${op} ${aLabel}) = "${table.rawMatrix[c][r] || '∅'}".`,
      ],
      note: table.isGroup
        ? `Custom table satisfies all four group axioms (${table.axioms.isAbelian ? 'Abelian' : 'Nonabelian'}).`
        : `Custom table is a binary operation on S, though one or more group axioms fail (see Axiom Auditor).`,
    };
  }

  if (spec.type === 'units_mod' || spec.type === 'mult_mod') {
    const n = Math.max(2, Math.trunc(spec.n));
    const a = Number(aLabel);
    const b = Number(bLabel);
    const raw = a * b;
    return {
      formula: `${a} ·${toSubscript(n)} ${b} = ${resLabel}`,
      steps: [
        `Compute ordinary integer product: ${a} × ${b} = ${raw}`,
        `Reduce modulo ${n}: ${raw} ≡ ${resLabel} (mod ${n})`,
      ],
      note:
        spec.type === 'units_mod'
          ? `U(${n}) contains only elements coprime to ${n}, guaranteeing every element has a multiplicative inverse.`
          : `In ⟨ℤ${toSubscript(n)}, ·${toSubscript(n)}⟩, 0 and elements sharing a factor with ${n} have no multiplicative inverse.`,
    };
  }

  if (spec.type === 'sub_mod') {
    const n = Math.max(2, Math.trunc(spec.n));
    const a = Number(aLabel);
    const b = Number(bLabel);
    const raw = a - b;
    return {
      formula: `${a} −${toSubscript(n)} ${b} = ${resLabel}`,
      steps: [
        `Compute integer difference: ${a} − ${b} = ${raw}`,
        `Reduce modulo ${n}: ${raw} ≡ ${resLabel} (mod ${n})`,
      ],
      note: `Subtraction modulo ${n} is closed, yet fails associativity and lacks a two-sided identity for n ≥ 3.`,
    };
  }

  if (spec.type === 'direct_product') {
    const moduli = spec.moduli.map((m) => Math.max(2, Math.trunc(m)));
    const els = enumerateDirectProduct(moduli, 24);
    const ta = els[r];
    const tb = els[c];
    const tc = addDirectProductTuples(ta, tb, moduli);
    const compSteps = moduli.map(
      (m, idx) => `Coordinate ${idx + 1}: (${ta[idx]} + ${tb[idx]}) mod ${m} = ${tc[idx]}`
    );
    return {
      formula: `${aLabel} + ${bLabel} = ${resLabel}`,
      steps: compSteps,
      note: `Direct product addition acts coordinatewise modulo each factor.`,
    };
  }

  if (spec.type === 'dihedral') {
    const n = Math.max(3, Math.min(12, Math.trunc(spec.n)));
    const idSym = spec.identitySymbol ?? '1';
    const els = generateDn(n);
    const { steps } = multiplyDihedral(els[r], els[c], idSym);
    return {
      formula: `(${aLabel})(${bLabel}) = ${resLabel}`,
      steps: steps.map((s) => `${s.step}: ${s.expression}`),
      note: `Uses dihedral relations ρⁿ = ${idSym}, μ² = ${idSym}, ρᵏμ = μρⁿ⁻ᵏ (evaluated right-to-left).`,
    };
  }

  const all = generateSn(spec.n);
  const els = spec.type === 'alternating' ? all.filter((p) => permParity(p) === 'even') : all;
  const { steps } = composePermWithTrace(els[r], els[c]);
  return {
    formula: `${aLabel} ${op} ${bLabel} = ${resLabel}`,
    steps: steps.map(
      (st) => `${st.element} → ${st.afterRight} (via right) → ${st.afterLeft} (via left)`
    ),
    note: `Right-to-left permutation composition (στ)(x) = σ(τ(x)) in disjoint cycle notation with identity ι.`,
  };
}
