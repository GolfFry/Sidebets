# Backend Implementation Plan for GolfSettled MVP

## User Decisions ✅

1. **Prerequisites:** Create ALL missing files (firestore.rules, firebase.json, auth config)
2. **Approach:** Phased Milestones (4 incremental phases)
3. **Firebase:** No project exists yet - include setup instructions

## Implementation Overview

**4 Phased Milestones:**
1. **Foundation & Configuration** - Firebase setup, types, auth, user CRUD
2. **Match & Scoring System** - Match lifecycle, score entry with offline support
3. **Betting & Ledger** - Bets, ledger queries, invites, balance calculations
4. **Cloud Functions & Audit** - Server-side triggers, audit logging

**Estimated Total:** ~10 hours of focused implementation
**Each milestone:** Independently testable and deliverable

---

## Milestone 1: Foundation & Configuration (~2-3 hours)

### Objective
Establish Firebase project, configuration files, complete type system, and basic user operations with authentication.

### Prerequisites (Manual Steps)
1. Create Firebase project at console.firebase.google.com
2. Enable Authentication (Email/Password, Google OAuth)
3. Create Firestore database (start in test mode)
4. Copy config values to `.env.local`
5. Install Firebase CLI: `npm install -g firebase-tools`
6. Login and initialize: `firebase login && firebase init`

### Files to Create

**Configuration Files (Root Level)**
- [firebase.json](firebase.json) - Firebase project configuration with emulator setup
- [firestore.rules](firestore.rules) - Security rules (copy from DATA_MODEL.md lines 313-431)
- [firestore.indexes.json](firestore.indexes.json) - Composite indexes (from DATA_MODEL.md lines 487-508)

**Type System**
- Extend [src/types/index.ts](src/types/index.ts) with complete data models:
  - Complete User interface with golf profile and preferences
  - Participant, Bet, NassauConfig, SkinsConfig
  - LedgerEntry, AuditEntry, Invite
  - Firestore converter types (Date ↔ Timestamp)

**Auth Configuration**
- [src/lib/auth/config.ts](src/lib/auth/config.ts) - Magic link and Google OAuth helpers

**Firestore Data Access**
- [src/lib/firestore/collections.ts](src/lib/firestore/collections.ts) - Type-safe collection references
- [src/lib/firestore/converters.ts](src/lib/firestore/converters.ts) - Timestamp/Date conversion helpers
- [src/lib/firestore/users.ts](src/lib/firestore/users.ts) - User CRUD operations

**React Hooks**
- [src/hooks/useAuth.ts](src/hooks/useAuth.ts) - Auth state with automatic user document sync

### Key Functions
- `sendMagicLink(email)` - Trigger magic link email
- `completeMagicLink(url)` - Complete sign-in from email link
- `signInWithGoogle()` - OAuth flow
- `getUser(userId)` - Fetch user document
- `createUser(userId, data)` - Initialize user profile
- `updateUser(userId, updates)` - Update user settings

### Testing Strategy
- Unit tests for converters (Timestamp/Date)
- Integration tests with Firebase emulator
- Manual test: Magic link flow end-to-end

### Success Criteria
- [ ] Firebase project created and configured
- [ ] Security rules deployed: `firebase deploy --only firestore:rules`
- [ ] Type system covers all 8 data models
- [ ] User CRUD operations work in emulator
- [ ] `useAuth` hook returns user data on login
- [ ] Tests passing with 80%+ coverage

---

## Milestone 2: Match & Scoring System (~2-3 hours)

### Objective
Implement match lifecycle management, participant operations, and real-time score entry with offline support and conflict resolution.

### Files to Create

**Match Operations**
- [src/lib/firestore/matches.ts](src/lib/firestore/matches.ts)
  - `createMatch(userId, data)` - Initialize match
  - `getMatch(matchId)` - Fetch match by ID
  - `getUserMatches(userId, statusFilter)` - Query user's matches
  - `updateMatchStatus(matchId, status)` - Transition match state
  - `addParticipantToMatch(matchId, userId)` - Add participant

**Participant Operations**
- [src/lib/firestore/participants.ts](src/lib/firestore/participants.ts)
  - `createParticipant(matchId, data)` - Add player to match
  - `getMatchParticipants(matchId)` - Fetch all participants
  - `updateParticipantStatus(matchId, participantId, status)` - Confirm/decline invite
  - `updateParticipantHandicap(matchId, participantId, handicap)` - Set playing handicap

**Score Operations (Critical - Offline Support)**
- [src/lib/firestore/scores.ts](src/lib/firestore/scores.ts)
  - `createOrUpdateScore(matchId, data)` - Upsert score with optimistic locking
  - `getScoresForParticipant(matchId, participantId)` - Participant scorecard
  - `getAllMatchScores(matchId)` - Full match scores
  - `getScoreForHole(matchId, participantId, holeNumber)` - Single hole score

