export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            customer,
            items,
            amount,
        } = req.body;

        // For now, we'll just log — this is where you'd insert into DB
        console.log('💾 Saving order:', {
            razorpay_order_id,
            razorpay_payment_id,
            customer,
            items,
            amount,
            status: 'paid',
            date: new Date().toISOString(),
        });

        // You can replace this part with Firestore, Supabase, etc.
        return res.status(200).json({ message: 'Order saved successfully!' });
    } catch (error) {
        console.error('Error saving order:', error);
        return res.status(500).json({ message: 'Failed to save order' });
    }
}
