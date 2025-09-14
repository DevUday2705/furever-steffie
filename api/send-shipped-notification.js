export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST method allowed" });
    }

    try {
        const {
            customerName,
            razorpayOrderId,
            trackingId,
            expectedDelivery,
            customerCity,
            mobileNumber
        } = req.body;

        if (!customerName || !razorpayOrderId || !trackingId || !expectedDelivery || !customerCity || !mobileNumber) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields for shipped notification"
            });
        }

        // Format mobile number for WhatsApp (ensure it starts with +91)
        let formattedMobile = mobileNumber.toString();
        if (!formattedMobile.startsWith('+')) {
            if (formattedMobile.startsWith('91')) {
                formattedMobile = '+' + formattedMobile;
            } else if (formattedMobile.length === 10) {
                formattedMobile = '+91' + formattedMobile;
            } else {
                formattedMobile = '+91' + formattedMobile;
            }
        }

        // Prepare WhatsApp API payload for shipped notification
        const whatsappPayload = {
            apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWY2NTFmNmI2M2Q3MTAxMjEyNWQzMyIsIm5hbWUiOiJGdXJldmVyIFN0ZWZmaWUiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjhhZjY1MWY2YjYzZDcxMDEyMTI1ZDJlIiwiYWN0aXZlUGxhbiI6IkZSRUVfRk9SRVZFUiIsImlhdCI6MTc1NjMyNTE1MX0.E2uQFrfRq3hvRvGRK4-3fROUtc7pgrDLIOyoLXZ4Y98",
            campaignName: "order_shipped",
            destination: formattedMobile,
            userName: customerName,
            templateParams: [
                razorpayOrderId,      // tracking_id (razorpay order ID)
                trackingId,           // tracking_id (delivery tracking ID)
                expectedDelivery,     // expected delivery date
                customerCity,         // customer city
                "www.fureversteffie.com/contact"  // support_link
            ]
        };

        console.log(`📱 Sending shipped notification to ${formattedMobile}`);
        console.log(`📋 Payload:`, JSON.stringify(whatsappPayload, null, 2));

        // Send WhatsApp message via AI Sensy API
        const whatsappResponse = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(whatsappPayload)
        });

        const whatsappResult = await whatsappResponse.json();

        if (whatsappResponse.ok) {
            console.log(`✅ Shipped notification sent successfully to ${formattedMobile}`);
            console.log(`📱 Response:`, whatsappResult);

            return res.status(200).json({
                success: true,
                message: "Shipped notification sent successfully",
                whatsappResponse: whatsappResult
            });
        } else {
            console.error(`❌ Failed to send shipped notification:`, whatsappResult);

            return res.status(500).json({
                success: false,
                message: "Failed to send shipped notification",
                error: whatsappResult
            });
        }

    } catch (error) {
        console.error("❌ Error sending shipped notification:", error);

        return res.status(500).json({
            success: false,
            message: "Error sending shipped notification",
            error: error.message
        });
    }
}