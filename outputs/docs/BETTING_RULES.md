# GolfSettled MVP — Betting Rules

> **Version:** 0.1.0
> **Last Updated:** 2025-01-01
> **Purpose:** Definitive reference for betting logic implementation

---

## 📋 Overview

This document defines the golf betting rules implemented in GolfSettled. These rules are the **source of truth** for the Betting Logic Engineer and should be referenced when implementing calculators.

**Supported Bet Types (MVP):**
1. Nassau
2. Skins
3. Match Play (basic)

**Phase 2:**
- Stableford
- Four-Ball / Best Ball
- Wolf

---

## 🏆 Nassau Bet

### What is Nassau?

The Nassau is the most popular golf bet format. It's actually **three separate bets**:
1. **Front 9** (holes 1-9)
2. **Back 9** (holes 10-18)
3. **Overall** (all 18 holes)

Typically expressed as "5-5-5 Nassau" meaning $5 on each segment.

### Scoring Method

Nassau uses **match play scoring** within each segment:
- Win a hole: +1 (become "X-up")
- Lose a hole: -1 (become "X-down")
- Tie a hole: No change ("halved")

### Winner Determination

For each segment (Front/Back/Overall):
- Player with more holes won → Wins that segment
- Equal holes won → Push (no payout)

### Payout Calculation

```typescript
interface NassauResult {
  front: {
    winner: string | null  // null = push
    margin: number         // holes up
  }
  back: {
    winner: string | null
    margin: number
  }
  overall: {
    winner: string | null
    margin: number
  }
  presses: PressResult[]
}

interface NassauPayout {
  playerA: number  // Net amount (+/-)
  playerB: number  // Net amount (+/-)
}
```

**Example:**
```
5-5-5 Nassau
Player A wins Front 9: 2-up
Player B wins Back 9: 1-up
Player A wins Overall: 3-up

Payout:
- Player A: +$5 (front) - $5 (back) + $5 (overall) = +$5
- Player B: -$5 (front) + $5 (back) - $5 (overall) = -$5
```

---

## 🔄 Press Mechanics

### What is a Press?

A **press** is a new bet that starts from the current hole and runs to the end of the current segment. Only the **losing side** can press.

### When Can You Press?

**Traditional rule:** Press when 2 holes down in a segment.

**Auto-press (configurable):**
- Trigger: 2 holes down (default)
- Can be disabled
- Maximum presses per segment (default: 4)

### Press Calculation

```
Original Front 9 bet: $5 (holes 1-9)

After hole 5: Player A is 2-up → Player B presses
Press #1: $5 (holes 6-9)

After hole 7: Player A is still 2-up in Press #1
Press #2: $5 (holes 8-9)

Maximum front 9 exposure: $5 + $5 + $5 = $15
```

### Press State Machine

```
┌─────────────┐
│   No Press  │
│   Active    │
└──────┬──────┘
       │ Player goes 2-down
       ▼
┌─────────────┐
│   Press     │──────────────────┐
│   Offered   │                  │ Declined
└──────┬──────┘                  │
       │ Accepted                │
       ▼                         ▼
┌─────────────┐           ┌─────────────┐
│   Press     │           │   No Press  │
│   Active    │           │   Continue  │
└──────┬──────┘           └─────────────┘
       │ Player goes 2-down in press
       ▼
┌─────────────┐
│   Can Press │
│   Again     │
└─────────────┘
```

### Press Example (Complex)

```
$5 Nassau, Auto-press at 2-down, Max 4 presses

Hole  | A   | B   | Match | Presses Active
------|-----|-----|-------|----------------
1     | 4   | 5   | A 1up |
2     | 5   | 4   | AS    |
3     | 4   | 5   | A 1up |
4     | 3   | 5   | A 2up | Press #1 starts (B presses)
5     | 4   | 4   | A 2up | P1: A 1up
6     | 5   | 4   | A 1up | P1: AS
7     | 4   | 5   | AS    | P1: B 1up
8     | 5   | 4   | A 1up | P1: AS
9     | 4   | 5   | AS    | P1: B 1up

Results:
- Original Front 9: Push ($0)
- Press #1: B wins ($5 to B)
- Net Front 9: B wins $5
```

