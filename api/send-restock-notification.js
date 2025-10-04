import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST method allowed" });
    }

    try {
        const {
            email,
            customerName = "Valued Customer",
            product,
            size,
            isIndividual = false, // Whether this is for a single customer or bulk
            notificationRequestId
        } = req.body;

        if (!email || !product || !size) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields for restock notification"
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

        const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🎉 Great News! Your Item is Back in Stock!</title>
            <style>
                body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 20px; text-align: center; }
                .content { padding: 30px 20px; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
                .btn { display: inline-block; padding: 15px 30px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 15px 10px; transition: background 0.3s; }
                .btn:hover { background: #3730a3; }
                .product-card { background: #f8f9fa; border-radius: 16px; padding: 25px; margin: 25px 0; border-left: 5px solid #4f46e5; }
                .urgency-banner { background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%); color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
                .features { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                .feature-item { background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <h1 style="color: white; margin: 0; font-size: 32px;">🎉 It's Back in Stock!</h1>
                    <p style="color: #e0e7ff; margin: 15px 0 0 0; font-size: 18px;">The item you wanted is now available!</p>
                </div>

                <!-- Content -->
                <div class="content">
                    <p style="font-size: 18px; color: #333;">Dear <strong>${customerName}</strong>,</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">
                        Great news! The item you were waiting for is now back in stock and ready to make your furry friend look absolutely adorable!
                    </p>

                    <!-- Urgency Banner -->
                    <div class="urgency-banner">
                        <h3 style="margin: 0; font-size: 18px;">⚡ Limited Stock Alert!</h3>
                        <p style="margin: 5px 0 0 0; font-size: 14px;">Don't wait too long - grab it before it's sold out again!</p>
                    </div>

                    <!-- Product Information -->
                    <div class="product-card">
                        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
                            <img src="${product.mainImage || ''}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 12px; border: 3px solid #e5e7eb;">
                            <div>
                                <h3 style="margin: 0; color: #1f2937; font-size: 24px;">${product.name}</h3>
                                <p style="margin: 8px 0; color: #6b7280; font-size: 16px;">Size: <strong>${size}</strong></p>
                                <div style="background: #10b981; color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; display: inline-block; font-weight: 600;">
                                    ✅ Now Available
                                </div>
                            </div>
                        </div>

                        <!-- Product Features -->
                        <div class="features">
                            <div class="feature-item">
                                <div style="font-size: 24px; margin-bottom: 8px;">🛡️</div>
                                <div style="font-size: 14px; font-weight: 600; color: #374151;">Size Exchange</div>
                                <div style="font-size: 12px; color: #6b7280;">Free if size doesn't fit</div>
                            </div>
                            <div class="feature-item">
                                <div style="font-size: 24px; margin-bottom: 8px;">🚚</div>
                                <div style="font-size: 14px; font-weight: 600; color: #374151;">Fast Shipping</div>
                                <div style="font-size: 12px; color: #6b7280;">Quick delivery to your door</div>
                            </div>
                            <div class="feature-item">
                                <div style="font-size: 24px; margin-bottom: 8px;">⭐</div>
                                <div style="font-size: 14px; font-weight: 600; color: #374151;">Premium Quality</div>
                                <div style="font-size: 12px; color: #6b7280;">Made with love & care</div>
                            </div>
                            <div class="feature-item">
                                <div style="font-size: 24px; margin-bottom: 8px;">💝</div>
                                <div style="font-size: 14px; font-weight: 600; color: #374151;">Perfect Fit</div>
                                <div style="font-size: 12px; color: #6b7280;">Designed for comfort</div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="https://www.fureversteffie.com/product/${product.id}+${product.type || 'kurta'}" class="btn" style="background: linear-gradient(45deg, #4f46e5, #7c3aed); font-size: 18px;">
                            🛒 Shop Now - Size ${size}
                        </a>
                        <br>
                        <a href="https://www.fureversteffie.com" class="btn" style="background: #6b7280; font-size: 16px;">
                            🏠 Browse All Products
                        </a>
                    </div>

                    <!-- Social Proof -->
                    <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px; margin: 25px 0;">
                        <h4 style="margin: 0 0 15px 0; color: #92400e; font-size: 16px;">🌟 Why Customers Love Us</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; color: #92400e;">
                            <div>✅ 1000+ Happy Pet Parents</div>
                            <div>✅ Free Size Exchanges</div>
                            <div>✅ Premium Quality Materials</div>
                            <div>✅ Fast Customer Support</div>
                        </div>
                    </div>

                    <!-- Unsubscribe Note -->
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center;">
                            📧 You received this email because you signed up for restock notifications. 
                            This is a one-time notification for this specific product.
                        </p>
                        <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
                            <a href="https://www.fureversteffie.com/contact" style="color: #6b7280; text-decoration: none;">Contact us</a> if you have any questions.
                        </p>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                        <p style="font-size: 16px; color: #374151;">
                            Thank you for being a valued customer! We can't wait to see your furry friend looking absolutely adorable in their new outfit! 🐾
                        </p>
                        <p style="color: #6b7280; font-size: 14px; font-style: italic; margin-top: 20px;">
                            Happy shopping,<br>
                            <strong>The Furever Steffie Team</strong>
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Furever Steffie</strong></p>
                    <p style="margin: 0; color: #6b7280;">Making every pet look pawsome! 🐾</p>
                    <p style="margin: 15px 0 0 0;">
                        <a href="https://www.fureversteffie.com" style="color: #4f46e5; text-decoration: none; margin: 0 10px;">Website</a> |
                        <a href="https://www.fureversteffie.com/contact" style="color: #4f46e5; text-decoration: none; margin: 0 10px;">Contact</a> |
                        <a href="https://www.fureversteffie.com/size-guide" style="color: #4f46e5; text-decoration: none; margin: 0 10px;">Size Guide</a>
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
            to: email,
            subject: `🎉 Great News! ${product.name} (Size ${size}) is Back in Stock!`,
            html: emailHtml
        };

        console.log(`📧 Sending restock notification email to ${email} for ${product.name} (Size: ${size})`);

        await transporter.sendMail(mailOptions);

        console.log(`✅ Restock notification email sent successfully to ${email}`);

        return res.status(200).json({
            success: true,
            message: "Restock notification email sent successfully",
            productName: product.name,
            size: size,
            email: email
        });

    } catch (error) {
        console.error("❌ Error sending restock notification email:", error);

        return res.status(500).json({
            success: false,
            message: "Error sending restock notification email",
            error: error.message
        });
    }
}