module.exports = function (db) {
  const express = require("express");
  const router = express.Router();
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  router.post("/create-intent", async (req, res) => {
    try {
      const { amount, bookingId, acceptedDate, currency } = req.body;

      const vatAmount = Math.round(amount * 0.25);

      const totalAmount = amount + vatAmount;

      if (!amount || !bookingId || !acceptedDate || !currency) {
        return res.status(400).json({
          message: "Missing required fields",
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount * 100, // Stripe uses smallest currency unit (öre for SEK)
        currency: currency,
        metadata: {
          bookingId,
          acceptedDate,
          baseAmount: amount,
          vatAmount: vatAmount,
          vatPercentage: 25,
        },

        description: `Booking fee: ${amount} kr + VAT (25%): ${vatAmount} kr`,
      });

      await db.collection("bookingPayments").add({
        amount: req.body.amount,
        bookingId: req.body.bookingId,
        acceptedDate: req.body.acceptedDate,
        currency: req.body.currency,
        uid: req.body.uid,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentAmount: amount,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({
        message: "Failed to create payment intent",
        error: error.message,
      });
    }
  });

  return router;
};
