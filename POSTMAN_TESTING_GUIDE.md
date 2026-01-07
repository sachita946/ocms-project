# Postman Testing Guide - Login & Signup

## Server Information
- **Base URL:** `http://localhost:5500`
- **API Base URL:** `http://localhost:5500/api`
- **Status:** Make sure server is running with `npm run dev`

---

## 1. SIGNUP ENDPOINT

### Endpoint Details
- **URL:** `http://localhost:5500/api/auth/signup`
- **Method:** `POST`
- **Content-Type:** `application/json`

### Headers to Set in Postman
```
Content-Type: application/json
```

### Request Body (Student Signup Example)
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "STUDENT"
}
```

### Minimal Student Signup (Required Fields Only)
```json
{
  "first_name": "John",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Instructor Signup (With Full Details)
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.instructor@example.com",
  "password": "InstructorPass123",
  "role": "INSTRUCTOR",
  "bio": "Experienced software engineer with 5+ years of teaching",
  "qualifications": "BS Computer Science, Master's in Education",
  "experience_years": 5,
  "expertise_area": "Web Development, Python, JavaScript",
  "phone": "9841234567",
  "website": "https://janesmith.com"
}
```

### Expected Success Response (201/200)
```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "role": "STUDENT",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

### Possible Error Responses

**Email Already Exists (409)**
```json
{
  "success": false,
  "message": "Email already exists",
  "data": null
}
```

**Missing Fields (400)**
```json
{
  "success": false,
  "message": "Missing fields",
  "data": null
}
```

**Server Error (500)**
```json
{
  "success": false,
  "message": "Server error",
  "data": null
}
```

---

## 2. LOGIN ENDPOINT

### Endpoint Details
- **URL:** `http://localhost:5500/api/auth/login`
- **Method:** `POST`
- **Content-Type:** `application/json`

### Headers to Set in Postman
```
Content-Type: application/json
```

### Request Body (Login Example)
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Expected Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "role": "STUDENT",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

### Possible Error Responses

**Invalid Credentials (400)**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "data": null
}
```

**Missing Fields (400)**
```json
{
  "success": false,
  "message": "Missing fields",
  "data": null
}
```

---

## 3. Step-by-Step Postman Instructions

### For Signup:

1. **Create New Request**
   - Click "+" or "New"
   - Select "HTTP Request"

2. **Set Request Type**
   - Change from "GET" to "POST"

3. **Enter URL**
   - Paste: `http://localhost:5500/api/auth/signup`

4. **Set Headers**
   - Click "Headers" tab
   - Header: `Content-Type`
   - Value: `application/json`
   - (Postman usually auto-detects this)

5. **Add Body**
   - Click "Body" tab
   - Select "raw"
   - Select "JSON" from dropdown
   - Paste the request body:
   ```json
   {
     "first_name": "John",
     "last_name": "Doe",
     "email": "john@example.com",
     "password": "Password123",
     "role": "STUDENT"
   }
   ```

6. **Send Request**
   - Click "Send"
   - Check response in the panel below

7. **Save Token**
   - Copy the token from response
   - Save it for login testing

### For Login:

1. **Create New Request**
   - Click "+" or "New"
   - Select "HTTP Request"

2. **Set Request Type**
   - Change from "GET" to "POST"

3. **Enter URL**
   - Paste: `http://localhost:5500/api/auth/login`

4. **Set Headers**
   - Click "Headers" tab
   - Header: `Content-Type`
   - Value: `application/json`

5. **Add Body**
   - Click "Body" tab
   - Select "raw"
   - Select "JSON" from dropdown
   - Paste the request body:
   ```json
   {
     "email": "john@example.com",
     "password": "Password123"
   }
   ```

6. **Send Request**
   - Click "Send"
   - Check response with token

---

## 4. Testing with Frontend Integration

### Test Signup Flow:

1. **Open Browser**
   - Go to: `http://localhost:5500/student/student-signup.html`

2. **Fill Form**
   - Full Name: John Doe
   - Email: john@example.com
   - Password: Password123
   - Confirm: Password123
   - Phone: 9841234567
   - Education: Bachelor's
   - Skills: JavaScript, React, Node.js

3. **Submit**
   - Click "Sign Up"
   - Check browser console (F12 → Console tab)
   - Should see success message with token

4. **Check Server Logs**
   - Terminal where server runs should show request logs
   - Look for: `signup` or POST request logs

