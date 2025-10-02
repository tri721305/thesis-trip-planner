# Payment System Class Diagram

```mermaid
classDiagram
    class Payment {
        +String paymentId
        +ObjectId userId
        +ObjectId bookingId
        +Number amount
        +String currency
        +String paymentMethod
        +String status
        +PaymentBreakdown breakdown
        +BillingDetails billingDetails
        +StripeInfo stripeInfo
        +String transactionId
        +String referenceNumber
        +Array refunds
        +Number retryCount
        +Date lastRetryAt
        +Date nextRetryAt
        +String description
        +String notes
        +String source
        +Date processedAt
        +Date failedAt
        +Date refundedAt
        +Date createdAt
        +Date updatedAt
        +Number totalRefunded()
        +Number remainingAmount()
    }

    class BillingDetails {
        +String name
        +String email
        +String phone
        +Address address
    }

    class Address {
        +String line1
        +String line2
        +String city
        +String state
        +String postalCode
        +String country
    }

    class PaymentBreakdown {
        +Number subtotal
        +Number taxes
        +Number fees
        +Number discount
        +Number total
        +String currency
    }

    class StripeInfo {
        +String paymentIntentId
        +String clientSecret
        +String chargeId
        +String receiptUrl
        +String refundId
        +String failureCode
        +String failureMessage
    }

    class Refund {
        +String refundId
        +Number amount
        +String reason
        +String status
        +Date createdAt
        +Date processedAt
        +String stripeRefundId
    }

    class HotelBooking {
        +String bookingId
        +ObjectId userId
        +ObjectId paymentId
        +BookedHotel hotel
        +Array rooms
        +Date checkInDate
        +Date checkOutDate
        +Number nights
        +GuestInfo guestInfo
        +Object guestCount
        +Object pricing
        +String status
        +String paymentStatus
        +String paymentMethod
        +Object cancellation
        +String source
        +Boolean confirmationEmailSent
        +String specialRequests
        +String notes
        +Date createdAt
        +Date updatedAt
    }

    class User {
        +String name
        +String username
        +String email
        +String bio
        +String image
        +String location
        +String portfolio
        +Number reputation
        +String phone
    }

    class PaymentService {
        +createPayment(CreatePaymentParams)
        +createStripePaymentIntent(CreateStripePaymentIntentParams)
        +processPayment(ProcessPaymentParams)
        +updatePaymentStatus(UpdatePaymentStatusParams)
        +processRefund(ProcessRefundParams)
        +getPayments(GetPaymentsParams)
        +getPaymentById(paymentId)
        +resetProcessingPayment(paymentId)
    }

    class StripeAPI {
        +createPaymentIntent(amount, currency, metadata)
        +retrievePaymentIntent(paymentIntentId)
        +createRefund(paymentIntentId, amount, reason)
        +handleWebhookEvent(event)
    }

    Payment "1" *-- "1" PaymentBreakdown : contains
    Payment "1" *-- "1" BillingDetails : contains
    Payment "1" *-- "0..1" StripeInfo : may contain
    Payment "1" *-- "*" Refund : contains
    Payment "1" -- "1" HotelBooking : references
    Payment "1" -- "1" User : belongs to
    BillingDetails "1" *-- "0..1" Address : may contain
    PaymentService -- Payment : manages
    PaymentService -- StripeAPI : uses
```

## Class Descriptions

### Core Payment Classes

#### Payment

- Central entity for payment information
- Tracks payment status, amount, and associated references
- Contains methods to calculate refund amounts

#### BillingDetails

- Contact information for the person making the payment
- Contains name, email, phone, and possibly an address

#### PaymentBreakdown

- Detailed breakdown of payment amounts
- Shows subtotal, taxes, fees, discounts, and total

#### StripeInfo

- Stripe-specific payment information
- Contains references to Stripe resources like paymentIntentId

#### Refund

- Information about a refund processed for a payment
- Tracks refund amount, reason, status, and Stripe reference

### Related Entities

#### HotelBooking

- The booking that is being paid for
- References the payment and contains booking details

#### User

- The user who made the payment
- Contains basic user information

### Service Classes

#### PaymentService

- Handles all payment-related operations
- Creates payments, processes transactions, handles refunds

#### StripeAPI

- Interface to the Stripe payment processor
- Creates payment intents, processes refunds, handles webhooks

## Key Relationships

1. **Payment-User**: Each payment is made by one user
2. **Payment-HotelBooking**: Each payment is associated with one booking
3. **Payment-PaymentBreakdown**: Each payment contains a breakdown of amounts
4. **Payment-BillingDetails**: Each payment includes billing information
5. **Payment-StripeInfo**: Payments may contain Stripe-specific information
6. **Payment-Refund**: A payment may have multiple refunds
7. **PaymentService-Payment**: The service manages payment entities
8. **PaymentService-StripeAPI**: The payment service uses Stripe for processing

## Payment Statuses

1. **pending**: Payment has been created but not processed
2. **processing**: Payment is being processed
3. **succeeded**: Payment has been successfully completed
4. **failed**: Payment processing failed
5. **cancelled**: Payment was cancelled
6. **refunded**: Payment has been fully refunded
7. **partially_refunded**: Payment has been partially refunded

## Refund Statuses

1. **pending**: Refund has been requested but not processed
2. **succeeded**: Refund has been successfully processed
3. **failed**: Refund processing failed
