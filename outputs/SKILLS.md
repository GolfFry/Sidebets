# SKILLS.md — Claude Code Enablement for GolfSettled MVP

> Defines what Claude is **allowed**, **expected**, and **forbidden** to do when writing code for this project.

---

## 🟢 ALLOWED — Claude Can Do These

### Code Generation

- ✅ Generate React components with TypeScript
- ✅ Write Firebase/Firestore queries and security rules
- ✅ Create utility functions and hooks
- ✅ Write Jest/Vitest test files
- ✅ Generate TypeScript interfaces and types
- ✅ Create API route handlers (Next.js App Router)
- ✅ Write Tailwind-styled components

### Refactoring

- ✅ Simplify complex functions into smaller units
- ✅ Extract reusable hooks and utilities
- ✅ Convert class components to functional (if encountered)
- ✅ Remove dead code and unused imports
- ✅ Improve type safety

### Schema & Data

- ✅ Propose Firestore collection schemas
- ✅ Write security rules with RLS-style access control
- ✅ Design TypeScript interfaces for data models
- ✅ Create mock data for testing

### Documentation

- ✅ Write JSDoc comments for complex functions
- ✅ Update README with setup instructions
- ✅ Document API contracts and data flows
- ✅ Create inline comments for non-obvious logic

### Library Suggestions

- ✅ Recommend npm packages for specific problems
- ✅ Compare library tradeoffs (with verification caveat)
- ✅ Suggest Firebase SDK patterns

---

## 🛡️ SECURITY SKILLS

### Pre-Commit Security Check

Before any commit, verify:
- [ ] No `.env` files in staged changes
- [ ] No hardcoded API keys, tokens, or secrets
- [ ] No Firebase admin credentials in client code
- [ ] `.gitignore` includes all sensitive patterns
- [ ] No `console.log` with sensitive data

### Sensitive File Patterns (Must be in .gitignore)

```gitignore
# Environment
.env
.env.*
.env.local
.env.production

# Keys and certificates
*.pem
*.key
*.p12
*.pfx

# Firebase
firebase-admin-key.json
serviceAccountKey.json
*-firebase-adminsdk-*.json

# Secrets directories
secrets/
.secrets/
config/credentials.json

# Local settings
.claude/settings.local.json
*.local.json
```

### Security Rules for Code

```typescript
// ✅ GOOD: Environment variables
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// ❌ BAD: Hardcoded secrets
const apiKey = "AIzaSyC1234567890abcdefg";

// ✅ GOOD: Server-side only secrets
// In Cloud Functions only, never client
const adminKey = process.env.FIREBASE_ADMIN_KEY;

// ❌ BAD: Admin credentials in client bundle
import serviceAccount from './firebase-admin-key.json';
```

### Firestore Security Rules Checklist

- [ ] All reads require authentication (`request.auth != null`)
- [ ] Users can only read their own data or shared data
- [ ] Writes validate data types and ranges
- [ ] Audit logs are write-protected (Cloud Functions only)
- [ ] No public write access to any collection
- [ ] Rate limiting on sensitive operations

---

## 🧹 CODE HYGIENE SKILLS

### Before Creating Any New File

1. **Search for existing:** `grep -r "functionName" src/`
2. **Check related files:** Look in `lib/`, `utils/`, `hooks/`
3. **Ask:** "Can this extend an existing file?"
4. **Only create new** if genuinely distinct functionality

### Refactoring Checklist

Run this mental checklist often:

```
□ Is there duplicated code? → Extract to shared function
□ Is this file > 200 lines? → Split into smaller modules
□ Are there unused imports? → Delete them
□ Are there `any` types? → Add proper TypeScript types
□ Are there console.logs? → Remove before commit
□ Is there dead code? → Delete it
□ Is naming clear? → Rename if ambiguous
```

### Code Consolidation Patterns

```typescript
// ❌ BAD: Duplicate logic in multiple components
// ScoreCard.tsx
const formatScore = (score: number) => score > 0 ? `+${score}` : score.toString();

// Leaderboard.tsx  
const displayScore = (score: number) => score > 0 ? `+${score}` : score.toString();

// ✅ GOOD: Extract to shared utility
// lib/utils/format.ts
export function formatScoreDisplay(score: number): string {
  return score > 0 ? `+${score}` : score.toString();
}
```

### File Organization Rules

