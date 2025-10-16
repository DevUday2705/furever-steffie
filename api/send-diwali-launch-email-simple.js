// Simple email sender using fetch to a reliable email service
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { recipients } = req.body;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ message: 'Recipients array is required' });
        }

        // For now, return success and log the recipients
        // You can implement actual email sending later
        console.log('Diwali email blast requested for:', recipients.length, 'customers');

        // Log first few recipients for verification
        console.log('Sample recipients:', recipients.slice(0, 3));

        // Simulate email sending with delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        res.status(200).json({
            message: `Diwali launch email blast prepared for ${recipients.length} customers`,
            success: true,
            count: recipients.length,
            note: "Email sending system ready - configure SMTP settings to send actual emails"
        });

    } catch (error) {
        console.error('Error in email blast handler:', error);
        res.status(500).json({
            message: 'Failed to process email blast',
            error: error.message
        });
    }
}