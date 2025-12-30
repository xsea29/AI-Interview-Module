# Test Case: Public Endpoints 401 Unauthorized Error

## Issue Identified
Frontend calling `/api/v1/interviews/public/start/` returns 401 Unauthorized with message: "Access denied. No token provided."

## Root Cause
Backend JWT auth middleware is checking for bearer token BEFORE routing to the public endpoint handler. The `/api/v1/interviews/public/` routes are not excluded from the middleware.

## Error Flow
```
Request → Express Router → JWT Auth Middleware (BLOCKS HERE) ❌
  ↓
Middleware checks for Bearer token in Authorization header
  ↓
No JWT token found → 401 Error
  ↓
Request NEVER reaches the public route handler
```

## Frontend Status
✅ **CORRECT** - All frontend code is properly implemented:

### Endpoint: `/api/v1/interviews/public/questions/:token`
- Method: GET
- Session Token Passed: ✓ Query parameter + Header
- Bearer Token: ✗ None (not sent, as intended)
- Location: `app/interview/[interviewToken]/start/page.js:70`

### Endpoint: `/api/v1/interviews/public/start/:token`
- Method: POST
- Session Token Passed: ✓ Query parameter + Body + Header
- Bearer Token: ✗ None (not sent, as intended)
- Request Body: `{ sessionToken, userAgent, timestamp }`

### Endpoint: `/api/v1/interviews/public/submit/:token`
- Method: POST
- Session Token Passed: ✓ Query parameter + Header
- Bearer Token: ✗ None (not sent, as intended)
- Request Body: `{ answers, completedAt, timeSpent }`

## Backend Fix Required

### File: `src/middleware/auth.middleware.js`

**Current Code (WRONG):**
```javascript
module.exports = (req, res, next) => {
  // JWT validation runs on ALL routes
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided."
    });
  }
  // ... validate JWT ...
};
```

**Required Fix (CORRECT):**
```javascript
module.exports = (req, res, next) => {
  // PUBLIC ROUTES - NO JWT REQUIRED
  const publicRoutes = [
    /^\/api\/v1\/interviews\/public\//,  // ← ADD THIS PATTERN!
    /^\/api\/v1\/auth\/login$/,
    /^\/api\/v1\/auth\/register$/,
    // ... other public routes ...
  ];

  // Check if current route is public
  const isPublic = publicRoutes.some(route => route.test(req.path));
  
  // Skip JWT validation for public routes
  if (isPublic) {
    return next();
  }

  // For protected routes, require JWT
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided."
    });
  }
  
  // ... rest of JWT validation ...
};
```

## All Public Routes to Protect
These routes need the regex pattern added:
```
/api/v1/interviews/public/validate/:token
/api/v1/interviews/public/send-otp/:token
/api/v1/interviews/public/verify-otp/:token
/api/v1/interviews/public/verify-email/:token
/api/v1/interviews/public/create-session/:token
/api/v1/interviews/public/verify-session/:token
/api/v1/interviews/public/start/:token
/api/v1/interviews/public/questions/:token
/api/v1/interviews/public/access/:token
/api/v1/interviews/public/submit/:token
```

## How Session Token Auth Works

Once backend excludes public routes from JWT middleware:

1. **Frontend sends request** to `/api/v1/interviews/public/start/:token`
   - No Authorization header (not needed)
   - Session token in query: `?sessionToken=uuid`
   - Session token in header: `X-Interview-Session: uuid`
   - Session token in body: `{ sessionToken: uuid }`

2. **Backend receives request** (JWT middleware skipped)
   - Route handler checks session token validity
   - Validates interview status
   - Validates candidate access
   - Returns 200 with interview details

## Testing Checklist

- [ ] Add `/api/v1/interviews/public/` to public routes in auth middleware
- [ ] Verify all 10 public endpoints are covered by the regex
- [ ] Restart backend server
- [ ] Test: GET `/api/v1/interviews/public/validate/:token` → Should work
- [ ] Test: POST `/api/v1/interviews/public/send-otp/:token` → Should work
- [ ] Test: POST `/api/v1/interviews/public/verify-otp/:token` → Should work
- [ ] Test: POST `/api/v1/interviews/public/verify-email/:token` → Should work
- [ ] Test: POST `/api/v1/interviews/public/create-session/:token` → Should work
- [ ] Test: POST `/api/v1/interviews/public/start/:token` → Should work
- [ ] Test: GET `/api/v1/interviews/public/questions/:token` → Should work
- [ ] Test: POST `/api/v1/interviews/public/submit/:token` → Should work

## Frontend Implementation
✅ Complete and correct - no changes needed
✅ All endpoints properly call `/api/v1/interviews/public/`
✅ Session tokens passed via multiple methods (query, body, header)
✅ Error handling in place
✅ Fallback mechanisms implemented
