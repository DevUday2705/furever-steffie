import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST method allowed" });
    }

    try {
        const {
            customerName,
            customerEmail,
            orderId,
            trackingId,
            expectedDelivery,
            customerCity,
            courierPartner,
            items = []
        } = req.body;

        if (!customerName || !customerEmail || !orderId || !trackingId || !expectedDelivery || !customerCity) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields for shipped notification"
            });
        }

        // Create transporter
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Generate items list HTML
        const itemsListHtml = items.map(item => `
            <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                <img src="${item.image || ''}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 12px;">
                <div>
                    <p style="margin: 0; font-weight: 600; color: #333;">${item.name}</p>
                    <p style="margin: 2px 0 0 0; font-size: 14px; color: #666;">Size: ${item.size} | Qty: ${item.quantity}</p>
                </div>
            </div>
        `).join('');

        const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Order is On The Way! 🚚</title>
            <style>
                body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; }
                .content { padding: 30px 20px; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
                .btn { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
                .tracking-card { background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #28a745; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                .info-item { background: #f8f9fa; padding: 15px; border-radius: 8px; }
                .items-container { background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; }
                .status-badge { background: #28a745; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🚚 Your Order is On The Way!</h1>
                    <p style="color: #e0e6ff; margin: 10px 0 0 0; font-size: 16px;">Your furry friend's outfit is coming soon!</p>
                </div>

                <!-- Content -->
                <div class="content">
                    <p>Dear <strong>${customerName}</strong>,</p>
                    
                    <p>Great news! Your order has been dispatched and is on its way to you. Here are your shipping details:</p>

                    <!-- Tracking Information -->
                    <div class="tracking-card">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="margin: 0; color: #333;">📦 Tracking Information</h3>
                            <span class="status-badge">SHIPPED</span>
                        </div>
                        
                        <div class="info-grid">
                            <div class="info-item">
                                <p style="margin: 0; font-size: 14px; color: #666;">Order ID</p>
                                <p style="margin: 5px 0 0 0; font-weight: 600; color: #333;">#${orderId}</p>
                            </div>
                            <div class="info-item">
                                <p style="margin: 0; font-size: 14px; color: #666;">Tracking ID</p>
                                <p style="margin: 5px 0 0 0; font-weight: 600; color: #333;">${trackingId}</p>
                            </div>
                            <div class="info-item">
                                <p style="margin: 0; font-size: 14px; color: #666;">Expected Delivery</p>
                                <p style="margin: 5px 0 0 0; font-weight: 600; color: #333;">${expectedDelivery}</p>
                            </div>
                            <div class="info-item">
                                <p style="margin: 0; font-size: 14px; color: #666;">Delivery City</p>
                                <p style="margin: 5px 0 0 0; font-weight: 600; color: #333;">${customerCity}</p>
                            </div>
                        </div>

                        ${courierPartner ? `
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0; font-size: 14px; color: #666;">Courier Partner</p>
                            <p style="margin: 5px 0 0 0; font-weight: 600; color: #333;">${courierPartner}</p>
                        </div>
                        ` : ''}
                    </div>

                    ${items.length > 0 ? `
                    <!-- Order Items -->
                    <div class="items-container">
                        <h3 style="margin: 0 0 15px 0; color: #333;">📋 Your Order Items</h3>
                        ${itemsListHtml}
                    </div>
                    ` : ''}

                    <!-- Action Buttons -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://www.fureversteffie.com/track-order?tracking=${trackingId}" class="btn" style="background: #007bff;">
                            🔍 Track Your Package
                        </a>
                        <a href="https://www.fureversteffie.com/contact" class="btn" style="background: #28a745;">
                            💬 Contact Support
                        </a>
                    </div>

                    <!-- Delivery Instructions -->
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #856404;">📋 Delivery Instructions</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #856404;">
                            <li>Please ensure someone is available at the delivery address</li>
                            <li>Valid ID proof may be required at the time of delivery</li>
                            <li>In case of non-delivery, the package will be returned to the local office</li>
                            <li>Contact our support team for any delivery concerns</li>
                        </ul>
                    </div>

                    <!-- Care Instructions -->
                    <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #0c5460;">🧼 Care Instructions</h4>
                        <p style="margin: 0; color: #0c5460;">
                            To keep your pet's outfit in perfect condition, please follow the care instructions included in the package. 
                            Hand wash with mild detergent and air dry for best results.
                        </p>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p>Thank you for choosing Furever Steffie! We hope your pet loves their new outfit.</p>
                        <p style="color: #666; font-size: 14px; margin-top: 20px;">
                            <em>If you have any questions about your order, please don't hesitate to contact our customer support team.</em>
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p style="margin: 0 0 10px 0;"><strong>Furever Steffie</strong></p>
                    <p style="margin: 0;">Making every pet look pawsome! 🐾</p>
                    <p style="margin: 10px 0 0 0;">
                        <a href="https://www.fureversteffie.com" style="color: #007bff; text-decoration: none;">www.fureversteffie.com</a> | 
                        <a href="https://www.fureversteffie.com/contact" style="color: #007bff; text-decoration: none;">Contact Us</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;

        const mailOptions = {
            from: {
                name: 'Furever Steffie',
                address: process.env.EMAIL_USER
            },
            to: customerEmail,
            subject: `🚚 Your Order #${orderId} is On The Way! - Tracking: ${trackingId}`,
            html: emailHtml
        };

        console.log(`📧 Sending delivery notification email to ${customerEmail}`);

        await transporter.sendMail(mailOptions);

        console.log(`✅ Delivery notification email sent successfully to ${customerEmail}`);

        return res.status(200).json({
            success: true,
            message: "Delivery notification email sent successfully",
            trackingId: trackingId
        });

    } catch (error) {
        console.error("❌ Error sending delivery notification email:", error);

        return res.status(500).json({
            success: false,
            message: "Error sending delivery notification email",
            error: error.message
        });
    }
}