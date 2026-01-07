# Login & Dashboard Navigation - Test Guide

## Quick Test Steps

### Step 1: Open Login Page
```
URL: http://localhost:5500/auth/login.html
```

### Step 2: Test with Correct Credentials

Use one of these test accounts:

**STUDENT Account:**
- Email: `john@example.com`
- Password: `Password123`

**INSTRUCTOR Account:**
- Email: `ram1@gmail.com` (or any instructor email you created)
- Password: `password123`

**ADMIN Account:**
- Email: (check your admin account)
- Password: (check your admin account)

### Step 3: Submit Login
1. Click "Log In" button
2. **Expected behavior:**
   - ✓ NO confirmation dialog appears
   - ✓ If valid: Redirect happens within 2 seconds
   - ✓ If invalid: Error message appears inline

### Step 4: Verify Redirect
- **For STUDENT:** Should redirect to `/student/student-dashboard.html`
- **For INSTRUCTOR:** Should redirect to `/instructor/instructor-dashboard.html`
- **For ADMIN:** Should redirect to `/admin/dashboard.html`

## What Changed

### File Updated:
`publicc/auth/login.html`

### Change Made:
Removed conflicting `login.js` script that was showing a confirmation dialog.

### Before:
```html
<script type="module" defer src="js/login.js"></script>
<script defer src="js/auth-forms.js"></script>
```

### After:
```html
<script type="module" defer src="js/auth-forms.js"></script>
```

## Error Message Examples

### Valid Email, Wrong Password:
```
Message: "Login failed. Sign up here"
(With clickable link to signup)
```

### Invalid Email Format:
```
Message: "Enter valid email"
```

### Empty Password:
```
Message: "Enter password"
```

### Network Error:
```
Message: "Network error. Please check your connection."
```

## Troubleshooting

### Issue: Still Getting No Error Message
1. Open Browser Console (F12)
2. Go to Console tab
3. Try login again
4. Check for any JavaScript errors

### Issue: Not Redirecting After Login
1. Check Browser Network tab (F12 → Network)
2. Look for POST request to `/api/auth/login`
3. Check response:
   - Status should be 200
   - Body should contain `token` and `user` object
   - `user.role` should be set correctly

### Issue: Page Doesn't Load After Redirect
1. The dashboard page might be checking for a valid token
2. Check if token is stored in localStorage:
   - Press F12
   - Go to Console
   - Type: `localStorage.getItem('ocms_token')`
   - Should return a long JWT token string
3. If empty, the redirect didn't work properly

## Browser Debugging

### Check Stored Token:
```javascript
// In browser console (F12):
localStorage.getItem('ocms_token')  // Should return token
localStorage.getItem('ocms_role')   // Should return role
```

### Check Network Request:
1. Press F12 → Network tab
2. Enter credentials and click "Log In"
3. Look for POST request to `/api/auth/login`
4. Click on request and check:
   - **Headers tab:** Content-Type should be application/json
   - **Payload tab:** Should show email and password sent
   - **Response tab:** Should show token and user data

## Test Scenarios

| Scenario | Email | Password | Expected |
|----------|-------|----------|----------|
| Valid Student | john@example.com | Password123 | Redirect to /student/student-dashboard.html |
| Valid Instructor | ram1@gmail.com | password123 | Redirect to /instructor/instructor-dashboard.html |
| Wrong Password | valid_email@test.com | wrong123 | Error: "Login failed. Sign up here" |
| Invalid Email | not-an-email | password123 | Error: "Enter valid email" |
| Empty Password | john@example.com | (empty) | Error: "Enter password" |
| Non-existent Account | noone@test.com | password123 | Error: "Login failed. Sign up here" |

## Summary

✅ **Fixed:** Removed competing login handler
✅ **Result:** Direct, simple login flow without confirmation dialog
✅ **Error Handling:** Inline error messages
✅ **Redirect:** Works based on user role
✅ **Token Storage:** Stored in localStorage as `ocms_token`

The login flow is now:
```
User enters credentials 
    ↓
Form validation (inline errors if invalid)
    ↓
Send POST to /api/auth/login
    ↓
Receive token + user role
    ↓
Store in localStorage
    ↓
Redirect to dashboard (based on role)
```
