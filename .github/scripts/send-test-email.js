import nodemailer from 'nodemailer';

async function sendTestEmail() {
  try {
    console.log('🚀 Starting test email send...');
    
    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'fureversteffie@gmail.com',
        pass: process.env.EMAIL_PASS || 'htyq oijh ugoi echv',
      },
    });

    // Email options
    const mailOptions = {
      from: {
        name: 'Furever Steffie Auto Test',
        address: process.env.EMAIL_USER || 'fureversteffie@gmail.com'
      },
      to: 'devuday2705@gmail.com',
      subject: 'test',
      text: 'Hi this is triggered Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; border-left: 4px solid #007bff;">
            <h2 style="color: #007bff; margin-top: 0;">🤖 GitHub Actions Test Email</h2>
            <p style="font-size: 16px; color: #333;">Hi this is triggered Email</p>
            <hr style="border: none; height: 1px; background-color: #dee2e6; margin: 20px 0;">
            <p style="font-size: 14px; color: #6c757d; margin-bottom: 0;">
              <strong>Triggered at:</strong> ${new Date().toISOString()}<br>
              <strong>From:</strong> GitHub Actions Scheduled Workflow<br>
              <strong>Repository:</strong> furever-steffie
            </p>
          </div>
        </div>
      `
    };

    console.log('📧 Sending email to:', mailOptions.to);
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('📍 Message ID:', info.messageId);
    console.log('📬 Response:', info.response);
    
    return info;
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // Log more detailed error information
    if (error.response) {
      console.error('📧 SMTP Response:', error.response);
    }
    if (error.code) {
      console.error('🔧 Error Code:', error.code);
    }
    
    throw error;
  }
}

// Execute the function
sendTestEmail()
  .then(() => {
    console.log('🏁 Test email process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test email process failed:', error.message);
    process.exit(1);
  });