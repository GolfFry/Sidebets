# GolfSettled MVP — Testing Strategy

> **Version:** 0.1.0
> **Last Updated:** 2025-01-01
> **Audience:** All Engineers

---

## 📋 Overview

This document defines the testing strategy for GolfSettled MVP. Our goal is to have **high confidence in betting logic** while keeping MVP timeline realistic.

### Testing Pyramid

```
        /\
       /  \      E2E Tests (Phase 2)
      /----\     - Critical user flows
     /      \    - 5-10 tests
    /--------\   Integration Tests
   /          \  - API endpoints
  /------------\ - Firebase rules
 /              \- 20-30 tests
/----------------\  Unit Tests
                    - Betting logic
                    - Utilities
                    - 100+ tests
```

---

## 🎯 Coverage Targets

| Area | Target | Priority |
|------|--------|----------|
| Betting Logic (`lib/bets/`) | 90%+ | 🔴 Critical |
| Utilities (`lib/utils/`) | 80%+ | 🟠 High |
| Firestore Rules | 100% paths | 🔴 Critical |
| React Components | Key flows | 🟡 Medium |
| API Routes | Happy path | 🟡 Medium |

---

## 🧪 Unit Testing

### Framework: Jest + React Testing Library

**Setup:**
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

**Configuration (`jest.config.js`):**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/lib/**/*.{ts,tsx}',
    '!src/lib/**/*.d.ts',
  ],
  coverageThreshold: {
    'src/lib/bets/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

**Setup File (`jest.setup.js`):**
```javascript
import '@testing-library/jest-dom'
```

### Test File Structure

```
__tests__/
├── lib/
│   ├── bets/
│   │   ├── nassau.test.ts
│   │   ├── skins.test.ts
│   │   ├── press.test.ts
│   │   ├── handicap.test.ts
│   │   └── payouts.test.ts
│   └── utils/
│       ├── format.test.ts
│       └── validation.test.ts
├── components/
│   ├── scorecard/
│   │   └── HoleInput.test.tsx
│   └── ui/
│       └── Button.test.tsx
└── hooks/
    └── useAuth.test.ts
```

### Naming Conventions

```typescript
// File: nassau.test.ts
describe('calculateNassau', () => {
  describe('when player A wins all segments', () => {
    it('returns correct sweep payout', () => {
      // ...
    })
  })

  describe('when segments are split', () => {
    it('returns net payout difference', () => {
      // ...
    })
  })

  describe('edge cases', () => {
    it('handles all pushes correctly', () => {
      // ...
    })
  })
})
```

---

## 🎲 Betting Logic Tests (Critical)

### Nassau Calculator

```typescript
// __tests__/lib/bets/nassau.test.ts
import { calculateNassau, NassauConfig, HoleResult } from '@/lib/bets/nassau'

describe('calculateNassau', () => {
  const defaultConfig: NassauConfig = {
    frontAmount: 5,
    backAmount: 5,
    overallAmount: 5,
    autoPress: false,
    pressTrigger: 2,
    maxPresses: 4,
  }

  describe('segment winners', () => {
    it('calculates sweep correctly (A wins all)', () => {
      const holes: HoleResult[] = Array(18).fill(null).map((_, i) => ({
        holeNumber: i + 1,
        playerAStrokes: 4,
        playerBStrokes: 5,
      }))

      const result = calculateNassau(holes, defaultConfig)

      expect(result.front.winner).toBe('A')
      expect(result.back.winner).toBe('A')
      expect(result.overall.winner).toBe('A')
      expect(result.netPayout.playerA).toBe(15)
      expect(result.netPayout.playerB).toBe(-15)
    })

    it('handles split match (each wins some)', () => {
      const holes: HoleResult[] = [
        // Front 9: A wins
        ...Array(9).fill(null).map((_, i) => ({
          holeNumber: i + 1,
          playerAStrokes: 4,
          playerBStrokes: 5,
        })),
        // Back 9: B wins
        ...Array(9).fill(null).map((_, i) => ({
          holeNumber: i + 10,
          playerAStrokes: 5,
          playerBStrokes: 4,
        })),
      ]

      const result = calculateNassau(holes, defaultConfig)

      expect(result.front.winner).toBe('A')
      expect(result.back.winner).toBe('B')
      expect(result.overall.winner).toBe(null) // Push
      expect(result.netPayout.playerA).toBe(0) // +5 -5 +0
    })

    it('handles all pushes', () => {
      const holes: HoleResult[] = Array(18).fill(null).map((_, i) => ({
        holeNumber: i + 1,
        playerAStrokes: 4,
        playerBStrokes: 4, // All ties
      }))

      const result = calculateNassau(holes, defaultConfig)

      expect(result.front.winner).toBe(null)
      expect(result.back.winner).toBe(null)
      expect(result.overall.winner).toBe(null)
      expect(result.netPayout.playerA).toBe(0)
      expect(result.netPayout.playerB).toBe(0)
    })
  })

  describe('press mechanics', () => {
    it('triggers auto-press at 2-down', () => {
      const config: NassauConfig = { ...defaultConfig, autoPress: true }
      const holes: HoleResult[] = [
        // A goes 2-up after hole 4
        { holeNumber: 1, playerAStrokes: 4, playerBStrokes: 5 },
        { holeNumber: 2, playerAStrokes: 4, playerBStrokes: 4 },
        { holeNumber: 3, playerAStrokes: 4, playerBStrokes: 5 },
        { holeNumber: 4, playerAStrokes: 4, playerBStrokes: 5 }, // A 2-up, press triggered
        ...Array(5).fill(null).map((_, i) => ({
          holeNumber: i + 5,
          playerAStrokes: 4,
          playerBStrokes: 4,
        })),
        ...Array(9).fill(null).map((_, i) => ({
          holeNumber: i + 10,
          playerAStrokes: 4,
          playerBStrokes: 4,
        })),
      ]

      const result = calculateNassau(holes, config)

      expect(result.presses.length).toBe(1)
      expect(result.presses[0].startHole).toBe(5)
      expect(result.presses[0].segment).toBe('front')
    })

    it('respects max press limit', () => {
      const config: NassauConfig = { ...defaultConfig, autoPress: true, maxPresses: 2 }
      // Create scenario where 3 presses would trigger
      const holes: HoleResult[] = [
        // Holes 1-3: A 2-up (press 1)
        { holeNumber: 1, playerAStrokes: 4, playerBStrokes: 5 },
        { holeNumber: 2, playerAStrokes: 4, playerBStrokes: 5 },
        { holeNumber: 3, playerAStrokes: 4, playerBStrokes: 4 },
        // Holes 4-5: A 4-up overall (press 2 would trigger in press 1)
        { holeNumber: 4, playerAStrokes: 4, playerBStrokes: 5 },
        { holeNumber: 5, playerAStrokes: 4, playerBStrokes: 5 },
        // Continue...
        ...Array(4).fill(null).map((_, i) => ({
          holeNumber: i + 6,
          playerAStrokes: 4,
          playerBStrokes: 5,
        })),
        ...Array(9).fill(null).map((_, i) => ({
          holeNumber: i + 10,
          playerAStrokes: 4,
          playerBStrokes: 4,
        })),
      ]

      const result = calculateNassau(holes, config)

      expect(result.presses.length).toBeLessThanOrEqual(2)
    })
  })
})
```

### Skins Calculator

```typescript
// __tests__/lib/bets/skins.test.ts
import { calculateSkins, SkinsConfig, HoleScore } from '@/lib/bets/skins'

describe('calculateSkins', () => {
  const defaultConfig: SkinsConfig = {
    skinValue: 1,
    carryover: true,
    validation: false,
  }

  it('awards skin on clear winner', () => {
    const scores: HoleScore[] = [
      { holeNumber: 1, playerAStrokes: 3, playerBStrokes: 5 },
    ]

    const result = calculateSkins(scores, defaultConfig)

    expect(result.skins[0].winner).toBe('A')
    expect(result.skins[0].value).toBe(1)
  })

  it('carries over on tie when enabled', () => {
    const scores: HoleScore[] = [
      { holeNumber: 1, playerAStrokes: 4, playerBStrokes: 4 },
      { holeNumber: 2, playerAStrokes: 3, playerBStrokes: 5 },
    ]

    const result = calculateSkins(scores, defaultConfig)

    expect(result.skins.length).toBe(1)
    expect(result.skins[0].holeNumber).toBe(2)
    expect(result.skins[0].value).toBe(2) // Carried from hole 1
  })

  it('does not carry over when disabled', () => {
    const config: SkinsConfig = { ...defaultConfig, carryover: false }
    const scores: HoleScore[] = [
      { holeNumber: 1, playerAStrokes: 4, playerBStrokes: 4 },
      { holeNumber: 2, playerAStrokes: 3, playerBStrokes: 5 },
    ]

    const result = calculateSkins(scores, config)

    expect(result.skins[0].value).toBe(1) // No carryover
  })

  it('validates with par rule when enabled', () => {
    const config: SkinsConfig = { ...defaultConfig, validation: true }
    const scores: HoleScore[] = [
      { holeNumber: 1, playerAStrokes: 6, playerBStrokes: 7, par: 5 }, // A wins but over par
    ]

    const result = calculateSkins(scores, config)

    expect(result.skins.length).toBe(0) // No skin awarded
    expect(result.potValue).toBe(1) // Carries over
  })

  it('handles all ties going to last hole', () => {
    const scores: HoleScore[] = [
      ...Array(8).fill(null).map((_, i) => ({
        holeNumber: i + 1,
        playerAStrokes: 4,
        playerBStrokes: 4,
      })),
      { holeNumber: 9, playerAStrokes: 3, playerBStrokes: 5 },
    ]

    const result = calculateSkins(scores, defaultConfig)

    expect(result.skins.length).toBe(1)
    expect(result.skins[0].value).toBe(9) // All 9 holes worth
  })
})
```

---

## 🔐 Firestore Rules Tests

### Setup

```bash
npm install -D @firebase/rules-unit-testing firebase-admin
```

### Test File

```typescript
// __tests__/firestore.rules.test.ts
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { readFileSync } from 'fs'

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-golfsettled',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

afterEach(async () => {
  await testEnv.clearFirestore()
})

describe('users collection', () => {
  it('allows authenticated user to read any profile', async () => {
    const db = testEnv.authenticatedContext('user1').firestore()
    await assertSucceeds(db.collection('users').doc('user2').get())
  })

  it('denies unauthenticated read', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(db.collection('users').doc('user1').get())
  })

  it('allows user to write own profile', async () => {
    const db = testEnv.authenticatedContext('user1').firestore()
    await assertSucceeds(
      db.collection('users').doc('user1').set({
        displayName: 'Test User',
        handicapIndex: 15,
      })
    )
  })

  it('denies user writing other profile', async () => {
    const db = testEnv.authenticatedContext('user1').firestore()
    await assertFails(
      db.collection('users').doc('user2').set({
        displayName: 'Hacked',
      })
    )
  })
})

describe('matches collection', () => {
  it('allows participant to read match', async () => {
    // Setup: Create match with user1 as participant
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('matches').doc('match1').set({
        participantIds: ['user1', 'user2'],
        status: 'active',
      })
    })

    const db = testEnv.authenticatedContext('user1').firestore()
    await assertSucceeds(db.collection('matches').doc('match1').get())
  })

  it('denies non-participant reading match', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('matches').doc('match1').set({
        participantIds: ['user1', 'user2'],
        status: 'active',
      })
    })

    const db = testEnv.authenticatedContext('user3').firestore()
    await assertFails(db.collection('matches').doc('match1').get())
  })
})

describe('scores subcollection', () => {
  it('validates score range (1-20)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('matches').doc('match1').set({
        participantIds: ['user1'],
      })
    })

    const db = testEnv.authenticatedContext('user1').firestore()
    
    // Valid score
    await assertSucceeds(
      db.collection('matches').doc('match1')
        .collection('scores').add({
          strokes: 5,
          holeNumber: 1,
          version: 1,
        })
    )

    // Invalid score (too high)
    await assertFails(
      db.collection('matches').doc('match1')
        .collection('scores').add({
          strokes: 25,
          holeNumber: 1,
          version: 1,
        })
    )

    // Invalid score (zero)
    await assertFails(
      db.collection('matches').doc('match1')
        .collection('scores').add({
          strokes: 0,
          holeNumber: 1,
          version: 1,
        })
    )
  })
})
```

---

## ⚛️ Component Tests

### Button Component

```typescript
// __tests__/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when loading', () => {
    render(<Button loading>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('meets tap target requirements (48x48)', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button')
    
    // Check for tap-target class
    expect(button).toHaveClass('tap-target')
  })
})
```

### HoleInput Component

```typescript
// __tests__/components/scorecard/HoleInput.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { HoleInput } from '@/components/scorecard/HoleInput'

describe('HoleInput', () => {
  it('displays hole number', () => {
    render(<HoleInput holeNumber={7} par={4} onScoreChange={jest.fn()} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('allows score input', () => {
    const handleChange = jest.fn()
    render(<HoleInput holeNumber={1} par={4} onScoreChange={handleChange} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '5' } })
    
    expect(handleChange).toHaveBeenCalledWith(1, 5)
  })

  it('rejects invalid scores', () => {
    const handleChange = jest.fn()
    render(<HoleInput holeNumber={1} par={4} onScoreChange={handleChange} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '25' } }) // Too high
    
    expect(handleChange).not.toHaveBeenCalled()
  })
})
```

---

## 🏃 Running Tests

### Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific file
npm test -- nassau.test.ts

# Run in watch mode
npm test -- --watch

# Run only betting tests
npm test -- --testPathPattern=bets

# Run Firestore rules tests
npm test -- firestore.rules.test.ts
```

### CI Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 📊 Coverage Reports

### Viewing Coverage

```bash
# Generate HTML report
npm test -- --coverage

# Open report
open coverage/lcov-report/index.html
```

### Coverage Requirements

PRs must meet these thresholds:

| Path | Branches | Functions | Lines |
|------|----------|-----------|-------|
| `src/lib/bets/` | 90% | 90% | 90% |
| `src/lib/utils/` | 80% | 80% | 80% |
| `src/lib/` (other) | 70% | 70% | 70% |

---

## 🔮 Phase 2: E2E Tests

### Tool: Playwright (Post-MVP)

```bash
npm install -D @playwright/test
npx playwright install
```

### Critical Flows to Test

1. User registration → Login → Create match
2. Score entry (online) → View results
3. Score entry (offline) → Sync when online
4. Invite flow → Join match

---

*This document should be updated as testing strategy evolves.*
