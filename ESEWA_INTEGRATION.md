# eSewa Payment Integration Guide

## Overview
This project has been updated to use **eSewa** payment gateway instead of Stripe. eSewa is Nepal's leading digital wallet and payment gateway, making it perfect for accepting payments in NPR (Nepalese Rupees).

## What Changed

### Removed
- ❌ Stripe npm packages (`stripe`, `@stripe/stripe-js`)
- ❌ Stripe.js client-side integration
- ❌ Stripe payment intents and elements
- ❌ Credit card form fields

### Added
- ✅ eSewa payment gateway integration
- ✅ Direct redirect to eSewa for payment
- ✅ Secure HMAC-SHA256 signature generation
- ✅ eSewa test environment support

## Configuration

### 1. Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

#### Test Environment (Default)
The following test credentials are pre-configured:
```env
ESEWA_MERCHANT_ID="EPAYTEST"
ESEWA_SECRET_KEY="8gBm/:&EnhH.1/q"
ESEWA_PAYMENT_URL="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
```

#### Production Environment
Get your production credentials from eSewa merchant account:
```env
ESEWA_MERCHANT_ID="your_actual_merchant_id"
ESEWA_SECRET_KEY="your_actual_secret_key"
ESEWA_PAYMENT_URL="https://epay.esewa.com.np/api/epay/main/v2/form"
```

### 2. Install Dependencies

Remove old Stripe packages and install updated dependencies:

```bash
npm install
```

## How It Works

### Payment Flow

1. **Student initiates payment** → Visits payment page with course details
2. **Backend generates payment data** → Creates payment record and eSewa signature
3. **Redirect to eSewa** → Student is redirected to eSewa payment page
4. **eSewa authentication** → Student logs in and confirms payment
5. **Return to success page** → eSewa redirects back with transaction details
6. **Backend verification** → Server confirms payment and creates enrollment
7. **Access granted** → Student can now access the course

### Payment Signature

For security, eSewa requires HMAC-SHA256 signature:
```javascript
message = `total_amount=${amount},transaction_uuid=${uuid},product_code=${merchant_id}`
signature = HMAC-SHA256(message, secret_key).base64()
```

## Testing

### Using eSewa Test Environment

1. **Test Credentials** (already configured):
   - Merchant ID: `EPAYTEST`
   - Secret Key: `8gBm/:&EnhH.1/q`

2. **Test eSewa Account**:
   - ID: `9806800001`, `9806800002`, etc.
   - Password: `Nepal@123`
   - MPIN: `1122`

3. **Test Payment Flow**:
   ```bash
   npm start
   # Visit http://localhost:3000
   # Login as student
   # Select a course and click "Enroll"
   # You'll be redirected to eSewa test environment
   # Use test credentials above to complete payment
   ```

### Development Testing

The payment-success page includes a test button for localhost:
- Simulates successful payment without going through eSewa
- Only appears on localhost/127.0.0.1
- Useful for testing enrollment and course access

## API Changes

### Create Payment Intent
**Endpoint**: `POST /api/payments/create-intent`

**Request**:
```json
{
  "course_id": 1,
  "amount": 15000
}
```

**Response** (Changed from Stripe):
```json
{
  "payment_id": 123,
  "transaction_uuid": "OCMS-123-1234567890",
  "amount": "15000.00",
  "currency": "NPR",
  "esewa_payment_url": "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  "esewa_params": {
    "amount": "15000.00",
    "tax_amount": "0",
    "total_amount": "15000.00",
    "transaction_uuid": "OCMS-123-1234567890",
    "product_code": "EPAYTEST",
    "product_service_charge": "0",
    "product_delivery_charge": "0",
    "success_url": "http://localhost:3000/student/payment-success.html?payment_id=123",
    "failure_url": "http://localhost:3000/student/payment.html?payment_failed=true",
    "signed_field_names": "total_amount,transaction_uuid,product_code",
    "signature": "generated_signature_here"
  }
}
```

### Confirm Payment
**Endpoint**: `POST /api/payments/confirm`

**Request** (Changed from Stripe):
```json
{
  "transaction_code": "0000ABC",
  "transaction_uuid": "OCMS-123-1234567890",
  "payment_id": 123,
  "total_amount": "15000"
}
```

**Response**:
```json
{
  "message": "Payment confirmed and enrollment created",
  "payment": {
    "id": 123,
    "amount": 15000,
    "status": "COMPLETED",
    "transaction_id": "0000ABC"
  }
}
```

## Frontend Changes

### Payment Page (`publicc/student/payment.html`)
- Removed Stripe Elements container
- Changed payment button from "💳 Credit/Debit Card" to "🟢 eSewa"
- Added eSewa payment information box
- Removed Stripe.js script

### Payment Script (`publicc/student/payment.js`)
- Removed Stripe.js initialization
- Removed card elements mounting
- Added eSewa form auto-submission
- Changed from `confirmPayment` to form POST redirect

### Success Page (`publicc/student/payment-success.html`)
- Changed from `payment_intent` to `refId` parameter
- Updated to handle eSewa transaction codes
- Modified verification logic for eSewa response

## Migration Checklist

- [x] Updated backend payment controller
- [x] Replaced Stripe with eSewa integration
- [x] Updated frontend payment page
- [x] Modified payment success verification
- [x] Removed Stripe dependencies from package.json
- [x] Created .env.example with eSewa config
- [x] Updated documentation

## Getting eSewa Merchant Account

### For Production

1. **Visit eSewa Merchant Portal**: https://merchant.esewa.com.np
2. **Sign Up**: Register your business
3. **KYC Verification**: Submit required documents
4. **Get Credentials**: Receive Merchant ID and Secret Key
5. **Integration**: Update .env with production credentials

### Documents Required
- Business registration certificate
- PAN certificate
- Citizenship/passport
- Bank account details

## Support

### eSewa Support
- Website: https://esewa.com.np
- Merchant Support: merchant@esewa.com.np
- Phone: 01-5970002, 01-5970003

### Common Issues

**Issue**: Payment not completing
- **Solution**: Check if using correct test credentials
- **Solution**: Verify ESEWA_PAYMENT_URL is correct

**Issue**: Signature mismatch
- **Solution**: Ensure ESEWA_SECRET_KEY matches your merchant account
- **Solution**: Check that message format is: `total_amount=X,transaction_uuid=Y,product_code=Z`

**Issue**: Redirect not working
- **Solution**: Verify success_url and failure_url are accessible
- **Solution**: Check that URLs are absolute (include http://https://)

## Security Notes

1. **Never commit .env file** - It contains secret keys
2. **Use environment variables** - Don't hardcode credentials
3. **Validate on server** - Always verify payments server-side
4. **HTTPS in production** - Use SSL certificates
5. **Signature verification** - Always validate eSewa response signature

## Additional Resources

- [eSewa API Documentation](https://developer.esewa.com.np)
- [eSewa Integration Guide](https://developer.esewa.com.np/pages/Epay)
- [Test Environment Details](https://developer.esewa.com.np/pages/Test)

---

**Last Updated**: February 2, 2026  
**Version**: 2.0.0 (eSewa Integration)
