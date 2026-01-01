# CLAUDE.md — GolfSettled MVP

> **Project:** Golf side-bet / ledger PWA  
> **Scope:** Solo builder MVP — no payments, no app stores, offline-first  
> **Updated:** Auto-maintain as project evolves

---

## 🎯 WHY — Project Purpose

This is a **social betting tracker** for casual golf groups. It tracks Nassau, Skins, and other friendly wagers without handling real money. Users settle offline via Venmo/cash.

**Legal bright line:** No escrow, no payment processing, no rake. The app is a scorecard and IOU ledger only.

**Success criteria:** Functional validation with 5-10 real users over 30 days.

---

## 🔧 WHAT — Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | Next.js 14 (App Router) + TypeScript | PWA via `next-pwa` |
| Styling | Tailwind CSS | Mobile-first |
| Auth | Firebase Auth | Magic link + Google OAuth |
| Database | Cloud Firestore | Offline persistence enabled |
| Functions | Cloud Functions for Firebase | Bet calcs, audit logging |
| Hosting | Vercel | Auto-deploy from `main` |
| Monitoring | Sentry (errors) + Firebase Analytics | Free tiers |

**Key files:**
- `/src/lib/firebase.ts` — Firebase client initialization
- `/src/lib/bets/` — Bet calculation logic (Nassau, Skins)
- `/src/components/` — React components
- `/firestore.rules` — Security rules

---

## ⚙️ HOW — Development Workflow

### Commands

```bash
# Development
npm run dev          # Start local dev server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check

# Firebase
npm run emulators    # Start Firebase Local Emulator Suite
npm run deploy:rules # Deploy Firestore security rules
npm run deploy:functions # Deploy Cloud Functions

# Testing
npm run test         # Run test suite
npm run test:watch   # Watch mode
```

### Branch Strategy

- `main` — Production (auto-deploys to Vercel)
- `dev` — Integration branch
- Feature branches: `feat/[feature-name]`

**Never commit directly to `main`.**

---

## 🛡️ SECURITY — Non-Negotiable Practices

### Secrets Management

**CRITICAL:** Never expose API keys, tokens, or credentials.

```bash
# These files MUST be in .gitignore
.env
.env.*
.env.local
*.pem
*.key
secrets/
config/credentials.json
firebase-admin-key.json
```

**Before ANY commit:**
1. Check `git status` for sensitive files
2. Verify `.gitignore` includes all secret patterns
3. Never hardcode tokens — use environment variables
4. Never log sensitive data (passwords, API keys, PII)

**If secrets are accidentally committed:**
1. STOP — do not push
2. Rotate the exposed credentials immediately
3. Use `git filter-repo` or BFG Repo-Cleaner to purge history
4. Notify if already pushed to remote

### Firestore Security

- Security rules must enforce authentication
- RLS-style access control on all collections
- Audit log writes via Cloud Functions only (not client)
- Rate limiting on sensitive operations

### Input Validation

- Validate all user inputs with Zod schemas
- Sanitize before database writes
- Never trust client-side data

### Claude Code Security Settings

Create `.claude/settings.json` to protect sensitive files:

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./**/firebase-admin*.json)",
      "Read(./**/*serviceAccount*.json)"
    ]
  }
}
```

Add `.claude/settings.local.json` to `.gitignore` for personal overrides.

---

## 📁 CODE HYGIENE — Avoid Bloat and Tech Debt

### Update Existing Files First

**CRITICAL:** Before creating ANY new file, check if functionality already exists.

1. **Search first:** `grep`, `find`, or use codebase search
2. **Extend existing:** Add to existing files/components when possible
3. **Refactor often:** Clean up as you go, not "later"
4. **Delete dead code:** Remove unused imports, functions, files

### Anti-Bloat Rules

- ❌ **NEVER** create duplicate components with slight variations
- ❌ **NEVER** copy-paste code — extract to shared utilities
- ❌ **NEVER** create new files for one-off functions — add to existing utils
- ✅ **ALWAYS** check if similar functionality exists before coding
- ✅ **ALWAYS** refactor when you see repeated patterns
- ✅ **ALWAYS** remove console.logs before committing

### Refactoring Triggers

Refactor immediately when you see:
- Same logic in 2+ places → Extract to shared function
- Component > 200 lines → Split into smaller components
- File has unrelated functions → Reorganize by domain
- Unused imports/variables → Delete them
- Type `any` creeping in → Add proper types

### Incremental Changes

- Make small, focused changes (< 200 lines per commit)
- Run tests after each change
- Verify nothing broke before moving on
- Use `git diff` to review before committing

---

## 📚 DOCUMENTATION — Keep It Current

### Documentation Folder Structure

```
docs/
├── ARCHITECTURE.md     # System design, data flow
├── BETTING_RULES.md    # Nassau, Skins, Press mechanics
├── DATA_MODEL.md       # Firestore schema and security
├── LEGAL.md            # Disclaimers and compliance
├── ROADMAP.md          # Current plans and progress
├── CHANGELOG.md        # What changed and when
└── API.md              # Endpoint documentation (if any)
```

### Documentation Requirements

**Update docs when:**
- Adding a new feature → Update ROADMAP.md, CHANGELOG.md
- Changing data model → Update DATA_MODEL.md
- Modifying architecture → Update ARCHITECTURE.md
- Completing a task → Mark done in ROADMAP.md with timestamp

**ROADMAP.md Format:**
```markdown
## In Progress 🏗️
- [ ] Feature name — Description (started: 2025-01-01)

