import Razorpay from "razorpay";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST method allowed" });
    }

    const { amount, items = [] } = req.body;

    // Validate amount
    if (!amount || isNaN(amount)) {
        return res.status(400).json({ message: "Valid amount is required" });
    }

    // Create Razorpay instance
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Setup order options
    const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: "INR",
        receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        notes: {
            itemsCount: items.length,
            from: "Furever Steffie",
        },
    };

    try {
        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error("Razorpay order creation failed:", error);
        res.status(500).json({ message: "Failed to create Razorpay order" });
    }
}
