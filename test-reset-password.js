// Test script for reset password API
const testResetPassword = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/password/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzcwMzE2MTI0LCJleHAiOjE3NzAzMTk3MjR9.4wBvQwpsJpSh2PzuVO3N7fs_vSHZqCmmSS87oiK03ls',
        password: 'newpassword123'
      })
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};

testResetPassword();