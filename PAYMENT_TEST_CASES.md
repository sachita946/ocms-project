# Payment System Test Cases

## Overview
This document contains comprehensive test cases for the eSewa payment integration in the OCMS (Online Course Management System).

## Test Environment Setup
- **Base URL**: `http://localhost:3000`
- **Database**: Ensure test data is seeded
- **Environment Variables**: Configure eSewa credentials in `.env`
- **Browser**: Chrome/Firefox with developer tools enabled
- **Test User**: Student account with valid JWT token

---

## Test Case 4: Check Course Payment Functionality

**Project Name**: Online Course Management System (OCMS)  
**Module Name**: Payment Processing Module  
**Title**: Check course payment functionality  
**Description**: The system processes payments for course enrollment using integrated payment methods (eSewa).

### Preconditions:
a) The user is authenticated  
b) eSewa payment integration is configured  
c) The course has a price set

### Test Steps:
a) Login as a student  
b) Navigate to a paid course  
c) Click "Enroll" or "Purchase"  
d) Select payment method (eSewa)  
e) Enter eSewa credentials and complete payment  
f) Confirm payment (eSewa redirects back)

### Expected Result:
• Payment is processed successfully  
• Student is enrolled and receives confirmation  
• If payment fails, appropriate error message is shown

---

## Table 2.4: Test Case for Payment Processing

| Test Case | Test Scenario | Test Data | Expected Result | Actual Result | Status |
|-----------|---------------|-----------|-----------------|---------------|--------|
| 1 | Successful payment with valid eSewa credentials | eSewa ID: 9806800001, Password: Nepal@123, MPIN: 1122 | Payment successful, enrollment confirmed | Payment successful, enrollment confirmed | Pass |
| 2 | Payment with insufficient funds | eSewa ID: 9806800002 (configured for insufficient funds) | Payment failed with message "Insufficient funds" | "Insufficient funds" | Pass |
| 3 | Payment with invalid credentials | eSewa ID: 9806800003, Wrong Password: wrongpass | Payment failed with message "Invalid credentials" | "Invalid credentials" | Pass |
| 4 | Payment cancellation | User cancels during eSewa payment process | Payment cancelled, no enrollment | Payment cancelled, no enrollment | Pass |
| 5 | Payment with network timeout | Simulate network interruption during payment | Payment failed with timeout message | "Payment timeout - please try again" | Pass |
| 6 | Payment with invalid merchant configuration | Incorrect ESEWA_MERCHANT_ID in .env | Payment failed with merchant error | "Merchant configuration error" | Pass |
| 7 | Duplicate payment attempt | Attempt same payment twice | Second attempt rejected | "Payment already processed" | Pass |
| 8 | Payment amount mismatch | eSewa returns different amount than expected | Payment failed with amount validation error | "Payment amount mismatch" | Pass |

## Detailed Test Cases

### TC-PAY-001: Payment Intent Creation - Success
**Objective**: Verify that payment intent is created successfully for valid course enrollment

**Preconditions**:
- User is logged in with valid JWT token
- Course exists with price > 0
- Backend server is running

**Steps**:
1. Send POST request to `/api/payments/create-intent`
2. Include Authorization header with Bearer token
3. Include course_id and amount in request body

**Expected Results**:
- Status: 200 OK
- Response contains payment object with:
  - `id`: Payment record ID
  - `status`: "PENDING"
  - `amount`: Correct amount
  - `course_id`: Matches requested course
  - `user_id`: Current user's ID

**Test Data**:
```json
{
  "course_id": 1,
  "amount": 15000
}
```

**Status**: Pass

---

### TC-PAY-002: Payment Intent Creation - Invalid Course
**Objective**: Verify error handling when course doesn't exist

**Preconditions**:
- User is logged in
- Invalid course_id provided

**Steps**:
1. Send POST request to `/api/payments/create-intent`
2. Use non-existent course_id

**Expected Results**:
- Status: 404 Not Found
- Error message: "Course not found"

**Status**: Pass

---

### TC-PAY-003: Payment Intent Creation - Unauthorized
**Objective**: Verify authentication requirement

**Preconditions**:
- No JWT token provided

**Steps**:
1. Send POST request to `/api/payments/create-intent` without Authorization header

**Expected Results**:
- Status: 401 Unauthorized
- Error message: "Authentication required"

**Status**: Pass

---

### TC-PAY-004: eSewa Payment Form Submission
**Objective**: Verify eSewa payment form is generated correctly

**Preconditions**:
- Payment intent created successfully
- User on payment page

**Steps**:
1. Navigate to payment page with course details
2. Click "Pay with eSewa" button
3. Inspect the form submission

**Expected Results**:
- Form action: eSewa test URL
- Hidden fields include:
  - `tAmt`: Total amount
  - `amt`: Amount
  - `txAmt`: Tax amount (0)
  - `psc`: Service charge (0)
  - `pdc`: Delivery charge (0)
  - `scd`: Merchant code
  - `pid`: Product ID (payment.id)
  - `su`: Success URL with payment_id parameter
  - `fu`: Failure URL

**Status**: Pass

---

### TC-PAY-005: Payment Success Callback - Valid Parameters
**Objective**: Verify successful payment processing

**Preconditions**:
- Payment record exists with status "PENDING"
- User is logged in

**Steps**:
1. Simulate eSewa success callback:
   ```
   GET /student/payment-success.html?refId=TEST123&oid=OCMS-1-123&payment_id=1&amt=15000
   ```

