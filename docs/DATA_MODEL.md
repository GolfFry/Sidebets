# GolfSettled MVP — Data Model

> **Version:** 0.1.0
> **Last Updated:** 2025-01-01
> **Database:** Cloud Firestore

---

## 📋 Overview

This document defines the Firestore collections, document schemas, and security rules for the GolfSettled MVP.

---

## 🗂️ Collections Overview

```
firestore/
├── users/                    # User profiles
│   └── {userId}
├── matches/                  # Golf matches
│   └── {matchId}
│       ├── bets/             # Bet configurations
│       │   └── {betId}
│       ├── participants/     # Players in match
│       │   └── {participantId}
│       ├── scores/           # Hole-by-hole scores
│       │   └── {scoreId}
│       ├── ledger/           # Payout entries
│       │   └── {entryId}
│       └── audit/            # Change history
│           └── {auditId}
├── invites/                  # Invite links
│   └── {inviteId}
└── groups/                   # Friend groups (Phase 2)
    └── {groupId}
```

---

## 📄 Schema Definitions

### Users Collection

**Path:** `users/{userId}`

```typescript
interface User {
  // Identity
  displayName: string           // Required, max 50 chars
  email: string                 // From Firebase Auth (not stored in Firestore)
  avatarUrl: string | null      // Profile image URL
  
  // Golf profile
  handicapIndex: number | null  // 0.0 to 54.0, nullable if not set
  homeClub: string | null       // Optional home course
  
  // Preferences
  defaultTeeBox: TeeBox         // 'championship' | 'blue' | 'white' | 'red'
  notificationsEnabled: boolean // Push notification preference
  
  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
  lastActiveAt: Timestamp       // For stale user cleanup
}

type TeeBox = 'championship' | 'blue' | 'white' | 'red'
```

**Indexes:** None required (queries by userId only)

---

### Matches Collection

**Path:** `matches/{matchId}`

```typescript
interface Match {
  // Basic info
  courseName: string            // Free text, required
  courseId: string | null       // For future course API integration
  teeTime: Timestamp            // Scheduled start time
  holes: 9 | 18                 // Number of holes
  
  // Status
  status: MatchStatus           // 'pending' | 'active' | 'completed' | 'cancelled'
  currentHole: number | null    // 1-18, null if not started
  
  // Participants
  createdBy: string             // userId reference
  scorerId: string              // Who keeps score for the group
  participantIds: string[]      // Array of userIds (denormalized for queries)
  
  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
  startedAt: Timestamp | null   // When match went active
  completedAt: Timestamp | null // When match finished
  
  // Optimistic locking
  version: number               // Increment on each update
}

type MatchStatus = 'pending' | 'active' | 'completed' | 'cancelled'
```

**Indexes:**
- `participantIds` (array-contains) + `status` + `teeTime` (desc)
- `createdBy` + `createdAt` (desc)

---

### Bets Subcollection

**Path:** `matches/{matchId}/bets/{betId}`

```typescript
interface Bet {
  // Core
  type: BetType                 // 'nassau' | 'skins' | 'match_play' | 'stroke_play'
  unitValue: number             // Base bet amount (display only, e.g., 5 = $5)
  scoringMode: ScoringMode      // 'gross' | 'net'
  
  // Nassau-specific (null if not nassau)
  nassauConfig: NassauConfig | null
  
  // Skins-specific (null if not skins)
  skinsConfig: SkinsConfig | null
  
  // Metadata
  createdAt: Timestamp
  createdBy: string             // userId
}

type BetType = 'nassau' | 'skins' | 'match_play' | 'stroke_play'
type ScoringMode = 'gross' | 'net'

interface NassauConfig {
  frontAmount: number           // Front 9 bet amount
  backAmount: number            // Back 9 bet amount
  overallAmount: number         // Overall 18 bet amount
  autoPress: boolean            // Auto-press when 2 down
  pressTrigger: number          // Holes down to trigger (usually 2)
  maxPresses: number            // Cap to prevent runaway exposure (e.g., 4)
}

interface SkinsConfig {
  skinValue: number             // Value per skin
  carryover: boolean            // Ties carry to next hole
  validation: boolean           // Must match par or better to keep skin
}
```

---

### Participants Subcollection

**Path:** `matches/{matchId}/participants/{participantId}`

