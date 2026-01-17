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

        // Require only the essential fields for a shipped notification
        if (!customerName || !customerEmail || !orderId || !trackingId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields for shipped notification"
            });
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fureversteffie@gmail.com',
                pass: 'htyq oijh ugoi echv' // App password
            }
        });

        // Generate items list HTML (if any)
        const itemsListHtml = items.map(item => `
            <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                <img src="${item.image || ''}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 12px;">
                <div>
                    <p style="margin: 0; font-weight: 600; color: #333;">${item.name}</p>
                    <p style="margin: 2px 0 0 0; font-size: 14px; color: #666;">Size: ${item.size || item.selectedSize || 'N/A'} | Qty: ${item.quantity || 1}</p>
                </div>
            </div>
        `).join('');

        // Simple, clear shipped email mentioning Shree Maruti and tracking link
        const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Order Has Been Dispatched</title>
            <style>
                body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f7fafc; }
                .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
                .header { background: #10b981; padding: 20px; text-align: center; color: white; }
                .content { padding: 20px; color: #333; }
                .btn { display: inline-block; padding: 10px 16px; background: #0b74e0; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
                .items { background: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 12px; }
                .footer { padding: 14px; text-align: center; font-size: 13px; color: #888; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2 style="margin:0;">Your Order Has Been Dispatched</h2>
                </div>
                <div class="content">
                    <p>Hi <strong>${customerName}</strong>,</p>

                    <p>Good news — your order <strong>#${orderId}</strong> has been dispatched via <strong>Shree Maruti Courier Service</strong>. The tracking reference for your shipment is:</p>

                    <p style="font-family: monospace; font-weight: 700; font-size: 16px;">${trackingId}</p>

                    <p>You can track your package directly on Shree Maruti's tracking page:</p>

                    <p style="text-align:center; margin: 16px 0;">
                        <a class="btn" href="https://shreemaruti.com/track-shipment/" target="_blank" rel="noopener">Track Your Shipment</a>
                    </p>

                    <p>If the tracking page asks for your reference, please enter the tracking reference shown above.</p>

                    ${items.length > 0 ? `
                    <div class="items">
                        <strong>Items in this shipment</strong>
                        ${itemsListHtml}
                    </div>
                    ` : ''}

                    <p style="margin-top: 16px;">If you have any questions, reply to this email or contact our support and we'll help you out.</p>

                    <p style="margin-top: 8px; color: #666; font-size: 13px;">Thanks for choosing Furever Steffie — we hope your furry friend loves it!</p>
                </div>
                <div class="footer">
                    © Furever Steffie
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
            subject: `🚚 Your Order #${orderId} has been dispatched | Tracking: ${trackingId}`,
            html: emailHtml
        };

        console.log(`📧 Sending shipped notification email to ${customerEmail}`);

        await transporter.sendMail(mailOptions);

        console.log(`✅ Shipped notification email sent successfully to ${customerEmail}`);

        return res.status(200).json({
            success: true,
            message: "Shipped notification email sent successfully",
            trackingId: trackingId
        });

    } catch (error) {
        console.error("❌ Error sending shipped notification email:", error);

        return res.status(500).json({
            success: false,
            message: "Error sending shipped notification email",
            error: error.message
        });
    }
}