---

## 💰 Skins Game

### What is Skins?

Each hole is an independent competition. **Lowest score wins the skin** for that hole.

### Basic Rules

1. Lowest score on a hole wins the skin
2. Ties → No skin awarded (or carryover)
3. Each skin has a fixed value

### Carryover Rule

When enabled (default):
- Tied holes carry their value to the next hole
- Next hole is worth: base value + carried values
- Final hole: all carries go to winner

```
Skin value: $1
Holes 1-2: Ties (carry $2)
Hole 3: Player A wins → Gets $3 (base + 2 carried)
```

### Validation Rule (Optional)

**When enabled:** Player must score par or better to "validate" the skin. If winner scores over par, the skin carries over.

### Skins State

```typescript
interface SkinsState {
  skinValue: number
  carryover: boolean
  validation: boolean
  
  // Running state
  potValue: number           // Current accumulated value
  holesCarried: number[]     // Which holes tied
  skinsAwarded: {
    holeNumber: number
    winner: string
    value: number
  }[]
}
```

### Skins Example

```
$1 Skins, Carryover ON, Validation OFF

Hole | A  | B  | Winner | Pot | Payout
-----|----|----|--------|-----|--------
1    | 4  | 4  | Tie    | $2  | -
2    | 3  | 4  | A      | $0  | A: $2
3    | 5  | 5  | Tie    | $2  | -
4    | 5  | 5  | Tie    | $3  | -
5    | 4  | 3  | B      | $0  | B: $3
6    | 4  | 4  | Tie    | $2  | -
7    | 4  | 3  | B      | $0  | B: $2
8    | 3  | 4  | A      | $0  | A: $1
9    | 4  | 4  | Tie    | $2  | -

Final: A=$3, B=$5
Net: B wins $2 from A
```

---

## 🎯 Match Play

### Basic Match Play Scoring

```
Win hole: +1 (become "X-up")
Lose hole: -1 (become "X-down")
Tie: No change ("halved")
```

### Match Status Terms

| Term | Meaning |
|------|---------|
| All Square (AS) | Match is tied |
| 2-up | Leading by 2 holes |
| 3-down | Trailing by 3 holes |
| Dormie | Lead equals holes remaining |
| 4&3 | Won 4-up with 3 holes to play |

### Match Closure

A match is **closed** when lead > remaining holes:
- 4-up with 3 to play = "4 and 3"
- 2-up with 1 to play = "2 and 1"
- 1-up after 18 = "1-up"

### Dormie Situation

When lead = remaining holes:
- Leader cannot lose (only win or tie)
- Trailing player must win all remaining holes

---

## 🎾 Handicap Stroke Allocation

### Playing Handicap

For net scoring, players receive strokes based on the difference in handicaps.

**Example:**
```
Player A: 10 handicap
Player B: 18 handicap
Difference: 8 strokes

Player B receives 8 strokes on the 8 hardest holes
(determined by hole Stroke Index)
```

### Stroke Index

Each hole has a Stroke Index (1-18) indicating difficulty:
- Stroke Index 1 = Hardest hole
- Stroke Index 18 = Easiest hole

### Allocation Formula

```typescript
function allocateStrokes(
  playerHandicap: number,
  holeStrokeIndex: number
): number {
  if (playerHandicap <= 18) {
    // 0-18 handicap: 1 stroke on holes where SI <= handicap
    return holeStrokeIndex <= playerHandicap ? 1 : 0
  } else if (playerHandicap <= 36) {
    // 19-36 handicap: 1 stroke on all holes + extra on hardest
    const extraStrokes = playerHandicap - 18
    return 1 + (holeStrokeIndex <= extraStrokes ? 1 : 0)
  } else {
    // 37+: 2 strokes per hole
    return 2
  }
}
```

### Net Score Calculation

