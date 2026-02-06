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

  router.post("/deleteAccount", async (req, res) => {
    let template;

    try {
      const { uid } = req.body;
      const userSnapshot = await db
        .collection("users")
        .where("uid", "==", uid)
        .get();
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc?.data();

      if (userData) {
        let deletionDate;
        let createdAt = null; // Initialize createdAt variable here

        if (userData.sessionId) {
          try {
            const session = await stripe.checkout.sessions.retrieve(
              userData.sessionId
            );
            await stripe.subscriptions.cancel(session.subscription);
          } catch (error) {
            console.error("Error fetching Stripe subscription:", error);
          }
        }

        if (userData.email) {
          const repairShopUserDoc = userSnapshot.docs[0];

          if (!userSnapshot.empty && repairShopUserDoc) {
            const repairShopData = repairShopUserDoc.data();
            createdAt = getDateFromTimestamp(repairShopData.createdAt);

            const now = new Date();

            if (createdAt) {
              const TRIAL_PERIOD_DAYS = 121.6;
              const trialEndDate = new Date(createdAt);
              trialEndDate.setTime(
                createdAt.getTime() + TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000
              );

              if (trialEndDate > now) {
                deletionDate = trialEndDate;
                console.log(
                  `User is in trial period. Setting deletion date to trial end: ${deletionDate}`
                );
              } else {
                deletionDate = new Date();
                deletionDate.setDate(deletionDate.getDate() + 30);
                console.log(
                  `User's trial has ended. Setting deletion date to 30 days from now: ${deletionDate}`
                );
              }
            } else {
              deletionDate = new Date();
              deletionDate.setDate(deletionDate.getDate() + 30);
              console.log(
                `No creation date found. Setting deletion date to 30 days from now: ${deletionDate}`
              );
            }

            await repairShopUserDoc.ref.update({
              deleted: true,
            });
            console.log(
              `Updated repairShopUsers document for email: ${userData.email}`
            );
          } else {
            deletionDate = new Date();
            deletionDate.setDate(deletionDate.getDate() + 30);
            console.log(
              `No matching repairShopUsers document found for email: ${userData.email}`
            );
          }
          const userEmailSnapshot = await db
            .collection("users")
            .where("email", "==", userData.email)
            .get();

          if (!userEmailSnapshot.empty) {
            const userEmailDoc = userEmailSnapshot.docs[0];
            await userEmailDoc.ref.update({
              sessionId: null,
            });
            console.log(`Updated users document for email: ${userData.email}`);
          } else {
            console.log(
              `No matching users document found for email: ${userData.email}`
            );
          }
        } else {
          deletionDate = new Date();
          deletionDate.setDate(deletionDate.getDate() + 30);
        }
        await userDoc.ref.update({
          deleted: deletionDate,
        });

        if (
          deletionDate &&
          createdAt &&
          deletionDate.getTime() - new Date().getTime() >
            30 * 24 * 60 * 60 * 1000
        ) {
          const daysRemaining = Math.ceil(
            (deletionDate.getTime() - new Date().getTime()) /
              (24 * 60 * 60 * 1000)
          );

          template = DeleteAccountTrialTemplate.render({
            trialEndDate: deletionDate.toLocaleDateString(),
            days: daysRemaining,
          });
        } else {
          template = DeleteAccountTemplate.render();
        }

        const { html } = mjml2html(template);

        try {
          const response = await resend.emails.send({
            from: "noreply@fixmatch.se",
            to: userData.email,
            subject: "Konto raderat",
            html: html,
          });

          console.log("Email sent successfully:", response);
          res.status(201).json({
            success: true,
            message: "Account marked for deletion, email sent",
            deletionDate: deletionDate,
          });

          return response;
        } catch (error) {
          console.error("Error sending email:", error);
          res.status(201).json({
            success: true,
            message: "Account marked for deletion, without email",
            deletionDate: deletionDate,
          });

          throw error;
        }
      } else {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete account",
        error: error.message,
      });
    }
  });

  router.post("/cancelDelete", async (req, res) => {
    try {
      const { uid } = req.body;

      const userSnapshot = await db
        .collection("users")
        .where("uid", "==", uid)
        .get();

      const userDoc = userSnapshot.docs[0];
      const userData = userSnapshot.docs[0].data();

      await userDoc.ref.update({
        newPaymentDate: userData.deleted,
        deleted: null,
      });

      res.status(201).json({
        message: "Cancelled deletion",
      });
    } catch (error) {
      console.error("Account deletion error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete account",
        error: error.message,
      });
    }
  });

  router.post("/createUser", async (req, res) => {
    try {
      const { name, email, code } = req.body;
      const lowerEmail = email.toLowerCase();
      const clientIP = req.ip;

      const emailProps = {
        code,
        userName: name,
      };

      const mjmlTemplate = EmailVerificationTemplate.render(emailProps);
      const { html } = mjml2html(mjmlTemplate);

      const foundUserRegistration = await db
        .collection("temporaryUsers")
        .where("clientIP", "==", clientIP)
        .get();

      if (!foundUserRegistration.empty)
        return res.status(409).json({ message: "Registration in progress!" });

      const foundUserDoc = await db
        .collection("users")
        .where("email", "==", lowerEmail)
        .get();

      if (!foundUserDoc.empty)
        return res.status(409).json({ message: "Already registered!" });

      await db.collection("temporaryUsers").add({
        email,
        clientIP,
        code,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 40 * 60 * 1000),
        name,
      });

      const emailSent = await resend.emails.send({
        from: "noreply@fixmatch.se",
        to: lowerEmail,
        subject: "Verifera e-mailadress",
        html: html,
      });

      console.log({ emailSent: emailSent });

      const userRecord = await admin.auth().createUser({
        email: req.body.email.toLowerCase(),
        password: req.body.password,
      });

      await db.collection("users").add({
        name: req.body.name,
        email: req.body.email,
        lastSignIn: new Date(),
        repairShop: req.body.repairShop,
        agreementAccepted: req.body.agreementAccepted,
        createdAt: new Date(),
        verified: false,
        expiresAt: new Date(Date.now() + 40 * 60 * 1000),
        uid: userRecord.uid,
      });

      res.status(201).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("User creation error:", error);
      res.status(500).json({
        error: "Failed to create user",
      });
    }
  });

  router.post("/verifyUser", async (req, res) => {
    try {
      const foundUserDoc = await db
        .collection("temporaryUsers")
        .where("code", "==", req.body.code.replace(/,/g, ""))
        .get();

      if (foundUserDoc.empty)
        return res
          .status(409)
          .json({ message: "No registration in progress!" });

      const userData = foundUserDoc.docs[0].data();

      const foundUserInUsers = await db
        .collection("users")
        .where("email", "==", userData.email)
        .get();

      if (foundUserInUsers.empty) {
        return res.status(404).json({ message: "User not found!" });
      }

      const userDoc = foundUserInUsers.docs[0];
      await userDoc.ref.update({ verified: true });

      await foundUserDoc.docs[0].ref.delete();

      res.status(201).json({ message: -"User successfully verified!" });
    } catch (error) {
      console.error("Error during verification:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.post("/resendCode", async (req, res) => {
    try {
      const foundUserDoc = await db
        .collection("temporaryUsers")
        .where("email", "==", req.body.email)
        .get();

      if (foundUserDoc.empty)
        return res
          .status(409)
          .json({ message: "No registration in progress!" });

      const userData = foundUserDoc.docs[0].data();

      const foundUserInUsers = await db
        .collection("users")
        .where("email", "==", userData.email)
        .get();

      if (foundUserInUsers.empty) {
        return res.status(404).json({ message: "User not found!" });
      }

      const emailProps = {
        code: userData.code,
        userName: userData.name,
      };

      const mjmlTemplate = EmailVerificationTemplate.render(emailProps);
      const { html } = mjml2html(mjmlTemplate);

      const emailSent = await resend.emails.send({
        from: "noreply@fixmatch.se",
        to: userData.email,
        subject: "Verifera e-mailadress",
        html: html,
      });

      console.log({ emailSent: emailSent });

      res.status(200).json({ message: "Email successfully sent!" });
    } catch (error) {
      console.error("Error during sending");
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.post("/createRepairShopUser", async (req, res) => {
    try {
      const { name, email, code, registrationId } = req.body;
      const lowerEmail = email.toLowerCase();
      const clientIP = req.ip;

      const emailProps = {
        code,
        userName: name,
      };

      const mjmlTemplate = EmailVerificationTemplate.render(emailProps);
      const { html } = mjml2html(mjmlTemplate);

      const foundUserRegistration = await db
        .collection("temporaryUsers")
        .where("clientIP", "==", clientIP)
        .get();

      if (!foundUserRegistration.empty)
        return res.status(409).json({ message: "Registration in progress!" });

      const foundUserDoc = await db
        .collection("users")
        .where("email", "==", req.body.email)
        .get();

      if (!foundUserDoc.empty)
        return res.status(409).json({ message: "Already registered!" });

      await db.collection("temporaryUsers").add({
        registrationId,
        email,
        clientIP,
        code,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 40 * 60 * 1000),
        name,
      });

      const userRecord = await admin.auth().createUser({
        email: req.body.email,
        password: req.body.password,
      });

      console.log(
        `🚀 Loaded environment: .env.${process.env.NODE_ENV || "development"}`
      );

      await db.collection("users").add({
        firstSignIn: true,
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        postalCode: req.body.postalCode,
        address: req.body.address,
        email: lowerEmail,
        lastSignIn: new Date(),
        location: req.body.location,
        repairShop: req.body.repairShop,
        sessionId: null,
        selectedTimes: [],
        workWarranty: "",
        partsWarranty: "",
        isRentalCar: false,
        paymentOptions: [""],
        uid: userRecord.uid,
        agreementAccepted: req.body.agreementAccepted,
        verified: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 40 * 60 * 1000),
        subscriptionType: req.body.subscriptionType,
      });

      const notSignedUpShopsQuery = await db
        .collection("notSignedUpRepairShops")
        .where("email", "==", req.body.email)
        .get();

      if (!notSignedUpShopsQuery.empty) {
        const userData = notSignedUpShopsQuery.docs[0].data();

        if (userData.location === req.body.location) {
          try {
            console.log(
              `Found ${notSignedUpShopsQuery.size} documents to delete for email: ${req.body.email}`
            );

            notSignedUpShopsQuery.docs.forEach((doc) => {
              console.log(
                `Document ID: ${doc.id}, Data:`,
                JSON.stringify(doc.data())
              );
            });

            for (const doc of notSignedUpShopsQuery.docs) {
              try {
                await doc.ref.delete();
                console.log(`Successfully deleted document ${doc.id}`);
              } catch (deleteError) {
                console.error(
                  `Failed to delete document ${doc.id}:`,
                  deleteError
                );
              }
            }

            const verifyQuery = await db
              .collection("notSignedUpRepairShops")
              .where("email", "==", req.body.email)
              .get();

            console.log(
              `After deletion attempt, found ${verifyQuery.size} remaining documents`
            );
          } catch (batchError) {
            console.error("Error in deletion batch process:", batchError);
          }
        }
      }

      const emailSent = await resend.emails.send({
        from: "noreply@fixmatch.se",
        to: req.body.email,
        subject: "Verifera e-mailadress",
        html: html,
      });

      console.log({ emailSent: emailSent });

      res.status(201).json({ message: "Email sent successfully" });
    } catch (error) {
      console.log(error);

      return res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    }
  });

  router.post("/signin", async (req, res) => {
    let trialDays = 0;

    const TRIAL_PERIOD_DAYS = 121.6;

    try {
      const foundUserDoc = await db
        .collection("users")
        .where("email", "==", req.body.email)
        .get();

      if (foundUserDoc.empty)
        return res.status(404).json({ message: "Wrong email or password!" });

      const foundUser = foundUserDoc.docs[0].data();

      const now = new Date();
      const startDate = getDateFromTimestamp(foundUser.createdAt);

      if (foundUser.verified === false) {
        return res.status(403).json({ message: "User not verified" });
      }

      if (
        foundUser.deleted &&
        now > new Date(foundUser.deleted.seconds * 1000 - 60000)
      ) {
        return res
          .status(404)
          .json({ message: "Repair shop user data not found" });
      }

      if (foundUser.repairShop) {
        if (foundUserDoc.empty) {
          return res
            .status(404)
            .json({ message: "Repair shop user data not found" });
        }

        if (
          foundUser.subscriptionType === "core" ||
          !!foundUser.subscriptionType === false
        ) {
          await db.collection("users").doc(foundUserDoc.docs[0].id).update({
            subscriptionType: "core",
          });

          if (
            foundUser.subscriptionType === "core" ||
            !!foundUser.subscriptionType === false
          ) {
            await db.collection("users").doc(foundUserDoc.docs[0].id).update({
              subscriptionType: "core",
            });

            if (foundUser.sessionId !== null) {
              try {
                const session = await stripe.checkout.sessions.retrieve(
                  foundUser.sessionId
                );

                if (session.subscription) {
                  await stripe.subscriptions.cancel(session.subscription);

                  await db
                    .collection("users")
                    .doc(foundUserDoc.docs[0].id)
                    .update({
                      sessionId: null,
                    });
                }
              } catch (error) {
                console.error("Error cancelling subscription");
              }
            }

            return res
              .status(201)
              .json({ message: "Core user, sign in successful" });
          }

          return res
            .status(201)
            .json({ message: "Core user, sign in successful" });
        }

        console.log({ startDate: startDate });
        console.log({ subscriptionType: foundUser.subscriptionType });

        if (startDate) {
          console.log({ startDate: startDate });
          trialDays = differenceInDays(now, startDate);
        }

        console.log({ trialDays: trialDays });

        if (trialDays > TRIAL_PERIOD_DAYS) {
          console.log("Trial period has ended, checking payment");
          if (foundUser.sessionId) {
            console.log("sessionId");
            try {
              const session = await stripe.checkout.sessions.retrieve(
                foundUser.sessionId
              );

              subscriptionType = "premium";

              if (session.payment_status === "paid") {
                console.log("Payment confirmed, allowing access");
                res
                  .status(201)
                  .json({ message: "Payment done, sign in successful" });
              } else {
                console.log("Payment required, sending payment URL");
                res.status(500).json({
                  message: "Payment not done",
                  url: session.url,
                  trialDays: trialDays.toFixed(2),
                  remainingDays: 0,
                });
              }
            } catch (error) {
              console.error("Error retrieving Stripe session:", error);
              res.status(500).json({
                message: "Error processing payment status",
                trialDays: trialDays.toFixed(2),
                remainingDays: 0,
              });
            }
          } else if (
            foundUser.newPaymentDate &&
            now < new Date(foundUser.newPaymentDate._seconds * 1000)
          ) {
            console.log(
              "foundUser.newPaymentDate",
              now,
              new Date(foundUser.newPaymentDate._seconds * 1000)
            );

            res.status(201).json({
              message:
                "Account deletion canceled, but former payment period still active",
            });
          } else if (
            foundUser.deleted &&
            now < new Date(foundUser.deleted._seconds * 1000)
          ) {
            console.log(
              "foundUser.deleted",
              now,
              new Date(foundUser.deleted._seconds * 1000)
            );

            res.status(201).json({
              message: "Account marked for deletion, no payment",
            });
          } else {
            const session = await stripe.checkout.sessions.create({
              success_url: `https://fixmatch.se/#/sign-in`,
              cancel_url: `https://fixmatch.se/#/register-repair-shop`,
              line_items: [
                {
                  price: process.env.PRICE_KEY,
                  quantity: 1,
                },
              ],
              automatic_tax: {
                enabled: true,
              },
              mode: "subscription",
            });

            await db.collection("users").doc(foundUserDoc.docs[0].id).update({
              sessionId: session.id,
              newPaymentDate: null,
            });

            return res.status(500).json({
              message: "Payment required",
              url: session.url,
            });
          }
        } else {
          console.log("Still in trial period, allowing access");
          const remainingDays = Math.max(0, TRIAL_PERIOD_DAYS - trialDays);

          res.status(201).json({
            message: "Trial period active, sign in successful",
            trialDays: trialDays.toFixed(2),
            remainingDays: remainingDays.toFixed(2),
          });
        }
      } else {
        console.log("normal user");
        res.status(201).json({ message: "Normal user, sign in successful" });
      }

      await db.collection("users").doc(foundUserDoc.docs[0].id).update({
        lastSignIn: new Date(),
      });
    } catch (error) {
      console.error("Sign in error:", error);
      res.status(500).json({
        message: "An error occurred during sign in",
        error: error.message,
      });
    }
  });

  router.post("/retrieveUserData", async (req, res) => {
    try {
      const foundUserDoc = await db
        .collection("users")
        .where("email", "==", req.body.email)
        .get();

      if (foundUserDoc.empty) {
        res.status(401).json({ message: "Wrong email or password!" });
        return;
      }

      const foundUser = foundUserDoc.docs[0].data();

      console.log(foundUser);
    } catch (error) {
      res.status(500);
    }
  });

  router.post("/retrieveRepairShopData", async (req, res) => {
    try {
      const userIds = Object.values(req.body);
      const foundUsers = [];

      for (const uid of userIds) {
        const userSnapshot = await db
          .collection("users")
          .where("uid", "==", uid)
          .get();

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();

          const { sessionId, ...userDataWithoutSessionId } = userData;
          foundUsers.push(userDataWithoutSessionId);
        }
      }

      if (foundUsers.length === 0)
        return res.status(401).json({ message: "No repair shops found!" });

      res.status(201).json({ users: foundUsers });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/checkTrialPeriod", async (req, res) => {
    console.log("checkTrialPeriod");
    try {
      const repairShopUserSnapshot = await db
        .collection("users")
        .where("email", "==", req.body.email)
        .get();

      const repairShopUserDoc = repairShopUserSnapshot.docs[0];
      const repairShopData = repairShopUserDoc.data();
      createdAt = getDateFromTimestamp(repairShopData.createdAt);

      if (createdAt) {
        const now = new Date();
        const TRIAL_PERIOD_DAYS = 121.6;
        const trialEndDate = new Date(createdAt);
        trialEndDate.setTime(
          createdAt.getTime() + TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000
        );

        if (now > trialEndDate) {
          res.status(403).json({ message: "No trial left, sign out user" });
        } else {
          res.status(200).json({ message: "Trial left" });
        }
      }
    } catch (error) {
      console.log("error");
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return router;
};
