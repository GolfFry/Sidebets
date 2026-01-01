# GolfSettled MVP — Security Practices

> **Version:** 0.1.0
> **Last Updated:** 2025-01-01
> **Audience:** All Engineers

---

## 📋 Overview

This document defines security practices for the GolfSettled MVP. All engineers must follow these guidelines. Security is everyone's responsibility.

---

## 🔑 Secrets Management

### The Golden Rule

**NEVER commit secrets to version control.**

This includes:
- API keys
- Firebase credentials
- OAuth client secrets
- Database passwords
- Private keys
- Access tokens

### Required .gitignore Patterns

Every repo must include:

```gitignore
# Environment files
.env
.env.*
.env.local
.env.development
.env.production
!.env.example

# Firebase credentials
firebase-admin-key.json
serviceAccountKey.json
*-firebase-adminsdk-*.json

# Keys and certificates
*.pem
*.key
*.p12
*.pfx

# Secrets directories
secrets/
.secrets/
config/credentials.json
```

### Environment Variables

**Local Development:**
```bash
# Copy example and fill in real values
cp .env.example .env.local

# Never commit .env.local
```

**Production (Vercel):**
- Add secrets via Vercel Dashboard → Settings → Environment Variables
- Never add to `vercel.json`

**Firebase Functions:**
```bash
# Set config values
firebase functions:config:set someservice.key="THE_API_KEY"

# Access in code
const key = functions.config().someservice.key
```

### If Secrets Are Exposed

**Immediate Actions:**
1. **STOP** — Do not push if not yet pushed
2. **Rotate** — Generate new credentials immediately
3. **Revoke** — Disable the exposed credentials
4. **Clean** — Remove from git history using `git filter-repo` or BFG
5. **Notify** — Alert team members
6. **Audit** — Check for unauthorized access

**Git History Cleaning:**
```bash
# Using BFG Repo-Cleaner (recommended)
bfg --delete-files .env
bfg --replace-text passwords.txt

# Force push (coordinate with team)
git push --force
```

---

## 🔐 Authentication Security

### Firebase Auth Configuration

**Allowed Auth Methods:**
- ✅ Magic Link (Email)
- ✅ Google OAuth
- ❌ Phone (not needed for MVP)
- ❌ Anonymous (security risk)

**Auth Settings (Firebase Console):**
- Enable email enumeration protection
- Set session duration (14 days max)
- Configure authorized domains

### Session Management

```typescript
// Good: Use Firebase's built-in session handling
const auth = getAuth()
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
  } else {
    // User is signed out
  }
})

// Bad: Custom token storage
localStorage.setItem('token', user.accessToken) // DON'T DO THIS
```

### Protected Routes

Every authenticated route must verify the session:

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  
  // Redirect to login if no session
  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/match/:path*', '/ledger/:path*', '/settings/:path*']
}
```

---

## 🛡️ Firestore Security Rules

### Principles

1. **Deny by default** — Start with `allow: false`
2. **Authenticate all reads/writes** — Check `request.auth != null`
3. **Validate data** — Check types and ranges
4. **Minimize access** — Users only access their own data

### Rule Testing

**Always test rules before deployment:**

```bash
# Run emulator
firebase emulators:start

# Test rules
firebase emulators:exec "npm run test:rules"
```

**Test Cases Required:**
- [ ] Unauthenticated user cannot read/write
- [ ] User cannot read other users' private data
- [ ] User cannot modify others' scores
- [ ] Invalid data is rejected
- [ ] Rate limits are enforced (if implemented)

### Common Vulnerabilities

**❌ Bad: No authentication check**
```javascript
match /users/{userId} {
  allow read, write: if true; // INSECURE
}
```

**✅ Good: Proper authentication**
```javascript
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId;
}
```

**❌ Bad: No data validation**
```javascript
allow write: if request.auth != null; // No validation
```

**✅ Good: Data validation**
```javascript
allow write: if request.auth != null
  && request.resource.data.strokes is int
  && request.resource.data.strokes >= 1
  && request.resource.data.strokes <= 20;
```

---

## 🔒 Input Validation

### Client-Side (Zod)

```typescript
import { z } from 'zod'

export const scoreSchema = z.object({
  holeNumber: z.number().int().min(1).max(18),
  strokes: z.number().int().min(1).max(20),
  putts: z.number().int().min(0).max(10).optional(),
})

export const userSchema = z.object({
  displayName: z.string().min(1).max(50),
  handicapIndex: z.number().min(0).max(54).optional(),
})

