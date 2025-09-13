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
    const { 
      customerName, 
      customerPhone, 
      orderId, 
      items, 
      totalAmount, 
      orderDate 
    } = req.body;

    if (!customerName || !customerPhone || !orderId || !items || !totalAmount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields for WhatsApp confirmation' 
      });
    }

    console.log('📱 Sending WhatsApp confirmation...');

    // Calculate estimated delivery (5-6 days from order date)
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 6);
    const estimatedDelivery = deliveryDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    // Format items list for WhatsApp message
    const itemsList = items.map(item => {
      const quantity = item.quantity > 1 ? ` x${item.quantity}` : '';
      return `${item.category || item.name}${quantity}`;
    }).join(', ');

    // Format phone number (ensure it starts with country code)
    let formattedPhone = customerPhone;
    if (!formattedPhone.startsWith('+')) {
      // If it's an Indian number starting with 9, add +91
      if (formattedPhone.startsWith('9') && formattedPhone.length === 10) {
        formattedPhone = '+91' + formattedPhone;
      } else if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
        formattedPhone = '+' + formattedPhone;
      } else if (!formattedPhone.startsWith('+91') && formattedPhone.length === 10) {
        formattedPhone = '+91' + formattedPhone;
      }
    }

    // Prepare WhatsApp API payload
    const whatsappPayload = {
      apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWY2NTFmNmI2M2Q3MTAxMjEyNWQzMyIsIm5hbWUiOiJGdXJldmVyIFN0ZWZmaWUiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjhhZjY1MWY2YjYzZDcxMDEyMTI1ZDJlIiwiYWN0aXZlUGxhbiI6IkZSRUVfRk9SRVZFUiIsImlhdCI6MTc1NjMyNTE1MX0.E2uQFrfRq3hvRvGRK4-3fROUtc7pgrDLIOyoLXZ4Y98",
      campaignName: "order_confirmation",
      destination: formattedPhone,
      userName: customerName,
      templateParams: [
        customerName,           // 1st param: Customer name
        orderId,               // 2nd param: Order ID
        itemsList,             // 3rd param: Items list
        `₹${totalAmount}`,     // 4th param: Total price
        estimatedDelivery      // 5th param: Estimated delivery
      ]
    };

    console.log('📱 WhatsApp payload:', JSON.stringify(whatsappPayload, null, 2));

    // Send WhatsApp message via AiSensy API
    const whatsappResponse = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(whatsappPayload)
    });

    const whatsappData = await whatsappResponse.json();
    console.log('📱 WhatsApp API response:', whatsappData);

    if (whatsappResponse.ok) {
      console.log('✅ WhatsApp confirmation sent successfully');
      return res.status(200).json({
        success: true,
        message: 'WhatsApp confirmation sent successfully',
        whatsappResponse: whatsappData,
        formattedPhone,
        estimatedDelivery
      });
    } else {
      console.error('❌ WhatsApp API error:', whatsappData);
      return res.status(400).json({
        success: false,
        message: 'Failed to send WhatsApp confirmation',
        error: whatsappData
      });
    }

  } catch (error) {
    console.error('❌ WhatsApp confirmation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send WhatsApp confirmation',
      error: error.message
    });
  }
}