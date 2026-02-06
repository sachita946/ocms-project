// Test script for forgot password API
const testForgotPassword = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/password/forgot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'student@ocms.com'
      })
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};

testForgotPassword();