// Usage
function handleScoreSubmit(data: unknown) {
  const result = scoreSchema.safeParse(data)
  if (!result.success) {
    // Handle validation error
    return
  }
  // Proceed with validated data
  saveScore(result.data)
}
```

### Server-Side (Cloud Functions)

**Always validate again on the server:**

```typescript
import { z } from 'zod'

export const createMatch = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in')
  }
  
  // Validate input
  const schema = z.object({
    courseName: z.string().min(1).max(100),
    holes: z.enum(['9', '18']),
  })
  
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid data')
  }
  
  // Proceed with validated data
})
```

---

## 🚫 Rate Limiting

### Client-Side Debouncing

```typescript
import { useMemo } from 'react'
import debounce from 'lodash/debounce'

function useScoreSubmit() {
  const submitScore = useMemo(
    () => debounce(async (score: Score) => {
      await saveScore(score)
    }, 500),
    []
  )
  
  return submitScore
}
```

### Server-Side (Cloud Functions)

```typescript
const rateLimit = new Map<string, number[]>()

function checkRateLimit(userId: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const userRequests = rateLimit.get(userId) || []
  
  // Remove old requests
  const recentRequests = userRequests.filter(time => now - time < windowMs)
  
  if (recentRequests.length >= limit) {
    return false // Rate limited
  }
  
  recentRequests.push(now)
  rateLimit.set(userId, recentRequests)
  return true
}

// Usage
export const submitScore = functions.https.onCall(async (data, context) => {
  if (!checkRateLimit(context.auth!.uid, 60, 60000)) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limited')
  }
  // ...
})
```

### Recommended Limits

| Action | Limit | Window |
|--------|-------|--------|
| Score updates | 60 | per minute |
| Match creation | 20 | per day |
| Invite creation | 10 | per day |
| Invite redemption | 5 | per hour per IP |
| Magic link requests | 3 | per 5 minutes |

---

## 🔍 Security Logging

### What to Log

```typescript
// Auth events
logger.info('auth.login', { userId, method: 'magic_link' })
logger.info('auth.logout', { userId })
logger.warn('auth.failed', { email, reason: 'invalid_link' })

// Data access
logger.info('score.updated', { 
  matchId, 
  holeNumber, 
  oldValue, 
  newValue,
  updatedBy: userId 
})

// Security events
logger.warn('security.rate_limited', { userId, action: 'score_update' })
logger.error('security.invalid_input', { userId, field: 'strokes', value })
```

### What NOT to Log

- ❌ Passwords or password hashes
- ❌ Magic link tokens
- ❌ Full email addresses (use userId)
- ❌ Full IP addresses (truncate to /24)
- ❌ Session tokens
- ❌ API keys

---

## 🤖 Claude Code Security

### Settings Configuration

Create `.claude/settings.json`:

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./**/firebase-admin*.json)",
      "Read(./**/*serviceAccount*.json)",
      "Read(./**/*.pem)",
      "Read(./**/*.key)"
    ]
  }
}
```

### Best Practices with AI

1. **Never paste secrets into AI prompts**
2. **Don't ask AI to generate real API keys**
3. **Review AI-generated code for security issues**
4. **Don't let AI auto-commit without review**

---

## 🔄 Security Review Checklist

### Before Every PR

- [ ] No secrets in code changes
- [ ] No `console.log` with sensitive data
- [ ] Input validation on new endpoints
- [ ] Auth checks on new routes
- [ ] Firestore rules updated if schema changed

### Before Every Release

- [ ] Dependency audit (`npm audit`)
- [ ] Firestore rules tested
- [ ] Auth flows tested
- [ ] Rate limiting verified
- [ ] Error messages don't leak info

### Monthly

- [ ] Rotate API keys (if possible)
- [ ] Review access logs
- [ ] Check for new CVEs in dependencies
- [ ] Review and update this document

---

## 🚨 Incident Response

### Security Issue Found

1. **Assess severity** (Critical/High/Medium/Low)
2. **Contain** — Disable affected features if needed
3. **Investigate** — Determine scope and impact
4. **Remediate** — Fix the issue
5. **Document** — Record what happened and why
6. **Prevent** — Add tests/checks to prevent recurrence

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| Critical | Active exploitation, data breach | Immediate |
| High | Exploitable vulnerability | < 24 hours |
| Medium | Potential vulnerability | < 1 week |
| Low | Best practice violation | Next sprint |

---

## 📚 Resources

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Anthropic API Key Best Practices](https://support.anthropic.com/articles/api-key-best-practices)

---

*This document should be reviewed and updated regularly.*