```typescript
interface Participant {
  // Identity
  userId: string                // Reference to users collection
  displayName: string           // Denormalized for offline display
  
  // Golf settings for this match
  playingHandicap: number | null  // Adjusted handicap for this course
  teeBox: TeeBox                  // Which tees they're playing
  courseHandicap: number | null   // Course-adjusted handicap
  
  // Team assignment (for team formats)
  team: 'A' | 'B' | null        // Null for individual formats
  
  // Status
  status: ParticipantStatus     // 'invited' | 'confirmed' | 'declined'
  invitedAt: Timestamp
  confirmedAt: Timestamp | null
}

type ParticipantStatus = 'invited' | 'confirmed' | 'declined'
```

---

### Scores Subcollection

**Path:** `matches/{matchId}/scores/{scoreId}`

```typescript
interface Score {
  // Identity
  participantId: string         // Reference to participant
  holeNumber: number            // 1-18
  
  // Score data
  strokes: number               // 1-20 (validated)
  putts: number | null          // Optional putt tracking
  fairwayHit: boolean | null    // Optional fairway tracking
  greenInRegulation: boolean | null  // Optional GIR tracking
  
  // Metadata
  enteredBy: string             // userId who entered the score
  createdAt: Timestamp
  updatedAt: Timestamp
  
  // Sync & conflict resolution
  version: number               // Optimistic locking
  deviceId: string              // For conflict debugging
  syncedAt: Timestamp | null    // When synced to server (null if local only)
}
```

**Composite Key:** `participantId` + `holeNumber` (enforced in app logic)

**Indexes:**
- `participantId` + `holeNumber`
- `holeNumber` + `createdAt`

---

### Ledger Subcollection

**Path:** `matches/{matchId}/ledger/{entryId}`

```typescript
interface LedgerEntry {
  // Transaction
  fromUserId: string            // Who owes
  toUserId: string              // Who is owed
  amount: number                // Positive number (always)
  
  // Context
  betType: BetType              // Which bet this is from
  betId: string                 // Reference to specific bet
  description: string           // e.g., "Nassau Front 9" or "Skin on Hole 7"
  
  // Settlement
  settled: boolean              // Has this been marked as paid
  settledAt: Timestamp | null   // When marked settled
  settledBy: string | null      // Who marked it settled
  
  // Metadata
  createdAt: Timestamp
  calculatedBy: string          // 'system' or userId if manual
}
```

---

### Audit Subcollection

**Path:** `matches/{matchId}/audit/{auditId}`

```typescript
interface AuditEntry {
  // What changed
  entityType: 'score' | 'bet' | 'participant' | 'match'
  entityId: string              // ID of changed entity
  action: 'create' | 'update' | 'delete'
  
  // Change details
  oldValues: Record<string, unknown> | null  // Previous values
  newValues: Record<string, unknown> | null  // New values
  
  // Who & when
  changedBy: string             // userId
  changedAt: Timestamp
  
  // Context
  reason: string | null         // Optional explanation
  deviceId: string              // For debugging
}
```

**Note:** Audit entries are created by Cloud Functions only, never by clients.

---

### Invites Collection

**Path:** `invites/{inviteId}`

```typescript
interface Invite {
  // Token
  token: string                 // 32-byte random, base64url encoded
  
  // Target
  matchId: string | null        // For match invites
  groupId: string | null        // For group invites (Phase 2)
  
  // Limits
  maxUses: number               // Default: 10
  useCount: number              // Current uses
  expiresAt: Timestamp          // Default: 7 days from creation
  
  // Metadata
  createdBy: string             // userId
  createdAt: Timestamp
}
```

**Indexes:**
- `token` (unique)
- `matchId` + `expiresAt`

---

