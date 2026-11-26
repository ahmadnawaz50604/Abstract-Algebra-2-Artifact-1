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
import { inverseInZn, mod, orderInZn } from './numberTheory.ts';
import {
  composePerm,
  formatCycleNotation,
  generateSn,
  invertPerm,
  permOrder,
  permParity,
} from './permutations.ts';

export type CayleyGroupKind =
  | { type: 'cyclic'; n: number }
  | { type: 'direct_product'; moduli: number[] }
  | { type: 'dihedral'; n: number }
  | { type: 'symmetric'; n: number }
  | { type: 'alternating'; n: number };

export interface CayleyTableData {
  title: string;
  order: number;
  labels: string[];
  latexLabels: string[];
  matrix: number[][];
  identityIndex: number;
  inverses: number[];
  orders: number[];
  axioms: {
    closed: boolean;
    associative: boolean;
    hasIdentity: boolean;
    allHaveInverses: boolean;
    isAbelian: boolean;
    isLatinSquare: boolean;
  };
}

export function buildCayleyTable(spec: CayleyGroupKind): CayleyTableData {
  let labels: string[] = [];
  let latexLabels: string[] = [];
  let matrix: number[][] = [];
  let orders: number[] = [];
  let inverses: number[] = [];
  let title = '';

  if (spec.type === 'cyclic') {
    const n = spec.n;
    title = `ℤ_${n} (Addition modulo ${n})`;
    const els = Array.from({ length: n }, (_, i) => i);
    labels = els.map(String);
    latexLabels = els.map(String);
    matrix = els.map((a) => els.map((b) => mod(a + b, n)));
    orders = els.map((a) => orderInZn(a, n));
    inverses = els.map((a) => inverseInZn(a, n));
  } else if (spec.type === 'direct_product') {
    title = spec.moduli.map((m) => `ℤ_${m}`).join(' × ');
    const els = enumerateDirectProduct(spec.moduli, 36);
    const keyMap = new Map<string, number>();
    labels = els.map((e, i) => {
      const f = formatTuple(e);
      keyMap.set(f, i);
      return f;
    });
    latexLabels = labels;
    matrix = els.map((a) =>
      els.map((b) => keyMap.get(formatTuple(addDirectProductTuples(a, b, spec.moduli)))!)
    );
    orders = els.map((a) => orderDirectProductTuple(a, spec.moduli));
    inverses = els.map((a) =>
      keyMap.get(formatTuple(inverseDirectProductTuple(a, spec.moduli)))!
    );
  } else if (spec.type === 'dihedral') {
    title = `D_${spec.n} (Dihedral group of order ${2 * spec.n})`;
    const els = generateDn(spec.n);
    const keyMap = new Map<string, number>();
    labels = els.map((e, i) => {
      const s = formatDihedral(e);
      keyMap.set(s, i);
      return s;
    });
    latexLabels = els.map((e) => formatDihedralLatex(e));
    matrix = els.map((a) =>
      els.map((b) => keyMap.get(formatDihedral(multiplyDihedral(a, b).result))!)
    );
    orders = els.map(dihedralOrder);
    inverses = els.map((a) => keyMap.get(formatDihedral(dihedralInverse(a)))!);
  } else {
    const all = generateSn(spec.n);
    const els =
      spec.type === 'alternating' ? all.filter((p) => permParity(p) === 'even') : all;
    title =
      spec.type === 'alternating'
        ? `A_${spec.n} (Alternating group of order ${els.length})`
        : `S_${spec.n} (Symmetric group of order ${els.length})`;
    if (els.length > 24) {
      throw new Error('Cayley table visualization is capped at group order 24 (e.g. S_4, A_4, D_12).');
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
    orders = els.map(permOrder);
    inverses = els.map((p) => keyMap.get(formatCycleNotation(invertPerm(p), true))!);
  }

  const order = labels.length;
  const closed = matrix.every((row) => row.every((v) => v >= 0 && v < order));

  // Detect identity element
  let identityIndex = -1;
  for (let e = 0; e < order; e++) {
    let ok = true;
    for (let x = 0; x < order; x++) {
      if (matrix[e][x] !== x || matrix[x][e] !== x) {
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

  // Verify inverses
  const allHaveInverses =
    hasIdentity &&
    labels.every(
      (_, x) =>
        matrix[x][inverses[x]] === identityIndex && matrix[inverses[x]][x] === identityIndex
    );

  // Verify associativity (for n <= 24, n^3 <= 13824 operations — instant!)
  let associative = true;
  outer: for (let i = 0; i < order; i++) {
    for (let j = 0; j < order; j++) {
      const ij = matrix[i][j];
      for (let k = 0; k < order; k++) {
        if (matrix[ij][k] !== matrix[i][matrix[j][k]]) {
          associative = false;
          break outer;
        }
      }
    }
  }

  // Verify commutativity
  let isAbelian = true;
  outerAb: for (let i = 0; i < order; i++) {
    for (let j = i + 1; j < order; j++) {
      if (matrix[i][j] !== matrix[j][i]) {
        isAbelian = false;
        break outerAb;
      }
    }
  }

  // Verify Latin square
  let isLatinSquare = true;
  for (let i = 0; i < order; i++) {
    const rowSet = new Set(matrix[i]);
    const colSet = new Set(matrix.map((r) => r[i]));
    if (rowSet.size !== order || colSet.size !== order) {
      isLatinSquare = false;
      break;
    }
  }

  return {
    title,
    order,
    labels,
    latexLabels,
    matrix,
    identityIndex,
    inverses,
    orders,
    axioms: {
      closed,
      associative,
      hasIdentity,
      allHaveInverses,
      isAbelian,
      isLatinSquare,
    },
  };
}
