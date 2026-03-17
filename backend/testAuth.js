async function testAuth() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Test User 4",
        email: "test4@example.com",
        password: "password123"
      })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Data:", data);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testAuth();
