import nodemailer from 'nodemailer';

// Create transporter using Gmail SMTP
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: 'fureversteffie@gmail.com',
            pass: 'htyq oijh ugoi echv', // App password
        },
    });
};

// Generate WhatsApp link for measurement reminder
const generateMeasurementWhatsAppLink = (orderDetails) => {
    const phoneNumber = '917042212942'; // Replace with your actual WhatsApp business number
    const message = `Hi! I received a reminder about sharing measurements for my order (ID: ${orderDetails.orderId}). I need to provide my pet's measurements. Can you guide me?`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};

// Generate measurement reminder email HTML
const generateMeasurementReminderHTML = (orderData) => {
    const { customer, items, orderId, orderNumber } = orderData;

    const itemsHTML = items.map(item => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px;">
        <div style="display: flex; align-items: center;">
          <img src="${item.image || '/images/logo.png'}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px;">
          <div>
            <div style="font-weight: 600; color: #1f2937;">${item.name}</div>
            <div style="color: #6b7280; font-size: 14px;">${item.subcategory || item.category}</div>
            <div style="color: #6b7280; font-size: 12px;">
              Size ${item.selectedSize}
            </div>
          </div>
        </div>
      </td>
    </tr>
  `).join('');

    const whatsappLink = generateMeasurementWhatsAppLink({ orderId });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Measurement Reminder - Furever Steffie</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <img src="https://res.cloudinary.com/di6unrpjw/image/upload/v1726659361/logo_transparent_background_ckgiar.png" alt="Furever Steffie" style="height: 60px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">📏 Measurement Reminder</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">We need your pet's measurements to ensure the perfect fit!</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">Hello ${customer.fullName}! 👋</h2>
                <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.6;">
                    We're ready to start working on your order <strong>#${orderNumber}</strong>, but we need your pet's measurements first to ensure a perfect fit!
                </p>
            </div>

            <!-- Order Items -->
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; display: flex; align-items: center;">
                    📦 Your Order Items
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                    ${itemsHTML}
                </table>
            </div>

            <!-- Measurement Instructions -->
            <div style="background-color: #fff7ed; border: 2px solid #fed7aa; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <h3 style="color: #ea580c; margin: 0 0 16px 0; font-size: 18px; display: flex; align-items: center;">
                    📏 Required Measurements
                </h3>
                <div style="color: #9a3412; line-height: 1.6;">
                    <p style="margin: 0 0 12px 0; font-weight: 600;">Please provide the following measurements in centimeters (cm):</p>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;"><strong>Neck Circumference:</strong> Measure around the base of your pet's neck</li>
                        <li style="margin-bottom: 8px;"><strong>Chest Circumference:</strong> Measure around the widest part of the chest</li>
                        <li style="margin-bottom: 8px;"><strong>Back Length:</strong> Measure from the base of neck to the base of tail</li>
                    </ul>
                </div>
            </div>

            <!-- How to Share -->
            <div style="background-color: #f0f9ff; border: 2px solid #93c5fd; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <h3 style="color: #1d4ed8; margin: 0 0 16px 0; font-size: 18px;">📸 How to Share Measurements</h3>
                <div style="color: #1e40af; line-height: 1.6;">
                    <p style="margin: 0 0 12px 0;">You can share your pet's measurements in any of these ways:</p>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;">Reply to this email with the measurements</li>
                        <li style="margin-bottom: 8px;">Send a photo with measurements marked</li>
                        <li style="margin-bottom: 8px;">Contact us via WhatsApp (link below)</li>
                    </ul>
                </div>
            </div>

            <!-- CTA Buttons -->
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; margin: 0 10px 15px 10px;">
                    <a href="${whatsappLink}" style="display: inline-block; background: linear-gradient(135deg, #25d366 0%, #128c7e 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        💬 WhatsApp Us
                    </a>
                </div>
                <div style="display: inline-block; margin: 0 10px 15px 10px;">
                    <a href="mailto:fureversteffie@gmail.com?subject=Measurements for Order ${orderNumber}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        📧 Reply via Email
                    </a>
                </div>
            </div>

            <!-- Footer Note -->
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.5;">
                    <strong>Need help with measurements?</strong><br>
                    Don't worry! Our team is here to guide you through the process. 
                    Just reach out and we'll help you get the perfect measurements for your furry friend! 🐕❤️
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #1f2937; padding: 30px 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">Thank you for choosing Furever Steffie!</p>
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
                This is an automated reminder. Please don't reply directly to this email address.
                <br>For support, contact us via WhatsApp or email fureversteffie@gmail.com
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
        const { orderId, orderNumber, customer, items } = req.body;

        if (!orderId || !customer || !customer.email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Create transporter
        const transporter = createTransporter();

        // Generate email HTML
        const emailHTML = generateMeasurementReminderHTML({
            orderId,
            orderNumber,
            customer,
            items: items || []
        });

        // Email options
        const mailOptions = {
            from: {
                name: 'Furever Steffie',
                address: 'fureversteffie@gmail.com'
            },
            to: customer.email,
            subject: `📏 Measurement Reminder - Order #${orderNumber} | Furever Steffie`,
            html: emailHTML,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Measurement reminder email sent:', info.messageId);

        // Send WhatsApp message via Aisensy API
        const customerPhone = customer.mobileNumber;
        const customerName = customer.fullName || 'Customer';

        if (customerPhone) {
            try {
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
                    campaignName: "measurement_reminder_v1",
                    destination: formattedPhone,
                    userName: customerName,
                    templateParams: [
                        customerName,     // 1st param: Customer name
                        orderNumber      // 2nd param: Order ID
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
                    console.log('✅ WhatsApp measurement reminder sent successfully');
                } else {
                    console.error('❌ WhatsApp API error:', whatsappData);
                }
            } catch (whatsappError) {
                console.error('❌ WhatsApp reminder error:', whatsappError);
                // Don't fail the entire request if WhatsApp fails
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Measurement reminder sent successfully (Email + WhatsApp)',
            emailId: info.messageId
        });

    } catch (error) {
        console.error('❌ Error sending measurement reminder:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send measurement reminder',
            error: error.message
        });
    }
}