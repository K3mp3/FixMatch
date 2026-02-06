module.exports = function (db) {
  const express = require("express");
  const router = express.Router();
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const admin = require("firebase-admin");
  require("dotenv").config();
  const mjml2html = require("mjml");
  const { Resend } = require("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { DeleteAccountTemplate } = require("../email-templates/DeleteAccount");
  const {
    DeleteAccountTrialTemplate,
  } = require("../email-templates/DeleteAccountTrial");
  const {
    EmailVerificationTemplate,
  } = require("../email-templates/VerifyEmail");
  const { getDateFromTimestamp } = require("../utils/timeStamp");
  const { differenceInDays } = require("../utils/differenceInDays");

  router.post("/verifyStripeSub", async (req, res) => {
    console.log("verifyStripeSub");

    try {
      const { sessionId } = req.body;

      if (!sessionId)
        return res
          .status(400)
          .json({ valid: false, message: "Session ID is required" });

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (!session)
        return res
          .status(404)
          .json({ valid: false, message: "Session not found" });

      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription
        );

        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";

        return res.json({
          valid: isActive,
          message: isActive
            ? "Subscription is active"
            : "Subscription is not active",
        });
      }

      return res.json({
        valid: false,
        message: "No active subscription found for this session",
      });
    } catch (error) {
      console.error("Error verifying stripe subscription");
      return res.status(500).json({
        valid: false,
        message: "Error verifying subscription status",
      });
    }
  });

  return router;
};
