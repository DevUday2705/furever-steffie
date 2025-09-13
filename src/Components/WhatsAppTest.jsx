import { useState } from 'react';

const WhatsAppTest = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testWhatsApp = async () => {
    if (!phone) {
      setResult('❌ Please enter a phone number');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      console.log('🧪 Testing WhatsApp service...');
      
      const response = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone })
      });

      const responseData = await response.json();
      console.log('📱 WhatsApp test response:', responseData);

      if (response.ok && responseData.success) {
        setResult(`✅ Test WhatsApp message sent to ${phone}! Check your WhatsApp.`);
      } else {
        setResult(`⚠️ ${responseData.message || 'Failed to send WhatsApp message'}`);
      }
      
    } catch (error) {
      console.error('❌ WhatsApp test failed:', error);
      setResult(`❌ Test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '50px auto', 
      padding: '30px', 
      border: '1px solid #e5e7eb', 
      borderRadius: '12px',
      backgroundColor: 'white',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '30px' }}>
        📱 WhatsApp Service Test
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: '#374151'
        }}>
          Test Phone Number:
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+919876543210 or 9876543210"
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <button
        onClick={testWhatsApp}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px 24px',
          backgroundColor: loading ? '#9ca3af' : '#25d366',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? '📤 Sending...' : '🧪 Send Test WhatsApp'}
      </button>

      {result && (
        <div style={{
          padding: '15px',
          borderRadius: '8px',
          backgroundColor: result.includes('✅') ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${result.includes('✅') ? '#10b981' : '#ef4444'}`,
          color: result.includes('✅') ? '#065f46' : '#991b1b',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {result}
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          <strong>📱 WhatsApp Integration Status:</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>✅ AiSensy API integrated</li>
          <li>✅ Template: order_confirmation</li>
          <li>✅ Auto phone number formatting</li>
          <li>✅ Estimated delivery calculation</li>
        </ul>

        <p style={{ margin: '15px 0 5px 0' }}>
          <strong>📋 Test Message Contains:</strong>
        </p>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Customer name</li>
          <li>Order ID</li>
          <li>Items list (kurta x1, bandana x2)</li>
          <li>Total amount (₹1999)</li>
          <li>Estimated delivery (6 days from now)</li>
        </ol>
      </div>
    </div>
  );
};

export default WhatsAppTest;