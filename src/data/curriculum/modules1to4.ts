import type { CurriculumModule } from '../../types/algebra.ts';

export const MODULES_1_TO_4: CurriculumModule[] = [
  {
    id: 'm1',
    number: 1,
    title: 'Fundamentals of Finite Groups',
    subtitle: 'Binary operations, group axioms, identity, inverses, and direct products',
    description:
      'Build a rigorous foundation from concrete arithmetic sets to finite algebraic structures following Fraleigh Sections 1–4 and 6.',
    subsections: [
      {
        id: 'm1-s1',
        moduleId: 'm1',
        order: 1,
        title: 'Binary Operations & Group Axioms',
        level: 'Beginner',
        estimatedMinutes: 15,
        learningObjectives: [
          'Verify whether a binary operation is well-defined and closed on a finite set.',
          'Check the three group axioms (associativity, identity, inverses) systematically.',
          'Distinguish genuine finite groups from non-associative or non-invertible tables.',
        ],
        prerequisites: ['Set notation, modular arithmetic remainder $a \\bmod n$.'],
        definitions: [
          {
            term: 'Binary Operation ($*$)',
            formal: 'A function $*: S \\times S \\to S$ assigning each ordered pair $(a, b)$ to a unique element $a * b \\in S$ (closure is built into the definition).',
            latex: '*(a, b) = a * b \\in S',
          },
          {
            term: 'Group $\\langle G, * \\rangle$',
            formal: 'A set $G$ together with a binary operation $*$ satisfying: ($\mathcal{G}_1$) Associativity $(a*b)*c = a*(b*c)$; ($\mathcal{G}_2$) Identity $e \\in G$ with $e*a = a*e = a$; ($\mathcal{G}_3$) Inverses: for each $a \\in G$ there exists $a\' \\in G$ with $a*a\' = a\'*a = e$.',
            latex: '(a * b) * c = a * (b * c), \\quad e * a = a * e = a, \\quad a * a^{-1} = e',
          },
          {
            term: 'Order of a Group ($|G|$)',
            formal: 'The number of elements in a finite group $G$.',
            latex: '|G| < \\infty',
          },
        ],
        notation: [
          { symbol: '$\\langle G, * \\rangle$', meaning: 'Group with underlying set $G$ and operation $*$' },
          { symbol: '$e$ or $0$ or $1$', meaning: 'Identity element (context-dependent: $0$ in $\\mathbb{Z}_n$, $\\iota$ in $S_n$, $1$ in $D_n$)' },
          { symbol: '$|G|$', meaning: 'Cardinality (order) of finite group $G$' },
        ],
        theorems: [
          {
            title: 'Fraleigh Theorem 3.13 (Cancellation Laws)',
            statement: 'If $G$ is a group with binary operation $*$, then left and right cancellation hold: $a * b = a * c \\implies b = c$, and $b * a = c * a \\implies b = c$.',
          },
        ],
        explanation: [
          'In high school arithmetic we add and multiply numbers without pausing to ask which rules actually make equations solvable. Abstract algebra isolates the minimal set of rules—the group axioms—that guarantee every linear equation $a * x = b$ has a unique solution.',
          'First, closure requires that combining any two elements of $G$ never escapes $G$. For instance, odd integers under ordinary addition are NOT closed ($3 + 5 = 8$ is even), so they fail before even checking the group axioms.',
          'Second, associativity $(a * b) * c = a * (b * c)$ lets us drop parentheses in long products. Third, an identity element $e$ acts neutrally from both sides. Fourth, every single element must have a two-sided inverse back inside $G$.',
        ],
        stepByStepExamples: [
          {
            title: 'Testing $\\langle \\mathbb{Z}_4, +_4 \\rangle$ vs $\\langle \\mathbb{Z}_4, \\cdot_4 \\rangle$',
            problem: 'Determine whether $\\mathbb{Z}_4 = \\{0, 1, 2, 3\\}$ forms a group under addition mod 4 and under multiplication mod 4.',
            steps: [
              'Under $+_4$: every sum mod 4 stays in $\\{0, 1, 2, 3\\}$ (closed), integer addition is associative, $0$ is the identity, and inverses are $-0=0, -1=3, -2=2, -3=1$. Hence $\\langle \\mathbb{Z}_4, +_4 \\rangle$ IS a group of order 4.',
              'Under $\\cdot_4$: the identity is $1$, because $1 \\cdot_4 x = x$.',
              'Check inverses under $\\cdot_4$: $0 \\cdot_4 x = 0 \\ne 1$, so $0$ has no inverse. Also $2 \\cdot_4 x \\in \\{0, 2\\}$, so $2$ has no inverse.',
            ],
            conclusion: '$\\langle \\mathbb{Z}_4, +_4 \\rangle$ is a group, whereas $\\langle \\mathbb{Z}_4, \\cdot_4 \\rangle$ fails the inverse axiom.',
          },
        ],
        visualConfig: {
          kind: 'group_axioms',
          title: 'Interactive Group Axiom Verification',
          caption: 'Inspect how closure, identity, and inverses appear geometrically inside a Cayley table.',
        },
        commonMistakes: [
          {
            mistake: 'Assuming $\\mathbb{Z}_n$ under multiplication modulo $n$ is a group.',
            correction: 'Element $0$ never has a multiplicative inverse, and zero divisors (like $2$ in $\\mathbb{Z}_4$) also lack inverses.',
          },
          {
            mistake: 'Treating commutativity ($a*b = b*a$) as a mandatory group axiom.',
            correction: 'Commutativity defines an abelian group, NOT every group. $S_3$ and $D_3$ are valid finite groups that are nonabelian.',
          },
        ],
        practiceExercises: [
          {
            id: 'm1-s1-ex1',
            prompt: 'Does the set $S = \\{1, 3, 5, 7\\}$ under multiplication modulo $8$ form a finite group?',
            hint: 'Compute $a \\cdot b \\bmod 8$ for each pair and square every element.',
            answer: 'Yes; it is an abelian group of order 4 where every element is its own inverse.',
            solutionSteps: [
              'All products of odd integers mod 8 are odd, so $S$ is closed.',
              'Multiplication mod 8 is associative and $1$ is the identity.',
              '$1^2 \\equiv 1$, $3^2 = 9 \\equiv 1$, $5^2 = 25 \\equiv 1$, $7^2 = 49 \\equiv 1 \\pmod 8$. Every element is its own inverse.',
            ],
          },
        ],
        revisionSummary: [
          'A group requires closure, associativity, a two-sided identity, and a two-sided inverse for every element.',
          'Commutativity is an extra property (abelian), not part of the base group definition.',
        ],
        keywords: ['binary operation', 'closure', 'associativity', 'identity', 'inverse', 'group axioms'],
      },
      {
        id: 'm1-s2',
        moduleId: 'm1',
        order: 2,
        title: 'Elementary Properties: Uniqueness & Inverses',
        level: 'Foundational',
        estimatedMinutes: 15,
        learningObjectives: [
          'Prove that identity and inverse elements in any group are unique.',
          'Apply the socks-and-shoes rule $(a * b)^{-1} = b^{-1} * a^{-1}$ correctly in nonabelian groups.',
          'Solve linear group equations $a * x * b = c$ without assuming commutativity.',
        ],
        prerequisites: ['Module 1.1: Group Axioms'],
        definitions: [
          {
            term: 'Unique Inverse ($a^{-1}$)',
            formal: 'For each $a \\in G$, the unique element satisfying $a * a^{-1} = a^{-1} * a = e$.',
            latex: 'a * a^{-1} = a^{-1} * a = e',
          },
        ],
        notation: [
          { symbol: '$a^{-1}$', meaning: 'Multiplicative notation for the inverse of $a$' },
          { symbol: '$-a$', meaning: 'Additive notation for the inverse of $a$ in abelian groups like $\\mathbb{Z}_n$' },
        ],
        theorems: [
          {
            title: 'Fraleigh Theorem 3.16 (Uniqueness of Identity and Inverses)',
            statement: 'In a group $G$, there is only one identity element $e$, and for each $a \\in G$, there is only one inverse $a^{-1}$. Furthermore, $(a * b)^{-1} = b^{-1} * a^{-1}$.',
            latex: '(a * b)^{-1} = b^{-1} * a^{-1}',
          },
        ],
        explanation: [
          'Suppose $e$ and $e\'$ were both identities in $G$. Then $e = e * e\' = e\'$, immediately proving uniqueness. Likewise, if $b$ and $c$ both invert $a$, then $b = b * e = b * (a * c) = (b * a) * c = e * c = c$.',
          'In nonabelian groups, order matters when inverting a product: putting on socks ($b$) then shoes ($a$) means you must take off shoes ($a^{-1}$) before socks ($b^{-1}$). Hence $(a * b)^{-1} = b^{-1} * a^{-1}$.',
        ],
        stepByStepExamples: [
          {
            title: 'Solving $a * x * b = c$ in a Nonabelian Group',
            problem: 'Given $a, b, c \\in G$, isolate $x$ in $a * x * b = c$.',
            steps: [
              'Multiply both sides on the LEFT by $a^{-1}$: $a^{-1} * (a * x * b) = a^{-1} * c$, giving $x * b = a^{-1} * c$.',
              'Multiply both sides on the RIGHT by $b^{-1}$: $(x * b) * b^{-1} = a^{-1} * c * b^{-1}$.',
            ],
            conclusion: 'The unique solution is $x = a^{-1} * c * b^{-1}$.',
          },
        ],
        visualConfig: {
          kind: 'group_axioms',
          title: 'Left vs Right Inverse Cancellation',
          caption: 'Inspect unique row/column inverse pairs inside a finite group.',
        },
        commonMistakes: [
          {
            mistake: 'Writing $(a * b)^{-1} = a^{-1} * b^{-1}$ in $S_3$ or $D_n$.',
            correction: 'Always reverse the order: $(a * b)^{-1} = b^{-1} * a^{-1}$. Check $(a * b)(b^{-1} * a^{-1}) = a(bb^{-1})a^{-1} = e$.',
          },
        ],
        practiceExercises: [
          {
            id: 'm1-s2-ex1',
            prompt: 'Simplify $(a * b * c)^{-1}$ in an arbitrary finite group $G$.',
            hint: 'Apply the two-factor rule twice.',
            answer: '$c^{-1} * b^{-1} * a^{-1}$',
            solutionSteps: [
              'Group as $((a*b)*c)^{-1} = c^{-1} * (a*b)^{-1}$.',
              'Expand $(a*b)^{-1} = b^{-1} * a^{-1}$ to obtain $c^{-1} * b^{-1} * a^{-1}$.',
            ],
          },
        ],
        revisionSummary: [
          'Identity and inverses are strictly unique in every group.',
          'Inverses reverse product order: $(ab)^{-1} = b^{-1}a^{-1}$.',
        ],
        keywords: ['uniqueness', 'inverse', 'socks and shoes', 'cancellation', 'equations'],
      },
      {
        id: 'm1-s3',
        moduleId: 'm1',
        order: 3,
        title: 'Abelian vs Nonabelian Groups & Direct Products',
        level: 'Foundational',
        estimatedMinutes: 18,
        learningObjectives: [
          'Contrast abelian groups ($a*b = b*a$) with nonabelian groups ($S_3$, $D_3$).',
          'Construct the external direct product $G_1 \\times G_2$ of two finite groups.',
          'Verify that $G_1 \\times G_2$ is abelian if and only if both $G_1$ and $G_2$ are abelian.',
        ],
        prerequisites: ['Module 1.1–1.2'],
        definitions: [
          {
            term: 'Abelian Group',
            formal: 'A group $G$ in which $a * b = b * a$ holds for all $a, b \\in G$.',
            latex: '\\forall a, b \\in G, \\quad a * b = b * a',
          },
          {
            term: 'Direct Product ($G_1 \\times G_2$)',
            formal: 'Cartesian product $\\{(g_1, g_2) : g_1 \\in G_1, g_2 \\in G_2\\}$ with componentwise operation $(g_1, g_2)(h_1, h_2) = (g_1 h_1, g_2 h_2)$.',
            latex: '|G_1 \\times G_2| = |G_1| \\cdot |G_2|',
          },
        ],
        notation: [
          { symbol: '$G_1 \\times G_2$', meaning: 'Direct product of groups $G_1$ and $G_2$' },
          { symbol: '$(e_1, e_2)$', meaning: 'Identity element in $G_1 \\times G_2$' },
        ],
        theorems: [
          {
            title: 'Fraleigh Theorem 9.4 (Direct Product Group)',
            statement: 'If $G_1, \\dots, G_n$ are groups, then $\\prod_{i=1}^n G_i$ under componentwise multiplication is a group of order $\\prod |G_i|$.',
          },
        ],
        explanation: [
          'For orders $1, 2, 3, 4,$ and $5$, every group turns out to be abelian. The smallest possible nonabelian group occurs at order $6$: $S_3 \\cong D_3$, where rotating and reflecting a triangle in opposite orders produces different orientations.',
          'Direct products let us assemble larger groups from smaller building blocks. Because operations happen independently in each coordinate, $(a_1, a_2)^{-1} = (a_1^{-1}, a_2^{-1})$.',
        ],
        stepByStepExamples: [
          {
            title: 'Componentwise Arithmetic in $\\mathbb{Z}_2 \\times \\mathbb{Z}_3$',
            problem: 'Compute $(1, 2) + (1, 2)$ and the inverse of $(1, 2)$ in $\\mathbb{Z}_2 \\times \\mathbb{Z}_3$.',
            steps: [
              'First coordinate mod 2: $1 + 1 \\equiv 0 \\pmod 2$.',
              'Second coordinate mod 3: $2 + 2 = 4 \\equiv 1 \\pmod 3$. So $(1, 2) + (1, 2) = (0, 1)$.',
              'For inverse, negate each coordinate in its modulus: $(-1 \\bmod 2, -2 \\bmod 3) = (1, 1)$. Check: $(1, 2) + (1, 1) = (0, 0)$.',
            ],
            conclusion: '$(1, 2) + (1, 2) = (0, 1)$ and $-(1, 2) = (1, 1)$.',
          },
        ],
        visualConfig: {
          kind: 'direct_product',
          title: 'Direct Product Component Grid',
          caption: 'Explore componentwise addition and order calculation in ℤ₂ × ℤ₃.',
          defaultModuli: [2, 3],
        },
        commonMistakes: [
          {
            mistake: 'Reducing all coordinates by the same modulus in $\\mathbb{Z}_m \\times \\mathbb{Z}_n$.',
            correction: 'Each coordinate uses its own modulus: coordinate $i$ reduces modulo $n_i$.',
          },
        ],
        practiceExercises: [
          {
            id: 'm1-s3-ex1',
            prompt: 'What is the order of the direct product $\\mathbb{Z}_2 \\times S_3$, and is it abelian?',
            hint: 'Check $|G_1| \\cdot |G_2|$ and whether $S_3$ commutes.',
            answer: 'Order 12; nonabelian because $S_3$ is nonabelian.',
            solutionSteps: [
              '$|\\mathbb{Z}_2 \\times S_3| = 2 \\times 6 = 12$.',
              'Elements $(0, \\sigma)$ and $(0, \\tau)$ fail to commute whenever $\\sigma\\tau \\ne \\tau\\sigma$ in $S_3$.',
            ],
          },
        ],
        revisionSummary: [
          'Smallest nonabelian group has order 6 ($S_3 \\cong D_3$).',
          'Direct products operate coordinate-by-coordinate and multiply orders.',
        ],
        keywords: ['abelian', 'nonabelian', 'direct product', 'order', 'componentwise'],
      },
    ],
  },
  {
    id: 'm2',
    number: 2,
    title: 'Finite Abelian Groups',
    subtitle: 'Cyclic groups, direct products of cyclic groups, and structural invariants',
    description:
      'Analyze cyclic groups $\\mathbb{Z}_n$ and how direct products reveal structural differences between groups of identical order.',
    subsections: [
      {
        id: 'm2-s1',
        moduleId: 'm2',
        order: 1,
        title: 'Cyclic Groups & Structure of $\\mathbb{Z}_n$',
        level: 'Foundational',
        estimatedMinutes: 16,
        learningObjectives: [
          'Define a cyclic group $G = \\langle a \\rangle$ and identify generators.',
          'Prove that every cyclic group is abelian.',
          'Describe the subgroups of $\\mathbb{Z}_n$ using divisors of $n$.',
        ],
        prerequisites: ['Module 1: Group Axioms'],
        definitions: [
          {
            term: 'Cyclic Group',
            formal: 'A group $G$ generated by a single element $a \\in G$: every element is $a^k$ (or $ka$ additively) for some integer $k$.',
            latex: 'G = \\langle a \\rangle = \\{a^k : k \\in \\mathbb{Z}\\}',
          },
        ],
        notation: [
          { symbol: '$\\langle a \\rangle$', meaning: 'Cyclic subgroup generated by $a$' },
          { symbol: '$\\mathbb{Z}_n$', meaning: 'Additive cyclic group $\\{0, 1, \\dots, n-1\\}$ modulo $n$' },
        ],
        theorems: [
          {
            title: 'Fraleigh Theorem 6.1 & 6.14',
            statement: 'Every cyclic group is abelian, and every finite cyclic group of order $n$ is isomorphic to $\\mathbb{Z}_n$. Each subgroup of $\\mathbb{Z}_n$ has order $d \\mid n$ and is generated by $n/d$.',
          },
        ],
        explanation: [
          'In $\\mathbb{Z}_n$, $1$ always generates the entire group because adding $1$ repeatedly visits $1, 2, \\dots, n-1, 0$. Other elements may generate only a smaller cycle: in $\\mathbb{Z}_6$, adding $2$ produces $\\{0, 2, 4\\}$, a subgroup of order $3$.',
          'Because $a^r a^s = a^{r+s} = a^{s+r} = a^s a^r$, cyclic groups are automatically abelian. However, many abelian groups—like $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$—are NOT cyclic!',
        ],
        stepByStepExamples: [
          {
            title: 'Subgroups of $\\mathbb{Z}_{12}$',
            problem: 'List all subgroups of $\\mathbb{Z}_{12}$ using divisors of 12.',
            steps: [
              'Divisors of $12$ are $1, 2, 3, 4, 6, 12$.',
              'For each divisor $d$, the unique subgroup of order $d$ is $\\langle 12/d \\rangle$: order 1 is $\\langle 0 \\rangle$, order 2 is $\\langle 6 \\rangle$, order 3 is $\\langle 4 \\rangle$, order 4 is $\\langle 3 \\rangle$, order 6 is $\\langle 2 \\rangle$, order 12 is $\\langle 1 \\rangle = \\mathbb{Z}_{12}$.',
            ],
            conclusion: '$\\mathbb{Z}_{12}$ has exactly 6 subgroups, one for each divisor of 12.',
          },
        ],
        visualConfig: {
          kind: 'cyclic_clock',
          title: 'Modular Clock Subgroup Explorer',
          caption: 'Step around ℤ_n to see which elements sweep the entire circle vs proper subgroups.',
          defaultN: 12,
        },
        commonMistakes: [
          {
            mistake: 'Assuming every abelian group is cyclic.',
            correction: '$\\mathbb{Z}_2 \\times \\mathbb{Z}_2$ is abelian of order 4, yet every element has order 1 or 2, so no single element generates all 4 elements.',
          },
        ],
        practiceExercises: [
          {
            id: 'm2-s1-ex1',
            prompt: 'How many elements are in $\\langle 4 \\rangle$ inside $\\mathbb{Z}_{10}$?',
            hint: 'Compute repeated multiples of $4$ modulo $10$.',
            answer: '5 elements: $\\{0, 4, 8, 2, 6\\}$.',
            solutionSteps: [
              '$4 \\to 8 \\to 2 \\to 6 \\to 0$ mod $10$.',
              'Formula check: $10 / \\gcd(10, 4) = 10 / 2 = 5$.',
            ],
          },
        ],
        revisionSummary: [
          'Cyclic implies abelian, but abelian does not imply cyclic.',
          '$\\mathbb{Z}_n$ has a unique subgroup for each divisor $d$ of $n$.',
        ],
        keywords: ['cyclic group', 'generator', 'subgroup', 'divisor', 'abelian'],
      },
      {
        id: 'm2-s2',
        moduleId: 'm2',
        order: 2,
        title: 'Direct Products of Cyclic Groups & Element Orders',
        level: 'Intermediate',
        estimatedMinutes: 20,
        learningObjectives: [
          'Compute the order of $(a_1, a_2, \\dots, a_k)$ in $\\mathbb{Z}_{n_1} \\times \\dots \\times \\mathbb{Z}_{n_k}$ via $\\text{lcm}$.',
          'Determine when $\\mathbb{Z}_m \\times \\mathbb{Z}_n$ is isomorphic to $\\mathbb{Z}_{mn}$.',
          'Analyze concrete examples: $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$, $\\mathbb{Z}_2 \\times \\mathbb{Z}_4$, $\\mathbb{Z}_2 \\times \\mathbb{Z}_6$, $\\mathbb{Z}_3 \\times \\mathbb{Z}_3$, $\\mathbb{Z}_4 \\times \\mathbb{Z}_4$.',
        ],
        prerequisites: ['Module 2.1: Cyclic Groups'],
        definitions: [
          {
            term: 'Element Order in Direct Product',
            formal: 'For $x = (a_1, \\dots, a_k) \\in \\prod_{i=1}^k \\mathbb{Z}_{n_i}$, $|x| = \\operatorname{lcm}(|a_1|, \\dots, |a_k|)$ where $|a_i| = n_i / \\gcd(n_i, a_i)$.',
            latex: '\\operatorname{ord}(a_1, \\dots, a_k) = \\operatorname{lcm}\\!\\left(\\frac{n_1}{\\gcd(n_1,a_1)}, \\dots, \\frac{n_k}{\\gcd(n_k,a_k)}\\right)',
          },
        ],
        notation: [
          { symbol: '$\\operatorname{lcm}(r, s)$', meaning: 'Least common multiple of positive integers $r$ and $s$' },
          { symbol: '$G \\cong H$', meaning: 'Group isomorphism ($G$ and $H$ have identical algebraic structure)' },
        ],
        theorems: [
          {
            title: 'Fraleigh Theorem 9.5 (Cyclicity of Direct Products)',
            statement: 'The group $\\mathbb{Z}_m \\times \\mathbb{Z}_n$ is cyclic (isomorphic to $\\mathbb{Z}_{mn}$) if and only if $\\gcd(m, n) = 1$.',
            latex: '\\mathbb{Z}_m \\times \\mathbb{Z}_n \\cong \\mathbb{Z}_{mn} \\iff \\gcd(m, n) = 1',
          },
        ],
        explanation: [
          'For an element $(a, b) \\in \\mathbb{Z}_m \\times \\mathbb{Z}_n$ to return to $(0, 0)$ after $k$ additions, $k$ must simultaneously be a multiple of the order of $a$ in $\\mathbb{Z}_m$ AND the order of $b$ in $\\mathbb{Z}_n$. The smallest positive such $k$ is their least common multiple.',
          'Consider $\\mathbb{Z}_2 \\times \\mathbb{Z}_6$: since $\\gcd(2, 6) = 2 \\ne 1$, it is NOT isomorphic to $\\mathbb{Z}_{12}$. Its largest possible element order is $\\operatorname{lcm}(2, 6) = 6$, whereas $\\mathbb{Z}_{12}$ has elements of order $12$.',
        ],
        stepByStepExamples: [
          {
            title: 'Order of $(2, 3)$ in $\\mathbb{Z}_4 \\times \\mathbb{Z}_6$',
            problem: 'Find the order of $(2, 3)$ in $\\mathbb{Z}_4 \\times \\mathbb{Z}_6$ and determine if the group is cyclic.',
            steps: [
              'Order of $2$ in $\\mathbb{Z}_4$ is $4 / \\gcd(4, 2) = 2$.',
              'Order of $3$ in $\\mathbb{Z}_6$ is $6 / \\gcd(6, 3) = 2$.',
              'Order of $(2, 3)$ is $\\operatorname{lcm}(2, 2) = 2$.',
              'Maximum possible element order in $\\mathbb{Z}_4 \\times \\mathbb{Z}_6$ is $\\operatorname{lcm}(4, 6) = 12 < 24$, so the group is NOT cyclic.',
            ],
            conclusion: '$\operatorname{ord}(2, 3) = 2$, and $\\mathbb{Z}_4 \\times \\mathbb{Z}_6 \\not\\cong \\mathbb{Z}_{24}$.',
          },
        ],
        visualConfig: {
          kind: 'direct_product',
          title: 'Order Distribution in ℤ₂ × ℤ₄ vs ℤ₈',
          caption: 'Inspect element orders across direct product components.',
          defaultModuli: [2, 4],
        },
        commonMistakes: [
          {
            mistake: 'Multiplying coordinate orders instead of taking $\\operatorname{lcm}$.',
            correction: 'In $\\mathbb{Z}_2 \\times \\mathbb{Z}_4$, element $(1, 2)$ has coordinate orders $2$ and $2$, so its order is $\\operatorname{lcm}(2, 2) = 2$, not $2 \\times 2 = 4$.',
          },
        ],
        practiceExercises: [
          {
            id: 'm2-s2-ex1',
            prompt: 'Which of $\\mathbb{Z}_3 \\times \\mathbb{Z}_4$, $\\mathbb{Z}_3 \\times \\mathbb{Z}_3$, and $\\mathbb{Z}_4 \\times \\mathbb{Z}_4$ is cyclic?',
            hint: 'Apply $\\gcd(m, n) = 1$.',
            answer: 'Only $\\mathbb{Z}_3 \\times \\mathbb{Z}_4 \\cong \\mathbb{Z}_{12}$ is cyclic.',
            solutionSteps: [
              '$\\gcd(3, 4) = 1 \\implies \\mathbb{Z}_3 \\times \\mathbb{Z}_4 \\cong \\mathbb{Z}_{12}$ (cyclic).',
              '$\\gcd(3, 3) = 3 \\ne 1$ and $\\gcd(4, 4) = 4 \\ne 1$, so neither $\\mathbb{Z}_3 \\times \\mathbb{Z}_3$ nor $\\mathbb{Z}_4 \\times \\mathbb{Z}_4$ is cyclic.',
            ],
          },
        ],
        revisionSummary: [
          '$\\operatorname{ord}(a, b) = \\operatorname{lcm}(\\operatorname{ord}(a), \\operatorname{ord}(b))$.',
          '$\\mathbb{Z}_m \\times \\mathbb{Z}_n \\cong \\mathbb{Z}_{mn} \\iff \\gcd(m, n) = 1$.',
        ],
        keywords: ['direct product', 'lcm', 'gcd', 'isomorphism', 'order'],
      },
      {
        id: 'm2-s3',
        moduleId: 'm2',
        order: 3,
        title: 'Why Equal Order Does Not Imply Same Structure ($\\mathbb{Z}_4$ vs $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$)',
        level: 'Intermediate',
        estimatedMinutes: 16,
        learningObjectives: [
          'Prove that $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$ has no element of order 4 while $\\mathbb{Z}_4$ has two.',
          'Use element-order histograms as an isomorphism invariant.',
          'Compare all abelian groups of order 8 and order 16.',
        ],
        prerequisites: ['Module 2.2: Direct Products of Cyclic Groups'],
        definitions: [
          {
            term: 'Isomorphism Invariant',
            formal: 'Any structural property preserved under group isomorphism—such as abelianness, number of elements of each order $d$, or number of subgroups.',
          },
        ],
        notation: [
          { symbol: '$V_4 \\cong \\mathbb{Z}_2 \\times \\mathbb{Z}_2$', meaning: 'Klein 4-group of order 4 with exponent 2' },
        ],
        theorems: [
          {
            title: 'Order-Preservation Under Isomorphism',
            statement: 'If $\\phi: G \\to H$ is an isomorphism, then $\\operatorname{ord}(\\phi(g)) = \\operatorname{ord}(g)$ for every $g \\in G$. Consequently, $G$ and $H$ must have the exact same number of elements of every order $d$.',
          },
        ],
        explanation: [
          'Two groups can contain the exact same number of elements yet behave completely differently. At order $4$, $\\mathbb{Z}_4$ has elements $1$ and $3$ of order $4$, one element ($2$) of order $2$, and $0$ of order $1$.',
          'By contrast, $\\mathbb{Z}_2 \\times \\mathbb{Z}_2 = \\{(0,0), (1,0), (0,1), (1,1)\\}$ satisfies $x + x = (0,0)$ for every element $x$. Its nonzero elements all have order $2$, and no element has order $4$. Thus $\\mathbb{Z}_4 \\not\\cong \\mathbb{Z}_2 \\times \\mathbb{Z}_2$.',
        ],
        stepByStepExamples: [
          {
            title: 'Guided Comparison: $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$ vs $\\mathbb{Z}_4$',
            problem: 'Show explicitly why $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$ has no element of order 4 and contrast with $\\mathbb{Z}_4$.',
            steps: [
              'For any $(a, b) \\in \\mathbb{Z}_2 \\times \\mathbb{Z}_2$, $(a, b) + (a, b) = (2a \\bmod 2, 2b \\bmod 2) = (0, 0)$.',
              'Hence every non-identity element $(1,0), (0,1), (1,1)$ has order $2$, and the identity $(0,0)$ has order $1$. Maximum element order is $2$.',
              'In $\\mathbb{Z}_4$, $1+1=2 \\ne 0$, $1+1+1=3 \\ne 0$, $1+1+1+1=0$, so $\\operatorname{ord}(1) = \\operatorname{ord}(3) = 4$.',
            ],
            conclusion: 'Because $\\mathbb{Z}_4$ has 2 elements of order 4 and $\\mathbb{Z}_2 \\times \\mathbb{Z}_2$ has 0, they are non-isomorphic.',
          },
        ],
        visualConfig: {
          kind: 'direct_product',
          title: 'Comparing ℤ₂ × ℤ₂ and ℤ₄ Order Profiles',
          caption: 'Inspect every element order in ℤ₂ × ℤ₂.',
          defaultModuli: [2, 2],
        },
        commonMistakes: [
          {
            mistake: 'Thinking equal cardinality $|G| = |H|$ makes $G \\cong H$.',
            correction: 'Only prime-order groups ($|G|=p$) are unique up to isomorphism. Composite orders like $4, 6, 8, 9, 12, 72$ split into distinct structures.',
          },
        ],
        practiceExercises: [
          {
            id: 'm2-s3-ex1',
            prompt: 'How many elements of order 2 exist in $\\mathbb{Z}_2 \\times \\mathbb{Z}_4$ vs $\\mathbb{Z}_2 \\times \\mathbb{Z}_2 \\times \\mathbb{Z}_2$?',
            hint: 'Count solutions to $2x = 0$ excluding the identity.',
            answer: '$\\mathbb{Z}_2 \\times \\mathbb{Z}_4$ has $3$ elements of order 2; $\\mathbb{Z}_2^3$ has $7$ elements of order 2.',
            solutionSteps: [
              'In $\\mathbb{Z}_2 \\times \\mathbb{Z}_4$, elements satisfying $2x=0$ are $\\{0,1\\} \\times \\{0,2\\}$ (4 elements); excluding $(0,0)$ gives 3 elements of order 2.',
              'In $\\mathbb{Z}_2^3$, every non-identity element has order 2, giving $8 - 1 = 7$.',
            ],
          },
        ],
        revisionSummary: [
          'Order distribution is a decisive invariant separating non-isomorphic finite abelian groups.',
          '$\\mathbb{Z}_2 \\times \\mathbb{Z}_2$ has exponent 2 (three elements of order 2, zero of order 4).',
        ],
        keywords: ['Klein 4-group', 'isomorphism invariant', 'order 4', 'Z2 x Z2', 'Z4'],
      },
    ],
  },
  {
    id: 'm3',
    number: 3,
    title: 'Classification of Finite Abelian Groups',
    subtitle: 'Primary factors, invariant factors, partitions, and order 72',
    description:
      'Master the Fundamental Theorem of Finite Abelian Groups (Fraleigh Section 9) to classify any order into elementary divisors and invariant factors.',
    subsections: [
      {
        id: 'm3-s1',
        moduleId: 'm3',
        order: 1,
        title: 'Prime Factorization & Elementary-Divisor Form',
        level: 'Intermediate',
        estimatedMinutes: 18,
        learningObjectives: [
          'Decompose any finite abelian group into a product of cyclic groups of prime-power order.',
          'Connect integer partitions of prime exponents to distinct non-isomorphic groups.',
        ],
        prerequisites: ['Module 2: Direct Products of Cyclic Groups'],
        definitions: [
          {
            term: 'Elementary Divisors (Primary Factors)',
            formal: 'The list of prime-power moduli $p_i^{r_{ij}}$ appearing when an abelian group is decomposed into cyclic groups of prime-power orders.',
            latex: 'G \\cong \\prod_{i,j} \\mathbb{Z}_{p_i^{r_{ij}}}',
          },
        ],
        notation: [
          { symbol: '$p(e)$', meaning: 'Number of integer partitions of exponent $e$' },
        ],
        theorems: [
          {
            title: 'Fraleigh Theorem 9.12 (Fundamental Theorem — Primary-Factor Version)',
            statement: 'Every finite abelian group $G$ of order $n > 1$ is isomorphic to a direct product of cyclic groups of prime-power order, and this decomposition is unique up to rearrangement of factors.',
          },
        ],
        explanation: [
          'Just as every integer factors uniquely into primes $n = p_1^{e_1} \\cdots p_k^{e_k}$, every finite abelian group splits cleanly across its distinct primes.',
          'Within a single prime power $p^e$, the ways to split $\\mathbb{Z}_{p^e}$ correspond one-to-one with integer partitions of $e$. For $2^3 = 8$, the partitions of $3$ are $3$, $2+1$, and $1+1+1$, giving $\\mathbb{Z}_8$, $\\mathbb{Z}_4 \\times \\mathbb{Z}_2$, and $\\mathbb{Z}_2 \\times \\mathbb{Z}_2 \\times \\mathbb{Z}_2$.',
        ],
        stepByStepExamples: [
          {
            title: 'Elementary Divisors of Order $36 = 2^2 \\cdot 3^2$',
            problem: 'List all non-isomorphic abelian groups of order 36 in elementary-divisor form.',
            steps: [
              'Factor $36 = 2^2 \\cdot 3^2$.',
              'Partitions of exponent $2$ (for prime 2): $[2] \\to \\mathbb{Z}_4$ and $[1,1] \\to \\mathbb{Z}_2 \\times \\mathbb{Z}_2$.',
              'Partitions of exponent $2$ (for prime 3): $[2] \\to \\mathbb{Z}_9$ and $[1,1] \\to \\mathbb{Z}_3 \\times \\mathbb{Z}_3$.',
              'Combine every choice for 2 with every choice for 3 ($2 \\times 2 = 4$ groups).',
            ],
            conclusion: '$\\mathbb{Z}_4\\times\\mathbb{Z}_9$, $\\mathbb{Z}_4\\times\\mathbb{Z}_3\\times\\mathbb{Z}_3$, $\\mathbb{Z}_2\\times\\mathbb{Z}_2\\times\\mathbb{Z}_9$, $\\mathbb{Z}_2\\times\\mathbb{Z}_2\\times\\mathbb{Z}_3\\times\\mathbb{Z}_3$.',
          },
        ],
        visualConfig: {
          kind: 'abelian_tree_72',
          title: 'Prime-Power Partition Branching',
          caption: 'See how integer partitions of exponents multiply to count abelian groups.',
        },
        commonMistakes: [
          {
            mistake: 'Confusing $\\mathbb{Z}_2 \\times \\mathbb{Z}_6$ with an elementary-divisor decomposition.',
            correction: '$6$ is not a prime power. Split $\\mathbb{Z}_6 \\cong \\mathbb{Z}_2 \\times \\mathbb{Z}_3$, yielding elementary divisors $\\mathbb{Z}_2 \\times \\mathbb{Z}_2 \\times \\mathbb{Z}_3$.',
          },
        ],
        practiceExercises: [
          {
            id: 'm3-s1-ex1',
            prompt: 'Convert $\\mathbb{Z}_4 \\times \\mathbb{Z}_6 \\times \\mathbb{Z}_9$ into elementary-divisor form.',
            hint: 'Factor non-prime-power moduli into coprime prime powers.',
            answer: '$\\mathbb{Z}_2 \\times \\mathbb{Z}_4 \\times \\mathbb{Z}_3 \\times \\mathbb{Z}_9$.',
            solutionSteps: [
              'Split $\\mathbb{Z}_6 \\cong \\mathbb{Z}_2 \\times \\mathbb{Z}_3$ because $\\gcd(2, 3) = 1$.',
              'Keep prime powers $\\mathbb{Z}_4 = \\mathbb{Z}_{2^2}$ and $\\mathbb{Z}_9 = \\mathbb{Z}_{3^2}$ intact.',
            ],
          },
        ],
        revisionSummary: [
          'Elementary divisors are prime powers $p^r$.',
          'Number of abelian groups of order $\\prod p_i^{e_i}$ is $\\prod p(e_i)$.',
        ],
        keywords: ['elementary divisors', 'primary factors', 'partitions', 'Fundamental Theorem'],
      },
      {
        id: 'm3-s2',
        moduleId: 'm3',
        order: 2,
        title: 'Invariant-Factor Form & Divisibility Chains',
        level: 'Intermediate',
        estimatedMinutes: 18,
        learningObjectives: [
          'Convert between elementary-divisor form and invariant-factor form $d_1 \\mid d_2 \\mid \\dots \\mid d_r$.',
          'Read the exponent (maximum element order) directly from the last invariant factor $d_r$.',
        ],
        prerequisites: ['Module 3.1: Elementary Divisors'],
        definitions: [
          {
            term: 'Invariant Factors',
            formal: 'A unique chain of integers $d_1, d_2, \\dots, d_r \\ge 2$ with $d_1 \\mid d_2 \\mid \\dots \\mid d_r$ such that $G \\cong \\mathbb{Z}_{d_1} \\times \\dots \\times \\mathbb{Z}_{d_r}$.',
            latex: 'G \\cong \\mathbb{Z}_{d_1} \\times \\mathbb{Z}_{d_2} \\times \\dots \\times \\mathbb{Z}_{d_r}, \\quad d_1 \\mid d_2 \\mid \\dots \\mid d_r',
          },
        ],
        notation: [
          { symbol: '$d_1 \\mid d_2$', meaning: '$d_1$ divides $d_2$ without remainder' },
        ],
        theorems: [
          {
            title: 'Fraleigh Theorem 9.14 (Invariant-Factor Form)',
            statement: 'Every finite abelian group of order $n > 1$ is uniquely isomorphic to $\\mathbb{Z}_{d_1} \\times \\mathbb{Z}_{d_2} \\times \\dots \\times \\mathbb{Z}_{d_r}$ where each $d_i \\ge 2$ and $d_1 \\mid d_2 \\mid \\dots \\mid d_r$.',
          },
        ],
        explanation: [
          'While elementary divisors split every prime completely, invariant factors bundle distinct primes together as efficiently as possible while preserving a strict divisibility chain $d_1 \\mid d_2 \\mid \\dots \\mid d_r$.',
          'To convert from elementary divisors to invariant factors: line up the largest prime power for each prime in the rightmost column to form $d_r$, the next-largest in $d_{r-1}$, and so on, padding shorter prime chains with $1$ on the left.',
        ],
        stepByStepExamples: [
          {
            title: 'Converting $\\mathbb{Z}_2 \\times \\mathbb{Z}_4 \\times \\mathbb{Z}_3 \\times \\mathbb{Z}_9$ to Invariant Factors',
            problem: 'Find the invariant-factor representation of $\\mathbb{Z}_2 \\times \\mathbb{Z}_4 \\times \\mathbb{Z}_3 \\times \\mathbb{Z}_9$.',
            steps: [
              'For prime $2$, factors ascending are $2, 4$. For prime $3$, factors ascending are $3, 9$.',
              'Multiply corresponding right-aligned positions: $d_2 = 4 \\cdot 9 = 36$, and $d_1 = 2 \\cdot 3 = 6$.',
              'Verify divisibility: $6 \\mid 36$ and $6 \\cdot 36 = 216$.',
            ],
            conclusion: 'Invariant-factor form is $\\mathbb{Z}_6 \\times \\mathbb{Z}_{36}$, with maximum element order $36$.',
          },
        ],
        visualConfig: {
          kind: 'abelian_tree_72',
          title: 'Elementary Divisors to Invariant Factors Alignment',
          caption: 'Explore both canonical forms for order 72 side by side.',
        },
        commonMistakes: [
          {
            mistake: 'Writing $\\mathbb{Z}_4 \\times \\mathbb{Z}_{18}$ as invariant-factor form.',
            correction: 'Since $4$ does NOT divide $18$, $\\mathbb{Z}_4 \\times \\mathbb{Z}_{18}$ is not in invariant-factor form; its invariant factors are $\\mathbb{Z}_2 \\times \\mathbb{Z}_{36}$.',
          },
        ],
        practiceExercises: [
          {
            id: 'm3-s2-ex1',
            prompt: 'Convert $\\mathbb{Z}_2 \\times \\mathbb{Z}_2 \\times \\mathbb{Z}_8 \\times \\mathbb{Z}_3 \\times \\mathbb{Z}_9$ to invariant factors.',
            hint: 'Align $(2, 2, 8)$ with $(1, 3, 9)$.',
            answer: '$\\mathbb{Z}_2 \\times \\mathbb{Z}_6 \\times \\mathbb{Z}_{72}$.',
            solutionSteps: [
              'Rightmost column: $8 \\cdot 9 = 72$.',
              'Middle column: $2 \\cdot 3 = 6$.',
              'Leftmost column: $2 \\cdot 1 = 2$. Check: $2 \\mid 6 \\mid 72$.',
            ],
          },
        ],
        revisionSummary: [
          'Invariant factors satisfy $d_1 \\mid d_2 \\mid \\dots \\mid d_r$.',
          'The group is cyclic if and only if there is only one invariant factor ($r = 1$).',
        ],
        keywords: ['invariant factors', 'divisibility', 'exponent', 'canonical form'],
      },
      {
        id: 'm3-s3',
        moduleId: 'm3',
        order: 3,
        title: 'Complete Worked Classification of Order 72',
        level: 'University',
        estimatedMinutes: 20,
        learningObjectives: [
          'Derive all 6 non-isomorphic finite abelian groups of order 72 from scratch.',
          'Present both elementary-divisor and invariant-factor tables matching Fraleigh Table 9.16.',
        ],
        prerequisites: ['Module 3.1–3.2'],
        definitions: [
          {
            term: 'Partition Product Count',
            formal: 'For $72 = 2^3 \\cdot 3^2$, the total number of abelian isomorphism classes is $p(3) \\cdot p(2) = 3 \\cdot 2 = 6$.',
            latex: 'p(3) \\cdot p(2) = 3 \\times 2 = 6',
          },
        ],
        notation: [
          { symbol: '$72 = 2^3 \\cdot 3^2$', meaning: 'Prime factorization governing order 72' },
        ],
        theorems: [
          {
            title: 'Classification of Order 72',
            statement: 'There are exactly 6 non-isomorphic abelian groups of order 72: $\\mathbb{Z}_{72}$, $\\mathbb{Z}_3 \\times \\mathbb{Z}_{24}$, $\\mathbb{Z}_2 \\times \\mathbb{Z}_{36}$, $\\mathbb{Z}_6 \\times \\mathbb{Z}_{12}$, $\\mathbb{Z}_2 \\times \\mathbb{Z}_2 \\times \\mathbb{Z}_{18}$, and $\\mathbb{Z}_2 \\times \\mathbb{Z}_6 \\times \\mathbb{Z}_6$.',
          },
        ],
        explanation: [
          'This classic problem (Guided Problem 1 and Fraleigh Section 9) pulls together prime factorization, integer partitions, elementary divisors, and invariant factors into one transparent calculation.',
          'Step 1: Factor $72 = 8 \\cdot 9 = 2^3 \\cdot 3^2$. Step 2: List partitions of $3$ ($[3], [2,1], [1,1,1] \implies 3$ choices for powers of 2: $\\mathbb{Z}_8$, $\\mathbb{Z}_2 \\times \\mathbb{Z}_4$, $\\mathbb{Z}_2 \\times \\mathbb{Z}_2 \\times \\mathbb{Z}_2$) and partitions of $2$ ($[2], [1,1] \implies 2$ choices for powers of 3: $\\mathbb{Z}_9$, $\\mathbb{Z}_3 \\times \\mathbb{Z}_3$).',
          'Step 3: Form all $3 \\times 2 = 6$ combinations and convert each to invariant factors by pairing the largest prime powers right-to-left.',
        ],
        stepByStepExamples: [
          {
            title: 'All 6 Groups of Order 72 (Elementary vs Invariant Factors)',
            problem: 'Pair every partition of $2^3$ with every partition of $3^2$.',
            steps: [
              '1. $(8) \\times (9) \\to \\mathbb{Z}_8 \\times \\mathbb{Z}_9 \\cong \\mathbb{Z}_{72}$ (cyclic, max order 72).',
              '2. $(8) \\times (3, 3) \\to \\mathbb{Z}_8 \\times \\mathbb{Z}_3 \\times \\mathbb{Z}_3 \\cong \\mathbb{Z}_3 \\times \\mathbb{Z}_{24}$ (max order 24).',
              '3. $(2, 4) \\times (9) \\to \\mathbb{Z}_2 \\times \\mathbb{Z}_4 \\times \\mathbb{Z}_9 \\cong \\mathbb{Z}_2 \\times \\mathbb{Z}_{36}$ (max order 36).',
              '4. $(2, 4) \\times (3, 3) \\to \\mathbb{Z}_2 \\times \\mathbb{Z}_4 \\times \\mathbb{Z}_3 \\times \\mathbb{Z}_3 \\cong \\mathbb{Z}_6 \\times \\mathbb{Z}_{12}$ (max order 12).',
              '5. $(2, 2, 2) \\times (9) \\to \\mathbb{Z}_2^3 \\times \\mathbb{Z}_9 \\cong \\mathbb{Z}_2 \\times \\mathbb{Z}_2 \\times \\mathbb{Z}_{18}$ (max order 18).',
              '6. $(2, 2, 2) \\times (3, 3) \\to \\mathbb{Z}_2^3 \\times \\mathbb{Z}_3^2 \\cong \\mathbb{Z}_2 \\times \\mathbb{Z}_6 \\times \\mathbb{Z}_6$ (max order 6).',
            ],
            conclusion: 'Notice all 6 groups have distinct maximum element orders: 72, 24, 36, 12, 18, and 6!',
          },
        ],
        visualConfig: {
          kind: 'abelian_tree_72',
          title: 'Interactive Order 72 Classification Matrix',
          caption: 'Inspect the 3×2 partition grid generating all 6 abelian groups of order 72.',
        },
        commonMistakes: [
          {
            mistake: 'Missing $\\mathbb{Z}_6 \\times \\mathbb{Z}_{12}$ or thinking $\\mathbb{Z}_6 \\times \\mathbb{Z}_{12} \\cong \\mathbb{Z}_2 \\times \\mathbb{Z}_{36}$.',
            correction: 'In $\\mathbb{Z}_6 \\times \\mathbb{Z}_{12}$ the maximum element order is $12$, whereas $\\mathbb{Z}_2 \\times \\mathbb{Z}_{36}$ has elements of order $36$.',
          },
        ],
        practiceExercises: [
          {
            id: 'm3-s3-ex1',
            prompt: 'Which abelian group of order 72 has maximum element order 18?',
            hint: 'Notice $18 = 2 \\cdot 9$, so the prime-2 partition must be $(2,2,2)$ and prime-3 partition $(9)$.',
            answer: '$\\mathbb{Z}_2 \\times \\mathbb{Z}_2 \\times \\mathbb{Z}_{18}$ (elementary divisors $\\mathbb{Z}_2 \\times \\mathbb{Z}_2 \\times \\mathbb{Z}_2 \\times \\mathbb{Z}_9$).',
            solutionSteps: [
              'If $9 \\mid d_r$ and $2 \\mid d_r$ with $4 \\nmid d_r$, the 2-part has exponent 1 in $d_r$, forcing $[1,1,1]$.',
              'The 3-part has $9$, forcing $[2]$. Invariant factors are $\\mathbb{Z}_2 \\times \\mathbb{Z}_2 \\times \\mathbb{Z}_{18}$.',
            ],
          },
        ],
        revisionSummary: [
          '$72 = 2^3 \\cdot 3^2$ yields $p(3)p(2) = 6$ non-isomorphic abelian groups.',
          'Each of the 6 groups of order 72 is distinguished by its largest invariant factor (72, 36, 24, 18, 12, 6).',
        ],
        keywords: ['order 72', 'classification', 'Fraleigh Table 9.16', 'partitions', 'invariant factors'],
      },
    ],
  },
  {
    id: 'm4',
    number: 4,
    title: 'Permutation Groups',
    subtitle: 'Two-row notation, disjoint cycles, composition, transpositions, parity, and Aₙ',
    description:
      'Explore symmetric groups $S_n$ ($n=2,3,4,5$), right-to-left function composition, cycle lengths, and the alternating subgroup $A_n$ following Fraleigh Sections 4 and 8.',
    subsections: [
      {
        id: 'm4-s1',
        moduleId: 'm4',
        order: 1,
        title: 'Permutations, Two-Row & Cycle Notation',
        level: 'Beginner',
        estimatedMinutes: 16,
        learningObjectives: [
          'Define a permutation as a bijection $\\sigma: A \\to A$ and compute $|S_n| = n!$.',
          'Translate fluently between two-row notation and cycle notation.',
        ],
        prerequisites: ['Bijections (one-to-one and onto functions)'],
        definitions: [
          {
            term: 'Symmetric Group $S_n$',
            formal: 'The group of all permutations (bijections) of $\\{1, 2, \\dots, n\\}$ under function composition. Its order is $|S_n| = n!$.',
            latex: '|S_n| = n!',
          },
          {
            term: 'Cycle $(a_1, a_2, \\dots, a_k)$',
            formal: 'A permutation sending $a_1 \\mapsto a_2$, $a_2 \\mapsto a_3$, $\\dots$, $a_k \\mapsto a_1$, while fixing all other elements.',
            latex: '(a_1, a_2, \\dots, a_k)',
          },
        ],
        notation: [
          { symbol: '$\\iota$', meaning: 'Identity permutation in $S_n$ (Fraleigh Section 4)' },
          { symbol: '$\\begin{pmatrix} 1 & 2 & 3 \\\\ 2 & 3 & 1 \\end{pmatrix}$', meaning: 'Two-row notation mapping top element to bottom element' },
        ],
        theorems: [
          {
            title: 'Fraleigh Theorem 4.16 ($S_n$ is a Group)',
            statement: 'For every positive integer $n$, $S_n$ under permutation composition is a group of order $n!$, and $S_n$ is nonabelian for all $n \\ge 3$.',
          },
        ],
        explanation: [
          'A permutation is a rearrangement of $\\{1, 2, \\dots, n\\}$. In two-row notation, the top row lists inputs $1, 2, \\dots, n$ and directly beneath each number sits its output $\\sigma(i)$.',
          'Cycle notation tracks where an element goes step-by-step: $(1, 3, 2)$ means $1 \\to 3$, $3 \\to 2$, and $2 \\to 1$. Any element not written in a cycle (such as $4$ in $S_4$) stays fixed ($4 \\to 4$).',
        ],
        stepByStepExamples: [
          {
            title: 'Converting Two-Row to Disjoint Cycle Notation in $S_5$',
            problem: 'Convert $\\sigma = \\begin{pmatrix} 1 & 2 & 3 & 4 & 5 \\\\ 3 & 5 & 1 & 4 & 2 \\end{pmatrix}$ to disjoint cycles.',
            steps: [
              'Start at $1$: $1 \\to 3 \\to 1$, closing the 2-cycle $(1, 3)$.',
              'Next unused number is $2$: $2 \\to 5 \\to 2$, closing the 2-cycle $(2, 5)$.',
              'Next unused number is $4$: $4 \\to 4$ (fixed point, omitted in standard cycle form).',
            ],
            conclusion: '$\\sigma = (1, 3)(2, 5)$.',
          },
        ],
        visualConfig: {
          kind: 'permutation_cycle',
          title: 'Cycle Mapping Diagram',
          caption: 'Follow directed arrows inside cycles and spot fixed points.',
          defaultN: 5,
        },
        commonMistakes: [
          {
            mistake: 'Reading a cycle $(1, 2, 3)$ right-to-left inside the parentheses.',
            correction: 'Inside a single cycle, follow left-to-right ($1 \\mapsto 2 \\mapsto 3 \\mapsto 1$). Only BETWEEN separate cycles/factors do we compose right-to-left!',
          },
        ],
        practiceExercises: [
          {
            id: 'm4-s1-ex1',
            prompt: 'Write $(1, 4, 2)$ in $S_4$ in two-row notation.',
            hint: 'Element $3$ is missing from the cycle, so $3 \\mapsto 3$.',
            answer: 'Top: $1\\ 2\\ 3\\ 4$; Bottom: $4\\ 1\\ 3\\ 2$.',
            solutionSteps: [
              '$1 \\mapsto 4$, $4 \\mapsto 2$, $2 \\mapsto 1$, and $3 \\mapsto 3$.',
            ],
          },
        ],
        revisionSummary: [
          '$|S_n| = n!$, and $S_n$ is nonabelian for $n \\ge 3$.',
          'Fixed points (1-cycles) are usually omitted except when writing the identity $\\iota$ or $(1)$.',
        ],
        keywords: ['permutation', 'symmetric group', 'two-row notation', 'cycle notation'],
      },
      {
        id: 'm4-s2',
        moduleId: 'm4',
        order: 2,
        title: 'Right-to-Left Composition, Disjoint Cycles & Orders',
        level: 'Intermediate',
        estimatedMinutes: 20,
        learningObjectives: [
          'Compose permutations right-to-left using Fraleigh’s convention $(\\sigma\\tau)(x) = \\sigma(\\tau(x))$.',
          'Express any permutation as a product of disjoint cycles.',
          'Compute the order of a permutation as the $\\operatorname{lcm}$ of its disjoint cycle lengths.',
        ],
        prerequisites: ['Module 4.1: Permutation Notation'],
        definitions: [
          {
            term: 'Right-to-Left Composition',
            formal: 'For $\\sigma, \\tau \\in S_n$, $(\\sigma\\tau)(x) = \\sigma(\\tau(x))$: apply the rightmost permutation $\\tau$ first, then $\\sigma$.',
            latex: '(\\sigma\\tau)(x) = \\sigma(\\tau(x))',
          },
        ],
        notation: [
          { symbol: '$\\sigma\\tau$', meaning: 'Permutation composition applying $\\tau$ first, then $\\sigma$' },
          { symbol: '$\\operatorname{ord}(\\sigma)$', meaning: 'Smallest $m \\ge 1$ with $\\sigma^m = \\iota$, equal to $\\operatorname{lcm}$ of disjoint cycle lengths' },
        ],
        theorems: [
          {
            title: 'Fraleigh Theorem 8.9 & Order Theorem',
            statement: 'Every permutation of a finite set can be expressed as a product of disjoint cycles (which commute with one another). The order of a permutation written in disjoint cycles of lengths $L_1, \\dots, L_r$ is $\\operatorname{lcm}(L_1, \\dots, L_r)$.',
            latex: '\\operatorname{ord}(\\sigma) = \\operatorname{lcm}(L_1, L_2, \\dots, L_r)',
          },
        ],
        explanation: [
          'Because permutations are functions, Fraleigh composes them right-to-left just like $f(g(x))$. When computing $(1, 2)(1, 3)$, start with $1$: the right factor $(1, 3)$ sends $1 \\to 3$, and $(1, 2)$ fixes $3$, so $1 \\to 3$. Then $3 \\to 1 \\to 2$, and $2 \\to 2 \\to 1$, yielding $(1, 3, 2)$.',
          'Notice that $(1, 3)(1, 2) = (1, 2, 3) \\ne (1, 3, 2)$, immediately demonstrating that $S_3$ is nonabelian. Disjoint cycles, however, act on completely separate numbers and therefore DO commute, which is why the order of $\\sigma$ equals the $\\operatorname{lcm}$ of its disjoint cycle lengths.',
        ],
        stepByStepExamples: [
          {
            title: 'Composing $(1, 3, 4)(2, 5)$ with $(1, 2, 3)$ in $S_5$',
            problem: 'Compute $\\sigma\\tau$ where $\\sigma = (1, 3, 4)(2, 5)$ and $\\tau = (1, 2, 3)$, then find its order.',
            steps: [
              'Trace $1$: $\\tau(1)=2$, $\\sigma(2)=5 \\implies 1 \\mapsto 5$.',
              'Trace $5$: $\\tau(5)=5$, $\\sigma(5)=2 \\implies 5 \\mapsto 2$.',
              'Trace $2$: $\\tau(2)=3$, $\\sigma(3)=4 \\implies 2 \\mapsto 4$.',
              'Trace $4$: $\\tau(4)=4$, $\\sigma(4)=1 \\implies 4 \\mapsto 1$ (closes $(1, 5, 2, 4)$).',
              'Trace $3$: $\\tau(3)=1$, $\\sigma(1)=3 \\implies 3 \\mapsto 3$ (fixed).',
              'Result is a single 4-cycle $(1, 5, 2, 4)$, so its order is $4$.',
            ],
            conclusion: '$\\sigma\\tau = (1, 5, 2, 4)$ of order $4$.',
          },
        ],
        visualConfig: {
          kind: 'permutation_cycle',
          title: 'Step-by-Step Cycle Composition & LCM Order',
          caption: 'Watch right-to-left mapping trace each element through both permutations.',
          defaultN: 5,
        },
        commonMistakes: [
          {
            mistake: 'Taking the $\\operatorname{lcm}$ of non-disjoint cycle lengths.',
            correction: 'For example, $(1, 2)(2, 3) = (1, 2, 3)$ has order $3$, NOT $\\operatorname{lcm}(2, 2) = 2$. Always reduce to DISJOINT cycles first!',
          },
        ],
        practiceExercises: [
          {
            id: 'm4-s2-ex1',
            prompt: 'Compute $(1, 2, 3)(2, 4, 5)$ in disjoint cycle form and find its order.',
            hint: 'Remember right-to-left: evaluate $(2, 4, 5)$ first, then $(1, 2, 3)$.',
            answer: '$(1, 2, 4, 5, 3)$, which has order $5$.',
            solutionSteps: [
              '$1 \\to 1 \\to 2$; $2 \\to 4 \\to 4$; $4 \\to 5 \\to 5$; $5 \\to 2 \\to 3$; $3 \\to 3 \\to 1$.',
              'Result is a 5-cycle $(1, 2, 4, 5, 3)$, so order is $5$.',
            ],
          },
        ],
        revisionSummary: [
          'Compose permutation factors right-to-left per Fraleigh.',
          'Order formula $\\operatorname{lcm}$ applies ONLY after writing the permutation in disjoint cycle form.',
        ],
        keywords: ['right-to-left', 'disjoint cycles', 'order', 'lcm', 'composition'],
      },
      {
        id: 'm4-s3',
        moduleId: 'm4',
        order: 3,
        title: 'Transpositions, Parity & the Alternating Group $A_n$',
        level: 'University',
        estimatedMinutes: 20,
        learningObjectives: [
          'Factor any cycle into a product of transpositions (2-cycles).',
          'Determine even vs odd parity of a permutation reliably.',
          'Prove $|A_n| = n!/2$ for $n \\ge 2$ and verify $|A_5| = 60$.',
        ],
        prerequisites: ['Module 4.2: Disjoint Cycles & Orders'],
        definitions: [
          {
            term: 'Transposition',
            formal: 'A 2-cycle $(a, b)$ that swaps two elements and fixes all others.',
          },
          {
            term: 'Even / Odd Permutation & Alternating Group $A_n$',
            formal: 'A permutation is even (respectively odd) if it factors as an even (respectively odd) number of transpositions. For $n \\ge 2$, the subgroup $A_n$ of all even permutations in $S_n$ has order $n!/2$.',
            latex: '|A_n| = \\frac{n!}{2} \\quad (n \\ge 2)',
          },
        ],
        notation: [
          { symbol: '$A_n$', meaning: 'Alternating group on $n$ letters (all even permutations)' },
          { symbol: '$(a_1, a_k)\\cdots(a_1, a_2)$', meaning: 'Fraleigh transposition expansion of $(a_1, a_2, \\dots, a_k)$' },
        ],
        theorems: [
          {
            title: 'Fraleigh Theorem 8.15 (Parity Theorem) & Theorem 8.16 ($A_n$)',
            statement: 'No permutation in $S_n$ can be expressed both as a product of an even number of transpositions and as a product of an odd number of transpositions. For $n \\ge 2$, the collection $A_n$ of all even permutations forms a subgroup of $S_n$ of order $n!/2$.',
          },
        ],
        explanation: [
          'Every $k$-cycle factors into $k - 1$ transpositions: $(a_1, a_2, \\dots, a_k) = (a_1, a_k)(a_1, a_{k-1}) \\cdots (a_1, a_2)$. Therefore, an even-length cycle (like a 2-cycle or 4-cycle) is ODD, while an odd-length cycle (like a 3-cycle or 5-cycle) is EVEN!',
          'This counterintuitive naming trips up many beginners: a $3$-cycle needs $3 - 1 = 2$ transpositions, so a $3$-cycle is an EVEN permutation. Overall, a permutation is odd precisely when its disjoint cycle form contains an odd number of even-length cycles.',
        ],
        stepByStepExamples: [
          {
            title: 'Guided Problem: Order-6 Element in $S_5$ & Counting $A_5$',
            problem: 'Find an element of order 6 in $S_5$, determine its parity, and count even permutations in $S_5$.',
            steps: [
              'To get $\\operatorname{lcm}(L_1, L_2) = 6$ inside $S_5$, cycle lengths must sum to $\\le 5$: choose a 3-cycle and a disjoint 2-cycle, e.g., $\\sigma = (1, 2, 3)(4, 5)$.',
              'Order is $\\operatorname{lcm}(3, 2) = 6$.',
              'Factor into transpositions: $(1, 2, 3)(4, 5) = (1, 3)(1, 2)(4, 5)$ — that is $3$ transpositions (odd count). Hence $\\sigma$ is an ODD permutation.',
              'Total permutations in $S_5$ is $5! = 120$. Half are even, so $|A_5| = 120 / 2 = 60$ even permutations (and 60 odd).',
            ],
            conclusion: '$(1, 2, 3)(4, 5)$ has order 6 and is odd; $S_5$ contains 60 even and 60 odd permutations.',
          },
        ],
        visualConfig: {
          kind: 'permutation_cycle',
          title: 'Transposition Decomposition & Parity Inspector',
          caption: 'Split disjoint cycles into transpositions and verify parity in S_n.',
          defaultN: 5,
        },
        commonMistakes: [
          {
            mistake: 'Thinking a 3-cycle is odd because 3 is an odd number.',
            correction: 'Parity counts transpositions ($k - 1$), not cycle length $k$. A 3-cycle uses $3 - 1 = 2$ transpositions, so it is EVEN.',
          },
        ],
        practiceExercises: [
          {
            id: 'm4-s3-ex1',
            prompt: 'Is $\\sigma = (1, 2, 3, 4)(2, 5)$ in $S_5$ even or odd?',
            hint: 'Count transpositions directly without even needing disjoint cycles (or convert first): $3 + 1 = 4$.',
            answer: 'Even (4 transpositions; in disjoint form it is the 5-cycle $(1, 5, 2, 3, 4)$).',
            solutionSteps: [
              '$(1, 2, 3, 4)$ needs $3$ transpositions; $(2, 5)$ is $1$ transposition; total = $4$ (even).',
              'Check via disjoint composition: $(1, 2, 3, 4)(2, 5) = (1, 2, 3, 4)$? Trace: $1\\to 2$, $2\\to 5\\to 5$, wait: $2\\to 5$, $5\\to 2\\to 3$, $3\\to 4$, $4\\to 1$, so $(1, 2, 5, 3, 4)$, a 5-cycle ($5-1 = 4$ transpositions, even).',
            ],
          },
        ],
        revisionSummary: [
          'A $k$-cycle factors into $k - 1$ transpositions.',
          '$|A_n| = n!/2$ for $n \\ge 2$; $|A_5| = 60$.',
        ],
        keywords: ['transposition', 'parity', 'even permutation', 'odd permutation', 'alternating group', 'A5'],
      },
    ],
  },
];
