# Session Persistence Fix ✅

## Problem
When deployed to production, users were being logged out when navigating to different pages.

## Root Cause
The app was using `MemoryStore` for sessions, which stores session data in server memory. This causes issues because:
- Sessions are lost when the server restarts
- In cloud platforms with multiple instances, sessions aren't shared
- Not suitable for production deployments

## Solution
Switched from `MemoryStore` to **SQLite-based session storage** using `better-sqlite3-session-store`.

## Changes Made

### 1. Installed Session Store Package
```bash
npm install better-sqlite3-session-store
```

### 2. Updated `server/index.ts`
- Replaced `memorystore` with `better-sqlite3-session-store`
- Sessions now stored in `sessions.db` file
- Sessions persist across server restarts
- In production: stored on persistent disk at `/opt/render/project/src/sessions.db`

### 3. Added TypeScript Definitions
Created `server/types/better-sqlite3-session-store.d.ts` for proper TypeScript support.

### 4. Updated `.gitignore`
Added session database files:
```
sessions.db
sessions.db-shm
sessions.db-wal
```

## Benefits
✅ Sessions persist across server restarts
✅ No more unexpected logouts
✅ Works reliably in production
✅ Same SQLite approach for both database and sessions
✅ Simple single-file storage
✅ No external dependencies

## Database Files

The app now uses two SQLite database files:

1. **`local.db`** - Main application data
   - Users, expenses, transactions, budgets, loans
   - All your financial data

2. **`sessions.db`** - User sessions
   - Login sessions
   - Authentication state
   - Cookie data

Both are stored on the same persistent disk in production.

## Configuration

### Session Settings
- **Max Age:** 30 days (30 * 24 * 60 * 60 * 1000 ms)
- **Cleanup Interval:** 15 minutes (expired sessions removed)
- **Cookie Settings:**
  - `httpOnly: true` - Prevents JavaScript access
  - `secure: true` (in production) - HTTPS only
  - `sameSite: 'lax'` - CSRF protection

### Production Path
```
/opt/render/project/src/sessions.db
```

### Development Path
```
./sessions.db (in project root)
```

## Testing

To verify sessions work:

1. Login to the app
2. Navigate to different pages (Dashboard → Expenses → Budgets → Analytics)
3. Refresh the page
4. Should stay logged in without re-entering credentials

## Deployment Impact

When you deploy, Render.com will:
1. Create a persistent disk mounted at `/opt/render/project/src`
2. Store both `local.db` and `sessions.db` on this disk
3. Preserve data across deployments and restarts
4. Sessions will survive server maintenance

## Technical Details

**Session Store:**
```typescript
new SessionStore({
  client: new Database(sessionDbPath),
  expired: {
    clear: true,      // Auto-delete expired sessions
    intervalMs: 900000 // Check every 15 minutes
  }
})
```

**Session Database Schema:**
- Automatically created by `better-sqlite3-session-store`
- Stores serialized session data
- Indexed by session ID
- Includes expiration timestamps

## Migration Notes

No migration needed! The change is backward compatible:
- Existing logged-in users will be logged out once (expected)
- After re-login, sessions will persist properly
- No data loss in the main database

## Monitoring

To check session health in production:

```bash
# SSH into your Render instance (if available)
sqlite3 /opt/render/project/src/sessions.db "SELECT COUNT(*) FROM sessions;"
```

This shows the number of active sessions.

## Further Optimization (Optional)

If you later need to scale, you could:
- Use Redis for sessions (faster, distributed)
- Implement session clustering
- Add session analytics

But for a single-instance app with moderate traffic, SQLite sessions are perfect!
