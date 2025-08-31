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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    console.log(`🧪 Testing email service for: ${email}`);

    // Import the email service
    const { default: sendOrderConfirmation } = await import('./send-order-confirmation.js');

    // Create mock request with test data
    const mockReq = {
      method: 'POST',
      body: {
        orderId: `TEST_${Date.now()}`,
        customerEmail: email,
        customerName: 'Test Customer',
        orderDetails: {
          items: [
            {
              name: 'Test Bandana',
              selectedSize: 'M',
              selectedColor: 'Red',
              selectedFabric: 'Cotton',
              quantity: 1,
              price: 599
            }
          ],
          totalAmount: 599,
          currency: 'INR',
          paymentMethod: 'Razorpay'
        },
        shippingAddress: {
          fullName: 'Test Customer',
          addressLine1: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          mobileNumber: '9876543210'
        }
      }
    };

    // Create mock response
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`📧 Email service response [${code}]:`, data);
          return data;
        }
      })
    };

    // Call email service
    await sendOrderConfirmation(mockReq, mockRes);

    return res.status(200).json({
      success: true,
      message: `Test email sent to ${email}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
}
