# Backend Auth Middleware Fix - PUBLIC ROUTES

## Problem
Frontend is correctly calling `/api/v1/interviews/public/*` endpoints, but the backend JWT auth middleware is rejecting ALL requests with "Access denied. No token provided."

## Root Cause
The auth middleware in `src/middleware/auth.middleware.js` is checking for JWT tokens on ALL routes, including the public interview endpoints that should NOT require authentication.

## Solution Required
Update `src/middleware/auth.middleware.js` to exclude public interview routes BEFORE checking for JWT token.

### Expected Code Pattern
```javascript
// auth.middleware.js

module.exports = (req, res, next) => {
  // LIST OF PUBLIC ROUTES (no JWT required)
  const publicRoutes = [
    /^\/api\/v1\/interviews\/public\//,  // ← ADD THIS LINE!
    // ... other public routes ...
  ];

  // Check if current route is public
  const isPublic = publicRoutes.some(route => route.test(req.path));
  
  // If public route, skip auth and proceed
  if (isPublic) {
    return next();
  }

  // For non-public routes, require JWT token
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

## All Public Interview Routes to Exclude
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

## Frontend Status
✅ All endpoints correctly use `/public`
✅ No JWT authorization headers on public requests
✅ Session tokens properly passed via query parameter + header
✅ Error handling in place

## Once Backend is Fixed
1. Frontend validation will work ✅
2. Email verification will work ✅
3. Session tokens will be created ✅  
4. Interview questions will load ✅
5. Interview submission will work ✅

## Next Step
Add `/api/v1/interviews/public/` to the publicRoutes list in your backend's auth middleware.
