export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST method allowed" });
    }

    try {
        const {
            customerName,
            orderNumber,
            items,
            totalAmount,
            estimatedDelivery,
            mobileNumber
        } = req.body;

        if (!customerName || !orderNumber || !items || !totalAmount || !estimatedDelivery || !mobileNumber) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
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

        // Format items list for WhatsApp message
        const itemsList = Array.isArray(items) ? items.map(item => {
            const quantity = item.quantity || 1;
            return `${item.name} x${quantity}`;
        }).join(', ') : 'Items ordered';

        // Format total amount (ensure it's a string)
        const formattedAmount = typeof totalAmount === 'number' ? totalAmount.toString() : totalAmount;

        // Prepare WhatsApp API payload
        const whatsappPayload = {
            apiKey: process.env.AISENSY_API_KEY,
            campaignName: "order_confirmation",
            destination: formattedMobile,
            userName: customerName,
            templateParams: [
                customerName,           // [Uday]
                orderNumber,           // [123456789]
                itemsList,             // [Kurta x1, Bandana x1]
                formattedAmount,       // [1234]
                estimatedDelivery      // [14 Sep 2025]
            ]
        };

        console.log(`📱 Sending WhatsApp notification to ${formattedMobile}`);
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
            console.log(`✅ WhatsApp notification sent successfully to ${formattedMobile}`);
            console.log(`📱 Response:`, whatsappResult);

            return res.status(200).json({
                success: true,
                message: "WhatsApp notification sent successfully",
                whatsappResponse: whatsappResult
            });
        } else {
            console.error(`❌ Failed to send WhatsApp notification:`, whatsappResult);

            return res.status(500).json({
                success: false,
                message: "Failed to send WhatsApp notification",
                error: whatsappResult
            });
        }

    } catch (error) {
        console.error("❌ Error sending WhatsApp notification:", error);

        return res.status(500).json({
            success: false,
            message: "Error sending WhatsApp notification",
            error: error.message
        });
    }
}