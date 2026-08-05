import { Resend } from 'resend';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// Initialize Firebase (Client SDK)
const firebaseConfig = {
    apiKey: "AIzaSyDPx_dFNn4-99tCAeSY9ZyusKUP1lmtvUs",
    authDomain: "furever-steffie.firebaseapp.com",
    projectId: "furever-steffie",
    storageBucket: "furever-steffie.firebasestorage.app",
    messagingSenderId: "589323009936",
    appId: "1:589323009936:web:def7b87847e0049618bd15",
    measurementId: "G-TJT3Y79V9Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch last 3 orders from Firebase
async function fetchLastOrders() {
  try {
    console.log('📊 Fetching last 3 orders from Firebase...');
    
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    
    if (ordersSnapshot.empty) {
      console.log('📭 No orders found');
      return [];
    }
    
    const orders = [];
    ordersSnapshot.forEach(doc => {
      const orderData = doc.data();
      orders.push({
        id: doc.id,
        orderNumber: orderData.orderNumber,
        customerName: orderData.customer?.fullName,
        customerEmail: orderData.customer?.email,
        amount: orderData.amount,
        orderStatus: orderData.orderStatus,
        paymentStatus: orderData.paymentStatus,
        createdAt: orderData.createdAt,
        itemCount: orderData.items?.length || 0,
        items: orderData.items || []
      });
    });
    
    console.log(`✅ Found ${orders.length} orders`);
    return orders;
    
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    throw error;
  }
}

// Generate orders HTML for email
function generateOrdersHTML(orders) {
  if (orders.length === 0) {
    return '<p style="color: #6c757d; text-align: center; padding: 20px;">No recent orders found</p>';
  }
  
  return orders.map((order, index) => {
    const createdDate = new Date(order.createdAt).toLocaleString();
    const itemsText = order.items.map(item => 
      `${item.name} (Size: ${item.selectedSize}, Qty: ${item.quantity || 1})`
    ).join(', ');
    
    return `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px; padding: 16px; background-color: ${index === 0 ? '#f0f9ff' : '#ffffff'};">
        <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 12px;">
          <div>
            <h3 style="margin: 0 0 4px 0; color: #1f2937; font-size: 16px;">${order.orderNumber || order.id}</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">${createdDate}</p>
          </div>
          <div style="text-align: right;">
            <span style="background-color: ${order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
              ${order.paymentStatus?.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div style="margin-bottom: 8px;">
          <strong style="color: #374151;">Customer:</strong> 
          <span style="color: #6b7280;">${order.customerName || 'N/A'}</span>
          ${order.customerEmail ? `<br><span style="color: #6b7280; font-size: 14px;">${order.customerEmail}</span>` : ''}
        </div>
        
        <div style="margin-bottom: 8px;">
          <strong style="color: #374151;">Amount:</strong> 
          <span style="color: #059669; font-weight: 600;">₹${order.amount?.toLocaleString()}</span>
        </div>
        
        <div style="margin-bottom: 8px;">
          <strong style="color: #374151;">Items (${order.itemCount}):</strong><br>
          <span style="color: #6b7280; font-size: 14px;">${itemsText}</span>
        </div>
        
        <div>
          <strong style="color: #374151;">Status:</strong> 
          <span style="color: ${order.orderStatus === 'completed' ? '#059669' : order.orderStatus === 'pending' ? '#d97706' : '#dc2626'}; font-weight: 600;">
            ${order.orderStatus?.toUpperCase()}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

async function sendOrderReportEmail() {
  try {
    console.log('🚀 Starting order report email send...');
    console.log('🔍 Environment check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- RESEND_API_KEY available:', !!process.env.RESEND_API_KEY);
    console.log('- RESEND_FROM_EMAIL available:', !!process.env.RESEND_FROM_EMAIL);
    console.log('- ORDER_REPORT_TO_EMAIL available:', !!process.env.ORDER_REPORT_TO_EMAIL);
    console.log('🔥 Using Firebase client SDK (no service account needed)');
    
    // Fetch orders data
    const orders = await fetchLastOrders();
    
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM;
    const reportToEmail = process.env.ORDER_REPORT_TO_EMAIL || 'devuday2705@gmail.com';

    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }

    if (!fromEmail) {
      throw new Error('Missing RESEND_FROM_EMAIL (or EMAIL_FROM) environment variable');
    }

    const resend = new Resend(resendApiKey);

    console.log('📧 Using sender:', fromEmail);
    console.log('📩 Sending report to:', reportToEmail);

    const ordersHTML = generateOrdersHTML(orders);
    const totalAmount = orders.reduce((sum, order) => sum + (order.amount || 0), 0);

    // Email options
    const mailOptions = {
      from: {
        name: 'Furever Steffie Order Report',
        address: fromEmail
      },
      to: reportToEmail,
      subject: `📊 Order Report - ${orders.length} Recent Orders (₹${totalAmount.toLocaleString()})`,
      text: 'Hi this is triggered Email with order data',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
            <h2 style="color: white; margin-top: 0; font-size: 24px;">🤖 Automated Order Report</h2>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 16px 0; font-size: 16px;">Last 3 Orders from Furever Steffie</p>
            <div style="background-color: rgba(255,255,255,0.2); border-radius: 8px; padding: 16px; display: inline-block;">
              <div style="color: white; font-size: 18px; font-weight: 600;">
                Total: ₹${totalAmount.toLocaleString()}
              </div>
              <div style="color: rgba(255,255,255,0.8); font-size: 14px;">
                ${orders.length} orders found
              </div>
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="color: #1f2937; margin-bottom: 16px; font-size: 20px;">📋 Recent Orders</h3>
            ${ordersHTML}
          </div>

          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; border-left: 4px solid #007bff;">
            <h4 style="color: #007bff; margin-top: 0;">🤖 Report Details</h4>
            <hr style="border: none; height: 1px; background-color: #dee2e6; margin: 16px 0;">
            <p style="font-size: 14px; color: #6c757d; margin-bottom: 0;">
              <strong>Generated at:</strong> ${new Date().toISOString()}<br>
              <strong>Source:</strong> GitHub Actions Scheduled Workflow<br>
              <strong>Repository:</strong> furever-steffie<br>
              <strong>Schedule:</strong> Every 5 minutes<br>
              <strong>Firebase Project:</strong> furever-steffie
            </p>
          </div>
        </div>
      `
    };

    console.log('📧 Sending email to:', mailOptions.to);
    console.log('📄 Subject:', mailOptions.subject);
    console.log('📊 Orders included:', orders.length);
    
    const { data, error } = await resend.emails.send({
      from: `${mailOptions.from.name} <${mailOptions.from.address}>`,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.text,
    });

    if (error) {
      throw new Error(error.message || 'Resend failed to send order report email');
    }
    
    console.log('✅ Email sent successfully!');
    console.log('📍 Message ID:', data?.id);
    console.log('📬 Response:', data);
    console.log('🏁 Order report email process completed successfully');
    
    return data;
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    console.error('💥 Full error details:', {
      message: error.message,
      stack: error.stack
    });
    
    throw error;
  }
}

// Execute the function
sendOrderReportEmail()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Order report email process failed:', error.message);
    process.exit(1);
  });