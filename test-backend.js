// Quick test script to verify backend is working
const testBackend = async () => {
  console.log('🧪 Testing backend connection...\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        command: 'calculator kholo', 
        vibe: 'chill' 
      })
    });
    
    const data = await response.json();
    console.log('✅ Backend Response:', data);
    
    if (data.success) {
      console.log('\n🎉 Backend is working perfectly!');
      console.log('Calculator should open now.');
    } else {
      console.log('\n⚠️ Command received but execution failed');
      console.log('Message:', data.message);
    }
  } catch (error) {
    console.log('\n❌ Backend connection failed!');
    console.log('Error:', error.message);
    console.log('\n💡 Make sure backend is running:');
    console.log('   cd backend');
    console.log('   npm start');
  }
};

// Run the test
testBackend();
