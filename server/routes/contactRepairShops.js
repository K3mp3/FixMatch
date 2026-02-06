const admin = require("firebase-admin");
const { NewRequestsTemplate } = require("../email-templates/NewRequests");
const mjml2html = require("mjml");
const repairShop = require("./repairShop");

module.exports = function (db) {
  const express = require("express");
  const router = express.Router();
  const { v4: uuidv4 } = require("uuid");
  const multer = require("multer");
  const path = require("path");
  const fs = require("fs");
  const { Resend } = require("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./pdfFiles");
    },
    filename: (req, file, cb) => {
      const uuid = uuidv4();
      cb(null, `${uuid}-${file.originalname}`);
    },
  });

  const upload = multer({ storage: fileStorageEngine });

  router.post("/contactRepairShops", async (req, res) => {
    try {
      const requestData = { ...req.body };

      requestData.customerMessage = requestData.customerMessage.map(
        (message) => ({
          ...message,
          id: uuidv4(),
        })
      );

      const docRef = await db.collection("contactRepairShops").add({
        id: uuidv4(),
        customerEmail: requestData.email,
        location: requestData.location,
        registrationNumber: requestData.registrationNumber,
        customerMessage: requestData.customerMessage,
        gearType: requestData.gearType,
        validDate: requestData.validDate,
        repairShopAnswers: [],
        // // vehicleData: {
        // //   fuelType: req.body.fuelType | "",
        // //   transmission: req.body.transmission | "",
        // //   make: req.body.make | "",
        // //   modelDescription: req.body.modelDescription | "",
        // },
      });

      const usersSnapshot = await db
        .collection("users")
        .where("location", "==", req.body.location)
        .get();

      if (!usersSnapshot.empty) {
        for (const doc of usersSnapshot.docs) {
          const data = doc.data();

          try {
            if (data.repairShop === true) {
              console.log("Conditions met, preparing to send email");

              const mjmlTemplate = NewRequestsTemplate.render();
              const { html } = mjml2html(mjmlTemplate);

              await resend.emails.send({
                from: "noreply@fixmatch.se",
                to: data.email,
                subject: "Nytt uppdrag från kund",
                html: html,
              });

              console.log(`Sent offers ready notification to ${data.email}`);
            }
          } catch (error) {
            console.log("Error sending email", error);

            continue;
          }
        }
      }

      res
        .status(201)
        .json({ message: "Request saved successfully", id: docRef.id });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
      console.log("Internal Server Error:", error);
    }
  });

  router.post("/retrieveRequests", async (req, res) => {
    try {
      console.log(req.body.uid);

      const userSnapshot = await db
        .collection("users")
        .where("email", "==", req.body.email)
        .get();

      if (userSnapshot.empty)
        return res.status(404).json({ message: "User not found" });

      const userData = userSnapshot.docs[0].data();
      const userLocation = userData.location;

      const contactSnapshot = await db
        .collection("contactRepairShops")
        .where("location", "==", userLocation)
        .get();

      if (contactSnapshot.empty)
        return res
          .status(404)
          .json({ error: "Contact repair shop documents not found" });

      const uniqueRequests = new Map();
      const currentDate = new Date();

      console.log({ currentDate: currentDate });

      contactSnapshot.forEach((doc) => {
        const contactData = { ...doc.data(), _id: doc.id };
        const validDate = new Date(contactData.validDate);

        console.log({ validDate: validDate });

        if (validDate > currentDate) {
          const key = `${contactData.registrationNumber}-${JSON.stringify(
            contactData.customerMessage
          )}`;

          if (!uniqueRequests.has(key)) uniqueRequests.set(key, contactData);
        }
      });

      const matchingRequests = Array.from(uniqueRequests.values());

      console.log({ matchingRequests: matchingRequests });

      res.status(201).json(matchingRequests);
    } catch (error) {
      console.error("Error retrieving requests:");
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/answerRequest", upload.single("pdfFile"), async (req, res) => {
    const answerData = JSON.parse(req.body.messageData);
    console.log("file:", req.file);
    console.log("answerData:", req.body);

    try {
      if (!answerData.id) {
        console.error("Missing ID in data:", answerData);
        throw new Error("Document ID is required");
      }

      const pdfFileName = req.file ? req.file.filename : null;

      const cleanData = {
        id: answerData.id,
        address: answerData.address,
        type: answerData.type || "Unknown",
        work: answerData.work || "None",
        registrationNumber: answerData.registrationNumber,
        uuid: answerData.uuid,
        customerMessageId: answerData.customerMessageId,
        repairShopName: answerData.repairShopName || "Unknown",
        repairShopEmail: answerData.repairShopEmail,
        repairShopPhoneNumber: answerData.repairShopPhoneNumber || "None",
        priceOffer: Number(answerData.priceOffer || 0),
        typeOfFix: answerData.typeOfFix || "None",
        declined: Boolean(answerData.declined),
        workTime: Number(answerData.workTime || 0),
        ...(pdfFileName && { pdfFileName: pdfFileName }),
        validOfferDate: answerData.validOfferDate,
      };

      const documentId = answerData.id;
      const repairShopRef = db
        .collection("contactRepairShops")
        .where("id", "==", documentId);

      const snapshot = await repairShopRef.get();

      if (!snapshot.empty) {
        const updatePromises = [];
        snapshot.forEach((doc) => {
          const docRef = db.collection("contactRepairShops").doc(doc.id);
          updatePromises.push(
            docRef.update({
              repairShopAnswers:
                admin.firestore.FieldValue.arrayUnion(cleanData),
            })
          );
        });
        await Promise.all(updatePromises);
        res.status(201).send("Document updated successfully");
      } else {
        console.log(`Document not found for id: ${documentId}`);
        res.status(404).send("No document found to update");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error updating Firestore");
    }
  });

  router.get("/getPdf/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(__dirname, "..", "pdfFiles", filename);

      console.log({ filename: filename });
      console.log({ filePath: filePath });

      const fileData = fs.readFileSync(filePath);
      const base64Data = fileData.toString("base64");

      res.status(200).json({
        name: filename,
        data: base64Data,
      });
    } catch (error) {
      console.error("Error fetching PDF:", error);
      res.status(500).send("Error retrieving PDF file");
    }
  });

  router.post("/retrieveUserSentRequests", async (req, res) => {
    try {
      const userSnapshot = await db
        .collection("users")
        .where("email", "==", req.body.email)
        .get();

      if (userSnapshot.empty)
        return res.status(204).json({ message: "User not found" });

      const contactSnapshot = await db
        .collection("contactRepairShops")
        .where("customerEmail", "==", req.body.email)
        .get();

      if (contactSnapshot.empty)
        return res
          .status(204)
          .json({ error: "Contact repair shop documents not found" });

      const matchingRequests = [];

      contactSnapshot.forEach((doc) => {
        const contactData = doc.data();
        if (contactData.customerEmail === req.body.email) {
          matchingRequests.push(contactData);
        }
      });

      res.status(201).json(matchingRequests);
    } catch (error) {
      console.error("Error retrieving requests:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/deleteJob", async (req, res) => {
    try {
      console.log(req.body);

      const jobSnapshot = await db
        .collection("contactRepairShops")
        .where("id", "==", req.body.requestId)
        .get();

      if (jobSnapshot.empty)
        return res.status(404).json({ message: "Job not found" });

      const docRef = jobSnapshot.docs[0].ref;
      const docData = jobSnapshot.docs[0].data();

      if (docData.customerMessage && docData.customerMessage.length === 1) {
        await docRef.delete();
      } else if (
        docData.customerMessage &&
        docData.customerMessage.length > 1
      ) {
        const updatedMessages = docData.customerMessage.filter(
          (msg) => msg.id !== req.body.customerMessageId
        );

        await docRef.update({ customerMessage: updatedMessages });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error processing delete request:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/fetchJobResponse", async (req, res) => {
    try {
      console.log(req.body);
      if (!req.body.id)
        return res.status(400).json({ error: "Missing ID in request" });

      const jobId = req.body.id;
      const matchingAnswers = [];
      const jobSnapshot = await db.collection("contactRepairShops").get();

      // Use for...of instead of forEach to properly handle async operations
      for (const doc of jobSnapshot.docs) {
        const data = doc.data();

        if (
          data.repairShopAnswers &&
          Array.isArray(data.repairShopAnswers) &&
          data.customerMessage &&
          Array.isArray(data.customerMessage)
        ) {
          const filteredAnswers = data.repairShopAnswers.filter(
            (answer) => answer.customerMessageId === jobId
          );

          const filteredRequests = data.customerMessage.filter(
            (request) => request.id === jobId
          );

          if (filteredAnswers.length > 0) {
            // Create an enhanced document with filtered data
            const enhancedDoc = {
              docId: doc.id,
              ...data,
              repairShopAnswers: filteredAnswers,
              customerMessage: filteredRequests,
              repairShops: [], // Will hold matched repair shop users
            };

            // Process each answer to find the matching user
            for (const answer of filteredAnswers) {
              if (answer.uuid) {
                // Query the users collection for this specific UUID
                const userSnapshot = await db
                  .collection("users")
                  .where("uid", "==", answer.uuid)
                  .get();

                if (!userSnapshot.empty) {
                  // Get the first matching user and extract only needed fields
                  const userData = userSnapshot.docs[0].data();

                  // Only include necessary repair shop information
                  enhancedDoc.repairShops.push({
                    answerId: answer.id,
                    address: userData.address,
                    email: userData.address,
                    firstSignIn: userData.firstSignIn,
                    isRentalCar: userData.isRentalCar,
                    lastSignIn: userData.lastSignIn,
                    location: userData.location,
                    name: userData.name,
                    partsWarranty: userData.partsWarranty,
                    paymentOptions: [],
                    phoneNumber: userData.phoneNumber,
                    postalCode: userData.postalCode,
                    repairShop: userData.repairShop,
                    selectedTimes: userData.selectedTimes,
                    uid: userData.uid,
                    whenIsPayment: userData.whenIsPayment,
                    workWarranty: userData.workWarranty,
                    dropOffTime: userData.dropOffTime,
                  });
                }
              }
            }

            matchingAnswers.push(enhancedDoc);
            console.log({ matchingAnswers: matchingAnswers });
          }
        }
      }

      console.log(
        `Found ${matchingAnswers.length} matching repair shop answers for job ID: ${jobId}`
      );

      res.status(200).json({
        success: true,
        data: matchingAnswers,
      });
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  return router;
};
