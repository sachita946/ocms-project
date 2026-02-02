// Test script for eSewa payment integration
// Run with: node test-esewa-payment.js

import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const API_BASE = 'http://localhost:3000/api';

// Test user token (you'll need to get this from a logged-in user)
const TEST_TOKEN = 'your-jwt-token-here'; // Replace with actual token

// Advanced courses to test
const ADVANCED_COURSES = [
  { id: 1001, name: 'UI/UX Design Masterclass', price: 20000 },
  { id: 1002, name: 'Full-Stack Web Development', price: 25000 },
  { id: 1003, name: 'Backend Development with Node.js', price: 22000 },
  { id: 1004, name: 'Python for Data Science & AI', price: 23000 },
  { id: 1005, name: 'Artificial Intelligence & Machine Learning', price: 28000 }
];

async function testEsewaPaymentFlow() {
  console.log('🧪 Testing eSewa Payment Integration for ALL Advanced Courses (NPR Currency)...\n');

  // Check if eSewa keys are configured
  const esewaMerchantId = process.env.ESEWA_MERCHANT_ID;
  if (!esewaMerchantId) {
    console.log('ℹ️  eSewa merchant ID not configured, using default test credentials.');
    console.log('   Default: ESEWA_MERCHANT_ID=EPAYTEST\n');
  } else {
    console.log('✅ eSewa credentials configured\n');
  }

  // Test each advanced course
  for (const course of ADVANCED_COURSES) {
    console.log(`🎓 Testing Course: ${course.name} (ID: ${course.id}, Price: NPR ${course.price.toLocaleString()})`);

    try {
      // Step 1: Create payment intent
      const createIntentResponse = await fetch(`${API_BASE}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`
        },
        body: JSON.stringify({
          course_id: course.id,
          amount: course.price
        })
      });

      const intentData = await createIntentResponse.json();

      if (!createIntentResponse.ok) {
        console.log(`❌ Payment intent failed: ${intentData.message}`);
        continue;
      }

      console.log(`✅ Payment intent created successfully`);
      console.log(`   Transaction UUID: ${intentData.transaction_uuid}`);
      console.log(`   Amount: NPR ${intentData.amount}`);
      console.log(`   Payment ID: ${intentData.payment_id}`);
      console.log(`   eSewa URL: ${intentData.esewa_payment_url}`);
      console.log(`   Signature: ${intentData.esewa_params.signature.substring(0, 30)}...`);

      // Step 2: Verify payment form data
      console.log(`\n📋 eSewa Form Parameters:`);
      console.log(`   - amount: ${intentData.esewa_params.amount}`);
      console.log(`   - total_amount: ${intentData.esewa_params.total_amount}`);
      console.log(`   - transaction_uuid: ${intentData.esewa_params.transaction_uuid}`);
      console.log(`   - product_code: ${intentData.esewa_params.product_code}`);
      console.log(`   - success_url: ${intentData.esewa_params.success_url}`);
      console.log(`   - failure_url: ${intentData.esewa_params.failure_url}`);

      console.log(`\n✅ Course ${course.id} payment system working!\n`);

    } catch (error) {
      console.log(`❌ Error testing course ${course.id}: ${error.message}\n`);
    }
  }

  console.log('🎉 Payment testing completed for all advanced courses!');
  console.log('\n💡 To test actual payments:');
  console.log('1. Login as student at http://localhost:3000');
  console.log('2. Visit course pages or use payment URLs:');
  ADVANCED_COURSES.forEach(course => {
    console.log(`   - ${course.name}: /student/payment.html?courseId=${course.id}&price=${course.price}&courseName=${encodeURIComponent(course.name)}`);
  });
  console.log('\n3. Use eSewa test credentials:');
  console.log('   - ID: 9806800001, 9806800002, 9806800003');
  console.log('   - Password: Nepal@123');
  console.log('   - MPIN: 1122');
}

// Run the test
testEsewaPaymentFlow().catch(console.error);
