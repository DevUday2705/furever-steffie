import nodemailer from 'nodemailer';

// Create transporter using Gmail SMTP (same as existing email infrastructure)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'fureversteffie@gmail.com',
      pass: 'htyq oijh ugoi echv', // App password
    },
  });
};

const SUBJECTS = {
  1: "You left something behind 🐾",
  2: "Your pup is still waiting...",
  3: "Last chance — here's 10% off for you"
};

export const sendAbandonedEmail = async (customer, stage) => {
  try {
    const firstName = customer.name.split(' ')[0] || 'Friend';
    const productNames = customer.cart.map(i => i.name).join(', ');

    const html = buildEmailHtml(firstName, productNames, customer.cartTotal, stage, customer.email);

    const transporter = createTransporter();

    const mailOptions = {
      from: '"Furever Steffie" <fureversteffie@gmail.com>',
      to: customer.email,
      subject: SUBJECTS[stage],
      html
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Abandoned cart email ${stage} sent successfully to ${customer.email}:`, info.messageId);
    return { success: true, emailId: info.messageId };

  } catch (error) {
    console.error(`❌ Error sending abandoned cart email ${stage} to ${customer.email}:`, error);
    return { success: false, error: error.message };
  }
};

const buildEmailHtml = (name, products, total, stage, email) => {
  const couponBlock = stage === 3 ? `
    <div style="background:#fff3e0;padding:20px;border-radius:12px;text-align:center;margin:24px 0;border:1px solid #f59e0b;">
      <p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">Use code at checkout</p>
      <div style="background:#f59e0b;color:white;padding:12px;border-radius:8px;margin:12px 0;">
        <h2 style="margin:0;letter-spacing:2px;font-family:monospace;font-size:20px;">LASTCHANCE10</h2>
      </div>
      <p style="margin:0;font-size:12px;color:#92400e;">⏰ Expires in 24 hours</p>
    </div>` : '';

  const ctaButton = `
    <a href="https://fureversteffie.com/" 
       style="display:inline-block;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:#fff;padding:16px 32px;
              border-radius:12px;text-decoration:none;font-weight:600;margin-top:24px;font-size:16px;">
      Complete My Order →
    </a>`;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Don't let your pup miss out!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 24px; text-align: center;">
            <div style="margin-bottom: 16px;">
              <img src="https://furever-steffie.vercel.app/images/logo.jpg" alt="Furever Steffie Logo" style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.3); object-fit: cover;">
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">${getSubjectEmoji(stage)} Don't Give Up!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Your pup's perfect outfit is waiting</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Hey ${name}! 👋</h2>
            
            <p style="color: #374151; line-height: 1.6; margin: 0 0 24px 0; font-size: 16px;">${getBodyText(stage, products)}</p>
            
            ${couponBlock}
            
            <!-- Cart Summary -->
            <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 12px 0; font-weight: 600; color: #1f2937; font-size: 18px;">🛒 Your saved cart (₹${total})</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${products}</p>
              <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">Items are saved for 7 days</p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center;">
              ${ctaButton}
            </div>
            
            <!-- Social Proof -->
            ${stage === 2 ? `
              <div style="margin: 32px 0; padding: 20px; background: #f0f8ff; border-left: 4px solid #667eea; border-radius: 0 12px 12px 0;">
                <p style="margin: 0; color: #1e40af; font-size: 14px; font-style: italic; line-height: 1.5;">
                  "My Golden Retriever looks absolutely royal in the kurta! The quality is amazing and the fit is perfect. Furever Steffie exceeded all my expectations!" 
                  <br><br><strong>⭐⭐⭐⭐⭐ - Priya M, Mumbai</strong>
                </p>
              </div>` : ''}
            
            <!-- Urgency Message -->
            ${stage === 3 ? `
              <div style="background: #ffebee; border: 1px solid #ffcdd2; padding: 16px; border-radius: 12px; margin: 24px 0;">
                <p style="margin: 0; color: #c62828; font-size: 14px; text-align: center; font-weight: 600;">
                  ⏰ This is our final reminder. Your cart expires soon!
                </p>
              </div>` : ''}
            
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
              Made with 🐾 in Mumbai for pet parents who love style
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              Furever Steffie • Mumbai • 
              <a href="https://fureversteffie.com/unsubscribe?email=${encodeURIComponent(email)}" 
                 style="color: #6b7280; text-decoration: none;">Unsubscribe</a>
            </p>
          </div>
          
        </div>
      </body>
    </html>
  `;
};

const getSubjectEmoji = (stage) => {
  const emojis = { 1: "🛍️", 2: "🐕", 3: "⚡" };
  return emojis[stage] || "🐾";
};

const getBodyText = (stage, products) => {
  const messages = {
    1: `You were so close! You left <strong>${products}</strong> in your cart. Your pup's perfect outfit is waiting — complete your order before it sells out.`,
    2: `Hundreds of pet parents have dressed their furry friends in our outfits and absolutely loved the results! Don't let your pup miss out on <strong>${products}</strong>. These premium pieces are selling fast!`,
    3: `This is our last reminder — we've kept <strong>${products}</strong> saved just for you. Here's <strong>10% off</strong> to make it easier. Use code LASTCHANCE10 at checkout. This offer expires in 24 hours!`
  };
  return messages[stage] || messages[1];
};