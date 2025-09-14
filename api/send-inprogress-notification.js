export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST method allowed" });
    }

    try {
        const {
            customerName,
            orderId,
            dispatchDate,
            neckMeasurement,
            chestMeasurement,
            backMeasurement,
            mobileNumber
        } = req.body;

        if (!customerName || !orderId || !dispatchDate || !mobileNumber) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields for in-progress notification"
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

        // Prepare WhatsApp API payload for in-progress notification
        const whatsappPayload = {
            apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWY2NTFmNmI2M2Q3MTAxMjEyNWQzMyIsIm5hbWUiOiJGdXJldmVyIFN0ZWZmaWUiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjhhZjY1MWY2YjYzZDcxMDEyMTI1ZDJlIiwiYWN0aXZlUGxhbiI6IkZSRUVfRk9SRVZFUiIsImlhdCI6MTc1NjMyNTE1MX0.E2uQFrfRq3hvRvGRK4-3fROUtc7pgrDLIOyoLXZ4Y98",
            campaignName: "in_progress",
            destination: formattedMobile,
            userName: customerName,
            templateParams: [
                customerName,         // name
                orderId,             // order_id
                dispatchDate,        // dispatch_date
                neckMeasurement || "N/A",    // neck measurement
                chestMeasurement || "N/A",   // chest measurement
                backMeasurement || "N/A",    // back measurement
            ]
        };


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
            console.log(`✅ In-progress notification sent successfully to ${formattedMobile}`);
            console.log(`📱 Response:`, whatsappResult);

            return res.status(200).json({
                success: true,
                message: "In-progress notification sent successfully",
                whatsappResponse: whatsappResult
            });
        } else {
            console.error(`❌ Failed to send in-progress notification:`, whatsappResult);

            return res.status(500).json({
                success: false,
                message: "Failed to send in-progress notification",
                error: whatsappResult
            });
        }

    } catch (error) {
        console.error("❌ Error sending in-progress notification:", error);

        return res.status(500).json({
            success: false,
            message: "Error sending in-progress notification",
            error: error.message
        });
    }
}
