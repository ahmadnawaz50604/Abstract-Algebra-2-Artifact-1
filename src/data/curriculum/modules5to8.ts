import type { CurriculumModule } from '../../types/algebra.ts';

export const MODULES_5_TO_8: CurriculumModule[] = [
  {
    id: 'm5',
    number: 5,
    title: 'Dihedral Groups ($D_n$)',
    subtitle: 'Rotations ρᵏ, reflections μρᵏ, identity 1, and regular polygon symmetries',
    description:
      'Study geometric symmetries of regular $n$-gons ($n=3..8$) in standard notation: identity $1$, rotation $\\rho$, reflection $\\mu$.',
    subsections: [
      {
        id: 'm5-s1',
        moduleId: 'm5',
        order: 1,
        title: 'Geometric Symmetries & Standard Notation ($1, \\rho, \\mu$)',
        level: 'Beginner',
        estimatedMinutes: 16,
        learningObjectives: [
          'Represent symmetries of a regular $n$-gon using standard generators $\\rho$ and $\\mu$ and identity $1$.',
          'Explain why $D_n$ has exactly $2n$ elements ($n$ rotations and $n$ reflections).',
        ],
        prerequisites: ['Module 4: Permutations of vertices'],
        definitions: [
          {
            term: 'Dihedral Group $D_n$',
            formal: 'The group of all rigid symmetries (rotations and reflections) of a regular $n$-gon ($n \\ge 3$), containing $2n$ elements: $D_n = \\{1, \\rho, \\rho^2, \\dots, \\rho^{n-1}, \\mu, \\mu\\rho, \\mu\\rho^2, \\dots, \\mu\\rho^{n-1}\\}$.',
            latex: 'D_n = \\{1, \\rho, \\rho^2, \\dots, \\rho^{n-1}, \\mu, \\mu\\rho, \\mu\\rho^2, \\dots, \\mu\\rho^{n-1}\\}',
          },
        ],
        notation: [
          { symbol: '$1$', meaning: 'Identity transformation (0° rotation)' },
          { symbol: '$\\rho$', meaning: 'Counterclockwise rotation by $2\\pi/n$ ($360^\\circ/n$)' },
          { symbol: '$\\mu$', meaning: 'Reflection across the primary axis through vertex 0' },
        ],
        theorems: [
          {
            title: 'Order and Nonabelian Nature of $D_n$',
            statement: 'For every $n \\ge 3$, $|D_n| = 2n$. The dihedral group $D_n$ is nonabelian for all $n \\ge 3$, and $D_3 \\cong S_3$.',
          },
        ],
        explanation: [
          'Imagine cutting a regular $n$-gon out of cardboard with vertices labeled $0, 1, \\dots, n-1$ counterclockwise. Any way you can pick it up, rotate or flip it over, and place it back into the same outline corresponds to an element of $D_n$.',
          'Following standard dihedral notation, we denote the identity rotation by $1$, the elementary counterclockwise rotation by $\\rho$, and a fixed mirror reflection by $\\mu$. Never replace $\\rho, \\mu, 1$ with $r, s, e$ in $D_n$ work on this platform.',
          'Why $2n$ symmetries? Vertex $0$ can move to any of the $n$ positions, and once vertex $0$ is placed, vertex $1$ must be one of its $2$ neighbors (preserving orientation gives a rotation $\\rho^k$; flipping orientation gives a reflection $\\mu\\rho^k$).',
        ],
        stepByStepExamples: [
          {
            title: 'Listing All Elements of $D_3$ (Equilateral Triangle) and $D_4$ (Square)',
            problem: 'Write $D_3$ and $D_4$ in standard form.',
            steps: [
              'For $n=3$: rotations are $1, \\rho, \\rho^2$ (angles $0^\\circ, 120^\\circ, 240^\\circ$) and reflections are $\\mu, \\mu\\rho, \\mu\\rho^2$. Total $|D_3| = 6$.',
              'For $n=4$: rotations are $1, \\rho, \\rho^2, \\rho^3$ (angles $0^\\circ, 90^\\circ, 180^\\circ, 270^\\circ$) and reflections are $\\mu, \\mu\\rho, \\mu\\rho^2, \\mu\\rho^3$. Total $|D_4| = 8$.',
            ],
            conclusion: 'Notice $D_3$ permutes all $3$ vertices in all $3! = 6$ ways, so $D_3 \\cong S_3$, whereas $|D_4| = 8 < 24 = |S_4|$.',
          },
        ],
        visualConfig: {
          kind: 'dihedral_polygon',
          title: 'Interactive Polygon Symmetry Visualizer',
          caption: 'Apply rotations ρᵏ and reflections μρᵏ to labeled polygon vertices.',
          defaultN: 4,
        },
        commonMistakes: [
          {
            mistake: 'Writing $D_4$ reflections as $\\rho\\mu, \\rho^2\\mu, \\rho^3\\mu$ without reducing to standard form.',
            correction: 'Standard form puts $\\mu$ on the LEFT: $\\mu, \\mu\\rho, \\mu\\rho^2, \\dots, \\mu\\rho^{n-1}$.',
          },
        ],
        practiceExercises: [
          {
            id: 'm5-s1-ex1',
            prompt: 'How many symmetries does a regular hexagon have, and how many are rotations vs reflections?',
            hint: 'Hexagon corresponds to $n = 6$ in $D_n$.',
            answer: '12 symmetries in $D_6$: 6 rotations ($1, \\rho, \\dots, \\rho^5$) and 6 reflections ($\\mu, \\mu\\rho, \\dots, \\mu\\rho^5$).',
            solutionSteps: [
              '$|D_6| = 2 \\times 6 = 12$.',
              'Half are rotations $\\rho^k$ ($k=0..5$) and half are reflections $\\mu\\rho^k$ ($k=0..5$).',
            ],
          },
        ],
        revisionSummary: [
          'Standard notation for $D_n$ uses $1$ (identity), $\\rho$ (rotation), and $\\mu$ (reflection).',
          'Standard elements: $\\rho^k$ and $\\mu\\rho^k$ for $0 \\le k \\le n-1$; $|D_n| = 2n$.',
        ],
        keywords: ['dihedral group', 'standard notation', '1', 'rho', 'mu', 'symmetry'],
      },
      {
        id: 'm5-s2',
        moduleId: 'm5',
        order: 2,
        title: 'Standard Form, Defining Relations & Product Reduction',
        level: 'Intermediate',
        estimatedMinutes: 20,
        learningObjectives: [
          'Apply the defining relations $\\rho^n = 1$, $\\mu^2 = 1$, and $\\rho^k\\mu = \\mu\\rho^{n-k}$.',
          'Reduce any word in $\\rho$ and $\\mu$ to standard form $\\rho^k$ or $\\mu\\rho^k$.',
        ],
        prerequisites: ['Module 5.1: Standard Dihedral Notation'],
        definitions: [
          {
            term: 'Defining Relations of $D_n$',
            formal: 'The complete algebraic laws governing $D_n$: $\\rho^n = 1$, $\\mu^2 = 1$, and $\\rho\\mu = \\mu\\rho^{n-1}$ (more generally $\\rho^k\\mu = \\mu\\rho^{n-k}$).',
            latex: '\\rho^n = 1, \\quad \\mu^2 = 1, \\quad \\rho\\mu = \\mu\\rho^{n-1}, \\quad \\rho^k\\mu = \\mu\\rho^{n-k}',
          },
        ],
        notation: [
          { symbol: '$\\rho^k\\mu = \\mu\\rho^{n-k}$', meaning: 'Commutation rule moving $\\mu$ to the left past $\\rho^k$' },
        ],
        theorems: [
          {
            title: 'Uniqueness of Standard Form in $D_n$',
            statement: 'Using $\\rho^n = 1$, $\\mu^2 = 1$, and $\\rho^k\\mu = \\mu\\rho^{n-k}$, every product of elements in $D_n$ reduces uniquely to one of the $2n$ standard forms $\\rho^k$ or $\\mu\\rho^k$ ($0 \\le k \\le n-1$).',
          },
        ],
        explanation: [
          'Why does $\\rho\\mu = \\mu\\rho^{n-1}$ hold geometrically? Reflecting a polygon reverses clockwise and counterclockwise orientation! Rotating counterclockwise BEFORE reflecting is the same as reflecting FIRST and then rotating clockwise (which is $\\rho^{-1} = \\rho^{n-1}$).',
          'To simplify any product $(a)(b)$ in $D_n$, move any $\\mu$ from the right factor past $\\rho^k$ on its left using $\\rho^k\\mu = \\mu\\rho^{n-k}$, cancel pairs $\\mu^2 = 1$, and reduce the final $\\rho$ exponent modulo $n$.',
        ],
        stepByStepExamples: [
          {
            title: 'Simplifying $(\\mu\\rho^2)(\\mu\\rho)$ in $D_5$',
            problem: 'Compute the product $(\\mu\\rho^2)(\\mu\\rho)$ in $D_5$ and write it in standard form.',
            steps: [
              'Write without parentheses: $\\mu\\rho^2\\mu\\rho$.',
              'Notice $\\rho^2\\mu$ in the middle. Using $\\rho^k\\mu = \\mu\\rho^{n-k}$ with $n=5, k=2$: $\\rho^2\\mu = \\mu\\rho^{5-2} = \\mu\\rho^3$.',
              'Substitute back: $\\mu(\\mu\\rho^3)\\rho = (\\mu^2)(\\rho^3\\rho)$.',
              'Apply $\\mu^2 = 1$: $1 \\cdot \\rho^4 = \\rho^4$.',
            ],
            conclusion: 'In $D_5$, $(\\mu\\rho^2)(\\mu\\rho) = \\rho^4$.',
          },
        ],
        visualConfig: {
          kind: 'dihedral_polygon',
          title: 'Product Composition in D₅',
          caption: 'Compose (μρ²)(μρ) step-by-step on a regular pentagon.',
          defaultN: 5,
        },
        commonMistakes: [
          {
            mistake: 'Assuming $\\rho$ and $\\mu$ commute ($\\rho\\mu = \\mu\\rho$).',
            correction: 'Only when $n = 2$ (degenerate line segment) would $\\rho\\mu = \\mu\\rho$. For all $n \\ge 3$, $\\rho\\mu = \\mu\\rho^{n-1} \\ne \\mu\\rho$.',
          },
        ],
        practiceExercises: [
          {
            id: 'm5-s2-ex1',
            prompt: 'Simplify $(\\rho^3)(\\mu\\rho^2)$ in $D_6$ to standard form.',
            hint: 'Commute $\\rho^3\\mu$ using $n = 6$.',
            answer: '$\\mu\\rho^5$.',
            solutionSteps: [
              'In $D_6$, $\\rho^3\\mu = \\mu\\rho^{6-3} = \\mu\\rho^3$.',
              'Multiply by $\\rho^2$: $(\\mu\\rho^3)\\rho^2 = \\mu\\rho^5$.',
            ],
          },
        ],
        revisionSummary: [
          'Always move $\\mu$ to the left using $\\rho^k\\mu = \\mu\\rho^{n-k}$.',
          'Reduce $\\mu^2 = 1$ and exponents of $\\rho$ modulo $n$.',
        ],
        keywords: ['relations', 'standard form', 'reduction', 'nonabelian', 'D5'],
      },
      {
        id: 'm5-s3',
        moduleId: 'm5',
        order: 3,
        title: 'Element Orders, Inverses & Subfamilies $D_3$ through $D_8$',
        level: 'University',
        estimatedMinutes: 20,
        learningObjectives: [
          'Compute the exact order and inverse of every rotation $\\rho^k$ and reflection $\\mu\\rho^k$ in $D_n$.',
          'Analyze the full order tables for $D_6$ (order 12) and $D_8$ (order 16).',
        ],
        prerequisites: ['Module 5.2: Dihedral Defining Relations'],
        definitions: [
          {
            term: 'Orders & Inverses in $D_n$',
            formal: 'Every reflection $\\mu\\rho^k$ has order $2$ and is its own inverse: $(\\mu\\rho^k)^{-1} = \\mu\\rho^k$. Every rotation $\\rho^k$ has order $n / \\gcd(n, k)$ and inverse $\\rho^{n-k}$.',
            latex: '\\operatorname{ord}(\\mu\\rho^k) = 2, \\quad \\operatorname{ord}(\\rho^k) = \\frac{n}{\\gcd(n, k)}',
          },
        ],
        notation: [
          { symbol: '$Z(D_n)$', meaning: 'Center of $D_n$: $\\{1\\}$ if $n$ odd; $\\{1, \\rho^{n/2}\\}$ if $n$ even' },
        ],
        theorems: [
          {
            title: 'Every Reflection in $D_n$ is an Involution',
            statement: 'For any $0 \\le k \\le n-1$, $(\\mu\\rho^k)(\\mu\\rho^k) = \\mu(\\rho^k\\mu)\\rho^k = \\mu(\\mu\\rho^{n-k})\\rho^k = \\mu^2\\rho^n = 1$. Thus every reflection has order $2$.',
          },
        ],
        explanation: [
          'Flipping a polygon twice across ANY mirror axis returns it to its original orientation! Algebraically, $(\\mu\\rho^k)^2 = 1$ for every $k$, which proves every reflection has order 2 and is self-inverse.',
          'Meanwhile, the rotations $\\{1, \\rho, \\dots, \\rho^{n-1}\\}$ form a cyclic subgroup isomorphic to $\\mathbb{Z}_n$, so $\\operatorname{ord}(\\rho^k) = n / \\gcd(n, k)$. Notice how in $D_6$ (order 12), there are $6$ reflections of order 2 PLUS the $180^\\circ$ rotation $\\rho^3$ of order 2—making 7 elements of order 2 in total!',
        ],
        stepByStepExamples: [
          {
            title: 'Guided Problem: Element Orders in $D_6$ and $D_8$',
            problem: 'Compute the orders of all elements in $D_6$ and $D_8$.',
            steps: [
              'In $D_6$ ($|D_6|=12$): $\\operatorname{ord}(1)=1$; $\\operatorname{ord}(\\rho)=\\operatorname{ord}(\\rho^5)=6$; $\\operatorname{ord}(\\rho^2)=\\operatorname{ord}(\\rho^4)=3$; $\\operatorname{ord}(\\rho^3)=2$; all 6 reflections $\\mu\\rho^k$ have order $2$. Summary for $D_6$: order 1 (1), order 2 (7), order 3 (2), order 6 (2).',
              'In $D_8$ ($|D_8|=16$): $\\operatorname{ord}(1)=1$; $\\operatorname{ord}(\\rho^k)=8$ for $k \\in \\{1,3,5,7\\}$ (4 elements); $\\operatorname{ord}(\\rho^2)=\\operatorname{ord}(\\rho^6)=4$ (2 elements); $\\operatorname{ord}(\\rho^4)=2$ (1 element); all 8 reflections $\\mu\\rho^k$ have order $2$. Summary for $D_8$: order 1 (1), order 2 (9), order 4 (2), order 8 (4).',
            ],
            conclusion: 'In $D_n$, total elements of order 2 equals $n$ (if $n$ is odd) or $n+1$ (if $n$ is even, adding $\\rho^{n/2}$).',
          },
        ],
        visualConfig: {
          kind: 'dihedral_polygon',
          title: 'Order Inspector for D₆ & D₈',
          caption: 'Inspect rotation subgroups and self-inverse reflection axes in D₆ and D₈.',
          defaultN: 6,
        },
        commonMistakes: [
          {
            mistake: 'Forgetting that $\\rho^{n/2}$ (when $n$ is even) also has order $2$.',
            correction: 'In $D_6$, $\\rho^3$ has order $2$ alongside the 6 reflections, giving $7$ elements of order $2$ (not 6).',
          },
        ],
        practiceExercises: [
          {
            id: 'm5-s3-ex1',
            prompt: 'Find the inverse and order of $\\rho^5$ and $\\mu\\rho^5$ in $D_8$.',
            hint: 'Use $n / \\gcd(n, k)$ for rotations and $(\\mu\\rho^k)^2 = 1$ for reflections.',
            answer: '$(\\rho^5)^{-1} = \\rho^3$, $\\operatorname{ord}(\\rho^5) = 8$; $(\\mu\\rho^5)^{-1} = \\mu\\rho^5$, $\\operatorname{ord}(\\mu\\rho^5) = 2$.',
            solutionSteps: [
              'For $\\rho^5$ in $D_8$: $\\gcd(8, 5) = 1$, so order is $8/1 = 8$ and inverse is $\\rho^{8-5} = \\rho^3$.',
              'For $\\mu\\rho^5$: every reflection has order $2$ and equals its own inverse.',
            ],
          },
        ],
        revisionSummary: [
          '$(\\mu\\rho^k)^{-1} = \\mu\\rho^k$ and $\\operatorname{ord}(\\mu\\rho^k) = 2$.',
          '$(\\rho^k)^{-1} = \\rho^{n-k}$ and $\\operatorname{ord}(\\rho^k) = n/\\gcd(n, k)$.',
        ],
        keywords: ['D6', 'D8', 'orders', 'inverses', 'center', 'involution'],
      },
    ],
  },
  {
    id: 'm6',
    number: 6,
    title: 'Element Orders, Inverses, and Cyclic Generators',
    subtitle: 'Euler’s totient φ(n), generators of ℤₙ, and computing inverses across groups',
    description:
      'Connect greatest common divisors and Euler’s totient function $\\varphi(n)$ to generators of $\\mathbb{Z}_n$ and element orders.',
    subsections: [
      {
        id: 'm6-s1',
        moduleId: 'm6',
        order: 1,
        title: 'Order of Elements & Cyclic Subgroups $\\langle a \\rangle$',
        level: 'Foundational',
        estimatedMinutes: 15,
        learningObjectives: [
          'Define the order of an element $a$ in multiplicative and additive notation.',
          'Compute $\\operatorname{ord}(a)$ in $\\mathbb{Z}_n$ via $n / \\gcd(n, a)$.',
        ],
        prerequisites: ['Module 2.1: Cyclic Groups'],
        definitions: [
          {
            term: 'Order of an Element ($\\operatorname{ord}(a)$)',
            formal: 'The smallest positive integer $m$ such that $a^m = e$ (or $ma = 0$ in additive notation), equal to $|\\langle a \\rangle|$.',
            latex: '\\operatorname{ord}(a) = |\\langle a \\rangle| = \\min\\{m \\ge 1 : a^m = e\\}',
          },
        ],
        notation: [
          { symbol: '$|a|$ or $\\operatorname{ord}(a)$', meaning: 'Order of element $a$' },
        ],
        theorems: [
          {
            title: 'Fraleigh Corollary 6.16 & Divisor Criterion',
            statement: 'In $\\mathbb{Z}_n$, the order of $a \\in \\{0, 1, \\dots, n-1\\}$ is $n / \\gcd(n, a)$ (with $\\operatorname{ord}(0)=1$). More generally, $a^k = e$ if and only if $\\operatorname{ord}(a) \\mid k$.',
            latex: '\\operatorname{ord}_{\\mathbb{Z}_n}(a) = \\frac{n}{\\gcd(n, a)}',
          },
        ],
        explanation: [
          'Every element $a$ of a finite group $G$ generates a finite cycle $\\{e, a, a^2, \\dots, a^{m-1}\\}$ whose size $m$ is the order of $a$. Because $G$ is finite, powers of $a$ must eventually repeat, guaranteeing finite order.',
          'Lagrange’s basic consequence in finite groups tells us $\\operatorname{ord}(a)$ always divides $|G|$.',
        ],
        stepByStepExamples: [
          {
            title: 'Computing Orders in $\\mathbb{Z}_{20}$',
            problem: 'Find the orders of $4, 6, 7,$ and $10$ in $\\mathbb{Z}_{20}$.',
            steps: [
              '$\\operatorname{ord}(4) = 20 / \\gcd(20, 4) = 20 / 4 = 5$.',
              '$\\operatorname{ord}(6) = 20 / \\gcd(20, 6) = 20 / 2 = 10$.',
              '$\\operatorname{ord}(7) = 20 / \\gcd(20, 7) = 20 / 1 = 20$ ($7$ generates $\\mathbb{Z}_{20}$).',
              '$\\operatorname{ord}(10) = 20 / \\gcd(20, 10) = 20 / 10 = 2$.',
            ],
            conclusion: 'Element orders divide $20$: $5, 10, 20, 2$.',
          },
        ],
        visualConfig: {
          kind: 'cyclic_clock',
          title: 'Element Order Orbit Visualizer',
          caption: 'Watch step sizes around the modular clock generate subgroups of size n/gcd(n,a).',
          defaultN: 20,
        },
        commonMistakes: [
          {
            mistake: 'Thinking $\\operatorname{ord}(0) = 0$ in $\\mathbb{Z}_n$.',
            correction: 'The identity element ALWAYS has order $1$ ($1 \\cdot 0 = 0$), never $0$.',
          },
        ],
        practiceExercises: [
          {
            id: 'm6-s1-ex1',
            prompt: 'Which elements of $\\mathbb{Z}_{12}$ have order $4$?',
            hint: 'We need $12 / \\gcd(12, a) = 4$, so $\\gcd(12, a) = 3$.',
            answer: '$3$ and $9$.',
            solutionSteps: [
              'Multiples of $3$ in $\\mathbb{Z}_{12}$ are $0, 3, 6, 9$.',
              '$\\gcd(12, 3) = 3$ and $\\gcd(12, 9) = 3$, giving order $12/3 = 4$. (There are $\\varphi(4) = 2$ such elements.)',
            ],
          },
        ],
        revisionSummary: [
          'Identity has order $1$; $a^k = e \\iff \\operatorname{ord}(a) \\mid k$.',
          'In $\\mathbb{Z}_n$, $\\operatorname{ord}(a) = n / \\gcd(n, a)$.',
        ],
        keywords: ['element order', 'cyclic subgroup', 'gcd', 'Z20'],
      },
      {
        id: 'm6-s2',
        moduleId: 'm6',
        order: 2,
        title: 'Euler’s Totient $\\varphi(n)$ & Generators of $\\mathbb{Z}_n$',
        level: 'Intermediate',
        estimatedMinutes: 18,
        learningObjectives: [
          'Identify all generators of $\\mathbb{Z}_n$ using $\\gcd(a, n) = 1$.',
          'Compute Euler’s totient $\\varphi(n)$ for any positive integer using prime factorization.',
        ],
        prerequisites: ['Module 6.1: Order of Elements'],
        definitions: [
          {
            term: 'Euler’s Totient Function ($\\varphi(n)$)',
            formal: 'The number of integers $k$ with $1 \\le k \\le n$ that are relatively prime to $n$ ($\\gcd(k, n) = 1$). It counts the generators of $\\mathbb{Z}_n$.',
            latex: '\\varphi(n) = n \\prod_{p \\mid n} \\left(1 - \\frac{1}{p}\\right)',
          },
        ],
        notation: [
          { symbol: '$\\varphi(n)$', meaning: 'Number of generators of $\\mathbb{Z}_n$ (coprime integers $\\le n$)' },
        ],
        theorems: [
          {
            title: 'Fraleigh Theorem 6.14 (Generators of $\\mathbb{Z}_n$)',
            statement: 'An element $k \\in \\mathbb{Z}_n$ generates $\\mathbb{Z}_n$ if and only if $\\gcd(k, n) = 1$. Hence $\\mathbb{Z}_n$ has exactly $\\varphi(n)$ generators.',
          },
        ],
        explanation: [
          'Since $\\operatorname{ord}(k) = n / \\gcd(n, k)$, element $k$ has full order $n$—and thus generates all of $\\mathbb{Z}_n$—precisely when $\\gcd(n, k) = 1$.',
          'Using prime factorization $n = p_1^{e_1}\\cdots p_r^{e_r}$, multiplicativity gives $\\varphi(p^e) = p^e - p^{e-1} = p^{e-1}(p-1)$. For $n = 12 = 2^2 \\cdot 3$, $\\varphi(12) = \\varphi(4)\\varphi(3) = 2 \\cdot 2 = 4$, matching the 4 generators $\\{1, 5, 7, 11\\}$.',
        ],
        stepByStepExamples: [
          {
            title: 'Guided Problem: $\\varphi(n)$ and Generators of $\\mathbb{Z}_n$ for $n = 4, 6, 8, 10, 12, 20$',
            problem: 'Tabulate $\\varphi(n)$ and list the generators of $\\mathbb{Z}_{12}$ and $\\mathbb{Z}_{20}$.',
            steps: [
              '$n=4$: $\\varphi(4)=2$, generators $\\{1, 3\\}$. $n=6$: $\\varphi(6)=2$, generators $\\{1, 5\\}$.',
              '$n=8$: $\\varphi(8)=4$, generators $\\{1, 3, 5, 7\\}$. $n=10$: $\\varphi(10)=4$, generators $\\{1, 3, 7, 9\\}$.',
              '$n=12 = 2^2 \\cdot 3$: $\\varphi(12) = 12(1-1/2)(1-1/3) = 4$, generators $\\{1, 5, 7, 11\\}$.',
              '$n=20 = 2^2 \\cdot 5$: $\\varphi(20) = 20(1-1/2)(1-1/5) = 8$, generators $\\{1, 3, 7, 9, 11, 13, 17, 19\\}$.',
            ],
            conclusion: 'Notice also the identity $\\sum_{d \\mid n} \\varphi(d) = n$: e.g., $\\varphi(1)+\\varphi(2)+\\varphi(4)+\\varphi(5)+\\varphi(10)+\\varphi(20) = 1+1+2+4+4+8 = 20$.',
          },
        ],
        visualConfig: {
          kind: 'cyclic_clock',
          title: 'Generators vs Non-Generators on ℤₙ',
          caption: 'Highlight all coprime generators around the modular clock.',
          defaultN: 12,
        },
        commonMistakes: [
          {
            mistake: 'Computing $\\varphi(mn) = \\varphi(m)\\varphi(n)$ when $\\gcd(m, n) > 1$.',
            correction: 'Totient multiplicativity holds ONLY for coprime factors: $\\varphi(4) = 2 \\ne \\varphi(2)\\varphi(2) = 1$.',
          },
        ],
        practiceExercises: [
          {
            id: 'm6-s2-ex1',
            prompt: 'Compute $\\varphi(18)$ and list all generators of $\\mathbb{Z}_{18}$.',
            hint: '$18 = 2 \\cdot 3^2$.',
            answer: '$\\varphi(18) = 6$; generators are $\\{1, 5, 7, 11, 13, 17\\}$.',
            solutionSteps: [
              '$\\varphi(18) = \\varphi(2)\\varphi(9) = 1 \\cdot (9 - 3) = 6$.',
              'List integers in $1..17$ not divisible by 2 or 3: $1, 5, 7, 11, 13, 17$.',
            ],
          },
        ],
        revisionSummary: [
          '$k$ generates $\\mathbb{Z}_n \\iff \\gcd(k, n) = 1$.',
          '$\\varphi(p^e) = p^{e-1}(p - 1)$ and $\\varphi(ab) = \\varphi(a)\\varphi(b)$ when $\\gcd(a, b) = 1$.',
        ],
        keywords: ['Euler totient', 'phi(n)', 'generators', 'coprime', 'Z12', 'Z20'],
      },
      {
        id: 'm6-s3',
        moduleId: 'm6',
        order: 3,
        title: 'Computing Inverses Across Finite Groups',
        level: 'Intermediate',
        estimatedMinutes: 15,
        learningObjectives: [
          'Find element inverses rapidly in $\\mathbb{Z}_n$, direct products, $S_n$, and $D_n$.',
          'Use $a^{-1} = a^{\\operatorname{ord}(a) - 1}$ in any finite group.',
        ],
        prerequisites: ['Modules 2, 4, 5'],
        definitions: [
          {
            term: 'Finite-Group Power Inverse',
            formal: 'If $\\operatorname{ord}(a) = m$, then $a \\cdot a^{m-1} = a^m = e$, so $a^{-1} = a^{m-1}$.',
            latex: 'a^{-1} = a^{\\operatorname{ord}(a) - 1}',
          },
        ],
        notation: [
          { symbol: '$(-a) \\bmod n$', meaning: 'Inverse of $a$ in $\\mathbb{Z}_n$' },
        ],
        theorems: [
          {
            title: 'Unified Inverse Rules Across Artifact 1 Groups',
            statement: 'In $\\mathbb{Z}_n$: $-a \\equiv n - a \\pmod n$. In $S_n$: invert every cycle $(a_1, a_2, \\dots, a_k)^{-1} = (a_k, \\dots, a_2, a_1)$. In $D_n$: $(\\rho^k)^{-1} = \\rho^{n-k}$ and $(\\mu\\rho^k)^{-1} = \\mu\\rho^k$.',
          },
        ],
        explanation: [
          'Different notations hide the exact same group-theoretic concept: finding the unique partner that returns you to the identity.',
          'In permutation cycle notation, reversing the arrows in each cycle immediately yields $\\sigma^{-1}$. In dihedral groups, undoing a counterclockwise rotation $\\rho^k$ means rotating $n - k$ steps further, while reflections undo themselves.',
        ],
        stepByStepExamples: [
          {
            title: 'Inverses in Four Different Artifact 1 Groups',
            problem: 'Compute the inverse of $7 \\in \\mathbb{Z}_{20}$, $(2, 5) \\in \\mathbb{Z}_4 \\times \\mathbb{Z}_6$, $(1, 3, 5, 2) \\in S_5$, and $\\rho^3, \\mu\\rho^3 \\in D_7$.',
            steps: [
              'In $\\mathbb{Z}_{20}$: inverse of $7$ is $20 - 7 = 13$.',
              'In $\\mathbb{Z}_4 \\times \\mathbb{Z}_6$: inverse of $(2, 5)$ is $(4-2, 6-5) = (2, 1)$.',
              'In $S_5$: inverse of $(1, 3, 5, 2)$ is $(2, 5, 3, 1) = (1, 2, 5, 3)$.',
              'In $D_7$: $(\\rho^3)^{-1} = \\rho^{7-3} = \\rho^4$, and $(\\mu\\rho^3)^{-1} = \\mu\\rho^3$.',
            ],
            conclusion: 'Each pair multiplies/adds back to the respective group identity ($0$, $(0,0)$, $\\iota$, $1$).',
          },
        ],
        visualConfig: {
          kind: 'cayley_preview',
          title: 'Identity & Inverse Lookup in Finite Groups',
          caption: 'Locate the identity cell in each row to read off every inverse.',
        },
        commonMistakes: [
          {
            mistake: 'Trying to compute $1/a$ (multiplicative reciprocal) inside additive group $\\mathbb{Z}_n$.',
            correction: 'The operation on $\\mathbb{Z}_n$ is addition mod $n$, so the inverse of $a$ is $n - a$, not a fraction or modular reciprocal.',
          },
        ],
        practiceExercises: [
          {
            id: 'm6-s3-ex1',
            prompt: 'Compute the inverse of $\\sigma = (1, 4)(2, 3, 5)$ in $S_5$.',
            hint: 'Reverse each disjoint cycle independently (since disjoint cycles commute).',
            answer: '$(1, 4)(2, 5, 3)$.',
            solutionSteps: [
              '$(1, 4)^{-1} = (1, 4)$ and $(2, 3, 5)^{-1} = (2, 5, 3)$.',
            ],
          },
        ],
        revisionSummary: [
          'In $\\mathbb{Z}_n$, $a^{-1} = (n - a) \\bmod n$.',
          'In $S_n$, reverse disjoint cycles; in $D_n$, $(\\rho^k)^{-1} = \\rho^{n-k}$ and $(\\mu\\rho^k)^{-1} = \\mu\\rho^k$.',
        ],
        keywords: ['inverse', 'cycle inverse', 'dihedral inverse', 'modular inverse'],
      },
    ],
  },
  {
    id: 'm7',
    number: 7,
    title: 'Cayley Tables and Structural Verification',
    subtitle: 'Table construction, Latin square property, axiom audits, and symmetry checks',
    description:
      'Learn how binary operation tables encode closure, identity, inverses, and commutativity visually across finite groups.',
    subsections: [
      {
        id: 'm7-s1',
        moduleId: 'm7',
        order: 1,
        title: 'Constructing & Reading Cayley Tables',
        level: 'Beginner',
        estimatedMinutes: 15,
        learningObjectives: [
          'Read row-by-column entries $a * b$ in a Cayley table unambiguously.',
          'Build complete Cayley tables for $\\mathbb{Z}_n$, $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$, $S_3$, and $D_4$.',
        ],
        prerequisites: ['Modules 1, 4, 5'],
        definitions: [
          {
            term: 'Cayley Table',
            formal: 'An $n \\times n$ grid indexing rows by left operand $a \\in G$ and columns by right operand $b \\in G$, whose $(a, b)$ entry equals $a * b$.',
          },
        ],
        notation: [
          { symbol: 'Row $a$, Col $b$', meaning: 'Represents $a * b$ (order matters when nonabelian!)' },
        ],
        theorems: [
          {
            title: 'Latin Square Property of Group Tables',
            statement: 'In the Cayley table of any finite group $G$, every element of $G$ appears exactly once in every row and exactly once in every column.',
          },
        ],
        explanation: [
          'Because left and right cancellation hold in any group (Theorem 3.13), $a * x = a * y$ forces $x = y$, meaning no element can repeat in row $a$. Likewise, no element repeats in column $b$.',
          'In nonabelian groups like $D_3$ or $D_4$, row $a$ column $b$ computes $a \\cdot b$, which need not equal column $a$ row $b$ ($b \\cdot a$). For instance in $D_4$, row $\\rho$, column $\\mu$ holds $\\rho\\mu = \\mu\\rho^3$, while row $\\mu$, column $\\rho$ holds $\\mu\\rho$.',
        ],
        stepByStepExamples: [
          {
            title: 'Checking Entry $(\\rho, \\mu)$ vs $(\\mu, \\rho)$ in $D_4$',
            problem: 'Verify the two asymmetric entries for $\\rho$ and $\\mu$ in the Cayley table of $D_4$.',
            steps: [
              'Row $\\rho$, Column $\\mu$: $\\rho\\mu = \\mu\\rho^{4-1} = \\mu\\rho^3$.',
              'Row $\\mu$, Column $\\rho$: $\\mu\\rho$ is already in standard form.',
              'Since $\\mu\\rho^3 \\ne \\mu\\rho$, the table is asymmetric across its main diagonal.',
            ],
            conclusion: 'Diagonal asymmetry immediately exposes that $D_4$ is nonabelian.',
          },
        ],
        visualConfig: {
          kind: 'cayley_preview',
          title: 'Interactive Cayley Table Explorer',
          caption: 'Hover any row/column pair to inspect $a * b$, identity, and diagonal symmetry.',
        },
        commonMistakes: [
          {
            mistake: 'Swapping row and column order when computing nonabelian products.',
            correction: 'Standard convention: row header is LEFT operand, column header is RIGHT operand ($\\text{row} * \\text{col}$).',
          },
        ],
        practiceExercises: [
          {
            id: 'm7-s1-ex1',
            prompt: 'Can a finite group of order 4 have a Cayley table where row 2 contains the element $a$ twice?',
            hint: 'Recall the Latin square property.',
            answer: 'No; repetition violates cancellation / uniqueness of inverses.',
            solutionSteps: [
              'If $x * y = x * z$, multiplying by $x^{-1}$ on the left gives $y = z$. Thus every row contains $n$ distinct entries.',
            ],
          },
        ],
        revisionSummary: [
          'Every group Cayley table is a Latin square (each element once per row and column).',
          'Row = left factor, Column = right factor.',
        ],
        keywords: ['Cayley table', 'Latin square', 'symmetry', 'nonabelian'],
      },
      {
        id: 'm7-s2',
        moduleId: 'm7',
        order: 2,
        title: 'Verifying Group Axioms & Abelian Symmetry from Tables',
        level: 'Intermediate',
        estimatedMinutes: 16,
        learningObjectives: [
          'Check closure, identity, inverses, and commutativity directly from an operation table.',
          'Explain why associativity cannot be read off visually in one glance like commutativity.',
        ],
        prerequisites: ['Module 7.1: Cayley Tables'],
        definitions: [
          {
            term: 'Symmetric Cayley Table',
            formal: 'A table satisfying $T[i][j] = T[j][i]$ for all $i, j$, equivalent to the group being abelian.',
          },
        ],
        notation: [
          { symbol: '$T^\\top = T$', meaning: 'Table equals its own matrix transpose (abelian)' },
        ],
        theorems: [
          {
            title: 'Visual Axiom Diagnostics',
            statement: 'From a Cayley table: (1) Closure holds iff all entries lie in the header set; (2) Identity $e$ exists iff row $e$ and column $e$ copy the headers; (3) Inverses exist iff $e$ appears in every row and column symmetrically; (4) Abelianness holds iff the table is symmetric across its main diagonal.',
          },
        ],
        explanation: [
          'While closure, identity, inverses, and commutativity are effortless to check by eye in a table, associativity requires checking $(a*b)*c = a*(b*c)$ across triples—which is why our Cayley Table Generator verifies all $n^3$ triples computationally!',
          'Watch out for a famous trap: a Latin square can satisfy closure, identity, and inverses yet still FAIL associativity at order 5 or higher (such a structure is a loop, not a group).',
        ],
        stepByStepExamples: [
          {
            title: 'Detecting the Identity and Inverses in a Scrambled Table',
            problem: 'Given a table on $\\{a, b, c\\}$ where column $b$ reads $(a, b, c)^\\top$ and row $b$ reads $(a, b, c)$, find the identity and inverses.',
            steps: [
              'Row $b$ and column $b$ both copy the header $(a, b, c)$, so $b$ is the identity element.',
              'If $a * c = b$ and $c * a = b$, then $a^{-1} = c$ and $c^{-1} = a$.',
            ],
            conclusion: 'Identity is $b$, and $(a, c)$ form an inverse pair.',
          },
        ],
        visualConfig: {
          kind: 'cayley_preview',
          title: 'Automated Axiom Verification Panel',
          caption: 'Inspect closure, identity, inverses, associativity, and symmetry checks live.',
        },
        commonMistakes: [
          {
            mistake: 'Assuming every Latin square with an identity is automatically a group.',
            correction: 'Associativity can still fail for $n \\ge 5$; always verify $(a*b)*c = a*(b*c)$.',
          },
        ],
        practiceExercises: [
          {
            id: 'm7-s2-ex1',
            prompt: 'Why is the main diagonal of the Cayley table of $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$ filled entirely with the identity $(0, 0)$?',
            hint: 'What does $(x, x) = e$ tell you about every element?',
            answer: 'Because every element in $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$ satisfies $x + x = (0,0)$, i.e., every element has order 1 or 2.',
            solutionSteps: [
              'Diagonal entries represent $x * x$. If $x^2 = e$ for all $x$, the diagonal equals $e$ everywhere.',
            ],
          },
        ],
        revisionSummary: [
          'Diagonal symmetry tests commutativity; row/column copy tests identity.',
          'Associativity requires verifying triples $(ab)c = a(bc)$.',
        ],
        keywords: ['axiom verification', 'associativity', 'symmetry', 'Latin square'],
      },
      {
        id: 'm7-s3',
        moduleId: 'm7',
        order: 3,
        title: 'Comparing Group Structures via Cayley Patterns',
        level: 'University',
        estimatedMinutes: 16,
        learningObjectives: [
          'Distinguish $\\mathbb{Z}_4$ from $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$ purely from diagonal patterns in their Cayley tables.',
          'Recognize the $2 \\times 2$ block structure of $D_n$ tables separating rotations and reflections.',
        ],
        prerequisites: ['Modules 2.3, 5.2, 7.2'],
        definitions: [
          {
            term: 'Block Structure of $D_n$',
            formal: 'Ordering $D_n$ as rotations $\\{\\rho^k\\}$ followed by reflections $\\{\\mu\\rho^k\\}$ partitions the Cayley table into four $n\\times n$ blocks: $\\text{Rot}\\cdot\\text{Rot} = \\text{Rot}$, $\\text{Rot}\\cdot\\text{Ref} = \\text{Ref}$, $\\text{Ref}\\cdot\\text{Rot} = \\text{Ref}$, and $\\text{Ref}\\cdot\\text{Ref} = \\text{Rot}$.',
          },
        ],
        notation: [
          { symbol: '$\\text{Ref} \\cdot \\text{Ref} = \\text{Rot}$', meaning: 'Composing any two reflections always yields a rotation' },
        ],
        theorems: [
          {
            title: 'Up to Order 4, Only Two Group Tables Exist',
            statement: 'Every group of order 4 has a Cayley table isomorphic either to the cyclic shift table of $\\mathbb{Z}_4$ or to the block-symmetric Klein 4-table $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$.',
          },
        ],
        explanation: [
          'Looking at a Cayley table with color-coded elements reveals deep algebraic architecture instantly. In $\\mathbb{Z}_4$, every row shifts cyclically by one step, and the main diagonal alternates between $0$ and $2$. In $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$, the main diagonal is uniformly $(0, 0)$.',
          'In $D_n$, listing rotations first and reflections second creates a checkerboard of $n\\times n$ quadrants mirroring the parity law: combining two orientation-preserving rotations stays orientation-preserving, whereas composing two orientation-reversing reflections restores positive orientation!',
        ],
        stepByStepExamples: [
          {
            title: 'Orientation Parity in $D_4$ Block Multiplication',
            problem: 'Predict without full reduction whether $(\\mu\\rho^2)(\\rho^3)(\\mu\\rho)$ is a rotation or reflection.',
            steps: [
              'Count the number of reflections $\\mu$ appearing in the product: there are two ($\\mu\\rho^2$ and $\\mu\\rho$).',
              'Two orientation reversals cancel out to preserve orientation.',
            ],
            conclusion: 'The result must be a rotation $\\rho^k$ (specifically $\\rho^3$ in $D_4$).',
          },
        ],
        visualConfig: {
          kind: 'cayley_preview',
          title: 'Block Structure in D₄ vs ℤ₄ vs ℤ₂ × ℤ₂',
          caption: 'Compare checkerboard blocks of D₄ against cyclic shifts in ℤ₄.',
        },
        commonMistakes: [
          {
            mistake: 'Thinking the product of two reflections in $D_n$ is another reflection.',
            correction: 'A reflection flips orientation; two flips restore orientation, producing a rotation $\\rho^k$.',
          },
        ],
        practiceExercises: [
          {
            id: 'm7-s3-ex1',
            prompt: 'Why is the set of all reflections in $D_n$ NOT a subgroup?',
            hint: 'Check closure under composing two reflections.',
            answer: 'Because the product of two reflections is a rotation (and $1$ is a rotation, not a reflection).',
            solutionSteps: [
              '$\\mu \\cdot \\mu = 1$, which is not a reflection.',
            ],
          },
        ],
        revisionSummary: [
          'Two reflections compose to a rotation; rotations form a subgroup of index 2 in $D_n$.',
          'Diagonal entries reveal square powers $x^2$ and immediately distinguish $\\mathbb{Z}_4$ from $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$.',
        ],
        keywords: ['block structure', 'rotations', 'reflections', 'Cayley patterns'],
      },
    ],
  },
  {
    id: 'm8',
    number: 8,
    title: 'Real-World Applications & Mathematical Synthesis',
    subtitle: 'Architecture, graphics, puzzles, kaleidoscopes, scheduling, and axiom discipline',
    description:
      'Apply Finite Abelian, Permutation, and Dihedral groups honestly to physical, artistic, and computational systems—knowing when a system IS a group and when it is not.',
    subsections: [
      {
        id: 'm8-s1',
        moduleId: 'm8',
        order: 1,
        title: 'Symmetry in Architecture, Kaleidoscopes & Digital Graphics',
        level: 'Intermediate',
        estimatedMinutes: 16,
        learningObjectives: [
          'Model rosette windows, domes, and polygonal tiles using $D_n$ and cyclic subgroups $\\mathbb{Z}_n$.',
          'Explain how $n$-mirror kaleidoscopes physically realize dihedral reflections and rotations.',
        ],
        prerequisites: ['Module 5: Dihedral Groups'],
        definitions: [
          {
            term: 'Rosette Symmetry Group',
            formal: 'Point symmetries fixing a center point in 2D fall into two families (Leonardo’s Theorem): pure rotational symmetry $\\mathbb{Z}_n$ (like pinwheels) or full dihedral symmetry $D_n$ (like snowflakes and rosettes).',
          },
        ],
        notation: [
          { symbol: '$D_6$ / $D_8$', meaning: 'Snowflake/hexagonal tile symmetry ($D_6$) and octagonal Islamic/cathedral rose geometry ($D_8$)' },
        ],
        theorems: [
          {
            title: 'Mirrors Generate Rotations',
            statement: 'Two planar mirrors meeting at angle $\\pi/n$ generate the dihedral group $D_n$: successive reflections across the two mirrors produce the rotation $\\rho$ of angle $2\\pi/n$.',
          },
        ],
        explanation: [
          'Architects and tile designers create visual harmony by constraining motifs to a finite symmetry group. When a cathedral rose window or polygonal floor medallion includes mirror axes as well as rotational spokes, its symmetry group is $D_n$. When blades curve asymmetrically—such as a pinwheel or turbine—reflections vanish, leaving only the cyclic rotation group $\\mathbb{Z}_n$.',
          'In 2D digital graphics and CAD editors, rotating sprites by multiples of $90^\\circ$ and flipping horizontally/vertically generates the 8 discrete pixel-preserving transforms of a square—literally the dihedral group $D_4 = \\{1, \\rho, \\rho^2, \\rho^3, \\mu, \\mu\\rho, \\mu\\rho^2, \\mu\\rho^3\\}$!',
        ],
        stepByStepExamples: [
          {
            title: 'Sprite Orientation Pipeline in $D_4$',
            problem: 'A user rotates an icon $90^\\circ$ counterclockwise ($\\rho$), flips across the horizontal axis ($\\mu$), then rotates $180^\\circ$ ($\\rho^2$). Find the single equivalent transform.',
            steps: [
              'Compose right-to-left: $\\rho^2 \\cdot \\mu \\cdot \\rho$.',
              'Apply $\\rho^2\\mu = \\mu\\rho^{4-2} = \\mu\\rho^2$ in $D_4$.',
              'Multiply by $\\rho$: $(\\mu\\rho^2)\\rho = \\mu\\rho^3$.',
            ],
            conclusion: 'The 3-step pipeline simplifies to the single transform $\\mu\\rho^3$ (reflection across the $45^\\circ$ diagonal).',
          },
        ],
        visualConfig: {
          kind: 'real_world_symmetry',
          title: 'Kaleidoscope & Architecture Symmetry Studio',
          caption: 'Toggle rotational vs reflectional motifs to contrast ℤₙ and Dₙ.',
          defaultN: 6,
        },
        commonMistakes: [
          {
            mistake: 'Claiming an asymmetric pinwheel has $D_n$ symmetry simply because it has $n$ blades.',
            correction: 'Curved pinwheel blades break mirror reflection, so its symmetry group is cyclic $\\mathbb{Z}_n$ of order $n$, not $D_n$ of order $2n$.',
          },
        ],
        practiceExercises: [
          {
            id: 'm8-s1-ex1',
            prompt: 'Two kaleidoscope mirrors meet at $45^\\circ$. Which dihedral group describes the image symmetries?',
            hint: 'Angle between mirrors is $180^\\circ / n = 45^\\circ$.',
            answer: '$D_4$ (order $8$, square symmetry).',
            solutionSteps: [
              '$n = 180^\\circ / 45^\\circ = 4$, so reflections generate $D_4$.',
            ],
          },
        ],
        revisionSummary: [
          'Purely rotational $n$-fold motifs have symmetry $\\mathbb{Z}_n$; motifs with mirrors have symmetry $D_n$.',
          'Every composition of flips and rotations in $D_n$ compresses to one canonical operation $\\rho^k$ or $\\mu\\rho^k$.',
        ],
        keywords: ['architecture', 'kaleidoscope', 'digital graphics', 'D4', 'D6', 'D8'],
      },
      {
        id: 'm8-s2',
        moduleId: 'm8',
        order: 2,
        title: 'Permutations in Puzzles, Circular Arrangements & Scheduling',
        level: 'Intermediate',
        estimatedMinutes: 16,
        learningObjectives: [
          'Model card shuffles, sliding puzzles, and Rubik’s Cube moves via $S_n$ and parity.',
          'Solve circular seating and round-robin shift problems using $\\mathbb{Z}_n$ and $D_n$.',
        ],
        prerequisites: ['Modules 4 and 6'],
        definitions: [
          {
            term: 'Parity Invariant in Puzzles',
            formal: 'If every legal move applies a permutation of fixed parity (or a 3-cycle, which is even), then unreachable states with the wrong parity can NEVER be reached.',
          },
        ],
        notation: [
          { symbol: '$\\operatorname{lcm}$ of cycles', meaning: 'Number of repetitions of a fixed shuffle or shift to restore original order' },
        ],
        theorems: [
          {
            title: 'Corner-Edge Parity Constraint in Rubik’s Cube',
            statement: 'Every quarter turn of a Rubik’s Cube face performs a 4-cycle on corners (odd) AND a 4-cycle on edges (odd). Hence corner parity always matches edge parity, forbidding a single pair swap.',
          },
        ],
        explanation: [
          'Repeating any fixed card shuffle or seating rotation corresponds to taking powers $\\sigma, \\sigma^2, \\dots$ in $S_n$. When does the deck return to its starting order? Precisely at $\\operatorname{ord}(\\sigma)$, the $\\operatorname{lcm}$ of its disjoint cycle lengths!',
          'Similarly, rotating $n$ shifts around a circular schedule advances positions by $+k \\bmod n$ in $\\mathbb{Z}_n$. Everyone rotates through all $n$ positions if and only if the step $k$ is a generator ($\gcd(k, n) = 1$).',
        ],
        stepByStepExamples: [
          {
            title: 'Repeating a Permutation Shuffle on 5 Packets',
            problem: 'A router permutes 5 packet slots via $\\sigma = (1, 2, 3)(4, 5)$ every millisecond. After how many milliseconds do all packets simultaneously return to their starting slots?',
            steps: [
              'Slots $\\{1, 2, 3\\}$ cycle every $3$ steps.',
              'Slots $\\{4, 5\\}$ swap every $2$ steps.',
              'Simultaneous return occurs at $\\operatorname{lcm}(3, 2) = 6$ steps.',
            ],
            conclusion: 'Every 6 milliseconds the configuration resets to the identity $\\iota$.',
          },
        ],
        visualConfig: {
          kind: 'permutation_cycle',
          title: 'Cycle Reset Period Simulator',
          caption: 'Visualize how disjoint sub-cycles synchronize at their LCM order.',
          defaultN: 5,
        },
        commonMistakes: [
          {
            mistake: 'Choosing shift step $k = 2$ on a $6$-person circular shift schedule expecting everyone to visit all 6 stations.',
            correction: 'Since $\\gcd(2, 6) = 2 \\ne 1$, step $2$ partitions people into two separate orbits of size $3$: $\\{0, 2, 4\\}$ and $\\{1, 3, 5\\}$.',
          },
        ],
        practiceExercises: [
          {
            id: 'm8-s2-ex1',
            prompt: 'On a $10$-station circular assembly wheel, which positive step sizes $k < 10$ visit every station before repeating?',
            hint: 'Find generators of $\\mathbb{Z}_{10}$.',
            answer: '$k \\in \\{1, 3, 7, 9\\}$ ($\\varphi(10) = 4$ step sizes).',
            solutionSteps: [
              'Check $\\gcd(k, 10) = 1$: yields $1, 3, 7, 9$.',
            ],
          },
        ],
        revisionSummary: [
          'Cycle lengths determine repeat periods via $\\operatorname{lcm}$.',
          'Full-cycle circular shifts require $\\gcd(k, n) = 1$.',
        ],
        keywords: ['Rubik cube', 'parity', 'scheduling', 'generators', 'permutations'],
      },
      {
        id: 'm8-s3',
        moduleId: 'm8',
        order: 3,
        title: 'Modeling Critique: Genuine Groups vs Non-Group Patterns',
        level: 'University',
        estimatedMinutes: 15,
        learningObjectives: [
          'Audit real-world pattern systems honestly against all four group axioms.',
          'Identify why lossy filters, irreversible edits, or non-closed pattern sets fail to form groups.',
        ],
        prerequisites: ['Modules 1 and 8'],
        definitions: [
          {
            term: 'Invertible Transformation Requirement',
            formal: 'A set of real-world operations forms a group ONLY if operations are closed under composition, associative, include a do-nothing identity, and every operation has an exact undo (inverse).',
          },
        ],
        notation: [
          { symbol: 'Non-Group', meaning: 'Any pattern or operation system violating closure, associativity, identity, or invertibility' },
        ],
        theorems: [
          {
            title: 'Lossy Operations Cannot Form Groups',
            statement: 'Any projection, cropping, blurring, or rounding operation that maps distinct states to the same output lacks an inverse and therefore cannot belong to a transformation group.',
          },
        ],
        explanation: [
          'Good applied mathematics requires intellectual honesty: not every repeating pattern or geometric rule forms a group! When analyzing visual patterns or software operations, check every axiom rigorously.',
          'For example, rotating and flipping a square sprite forms $D_4$ because every move is reversible. Adding a "grayscale flatten" or "crop to top half" operation destroys invertibility—multiple colored images collapse to the same grayscale image, so no inverse function exists.',
        ],
        stepByStepExamples: [
          {
            title: 'Auditing Two Digital Graphic Operations',
            problem: 'Compare (A) Square symmetries $D_4$ vs (B) $\\{\\text{identity}, \\text{rotate } 90^\\circ, \\text{blur}\\}$.',
            steps: [
              'System A ($D_4$): Closed, associative (function composition), identity $1$, every rotation/reflection has an inverse. Genuine group!',
              'System B: Repeating "rotate $90^\\circ$" without $180^\\circ$ or $270^\\circ$ fails closure; moreover, "blur" loses high-frequency pixel data and has no unique inverse.',
            ],
            conclusion: 'System A is a genuine finite group ($D_4$); System B is NOT a group.',
          },
        ],
        visualConfig: {
          kind: 'real_world_symmetry',
          title: 'Symmetry vs Non-Group Axiom Audit',
          caption: 'Distinguish genuine invertible symmetry groups from non-closed or lossy operations.',
          defaultN: 4,
        },
        commonMistakes: [
          {
            mistake: 'Calling an arbitrary collection of transformations a group without verifying closure and inverses.',
            correction: 'Generating a group requires including ALL compositions and ALL inverses of your basic moves.',
          },
        ],
        practiceExercises: [
          {
            id: 'm8-s3-ex1',
            prompt: 'Does $\\{1, \\rho, \\mu\\}$ inside $D_4$ form a group on its own?',
            hint: 'Check closure: what is $\\rho^2$ or $\\mu\\rho$?',
            answer: 'No; $\\rho \\cdot \\rho = \\rho^2$ and $\\mu \\cdot \\rho$ are missing, so closure fails.',
            solutionSteps: [
              'Since $\\rho^2 \\notin \\{1, \\rho, \\mu\\}$, the subset is not closed.',
            ],
          },
        ],
        revisionSummary: [
          'Never label an incomplete or irreversible system a group.',
          'A valid group model must verify closure, associativity, identity, and exact invertibility.',
        ],
        keywords: ['modeling', 'group axioms', 'counterexamples', 'real-world math'],
      },
    ],
  },
];