## 🔐 Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============ HELPER FUNCTIONS ============
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isParticipant(matchId) {
      return request.auth.uid in get(/databases/$(database)/documents/matches/$(matchId)).data.participantIds;
    }
    
    function isMatchCreator(matchId) {
      return get(/databases/$(database)/documents/matches/$(matchId)).data.createdBy == request.auth.uid;
    }
    
    function isValidScore(score) {
      return score >= 1 && score <= 20;
    }
    
    function isValidHandicap(handicap) {
      return handicap == null || (handicap >= 0 && handicap <= 54);
    }
    
    // ============ USERS ============
    
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if false; // Users cannot delete themselves
    }
    
    // ============ MATCHES ============
    
    match /matches/{matchId} {
      allow read: if isSignedIn() && isParticipant(matchId);
      allow create: if isSignedIn();
      allow update: if isParticipant(matchId);
      allow delete: if isMatchCreator(matchId);
      
      // -------- BETS --------
      match /bets/{betId} {
        allow read: if isParticipant(matchId);
        allow create: if isMatchCreator(matchId);
        allow update: if isMatchCreator(matchId);
        allow delete: if isMatchCreator(matchId) 
          && get(/databases/$(database)/documents/matches/$(matchId)).data.status == 'pending';
      }
      
      // -------- PARTICIPANTS --------
      match /participants/{participantId} {
        allow read: if isParticipant(matchId);
        allow create: if isSignedIn(); // Anyone can join via invite
        allow update: if isOwner(participantId) || isMatchCreator(matchId);
        allow delete: if false; // Cannot remove participants
      }
      
      // -------- SCORES --------
      match /scores/{scoreId} {
        allow read: if isParticipant(matchId);
        allow create: if isParticipant(matchId)
          && isValidScore(request.resource.data.strokes);
        allow update: if isParticipant(matchId)
          && isValidScore(request.resource.data.strokes)
          && request.resource.data.version == resource.data.version + 1;
        allow delete: if false; // Scores are immutable
      }
      
      // -------- LEDGER --------
      match /ledger/{entryId} {
        allow read: if isSignedIn() 
          && (resource.data.fromUserId == request.auth.uid 
              || resource.data.toUserId == request.auth.uid);
        allow create: if false; // System-generated only
        allow update: if isSignedIn()
          && (resource.data.fromUserId == request.auth.uid 
              || resource.data.toUserId == request.auth.uid)
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['settled', 'settledAt', 'settledBy']);
        allow delete: if false;
      }
      
      // -------- AUDIT --------
      match /audit/{auditId} {
        allow read: if isParticipant(matchId);
        allow write: if false; // Cloud Functions only
      }
    }
    
    // ============ INVITES ============
    
    match /invites/{inviteId} {
      allow read: if true; // Public for link validation
      allow create: if isSignedIn();
      allow update: if false; // Server-side consumption only
      allow delete: if false;
    }
    
    // ============ GROUPS (Phase 2) ============
    
    match /groups/{groupId} {
      allow read: if isSignedIn() 
        && request.auth.uid in resource.data.memberIds;
      allow create: if isSignedIn();
      allow update: if isSignedIn() 
        && resource.data.ownerId == request.auth.uid;
      allow delete: if isSignedIn() 
        && resource.data.ownerId == request.auth.uid;
    }
  }
}
```

---

## 🔄 Data Migrations

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-XX | Initial schema |

### Migration Scripts

Store in `/scripts/migrations/` with naming convention:
```
YYYY-MM-DD_description.ts
```

---

## 📊 Query Patterns

### Common Queries

```typescript
// Get user's active matches
const activeMatches = await db
  .collection('matches')
  .where('participantIds', 'array-contains', userId)
  .where('status', 'in', ['pending', 'active'])
  .orderBy('teeTime', 'desc')
  .limit(10)
  .get();

// Get scores for a match
const scores = await db
  .collection('matches')
  .doc(matchId)
  .collection('scores')
  .orderBy('holeNumber')
  .get();

// Get pending settlements for user
const pendingSettlements = await db
  .collectionGroup('ledger')
  .where('fromUserId', '==', userId)
  .where('settled', '==', false)
  .get();
```

### Required Indexes

Create `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "participantIds", "arrayConfig": "CONTAINS" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "teeTime", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "ledger",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "fromUserId", "order": "ASCENDING" },
        { "fieldPath": "settled", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## ⚡ Performance Considerations

### Document Size Limits
- Max document size: 1MB
- Max subcollections: Unlimited
- Max fields per document: 20,000

### Read Optimization
- Denormalize `displayName` in participants to avoid user lookups
- Denormalize `participantIds` array in matches for efficient queries
- Use `collectionGroup` queries sparingly (more expensive)

### Write Optimization
- Batch related writes in transactions
- Use optimistic locking (`version` field) to prevent conflicts
- Avoid writing to same document from multiple clients simultaneously

---

*This document should be updated whenever the data model changes.*
