import nodemailer from 'nodemailer';

// Create transporter using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'fureversteffie@gmail.com',
      pass: 'htyq oijh ugoi echv', // App password
    },
  });
};

// Generate WhatsApp link
const generateWhatsAppLink = (orderDetails) => {
  const phoneNumber = '918828145667'; // Replace with your actual WhatsApp business number
  const message = `Hi! I just placed an order (ID: ${orderDetails.orderId}) on Furever Steffie. I need to share my pup's exact measurements. Can you help me with the next steps?`;
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};

// Generate order details HTML
const generateOrderDetailsHTML = (orderData) => {
  const { customer, items, amount, orderId, razorpay_payment_id } = orderData;

  const itemsHTML = items.map(item => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px;">
        <div style="display: flex; align-items: center;">
          <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px;">
          <div>
            <div style="font-weight: 600; color: #1f2937;">${item.name}</div>
            <div style="color: #6b7280; font-size: 14px;">${item.subcategory || item.category}</div>
            <div style="color: #6b7280; font-size: 12px;">
              ${item.isBeaded ? "Hand Work" : "Simple"} • 
              ${item.isFullSet ? "Full Set" : item.isDupattaSet ? "Kurta + Dupatta" : "Kurta Only"} • 
              Size ${item.selectedSize}
            </div>
          </div>
        </div>
      </td>
      <td style="padding: 12px 8px; text-align: center; color: #1f2937; font-weight: 600;">
        ${item.quantity || 1}
      </td>
      <td style="padding: 12px 8px; text-align: right; color: #1f2937; font-weight: 600;">
        ₹${(item.price * (item.quantity || 1)).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const whatsappLink = generateWhatsAppLink({ orderId });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Furever Steffie</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 24px; text-align: center;">
          <div style="margin-bottom: 16px;">
            <img src="https://furever-steffie.vercel.app/images/logo.jpg" alt="Furever Steffie Logo" style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.3); object-fit: cover;">
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Order Confirmed!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Thank you for choosing Furever Steffie</p>
        </div>

        <!-- Success Message -->
        <div style="padding: 32px 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          <div style="background-color: #10b981; color: white; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 600;">🎉 Your Order is Successfully Placed!</h2>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            We're excited to create something special for your furry friend! Your custom pet clothing is now in our production queue.
          </p>

          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">📏 Next Step: Share Your Pup's Measurements</h3>
            <p style="color: #92400e; margin: 0 0 16px 0; font-size: 14px; line-height: 1.5;">
              To ensure the perfect fit, please contact us on WhatsApp to share your pet's exact measurements. Our team will guide you through the process!
            </p>
            <a href="${whatsappLink}" style="display: inline-block; background-color: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              📱 Contact us on WhatsApp
            </a>
          </div>
        </div>

        <!-- Order Details -->
        <div style="padding: 32px 24px;">
          <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Order Details</h3>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Order ID</div>
                <div style="color: #1f2937; font-weight: 600; font-family: monospace;">${orderId}</div>
              </div>
              <div>
                <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Payment ID</div>
                <div style="color: #1f2937; font-weight: 600; font-family: monospace;">${razorpay_payment_id}</div>
              </div>
              <div>
                <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Order Date</div>
                <div style="color: #1f2937; font-weight: 600;">${new Date().toLocaleDateString()}</div>
              </div>
              <div>
                <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Total Amount</div>
                <div style="color: #1f2937; font-weight: 600; font-size: 18px;">₹${amount.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <h4 style="color: #1f2937; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Ordered Items</h4>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px 8px; text-align: left; color: #374151; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Item</th>
                <th style="padding: 12px 8px; text-align: center; color: #374151; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Qty</th>
                <th style="padding: 12px 8px; text-align: right; color: #374151; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <!-- Shipping Address -->
          <div style="margin-top: 32px;">
            <h4 style="color: #1f2937; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Shipping Address</h4>
            <div style="background-color: #f9fafb; padding: 16px; border-radius: 12px;">
              <div style="color: #1f2937; font-weight: 600; margin-bottom: 8px;">${customer.fullName}</div>
              <div style="color: #6b7280; line-height: 1.5;">
                ${customer.addressLine1}<br>
                ${customer.addressLine2 ? customer.addressLine2 + '<br>' : ''}
                ${customer.city}, ${customer.state} ${customer.pincode}<br>
                Phone: ${customer.mobileNumber}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0 0 16px 0; font-size: 14px;">
            Need help? Contact us at 
            <a href="mailto:fureversteffie@gmail.com" style="color: #667eea; text-decoration: none;">fureversteffie@gmail.com</a>
          </p>
          
          <div style="margin-top: 20px;">
            <a href="${whatsappLink}" style="display: inline-block; background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 0 8px;">
              Continue on WhatsApp
            </a>
          </div>
          
          <p style="color: #9ca3af; margin: 20px 0 0 0; font-size: 12px;">
            © 2025 Furever Steffie. Made with ❤️ for your furry friends.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST method allowed' });
  }

  try {
    const orderData = req.body;
    const { customer, orderId } = orderData;

    if (!customer?.fullName || !customer?.email || !customer?.addressLine1) {
      return res.status(400).json({ message: 'Missing required customer information (name, email, or address)' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: '"Furever Steffie" <fureversteffie@gmail.com>',
      to: customer.email, // Use the email from the form
      subject: `🎉 Order Confirmed - ${orderId} | Furever Steffie`,
      html: generateOrderDetailsHTML(orderData),
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Order confirmation email sent:', info.messageId);

    res.status(200).json({
      success: true,
      message: 'Order confirmation email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send confirmation email',
      error: error.message
    });
  }
}
