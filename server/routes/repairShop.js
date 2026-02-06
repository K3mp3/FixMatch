module.exports = function (db) {
  const express = require("express");
  const router = express.Router();
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  router.post("/saveInfoSettings", async (req, res) => {
    const answerData = { ...req.body };

    try {
      const foundUserDoc = await db
        .collection("users")
        .where("email", "==", req.body.email)
        .get();

      if (foundUserDoc.empty)
        return res.status(401).json({ message: "No user found!" });

      const foundUser = foundUserDoc.docs[0].data();
      const userId = foundUserDoc.docs[0].id;

      const updateObj = {
        selectedTimes: answerData.selectedTimes,
        workWarranty: answerData.workWarranty,
        partsWarranty: answerData.partsWarranty,
        isRentalCar: answerData.isRentalCar,
        paymentOptions: answerData.paymentOptions,
        whenIsPayment: answerData.whenIsPayment,
        firstSignIn: false,
        dropOffTime: answerData.dropOffTime,
        subscriptionType: answerData.subscriptionType,
      };

      if (
        answerData.subscriptionType === "core" &&
        foundUser.subscriptionType !== "core" &&
        foundUser.sessionId
      ) {
        try {
          if (session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription
            );

            await stripe.subscriptions.update(session.subscription, {
              cancel_at_period_end: true,
            });

            const nextFeeDate = new Date(
              subscription.current_period_end * 1000
            );

            updateObj.nextFeeDate = nextFeeDate;
            updateObj.subscriptionCancelled = true;
          } else {
            console.log("No subscription found in session");
          }
        } catch (error) {
          console.error("Error during Stripe operations");
          updateObj.stripeError = error.message;
        }
      }

      await db.collection("users").doc(userId).update(updateObj);

      return res.status(201).send("Document updated successfully");
    } catch (error) {
      console.error("Error in /saveInfo");
      return res.status(500).send(`Error updating document`);
    }
  });

  router.post("/saveInfoOnboarding", async (req, res) => {
    const answerData = { ...req.body };

    try {
      const foundUserDoc = await db
        .collection("users")
        .where("email", "==", req.body.email)
        .get();

      if (foundUserDoc.empty)
        return res.status(401).json({ message: "No user found!" });

      const foundUser = foundUserDoc.docs[0].data();
      const userId = foundUserDoc.docs[0].id;

      const updateObj = {
        selectedTimes: answerData.selectedTimes,
        workWarranty: answerData.workWarranty,
        partsWarranty: answerData.partsWarranty,
        isRentalCar: answerData.isRentalCar,
        paymentOptions: answerData.paymentOptions,
        whenIsPayment: answerData.whenIsPayment,
        firstSignIn: false,
        dropOffTime: answerData.dropOffTime,
      };

      if (
        answerData.subscriptionType === "core" &&
        foundUser.subscriptionType !== "core" &&
        foundUser.sessionId
      ) {
        try {
          if (session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription
            );

            await stripe.subscriptions.update(session.subscription, {
              cancel_at_period_end: true,
            });

            const nextFeeDate = new Date(
              subscription.current_period_end * 1000
            );

            updateObj.nextFeeDate = nextFeeDate;
            updateObj.subscriptionCancelled = true;
          } else {
            console.log("No subscription found in session");
          }
        } catch (error) {
          console.error("Error during Stripe operations");
          updateObj.stripeError = error.message;
        }
      }

      await db.collection("users").doc(userId).update(updateObj);

      return res.status(201).send("Document updated successfully");
    } catch (error) {
      console.error("Error in /saveInfo");
      return res.status(500).send(`Error updating document`);
    }
  });

  router.post("/unsubscribe", async (req, res) => {
    try {
      const foundUserDoc = await db
        .collection("repairShops")
        .where("email", "==", req.body.email)
        .get();

      if (foundUserDoc.empty)
        return res.status(401).json({ message: "No user found!" });

      const userId = foundUserDoc.docs[0].id;

      await db.collection("repairShops").doc(userId).delete();

      return res.status(201).send("Document updated successfully");
    } catch (error) {
      console.error("Error in /saveInfo");

      if (error.code === "permission-denied") {
        return res.status(409).json({ message: "Conflict in unsubscribing" });
      }

      return res.status(500).send(`Error updating document`);
    }
  });

  return router;
};
