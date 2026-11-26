export interface PrimeFactor {
  prime: number;
  exponent: number;
}

export function mod(a: number, m: number): number {
  return ((a % m) + m) % m;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a * b) / gcd(a, b));
}

export function lcmArray(values: number[]): number {
  if (values.length === 0) return 1;
  return values.reduce((acc, v) => lcm(acc, v), 1);
}

export function isPrime(n: number): boolean {
  if (n < 2 || !Number.isInteger(n)) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

export function primeFactorization(n: number): PrimeFactor[] {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error('Prime factorization requires a positive integer.');
  }
  if (n === 1) return [];
  const factors: PrimeFactor[] = [];
  let rem = n;
  for (let p = 2; p * p <= rem; p++) {
    if (rem % p === 0) {
      let exp = 0;
      while (rem % p === 0) {
        rem = Math.floor(rem / p);
        exp++;
      }
      factors.push({ prime: p, exponent: exp });
    }
  }
  if (rem > 1) {
    factors.push({ prime: rem, exponent: 1 });
  }
  return factors;
}

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
};

export function toSuperscript(n: number | string): string {
  return String(n)
    .split('')
    .map((ch) => SUPERSCRIPTS[ch] ?? ch)
    .join('');
}

export function toSubscript(n: number | string): string {
  const subs: Record<string, string> = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
  };
  return String(n)
    .split('')
    .map((ch) => subs[ch] ?? ch)
    .join('');
}

export function formatPrimeFactorization(n: number): string {
  if (n === 1) return '1';
  const factors = primeFactorization(n);
  return factors
    .map((f) => (f.exponent === 1 ? `${f.prime}` : `${f.prime}${toSuperscript(f.exponent)}`))
    .join(' · ');
}

export function formatPrimeFactorizationLatex(n: number): string {
  if (n === 1) return '1';
  const factors = primeFactorization(n);
  return factors
    .map((f) => (f.exponent === 1 ? `${f.prime}` : `${f.prime}^{${f.exponent}}`))
    .join(' \\cdot ');
}

export function eulerPhi(n: number): number {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error('Euler totient requires a positive integer.');
  }
  if (n === 1) return 1;
  const factors = primeFactorization(n);
  let result = n;
  for (const { prime } of factors) {
    result = Math.floor(result / prime) * (prime - 1);
  }
  return result;
}

export function coprimesBelow(n: number): number[] {
  if (!Number.isInteger(n) || n < 1) return [];
  if (n === 1) return [0];
  const res: number[] = [];
  for (let k = 1; k < n; k++) {
    if (gcd(k, n) === 1) res.push(k);
  }
  return res;
}

export function divisors(n: number): number[] {
  if (!Number.isInteger(n) || n < 1) return [];
  const small: number[] = [];
  const large: number[] = [];
  for (let d = 1; d * d <= n; d++) {
    if (n % d === 0) {
      small.push(d);
      if (d * d !== n) large.push(Math.floor(n / d));
    }
  }
  return [...small, ...large.reverse()];
}

export function integerPartitions(target: number, maxVal = target): number[][] {
  if (target === 0) return [[]];
  const result: number[][] = [];
  for (let first = Math.min(target, maxVal); first >= 1; first--) {
    const subPartitions = integerPartitions(target - first, first);
    for (const sub of subPartitions) {
      result.push([first, ...sub]);
    }
  }
  return result;
}

export function orderInZn(a: number, n: number): number {
  const k = mod(a, n);
  if (k === 0) return 1;
  return Math.floor(n / gcd(n, k));
}

export function inverseInZn(a: number, n: number): number {
  return mod(-a, n);
}

export function cyclicSubgroupZn(a: number, n: number): number[] {
  const step = mod(a, n);
  if (step === 0) return [0];
  const elements: number[] = [0];
  let curr = step;
  while (curr !== 0) {
    elements.push(curr);
    curr = mod(curr + step, n);
  }
  return elements;
}
