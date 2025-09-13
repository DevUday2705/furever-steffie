# WhatsApp Integration Setup

## Environment Variables

Add this to your `.env` file:

```
AISENSY_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWY2NTFmNmI2M2Q3MTAxMjEyNWQzMyIsIm5hbWUiOiJGdXJldmVyIFN0ZWZmaWUiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjhhZjY1MWY2YjYzZDcxMDEyMTI1ZDJlIiwiYWN0aXZlUGxhbiI6IkZSRUVfRk9SRVZFUiIsImlhdCI6MTc1NjMyNTE1MX0.E2uQFrfRq3hvRvGRK4-3fROUtc7pgrDLIOyoLXZ4Y98
```

## How It Works

1. **Order Placement**: Customer completes payment
2. **Order Saved**: Order details saved to database
3. **WhatsApp Sent**: Automatic WhatsApp message via AI Sensy API
4. **Template Used**: `order_confirmation_v1`

## Template Parameters

The WhatsApp template receives these parameters:
1. Customer Name (e.g., "Uday")
2. Order Number (e.g., "ORD-478542") 
3. Items List (e.g., "Kurta x1, Bandana x1")
4. Total Amount (e.g., "1234")
5. Estimated Delivery (e.g., "14 Sep 2025")

## Testing

To test the WhatsApp integration:
1. Place a test order
2. Check console logs for WhatsApp API response
3. Verify message received on customer's WhatsApp

## Error Handling

- WhatsApp failures won't affect order completion
- Errors are logged but order still processes successfully
- Customer still gets redirected to thank you page