```
Gross Score - Strokes Received = Net Score

Example:
- Player B scores 5 on a hole where they get 1 stroke
- Net score = 5 - 1 = 4
```

---

## ⚠️ Edge Cases

### Early Match Termination

| Scenario | Resolution |
|----------|------------|
| Player quits mid-round | Forfeit remaining holes; completed segments stand |
| Weather cancellation | Return to last completed segment |
| Darkness (not all finish) | Complete next available time or void |

### Missing Scores

| Scenario | Nassau | Skins |
|----------|--------|-------|
| Score not entered | Hole halved | Hole carries over |
| Score disputed | Use entered score; note in audit | Same |

### Ties

| Bet Type | Tie Resolution |
|----------|----------------|
| Nassau segment | Push (no payout) |
| Nassau overall | Push (no payout) |
| Skins hole | Carryover (if enabled) or void |
| Match play | Match tied (half bet each) |

### Multiple Bet Types

When running Nassau + Skins simultaneously:
1. Calculate each independently
2. Aggregate payouts per player
3. Net against each other for final settlement

---

## 🧪 Test Cases

### Nassau Calculator Tests

```typescript
describe('calculateNassau', () => {
  it('calculates sweep correctly (A wins all)', () => {
    // A wins front 2-up, back 3-up, overall 5-up
    expect(result.playerANet).toBe(15) // 3 segments × $5
  })

  it('handles split correctly', () => {
    // A wins front, B wins back, A wins overall
    expect(result.playerANet).toBe(5) // +5 -5 +5 = +5
  })

  it('handles all pushes', () => {
    // All segments tied
    expect(result.playerANet).toBe(0)
    expect(result.playerBNet).toBe(0)
  })

  it('calculates single press correctly', () => {
    // A 2-up after 4, B presses, B wins press
    expect(result.presses[0].winner).toBe('B')
    expect(result.presses[0].payout).toBe(5)
  })

  it('respects max press limit', () => {
    // Config: maxPresses = 2
    // B goes 2-down 3 times
    expect(result.presses.length).toBe(2)
  })
})
```

### Skins Calculator Tests

```typescript
describe('calculateSkins', () => {
  it('awards skin on clear winner', () => {
    // A scores 3, B scores 5
    expect(result.skins[0].winner).toBe('A')
    expect(result.skins[0].value).toBe(1)
  })

  it('carries over on tie', () => {
    // Hole 1: tie, Hole 2: A wins
    expect(result.skins[0].holeNumber).toBe(2)
    expect(result.skins[0].value).toBe(2)
  })

  it('handles carryover to final hole', () => {
    // All holes tie except last
    expect(result.skins[0].value).toBe(9)
  })

  it('validates with par rule', () => {
    // A wins with 6 (bogey) on par 5, validation ON
    expect(result.skins).toHaveLength(0) // No skin awarded
  })
})
```

---

## 📐 Implementation Notes

### Recommended Data Structures

```typescript
// Match play state per segment
interface MatchPlayState {
  holesPlayed: number
  playerAHolesWon: number
  playerBHolesWon: number
  currentStatus: string  // "A 2-up", "AS", "B 1-up"
  isClosed: boolean
  closedAt?: number      // Hole number where match closed
}

// Press tracking
interface Press {
  id: string
  startHole: number
  endHole: number        // 9 or 18
  segment: 'front' | 'back'
  initiatedBy: string    // Player who pressed
  state: MatchPlayState
  amount: number
}

// Skins tracking
interface SkinsPot {
  baseValue: number
  carriedHoles: number[]
  totalValue: number
}
```

### Calculation Order

1. Process each hole in order (1→18)
2. Update match play states
3. Check for press triggers
4. Update skins pot
5. After hole 9: Calculate front segment
6. After hole 18: Calculate back and overall segments
7. Sum all payouts

---

## 📚 References

- USGA Handicap System: https://www.usga.org/handicapping.html
- Nassau bet history: Traditional golf betting format
- Standard press rules: Golf betting conventions

---

*This document is the source of truth for betting logic. Update when rules change.*