| When you have... | Do this... |
|------------------|------------|
| 3+ similar components | Create a shared base component |
| 3+ utility functions for one domain | Create `lib/[domain]/index.ts` |
| Types scattered across files | Consolidate in `types/[domain].ts` |
| Tests alongside source | Move to `__tests__/` mirror structure |

---

## 📚 DOCUMENTATION SKILLS

### When to Update Docs

| Event | Update |
|-------|--------|
| New feature added | ROADMAP.md, CHANGELOG.md |
| Bug fixed | CHANGELOG.md |
| Schema changed | DATA_MODEL.md |
| New betting rule | BETTING_RULES.md |
| Architecture change | ARCHITECTURE.md |
| Task completed | ROADMAP.md with ✅ and date |

### ROADMAP.md Management

```markdown
# Project Roadmap

## In Progress 🏗️
- [ ] Score entry offline sync — Started 2025-01-01

## Up Next
- [ ] Nassau auto-press calculations
- [ ] Shareable results card

## Completed ✅
- [x] Firebase Auth setup — Completed 2025-01-01
- [x] PWA manifest — Completed 2025-01-02
```

### CHANGELOG.md Management

```markdown
# Changelog

All notable changes to this project.

## [Unreleased]

### Added
- Hole-by-hole score entry component
- Offline persistence for scores

### Changed
- Improved tap targets for mobile

### Fixed
- Score sync conflict resolution

## [0.1.0] - 2025-01-15

### Added
- Initial Firebase Auth integration
- Basic match creation flow
```

### Self-Documentation Workflow

After completing any task:
1. **Update ROADMAP.md** — Mark `[x]` with completion date
2. **Update CHANGELOG.md** — Add to [Unreleased] section
3. **Update feature docs** — If behavior changed
4. **Update CLAUDE.md** — If new patterns worth remembering

---

## 🔴 FORBIDDEN — Claude Must NOT Do These

### Fabrication

- ❌ Invent API endpoints or package names
- ❌ Assume Firebase pricing, quotas, or limits without verification
- ❌ Make up golf betting rules — use documented sources
- ❌ Create fake examples with real company/trademark names

### Over-Engineering

- ❌ Add abstraction layers "for future scalability"
- ❌ Implement design patterns beyond MVP needs
- ❌ Create service layers, repositories, or DDD patterns
- ❌ Add caching without explicit need
- ❌ Optimize prematurely

### Legal Red Lines

- ❌ Build any payment processing, escrow, or money handling
- ❌ Create automated settlement features
- ❌ Implement rake/fee calculations
- ❌ Add prize pool or tournament payout logic
- ❌ Deep-link to payment apps with pre-filled amounts

### Security Anti-Patterns

- ❌ Store API keys in client-side code
- ❌ Expose Firebase Admin SDK to client
- ❌ Skip authentication checks in security rules
- ❌ Log sensitive user data (email, full IP)
- ❌ Use `any` type to bypass TypeScript checks

### Scope Violations

- ❌ Add features not explicitly requested
- ❌ Create additional screens/routes without approval
- ❌ Implement analytics beyond basic Firebase Analytics
- ❌ Build admin dashboards or moderator tools
- ❌ Add social features (comments, reactions) beyond MVP

---

## 📐 CODING EXPECTATIONS

### TypeScript Standards

```typescript
// ✅ GOOD: Explicit types, narrow interfaces
interface Score {
  holeNumber: number;
  strokes: number;
  participantId: string;
}

// ❌ BAD: any, unknown without narrowing
const processScore = (data: any) => { ... }
```

### React Patterns

```tsx
// ✅ GOOD: Functional component with typed props
interface ScoreCardProps {
  matchId: string;
  readonly: boolean;
}

export function ScoreCard({ matchId, readonly }: ScoreCardProps) {
  const [scores, setScores] = useState<Score[]>([]);
  // ...
}

// ❌ BAD: Class components, untyped props
class ScoreCard extends React.Component { ... }
```

### Firebase Patterns

```typescript
// ✅ GOOD: Typed Firestore helpers
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function getMatch(matchId: string): Promise<Match | null> {
  const docRef = doc(db, 'matches', matchId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as Match : null;
}

// ❌ BAD: Untyped, no error handling
const match = await db.collection('matches').doc(id).get();
```

### Error Handling

```typescript
// ✅ GOOD: Graceful degradation, user-friendly messages
try {
  const scores = await fetchScores(matchId);
  return scores;
} catch (error) {
  console.error('Failed to fetch scores:', error);
  return []; // Graceful fallback
}

// ❌ BAD: Silent failures, exposed stack traces
const scores = await fetchScores(matchId); // No try/catch
```