**React Hooks**
- [src/hooks/useMatch.ts](src/hooks/useMatch.ts) - Real-time match data with participants/scores
- [src/hooks/useScores.ts](src/hooks/useScores.ts) - Real-time score updates with optimistic UI

### Key Features
- **Optimistic Locking:** Version field increments on each update, transactions prevent conflicts
- **Composite Key:** ScoreId = `participantId_holeNumber` prevents duplicate entries
- **Real-time Subscriptions:** `onSnapshot` for live match/score updates
- **Offline Support:** IndexedDB persistence already enabled in [src/lib/firebase.ts](src/lib/firebase.ts)

### Testing Strategy
- Unit tests for CRUD operations
- Integration tests for concurrent score updates (multiple tabs)
- Manual test: Offline score entry → online sync

### Success Criteria
- [ ] Can create match and add participants
- [ ] Scores save with optimistic locking (no conflicts)
- [ ] Real-time updates work in `useMatch` and `useScores`
- [ ] Concurrent score edits from different tabs resolve correctly
- [ ] Tests passing with 80%+ coverage

---

## Milestone 3: Betting & Ledger (~2-3 hours)

### Objective
Implement bet configuration, ledger queries, balance calculations, and invite system.

### Files to Create

**Bet Operations**
- [src/lib/firestore/bets.ts](src/lib/firestore/bets.ts)
  - `createBet(matchId, data)` - Add bet to match
  - `getMatchBets(matchId)` - Fetch match bets
  - `updateBet(matchId, betId, updates)` - Modify bet config
  - `deleteBet(matchId, betId)` - Remove bet (pending matches only)

**Bet Helpers**
- [src/lib/bets/helpers.ts](src/lib/bets/helpers.ts)
  - `createNassauBetData(unitValue, config)` - Nassau preset
  - `createSkinsBetData(unitValue, config)` - Skins preset
  - Default configurations for common bet types

**Ledger Operations**
- [src/lib/firestore/ledger.ts](src/lib/firestore/ledger.ts)
  - `getMatchLedger(matchId)` - Fetch match ledger entries
  - `getUserLedger(userId)` - Cross-match ledger query (collectionGroup)
  - `getUserPendingSettlements(userId)` - Unsettled debts
  - `markLedgerEntrySettled(matchId, entryId, settledBy)` - Mark as paid

**Balance Calculator**
- [src/lib/ledger/balances.ts](src/lib/ledger/balances.ts)
  - `calculateUserBalance(userId, entries)` - Net balance for user
  - `calculateMatchBalances(entries)` - All participants' balances

**Invite Operations**
- [src/lib/firestore/invites.ts](src/lib/firestore/invites.ts)
  - `createInvite(matchId, createdBy, options)` - Generate invite token
  - `getInviteByToken(token)` - Fetch invite details
  - `validateInvite(invite)` - Check expiry and usage limits

**React Hooks**
- [src/hooks/useLedger.ts](src/hooks/useLedger.ts) - User ledger with balance calculations

### Key Features
- **CollectionGroup Queries:** Query ledger entries across all matches
- **Balance Calculations:** Net amount, who owes whom, pending settlements
- **Invite System:** Shareable links with expiry and usage limits
- **Token Generation:** Uses existing `generateInviteToken()` from [src/lib/utils/index.ts](src/lib/utils/index.ts)

### Testing Strategy
- Unit tests for balance calculations
- Integration tests for invite flow
- Manual test: Create bets → view ledger → mark as settled

### Success Criteria
- [ ] Can create Nassau and Skins bets
- [ ] Ledger queries return correct entries
- [ ] Balance calculations are accurate
- [ ] Invite links work for joining matches
- [ ] `useLedger` hook displays net balances
- [ ] Tests passing with 80%+ coverage

---

## Milestone 4: Cloud Functions & Audit (~2-3 hours)

### Objective
Implement Cloud Functions for server-side bet calculations, audit logging, and invite consumption.

### Files to Create

**Functions Setup**
- [functions/package.json](functions/package.json) - Dependencies (firebase-admin, firebase-functions)
- [functions/tsconfig.json](functions/tsconfig.json) - TypeScript config for Node 20
- [functions/src/index.ts](functions/src/index.ts) - Export all functions

**Audit Triggers**
- [functions/src/triggers/onScoreWrite.ts](functions/src/triggers/onScoreWrite.ts) - Log score changes
- [functions/src/triggers/onBetWrite.ts](functions/src/triggers/onBetWrite.ts) - Log bet changes

**Callable Functions**
- [functions/src/callable/consumeInvite.ts](functions/src/callable/consumeInvite.ts) - Server-side invite consumption
- [functions/src/callable/healthCheck.ts](functions/src/callable/healthCheck.ts) - Status endpoint

