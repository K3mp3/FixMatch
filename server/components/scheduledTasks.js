const cron = require("node-cron");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const mjml2html = require("mjml");
const { OffersReadyTemplate } = require("../email-templates/OffersReady");
const { NoOffersTemplate } = require("../email-templates/NoOffers");
const { getDateFromTimestamp } = require("../utils/timeStamp");
const { TrialEndingTemplate } = require("../email-templates/TrialEnding");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function deleteScheduledAccounts() {
  const now = new Date();

  try {
    const usersSnapshot = await admin
      .firestore()
      .collection("users")
      .where("deleted", "<=", now)
      .get();

    console.log(`Found ${usersSnapshot.size} users scheduled for deletion`);

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const uid = userData.uid;
      const sessionId = userData.sessionId;

      console.log({ sessionId: sessionId });

      try {
        if (sessionId) {
          try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            if (session.subscription) {
              await stripe.subscriptions.cancel(session.subscription);
              console.log("Cancelled subscription for user", userData.email);
            }

            if (session.customer) {
              await stripe.customers.del(session.customer);
              console.log("Deleted Stripe customer for user", userData.email);
            }
          } catch (stripeError) {
            try {
              const customers = await stripe.customers.list({
                email: email,
                limit: 1,
              });
              if (customers.data.length > 0) {
                const customer = customers.data[0];
                if (customer.subscriptions?.data[0]) {
                  await stripe.subscriptions.cancel(
                    customer.subscriptions.data[0].id
                  );
                  console.log(
                    `Cancelled subscription for user ${email} via customer lookup`
                  );
                }
                await stripe.customers.del(customer.id);
                console.log(
                  `Deleted Stripe customer for user ${email} via customer lookup`
                );
              }
            } catch (fallbackError) {
              console.error(
                `Failed to cleanup Stripe data for ${email}:`,
                fallbackError
              );
            }
          }
        }

        await admin.auth().deleteUser(uid);
        console.log(`Deleted user ${userData.email} from Firebase Auth`);

        const contactRepairShopsSnapshot = await admin
          .firestore()
          .collection("contactRepairShops")
          .get();

        for (const repairShopDoc of contactRepairShopsSnapshot.docs) {
          const data = repairShopDoc.data();

          if (data.repairShopAnswers?.some((answer) => answer.uuid === uid)) {
            const updatedRepairShopAnswers = data.repairShopAnswers.filter(
              (answer) => answer.uuid !== uid
            );

            await repairShopDoc.ref.update({
              repairShopAnswers: updatedRepairShopAnswers,
            });
          }
        }

        const bookingsSnapshot = await admin
          .firestore()
          .collection("bookings")
          .where("acceptedByRepairShop.uid", "==", uid)
          .get();

        console.log(
          `Found ${bookingsSnapshot.size} bookings with acceptedByRepairShop`
        );

        for (const bookingDoc of bookingsSnapshot.docs) {
          await bookingDoc.ref.delete();

          console.log(`Cleared booking ${bookingDoc.id}`);
        }

        const suggestedDatesSnapshot = await admin
          .firestore()
          .collection("bookings")
          .where("suggestedDates.uid", "==", uid)
          .get();

        console.log(
          `Found ${suggestedDatesSnapshot.size} bookings with suggestedDates`
        );

        for (const bookingDoc of suggestedDatesSnapshot.docs) {
          await bookingDoc.ref.delete();

          console.log(`Updated suggestedDates for booking ${bookingDoc.id}`);
        }

        await doc.ref.delete();
        console.log(`Deleted user document for ${userData.email}`);
      } catch (error) {
        console.error(
          `Error processing deletion for user ${userData.email}:`,
          error
        );

        continue;
      }
    }
  } catch (error) {
    console.error("Error in deleteScheduledAccounts:", error);
  }
}

