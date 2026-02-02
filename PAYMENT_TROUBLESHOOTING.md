# Payment Verification Troubleshooting Guide

## 🔍 Issue: "Payment Verification Failed - Invalid payment parameters"

This error occurs when the payment success page doesn't receive the expected URL parameters from eSewa.

---

## 🧪 **Quick Test Steps**

### 1. **Test the Debugger**
Visit: http://localhost:3000/payment-debug.html

This will show you:
- Current URL parameters
- What's missing
- What's expected from eSewa

### 2. **Test with Sample Parameters**
Click "Test with Sample Parameters" button on the debugger page, or visit:
```
http://localhost:3000/student/payment-success.html?refId=TEST123&oid=OCMS-1-123&payment_id=1&amt=15000
```

This should work and show "Payment Successful" (if you're logged in).

---

## 📋 **Complete Enrollment Flow Test**

### Step 1: Clear Browser Data
```javascript
// Run in browser console:
localStorage.clear();
sessionStorage.clear();
```

### Step 2: Test Unauthenticated Enrollment
1. **Logout** (or use incognito)
2. Visit: http://localhost:3000/student/courses.html
3. Scroll to "Advanced Courses" section
4. Click **"Enroll Now"** on any course
5. ✅ **Should redirect to login page** with course info in URL

### Step 3: Login as Student
1. On login page, enter credentials:
   - Email: student email
   - Password: student password
2. Click "Login"
3. ✅ **Should auto-redirect to payment page** for the selected course

### Step 4: Test Payment Flow
1. On payment page, you'll see course details
2. Click **"Pay with eSewa"** button
3. ✅ **Should redirect to eSewa** (test environment)

### Step 5: Complete eSewa Payment
Use these test credentials:
- **eSewa ID:** 9806800001, 9806800002, 9806800003
- **Password:** Nepal@123
- **MPIN:** 1122

### Step 6: Verify Success
After payment, eSewa redirects back with parameters:
- `refId` - Transaction code
- `oid` - Order ID
- `payment_id` - Our payment record ID
- `amt` - Amount paid

✅ **Expected:** "Payment Successful" message and enrollment created

---

## 🐛 **If You Still Get Errors**

### Check 1: Verify URL Parameters
1. When you see the error, check the URL in browser
2. Does it have `?refId=XXX&payment_id=XXX`?
3. If NO → eSewa is not redirecting properly
4. If YES → Check browser console for errors

### Check 2: Check Browser Console
Open Developer Tools (F12) and look for:
```
eSewa payment success URL parameters: { ... }
```

Expected to see:
```javascript
{
  transactionCode: "0000ABC",  // Should have value
  paymentId: "123",            // Should have value
  transactionUuid: "OCMS-123-...",
  totalAmount: "15000",
  allParams: [ ... ]           // All URL parameters
}
```

### Check 3: Test Backend Endpoint
```bash
# Test payment confirmation (use actual JWT token)
curl -X POST http://localhost:3000/api/payments/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "transaction_code": "TEST123",
    "oid": "OCMS-1-123",
    "payment_id": 1,
    "amt": "15000"
  }'
```

Expected response:
```json
{
  "message": "Payment confirmed and enrollment created",
  "payment": { ... }
}
```

### Check 4: Verify Environment Variables
Check your `.env` file has:
```env
ESEWA_SUCCESS_URL=http://localhost:3000/student/payment-success.html
```

**NOT:** `https://` or a different domain

---

## 🔧 **Common Issues & Fixes**

### Issue 1: No URL Parameters After eSewa Redirect
**Cause:** eSewa success URL is incorrect
**Fix:** Check `.env` file:
```env
ESEWA_SUCCESS_URL=http://localhost:3000/student/payment-success.html
```

### Issue 2: JWT Token Expired
**Symptoms:** Backend returns 401 Unauthorized
**Fix:** Login again to get fresh token

### Issue 3: Payment ID Not in URL
**Cause:** Success URL doesn't include `?payment_id=...`
**Fix:** Already fixed in code - backend appends it automatically:
```javascript
success_url: `${ESEWA_SUCCESS_URL}?payment_id=${payment.id}`
```

### Issue 4: eSewa Returns Different Parameters
**Solution:** Code now checks multiple possible parameter names:
- `refId`, `txnId`, `transaction_code` → Transaction code
- `oid`, `transaction_uuid` → Order ID
- `amt`, `total_amount` → Amount

---

## 📝 **Manual Test URL**

If eSewa test environment is not working, test with this URL:
```
http://localhost:3000/student/payment-success.html?refId=MANUAL_TEST_123&oid=OCMS-1-1706889900000&payment_id=1&amt=15000
```

**Requirements:**
1. Must be logged in (have valid JWT token)
2. Payment ID (1) must exist in database with status PENDING
3. Payment must belong to your student profile

---

## 🎯 **Expected Full Flow**

1. **Click Enroll** (not logged in) → Login page
2. **Login** → Redirected back to courses with `?enroll=COURSE_ID`
3. **Auto-redirect** → Payment page with course details
4. **Click Pay** → eSewa payment page
5. **Complete Payment** → Success page with params
6. **Verify** → Backend confirms, creates enrollment
7. **Success** → "Go to My Courses" button appears

---

## 🚨 **Still Not Working?**

### Step 1: Enable Debug Mode
Add this to payment-success.html (already done):
```javascript
console.log('eSewa payment success URL parameters:', {
  transactionCode, transactionUuid, paymentId, totalAmount,
  allParams: Array.from(urlParams.entries()),
  fullUrl: window.location.href
});
```

### Step 2: Check Server Logs
Look at terminal where `npm start` is running for errors

### Step 3: Test Individual Components

**Test 1: Payment Creation**
```javascript
// In browser console on payment page:
fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('ocms_token')}`
  },
  body: JSON.stringify({ course_id: 1, amount: 15000 })
})
.then(r => r.json())
.then(console.log);
```

**Test 2: Payment Verification**
Visit debugger: http://localhost:3000/payment-debug.html?refId=TEST&payment_id=1

---

## ✅ **Success Indicators**

You'll know it's working when:
1. ✅ Enrollment button redirects to login (when not logged in)
2. ✅ After login, auto-redirects to payment page
3. ✅ Payment page shows correct course and price
4. ✅ eSewa button submits form (opens eSewa)
5. ✅ After eSewa payment, returns to success page
6. ✅ Success page shows "Payment Successful"
7. ✅ Can access course after enrollment

---

**Need more help?** Check browser console (F12) and server logs for detailed error messages.