## Completed ✅
- [x] Feature name — Description (completed: 2025-01-01)

## Backlog
- [ ] Future feature — Description
```

**CHANGELOG.md Format:**
```markdown
## [Unreleased]
### Added
- New feature description

### Changed
- What was modified

### Fixed
- Bug that was fixed
```

### Self-Maintaining Documentation

After completing any feature:
1. Update ROADMAP.md — mark task complete with date
2. Update CHANGELOG.md — describe what changed
3. Update relevant docs if behavior changed
4. Update CLAUDE.md if new patterns emerged

---

## 📋 RULES — Non-Negotiable Behaviors

### 1. No Fabrication

- **NEVER** invent APIs, package names, pricing, or legal claims
- **NEVER** assume Firebase/Vercel limits or costs — verify first
- **NEVER** guess at golf betting rules — ask or cite source
- If uncertain, say: *"I don't know — this needs verification"*

### 2. MVP First

- Optimize for **speed and simplicity**, not perfection
- Prefer the **simplest working solution** over "best practices"
- If something can be deferred or done manually, say so
- No premature abstractions or over-engineering

### 3. Solo Builder Constraints

Assume at all times:
- One developer
- Limited time and budget
- No legal team, no design team
- No premature scaling

### 4. Explicit Tradeoffs

When recommending a solution, always state:
- Why it's chosen
- What it sacrifices
- What breaks if we scale later

### 5. No Scope Creep

- Do not add features, systems, or complexity unless explicitly asked
- Label anything optional as "Nice-to-have / Post-MVP"
- Push back on feature requests that don't serve the 30-day goal

### 6. No Legal or Financial Advice

You are not a lawyer or CPA. Flag risks; do not give advice.

Use phrases like:
- *"Potential legal risk — requires review if monetized"*
- *"Likely acceptable for MVP / personal use"*
- *"Consult a professional before launch"*

### 7. Verification Before Coding

Before writing code:
1. **Ask clarifying questions** if requirements are ambiguous
2. **Draft and confirm approach** for complex tasks
3. **Check existing code** for patterns to reuse

### 8. Test-Driven Development

TDD is the best counter to hallucination and scope drift:
1. Write the test first (with expected inputs/outputs)
2. Confirm tests fail
3. Implement the minimal code to pass
4. Refactor if needed

### 9. Commit Discipline

- **NEVER commit unless explicitly asked**
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`
- **NEVER mention Claude/Anthropic in commit messages**

### 10. Output Quality

Before finishing any task:
1. Run `npm run lint`
2. Run `npm run typecheck`
3. Run relevant tests
4. Verify changes don't break existing functionality

---

## 🚫 NEVER DO

- Invent examples, companies, or trademarks
- Add "helpful" features not requested
- Generate enterprise-grade solutions for MVP problems
- Use `any` types in TypeScript without explicit approval
- Skip offline-first considerations
- Build payment integrations (legal red line)
- Auto-commit without explicit instruction

---

## ✅ ALWAYS DO

- Ask for clarification before big assumptions
- Reference prior decisions in this project
- State when verification is needed (domain, trademark, API)
- Keep responses concise and actionable
- Prefer checklists, tables, and step-by-step plans over prose
- Test offline behavior for any UI feature

---

## 🔗 Project References

When you need more context, read these files:

| File | Purpose |
|------|---------|
| `docs/ROADMAP.md` | Current plans, progress, and backlog |
| `docs/ARCHITECTURE.md` | System design and data flow |
| `docs/BETTING_RULES.md` | Nassau, Skins, Press mechanics |
| `docs/DATA_MODEL.md` | Firestore schema and security |
| `docs/LEGAL.md` | Disclaimers and compliance notes |
| `docs/CHANGELOG.md` | What changed and when |
| `.env.example` | Required environment variables |

**Before starting any task:**
1. Check `docs/ROADMAP.md` for current priorities
2. Update it when you complete work

---

## 🎨 Code Style

- **ES Modules** (import/export), not CommonJS (require)
- **Destructure imports** where possible
- **Functional components** with hooks
- **Tailwind** for styling — no separate CSS files
- **Comments** only when code intent is non-obvious
- **Single responsibility** — one function does one thing

---

## 📞 Escalation

If blocked, state clearly:
1. What's missing
2. What needs verification
3. The smallest unblock path

Example: *"I need to verify Firebase Auth magic link quotas before recommending this approach. Should I search for the current limits?"*

---

## 🧠 Shortcut Commands

When I say these keywords, follow the corresponding workflow:

| Keyword | Meaning |
|---------|---------|
| `qplan` | Analyze similar code in repo, confirm approach is consistent and minimal |
| `qcode` | Implement plan, run tests, lint, typecheck |
| `qcheck` | Review as a skeptical senior engineer — check MVP fit, simplicity, test coverage |
| `qship` | Stage changes, write commit message (don't push), summarize what's ready |

---

*This file is a living document. Update it as the project evolves.*
