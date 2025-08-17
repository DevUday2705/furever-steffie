// WhatsApp messaging utility using MSG91
const MSG91_AUTH_KEY = "464925AYkG1psqH0oB68a22c76P1";
const MSG91_API_URL = "https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/";

/**
 * Send WhatsApp message using MSG91 API
 * @param {string} mobileNumber - Customer's mobile number (with country code)
 * @param {string} message - Message content to send
 * @returns {Promise<boolean>} - Success status
 */
export const sendWhatsAppMessage = async (mobileNumber, message) => {
  try {
    console.log(`📱 Sending WhatsApp to ${mobileNumber}: ${message}`);
    
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

    const response = await fetch(MSG91_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': MSG91_AUTH_KEY
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (response.ok && result.type === 'success') {
      console.log(`✅ WhatsApp sent successfully to ${formattedNumber}`);
      return true;
    } else {
      console.error(`❌ WhatsApp failed:`, result);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ WhatsApp error:`, error);
    return false;
  }
};

/**
 * Generate order confirmation message
 * @param {Object} orderData - Order details
 * @returns {string} - Formatted message
 */
export const generateOrderConfirmationMessage = (orderData) => {
  const { orderNumber, customer, items, amount } = orderData;
  
  // Get first item for main product details
  const firstItem = items[0];
  const itemCount = items.length;
  
  let message = `🎉 *Order Confirmed!*

Hi ${customer.fullName}! 

Your order has been placed successfully:

📦 *Order #${orderNumber}*
💰 Amount: ₹${amount}
📱 Phone: ${customer.mobileNumber}

🐕 *Product Details:*
• ${firstItem.name}
• Size: ${firstItem.selectedSize}`;

  // Add style information if available
  if (firstItem.selectedStyle && firstItem.selectedStyle !== 'simple') {
    const styleMap = {
      'tassels': 'With Tassels',
      'beaded': 'Beaded Luxe',
      'beaded-tassels': 'Beaded + Tassels'
    };
    message += `\n• Style: ${styleMap[firstItem.selectedStyle] || firstItem.selectedStyle}`;
  }

  // Add set information
  if (firstItem.isFullSet) {
    message += `\n• Full Set: Yes`;
  }
  if (firstItem.isDupattaSet) {
    message += `\n• Dupatta Set: Yes`;
  }
  if (firstItem.selectedDhoti) {
    message += `\n• Dhoti: ${firstItem.selectedDhoti}`;
  }

  if (itemCount > 1) {
    message += `\n\n*+ ${itemCount - 1} more item(s)*`;
  }

  message += `

📏 *IMPORTANT - Next Steps:*

To complete your order, we need your pup's exact measurements:

1️⃣ *Neck Circumference* - Measure around the neck where the collar sits
2️⃣ *Chest Circumference* - Measure around the widest part of the chest  
3️⃣ *Back Length* - Measure from collar to tail

📞 *Please reply with measurements in this format:*
Neck: __cm, Chest: __cm, Back: __cm

Our team will contact you within 24 hours for any clarifications.

Thank you for choosing Furever! 🐾

*Team Furever*
📞 +91 88281 45667`;

  return message;
};
