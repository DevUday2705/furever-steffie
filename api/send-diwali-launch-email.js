import nodemailer from 'nodemailer';

// Create transporter using Gmail SMTP (same as other email APIs)
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'fureversteffie@gmail.com',
            pass: 'htyq oijh ugoi echv', // App password
        },
    });
};

// HTML email template
const createDiwaliEmailTemplate = (customerName) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Furever - Diwali Collection Launch</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #fef7f0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #fb7185, #f472b6); padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .highlight-box { background: linear-gradient(135deg, #fed7aa, #fecaca); padding: 20px; border-radius: 12px; margin: 20px 0; }
        .offer-box { background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #f97316, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .product-grid { display: flex; gap: 15px; margin: 20px 0; }
        .product-card { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        .tip-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        ul li { margin: 8px 0; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🎉 We're Back with Diwali Magic!</h1>
            <p>Orders are officially LIVE with exclusive festive collections</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <h2>Dear ${customerName},</h2>
            
            <p>Great news! 🎊 Orders are officially <strong>LIVE</strong> again, and we have something special just for you!</p>
            
            <!-- Diwali Collection Highlight -->
            <div class="highlight-box">
                <h3 style="margin: 0 0 10px 0; color: #ea580c;">🪔 Exclusive Diwali Collection Launch</h3>
                <p style="margin: 0; color: #9a3412;">We've launched beautiful new festive outfits perfect for Diwali celebrations! Your furry friend will shine brighter than diyas this season.</p>
            </div>

            <!-- New Products Showcase -->
            <h3>✨ Featured Diwali Launches</h3>
            <div class="product-grid">
                <div class="product-card">
                    <h4 style="color: #dc2626; margin: 0 0 8px 0;">Royal Diwali Kurta</h4>
                    <p style="font-size: 14px; color: #6b7280; margin: 0;">Traditional elegance with golden embroidery</p>
                </div>
                <div class="product-card">
                    <h4 style="color: #dc2626; margin: 0 0 8px 0;">Festive Bandana Set</h4>
                    <p style="font-size: 14px; color: #6b7280; margin: 0;">Sparkly designs for celebration vibes</p>
                </div>
                <div class="product-card">
                    <h4 style="color: #dc2626; margin: 0 0 8px 0;">Diwali Bow Ties</h4>
                    <p style="font-size: 14px; color: #6b7280; margin: 0;">Classic formal wear for festive photos</p>
                </div>
            </div>

            <!-- Special Offer -->
            <div class="offer-box">
                <h3 style="margin: 0 0 15px 0; color: #be185d;">🎁 Special Launch Offer Just for You</h3>
                <ul style="margin: 0; padding-left: 20px; color: #831843;">
                    <li><strong>FUREVER5</strong> - Get flat 5% OFF on all orders</li>
                    <li><strong>FREE AIR Delivery</strong> - Aiming for delivery by/before Diwali*</li>
                    <li><strong>Same/Next Day Dispatch</strong> - No more waiting!</li>
                </ul>
                <p style="font-size: 12px; color: #9f1239; margin: 10px 0 0 0;">*We aim for Diwali delivery but cannot guarantee due to logistics. All orders dispatched same/next day.</p>
            </div>

            <!-- Pro Tip -->
            <div class="tip-box">
                <p style="margin: 0; color: #92400e;"><strong>💡 Pro Tip:</strong> Use our new size filter on the products page to find outfits available in your pet's size instantly! No more browsing through sold-out options.</p>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.fureversteffie.com/kurta?sort=popularity" class="cta-button">
                    🛍️ Shop Diwali Collection Now
                </a>
            </div>

            <p>Visit our products page, filter by your pet's size, and place your order today. Your furry friend deserves to shine this Diwali! ✨</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p><strong>Happy Shopping & Happy Diwali! 🪔</strong></p>
                <p style="color: #6b7280;">With love,<br/><strong>Team Furever</strong></p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>You received this email because you signed up for notifications when orders resume.</p>
            <p style="margin-top: 10px;">
                <a href="https://fureversteffie.com" style="color: #ec4899;">Visit Website</a> | 
                <a href="mailto:fureversteffie@gmail.com" style="color: #ec4899;">Contact Support</a>
            </p>
        </div>
    </div>
</body>
</html>`;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { recipients } = req.body;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ message: 'Recipients array is required' });
        }

        // Create transporter for this request
        const transporter = createTransporter();

        // Test the connection first
        await transporter.verify();

        // Send emails to all recipients with rate limiting
        const emailPromises = recipients.map(async (recipient, index) => {
            const { email, name } = recipient;

            // Add delay to prevent rate limiting (100ms between emails)
            if (index > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const mailOptions = {
                from: `"Furever - Pet Fashion" <fureversteffie@gmail.com>`,
                to: email,
                subject: "🎉 Diwali Magic is Here! Orders Are LIVE + Exclusive 5% OFF",
                html: createDiwaliEmailTemplate(name || 'Pet Parent'),
            };

            return transporter.sendMail(mailOptions);
        });

        // Wait for all emails to be sent
        const results = await Promise.allSettled(emailPromises);

        // Count successful and failed emails
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        if (failed > 0) {
            console.error(`${failed} emails failed to send out of ${recipients.length}`);
        }

        res.status(200).json({
            message: `Successfully sent Diwali launch emails to ${successful} customers`,
            successful,
            failed,
            total: recipients.length
        });

    } catch (error) {
        console.error('Error sending email blast:', error);
        res.status(500).json({
            message: 'Failed to send emails',
            error: error.message
        });
    }
}