async function checkValidOffers() {
  const now = new Date();

  try {
    const contactRepairShopsSnapshot = await admin
      .firestore()
      .collection("contactRepairShops")
      .get();

    for (const doc of contactRepairShopsSnapshot.docs) {
      const data = doc.data();

      const validDate = new Date(data.validDate);
      const oneDayAfterValidDate = new Date(
        validDate.getTime() + 1 * 24 * 60 * 60 * 1000
      );

      const hasRepairShopAnswers =
        Array.isArray(data.repairShopAnswers) &&
        data.repairShopAnswers.length > 0;

      console.log("Processing document:", {
        validDate: data.validDate,
        hasNotification: data.offersNotificationSent,
        hasAnswers: hasRepairShopAnswers,
        currentTime: now.toISOString(),
        sevenDaysAfterValid: oneDayAfterValidDate.toISOString(),
      });

      console.log("Condition checks:", {
        isAfterValidDate: now > validDate,
        notificationNotSent: !data.offersNotificationSent,
        hasRepairShopAnswers: hasRepairShopAnswers,
      });

      if (
        now > validDate.getTime() + 1 * 3 * 60 * 60 * 1000 &&
        !data.offersNotificationSent &&
        hasRepairShopAnswers
      ) {
        console.log("Conditions met, preparing to send email");

        try {
          const emailProps = {
            registrationNumber: data.registrationNumber,
            type: data.customerMessage?.[0]?.type || "service",
            location: data.location,
            offerCount: data.repairShopAnswers.length,
          };

          const mjmlTemplate = OffersReadyTemplate.render(emailProps);
          const { html } = mjml2html(mjmlTemplate);

          await resend.emails.send({
            from: "noreply@fixmatch.se",
            to: data.customerEmail,
            subject: "Dina offerter är redo att granskas",
            html: html,
          });

          await doc.ref.update({
            offersNotificationSent: true,
            offersNotificationDate:
              admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log(
            `Sent offers ready notification to ${data.customerEmail}`
          );
        } catch (error) {
          console.error(
            `Error sending notification for document ${doc.id}:`,
            error
          );
          continue;
        }
      } else if (
        now > oneDayAfterValidDate &&
        !data.offersNotificationSent &&
        !hasRepairShopAnswers
      ) {
        console.log("Conditions met, preparing to send no offers email");

        try {
          const emailProps = {
            registrationNumber: data.registrationNumber,
            type: data.customerMessage?.[0]?.type || "service",
            location: data.location,
            offerCount: data.repairShopAnswers.length,
          };

          const mjmlTemplate = NoOffersTemplate.render(emailProps);
          const { html } = mjml2html(mjmlTemplate);

          await resend.emails.send({
            from: "noreply@fixmatch.se",
            to: data.customerEmail,
            subject: "Inga offerter",
            html: html,
          });

          await doc.ref.update({
            offersNotificationSent: true,
            offersNotificationDate:
              admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log(`Sent no offers notification to ${data.customerEmail}`);
        } catch (error) {
          console.error(
            `Error sending notification for document ${doc.id}:`,
            error
          );
          continue;
        }
      }
    }
  } catch (error) {
    console.error("Error in checkValidOffers:", error);
  }
}

async function deleteInactiveUnverifiedUsers() {
  console.log("Starting deletion of inactive unverified users");
  const now = new Date();

  try {
    console.log("Querying users collection...");
    const usersSnapshot = await admin
      .firestore()
      .collection("users")
      .where("verified", "==", false)
      .get();

    console.log(`Found ${usersSnapshot.size} unverified users total`);

    const expiredUsers = usersSnapshot.docs.filter((doc) => {
      const userData = doc.data();
      const expiresAt = userData.expiresAt?.toDate();
      console.log({ expiresAt: expiresAt });
      console.log({ now: now });
      console.log(expiresAt < now);
      console.log(expiresAt && expiresAt < now);
      return expiresAt && expiresAt < now;
    });

    console.log(
      `Found ${expiredUsers.length} expired unverified users to delete`
    );

    for (const userDoc of expiredUsers) {
      const userData = userDoc.data();
      const userEmail = userData.email;
      const uid = userData.uid;
      const sessionId = userData.sessionId;

      try {
        console.log(`Processing user: ${userEmail} with UID: ${uid}`);
        if (sessionId) {
          if (sessionId) {
            try {
              const session = await stripe.checkout.sessions.retrieve(
                sessionId
              );

              if (session.subscription) {
                await stripe.subscriptions.cancel(session.subscription);
                console.log("Cancelled subscription for user", userData.email);
              }

              if (session.customer) {
                await stripe.customers.del(session.customer);
                console.log("Deleted Stripe customer for user", userData.email);
              }
            } catch (stripeError) {
              try {
                const customers = await stripe.customers.list({
                  email: email,
                  limit: 1,
                });
                if (customers.data.length > 0) {
                  const customer = customers.data[0];
                  if (customer.subscriptions?.data[0]) {
                    await stripe.subscriptions.cancel(
                      customer.subscriptions.data[0].id
                    );
                    console.log(
                      `Cancelled subscription for user ${email} via customer lookup`
                    );
                  }
                  await stripe.customers.del(customer.id);
                  console.log(
                    `Deleted Stripe customer for user ${email} via customer lookup`
                  );
                }
              } catch (fallbackError) {
                console.error(
                  `Failed to cleanup Stripe data for ${email}:`,
                  fallbackError
                );
              }
            }
          }
        }

        try {
          await admin.auth().deleteUser(uid);
          console.log(
            `Successfully deleted user ${userEmail} from Firebase Auth`
          );
        } catch (authError) {
          console.error(
            `Error deleting user ${userEmail} from Firebase Auth:`,
            authError
          );
        }

        const tempUserSnapshot = await admin
          .firestore()
          .collection("temporaryUsers")
          .where("email", "==", userEmail)
          .get();

        if (!tempUserSnapshot.empty) {
          const tempUserDoc = tempUserSnapshot.docs[0];
          await tempUserDoc.ref.delete();
          console.log(
            `Deleted temporary user document for ${userEmail} from temporaryUsers collection`
          );
        }

        await userDoc.ref.delete();
        console.log(
          `Deleted user document for ${userEmail} from users collection`
        );
      } catch (error) {
        console.error(
          `Error processing deletion for user ${userEmail}:`,
          error
        );
      }
    }

    console.log("Completed deletion of inactive unverified users");
  } catch (error) {
    console.error("Error in deleteInactiveUnverifiedUsers:", error);
  }
}

async function notifyTrialEndingUsers() {
  console.log("Starting notification for users nearing trial end");
  const now = new Date();

  try {
    const repairShopUsersSnapshot = await admin
      .firestore()
      .collection("repairShopUsers")
      .where("deleted", "==", false)
      .get();

    console.log(
      `Found ${repairShopUsersSnapshot.size} active repair shop users to check`
    );

    let notifiedCount = 0;
    const TRIAL_PERIOD_DAYS = 121.6;
    const NOTIFICATION_DAYS_BEFORE = 14;

    for (const doc of repairShopUsersSnapshot.docs) {
      const userData = doc.data();
      const userEmail = userData.email;

      if (userData.trialEndingNotified) {
        continue;
      }

      const trialStartDate = getDateFromTimestamp(userData.createdAt);

      if (!trialStartDate) {
        console.log(`No valid trial start date for user ${userEmail}`);
        continue;
      }

      const trialEndDate = new Date(trialStartDate);
      trialEndDate.setTime(
        trialStartDate.getTime() + TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000
      );

      const daysRemaining = Math.ceil(
        (trialEndDate - now) / (24 * 60 * 60 * 1000)
      );

      console.log(
        `User ${userEmail} has ${daysRemaining} days remaining in trial`
      );

      if (
        daysRemaining >= NOTIFICATION_DAYS_BEFORE - 1 &&
        daysRemaining <= NOTIFICATION_DAYS_BEFORE + 1
      ) {
        try {
          const emailProps = {
            daysRemaining: NOTIFICATION_DAYS_BEFORE,
            trialEndDate: trialEndDate.toLocaleDateString("sv-SE"),
            userEmail: userEmail,
          };

          const mjmlTemplate = TrialEndingTemplate.render(emailProps);
          const { html } = mjml2html(mjmlTemplate);

          await resend.emails.send({
            from: "noreply@fixmatch.se",
            to: userEmail,
            subject: "Din provperiod går ut om 14 dagar",
            html: html,
          });

          await doc.ref.update({
            trialEndingNotified: true,
            trialEndingNotifiedDate:
              admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log(`Sent trial ending notification to ${userEmail}`);
          notifiedCount++;
        } catch (error) {
          console.error(
            `Error sending trial ending notification to ${userEmail}:`,
            error
          );
          continue;
        }
      }
    }

    console.log(
      `Completed trial end notifications. Notified ${notifiedCount} users.`
    );
  } catch (error) {
    console.error("Error in notifyTrialEndingUsers:", error);
  }
}

async function deleteOldDocuments() {
  console.log("Starting deletion of old documents (older than 1825 days)");

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 1825);

    console.log(
      `Deleting contactRepairShops documents older than ${cutoffDate.toISOString()}`
    );
    const contactRepairShopsSnapshot = await admin
      .firestore()
      .collection("contactRepairShops")
      .get();

    let contactRepairShopsDeletedCount = 0;
    let pdfFilesDeletedCount = 0;

    for (const doc of contactRepairShopsSnapshot.docs) {
      const data = doc.data();
      if (data.validDate) {
        const validDate = new Date(data.validDate);
        if (validDate < cutoffDate) {
          if (data.repairShopAnswers && Array.isArray(data.repairShopAnswers)) {
            for (const answer of data.repairShopAnswers) {
              if (answer.pdfFileName) {
                const pdfPath = path.join("./pdfFiles", answer.pdfFileName);
                try {
                  if (fs.existsSync(pdfPath)) {
                    fs.unlinkSync(pdfPath);
                    pdfFilesDeletedCount++;
                    console.log(`Deleted PDF file: ${pdfPath}`);
                  } else {
                    console.log(`PDF file not found: ${pdfPath}`);
                  }
                } catch (fileError) {
                  console.error(
                    `Error deleting PDF file ${pdfPath}:`,
                    fileError
                  );
                }
              }
            }
          }

          await doc.ref.delete();
          contactRepairShopsDeletedCount++;
          console.log(
            `Deleted contactRepairShops document ${
              doc.id
            } with validDate ${validDate.toISOString()}`
          );
        }
      }
    }

    console.log(
      `Deleted ${contactRepairShopsDeletedCount} contactRepairShops documents and ${pdfFilesDeletedCount} PDF files`
    );

    console.log(
      `Deleting bookings documents older than ${cutoffDate.toISOString()}`
    );
    const bookingsSnapshot = await admin
      .firestore()
      .collection("bookings")
      .get();

    let bookingsDeletedCount = 0;

    for (const doc of bookingsSnapshot.docs) {
      const data = doc.data();

      // Check if the document has dateAccepted in Firestore timestamp format
      if (data.dateAccepted && data.dateAccepted.toDate) {
        const dateAccepted = data.dateAccepted.toDate();
        if (dateAccepted < cutoffDate) {
          await doc.ref.delete();
          bookingsDeletedCount++;
          console.log(
            `Deleted bookings document ${
              doc.id
            } with dateAccepted ${dateAccepted.toISOString()}`
          );
        }
      }
      // Also check for saveAcceptedDate.acceptedDate which appears to be another format
      else if (data.saveAcceptedDate && data.saveAcceptedDate.acceptedDate) {
        const acceptedDate = new Date(data.saveAcceptedDate.acceptedDate);
        if (acceptedDate < cutoffDate) {
          await doc.ref.delete();
          bookingsDeletedCount++;
          console.log(
            `Deleted bookings document ${
              doc.id
            } with saveAcceptedDate.acceptedDate ${acceptedDate.toISOString()}`
          );
        }
      }
    }

    console.log(`Deleted ${bookingsDeletedCount} bookings documents`);

    // For bookingPayments - checking the acceptedDate field
    console.log(
      `Deleting bookingPayments documents older than ${cutoffDate.toISOString()}`
    );
    const bookingPaymentsSnapshot = await admin
      .firestore()
      .collection("bookingPayments")
      .get();

    let bookingPaymentsDeletedCount = 0;

    for (const doc of bookingPaymentsSnapshot.docs) {
      const data = doc.data();
      if (data.acceptedDate) {
        const acceptedDate = new Date(data.acceptedDate);
        if (acceptedDate < cutoffDate) {
          await doc.ref.delete();
          bookingPaymentsDeletedCount++;
          console.log(
            `Deleted bookingPayments document ${
              doc.id
            } with acceptedDate ${acceptedDate.toISOString()}`
          );
        }
      }
    }

    console.log(
      `Deleted ${bookingPaymentsDeletedCount} bookingPayments documents`
    );

    console.log("Completed deletion of old documents");

    // Return counts for logging/monitoring
    return {
      contactRepairShopsDeleted: contactRepairShopsDeletedCount,
      bookingsDeleted: bookingsDeletedCount,
      bookingPaymentsDeleted: bookingPaymentsDeletedCount,
      pdfFilesDeleted: pdfFilesDeletedCount,
      totalDeleted:
        contactRepairShopsDeletedCount +
        bookingsDeletedCount +
        bookingPaymentsDeletedCount,
    };
  } catch (error) {
    console.error("Error in deleteOldDocuments:", error);
    throw error;
  }
}

// async function notifyUnsignedRepairShopsAboutJobs() {
//   console.log(
//     "Starting notification for unsigned repair shops about available jobs"
//   );
//   const now = new Date();

//   try {
//     // Calculate the 30-hour and 48-hour time windows
//     const thirtyHoursAgo = new Date(now.getTime() - 30 * 60 * 60 * 1000);
//     const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

//     // Fetch jobs created in the last 30 hours
//     const contactRepairShopsSnapshot = await admin
//       .firestore()
//       .collection("contactRepairShops")
//       .where("createdAt", ">=", fortyEightHoursAgo)
//       .where("createdAt", "<=", now)
//       .get();

//     console.log(
//       `Found ${contactRepairShopsSnapshot.size} jobs in the time window`
//     );

//     // Fetch unsigned repair shops
//     const unsignedRepairShopsSnapshot = await admin
//       .firestore()
//       .collection("notSignedUpRepairShops")
//       .get();

//     console.log(
//       `Found ${unsignedRepairShopsSnapshot.size} unsigned repair shops`
//     );

//     // Track processing details
//     let emailsSent = 0;
//     let jobsNotified = [];

//     // Process each unsigned repair shop
//     for (const unsignedShopDoc of unsignedRepairShopsSnapshot.docs) {
//       const unsignedShopData = unsignedShopDoc.data();
//       const shopLocation = unsignedShopData.location;
//       const shopEmail = unsignedShopData.email;

//       // Find matching jobs for this shop's location
//       const matchingJobs = contactRepairShopsSnapshot.docs.filter((jobDoc) => {
//         const jobData = jobDoc.data();
//         return jobData.location === shopLocation;
//       });

//       if (matchingJobs.length > 0) {
//         try {
//           // Prepare email content
//           const emailContent = `
//             <h2>Nya jobb tillgängliga i ditt område</h2>
//             <p>Hej,</p>
//             <p>Vi har ${matchingJobs.length} nya jobb tillgängliga i ${shopLocation} som kan vara intressanta för dig.</p>
//             <p>Registrera dig på FixMatch för att se och acceptera dessa jobb!</p>
//             <p>Vänliga hälsningar,<br>FixMatch-teamet</p>
//           `;

//           // Send email
//           await resend.emails.send({
//             from: "noreply@fixmatch.se",
//             to: shopEmail,
//             subject: `${matchingJobs.length} nya jobb i ${shopLocation}`,
//             html: emailContent,
//           });

//           console.log(
//             `Sent notification to ${shopEmail} about ${matchingJobs.length} jobs`
//           );

//           emailsSent++;
//           jobsNotified.push({
//             email: shopEmail,
//             location: shopLocation,
//             jobCount: matchingJobs.length,
//             jobIds: matchingJobs.map((job) => job.id),
//           });
//         } catch (emailError) {
//           console.error(`Error sending email to ${shopEmail}:`, emailError);
//         }
//       }
//     }

//     console.log(
//       `Completed job notification process. Emails sent: ${emailsSent}`
//     );

//     // Optionally, log detailed results
//     if (jobsNotified.length > 0) {
//       console.log(
//         "Detailed Notification Log:",
//         JSON.stringify(jobsNotified, null, 2)
//       );
//     }
//   } catch (error) {
//     console.error("Error in notifyUnsignedRepairShopsAboutJobs:", error);
//   }
// }

cron.schedule("*/19 * * * *", deleteScheduledAccounts);
// cron.schedule("*/1 * * * *", checkValidOffers);
cron.schedule("15 9,15 * * *", checkValidOffers);
cron.schedule("*/13 * * * *", deleteInactiveUnverifiedUsers);
cron.schedule("*/19 * * * *", notifyTrialEndingUsers);
cron.schedule("0 0 * * *", deleteOldDocuments);
// cron.schedule("15 9 1 * *", notifyUnsignedRepairShopsAboutJobs);

module.exports = {
  deleteScheduledAccounts,
  deleteInactiveUnverifiedUsers,
  notifyTrialEndingUsers,
  deleteOldDocuments,
  checkValidOffers,
};