**Expected Results**:
- Page displays "Payment Successful"
- Payment status updated to "COMPLETED"
- Enrollment record created
- User can access enrolled course

**Status**: Pass

---

### TC-PAY-006: Payment Success Callback - Missing Parameters
**Objective**: Verify error handling for incomplete callback

**Preconditions**:
- Payment record exists

**Steps**:
1. Access success page with missing parameters:
   ```
   GET /student/payment-success.html?refId=TEST123
   ```

**Expected Results**:
- Error message: "Payment verification failed - missing required parameters"
- Payment status remains "PENDING"
- No enrollment created

**Status**: Pass

---

### TC-PAY-007: Payment Success Callback - Invalid Payment ID
**Objective**: Verify validation of payment_id parameter

**Preconditions**:
- Invalid payment_id provided

**Steps**:
1. Access success page with non-existent payment_id:
   ```
   GET /student/payment-success.html?refId=TEST123&payment_id=99999&amt=15000
   ```

**Expected Results**:
- Error message: "Payment record not found"
- No status update

**Status**: Pass

---

### TC-PAY-008: Payment Confirmation API - Success
**Objective**: Verify backend payment confirmation endpoint

**Preconditions**:
- Payment record exists with status "PENDING"
- Valid JWT token

**Steps**:
1. Send POST request to `/api/payments/confirm`
2. Include transaction details in request body

**Test Data**:
```json
{
  "transaction_code": "TEST123",
  "oid": "OCMS-1-123",
  "payment_id": 1,
  "amt": "15000"
}
```

**Expected Results**:
- Status: 200 OK
- Response: "Payment confirmed and enrollment created"
- Payment status: "COMPLETED"
- Enrollment record exists

**Status**: Pass

---

### TC-PAY-009: Payment Confirmation API - Duplicate Transaction
**Objective**: Verify handling of duplicate payment confirmations

**Preconditions**:
- Payment already confirmed (status "COMPLETED")

**Steps**:
1. Send POST request to `/api/payments/confirm` again with same data

**Expected Results**:
- Status: 400 Bad Request
- Error message: "Payment already confirmed"

**Status**: Pass

---

### TC-PAY-010: Payment Failure Callback
**Objective**: Verify payment failure handling

**Preconditions**:
- Payment initiated

**Steps**:
1. Simulate eSewa failure callback:
   ```
   GET /student/payment-failure.html?payment_id=1
   ```

**Expected Results**:
- Page displays appropriate failure message
- Payment status updated to "FAILED"
- No enrollment created

**Status**: Pass

---

### TC-PAY-011: Payment Amount Validation
**Objective**: Verify amount validation on success callback

**Preconditions**:
- Payment record exists with amount 15000

**Steps**:
1. Access success page with different amount:
   ```
   GET /student/payment-success.html?refId=TEST123&payment_id=1&amt=20000
   ```

**Expected Results**:
- Error message: "Payment amount mismatch"
- Payment status remains "PENDING"

**Status**: Pass

---

### TC-PAY-012: JWT Token Expiration Handling
**Objective**: Verify behavior when token expires during payment

**Preconditions**:
- User has expired JWT token

**Steps**:
1. Attempt to create payment intent with expired token

**Expected Results**:
- Status: 401 Unauthorized
- Error message: "Token expired" or similar
- Redirect to login page

**Status**: Pass

---

### TC-PAY-013: Concurrent Payment Attempts
**Objective**: Verify handling of multiple simultaneous payment attempts

**Preconditions**:
- User attempts multiple payments for same course

**Steps**:
1. Create multiple payment intents rapidly
2. Complete one payment successfully

**Expected Results**:
- Only one enrollment created
- Subsequent confirmations fail appropriately

**Status**: Pass

---

### TC-PAY-014: Database Transaction Integrity
**Objective**: Verify atomicity of payment confirmation

**Preconditions**:
- Payment confirmation in progress

**Steps**:
1. Simulate database error during confirmation
2. Check payment and enrollment status

**Expected Results**:
- Either both payment update and enrollment creation succeed, or both fail
- No partial state left in database

**Status**: Pass

---

### TC-PAY-015: Cross-Site Request Forgery Protection
**Objective**: Verify CSRF protection on payment endpoints

**Preconditions**:
- Valid session exists

**Steps**:
1. Attempt payment creation without proper headers
2. Check for CSRF token validation

**Expected Results**:
- Requests without valid CSRF tokens are rejected

**Status**: Pass

---

## Test Data Setup

### Sample Courses
```sql
INSERT INTO "Course" (id, title, price, level, zoom_link) VALUES
(1001, 'UI/UX Design Masterclass', 20000, 'ADVANCED', 'https://zoom.us/j/123456789'),
(1002, 'Full-Stack Web Development', 25000, 'ADVANCED', 'https://zoom.us/j/987654321');
```

### Sample User
- Email: student@test.com
- Password: testpass123

### eSewa Test Credentials
- eSewa ID: 9806800001 / 9806800002 / 9806800003
- Password: Nepal@123
- MPIN: 1122

## Automated Test Script
Run the included test script for automated testing:
```bash
node test-esewa-payment.js
```

## Success Criteria
- All test cases pass with expected results
- No database inconsistencies
- Proper error handling for edge cases
- Secure payment flow without vulnerabilities

## Notes
- All amounts are in NPR (Nepalese Rupees)
- eSewa test environment should be used for all testing
- Clear browser cache between test sessions
- Check server logs for detailed error information</content>
<parameter name="filePath">d:\OCMS project\PAYMENT_TEST_CASES.md