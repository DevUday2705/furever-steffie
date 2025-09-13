export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }

    console.log('🧪 Testing WhatsApp service...');

    // Import the WhatsApp service
    const { default: sendWhatsAppConfirmation } = await import('./send-whatsapp-confirmation.js');

    // Create mock request with test data
    const mockReq = {
      method: 'POST',
      body: {
        customerName: 'Test Customer',
        customerPhone: phone,
        orderId: `order_TEST_${Date.now()}`,
        items: [
          {
            name: 'Test Kurta',
            category: 'kurta',
            quantity: 1
          },
          {
            name: 'Test Bandana',
            category: 'bandana',
            quantity: 2
          }
        ],
        totalAmount: 1999,
        orderDate: new Date().toISOString()
      }
    };

    // Create mock response
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`📱 WhatsApp service response [${code}]:`, data);
          return data;
        }
      })
    };

    // Call WhatsApp service
    await sendWhatsAppConfirmation(mockReq, mockRes);

    return res.status(200).json({
      success: true,
      message: `Test WhatsApp message sent to ${phone}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test WhatsApp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send test WhatsApp message',
      error: error.message
    });
  }
}