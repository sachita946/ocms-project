# Instructor Signup Network Error Fix

## Issues Identified & Fixed

### 1. **Script Path Issue**
- **Problem**: HTML file was looking for `js/instructor-signup.js` (relative path)
- **Solution**: Updated to `/instructor/js/instructor-signup.js` (absolute path)
- **File Changed**: `publicc/instructor/instructor-signup.html`

### 2. **Missing JavaScript File**
- **Problem**: The new script location didn't have the proper instructor signup handler
- **Solution**: Created new `publicc/instructor/js/instructor-signup.js` with proper error handling

### 3. **Form Field Mismatch**
- **Problem**: HTML form had field IDs that the old JavaScript didn't support correctly
- **Changes Made**:
  - Split "Full Name" into "First Name" (required) and "Last Name" (optional)
  - Ensured all fields match between HTML and JavaScript
  - Added error containers for all critical fields

## New JavaScript Features

The new `instructor-signup.js` includes:

### Proper Error Handling
```javascript
- Validation errors display inline below each field
- Network errors show as a styled message box
- Form submission shows "Creating account..." status
```

### Inline Error Messages
- **Empty fields**: "Full name is required"
- **Invalid email**: "Enter a valid email"  
- **Short password**: "Password must be at least 6 characters"
- **Password mismatch**: "Passwords do not match"
- **Network error**: "Network error. Please check your connection and try again."

### Form Data Mapping
```
Frontend Field → API Field
─────────────────────────
instructorName → first_name
instructorLastName → last_name
instructorEmail → email
instructorPassword → password
instructorPhone → phone
instructorBio → bio
instructorExperience → experience_years
instructorSubjects → expertise_area
instructorEducation → qualifications
instructorWebsite → website
```

## Testing Steps

### 1. Open Instructor Signup Page
```
URL: http://localhost:5500/instructor/instructor-signup.html
```

### 2. Fill Test Data
```
First Name: Ram
Last Name: Sapkota
Email: ram1@gmail.com (use unique email each time)
Password: password123
Confirm Password: password123
Phone: 9841234567
Bio: Experienced UI/UX with 5+ years of teaching
Experience: 5
Subjects: Graphic Design
Education: Design and Development Certification
Website: https://example.com
```

### 3. Submit & Observe
- Should show: "Creating your instructor account..."
- Look for success message (green) OR error (red)
- Check browser console (F12 → Console) for logs
- Check Network tab (F12 → Network) for API call

## Expected Success Response

```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "ram1@gmail.com",
      "role": "INSTRUCTOR",
      "first_name": "Ram",
      "last_name": "Sapkota"
    }
  }
}
```

## Debugging Network Errors

### If You See "Network error. Please check your connection..."

1. **Check Browser Console** (F12)
   - Look for error messages
   - Check if request was made at all

2. **Check Network Tab** (F12 → Network)
   - Filter for `signup` request
   - Check response status (200, 400, 409, 500)
   - Read response body for details

3. **Check Server Logs**
   - Terminal should show: `POST /api/auth/signup`
   - Look for any error messages

4. **Common Issues**:
   - Server not running: Run `npm run dev`
   - Wrong URL format in fetch
   - Missing Content-Type header
   - Invalid JSON in request body

## File Changes Summary

```
publicc/instructor/instructor-signup.html
  - Updated script src from "js/instructor-signup.js" to "/instructor/js/instructor-signup.js"
  - Fixed form field IDs to match new structure
  - Split full name into first/last name fields

publicc/instructor/js/instructor-signup.js (NEW)
  - Complete rewrite with proper error handling
  - Inline error messages for each field
  - Console logging for debugging
  - Proper fetch headers and JSON serialization
```

## Next Steps if Still Having Issues

1. **Check the browser console** - F12 and look at Console tab
2. **Check the Network tab** - See what request is being sent
3. **Check the server terminal** - Look for request logs
4. **Verify the server is running** - `npm run dev`
5. **Test with Postman** - Make a manual POST to `/api/auth/signup`