**Client-Side Wrappers**
- [src/lib/functions/index.ts](src/lib/functions/index.ts) - Type-safe callable function wrappers

### Key Features
- **Audit Trail:** Firestore triggers automatically log all score/bet changes
- **Server-Side Invite:** Prevents abuse (atomic operations, validation)
- **Error Handling:** All functions return structured errors
- **Deployment:** Works in emulator and production

### Testing Strategy
- Deploy to Firebase emulator
- Test audit entries appear on score/bet changes
- Test invite consumption end-to-end
- Deploy to production: `firebase deploy --only functions`

### Success Criteria
- [ ] Cloud Functions deploy successfully
- [ ] Audit triggers create entries on score/bet changes
- [ ] `consumeInvite` callable works end-to-end
- [ ] Health check endpoint responds
- [ ] Functions work in emulator and production
- [ ] Basic error handling in place

---

## Critical Files Summary

**Must-Create Files (In Priority Order)**
1. [firestore.rules](firestore.rules) - Security (blocks unauthorized access)
2. [src/types/index.ts](src/types/index.ts) - Complete type system (enables type safety)
3. [src/lib/firestore/collections.ts](src/lib/firestore/collections.ts) - Collection refs (DRY, reusable)
4. [src/lib/firestore/users.ts](src/lib/firestore/users.ts) - User CRUD (pattern for all entities)
5. [src/lib/firestore/scores.ts](src/lib/firestore/scores.ts) - Score operations (critical for offline)
6. [src/hooks/useMatch.ts](src/hooks/useMatch.ts) - Real-time match data (combines multiple subscriptions)
7. [src/lib/ledger/balances.ts](src/lib/ledger/balances.ts) - Balance calculations (core business logic)
8. [functions/src/triggers/onScoreWrite.ts](functions/src/triggers/onScoreWrite.ts) - Audit trail (compliance)

---

## Integration with Frontend Routes

| Route | Milestone | Backend Functions |
|-------|-----------|-------------------|
| `/login` | M1 | `sendMagicLink`, `useAuth` |
| `/auth/callback` | M1 | `completeMagicLink` |
| `/match/new` | M2 | `createMatch`, `createBet`, `createInvite` |
| `/match/[id]` | M2 | `useMatch` |
| `/match/[id]/scorecard` | M2 | `useScores`, `createOrUpdateScore` |
| `/match/[id]/results` | M3 | `getMatchLedger`, `calculateMatchBalances` |
| `/ledger` | M3 | `useLedger` |
| `/settings` | M1 | `updateUser` |
| `/invite/[token]` | M3 | `getInviteByToken`, `consumeInviteToken` |

---

## Testing Summary

**Test Structure**
```
__tests__/
├── lib/
│   ├── firestore/ (users, matches, scores, bets, ledger, invites)
│   ├── ledger/ (balances)
│   └── utils/ (converters)
├── hooks/ (useAuth, useMatch, useScores, useLedger)
└── functions/ (onScoreWrite, onBetWrite, consumeInvite)
```

**Coverage Target:** 80% functions/lines, 70% branches

---

## Deployment Checklist

### Pre-Deployment
- [ ] Create Firebase project (manual)
- [ ] Enable Firestore, Auth, Functions
- [ ] Copy config to `.env.local`
- [ ] Install deps: `npm install`
- [ ] Start emulators: `npm run emulators`

### Per-Milestone Deployment
- **M1:** Deploy rules and indexes
- **M2:** Test match/score flow in emulator
- **M3:** Test bet and ledger queries
- **M4:** Deploy Cloud Functions

---

## Notes on MVP-First Approach

**Included in MVP:**
- Magic link auth
- Match creation with participants
- Score entry with offline support
- Nassau and Skins bet configuration
- Ledger with balance calculations
- Invite links
- Audit logging

**Deferred to Phase 2:**
- Bet calculation logic (Nassau press mechanics, Skins carryover distribution)
- Google OAuth (magic link sufficient for MVP)
- Push notifications
- Groups/recurring matches
- Payment deep links
- Course database integration

**Rationale:** This backend provides the data layer for MVP features. Complex betting calculations can be client-side initially and moved to Cloud Functions after validation with real users. Focus is on enabling: create match → invite friends → enter scores → see who owes whom.

---

## Next Steps

1. **User approval** of this plan
2. **Firebase project setup** (manual, ~15 min)
3. **Begin Milestone 1** implementation
4. **Test incrementally** after each milestone
5. **Frontend integration** once backend is stable

---

*This plan follows CLAUDE.md principles: MVP-first, avoid over-engineering, solo builder constraints, clear tradeoffs.*
