# Enrollment Flow Testing Guide

## Complete Flow: Enrollment → Login → Payment → Zoom

### Flow Overview
```
Click "Enroll Now" → Login Page → Payment Page → eSewa → Payment Success → Zoom Join
```

### Test Scenario 1: Not Logged In User
1. **Go to Courses Page**: Navigate to `http://localhost:3000/student/courses.html`
2. **Find Advanced Course**: Scroll to "Advanced Technology Courses" section
3. **Click "Enroll Now"**: On any advanced course card
4. **Expected**: Should redirect to `/auth/login.html` with enrollment parameters
   - URL should look like: `/auth/login.html?enrollCourse=123&courseName=Course%20Name&price=15000`
5. **Login**: Enter valid email and password
6. **Expected**: After successful login, should redirect to `/student/payment.html` with course details
   - URL should look like: `/student/payment.html?courseId=123&courseName=Course%20Name&price=15000`
7. **Complete Payment**: Fill in payment form and submit
8. **Expected**: Redirect to eSewa payment gateway
9. **eSewa Success**: After successful eSewa payment, redirect back to `/student/payment-success.html`
10. **Expected**: Shows "Payment Successful" and "Join Course Session" button (if Zoom link exists)
11. **Click Join**: Redirects to Zoom meeting link

### Test Scenario 2: Already Logged In User
1. **Login First**: Go to `/auth/login.html` and login
2. **Go to Courses**: Navigate to `/student/courses.html`
3. **Click "Enroll Now"**: On any advanced course
4. **Expected**: Should SKIP login and go directly to `/student/payment.html`
5. **Complete Payment**: Same as above (steps 7-11)

### Debugging
Open browser console (F12) to see debug logs:
- `Enrolling in advanced course:` - Shows course details
- `Token present:` - Shows if user is logged in
- `Redirecting to login:` or `Redirecting to payment:` - Shows where user is being sent
- `Post-login redirect params:` - Shows parameters after login

### Common Issues

#### Issue: Not redirecting to login
- **Check**: Browser console for "Redirecting to login:" message
- **Check**: URL path is correct (`/auth/login.html`)
- **Fix**: Clear browser cache and reload

#### Issue: After login, not going to payment
- **Check**: Browser console for "Post-login redirect params:"
- **Check**: URL parameters include `enrollCourse`, `courseName`, `price`
- **Fix**: Ensure all parameters are passed in the login URL

#### Issue: Payment success but no Zoom link
- **Check**: Course has `zoom_link` field set in database
- **Check**: Browser console for localStorage `payment_return_url`
- **Fix**: Update course in database to include Zoom link

#### Issue: eSewa payment not working
- **Check**: `.env` file has correct eSewa credentials
- **Check**: eSewa test mode is enabled for testing
- **Check**: Backend is running on port 3000

### Database Check
Ensure courses have the required fields:
```sql
SELECT id, title, price, zoom_link, level FROM "Course" WHERE level = 'ADVANCED';
```

Make sure:
- `price` > 0
- `zoom_link` is set (e.g., `https://zoom.us/j/1234567890`)
- `level` = 'ADVANCED'

### Manual Test URLs

**Test Login Redirect:**
```
http://localhost:3000/auth/login.html?enrollCourse=1&courseName=Test%20Course&price=15000
```

**Test Payment Page:**
```
http://localhost:3000/student/payment.html?courseId=1&courseName=Test%20Course&price=15000
```

**Test Payment Success (with mock eSewa params):**
```
http://localhost:3000/student/payment-success.html?refId=TEST123&oid=OCMS-1-456&payment_id=1&amt=15000
```

## Success Criteria
✅ Click "Enroll Now" → Redirects to login page (if not logged in)
✅ Login successful → Redirects to payment page with correct course info
✅ Payment page → Shows correct course name and price
✅ Submit payment → Redirects to eSewa
✅ eSewa success → Returns to payment-success.html
✅ Payment verification → Shows success message
✅ Click "Join Course Session" → Opens Zoom link

## Notes
- All URL paths now use absolute paths (starting with `/`) for consistency
- Console logs added for debugging each redirect step
- Token check happens client-side for instant redirect decision
- Login page always redirects to payment page when enrollCourse params are present
