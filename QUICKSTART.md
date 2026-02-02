# Quick Start - eSewa Payment Integration

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy and rename `.env.example` to `.env`:
```bash
cp .env.example .env
```

The default test credentials are already configured. No changes needed for testing!

### 3. Start Server
```bash
npm start
```

### 4. Test Payment
1. Visit: http://localhost:3000
2. Login as student
3. Select any course
4. Click "Enroll" or "Pay Now"
5. Use eSewa test credentials:
   - **ID:** 9806800001
   - **Password:** Nepal@123
   - **MPIN:** 1122

---

## 🔑 Test Credentials

### eSewa Test Account
```
ID: 9806800001, 9806800002, 9806800003
Password: Nepal@123
MPIN: 1122
```

### Merchant Credentials (Test Environment)
```
Merchant ID: EPAYTEST
Secret Key: 8gBm/:&EnhH.1/q
```

---

## 📂 Key Files Modified

| File | What Changed |
|------|--------------|
| `src/controllers/payments.controller.js` | Stripe → eSewa backend logic |
| `publicc/student/payment.js` | Stripe Elements → eSewa redirect |
| `publicc/student/payment.html` | UI updated for eSewa |
| `publicc/student/payment-success.html` | eSewa callback handling |
| `package.json` | Removed Stripe packages |

---

## 🧪 Testing Tools

### Interactive Test Page
Visit: http://localhost:3000/esewa-test.html
- Test payment creation
- View eSewa parameters
- Redirect to eSewa directly

### Command Line Test
```bash
node test-esewa-payment.js
```

---

## 🔄 Payment Flow

```
Student → Payment Page → Initialize eSewa → Redirect to eSewa
                                                    ↓
Success Page ← Backend Confirms ← eSewa Callback ←┘
```

---

## 📱 For Production

### Get eSewa Account
1. Visit: https://merchant.esewa.com.np
2. Register your business
3. Complete KYC
4. Get production credentials

### Update .env
```env
ESEWA_MERCHANT_ID="your_merchant_id"
ESEWA_SECRET_KEY="your_secret_key"
ESEWA_PAYMENT_URL="https://epay.esewa.com.np/api/epay/main/v2/form"
```

---

## ❓ Common Issues

**Issue:** Payment not working
→ Check if server is running on port 3000
→ Verify JWT token is valid

**Issue:** Signature error
→ Make sure ESEWA_SECRET_KEY matches exactly
→ Check amount format (should be string with 2 decimals)

**Issue:** Redirect not working
→ Verify success_url and failure_url are absolute URLs
→ Check if URLs are accessible

---

## 📚 Documentation

- **Full Integration Guide:** `ESEWA_INTEGRATION.md`
- **Migration Summary:** `MIGRATION_SUMMARY.md`
- **API Reference:** See integration guide

---

## ✅ Quick Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Environment configured (`.env` file exists)
- [ ] Server running (`npm start`)
- [ ] Test credentials ready
- [ ] Payment page accessible
- [ ] eSewa test account works
- [ ] Enrollment created after payment

---

## 🎉 You're Ready!

Everything is set up. Start testing payments with eSewa!

For detailed documentation, see `ESEWA_INTEGRATION.md`

---

*Need help? Check the integration guide or contact eSewa merchant support.*
