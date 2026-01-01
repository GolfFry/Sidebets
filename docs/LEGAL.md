# GolfSettled MVP — Legal & Compliance

> **Version:** 0.1.0
> **Last Updated:** 2025-01-01
> **Status:** MVP Guidelines (Not Legal Advice)

---

## ⚠️ IMPORTANT DISCLAIMER

**This document is NOT legal advice.** It contains guidelines for building an MVP that minimizes legal risk. Before any public launch or monetization, consult with a licensed attorney familiar with gambling law in your target jurisdictions.

---

## 📋 The Legal Framework

### US Gambling Law Basics

US gambling law typically requires **three elements** for an activity to be considered gambling:

1. **Consideration** — Something of value risked (usually money)
2. **Chance** — Outcome depends on luck/chance
3. **Prize** — Winner receives something of value

**Remove any one element** and it's generally not gambling under most state laws.

### Our Approach: Remove Consideration

GolfSettled **does not handle money**. We are a score tracking and IOU ledger app only. Users settle their bets offline through their own payment methods (Venmo, Zelle, cash, etc.).

**No money flows through the app = No consideration = Not gambling**

---

## ✅ Features That Keep Us Legal

### Safe (Implement These)

| Feature | Status | Notes |
|---------|--------|-------|
| Score tracking | ✅ Safe | Pure information |
| Leaderboards | ✅ Safe | Statistics only |
| IOU/debt tracking | ✅ Safe | Record-keeping |
| "Settle offline" messaging | ✅ Safe | Clear direction |
| Manual "mark as settled" | ✅ Safe | User-controlled |
| Match history | ✅ Safe | Historical data |
| Push notifications (scores) | ✅ Safe | Information delivery |
| Shareable results cards | ✅ Safe | Entertainment/social |

### Never Build (Red Lines)

| Feature | Status | Risk |
|---------|--------|------|
| Payment processing | 🚫 NEVER | Gambling license required |
| Escrow / holding funds | 🚫 NEVER | Money transmitter license |
| Taking a rake/cut/fee | 🚫 NEVER | Illegal gambling facilitation |
| Prize pools | 🚫 NEVER | Gambling |
| Auto-settlement | 🚫 NEVER | Payment facilitation |
| In-app currency | 🚫 NEVER | Virtual gambling |
| Pre-filled payment links | 🚫 NEVER | Payment facilitation |
| Tournament entry fees | 🚫 NEVER | Prize pool = gambling |

---

## 📝 Required Disclaimers

### In-App Disclaimer (Required)

Display this on first launch and in Settings:

```
IMPORTANT NOTICE

GolfSettled is a score tracking and entertainment app only.

• This app does NOT handle real money
• This app does NOT process payments
• This app does NOT hold funds
• This app does NOT facilitate gambling transactions

All monetary settlements must occur offline between users
through their own payment methods (Venmo, Zelle, cash, etc.).

GolfSettled takes no rake, fee, or commission.

This app is intended for social entertainment among friends.
Users are responsible for ensuring their activities comply
with local laws.

By using this app, you confirm you are 18 years or older.
```

### Terms of Service Excerpt

Include in ToS:

```
4. NATURE OF SERVICE

4.1 GolfSettled is a score tracking and record-keeping
    application. It does not facilitate, process, or
    handle any real-money transactions.

4.2 Any references to monetary values within the app
    (such as "bet amounts" or "payouts") are for
    display purposes only and represent theoretical
    calculations between users.

4.3 Users who choose to settle accounts do so entirely
    outside of the GolfSettled platform through their
    own means. GolfSettled has no involvement in, and
    accepts no responsibility for, any financial
    transactions between users.

4.4 GolfSettled does not take any commission, rake,
    or fee from user activities.

5. USER RESPONSIBILITIES

5.1 Users are solely responsible for ensuring their
    use of the app complies with all applicable laws
    in their jurisdiction.

5.2 Users must be 18 years of age or older to use
    this application.
```

### Privacy Policy Notes

Include:

```
We do NOT collect or store:
• Payment information
• Bank account details
• Credit card numbers
• Social Security numbers
• Government ID information

We DO collect:
• Email address (for authentication)
• Display name (for identification)
• Golf handicap (optional, for scoring)
• Match and score data (for app functionality)
```

---

## 🌍 Geographic Considerations

### High-Risk Jurisdictions (Consider Blocking)

