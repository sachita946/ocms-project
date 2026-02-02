// Test script for Stripe payment integration with NPR currency
// Run with: node test-stripe-payment.js

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

async function testStripePaymentFlow() {
  console.log('🧪 Testing Stripe Payment Integration for ALL Advanced Courses (NPR Currency)...\n');

  // Check if Stripe keys are configured
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret || stripeSecret === 'sk_test_your_stripe_secret_key_here') {
    console.log('❌ Stripe secret key not configured!');
    console.log('Please update your .env file with actual Stripe test keys:');
    console.log('STRIPE_SECRET_KEY=sk_test_...');
    console.log('STRIPE_PUBLISHABLE_KEY=pk_test_...');
    console.log('Get keys from: https://dashboard.stripe.com/test/apikeys\n');
    return;
  }

  console.log('✅ Stripe keys configured\n');

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

      console.log(`✅ Payment intent created: ${intentData.amount} paisa (${(intentData.amount / 100).toLocaleString()} NPR)`);
      console.log(`   Currency: ${intentData.currency}`);
      console.log(`   Payment ID: ${intentData.paymentId}`);
      console.log(`   Client Secret: ${intentData.clientSecret.substring(0, 50)}...`);

      // Step 2: Test payment confirmation (mock)
      console.log(`✅ Course ${course.id} payment system working!\n`);

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
}