### Testing Patterns

```typescript
// ✅ GOOD: Descriptive test names, clear assertions
describe('calculateNassauPayout', () => {
  it('returns correct payout when Player A wins all segments', () => {
    const result = calculateNassauPayout({
      frontNine: { winner: 'A', margin: 3 },
      backNine: { winner: 'A', margin: 2 },
      overall: { winner: 'A', margin: 5 },
      unitValue: 5,
    });
    
    expect(result.netPayout).toBe(15); // 3 segments × $5
  });
});
```

---

## 🏗️ ARCHITECTURE CONSTRAINTS

### Offline-First Priority

Every UI feature must consider offline behavior:

1. **Score entry** — Works offline, syncs when connected
2. **View match** — Cache-first, stale-while-revalidate
3. **Create match** — Draft mode offline, syncs when online
4. **Invites** — Requires network (show clear error)

```typescript
// ✅ GOOD: Offline-aware component
function ScoreEntry() {
  const isOnline = useOnlineStatus();
  const [pendingSync, setPendingSync] = useState(false);
  
  // Show sync status to user
  if (pendingSync && !isOnline) {
    return <SyncPendingBanner />;
  }
}
```

### Mobile-First UI

- Minimum tap target: **48×48dp**
- Minimum font size: **16px** base, **18px** for scores
- All critical actions in **thumb zone**
- Maximum **3 taps** per hole for score entry

### PWA Requirements

- Service worker caches all critical assets
- Installable on iOS and Android
- Works without network for core flows
- Shows clear offline/online status

---

## 🧪 VERIFICATION CHECKLIST

Before marking any task complete, verify:

### Code Quality
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings
- [ ] No `any` types without explicit approval
- [ ] No console.log statements in production code

### Functionality
- [ ] Feature works as expected
- [ ] Edge cases handled gracefully
- [ ] Error states show user-friendly messages
- [ ] Works offline (if applicable)

### Testing
- [ ] Unit tests cover happy path
- [ ] Unit tests cover error cases
- [ ] Tests pass locally

### Security
- [ ] No sensitive data in client code
- [ ] Firestore rules updated (if needed)
- [ ] No security rule bypasses

---

## 📁 FILE STRUCTURE EXPECTATIONS

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth-related routes
│   ├── match/[id]/        # Match detail routes
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Generic UI components
│   ├── match/             # Match-specific components
│   └── scorecard/         # Scorecard components
├── lib/
│   ├── firebase.ts        # Firebase client init
│   ├── bets/              # Bet calculation logic
│   │   ├── nassau.ts
│   │   ├── skins.ts
│   │   └── types.ts
│   └── utils/             # Generic utilities
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── __tests__/             # Test files mirror src structure
```

---

## 🔄 DEPENDENCY RULES

### Approved Dependencies

These are pre-approved for use:

- `next` / `react` / `react-dom`
- `firebase` / `firebase-admin`
- `tailwindcss`
- `next-pwa`
- `@sentry/nextjs`
- `zod` (schema validation)
- `date-fns` (date handling)

### Requires Approval

Ask before adding:
- State management libraries (Zustand, Redux)
- Form libraries (React Hook Form)
- Animation libraries (Framer Motion)
- Any library > 50KB gzipped

### Forbidden

Do not add under any circumstances:
- Payment SDKs (Stripe, PayPal, etc.)
- Gambling-related libraries
- Heavy UI frameworks (Material-UI, Chakra)

---

## 💡 DECISION FRAMEWORK

When facing a technical decision:

### 1. Does it support offline-first?
If not, reconsider or document the limitation clearly.

### 2. Is it the simplest solution?
Complexity must be justified by concrete requirements.

### 3. Can a solo dev maintain it?
Avoid patterns that require specialized knowledge.

### 4. Does it fit in 30 days?
If not, defer to Phase 2 or cut scope.

### 5. Does it cross legal lines?
Any payment/gambling-adjacent feature is auto-reject.

---

## 📝 COMMIT MESSAGE FORMAT

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
```
feat(scorecard): add hole-by-hole score entry component
fix(auth): handle magic link expiration gracefully
docs(readme): add local development setup instructions
```

**Rules:**
- Keep subject line < 72 characters
- Use imperative mood ("add" not "added")
- Never mention Claude, AI, or Anthropic

---

*This file defines the boundaries for AI-assisted development on this project. Update as patterns emerge.*
