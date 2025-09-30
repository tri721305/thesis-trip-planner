# Hotel Booking System with Stripe Integration

This README outlines the implementation of a hotel booking system with Stripe payment integration. This system allows users to book hotel rooms and process payments securely using Stripe.

## Features

- **Room Booking**: Users can browse available rooms, select check-in/check-out dates, and provide guest information
- **Payment Processing**: Secure payment handling with Stripe
- **Booking Management**: View, update, and cancel bookings
- **Payment Status Tracking**: Monitor payment status from pending to completed
- **Refund Processing**: Support for partial or full refunds

## Technical Implementation

### Database Models

#### Hotel Booking Model

- Stores all booking information including:
  - Guest details
  - Room information
  - Check-in and check-out dates
  - Payment status
  - Booking status (pending, confirmed, cancelled, etc.)
  - Price breakdown

#### Payment Model

- Handles payment information:
  - Payment method
  - Transaction details
  - Stripe integration data
  - Refund information
  - Payment status tracking

### Server Actions

#### Booking Actions

- `createHotelBooking`: Create a new booking
- `getHotelBookings`: Retrieve bookings with filtering options
- `getBookingById`: Get a specific booking
- `updateBookingStatus`: Change booking status
- `cancelBooking`: Cancel an existing booking

#### Payment Actions

- `createPaymentIntent`: Initialize a Stripe payment intent
- `processPayment`: Handle successful payment completion
- `verifyPayment`: Verify payment status with Stripe
- `issueRefund`: Process refunds
- `handleStripeWebhook`: Process Stripe webhook events

### UI Components

#### BookingForm

- Form for entering booking details
- Room selection
- Date picker
- Guest information
- Price breakdown

#### StripeCheckout

- Secure Stripe Elements integration
- Payment method selection
- Payment processing
- Error handling

### Stripe Integration

#### Local Testing

- Uses Stripe test API keys
- Test credit card numbers
- Stripe webhook handling
- Simulated payment flow

#### Webhooks

- Payment completion events
- Failed payment handling
- Dispute management

## Testing the Implementation

1. Navigate to `/hotel-booking-test` to see the booking flow
2. Fill in the booking form and select rooms
3. Submit to create a booking
4. Complete payment with Stripe test cards
5. View booking confirmation

## Development Setup

To set up the payment system:

1. Install required packages:

   ```
   npm install stripe @stripe/stripe-js @stripe/react-stripe-js
   ```

2. Configure environment variables:

   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. Run Stripe CLI for webhook testing:
   ```
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## Security Considerations

- All payments are processed server-side
- Sensitive payment information never touches our server
- Stripe Elements provides secure card collection
- Payment information is validated before processing
- Database transactions ensure data integrity

## Future Enhancements

- Room availability calendar
- Multiple payment methods
- Booking modification
- Discount codes
- Email confirmations
- Room upgrade options
