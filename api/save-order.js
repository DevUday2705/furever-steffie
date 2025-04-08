export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST allowed' });
    }

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            customer,
            items,
            amount,
        } = req.body;

        // This is where you'd normally save to a database
        console.log('📦 Saving order:', {
            razorpay_order_id,
            razorpay_payment_id,
            customer,
            items,
            amount,
            status: 'paid',
            date: new Date().toISOString(),
        });

        // Respond success
        return res.status(200).json({ success: true, message: 'Order saved successfully!' });
    } catch (error) {
        console.error('❌ Failed to save order:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}
