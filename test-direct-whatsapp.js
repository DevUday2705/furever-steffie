// Direct test of WhatsApp functionality
const MSG91_AUTH_KEY = "464925AYkG1psqH0oB68a22c76P1";

const testDirectWhatsApp = async () => {
  try {
    console.log('🧪 Testing MSG91 WhatsApp API directly...');
    
    const mobileNumber = '9876543210'; // Test number
    let formattedNumber = mobileNumber.replace(/\D/g, '');
    
    if (!formattedNumber.startsWith('91') && formattedNumber.length === 10) {
      formattedNumber = '91' + formattedNumber;
    }
    
    const payload = {
      integrated_number: "918828145667",
      content_type: "text", 
      payload: {
        text: `🧪 *Test Message from Furever!*

Hi there! 

This is a test message to verify our WhatsApp integration is working properly.

📏 *Measurement Instructions:*

For the perfect fit of your pup's outfit, please measure:

1️⃣ *Neck Circumference* - Around the neck where collar sits
2️⃣ *Chest Circumference* - Around the widest part of chest  
3️⃣ *Back Length* - From collar to tail

Thanks for testing! 🐾

*Team Furever*
📞 +91 88281 45667`
      },
      recipient_whatsapp: formattedNumber
    };

    console.log('📤 Sending to MSG91 API...');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch("https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': MSG91_AUTH_KEY
      },
      body: JSON.stringify(payload)
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📊 Response text:', responseText);

    if (responseText) {
      try {
        const result = JSON.parse(responseText);
        console.log('✅ Parsed result:', result);
        
        if (result.type === 'success') {
          console.log('🎉 WhatsApp message sent successfully!');
        } else {
          console.log('❌ WhatsApp sending failed:', result);
        }
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError.message);
      }
    } else {
      console.log('❌ Empty response from MSG91');
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
};

testDirectWhatsApp();
