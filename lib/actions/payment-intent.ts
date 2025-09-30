/**
 * Create a payment intent with Stripe
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResponse> {
  const { bookingId, userId, amount, currency = "usd", metadata = {} } = params;

  try {
    await connectToDatabase();

    // Verify booking exists and belongs to the user
    const booking = await HotelBooking.findById(bookingId);

    if (!booking) {
      return {
        success: false,
        message: "Booking not found",
        clientSecret: "",
        paymentIntentId: "",
        amount: 0,
        currency: "",
      };
    }

    if (booking.userId.toString() !== userId) {
      return {
        success: false,
        message: "Unauthorized to make payment for this booking",
        clientSecret: "",
        paymentIntentId: "",
        amount: 0,
        currency: "",
      };
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        bookingId: booking._id.toString(),
        userId,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment record
    const payment = await Payment.create({
      userId,
      bookingId,
      amount,
      currency,
      paymentMethod: "stripe",
      status: "pending",
      stripeInfo: {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      },
    });

    // Update booking with payment reference
    booking.paymentId = payment._id;
    await booking.save();

    return {
      success: true,
      message: "Payment intent created successfully",
      clientSecret: paymentIntent.client_secret || "",
      paymentIntentId: paymentIntent.id,
      amount,
      currency,
    };
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return {
      success: false,
      message: error.message || "Error creating payment intent",
      clientSecret: "",
      paymentIntentId: "",
      amount: 0,
      currency: "",
    };
  }
}
