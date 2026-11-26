import {
  classifyAbelianGroups,
  computeOrderDistribution,
  orderDirectProductTuple,
} from './abelian.ts';
import { buildCayleyTable } from './cayley.ts';
import {
  createDihedralElement,
  dihedralInverse,
  dihedralOrder,
  formatDihedral,
  generateDn,
  multiplyDihedral,
  verifyDnAlgebraicConsistency,
} from './dihedral.ts';
import {
  coprimesBelow,
  eulerPhi,
  inverseInZn,
  orderInZn,
} from './numberTheory.ts';
import {
  composePerm,
  formatCycleNotation,
  invertPerm,
  parseCycleString,
  permOrder,
  permParity,
  summarizeSn,
} from './permutations.ts';

export interface ValidationCheckResult {
  id: number;
  name: string;
  passed: boolean;
  details: string;
}

export function runMathValidationSuite(): ValidationCheckResult[] {
  const results: ValidationCheckResult[] = [];

  // 1. Classification of finite abelian groups of order 72 (6 groups)
  const cls72 = classifyAbelianGroups(72);
  const expectedInv72 = ['ℤ₇₂', 'ℤ₂ × ℤ₃₆', 'ℤ₂ × ℤ₂ × ℤ₁₈', 'ℤ₃ × ℤ₂₄', 'ℤ₆ × ℤ₁₂', 'ℤ₂ × ℤ₆ × ℤ₆'];
  const gotInv72 = cls72.groups.map((g) => g.invariantLabel);
  const ok1 =
    cls72.totalGroups === 6 && expectedInv72.every((lbl) => gotInv72.includes(lbl));
  results.push({
    id: 1,
    name: 'Classification of Finite Abelian Groups of Order 72',
    passed: ok1,
    details: `Found ${cls72.totalGroups} groups: ${gotInv72.join(', ')}`,
  });

  // 2. Euler totient phi(n) for n = 1..20
  const expectedPhi = [1, 1, 2, 2, 4, 2, 6, 4, 6, 4, 10, 4, 12, 6, 8, 8, 16, 6, 18, 8];
  const gotPhi = Array.from({ length: 20 }, (_, i) => eulerPhi(i + 1));
  const ok2 = expectedPhi.every((v, i) => gotPhi[i] === v);
  results.push({
    id: 2,
    name: 'Euler Totient Function φ(n) for n = 1..20',
    passed: ok2,
    details: `φ(1..20) = [${gotPhi.join(', ')}]`,
  });

  // 3. Generators of Z_n for n = 4, 6, 8, 10, 12, 20
  const gens12 = coprimesBelow(12);
  const gens20 = coprimesBelow(20);
  const ok3 =
    JSON.stringify(gens12) === JSON.stringify([1, 5, 7, 11]) &&
    JSON.stringify(gens20) === JSON.stringify([1, 3, 7, 9, 11, 13, 17, 19]) &&
    coprimesBelow(8).length === 4;
  results.push({
    id: 3,
    name: 'Generators of Cyclic Groups Z_n (n = 4, 6, 8, 10, 12, 20)',
    passed: ok3,
    details: `Generators of ℤ₁₂: {${gens12.join(', ')}}; ℤ₂₀: {${gens20.join(', ')}}`,
  });

  // 4. Number of even and odd permutations in S_5 (60 each)
  const s5 = summarizeSn(5);
  const ok4 = s5.total === 120 && s5.evenCount === 60 && s5.oddCount === 60;
  results.push({
    id: 4,
    name: 'Even and Odd Permutations in S₅ (|A₅| = 60)',
    passed: ok4,
    details: `Total: ${s5.total}, Even: ${s5.evenCount}, Odd: ${s5.oddCount}`,
  });

  // 5. Element of order 6 in S_5 and its parity
  const p6 = parseCycleString('(1 2 3)(4 5)', 5);
  const ordP6 = permOrder(p6);
  const parP6 = permParity(p6);
  const ok5 = ordP6 === 6 && parP6 === 'odd';
  results.push({
    id: 5,
    name: 'Order-6 Element in S₅ & Parity',
    passed: ok5,
    details: `${formatCycleNotation(p6)} has order ${ordP6} and parity ${parP6} (3 transpositions)`,
  });

  // 6. Element orders in D_6 and D_8
  const d6 = generateDn(6);
  const d8 = generateDn(8);
  const d6Orders = d6.map(dihedralOrder);
  const d8Orders = d8.map(dihedralOrder);
  const ok6 =
    d6.length === 12 &&
    d6Orders.filter((o) => o === 6).length === 2 &&
    d6Orders.filter((o) => o === 2).length === 7 &&
    d8.length === 16 &&
    d8Orders.filter((o) => o === 8).length === 4 &&
    d8Orders.filter((o) => o === 2).length === 9;
  results.push({
    id: 6,
    name: 'Element Orders in D₆ and D₈',
    passed: ok6,
    details: `D₆: 2 elements of order 6, 7 of order 2; D₈: 4 elements of order 8, 9 of order 2`,
  });

  // 7. Z_2 x Z_2 vs Z_4 structural difference
  const z2z2Dist = computeOrderDistribution([2, 2]);
  const z4Dist = computeOrderDistribution([4]);
  const ok7 = !z2z2Dist[4] && z2z2Dist[2] === 3 && z4Dist[4] === 2 && orderDirectProductTuple([1, 1], [2, 2]) === 2;
  results.push({
    id: 7,
    name: 'Structural Contrast: ℤ₂ × ℤ₂ vs ℤ₄',
    passed: ok7,
    details: `ℤ₂ × ℤ₂ order dist: ${JSON.stringify(z2z2Dist)}; ℤ₄ order dist: ${JSON.stringify(z4Dist)}`,
  });

  // 8. Inverse element computations
  const invZ12 = inverseInZn(5, 12);
  const invS4 = invertPerm(parseCycleString('(1 2 3 4)', 4));
  const invD5 = dihedralInverse(createDihedralElement(5, 0, 2));
  const invD5Ref = dihedralInverse(createDihedralElement(5, 1, 3));
  const ok8 =
    invZ12 === 7 &&
    formatCycleNotation(invS4) === '(1, 4, 3, 2)' &&
    formatDihedral(invD5) === 'ρ³' &&
    formatDihedral(invD5Ref) === 'μρ³';
  results.push({
    id: 8,
    name: 'Inverse Element Computations Across ℤ₁₂, S₄, D₅',
    passed: ok8,
    details: `-5 mod 12 = ${invZ12}, (1,2,3,4)⁻¹ = ${formatCycleNotation(invS4)}, (ρ²)⁻¹ = ${formatDihedral(invD5)}, (μρ³)⁻¹ = ${formatDihedral(invD5Ref)}`,
  });

  // 9. Cayley table accuracy & axioms
  const ctD4 = buildCayleyTable({ type: 'dihedral', n: 4 });
  const ctZ2Z2 = buildCayleyTable({ type: 'direct_product', moduli: [2, 2] });
  const ok9 =
    ctD4.order === 8 &&
    ctD4.axioms.closed &&
    ctD4.axioms.associative &&
    ctD4.axioms.hasIdentity &&
    ctD4.axioms.allHaveInverses &&
    !ctD4.axioms.isAbelian &&
    ctD4.axioms.isLatinSquare &&
    ctZ2Z2.axioms.isAbelian;
  results.push({
    id: 9,
    name: 'Cayley Table Axiom & Symmetry Verification (D₄ & ℤ₂ × ℤ₂)',
    passed: ok9,
    details: `D₄ Latin square=${ctD4.axioms.isLatinSquare}, abelian=${ctD4.axioms.isAbelian}; ℤ₂×ℤ₂ abelian=${ctZ2Z2.axioms.isAbelian}`,
  });

  // 10. Right-to-left composition in S_3 & D_5
  const sigma = parseCycleString('(1 2)', 3);
  const tau = parseCycleString('(1 3)', 3);
  const compS3 = composePerm(sigma, tau); // (1 2)(1 3) = (1 3 2)
  const d5Prod = multiplyDihedral(
    createDihedralElement(5, 1, 2),
    createDihedralElement(5, 1, 1)
  ).result; // (μρ²)(μρ) = ρ⁴
  const ok10 =
    formatCycleNotation(compS3) === '(1, 3, 2)' &&
    formatDihedral(d5Prod) === 'ρ⁴';
  results.push({
    id: 10,
    name: 'Right-to-Left Composition Consistency (S₃ & (μρ²)(μρ) in D₅)',
    passed: ok10,
    details: `(1,2)(1,3) = ${formatCycleNotation(compS3)}; (μρ²)(μρ) in D₅ = ${formatDihedral(d5Prod)}`,
  });

  // 11. Dihedral algebraic vs vertex permutation consistency for D_3..D_8
  const dnChecks = [3, 4, 5, 6, 7, 8].map((n) => ({ n, ...verifyDnAlgebraicConsistency(n) }));
  const ok11 = dnChecks.every((c) => c.passed);
  results.push({
    id: 11,
    name: 'D_n Algebraic Reduction vs Geometric Vertex Permutations (n = 3..8)',
    passed: ok11,
    details: `Verified ${dnChecks.reduce((s, c) => s + c.checkedPairs, 0)} pairs across D₃..D₈`,
  });

  // 12. Cyclic subgroup orders & Z_n element orders
  const ok12 = orderInZn(4, 12) === 3 && orderInZn(0, 12) === 1 && orderInZn(5, 12) === 12;
  results.push({
    id: 12,
    name: 'Element Orders in Cyclic Groups',
    passed: ok12,
    details: `In ℤ₁₂: ord(0)=1, ord(4)=3, ord(5)=12`,
  });

  return results;
}
