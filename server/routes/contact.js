const express = require("express");
const router = express.Router();
const { Resend } = require("resend");
const mjml2html = require("mjml");
require("dotenv").config();
const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/contactUs", (req, res) => {
  async function sendEmail() {
    try {
      const info = await resend.emails.send({
        from: "noreply@fixmatch.se",
        to: "info@fixmatch.se",
        subject: "Kontakt från kund via FixMatch",
        text: `Meddelande från ${req.body.userName}: ${req.body.userMessage}`,
        html: `<p>Meddelande från ${req.body.userName}, ${req.body.userEmail}:</p><p>${req.body.userMessage}</p>`,
      });

      console.log("Email sent successfully:", info);
      res.status(201).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res
        .status(500)
        .json({ message: "Error sending email", error: error.message });
    }
  }

  sendEmail();
});

module.exports = router;