### Test Login Flow:

1. **Open Browser**
   - Go to: `http://localhost:5500/auth/login.html`

2. **Fill Form**
   - Email: john@example.com
   - Password: Password123

3. **Submit**
   - Click "Log In"
   - Should show confirmation dialog
   - Click "Yes, Continue"
   - Check browser console for token
   - Should redirect to student dashboard

4. **Check Server Logs**
   - Terminal where server runs should show request logs
   - Look for: `login` or POST request logs

---

## 5. Verify Backend Connection

### Check if Request Reaches Backend:

**Method 1: Server Terminal**
```
Look for logs like:
- POST /api/auth/signup
- POST /api/auth/login
- Request received from frontend
```

**Method 2: Browser Network Tab**
1. Open DevTools (F12)
2. Go to "Network" tab
3. Submit signup/login form
4. Look for POST requests to:
   - `http://localhost:5500/api/auth/signup`
   - `http://localhost:5500/api/auth/login`
5. Click on request to see:
   - Request Headers
   - Request Body (what was sent)
   - Response Status (200, 400, 409, 500, etc.)
   - Response Body (server response)

**Method 3: Check Database**
```sql
SELECT * FROM "User" WHERE email = 'john@example.com';
```

---

## 6. Common Issues & Solutions

### Issue: "Cannot connect to server"
**Solution:**
- Ensure server is running: `npm run dev`
- Check if port 5500 is listening
- Try: `http://localhost:5500` in browser

### Issue: "Email already exists"
**Solution:**
- Use a different email address
- Or delete the user from database and try again

### Issue: "Invalid credentials"
**Solution:**
- Check email spelling (case-sensitive)
- Password is case-sensitive
- Ensure password matches exactly

### Issue: "CORS Error"
**Solution:**
- Already handled in backend
- Should not occur with localhost
- If persists, check CORS middleware in index.js

### Issue: Response shows empty data
**Solution:**
- Check server logs for errors
- Ensure all required fields are sent
- Verify request headers have `Content-Type: application/json`

---

## 7. Testing Checklist

- [ ] Can signup a new student
- [ ] Cannot signup with existing email
- [ ] Passwords are hashed (not stored as plain text)
- [ ] Token is returned after signup
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong password
- [ ] Cannot login with non-existent email
- [ ] Student profile is created automatically
- [ ] Instructor profile is created with details
- [ ] Token can be used in subsequent requests
- [ ] Frontend form submission sends to backend
- [ ] Frontend receives and displays errors correctly
- [ ] Frontend shows success messages

---

## 8. Example Postman Collection

You can import this as a Postman collection:

```json
{
  "info": {
    "name": "OCMS Auth API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Signup - Student",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"first_name\":\"John\",\"last_name\":\"Doe\",\"email\":\"john@example.com\",\"password\":\"Password123\",\"role\":\"STUDENT\"}"
        },
        "url": {
          "raw": "http://localhost:5500/api/auth/signup",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5500",
          "path": ["api", "auth", "signup"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"john@example.com\",\"password\":\"Password123\"}"
        },
        "url": {
          "raw": "http://localhost:5500/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5500",
          "path": ["api", "auth", "login"]
        }
      }
    }
  ]
}
```

---

## 9. Frontend Error Message Updates

### Instructor Profile Page - Inline Error Messages

The instructor profile page (`/publicc/instructor/profile.html`) has been updated to display error messages inline instead of using popup alerts.

**Changes Made:**
- Added error message container: `<div id="errorMsg">` styled with red background
- Replaced all `alert()` calls with inline error display
- Network errors are now displayed inline with styling
- Success and error messages display together with proper styling

**Error Display Examples:**
```
Network Error:
- "Network error. Please try again." (red inline box)

Validation Error:
- "Passwords do not match!" (red inline box)

API Error:
- Server-provided error message displayed inline
- E.g., "Email already in use"
```

**Testing the Profile Update:**
1. Login as instructor with token
2. Go to `/instructor/profile.html`
3. Update any field (e.g., bio, expertise)
4. Click "Save Changes"
5. Watch for inline error/success messages

**If Network Error Occurs:**
- Red error message displays inline below the header
- User can see the specific error without a popup
- User can correct and resubmit without page refresh

---

## Questions?

- Check server logs: `npm run dev` output
- Check browser console: F12 → Console
- Check network requests: F12 → Network
- Read error messages carefully - they're descriptive!
