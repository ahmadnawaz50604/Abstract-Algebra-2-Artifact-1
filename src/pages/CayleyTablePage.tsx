import {
  AlertCircle,
  CheckCircle2,
  Download,
  HelpCircle,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  buildCayleyTable,
  explainCayleyProduct,
  type AxiomCheckStatus,
  type CayleyGroupKind,
} from '../math/cayley.ts';
import { toSubscript } from '../math/numberTheory.ts';

type FamilyTab =
  | 'cyclic'
  | 'custom_set'
  | 'direct_product'
  | 'dihedral'
  | 'units_mod'
  | 'symmetric'
  | 'alternating'
  | 'mult_mod'
  | 'sub_mod';

type DemoTab = 'operation' | 'identity_inverse' | 'associativity' | 'quiz';

const CUSTOM_PRESETS: {
  id: string;
  label: string;
  op: string;
  elements: string[];
  cells: string[][];
}[] = [
  {
    id: 'z3',
    label: 'Valid Group (ℤ₃)',
    op: '⊕',
    elements: ['0', '1', '2'],
    cells: [
      ['0', '1', '2'],
      ['1', '2', '0'],
      ['2', '0', '1'],
    ],
  },
  {
    id: 'v4',
    label: 'Klein 4-Group (V₄)',
    op: '*',
    elements: ['e', 'a', 'b', 'c'],
    cells: [
      ['e', 'a', 'b', 'c'],
      ['a', 'e', 'c', 'b'],
      ['b', 'c', 'e', 'a'],
      ['c', 'b', 'a', 'e'],
    ],
  },
  {
    id: 'non_assoc',
    label: 'Non-Associative (Symmetric)',
    op: '*',
    elements: ['e', 'a', 'b'],
    cells: [
      ['e', 'a', 'b'],
      ['a', 'e', 'e'],
      ['b', 'e', 'b'],
    ],
  },
  {
    id: 'closure_fail',
    label: 'Closure Failure',
    op: '*',
    elements: ['0', '1', '2'],
    cells: [
      ['0', '1', '2'],
      ['1', '2', '3'],
      ['2', '0', '1'],
    ],
  },
  {
    id: 'no_inv',
    label: 'Zero Divisors (No Inverses)',
    op: '·',
    elements: ['0', '1', '2', '3'],
    cells: [
      ['0', '0', '0', '0'],
      ['0', '1', '2', '3'],
      ['0', '2', '0', '2'],
      ['0', '3', '2', '1'],
    ],
  },
];

