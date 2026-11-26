import { gcd, mod, toSuperscript } from './numberTheory.ts';

/**
 * Represents an element of D_n in canonical standard form:
 * 1 (ref=0, k=0), rho^k (ref=0, k=1..n-1), mu*rho^k (ref=1, k=0..n-1).
 */
export interface DihedralElement {
  n: number;
  ref: 0 | 1;
  k: number;
}

export interface DihedralProductStep {
  step: string;
  expression: string;
}

export function createDihedralElement(n: number, ref: 0 | 1, k: number): DihedralElement {
  if (!Number.isInteger(n) || n < 3) {
    throw new Error('Dihedral group D_n requires n >= 3.');
  }
  return { n, ref, k: mod(k, n) };
}

export function formatDihedral(el: DihedralElement, identitySymbol = '1'): string {
  const k = mod(el.k, el.n);
  if (el.ref === 0) {
    if (k === 0) return identitySymbol;
    if (k === 1) return 'ρ';
    return `ρ${toSuperscript(k)}`;
  }
  if (k === 0) return 'μ';
  if (k === 1) return 'μρ';
  return `μρ${toSuperscript(k)}`;
}

export function formatDihedralLatex(el: DihedralElement, identitySymbol = '1'): string {
  const k = mod(el.k, el.n);
  if (el.ref === 0) {
    if (k === 0) return identitySymbol;
    if (k === 1) return '\\rho';
    return `\\rho^{${k}}`;
  }
  if (k === 0) return '\\mu';
  if (k === 1) return '\\mu\\rho';
  return `\\mu\\rho^{${k}}`;
}

/**
 * Generates all 2n elements of D_n in standard order:
 * {1, ρ, ρ², ..., ρⁿ⁻¹, μ, μρ, μρ², ..., μρⁿ⁻¹}
 */
export function generateDn(n: number): DihedralElement[] {
  const rotations = Array.from({ length: n }, (_, k) => createDihedralElement(n, 0, k));
  const reflections = Array.from({ length: n }, (_, k) => createDihedralElement(n, 1, k));
  return [...rotations, ...reflections];
}

/**
 * Multiplies two elements a * b (right-to-left action: b applied first, then a)
 * using defining relations:
 *   ρ^n = 1, μ^2 = 1, ρ^k μ = μ ρ^(n-k).
 */
export function multiplyDihedral(
  a: DihedralElement,
  b: DihedralElement,
  identitySymbol = '1'
): { result: DihedralElement; steps: DihedralProductStep[] } {
  if (a.n !== b.n) {
    throw new Error(`Cannot multiply elements from D_${a.n} and D_${b.n}.`);
  }
  const n = a.n;
  const aStr = formatDihedral(a, identitySymbol);
  const bStr = formatDihedral(b, identitySymbol);
  const steps: DihedralProductStep[] = [
    { step: 'Initial product', expression: `(${aStr})(${bStr})` },
  ];

  // Case 1: b has no reflection (b = ρ^j)
  if (b.ref === 0) {
    const newK = mod(a.k + b.k, n);
    const result = createDihedralElement(n, a.ref, newK);
    if (a.k + b.k >= n) {
      steps.push({
        step: `Add rotation exponents and apply ρ${toSuperscript(n)} = ${identitySymbol}`,
        expression: `${a.ref === 1 ? 'μ' : ''}ρ${toSuperscript(a.k + b.k)} = ${formatDihedral(result, identitySymbol)}`,
      });
    } else {
      steps.push({
        step: 'Combine rotation powers directly',
        expression: formatDihedral(result, identitySymbol),
      });
    }
    return { result, steps };
  }

  // Case 2: b = μ ρ^j
  if (a.k === 0) {
    // a is identity or μ
    const newRef = ((a.ref + 1) % 2) as 0 | 1;
    const result = createDihedralElement(n, newRef, b.k);
    if (a.ref === 1) {
      steps.push({
        step: `Apply μ² = ${identitySymbol}`,
        expression: `μμ${b.k === 0 ? '' : b.k === 1 ? 'ρ' : `ρ${toSuperscript(b.k)}`} = ${formatDihedral(result, identitySymbol)}`,
      });
    } else {
      steps.push({
        step: `Identity ${identitySymbol} preserves element`,
        expression: formatDihedral(result, identitySymbol),
      });
    }
    return { result, steps };
  }

  // General case: a = μ^a.ref ρ^i (i >= 1), b = μ ρ^j
  const flipped = n - a.k;
  const flippedStr = flipped === 1 ? 'μρ' : `μρ${toSuperscript(flipped)}`;
  const leftPrefix = a.ref === 1 ? 'μ' : '';
  const rightSuffix = b.k === 0 ? '' : b.k === 1 ? 'ρ' : `ρ${toSuperscript(b.k)}`;
  steps.push({
    step: `Commute ρ${a.k === 1 ? '' : toSuperscript(a.k)}μ = μρ${toSuperscript(n)}⁻${toSuperscript(a.k)} = ${flippedStr}`,
    expression: `${leftPrefix}(${flippedStr})${rightSuffix}`,
  });

  const newRef = ((a.ref + 1) % 2) as 0 | 1;
  const rawSum = flipped + b.k;
  const newK = mod(rawSum, n);
  const result = createDihedralElement(n, newRef, newK);

  if (a.ref === 1) {
    steps.push({
      step: `Apply μ² = ${identitySymbol} and combine rotation exponents (${flipped} + ${b.k} ≡ ${newK} mod ${n})`,
      expression: formatDihedral(result, identitySymbol),
    });
  } else {
    steps.push({
      step: `Combine rotation exponents (${flipped} + ${b.k} ≡ ${newK} mod ${n})`,
      expression: formatDihedral(result, identitySymbol),
    });
  }

  return { result, steps };
}