| Location | Risk Level | Reason |
|----------|------------|--------|
| Utah | 🔴 High | Constitutional gambling ban |
| Hawaii | 🔴 High | Constitutional gambling ban |
| Washington State | 🟠 Medium | Online gambling is felony |
| EU Countries | 🟠 Medium | GDPR complexity |
| China | 🔴 High | Gambling strictly illegal |
| UAE | 🔴 High | Gambling strictly illegal |
| Saudi Arabia | 🔴 High | Gambling strictly illegal |

### MVP Recommendation

For MVP, consider:
1. US-only (excluding Utah, Hawaii)
2. Add geo-blocking for high-risk jurisdictions
3. Expand cautiously post-MVP with legal review

### Geo-Blocking Implementation

```typescript
const BLOCKED_REGIONS = [
  'UT', // Utah
  'HI', // Hawaii
  // Add more as needed
]

function checkRegionAccess(stateCode: string): boolean {
  return !BLOCKED_REGIONS.includes(stateCode)
}
```

---

## 📱 App Store Considerations

### Positioning Strategy

**DO:**
- Category: Sports or Entertainment (NOT Games)
- Title: Avoid "bet" — use "GolfTracker", "FairwayIOU", "GolfSettled"
- Keywords: Golf, scorecard, handicap, friends, tracker, IOU
- Description: Focus on score tracking, friend groups, handicap management

**DON'T:**
- Use "gambling," "betting," "wager" in store listing
- Show monetary amounts prominently in screenshots
- Imply real-money transactions
- Use casino-style imagery

### Age Rating

- **iOS:** 17+ (gambling themes)
- **Android:** Teen or higher with gambling disclaimer
- Implement age gate on first launch

### Review Guidelines

Apple/Google may ask about:
- How money is handled → "It isn't. Users settle offline."
- What the bet amounts represent → "Display values only. No real money."
- How users pay → "They don't pay through the app."

---

## 🔒 Data Protection

### GDPR (If Expanding to EU)

If you expand to EU, you'll need:
- [ ] Data Processing Agreement
- [ ] Right to erasure implementation
- [ ] Data portability export
- [ ] Privacy policy in local languages
- [ ] Cookie consent (if using analytics)
- [ ] Data Protection Officer (if >250 employees)

### CCPA (California)

For California users:
- [ ] "Do Not Sell My Personal Information" link
- [ ] Privacy policy disclosures
- [ ] Data deletion requests within 45 days

### MVP Approach

For MVP (US-only, excluding high-risk states):
1. Minimal data collection
2. Clear privacy policy
3. Data deletion capability
4. No third-party data sharing

---

## 📊 Audit Trail Requirements

Maintain logs for potential legal review:

### What to Log
- User registration timestamps
- Match creation and participation
- Score entries and modifications
- Settlement status changes
- Account deletions

### What NOT to Log
- Actual payment information
- External payment app usernames
- How users settled (cash, Venmo, etc.)

### Retention Period
- Active users: Indefinite (for app functionality)
- Deleted accounts: 30 days then purge
- Audit logs: 1 year minimum

---

## 🚨 Incident Response

### If Contacted by Regulators

1. **Do not respond immediately**
2. Document the contact (date, agency, person, request)
3. Consult with legal counsel
4. Respond only through legal counsel

### If Sued by User

1. Do not admit fault
2. Document everything
3. Contact legal counsel immediately
4. Preserve all relevant data

### If App Store Rejects

1. Review rejection reason carefully
2. Do NOT argue or escalate immediately
3. Modify listing/app to address concerns
4. Resubmit with clear explanation

---

## ✅ Pre-Launch Checklist

### Legal Preparation

- [ ] Terms of Service drafted
- [ ] Privacy Policy drafted
- [ ] In-app disclaimer implemented
- [ ] Age gate (18+) implemented
- [ ] Geo-blocking for restricted regions
- [ ] "No money handled" messaging throughout
- [ ] Consult attorney before public launch

### Documentation

- [ ] This document reviewed by legal
- [ ] Data retention policy documented
- [ ] Incident response plan documented
- [ ] Support contact email configured

### Technical

- [ ] No payment SDK integrated
- [ ] No payment deep links with amounts
- [ ] Audit logging implemented
- [ ] Data deletion capability works

---

## 📚 Resources

### Reading
- State gambling laws overview
- UIGEA (Unlawful Internet Gambling Enforcement Act)
- Wire Act implications
- State attorney general gambling opinions

### Professional Help
- Gaming law attorneys
- Tech startup attorneys
- Privacy/GDPR specialists

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2025-01-01 | Initial draft for MVP |

---

*This document should be reviewed by legal counsel before launch.*
