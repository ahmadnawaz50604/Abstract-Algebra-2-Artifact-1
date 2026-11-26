# AlgebraLab — Interactive Abstract Algebra Learning Platform (Artifact 1)

AlgebraLab is a university-level Algebra II interactive platform focused strictly on **Artifact 1** (Modules 1–8):

- Fundamentals of Finite Groups & Subgroups
- Finite Abelian Groups & Classification of Groups of Order 72
- Permutation Groups ($S_n$, $A_n$), Cycle Decomposition, Parity & Orbits
- Dihedral Groups ($D_n$) using canonical identity `1`, rotation $\rho$, and reflection $\mu$ ($\rho^n = 1$, $\mu^2 = 1$, $\rho^k\mu = \mu\rho^{n-k}$)
- Cyclic Groups, Generators, Subgroup Lattices & Euler's $\varphi(n)$
- Cayley Table Analyzer, Timed Mock Exam, Personal Revision Centre & Optional AI Mathematics Tutor

---

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` (optional, required only for the AI Mathematics Tutor) and `SESSION_SECRET`.
3. Start the local full-stack server (Express API + Vite on port `3000`):
   ```bash
   npm run dev
   ```

---

## Deploying to Vercel from GitHub

Vercel builds the Vite frontend into `dist/` and runs the Express `/api/*` backend via `api/index.ts` and `vercel.json`.

1. Push the repository to GitHub (make sure `vercel.json`, `api/index.ts`, `package.json`, `vite.config.ts`, `index.html`, `server.ts`, and `src/` are all included).
2. Import the GitHub repository in **Vercel**:
   - **Framework Preset**: `Vite` (detected automatically from `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add **Environment Variables** in Vercel Project Settings:
   - `GEMINI_API_KEY` — required if using the AI Mathematics Tutor (`/api/tutor`)
   - `SESSION_SECRET` — recommended 32+ character random string for stable session cookies across serverless instances
4. Deploy.

> **Note on storage in Vercel Serverless**: Because Vercel serverless functions have a read-only project directory, `server.ts` stores runtime session data in `/tmp/algebralab-data` with an in-memory fallback. Demo accounts reset when serverless instances recycle, while guest progress also persists in browser `localStorage`.

---

## Demo Accounts

- **Student**: `amina.rashid@university.edu` / `AlgebraStudent!2026`
- **Teacher**: `prof.halima@university.edu` / `AlgebraFaculty!2026`
