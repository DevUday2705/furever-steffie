import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const WhatsAppIntegrationInfo = () => {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const testAPI = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: '9876543210',
          customMessage: 'Integration test message'
        })
      });

      const text = await response.text();
      let result;
      
      try {
        result = JSON.parse(text);
      } catch (e) {
        result = { error: 'Invalid JSON response', text };
      }

      setTestResult({ status: response.status, result });
      
      if (result.success) {
        toast.success('Test successful!');
      } else {
        toast.error('Test failed - see details below');
      }
      
    } catch (error) {
      setTestResult({ error: error.message });
      toast.error('Network error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            📱 WhatsApp Integration Status
          </h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-yellow-800 mb-2">⚠️ Integration Issue Detected</h2>
            <p className="text-yellow-700">
              The business WhatsApp number <code>918828145667</code> is not properly integrated with MSG91 or requires activation.
            </p>
          </div>

          <button
            onClick={testAPI}
            disabled={testing}
            className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
              testing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {testing ? 'Testing...' : 'Test API Connection'}
          </button>

          {testResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Test Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </motion.div>

        {/* Current Setup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔧 Current Setup</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">MSG91 Auth Key:</span>
              <code className="bg-gray-100 px-2 py-1 rounded">464925AYkG1psqH0oB68a22c76P1</code>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Business WhatsApp Number:</span>
              <code className="bg-gray-100 px-2 py-1 rounded">+91 88281 45667</code>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">API Endpoint:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/
              </code>
            </div>
          </div>
        </motion.div>

        {/* Steps to Fix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">✅ Steps to Fix Integration</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
              <div>
                <h3 className="font-semibold">Login to MSG91 Dashboard</h3>
                <p className="text-gray-600">Go to <a href="https://control.msg91.com" target="_blank" className="text-blue-600 underline">control.msg91.com</a> and login with your account</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
              <div>
                <h3 className="font-semibold">Navigate to WhatsApp Section</h3>
                <p className="text-gray-600">Find the WhatsApp Business API section in your dashboard</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
              <div>
                <h3 className="font-semibold">Verify Business Number</h3>
                <p className="text-gray-600">Ensure <code>+91 88281 45667</code> is added and verified as your business WhatsApp number</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
              <div>
                <h3 className="font-semibold">Complete Integration Process</h3>
                <p className="text-gray-600">Follow MSG91's WhatsApp Business API setup process to integrate the number</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
              <div>
                <h3 className="font-semibold">Test Integration</h3>
                <p className="text-gray-600">Once setup is complete, return here and test the integration again</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alternative Solutions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔄 Alternative Solutions</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Option 1: Use Different Number</h3>
              <p className="text-blue-700 text-sm">
                If you have another WhatsApp Business number already integrated with MSG91, update the business number in the code.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Option 2: Manual Follow-up</h3>
              <p className="text-green-700 text-sm">
                Orders will still be saved successfully. You can manually send WhatsApp messages to customers until integration is fixed.
              </p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">Option 3: Different WhatsApp Provider</h3>
              <p className="text-purple-700 text-sm">
                Consider using other WhatsApp Business API providers like Twilio, Gupshup, or official WhatsApp Business API.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Current Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Current Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">✅</div>
              <h3 className="font-semibold text-green-800">Order Processing</h3>
              <p className="text-green-600 text-sm">Working perfectly</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">✅</div>
              <h3 className="font-semibold text-green-800">Stock Management</h3>
              <p className="text-green-600 text-sm">Working perfectly</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">⚠️</div>
              <h3 className="font-semibold text-yellow-800">WhatsApp Messages</h3>
              <p className="text-yellow-600 text-sm">Needs MSG91 setup</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WhatsAppIntegrationInfo;