export function dihedralInverse(el: DihedralElement): DihedralElement {
  if (el.ref === 1) return createDihedralElement(el.n, 1, el.k);
  return createDihedralElement(el.n, 0, mod(-el.k, el.n));
}

export function dihedralOrder(el: DihedralElement): number {
  const k = mod(el.k, el.n);
  if (el.ref === 1) return 2;
  if (k === 0) return 1;
  return Math.floor(el.n / gcd(el.n, k));
}

export function dihedralPower(
  el: DihedralElement,
  exp: number,
  identitySymbol = '1'
): DihedralElement {
  if (exp === 0) return createDihedralElement(el.n, 0, 0);
  const base = exp < 0 ? dihedralInverse(el) : el;
  let absExp = Math.abs(exp);
  let acc = createDihedralElement(el.n, 0, 0);
  let cur = base;
  while (absExp > 0) {
    if (absExp % 2 === 1) {
      acc = multiplyDihedral(acc, cur, identitySymbol).result;
    }
    absExp = Math.floor(absExp / 2);
    if (absExp > 0) {
      cur = multiplyDihedral(cur, cur, identitySymbol).result;
    }
  }
  return acc;
}

export function dihedralCenter(n: number): DihedralElement[] {
  if (n % 2 === 0) {
    return [createDihedralElement(n, 0, 0), createDihedralElement(n, 0, n / 2)];
  }
  return [createDihedralElement(n, 0, 0)];
}

/**
 * Geometric action on polygon vertices {0, 1, ..., n-1} ordered counterclockwise:
 * ρ(v) = (v + 1) mod n
 * μ(v) = (-v) mod n
 * (μ^ref ρ^k)(v) = μ^ref((v + k) mod n)
 */
export function dihedralToVertexPerm(el: DihedralElement): number[] {
  return Array.from({ length: el.n }, (_, v) => {
    const rotated = mod(v + el.k, el.n);
    return el.ref === 1 ? mod(-rotated, el.n) : rotated;
  });
}

export function verifyDnAlgebraicConsistency(n: number): {
  passed: boolean;
  checkedPairs: number;
  failureMessage?: string;
} {
  const elements = generateDn(n);
  let checkedPairs = 0;
  for (const a of elements) {
    for (const b of elements) {
      checkedPairs++;
      const { result } = multiplyDihedral(a, b);
      const algPerm = dihedralToVertexPerm(result);
      const permA = dihedralToVertexPerm(a);
      const permB = dihedralToVertexPerm(b);
      const composedPerm = permB.map((v) => permA[v]);
      for (let i = 0; i < n; i++) {
        if (algPerm[i] !== composedPerm[i]) {
          return {
            passed: false,
            checkedPairs,
            failureMessage: `Mismatch in D_${n} for (${formatDihedral(a)})(${formatDihedral(b)})`,
          };
        }
      }
    }
  }
  return { passed: true, checkedPairs };
}

const SUPERSCRIPT_TO_ASCII: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
};

