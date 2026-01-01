# GolfSettled MVP — Engineer Onboarding

> **Version:** 0.1.0
> **Last Updated:** 2025-01-01
> **Time to Complete:** ~30 minutes

---

## 👋 Welcome

Welcome to the GolfSettled MVP project! This guide will get you up and running quickly.

**What we're building:** A PWA-first golf betting tracker that helps casual golf groups track Nassau, Skins, and friendly wagers. No real money handling — users settle offline.

**Timeline:** 30-day MVP

---

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] **Node.js 20+** — `node --version`
- [ ] **npm 10+** — `npm --version`
- [ ] **Git** — `git --version`
- [ ] **VS Code** (recommended) or preferred editor
- [ ] **Firebase CLI** — `npm install -g firebase-tools`
- [ ] **Vercel CLI** (optional) — `npm install -g vercel`

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/[org]/golfsettled-mvp.git
cd golfsettled-mvp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Edit with your Firebase credentials
# (Get these from project lead or Firebase Console)
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the app.

### 5. Start Firebase Emulators (Optional)

```bash
npm run emulators
```

Open [http://localhost:4000](http://localhost:4000) for Emulator UI.

---

## 📂 Project Structure

```
golfsettled-mvp/
├── src/
│   ├── app/              # Next.js pages (App Router)
│   ├── components/       # React components
│   ├── lib/              # Business logic & utilities
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript definitions
├── functions/            # Cloud Functions
├── public/               # Static assets
├── docs/                 # Documentation (YOU ARE HERE)
└── __tests__/            # Test files
```

**Key Files:**
- `CLAUDE.md` — AI assistant configuration
- `docs/ARCHITECTURE.md` — System design
- `docs/BETTING_RULES.md` — Golf betting logic
- `docs/DATA_MODEL.md` — Firestore schema
- `docs/ENGINEERING_ROLES.md` — Role assignments

---

## 📖 Required Reading

Before writing code, read these documents:

| Priority | Document | Time |
|----------|----------|------|
| 🔴 Critical | `CLAUDE.md` | 5 min |
| 🔴 Critical | `docs/ENGINEERING_ROLES.md` | 10 min |
| 🔴 Critical | Your role's super prompt | 10 min |
| 🟠 High | `docs/ARCHITECTURE.md` | 10 min |
| 🟠 High | `docs/SECURITY.md` | 10 min |
| 🟡 Medium | `docs/DATA_MODEL.md` | 15 min |
| 🟡 Medium | `docs/BETTING_RULES.md` | 15 min |
| 🟢 Low | `docs/TESTING.md` | 10 min |

---

## 🔧 Development Workflow

### Branch Strategy

```
main          # Production (auto-deploys)
  └── dev     # Integration branch
       └── feat/[feature-name]   # Your work
```

### Creating a Feature Branch

```bash
# Start from dev
git checkout dev
git pull origin dev

# Create feature branch
git checkout -b feat/[your-feature]
```

### Daily Workflow

1. **Pull latest changes**
   ```bash
   git pull origin dev
   ```

2. **Do your work**
   - Write code
   - Write tests
   - Update documentation

3. **Before committing**
   ```bash
   npm run lint        # Fix any issues
   npm run typecheck   # Fix any issues
   npm test           # Ensure tests pass
   ```

4. **Commit with conventional commits**
   ```bash
   git add .
   git commit -m "feat(scorecard): add hole-by-hole input"
   ```

5. **Push and create PR**
   ```bash
   git push origin feat/[your-feature]
   # Create PR on GitHub
   ```

### Commit Message Format

```
<type>(<scope>): <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

Examples:
feat(nassau): implement auto-press calculation
fix(auth): handle expired magic links
docs(readme): add setup instructions
```

---

## 🧪 Running Tests

```bash
# All tests
npm test

# Watch mode (during development)
npm test -- --watch

# With coverage
npm test -- --coverage

# Specific file
npm test -- nassau.test.ts
```

---

## 🔐 Security Checklist

Before every commit:

- [ ] No `.env` files staged
- [ ] No API keys in code
- [ ] No `console.log` with sensitive data
- [ ] `.gitignore` up to date

See `docs/SECURITY.md` for full guidelines.

---

## 📱 Testing on Mobile

### Local Testing

1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Start dev server: `npm run dev`
3. On phone, visit: `http://[YOUR-IP]:3000`

### PWA Testing

1. Build production: `npm run build`
2. Start production server: `npm start`
3. Open in Chrome, check "Installable" in DevTools → Application

---

## 🔥 Firebase Setup

### Emulator Suite

The emulator lets you develop without affecting production data.

```bash
# Start all emulators
npm run emulators

# Emulator UI: http://localhost:4000
# Auth emulator: http://localhost:9099
# Firestore emulator: http://localhost:8080
```

### Deploying Security Rules

```bash
# Deploy to staging/dev
firebase deploy --only firestore:rules --project dev

# Deploy to production (requires approval)
firebase deploy --only firestore:rules --project prod
```

---

## 🛠️ VS Code Setup

### Recommended Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- Firebase Explorer
- GitLens

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

---

## 🤖 Using AI Assistance (Claude Code)

This project uses `CLAUDE.md` to configure AI assistance.

### Best Practices

1. **Read your role's super prompt first** — It has specific instructions
2. **Don't let AI auto-commit** — Always review changes
3. **Verify AI suggestions** — Especially for betting logic
4. **Keep context small** — AI works better with focused tasks

### Security

Never paste these into AI prompts:
- API keys
- Firebase credentials
- User data
- Passwords

---

## 📊 Role Assignments

| Role | Responsibility | Super Prompt |
|------|----------------|--------------|
| Manager Engineer | Repo setup, tooling | `prompts/MANAGER_ENGINEER_PROMPT.md` |
| Security Engineer | Auth, rules | `prompts/SECURITY_ENGINEER_PROMPT.md` |
| Backend Engineer | Firestore, functions | `prompts/BACKEND_ENGINEER_PROMPT.md` |
| Frontend Engineer | UI components | `prompts/FRONTEND_ENGINEER_PROMPT.md` |
| PWA Engineer | Offline, sync | `prompts/PWA_ENGINEER_PROMPT.md` |
| Betting Logic Engineer | Calculations, tests | `prompts/BETTING_ENGINEER_PROMPT.md` |

Find your role in `docs/ENGINEERING_ROLES.md` and read your super prompt.

---

## ❓ FAQ

### How do I get Firebase credentials?

Contact the project lead or check the team's password manager.

### How do I test offline functionality?

1. Open Chrome DevTools
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Test your feature

### How do I run just my tests?

```bash
npm test -- --testPathPattern=[your-area]

# Examples:
npm test -- --testPathPattern=nassau
npm test -- --testPathPattern=components
```

### Where do I put new components?

```
src/components/
├── ui/           # Generic (Button, Card, Input)
├── layout/       # Layout (Header, Nav, Screen)
├── match/        # Match-specific
├── scorecard/    # Scorecard-specific
├── results/      # Results-specific
└── ledger/       # Ledger-specific
```

### How do I add a new page?

Create a folder in `src/app/`:

```
src/app/
└── my-feature/
    └── page.tsx    # This becomes /my-feature route
```

### What if I break something?

1. Don't panic
2. Run tests to identify what broke
3. Check git diff to see your changes
4. Revert if needed: `git checkout -- [file]`
5. Ask for help if stuck

---

## 📞 Getting Help

1. **Check the docs** — Answer might be in `docs/`
2. **Search existing code** — Similar pattern might exist
3. **Ask in team chat** — Someone probably knows
4. **Create a discussion** — For architectural questions

---

## ✅ Onboarding Checklist

Complete these steps:

- [ ] Clone repo and install dependencies
- [ ] Set up `.env.local` with credentials
- [ ] Run `npm run dev` successfully
- [ ] Run `npm test` successfully
- [ ] Read `CLAUDE.md`
- [ ] Read `docs/ENGINEERING_ROLES.md`
- [ ] Read your role's super prompt
- [ ] Read `docs/SECURITY.md`
- [ ] Set up VS Code extensions
- [ ] Create a test branch and PR (practice)

---

## 🎉 You're Ready!

Once you've completed the checklist, you're ready to start contributing. Check `docs/ROADMAP.md` for current priorities and pick up a task from your role's backlog.

Welcome to the team! 🏌️‍♂️

---

*If anything in this guide is unclear or outdated, please update it!*
