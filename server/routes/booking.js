const {
  BookingCanceledRepairShop,
} = require("../email-templates/BookingCanceledRepairShop");
const {
  BookingCanceledToRepairShop,
} = require("../email-templates/BookingCanceledToRepairShop");
const {
  BookingCanceledToUser,
} = require("../email-templates/BookingCanceledToUser");
const { NewBookingTemplate } = require("../email-templates/NewBooking");

module.exports = function (db) {
  const express = require("express");
  const router = express.Router();
  const { Resend } = require("resend");
  const mjml2html = require("mjml");
  require("dotenv").config();
  const BookingConfirmation = require("../email-templates/BookingConfirmation");
  const {
    BookingCanceledUser,
  } = require("../email-templates/BookingCanceledUser");
  const SuggestedDates = require("../email-templates/SuggestedDates");
  const admin = require("firebase-admin");
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  const resend = new Resend(process.env.RESEND_API_KEY);

  router.post("/saveDate", async (req, res) => {
    console.log(req.body.dateOne);
    console.log(req.body.dateTwo);
    console.log(req.body.dateThree);
    console.log(req.body);

    try {
      const docRef = await db.collection("bookings").add({
        dateOne: req.body.dateOne,
        dateTwo: req.body.dateTwo,
        dateThree: req.body.dateThree,
        requestId: req.body.requestId,
        repairShopUid: req.body.repairShopUid,
        acceptedByRepairShop: {},
        suggestedDates: {},
        customerMessageId: req.body.customerMessageId,
        customerEmail: req.body.customerEmail,
        priceOffer: req.body.priceOffer,
        registrationNumber: req.body.registrationNumber,
        typeOfFix: req.body.typeOfFix,
        customerMessage: req.body.customerMessage,
        type: req.body.type,
        work: req.body.work,
      });

      const userSnapshot = await db
        .collection("users")
        .where("uid", "==", req.body.repairShopUid)
        .get();

      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();

        try {
          console.log("Conditions met, preparing to send email");

          const mjmlTemplate = NewBookingTemplate.render();
          const { html } = mjml2html(mjmlTemplate);

          await resend.emails.send({
            from: "noreply@fixmatch.se",
            to: userData.email,
            subject: "Nytt uppdrag från kund",
            html: html,
          });

          console.log(`Sent offers ready notification to ${userData.email}`);
        } catch (error) {
          console.log("Error sending email");
        }
      }

      res
        .status(201)
        .json({ message: "Dates saved successfully", id: docRef.id });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  const sendBookingConfirmation = async (
    userData,
    bookingData,
    customerEmail,
    acceptedDate
  ) => {
    const date = new Date(acceptedDate);

    const formattedDate = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Stockholm",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);

    const emailProps = {
      userName: userData.name,
      type: bookingData.type,
      typeOfFix: bookingData.typeOfFix,
      date: formattedDate,
    };

    const mjmlTemplate = BookingConfirmation.render(emailProps);
    const { html } = mjml2html(mjmlTemplate);

    try {
      const response = await resend.emails.send({
        from: "noreply@fixmatch.se",
        to: customerEmail,
        subject: "Bokning bekräftad",
        html: html,
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  router.post("/saveAcceptedDate", async (req, res) => {
    try {
      console.log(req.body);

      const userSnapshot = await db
        .collection("users")
        .where("uid", "==", req.body.uid)
        .get();

      if (userSnapshot.empty) {
        return res.status(404).json({ error: "User not found" });
      }

      const userData = userSnapshot.docs[0].data();

      const bookingSnapshot = await db
        .collection("bookings")
        .where("customerMessageId", "==", req.body.customerMessageId)
        .get();

      if (bookingSnapshot.empty)
        return res.status(204).json({ error: "No bookings found" });

      const bookingData = bookingSnapshot.docs[0].data();

      const batch = db.batch();
      bookingSnapshot.forEach((doc) => {
        const data = doc.data();

        if (
          data.repairShopUid === req.body.uid &&
          data.requestId === req.body.requestId &&
          data.customerMessageId === req.body.customerMessageId
        ) {
          batch.update(doc.ref, {
            acceptedByRepairShop: { uid: req.body.uid },
            saveAcceptedDate: {
              uid: req.body.uid,
              requestId: req.body.requestId,
              acceptedDate: req.body.acceptedDate,
            },
            dateAccepted: new Date(),
            priceToPay: Math.floor(data.priceOffer * 0.05),
            isTrialBooking: req.body.isTrialBooking,
            subscriptionType: req.body.subscriptionType,
            paymentCompleted: req.body.paymentCompleted,
            repairShopName: userData.name,
            address: userData.address,
            location: userData.location,
            phoneNumber: userData.phoneNumber,
            postalCode: userData.postalCode,
          });
        }
      });

      await batch.commit();

      try {
        await sendBookingConfirmation(
          userData,
          bookingData,
          req.body.customerEmail,
          req.body.acceptedDate
        );

        res.status(201).json("Dates saved successfully and email sent");
      } catch (emailError) {
        console.log(emailError);
        res
          .status(201)
          .json("Dates saved successfully but email failed to send");
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  const sendNewDatesConfirmation = async (
    userData,
    bookingData,
    customerEmail,
    firstDate,
    secondDate,
    thirdDate
  ) => {
    const dateOne = new Date(firstDate);
    const dateTwo = new Date(secondDate);
    const dateThree = new Date(thirdDate);

    const emailProps = {
      userName: userData.name,
      type: bookingData.type,
      typeOfFix: bookingData.typeOfFix,
      firstDate: new Intl.DateTimeFormat("sv-SE").format(dateOne),
      secondDate: new Intl.DateTimeFormat("sv-SE").format(dateTwo),
      thirdDate: new Intl.DateTimeFormat("sv-SE").format(dateThree),
    };

    const mjmlTemplate = SuggestedDates.render(emailProps);
    const { html } = mjml2html(mjmlTemplate);

    try {
      const response = await resend.emails.send({
        from: "noreply@fixmatch.se",
        to: customerEmail,
        subject: "Nya datum föreslagna",
        html: html,
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  router.post("/saveNewDates", async (req, res) => {
    try {
      const userSnapshot = await db
        .collection("users")
        .where("uid", "==", req.body.uid)
        .get();

      if (userSnapshot.empty) {
        return res.status(404).json({ error: "User not found" });
      }

      const userData = userSnapshot.docs[0].data();

      const bookingSnapshot = await db
        .collection("bookings")
        .where("customerMessageId", "==", req.body.customerMessageId)
        .get();

      if (bookingSnapshot.empty)
        return res.status(204).json({ error: "No bookings found" });

      const bookingData = bookingSnapshot.docs[0].data();

      const batch = db.batch();
      bookingSnapshot.forEach((doc) => {
        const data = doc.data();

        if (
          data.repairShopUid === req.body.uid &&
          data.requestId === req.body.requestId &&
          data.customerMessageId === req.body.customerMessageId
        ) {
          batch.update(doc.ref, {
            suggestedDates: {
              uid: req.body.uid,
              requestId: req.body.requestId,
              firstDate: req.body.firstDate,
              secondDate: req.body.secondDate,
              thirdDate: req.body.thirdDate,
            },
          });
        }
      });

      await batch.commit();

      try {
        await sendNewDatesConfirmation(
          userData,
          bookingData,
          req.body.customerEmail,
          req.body.firstDate,
          req.body.secondDate,
          req.body.thirdDate
        );
        res.status(201).json("Dates saved successfully and email sent");
      } catch (emailError) {
        res
          .status(201)
          .json("Dates saved successfully but email failed to send");
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/fetchBooking", async (req, res) => {
    const bookedRequests = [];

    try {
      const bookingSnapshot = await db
        .collection("bookings")
        .where("requestId", "==", req.body.requestId)
        .get();

      if (bookingSnapshot.empty) {
        return res.status(204).json({ error: "No bookings found" });
      } else {
        bookingSnapshot.forEach((doc) => {
          const bookingData = doc.data();
          bookedRequests.push(bookingData);
        });

        res.status(201).json({ message: bookedRequests });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/fetchBookings", async (req, res) => {
    try {
      const bookedRequestsSnapshot = await db
        .collection("bookings")
        .where("repairShopUid", "==", req.body.uid)
        .get();

      if (bookedRequestsSnapshot.empty) {
        return res.status(204).json({ error: "No bookings found" });
      }

      const filteredBookings = bookedRequestsSnapshot.docs
        .map((doc) => doc.data())
        .filter(
          (request) =>
            request.acceptedByRepairShop.uid !== req.body.uid &&
            request.suggestedDates.uid !== req.body.uid
        );

      res.status(201).json({ bookings: filteredBookings });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/fetchAcceptedBookings", async (req, res) => {
    try {
      const acceptedBookings = await db
        .collection("bookings")
        .where("customerEmail", "==", req.body.email)
        .get();

      if (acceptedBookings.empty)
        return res.status(204).json({ error: "No bookings found" });

      const foundBookings = acceptedBookings.docs
        .map((bookingDoc) => {
          const bookingData = bookingDoc.data();

          if (
            bookingData.acceptedByRepairShop &&
            Object.keys(bookingData.acceptedByRepairShop).length > 0 &&
            !bookingData.declined
          ) {
            const acceptedDate = bookingData.saveAcceptedDate.acceptedDate
              ? new Date(bookingData.saveAcceptedDate.acceptedDate)
              : null;

            if (!acceptedDate || acceptedDate >= new Date()) return bookingData;
          }
          return null;
        })
        .filter(Boolean);

      res.status(201).json({ bookings: foundBookings });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/fetchRequestData", async (req, res) => {
    try {
      const requestIds = Object.values(req.body);
      const requests = [];

      for (const id of requestIds) {
        const requestSnapshot = await db
          .collection("contactRepairShops")
          .where("id", "==", id)
          .get();

        const docs = requestSnapshot.docs;
        docs.forEach((doc) => {
          const data = doc.data();
          requests.push({
            _id: doc.id,
            ...data,
          });
        });
      }

      if (requests.length === 0) {
        return res.status(401).json({ message: "No requests found!" });
      }

      res.status(201).json({ requests });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  });

  const sendBookingCancellationUser = async (
    userData,
    bookingToRefund,
    sender = ["repairShop", "user"],
    reason
  ) => {
    console.log(
      "Preparing cancellation email for normal user:",
      userData,
      bookingToRefund
    );

    let mjmlTemplate;

    const date = new Date(bookingToRefund.saveAcceptedDate.acceptedDate);

    const emailProps = {
      repairShopName: userData.name,
      type: bookingToRefund.type,
      typeOfFix: bookingToRefund.typeOfFix,
      date: new Intl.DateTimeFormat("sv-SE").format(date),
      reason: reason,
    };

    if (sender === "user")
      mjmlTemplate = BookingCanceledUser.render(emailProps);
    else if (sender === "repairShop")
      mjmlTemplate = BookingCanceledToUser.render(emailProps);

    const { html } = mjml2html(mjmlTemplate);

    try {
      const response = await resend.emails.send({
        from: "noreply@fixmatch.se",
        to: bookingToRefund.customerEmail,
        subject: "Bokning avbokad",
        html: html,
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  const sendBookingCancellationRepairShop = async (
    userData,
    bookingToRefund,
    sender = ["repairShop", "user"]
  ) => {
    const date = new Date(bookingToRefund.saveAcceptedDate.acceptedDate);

    console.log(
      "Preparing cancellation email with refund status to repair shop:"
    );

    let mjmlTemplate;

    const emailProps = {
      registrationNumber: bookingToRefund.registrationNumber,
      type: bookingToRefund.type,
      typeOfFix: bookingToRefund.typeOfFix,
      date: new Intl.DateTimeFormat("sv-SE").format(date),
    };

    if (sender === "user")
      mjmlTemplate = BookingCanceledToRepairShop.render(emailProps);
    else if (sender === "repairShop")
      mjmlTemplate = BookingCanceledRepairShop.render(emailProps);

    const { html } = mjml2html(mjmlTemplate);

    try {
      const response = await resend.emails.send({
        from: "noreply@fixmatch.se",
        to: userData.email,
        subject: "Bokning avbokad",
        html: html,
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  router.post("/cancelAcceptedBooking", async (req, res) => {
    console.log("Starting cancelAcceptedBooking process", {
      email: req.body.email,
      requestId: req.body.requestId,
      repairShopUid: req.body.repairShopUid,
    });

    try {
      const bookingSnapshot = await db
        .collection("bookings")
        .where("customerEmail", "==", req.body.email)
        .get();

      if (bookingSnapshot.empty) {
        console.log("No bookings found for email:", req.body.email);
        return res.status(204).json({ message: "No bookings found" });
      }

      const batch = db.batch();
      let bookingToRefund = null;
      let bookingDocRef = null;

      console.log(
        `Found ${bookingSnapshot.size} bookings for this email, searching for match...`
      );

      bookingSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Checking booking:", {
          id: doc.id,
          email: data.customerEmail,
          messageId: data.customerMessageId,
          requestId: data.requestId,
        });

        if (
          data.customerEmail === req.body.email &&
          data.customerMessageId === req.body.customerMessageId &&
          data.requestId === req.body.requestId &&
          data.repairShopUid === req.body.repairShopUid
        ) {
          console.log("Found matching booking to cancel:", doc.id);
          const updateData = {
            declined: true,
            cancellationDate: admin.firestore.FieldValue.serverTimestamp(),
          };
          bookingDocRef = doc.ref;
          batch.update(doc.ref, updateData);
          bookingToRefund = data;
        }
      });

      if (!bookingToRefund) {
        console.log("No matching booking found with the provided criteria");
        return res.status(404).json({ message: "No matching booking found" });
      }

      await batch.commit();
      console.log("Booking marked as declined successfully");

      let paymentIntentId = null;
      console.log(
        "Looking for payment record with bookingId:",
        bookingToRefund.requestId
      );

      const paymentSnapshot = await db
        .collection("bookingPayments")
        .where("bookingId", "==", bookingToRefund.requestId)
        .get();

      console.log(
        `Found ${paymentSnapshot.size} payment records for this booking`
      );

      const matchingPayment = paymentSnapshot.docs.find(
        (doc) => doc.data().uid === bookingToRefund.repairShopUid
      );

      if (matchingPayment) {
        const paymentData = matchingPayment.data();
        paymentIntentId = paymentData.paymentIntentId;
        console.log("Found matching payment with intent ID:", paymentIntentId);
      } else {
        console.log(
          "No matching payment found for this booking and repair shop"
        );
      }

      const userSnapshot = await db
        .collection("users")
        .where("uid", "==", req.body.repairShopUid)
        .get();

      let userData = null;
      if (!userSnapshot.empty) {
        userSnapshot.forEach((doc) => {
          userData = doc.data();
        });
        console.log(
          "Found user data for repair shop:",
          userData.name || userData.email
        );
      } else {
        console.log(
          "No user data found for repair shop UID:",
          req.body.repairShopUid
        );
      }

      let refundStatus = null;
      let refundError = null;
      let refundDetails = null;

      console.log("Checking refund eligibility:", {
        hasUserData: !!userData,
        hasBookingToRefund: !!bookingToRefund,
        hasPaymentIntentId: !!paymentIntentId,
        subscriptionType: bookingToRefund?.subscriptionType,
        isTrialBooking: bookingToRefund?.isTrialBooking,
      });

      if (
        userData &&
        bookingToRefund &&
        paymentIntentId &&
        bookingToRefund.subscriptionType === "core" &&
        bookingToRefund.isTrialBooking === false
      ) {
        console.log("Booking is eligible for refund, processing...");
        try {
          const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
          });

          refundDetails = {
            id: refund.id,
            amount: refund.amount,
            status: refund.status,
          };

          console.log("Refund processed successfully:", refundDetails);

          await bookingDocRef.update({
            refunded: true,
            refundId: refund.id,
            refundAmount: refund.amount,
            refundStatus: refund.status,
            refundDate: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log("Booking document updated with refund information");
          refundStatus = "Refund processed successfully";
        } catch (error) {
          refundError = {
            message: error.message,
            code: error.code,
            type: error.type,
          };
          console.error("Refund processing failed:", refundError);

          await bookingDocRef.update({
            refundAttempted: true,
            refundFailed: true,
            refundError: refundError,
            refundAttemptDate: admin.firestore.FieldValue.serverTimestamp(),
          });

          refundStatus = "Refund processing failed: " + error.message;
        }
      } else {
        console.log("Booking is not eligible for refund");
        await bookingDocRef.update({
          refundEligible: false,
          refundEligibilityNote: !userData
            ? "Missing shop data"
            : !paymentIntentId
            ? "No payment record found"
            : bookingToRefund.subscriptionType !== "core"
            ? "Not a core subscription"
            : bookingToRefund.isTrialBooking
            ? "Trial booking"
            : "Unknown reason",
        });
        refundStatus = "Booking not eligible for refund";
      }

      try {
        console.log("Sending cancellation email notification");
        await sendBookingCancellationUser(
          userData,
          bookingToRefund,
          (sender = "user")
        );

        await sendBookingCancellationRepairShop(
          userData,
          bookingToRefund,
          (sender = "user")
        );

        console.log("Cancellation email sent successfully");
        res.status(200).json({
          success: true,
          message: "Booking cancelled successfully",
          refundStatus: refundStatus,
          refundDetails: refundDetails,
          refundError: refundError,
        });
      } catch (emailError) {
        console.error("Failed to send cancellation email:", emailError);
        res.status(200).json({
          success: true,
          message: "Booking cancelled successfully but email failed to send",
          emailError: emailError.message,
          refundStatus: refundStatus,
          refundDetails: refundDetails,
          refundError: refundError,
        });
      }
    } catch (error) {
      console.error("Error in cancelAcceptedBooking:", error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  });

  router.post("/fetchAcceptedBookingsForRepairShop", async (req, res) => {
    try {
      const bookedRequestsSnapshot = await db
        .collection("bookings")
        .where("repairShopUid", "==", req.body.uid)
        .get();

      if (bookedRequestsSnapshot.empty) {
        return res.status(204).json({ error: "No bookings found" });
      }

      const foundBookings = bookedRequestsSnapshot.docs
        .map((bookingDoc) => {
          const bookingData = bookingDoc.data();

          if (
            bookingData.acceptedByRepairShop &&
            Object.keys(bookingData.acceptedByRepairShop).length > 0
          ) {
            const acceptedDate = bookingData.saveAcceptedDate.acceptedDate
              ? new Date(bookingData.saveAcceptedDate.acceptedDate)
              : null;

            if (!acceptedDate || acceptedDate >= new Date()) return bookingData;
          }

          return null;
        })
        .filter(Boolean);

      res.status(201).json({ bookings: foundBookings });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/cancelBookingForRepairShop", async (req, res) => {
    try {
      let userData = "";

      const userSnapshot = await db
        .collection("users")
        .where("uid", "==", req.body.repairShopUid)
        .get();

      if (userSnapshot.empty)
        return res.status(204).json({ message: "No bookings found" });

      userSnapshot.forEach((doc) => {
        userData = doc.data();
      });

      const bookingSnapshot = await db
        .collection("bookings")
        .where("customerMessageId", "==", req.body.customerMessageId)
        .get();

      if (bookingSnapshot.empty)
        return res.status(204).json({ message: "No bookings found" });

      const batch = db.batch();

      let bookingToRefund = null;
      let paymentIntentId = null;

      bookingSnapshot.forEach((doc) => {
        const data = doc.data();

        if (
          data.customerMessageId === req.body.customerMessageId &&
          data.requestId === req.body.requestId &&
          data.repairShopUid === req.body.repairShopUid
        ) {
          const updateData = {
            declined: true,
          };

          batch.update(doc.ref, updateData);
          bookingToRefund = data;
        }
      });

      await batch.commit();

      if (bookingToRefund) {
        const paymentSnapshot = await db
          .collection("bookingPayments")
          .where("bookingId", "==", bookingToRefund.requestId)
          .get();

        const matchingPayment = paymentSnapshot.docs.find(
          (doc) => doc.data().uid === bookingToRefund.repairShopUid
        );

        if (matchingPayment) {
          const paymentData = matchingPayment.data();
          paymentIntentId = paymentData.paymentIntentId;
        }
      }

      if (
        userData &&
        bookingToRefund &&
        paymentIntentId &&
        bookingToRefund.subscriptionType === "core" &&
        bookingToRefund.isTrialBooking === false
      ) {
        try {
          const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
          });

          const bookingRef = db
            .collection("bookings")
            .doc(bookingToRefund.requestId);

          await bookingRef.update({
            refunded: true,
            refundId: refund.id,
            refundDate: admin.firestore.FieldValue.serverTimestamp(),
          });

          refundStatus = "Refund processed successfully";
        } catch (error) {
          refundStatus = "Refund processing failed";
        }
      }

      try {
        await sendBookingCancellationUser(
          userData,
          bookingToRefund,
          (sender = "repairShop"),
          req.body.reason
        );

        await sendBookingCancellationRepairShop(
          userData,
          bookingToRefund,
          (sender = "repairShop")
        );

        res.status(201).json("Booking cancelled successfully");
      } catch (emailError) {
        res
          .status(201)
          .json("Booking cancelled successfully but email failed to send");
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/fetchBookingsWithNewDates", async (req, res) => {
    try {
      const bookedRequestsSnapshot = await db
        .collection("bookings")
        .where("customerEmail", "==", req.body.email)
        .get();

      if (bookedRequestsSnapshot.empty) {
        return res.status(204).json({ error: "No bookings found" });
      }

      let filteredBookings = bookedRequestsSnapshot.docs
        .map((doc) => doc.data())
        .filter((booking) => Object.keys(booking.suggestedDates).length > 0);

      const enhancedBookings = await Promise.all(
        filteredBookings.map(async (booking) => {
          try {
            const repairShopSnapshot = await db
              .collection("users")
              .where("uid", "==", booking.repairShopUid)
              .get();

            if (repairShopSnapshot.docs[0].empty) return booking;

            const shopData = repairShopSnapshot.docs[0].data();

            return {
              ...booking,
              repairShopName: shopData.name,
              repairShopAddress: shopData.address,
              selectedTimes: shopData.selectedTimes,
            };
          } catch (error) {
            return booking;
          }
        })
      );

      res.status(201).json({ bookings: enhancedBookings });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/saveNewAcceptedDates", async (req, res) => {
    try {
      const bookingSnapshot = await db
        .collection("bookings")
        .where("customerMessageId", "==", req.body.customerMessageId)
        .get();

      if (bookingSnapshot.empty)
        return res.status(204).json({ error: "No bookings found" });

      const batch = db.batch();
      bookingSnapshot.forEach((doc) => {
        const data = doc.data();

        if (
          data.repairShopUid === req.body.uid &&
          data.requestId === req.body.requestId &&
          data.customerMessageId === req.body.customerMessageId
        ) {
          batch.update(doc.ref, {
            suggestedDates: {},
            acceptedByCustomer: {
              uid: req.body.uid,
              requestId: req.body.requestId,
              acceptedDate: req.body.acceptedDate,
            },
          });
        }
      });

      await batch.commit();

      res.status(201).json("Dates saved successfully");
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/updateSavedDates", async (req, res) => {
    try {
      const bookingSnapshot = await db
        .collection("bookings")
        .where("customerMessageId", "==", req.body.customerMessageId)
        .get();

      if (bookingSnapshot.empty)
        return res.status(204).json({ error: "No bookings found" });

      const batch = db.batch();
      bookingSnapshot.forEach((doc) => {
        const data = doc.data();

        if (
          data.repairShopUid === req.body.uid &&
          data.requestId === req.body.requestId &&
          data.customerMessageId === req.body.customerMessageId
        ) {
          batch.update(doc.ref, {
            suggestedDates: {},
            acceptedByRepairShop: {},
            saveAcceptedDate: {},
            dateOne: req.body.dateOne,
            dateTwo: req.body.dateTwo,
            dateThree: req.body.dateThree,
          });
        }
      });

      await batch.commit();

      res.status(201).json("Dates saved successfully");
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  return router;
};
