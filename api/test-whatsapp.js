// Test WhatsApp messaging endpoint
const MSG91_AUTH_KEY = "464925AYkG1psqH0oB68a22c76P1";

const sendTestWhatsAppMessage = async (mobileNumber, message) => {
  try {
    console.log(`📱 Sending test WhatsApp to ${mobileNumber}`);
    
    // Format mobile number - ensure it has country code
    let formattedNumber = mobileNumber.replace(/\D/g, ''); // Remove non-digits
    
    // Add country code if not present (assuming India +91)
    if (!formattedNumber.startsWith('91') && formattedNumber.length === 10) {
      formattedNumber = '91' + formattedNumber;
    }
    
    const payload = {
      integrated_number: "918828145667", // Your business WhatsApp number
      content_type: "text",
      payload: {
        text: message
      },
      recipient_whatsapp: formattedNumber
    };

    const response = await fetch("https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': MSG91_AUTH_KEY
      },
      body: JSON.stringify(payload)
    });

    console.log('MSG91 Response status:', response.status);
    
    let result;
    try {
      const responseText = await response.text();
      console.log('MSG91 Response text:', responseText);
      
      if (responseText) {
        result = JSON.parse(responseText);
      } else {
        result = { error: 'Empty response from MSG91' };
      }
    } catch (parseError) {
      console.error('Error parsing MSG91 response:', parseError);
      result = { error: 'Invalid JSON response from MSG91' };
    }
    
    // Check for specific MSG91 errors
    const isSuccess = response.ok && (result.type === 'success' || result.status === 'success');
    
    return {
      success: isSuccess,
      result,
      formattedNumber,
      msg91Status: response.status,
      msg91Error: result.errors || result.error
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      formattedNumber: null
    };
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST method allowed" });
  }

  try {
    const { mobileNumber, customMessage } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    const testMessage = customMessage || `🧪 *Test Message from Furever!*

Hi there! 

This is a test message to verify our WhatsApp integration is working properly.

📏 *Measurement Instructions:*

For the perfect fit of your pup's outfit, please measure:

1️⃣ *Neck Circumference* - Around the neck where collar sits
2️⃣ *Chest Circumference* - Around the widest part of chest  
3️⃣ *Back Length* - From collar to tail

Thanks for testing! 🐾

*Team Furever*
📞 +91 88281 45667`;

    const result = await sendTestWhatsAppMessage(mobileNumber, testMessage);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "WhatsApp message sent successfully",
        formattedNumber: result.formattedNumber,
        result: result.result
      });
    } else {
      // Handle specific MSG91 errors
      let errorMessage = "Failed to send WhatsApp message";
      
      if (result.msg91Error) {
        if (result.msg91Error.includes("WhatsApp not integrated")) {
          errorMessage = "WhatsApp number not integrated with MSG91. Please verify business number setup.";
        } else {
          errorMessage = `MSG91 Error: ${result.msg91Error}`;
        }
      }
      
      return res.status(400).json({
        success: false,
        message: errorMessage,
        error: result.error || result.result,
        formattedNumber: result.formattedNumber,
        msg91Status: result.msg91Status,
        msg91Error: result.msg91Error
      });
    }

  } catch (error) {
    console.error("❌ Test WhatsApp API error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while sending WhatsApp",
      error: error.message
    });
  }
}