/**
 * Parses a dihedral expression such as "1", "ρ²", "μρ³", "rho^2", "mu*rho", "(μρ)^2", "ρ⁻¹"
 * into canonical standard form. Rejects symbols r, s, σ, e with guidance.
 */
export function parseDihedralExpression(
  input: string,
  n: number,
  identitySymbol = '1'
): DihedralElement {
  const normalized = input
    .trim()
    .replace(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (seq) => {
      const ascii = seq
        .replace(/⁻/g, '-')
        .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (ch) => SUPERSCRIPT_TO_ASCII[ch]);
      return `^${ascii}`;
    })
    .replace(/rho/gi, 'ρ')
    .replace(/mu/gi, 'μ')
    .replace(/iota|ι/gi, identitySymbol)
    .replace(/\s+/g, '');

  if (!normalized) {
    throw new Error(`Enter a dihedral group expression using ${identitySymbol}, ρ, and μ.`);
  }
  if (/[rseσ]/i.test(normalized)) {
    throw new Error(
      `Use dihedral notation ${identitySymbol} (identity), ρ (rotation), and μ (reflection) — never r, s, σ, or e.`
    );
  }

  let i = 0;

  const readExponent = (allowBareDigits: boolean): number => {
    if (normalized[i] === '^') {
      i++;
      let sign = 1;
      if (normalized[i] === '-') {
        sign = -1;
        i++;
      }
      let digits = '';
      while (i < normalized.length && /\d/.test(normalized[i])) {
        digits += normalized[i++];
      }
      if (!digits) throw new Error(`Missing exponent after ^ in "${input}".`);
      return sign * Number(digits);
    }
    if (allowBareDigits && /\d/.test(normalized[i] ?? '')) {
      let digits = '';
      while (i < normalized.length && /\d/.test(normalized[i])) {
        digits += normalized[i++];
      }
      return Number(digits);
    }
    return 1;
  };

  const parseSequence = (stopOnCloseParen: boolean): DihedralElement => {
    let acc = createDihedralElement(n, 0, 0);
    let parsedAny = false;
    while (i < normalized.length) {
      const ch = normalized[i];
      if (ch === '*' || ch === '·') {
        i++;
        continue;
      }
      if (ch === ')') {
        if (!stopOnCloseParen) {
          throw new Error(`Unexpected closing parenthesis in "${input}".`);
        }
        if (!parsedAny) {
          throw new Error(`Empty parentheses in "${input}".`);
        }
        return acc;
      }
      if (ch === '(') {
        i++;
        const inner = parseSequence(true);
        if (normalized[i] !== ')') {
          throw new Error(`Missing closing parenthesis in "${input}".`);
        }
        i++;
        const exp = readExponent(false);
        const powered = dihedralPower(inner, exp, identitySymbol);
        acc = multiplyDihedral(acc, powered, identitySymbol).result;
        parsedAny = true;
        continue;
      }
      if (ch === '1' || ch === 't') {
        i++;
        readExponent(false);
        parsedAny = true;
        continue;
      }
      if (ch === 'ρ' || ch === 'μ') {
        i++;
        const exp = readExponent(true);
        const base =
          ch === 'ρ'
            ? createDihedralElement(n, 0, 1)
            : createDihedralElement(n, 1, 0);
        const token = dihedralPower(base, exp, identitySymbol);
        acc = multiplyDihedral(acc, token, identitySymbol).result;
        parsedAny = true;
        continue;
      }
      throw new Error(
        `Unrecognized symbol "${ch}". Use ${identitySymbol}, ρ, and μ (e.g., μρ², ρ³, ${identitySymbol}).`
      );
    }
    if (stopOnCloseParen) {
      throw new Error(`Missing closing parenthesis in "${input}".`);
    }
    return acc;
  };

  return parseSequence(false);
}

export function dihedralDescription(el: DihedralElement): string {
  const k = mod(el.k, el.n);
  if (el.ref === 0) {
    if (k === 0) return 'Identity transformation (0° rotation)';
    const deg = ((360 * k) / el.n).toFixed(el.n % 3 === 0 || 360 % el.n === 0 ? 0 : 1);
    return `Counterclockwise rotation by ${deg}° (2π·${k}/${el.n})`;
  }
  const axisDeg = (k === 0 ? 0 : (180 * (el.n - k)) / el.n).toFixed(1).replace(/\.0$/, '');
  return `Reflection across axis at ${axisDeg}° (leaves vertex-pair symmetry fixed)`;
}