export const CayleyTablePage: React.FC = () => {
  const { cayleySpec, setCayleySpec, setActiveNav } = useApp();

  const [family, setFamily] = useState<FamilyTab>(cayleySpec.type);
  const [cyclicInput, setCyclicInput] = useState<string>(
    cayleySpec.type === 'cyclic' ? String(cayleySpec.n) : '7'
  );
  const [dihedralN, setDihedralN] = useState<number>(
    cayleySpec.type === 'dihedral' ? cayleySpec.n : 4
  );
  const [dihedralIdSym, setDihedralIdSym] = useState<'1' | 't'>(
    cayleySpec.type === 'dihedral' && cayleySpec.identitySymbol === 't' ? 't' : '1'
  );
  const [unitsN, setUnitsN] = useState<number>(
    cayleySpec.type === 'units_mod' ? cayleySpec.n : 10
  );
  const [counterN, setCounterN] = useState<number>(
    cayleySpec.type === 'mult_mod' || cayleySpec.type === 'sub_mod' ? cayleySpec.n : 6
  );
  const [permN, setPermN] = useState<number>(
    cayleySpec.type === 'symmetric' || cayleySpec.type === 'alternating' ? cayleySpec.n : 3
  );
  const [moduliText, setModuliText] = useState<string>(
    cayleySpec.type === 'direct_product' ? cayleySpec.moduli.join(', ') : '2, 4'
  );

  // Custom Finite Set Editor State
  const [customElementsText, setCustomElementsText] = useState<string>(
    cayleySpec.type === 'custom_set' ? cayleySpec.elements.join(', ') : 'e, a, b'
  );
  const [customOpSymbol, setCustomOpSymbol] = useState<string>(
    cayleySpec.type === 'custom_set' ? cayleySpec.opSymbol ?? '*' : '*'
  );
  const [customCells, setCustomCells] = useState<string[][]>(
    cayleySpec.type === 'custom_set'
      ? cayleySpec.rawCells
      : CUSTOM_PRESETS[2].cells.map((r) => [...r])
  );
  const [customEditMode, setCustomEditMode] = useState<boolean>(true);

  const [inputError, setInputError] = useState<string>('');

  // Matrix inspection & highlight controls
  const [highlightIdentity, setHighlightIdentity] = useState<boolean>(true);
  const [highlightInverses, setHighlightInverses] = useState<boolean>(false);
  const [highlightOrderFilter, setHighlightOrderFilter] = useState<number | null>(null);
  const [elementSearch, setElementSearch] = useState<string>('');

  // Interactive demonstration sub-panel state
  const [demoTab, setDemoTab] = useState<DemoTab>('operation');
  const [activeCell, setActiveCell] = useState<{ r: number; c: number }>({ r: 1, c: 2 });
  const [inspectElIdx, setInspectElIdx] = useState<number>(1);
  const [assocTriple, setAssocTriple] = useState<{ a: number; b: number; c: number }>({
    a: 0,
    b: 1,
    c: 2,
  });

  // Quiz state
  const [quizTarget, setQuizTarget] = useState<{ r: number; c: number }>({ r: 1, c: 2 });
  const [quizGuess, setQuizGuess] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number }>({
    correct: 0,
    total: 0,
  });

  // Sync from AppContext navigation (e.g. Group Explorer -> Open in Cayley Table)
  useEffect(() => {
    setFamily(cayleySpec.type);
    if (cayleySpec.type === 'cyclic') setCyclicInput(String(cayleySpec.n));
    if (cayleySpec.type === 'dihedral') {
      setDihedralN(cayleySpec.n);
      setDihedralIdSym(cayleySpec.identitySymbol ?? '1');
    }
    if (cayleySpec.type === 'units_mod') setUnitsN(cayleySpec.n);
    if (cayleySpec.type === 'mult_mod' || cayleySpec.type === 'sub_mod') setCounterN(cayleySpec.n);
    if (cayleySpec.type === 'symmetric' || cayleySpec.type === 'alternating') {
      setPermN(cayleySpec.n);
    }
    if (cayleySpec.type === 'direct_product') {
      setModuliText(cayleySpec.moduli.join(', '));
    }
    if (cayleySpec.type === 'custom_set') {
      setCustomElementsText(cayleySpec.elements.join(', '));
      setCustomOpSymbol(cayleySpec.opSymbol ?? '*');
      setCustomCells(cayleySpec.rawCells.map((r) => [...r]));
    }
    setInputError('');
  }, [cayleySpec]);

  const tableResult = useMemo(() => {
    try {
      const data = buildCayleyTable(cayleySpec);
      return { data, error: '' };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unable to construct Cayley table.',
      };
    }
  }, [cayleySpec]);

  const table = tableResult.data;

  useEffect(() => {
    if (!table) return;
    setActiveCell((prev) => ({
      r: Math.min(prev.r, Math.max(0, table.order - 1)),
      c: Math.min(prev.c, Math.max(0, table.order - 1)),
    }));
    setInspectElIdx((prev) => Math.min(prev, Math.max(0, table.order - 1)));
    setAssocTriple((prev) => ({
      a: Math.min(prev.a, Math.max(0, table.order - 1)),
      b: Math.min(prev.b, Math.max(0, table.order - 1)),
      c: Math.min(prev.c, Math.max(0, table.order - 1)),
    }));
    const r0 = table.order > 1 ? 1 : 0;
    const c0 = table.order > 2 ? 2 : table.order > 1 ? 1 : 0;
    setQuizTarget({ r: r0, c: c0 });
    setQuizGuess(null);
    setHighlightOrderFilter(null);
  }, [table]);

  const parsedCustomElements = useMemo(() => {
    return customElementsText
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [customElementsText]);

  const switchFamily = (nextFamily: FamilyTab) => {
    setFamily(nextFamily);
    setInputError('');
    if (nextFamily === 'cyclic') {
      const n = Math.max(1, Math.min(24, Math.trunc(Number(cyclicInput)) || 7));
      setCyclicInput(String(n));
      setCayleySpec({ type: 'cyclic', n });
    } else if (nextFamily === 'custom_set') {
      const els = parsedCustomElements.length >= 1 ? parsedCustomElements.slice(0, 10) : ['e', 'a', 'b'];
      const sizedCells = Array.from({ length: els.length }, (_, r) =>
        Array.from({ length: els.length }, (__, c) => customCells[r]?.[c] ?? els[(r + c) % els.length])
      );
      setCustomCells(sizedCells);
      setCayleySpec({
        type: 'custom_set',
        elements: els,
        rawCells: sizedCells,
        opSymbol: customOpSymbol || '*',
      });
    } else if (nextFamily === 'dihedral') {
      const n = Math.max(3, Math.min(12, Math.trunc(dihedralN) || 4));
      setDihedralN(n);
      setCayleySpec({ type: 'dihedral', n, identitySymbol: dihedralIdSym });
    } else if (nextFamily === 'units_mod') {
      const n = Math.max(2, Math.min(48, Math.trunc(unitsN) || 10));
      setUnitsN(n);
      setCayleySpec({ type: 'units_mod', n });
    } else if (nextFamily === 'mult_mod') {
      const n = Math.max(2, Math.min(20, Math.trunc(counterN) || 6));
      setCounterN(n);
      setCayleySpec({ type: 'mult_mod', n });
    } else if (nextFamily === 'sub_mod') {
      const n = Math.max(2, Math.min(20, Math.trunc(counterN) || 5));
      setCounterN(n);
      setCayleySpec({ type: 'sub_mod', n });
    } else if (nextFamily === 'symmetric') {
      const n = Math.max(2, Math.min(4, Math.trunc(permN) || 3));
      setPermN(n);
      setCayleySpec({ type: 'symmetric', n });
    } else if (nextFamily === 'alternating') {
      const n = Math.max(3, Math.min(4, Math.trunc(permN) || 4));
      setPermN(n);
      setCayleySpec({ type: 'alternating', n });
    } else {
      const parsed = moduliText
        .split(/[\s,×x]+/)
        .map((s) => Number(s.trim()))
        .filter((v) => Number.isInteger(v) && v >= 2);
      const safe = parsed.length > 0 ? parsed : [2, 4];
      setCayleySpec({ type: 'direct_product', moduli: safe });
    }
  };

  const handleGenerateCyclic = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setInputError('');
    const n = Number(cyclicInput.trim());
    if (!Number.isInteger(n) || n < 1 || n > 24) {
      setInputError('Enter an integer n between 1 and 24 for ℤₙ Cayley table.');
      return;
    }
    setCayleySpec({ type: 'cyclic', n });
  };

  const applyArbitraryN = (rawVal: number, targetFamily: FamilyTab = family) => {
    setInputError('');
    if (!Number.isFinite(rawVal)) return;
    const val = Math.trunc(rawVal);

    if (targetFamily === 'cyclic') {
      setCyclicInput(String(val));
      if (val < 1 || val > 24) {
        setInputError('Enter an integer n between 1 and 24 for ℤₙ Cayley table.');
        return;
      }
      setCayleySpec({ type: 'cyclic', n: val });
    } else if (targetFamily === 'dihedral') {
      setDihedralN(val);
      if (val < 3 || val > 12) {
        setInputError('Enter n between 3 and 12 for Dₙ (orders 6 to 24).');
        return;
      }
      setCayleySpec({ type: 'dihedral', n: val, identitySymbol: dihedralIdSym });
    } else if (targetFamily === 'units_mod') {
      setUnitsN(val);
      if (val < 2 || val > 48) {
        setInputError('Enter modulus n between 2 and 48 for U(n).');
        return;
      }
      setCayleySpec({ type: 'units_mod', n: val });
    } else if (targetFamily === 'mult_mod' || targetFamily === 'sub_mod') {
      setCounterN(val);
      if (val < 2 || val > 20) {
        setInputError('Enter modulus n between 2 and 20.');
        return;
      }
      setCayleySpec({ type: targetFamily, n: val });
    }
  };

  const applyCustomStructure = (
    nextEls: string[],
    nextCells: string[][],
    nextOp = customOpSymbol
  ) => {
    setInputError('');
    if (nextEls.length < 1 || nextEls.length > 10) {
      setInputError('Custom Finite Set requires between 1 and 10 elements.');
      return;
    }
    if (new Set(nextEls).size !== nextEls.length) {
      setInputError('Element names in Custom Finite Set must be distinct.');
      return;
    }
    setCayleySpec({
      type: 'custom_set',
      elements: nextEls,
      rawCells: nextCells,
      opSymbol: nextOp.trim() || '*',
    });
  };

  const updateCustomCell = (rIdx: number, cIdx: number, value: string) => {
    const next = customCells.map((row, r) =>
      row.map((cell, c) => (r === rIdx && c === cIdx ? value : cell))
    );
    setCustomCells(next);
    applyCustomStructure(parsedCustomElements, next);
  };

  const loadCustomPreset = (presetId: string) => {
    const p = CUSTOM_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setCustomElementsText(p.elements.join(', '));
    setCustomOpSymbol(p.op);
    const cloned = p.cells.map((r) => [...r]);
    setCustomCells(cloned);
    setCayleySpec({
      type: 'custom_set',
      elements: [...p.elements],
      rawCells: cloned,
      opSymbol: p.op,
    });
    setInputError('');
  };

  const handleApplyCustomElements = (e: React.FormEvent) => {
    e.preventDefault();
    const els = parsedCustomElements;
    if (els.length < 1 || els.length > 10) {
      setInputError('Enter 1 to 10 distinct element symbols separated by commas or spaces.');
      return;
    }
    if (new Set(els).size !== els.length) {
      setInputError('Duplicate element symbol detected. All elements in S must be distinct.');
      return;
    }
    const resized = Array.from({ length: els.length }, (_, r) =>
      Array.from({ length: els.length }, (__, c) => {
        const existing = customCells[r]?.[c];
        return existing !== undefined && existing !== '' ? existing : els[(r + c) % els.length];
      })
    );
    setCustomCells(resized);
    applyCustomStructure(els, resized, customOpSymbol);
  };

  const handleApplyDirectProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError('');
    const parts = moduliText
      .split(/[\s,×x]+/)
      .map((s) => Number(s.trim()))
      .filter((v) => !Number.isNaN(v) && v > 0);
    if (parts.length === 0 || parts.some((m) => !Number.isInteger(m) || m < 2)) {
      setInputError('Enter integer moduli ≥ 2 separated by commas (e.g. 2, 4 or 2, 2, 3).');
      return;
    }
    const prod = parts.reduce((a, b) => a * b, 1);
    if (prod > 24) {
      setInputError(`Order ${prod} exceeds table limit 24. Choose moduli with product ≤ 24.`);
      return;
    }
    setCayleySpec({ type: 'direct_product', moduli: parts });
  };

  const resetAllControls = () => {
    setElementSearch('');
    setHighlightOrderFilter(null);
    setHighlightIdentity(true);
    setHighlightInverses(false);
    setInputError('');
    if (family === 'cyclic') {
      setCyclicInput('7');
      setCayleySpec({ type: 'cyclic', n: 7 });
    } else if (family === 'custom_set') {
      loadCustomPreset('z3');
    } else if (family === 'dihedral') {
      setDihedralN(4);
      setDihedralIdSym('1');
      setCayleySpec({ type: 'dihedral', n: 4, identitySymbol: '1' });
    } else {
      switchFamily(family);
    }
  };

  const cellExplanation = useMemo(() => {
    if (!table) return null;
    const r = Math.min(activeCell.r, Math.max(0, table.order - 1));
    const c = Math.min(activeCell.c, Math.max(0, table.order - 1));
    return explainCayleyProduct(cayleySpec, table, r, c);
  }, [cayleySpec, table, activeCell]);

  const assocEvaluation = useMemo(() => {
    if (!table || !table.axioms.closed) return null;
    const a = Math.min(assocTriple.a, table.order - 1);
    const b = Math.min(assocTriple.b, table.order - 1);
    const c = Math.min(assocTriple.c, table.order - 1);
    const ab = table.matrix[a][b];
    const ab_c = table.matrix[ab][c];
    const bc = table.matrix[b][c];
    const a_bc = table.matrix[a][bc];
    return { a, b, c, ab, ab_c, bc, a_bc, equal: ab_c === a_bc };
  }, [table, assocTriple]);

  const distinctOrders = useMemo(() => {
    if (!table) return [];
    const set = new Set<number>();
    table.orders.forEach((o) => {
      if (o !== null) set.add(o);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [table]);

  const nextQuizQuestion = () => {
    if (!table || table.order < 2) return;
    const r = Math.floor(Math.random() * table.order);
    const c = Math.floor(Math.random() * table.order);
    setQuizTarget({ r, c });
    setQuizGuess(null);
  };

  const submitQuizAnswer = (idx: number) => {
    if (!table || quizGuess !== null) return;
    setQuizGuess(idx);
    const right = table.matrix[quizTarget.r][quizTarget.c] === idx;
    setQuizScore((prev) => ({
      correct: prev.correct + (right ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const exportCsv = () => {
    if (!table) return;
    const header = [table.operationSymbol, ...table.labels].join(',');
    const rows = table.rawMatrix.map((row, rIdx) =>
      [table.labels[rIdx], ...row.map((val) => `"${val}"`)].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cayley-${cayleySpec.type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    if (!table) return;
    const payload = {
      title: table.title,
      notation: table.notationTitle,
      operationSymbol: table.operationSymbol,
      order: table.order,
      elements: table.labels,
      matrix: table.rawMatrix,
      axioms: table.axiomReport,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cayley-${cayleySpec.type}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const op = table?.operationSymbol ?? '*';
  const normalizedSearch = elementSearch.trim().toLowerCase();

  const renderStatusPill = (status: AxiomCheckStatus) => {
    if (status === 'passed') {
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" /> Passed
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-red-600 dark:text-red-400 shrink-0">
          <XCircle className="w-3.5 h-3.5" /> Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 shrink-0">
        <AlertCircle className="w-3.5 h-3.5" /> Not checked
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Structure Builder */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-serif-math">
              Dynamic Cayley Table Generator &amp; Axiom Auditor
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Generate tables programmatically from arbitrary parameters (including <span className="font-mono-math font-semibold">ℤₙ</span> for any <span className="font-mono-math">n ≥ 1</span>), or define and edit your own finite set to audit every group axiom.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 no-print">
            <button
              type="button"
              onClick={() => setActiveNav('demolab')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-500 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-50 dark:hover:bg-teal-950/30"
            >
              <Sparkles className="w-3.5 h-3.5" /> 5-Demo Lab
            </button>
            <button
              type="button"
              onClick={resetAllControls}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-teal-500"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={!table}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-teal-500 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              type="button"
              onClick={exportJson}
              disabled={!table}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-teal-500 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> JSON
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1F3A] dark:bg-teal-600 text-white text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>

        {/* Algebraic Family Selector */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['cyclic', 'Cyclic ⟨ℤₙ, ⊕⟩'],
              ['custom_set', 'Custom Finite Set (Editable)'],
              ['direct_product', 'Direct Product ℤₘ × ℤₙ'],
              ['dihedral', 'Dihedral Dₙ'],
              ['units_mod', 'Units ⟨U(n), ·ₙ⟩'],
              ['symmetric', 'Symmetric ⟨Sₙ, ∘⟩'],
              ['alternating', 'Alternating ⟨Aₙ, ∘⟩'],
              ['mult_mod', 'Non-Group ⟨ℤₙ, ·ₙ⟩'],
              ['sub_mod', 'Non-Assoc ⟨ℤₙ, −ₙ⟩'],
            ] as [FamilyTab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => switchFamily(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-math font-semibold border transition-colors whitespace-nowrap ${
                family === id
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Arbitrary Parameter Controls */}
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          {family === 'cyclic' && (
            <form onSubmit={handleGenerateCyclic} className="flex flex-wrap items-center gap-3 text-xs">
              <label className="flex items-center gap-2 font-semibold">
                <span>Assign n (1–24) for ℤₙ:</span>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={cyclicInput}
                  onChange={(e) => {
                    setCyclicInput(e.target.value);
                    const val = Number(e.target.value);
                    if (Number.isInteger(val) && val >= 1 && val <= 24) {
                      setInputError('');
                      setCayleySpec({ type: 'cyclic', n: val });
                    }
                  }}
                  className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math font-bold text-sm"
                />
              </label>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold whitespace-nowrap"
              >
                Generate Table
              </button>
              <input
                type="range"
                min={1}
                max={16}
                value={Math.min(16, Math.max(1, Number(cyclicInput) || 1))}
                onChange={(e) => applyArbitraryN(Number(e.target.value), 'cyclic')}
                className="w-36 accent-teal-600"
              />
              <div className="flex flex-wrap gap-1.5">
                {[1, 4, 5, 6, 7, 8, 12].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => applyArbitraryN(q, 'cyclic')}
                    className={`px-2.5 py-1 rounded border font-mono-math ${
                      Number(cyclicInput) === q
                        ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    ℤ_{q}
                  </button>
                ))}
              </div>
            </form>
          )}

          {family === 'custom_set' && (
            <div className="space-y-3 text-xs">
              <form onSubmit={handleApplyCustomElements} className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 font-semibold">
                  <span>Elements S (1–10, comma-separated):</span>
                  <input
                    type="text"
                    value={customElementsText}
                    onChange={(e) => setCustomElementsText(e.target.value)}
                    placeholder="e, a, b"
                    className="w-44 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math text-sm"
                  />
                </label>
                <label className="flex items-center gap-1.5 font-semibold">
                  <span>Op symbol:</span>
                  <input
                    type="text"
                    maxLength={3}
                    value={customOpSymbol}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomOpSymbol(val);
                      if (parsedCustomElements.length >= 1) {
                        applyCustomStructure(parsedCustomElements, customCells, val);
                      }
                    }}
                    className="w-14 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math text-center text-sm"
                  />
                </label>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold whitespace-nowrap"
                >
                  Apply Set &amp; Resize Table
                </button>
                <button
                  type="button"
                  onClick={() => setCustomEditMode((v) => !v)}
                  className={`px-3 py-1.5 rounded-lg border font-semibold ${
                    customEditMode
                      ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {customEditMode ? 'Editing Cells: ON' : 'Editing Cells: OFF (Click to Inspect)'}
                </button>
              </form>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Starter Templates:</span>
                {CUSTOM_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => loadCustomPreset(p.id)}
                    className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-teal-500 font-medium"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Type any value into table cells below (even a symbol outside S to trigger a Closure counterexample) — the Axiom Auditor verifies every axiom live.
              </p>
            </div>
          )}

          {family === 'dihedral' && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <label className="flex items-center gap-2 font-semibold">
                <span>Assign n (3–12) for Dₙ (order 2n):</span>
                <input
                  type="number"
                  min={3}
                  max={12}
                  value={dihedralN}
                  onChange={(e) => applyArbitraryN(Number(e.target.value), 'dihedral')}
                  className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math font-bold text-sm"
                />
              </label>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-500">Identity:</span>
                {(['1', 't'] as const).map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => {
                      setDihedralIdSym(sym);
                      setCayleySpec({ type: 'dihedral', n: dihedralN, identitySymbol: sym });
                    }}
                    className={`px-2 py-1 rounded border font-mono-math font-bold ${
                      dihedralIdSym === sym
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[3, 4, 5, 6, 8].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => applyArbitraryN(q, 'dihedral')}
                    className={`px-2.5 py-1 rounded border font-mono-math ${
                      dihedralN === q
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    D_{q} ({2 * q})
                  </button>
                ))}
              </div>
            </div>
          )}

          {family === 'direct_product' && (
            <form onSubmit={handleApplyDirectProduct} className="flex flex-wrap items-center gap-3 text-xs">
              <label className="flex items-center gap-2 font-semibold">
                <span>Moduli (product ≤ 24, e.g. 2, 4 or 2, 2, 3):</span>
                <input
                  type="text"
                  value={moduliText}
                  onChange={(e) => setModuliText(e.target.value)}
                  className="w-36 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math text-sm"
                />
              </label>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-semibold"
              >
                Generate Table
              </button>
              <div className="flex flex-wrap gap-1.5">
                {[
                  [2, 2],
                  [2, 3],
                  [2, 4],
                  [3, 3],
                  [2, 2, 2],
                  [2, 6],
                ].map((arr) => (
                  <button
                    key={arr.join('x')}
                    type="button"
                    onClick={() => {
                      setModuliText(arr.join(', '));
                      setInputError('');
                      setCayleySpec({ type: 'direct_product', moduli: arr });
                    }}
                    className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math"
                  >
                    {arr.map((m) => `ℤ_${m}`).join('×')}
                  </button>
                ))}
              </div>
            </form>
          )}

          {family === 'units_mod' && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <label className="flex items-center gap-2 font-semibold">
                <span>Assign arbitrary n (2–48) for ⟨U(n), ·ₙ⟩:</span>
                <input
                  type="number"
                  min={2}
                  max={48}
                  value={unitsN}
                  onChange={(e) => applyArbitraryN(Number(e.target.value), 'units_mod')}
                  className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math font-bold text-sm"
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[5, 8, 9, 10, 12, 15, 18].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => applyArbitraryN(q, 'units_mod')}
                    className={`px-2.5 py-1 rounded border font-mono-math ${
                      unitsN === q
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    U({q})
                  </button>
                ))}
              </div>
            </div>
          )}

          {(family === 'symmetric' || family === 'alternating') && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold">
                Degree n (identity ι, right-to-left cycle notation):
              </span>
              {(family === 'symmetric' ? [2, 3, 4] : [3, 4]).map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => {
                    setPermN(deg);
                    setInputError('');
                    setCayleySpec({ type: family, n: deg });
                  }}
                  className={`px-3 py-1.5 rounded-lg border font-mono-math font-semibold ${
                    permN === deg
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  {family === 'symmetric' ? `S_${deg} (${deg === 2 ? 2 : deg === 3 ? 6 : 24})` : `A_${deg} (${deg === 3 ? 3 : 12})`}
                </button>
              ))}
            </div>
          )}

          {(family === 'mult_mod' || family === 'sub_mod') && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <label className="flex items-center gap-2 font-semibold">
                <span>
                  Assign arbitrary n (2–20) for {family === 'mult_mod' ? '⟨ℤₙ, ·ₙ⟩' : '⟨ℤₙ, −ₙ⟩'}:
                </span>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={counterN}
                  onChange={(e) => applyArbitraryN(Number(e.target.value), family)}
                  className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math font-bold text-sm"
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[3, 4, 5, 6, 8].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => applyArbitraryN(q, family)}
                    className={`px-2.5 py-1 rounded border font-mono-math ${
                      counterN === q
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    n = {q}
                  </button>
                ))}
              </div>
              <span className="text-amber-700 dark:text-amber-300">
                Counterexample mode: inspect exactly which group axioms fail!
              </span>
            </div>
          )}

          {(inputError || tableResult.error) && (
            <div className="text-xs text-red-600 dark:text-red-400 font-medium">
              {inputError || tableResult.error}
            </div>
          )}
        </div>
      </section>

      {table && (
        <>
          {/* Dedicated Dynamic Cyclic Summary Panel (for Z_n) */}
          {table.cyclicMeta && (
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-base">
                  Cyclic Group Analysis: ⟨ℤ{toSubscript(table.cyclicMeta.n)}, ⊕⟩
                </h3>
                <span className="text-xs font-mono-math font-semibold text-teal-700 dark:text-teal-400">
                  Cyclic: Yes · Identity: 0 · φ({table.cyclicMeta.n}) = {table.cyclicMeta.phi}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-semibold text-slate-500">Elements &amp; Operation</div>
                  <div className="font-mono-math font-bold">
                    ℤ{toSubscript(table.cyclicMeta.n)} = {'{'}{table.labels.join(', ')}{'}'}
                  </div>
                  <div className="font-mono-math text-slate-600 dark:text-slate-300">
                    a ⊕ b = (a + b) mod {table.cyclicMeta.n}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-semibold text-slate-500">
                    Generators &amp; Euler&apos;s φ({table.cyclicMeta.n}) = {table.cyclicMeta.phi}
                  </div>
                  <div className="font-mono-math font-bold text-teal-700 dark:text-teal-400">
                    {'{'}{table.cyclicMeta.generators.join(', ')}{'}'}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    {table.cyclicMeta.n === 1
                      ? 'Trivial group ℤ₁: 0 generates all of ℤ₁.'
                      : `Elements with gcd(a, ${table.cyclicMeta.n}) = 1`}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-semibold text-slate-500">Order Rule</div>
                  <div className="font-mono-math font-bold">
                    ord(a) = {table.cyclicMeta.n} / gcd({table.cyclicMeta.n}, a)
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    {table.cyclicMeta.summaryText}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse font-mono-math tabular-nums">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-sans">
                      <th className="py-1.5 pr-3">Element a</th>
                      <th className="py-1.5 pr-3">Inverse −a</th>
                      <th className="py-1.5 pr-3">Order ord(a)</th>
                      <th className="py-1.5">Generator?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {table.labels.map((lbl, idx) => {
                      const isGen = table.cyclicMeta!.generators.includes(Number(lbl));
                      return (
                        <tr key={idx}>
                          <td className="py-1.5 pr-3 font-bold">{lbl}</td>
                          <td className="py-1.5 pr-3">
                            {table.inverses[idx] !== null ? table.labels[table.inverses[idx]!] : '—'}
                          </td>
                          <td className="py-1.5 pr-3">{table.orders[idx]}</td>
                          <td
                            className={
                              isGen ? 'text-teal-700 dark:text-teal-400 font-semibold' : 'text-slate-400'
                            }
                          >
                            {isGen ? 'Yes (Generator)' : 'No'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Axiom Auditor + Interactive Cell Studio */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Comprehensive Dynamic Axiom Auditor */}
            <section className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-sm">Dynamic Axiom Auditor</h3>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    table.axiomReport.finalVerdict === 'abelian_group' ||
                    table.axiomReport.finalVerdict === 'nonabelian_group'
                      ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300'
                      : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300'
                  }`}
                >
                  {table.axiomReport.finalVerdict === 'abelian_group'
                    ? 'Abelian Group'
                    : table.axiomReport.finalVerdict === 'nonabelian_group'
                    ? 'Nonabelian Group'
                    : 'Not a Group'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  {
                    lbl: '1. Closure (a * b ∈ G)',
                    status: table.axiomReport.closure.status,
                    reason: table.axiomReport.closure.reason,
                  },
                  {
                    lbl: '2. Associativity ((a*b)*c = a*(b*c))',
                    status: table.axiomReport.associativity.status,
                    reason: table.axiomReport.associativity.reason,
                  },
                  {
                    lbl: table.axiomReport.identity.identityLabel
                      ? `3. Identity (e = ${table.axiomReport.identity.identityLabel})`
                      : '3. Identity (∃e: ea = ae = a)',
                    status: table.axiomReport.identity.status,
                    reason: table.axiomReport.identity.reason,
                  },
                  {
                    lbl: '4. Inverses (∀a ∃b: ab = ba = e)',
                    status: table.axiomReport.inverses.status,
                    reason: table.axiomReport.inverses.reason,
                  },
                  {
                    lbl: 'Property: Commutativity (ab = ba)',
                    status: table.axiomReport.commutativity.status,
                    reason: table.axiomReport.commutativity.reason,
                  },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{row.lbl}</span>
                      {renderStatusPill(row.status)}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {row.reason}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className={`p-3 rounded-lg border text-xs leading-relaxed ${
                  table.isGroup
                    ? 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200'
                    : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                }`}
              >
                <span className="font-bold block mb-0.5">Final Verdict</span>
                {table.axiomReport.finalSummary}
              </div>
            </section>

            {/* Right: Interactive Demonstration Studio */}
            <section className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Step-by-Step Inspector · {table.title}
                </h3>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {(
                    [
                      ['operation', '1. Cell & Mirror'],
                      ['identity_inverse', '2. Identity & Inverses'],
                      ['associativity', '3. Associativity'],
                      ['quiz', '4. Table Quiz'],
                    ] as [DemoTab, string][]
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setDemoTab(id)}
                      className={`px-2.5 py-1.5 rounded-lg border font-semibold ${
                        demoTab === id
                          ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                          : 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {demoTab === 'operation' && cellExplanation && (
                <div className="space-y-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-semibold">Row a:</span>
                      <select
                        value={activeCell.r}
                        onChange={(e) =>
                          setActiveCell((prev) => ({ ...prev, r: Number(e.target.value) }))
                        }
                        className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math"
                      >
                        {table.labels.map((lbl, idx) => (
                          <option key={idx} value={idx}>
                            {lbl}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-semibold">Col b:</span>
                      <select
                        value={activeCell.c}
                        onChange={(e) =>
                          setActiveCell((prev) => ({ ...prev, c: Number(e.target.value) }))
                        }
                        className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math"
                      >
                        {table.labels.map((lbl, idx) => (
                          <option key={idx} value={idx}>
                            {lbl}
                          </option>
                        ))}
                      </select>
                    </label>
                    {table.diagnostics.nonCommutingPair && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveCell({
                            r: table.diagnostics.nonCommutingPair!.a,
                            c: table.diagnostics.nonCommutingPair!.b,
                          })
                        }
                        className="px-2.5 py-1 rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-semibold"
                      >
                        Jump to Non-Commuting Pair
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-math">
                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="text-[11px] font-sans font-semibold text-teal-700 dark:text-teal-400">
                        Selected Calculation (Row {table.labels[activeCell.r]} {op} Col {table.labels[activeCell.c]})
                      </div>
                      <div className="text-base font-bold">{cellExplanation.formula}</div>
                      <ul className="font-sans text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 list-disc pl-4">
                        {cellExplanation.steps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="text-[11px] font-sans font-semibold text-amber-700 dark:text-amber-400">
                        Mirror Cell b {op} a
                      </div>
                      <div className="text-base font-bold">
                        {table.labels[activeCell.c]} {op} {table.labels[activeCell.r]} ={' '}
                        {table.rawMatrix[activeCell.c]?.[activeCell.r] || '∅'}
                      </div>
                      <div className="font-sans text-[11px] text-slate-600 dark:text-slate-300">
                        {table.rawMatrix[activeCell.r]?.[activeCell.c] ===
                        table.rawMatrix[activeCell.c]?.[activeCell.r]
                          ? `Commutes: (${table.labels[activeCell.r]}) ${op} (${table.labels[activeCell.c]}) = (${table.labels[activeCell.c]}) ${op} (${table.labels[activeCell.r]}).`
                          : `Non-commuting! (${table.labels[activeCell.r]}) ${op} (${table.labels[activeCell.c]}) ≠ (${table.labels[activeCell.c]}) ${op} (${table.labels[activeCell.r]}).`}
                      </div>
                      <div className="font-sans text-[11px] text-slate-500">
                        {cellExplanation.note}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {demoTab === 'identity_inverse' && (
                <div className="space-y-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 font-semibold">
                      <span>Inspect element a:</span>
                      <select
                        value={inspectElIdx}
                        onChange={(e) => setInspectElIdx(Number(e.target.value))}
                        className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math"
                      >
                        {table.labels.map((lbl, idx) => (
                          <option key={idx} value={idx}>
                            {lbl}
                          </option>
                        ))}
                      </select>
                    </label>
                    {table.axioms.hasIdentity && (
                      <button
                        type="button"
                        onClick={() => setInspectElIdx(table.identityIndex)}
                        className="px-2.5 py-1 rounded border border-teal-500 text-teal-700 dark:text-teal-300 font-semibold"
                      >
                        Select Identity ({table.labels[table.identityIndex]})
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-math">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-[11px] font-sans text-slate-500">Identity e</div>
                      <div className="text-base font-bold mt-1 text-teal-700 dark:text-teal-400">
                        {table.axioms.hasIdentity ? table.labels[table.identityIndex] : 'None'}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-[11px] font-sans text-slate-500">
                        Inverse of {table.labels[inspectElIdx]}
                      </div>
                      <div className="text-base font-bold mt-1">
                        {table.inverses[inspectElIdx] !== null
                          ? table.labels[table.inverses[inspectElIdx]!]
                          : 'No inverse'}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-[11px] font-sans text-slate-500">
                        Order ord({table.labels[inspectElIdx]})
                      </div>
                      <div className="text-base font-bold mt-1">
                        {table.orders[inspectElIdx] ?? 'Undefined'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {demoTab === 'associativity' && (
                <div className="space-y-3 text-xs">
                  {!table.axioms.closed || !assocEvaluation ? (
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
                      Closure failed for one or more entries, so triple associativity cannot be evaluated across all pairs until all cells belong to S.
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2.5">
                        {(
                          [
                            ['a', assocTriple.a],
                            ['b', assocTriple.b],
                            ['c', assocTriple.c],
                          ] as const
                        ).map(([key, val]) => (
                          <label key={key} className="flex items-center gap-1.5">
                            <span className="font-mono-math font-bold">{key} =</span>
                            <select
                              value={Math.min(val, table.order - 1)}
                              onChange={(e) =>
                                setAssocTriple((prev) => ({
                                  ...prev,
                                  [key]: Number(e.target.value),
                                }))
                              }
                              className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math"
                            >
                              {table.labels.map((lbl, idx) => (
                                <option key={idx} value={idx}>
                                  {lbl}
                                </option>
                              ))}
                            </select>
                          </label>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setAssocTriple({
                              a: Math.floor(Math.random() * table.order),
                              b: Math.floor(Math.random() * table.order),
                              c: Math.floor(Math.random() * table.order),
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 font-semibold"
                        >
                          <RefreshCw className="w-3 h-3" /> Random Triple
                        </button>
                        {table.diagnostics.associativityCounterexample && (
                          <button
                            type="button"
                            onClick={() =>
                              setAssocTriple({
                                a: table.diagnostics.associativityCounterexample!.a,
                                b: table.diagnostics.associativityCounterexample!.b,
                                c: table.diagnostics.associativityCounterexample!.c,
                              })
                            }
                            className="px-2.5 py-1 rounded border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-semibold"
                          >
                            Jump to Counterexample
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-math">
                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                          <div className="text-[11px] font-sans font-semibold text-slate-500">
                            Left Grouping: (a {op} b) {op} c
                          </div>
                          <div>
                            1) {table.labels[assocEvaluation.a]} {op} {table.labels[assocEvaluation.b]} ={' '}
                            <span className="font-bold">{table.labels[assocEvaluation.ab]}</span>
                          </div>
                          <div>
                            2) ({table.labels[assocEvaluation.ab]}) {op}{' '}
                            {table.labels[assocEvaluation.c]} ={' '}
                            <span className="font-bold text-teal-700 dark:text-teal-400">
                              {table.labels[assocEvaluation.ab_c]}
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                          <div className="text-[11px] font-sans font-semibold text-slate-500">
                            Right Grouping: a {op} (b {op} c)
                          </div>
                          <div>
                            1) {table.labels[assocEvaluation.b]} {op} {table.labels[assocEvaluation.c]} ={' '}
                            <span className="font-bold">{table.labels[assocEvaluation.bc]}</span>
                          </div>
                          <div>
                            2) {table.labels[assocEvaluation.a]} {op} (
                            {table.labels[assocEvaluation.bc]}) ={' '}
                            <span className="font-bold text-teal-700 dark:text-teal-400">
                              {table.labels[assocEvaluation.a_bc]}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-2.5 rounded-lg text-xs font-semibold ${
                          assocEvaluation.equal
                            ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300'
                            : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300'
                        }`}
                      >
                        {assocEvaluation.equal
                          ? `Associative for this triple: both groupings equal ${table.labels[assocEvaluation.ab_c]}.`
                          : `Associativity FAILS here: ${table.labels[assocEvaluation.ab_c]} ≠ ${table.labels[assocEvaluation.a_bc]}.`}
                      </div>
                    </>
                  )}
                </div>
              )}

              {demoTab === 'quiz' && (
                <div className="space-y-3 text-xs">
                  {!table.axioms.closed ? (
                    <div className="text-slate-500">
                      Complete all in-set cells in your custom table to enable cell prediction quiz.
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-semibold flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-teal-600" />
                          <span>
                            Predict <span className="font-mono-math">?</span>:{' '}
                            <span className="font-mono-math text-sm font-bold text-[#0B1F3A] dark:text-white">
                              ({table.labels[quizTarget.r]}) {op} ({table.labels[quizTarget.c]}) = ?
                            </span>
                          </span>
                        </div>
                        <div className="font-mono-math font-semibold text-slate-500">
                          Score: {quizScore.correct}/{quizScore.total}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {table.labels.map((lbl, idx) => {
                          const expected = table.matrix[quizTarget.r][quizTarget.c];
                          const chosen = quizGuess === idx;
                          const isRight = idx === expected;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => submitQuizAnswer(idx)}
                              disabled={quizGuess !== null}
                              className={`px-3 py-1.5 rounded-lg border font-mono-math font-semibold ${
                                quizGuess === null
                                  ? 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
                                  : isRight
                                  ? 'bg-teal-600 text-white border-teal-600'
                                  : chosen
                                  ? 'bg-red-600 text-white border-red-600'
                                  : 'border-slate-200 dark:border-slate-800 opacity-50'
                              }`}
                            >
                              {lbl}
                            </button>
                          );
                        })}
                      </div>

                      {quizGuess !== null && (
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                          <span>
                            {quizGuess === table.matrix[quizTarget.r][quizTarget.c]
                              ? `Correct! (${table.labels[quizTarget.r]}) ${op} (${table.labels[quizTarget.c]}) = ${table.labels[table.matrix[quizTarget.r][quizTarget.c]]}.`
                              : `Expected ${table.labels[table.matrix[quizTarget.r][quizTarget.c]]}.`}
                          </span>
                          <button
                            type="button"
                            onClick={nextQuizQuestion}
                            className="px-3 py-1 rounded bg-[#0B1F3A] dark:bg-teal-600 text-white font-semibold"
                          >
                            Next Cell
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Interactive Cayley Table Matrix with Search & Order/Inverse/Identity Highlight Controls */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A2D] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHighlightIdentity((v) => !v)}
                  className={`px-2.5 py-1.5 rounded-lg border font-semibold ${
                    highlightIdentity
                      ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-teal-600 dark:border-teal-600'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Highlight Identity Row/Col
                </button>
                <button
                  type="button"
                  onClick={() => setHighlightInverses((v) => !v)}
                  className={`px-2.5 py-1.5 rounded-lg border font-semibold ${
                    highlightInverses
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Highlight Inverse Pairs
                </button>
                {distinctOrders.length > 0 && (
                  <label className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-500">Order filter:</span>
                    <select
                      value={highlightOrderFilter ?? ''}
                      onChange={(e) =>
                        setHighlightOrderFilter(e.target.value ? Number(e.target.value) : null)
                      }
                      className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-math"
                    >
                      <option value="">All orders</option>
                      {distinctOrders.map((ord) => (
                        <option key={ord} value={ord}>
                          ord = {ord}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <label className="flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 bg-white dark:bg-slate-900">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={elementSearch}
                  onChange={(e) => setElementSearch(e.target.value)}
                  placeholder="Search element..."
                  className="bg-transparent outline-none w-32 font-mono-math text-xs"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="text-xs font-mono-math border-collapse mx-auto tabular-nums">
                <thead>
                  <tr>
                    <th className="p-2 border border-slate-200 dark:border-slate-700 bg-[#0B1F3A] text-white whitespace-nowrap">
                      {op}
                    </th>
                    {table.labels.map((lbl, cIdx) => {
                      const isColSel = demoTab === 'operation' && activeCell.c === cIdx;
                      const isIdCol =
                        highlightIdentity && table.axioms.hasIdentity && table.identityIndex === cIdx;
                      const isOrdMatch =
                        highlightOrderFilter !== null && table.orders[cIdx] === highlightOrderFilter;
                      const isSearchMatch =
                        normalizedSearch !== '' && lbl.toLowerCase().includes(normalizedSearch);
                      return (
                        <th
                          key={cIdx}
                          className={`p-2 border border-slate-200 dark:border-slate-700 font-bold whitespace-nowrap ${
                            isColSel
                              ? 'bg-teal-600 text-white'
                              : isSearchMatch
                              ? 'bg-amber-300 text-slate-950'
                              : isOrdMatch
                              ? 'bg-sky-600 text-white'
                              : isIdCol
                              ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200'
                              : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          {lbl}
                          {table.orders[cIdx] !== null && (
                            <span className="block text-[9px] font-normal opacity-75">
                              o:{table.orders[cIdx]}
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {table.matrix.map((row, rIdx) => {
                    const isRowSel = demoTab === 'operation' && activeCell.r === rIdx;
                    const isIdRow =
                      highlightIdentity && table.axioms.hasIdentity && table.identityIndex === rIdx;
                    const isOrdRowMatch =
                      highlightOrderFilter !== null && table.orders[rIdx] === highlightOrderFilter;
                    const isSearchRowMatch =
                      normalizedSearch !== '' &&
                      table.labels[rIdx].toLowerCase().includes(normalizedSearch);
                    return (
                      <tr key={rIdx}>
                        <th
                          className={`p-2 border border-slate-200 dark:border-slate-700 font-bold text-left whitespace-nowrap ${
                            isRowSel
                              ? 'bg-teal-600 text-white'
                              : isSearchRowMatch
                              ? 'bg-amber-300 text-slate-950'
                              : isOrdRowMatch
                              ? 'bg-sky-600 text-white'
                              : isIdRow
                              ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200'
                              : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          {table.labels[rIdx]}
                        </th>
                        {row.map((val, cIdx) => {
                          const rawTxt = table.rawMatrix[rIdx]?.[cIdx] ?? '';
                          const isOutOfSet = val < 0 || val >= table.order;
                          const isQuizCell =
                            demoTab === 'quiz' &&
                            quizTarget.r === rIdx &&
                            quizTarget.c === cIdx &&
                            quizGuess === null;
                          const isSel =
                            demoTab === 'operation' && activeCell.r === rIdx && activeCell.c === cIdx;
                          const isMirror =
                            demoTab === 'operation' &&
                            activeCell.r === cIdx &&
                            activeCell.c === rIdx &&
                            rIdx !== cIdx;
                          const isInversePairCell =
                            highlightInverses &&
                            table.axioms.hasIdentity &&
                            table.inverses[rIdx] === cIdx;
                          const isIdCross =
                            highlightIdentity &&
                            table.axioms.hasIdentity &&
                            (rIdx === table.identityIndex || cIdx === table.identityIndex);
                          const isValOrderMatch =
                            highlightOrderFilter !== null &&
                            !isOutOfSet &&
                            table.orders[val] === highlightOrderFilter;
                          const isValSearchMatch =
                            normalizedSearch !== '' &&
                            rawTxt.toLowerCase().includes(normalizedSearch);

                          if (family === 'custom_set' && customEditMode) {
                            return (
                              <td
                                key={cIdx}
                                className={`p-1 border border-slate-200 dark:border-slate-700 text-center ${
                                  isOutOfSet
                                    ? 'bg-red-100 dark:bg-red-950/50'
                                    : isSel
                                    ? 'bg-teal-100 dark:bg-teal-900/40'
                                    : isIdCross
                                    ? 'bg-teal-50/70 dark:bg-teal-950/30'
                                    : ''
                                }`}
                              >
                                <input
                                  type="text"
                                  value={customCells[rIdx]?.[cIdx] ?? ''}
                                  onFocus={() => setActiveCell({ r: rIdx, c: cIdx })}
                                  onChange={(e) => updateCustomCell(rIdx, cIdx, e.target.value)}
                                  className={`w-12 text-center py-1 rounded border font-mono-math text-xs bg-white dark:bg-slate-900 ${
                                    isOutOfSet
                                      ? 'border-red-500 text-red-700 dark:text-red-300 font-bold'
                                      : 'border-slate-200 dark:border-slate-700'
                                  }`}
                                />
                              </td>
                            );
                          }

                          return (
                            <td
                              key={cIdx}
                              onClick={() => {
                                setActiveCell({ r: rIdx, c: cIdx });
                                if (demoTab === 'identity_inverse') setInspectElIdx(rIdx);
                              }}
                              className={`p-2 border border-slate-200 dark:border-slate-700 text-center cursor-pointer whitespace-nowrap transition-colors ${
                                isOutOfSet
                                  ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-bold'
                                  : isQuizCell
                                  ? 'bg-amber-400 text-slate-950 font-bold'
                                  : isSel
                                  ? 'bg-teal-600 text-white font-bold ring-2 ring-inset ring-white'
                                  : isInversePairCell
                                  ? 'bg-emerald-600 text-white font-bold'
                                  : isSearchRowMatch || isValSearchMatch
                                  ? 'bg-amber-200 dark:bg-amber-800/60 text-slate-950 dark:text-white font-bold'
                                  : isValOrderMatch
                                  ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-900 dark:text-sky-200 font-bold'
                                  : isMirror
                                  ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 font-bold'
                                  : isIdCross
                                  ? 'bg-teal-50/70 dark:bg-teal-950/30 font-semibold'
                                  : demoTab === 'operation' &&
                                    (activeCell.r === rIdx || activeCell.c === cIdx)
                                  ? 'bg-slate-100/80 dark:bg-slate-800/60'
                                  : ''
                              }`}
                            >
                              {isQuizCell ? '?' : rawTxt}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
