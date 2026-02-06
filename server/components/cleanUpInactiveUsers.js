const cron = require("node-cron");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
require("dotenv").config();

async function cleanUpInactiveUsers() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  console.log(
    `Starting cleanup of users inactive since ${oneYearAgo.toISOString()}`
  );

  try {
    const usersSnapshot = await admin
      .firestore()
      .collection("users")
      .where("lastSignIn", "<=", oneYearAgo)
      .get();

    console.log(`Found ${usersSnapshot.size} inactive users to process`);

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userEmail = userData.email;
      const uid = userData.uid;
      const isRepairShop = userData.repairShop === true;
      const sessionId = userData.sessionId;

      console.log(
        `Processing inactive user: ${userEmail}, isRepairShop: ${isRepairShop}`
      );

      try {
        if (isRepairShop && sessionId) {
          try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            if (session.subscription) {
              await stripe.subscriptions.cancel(session.subscription);
              console.log(
                `Cancelled subscription for repair shop ${userEmail}`
              );
            }

            if (session.customer) {
              await stripe.customers.del(session.customer);
              console.log(
                `Deleted Stripe customer for repair shop ${userEmail}`
              );
            }
          } catch (stripeError) {
            try {
              const customers = await stripe.customers.list({
                email: userEmail,
                limit: 1,
              });

              if (customers.data.length > 0) {
                const customer = customers.data[0];
                if (customer.subscriptions?.data[0]) {
                  await stripe.subscriptions.cancel(
                    customer.subscriptions.data[0].id
                  );
                  console.log(
                    `Cancelled subscription for ${userEmail} via customer lookup`
                  );
                }
                await stripe.customers.del(customer.id);
                console.log(
                  `Deleted Stripe customer for ${userEmail} via customer lookup`
                );
              }
            } catch (fallbackError) {
              console.error(
                `Failed to cleanup Stripe data for ${userEmail}:`,
                fallbackError
              );
            }
          }
        }

        await admin.auth().deleteUser(uid);
        console.log(`Deleted user ${userEmail} from Firebase Auth`);

        if (isRepairShop) {
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

          for (const bookingDoc of bookingsSnapshot.docs) {
            await bookingDoc.ref.delete();
            console.log(`Cleared booking ${bookingDoc.id}`);
          }

          const suggestedDatesSnapshot = await admin
            .firestore()
            .collection("bookings")
            .where("suggestedDates.uid", "==", uid)
            .get();

          for (const bookingDoc of suggestedDatesSnapshot.docs) {
            await bookingDoc.ref.delete();
            console.log(`Cleared booking with suggestedDates ${bookingDoc.id}`);
          }
        }

        await doc.ref.delete();
        console.log(`Deleted user document for ${userEmail}`);

        try {
          const emailContent = `
            <h2>Ditt konto har tagits bort på grund av inaktivitet</h2>
            <p>Hej,</p>
            <p>Ditt konto på FixMatch har tagits bort eftersom du inte loggat in under det senaste året.</p>
            <p>Om du vill använda våra tjänster igen är du välkommen att registrera ett nytt konto.</p>
            <p>Vänliga hälsningar,<br>FixMatch</p>
          `;

          await resend.emails.send({
            from: "noreply@fixmatch.se",
            to: userEmail,
            subject: "Ditt konto har tagits bort på grund av inaktivitet",
            html: emailContent,
          });

          console.log(`Sent account removal notification to ${userEmail}`);
        } catch (emailError) {
          console.error(`Error sending email to ${userEmail}:`, emailError);
        }
      } catch (error) {
        console.error(
          `Error processing deletion for user ${userEmail}:`,
          error
        );
        continue;
      }
    }

    console.log(`Completed cleaning up inactive users`);
  } catch (error) {
    console.error("Error in cleanUpInactiveUsers:", error);
  }
}

cron.schedule("0 0 1 * *", cleanUpInactiveUsers);

module.exports = {
  cleanUpInactiveUsers,
};
