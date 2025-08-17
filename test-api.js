// Simple test script to check WhatsApp API
const testWhatsApp = async () => {
  try {
    console.log('Testing WhatsApp API...');
    
    const response = await fetch('http://localhost:5173/api/test-whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mobileNumber: '9876543210',
        customMessage: 'Test message from API test script'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const text = await response.text();
    console.log('Response text:', text);
    
    if (text) {
      try {
        const json = JSON.parse(text);
        console.log('Parsed JSON:', json);
      } catch (e) {
        console.error('JSON parse error:', e.message);
      }
    }
    
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

testWhatsApp();
