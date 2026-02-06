module.exports = function (db) {
  const express = require("express");
  const router = express.Router();
  const multer = require("multer");
  const path = require("path");
  const fs = require("fs");

  const uploadDir = path.join(__dirname, "..", "public", "images");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName = `${req.body.articleId}-${fileExt}`;
      cb(null, fileName);
    },
  });

  const upload = multer({ storage });

  router.get("/getRepairShops", async (req, res) => {
    try {
      const repairShopsSnapshot = await db.collection("repairShops").get();

      if (repairShopsSnapshot.empty) return res.status(404).json([]);

      const repairShops = repairShopsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json(repairShops);
    } catch (error) {
      console.error("Error fetching repair shops");
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/deleteRepairShop", async (req, res) => {
    try {
      const repairShopSnapshot = await db
        .collection("repairShops")
        .where("email", "==", req.body.email)
        .get();

      if (repairShopSnapshot.empty)
        return res.status(404).json({ error: "Repair shop not found" });

      const repairShopDoc = repairShopSnapshot.docs[0];
      await repairShopDoc.ref.delete();

      res.status(200).json({ message: "Repair shop deleted successfully" });
    } catch (error) {
      console.error("Error fetching repair shops");
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/saveRepairShop", async (req, res) => {
    console.log(req.body.email);

    try {
      await db.collection("repairShops").add({
        email: req.body.email,
        name: req.body.name,
        location: req.body.location,
      });

      res.status(201).json({ message: "Repair shop saved successfully" });
    } catch (error) {
      console.error("Error saving repair shop");
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/upload-image", upload.single("file"), (req, res) => {
    const articleId = req.body.articleId;

    res.json({
      location: `/uploads/images/${req.file.filename}`,
      articleId: articleId,
    });
  });

  router.post("/saveContent", upload.single("image"), async (req, res) => {
    console.log("Request body:", req.body);
    console.log("File:", req.file);

    try {
      const { content, articleId } = req.body;

      if (!articleId)
        return res.status(400).json({ error: "Article ID is required" });

      let imageUrl = null;

      if (req.file) imageUrl = `/images/${req.file.filename}`;

      await db.collection("news").add({
        content,
        articleId,
        imageUrl,
        createdAt: new Date(),
      });

      res.status(201).json({
        success: true,
        message: "Article saved successfully",
      });
    } catch (error) {
      console.error("Error saving article:", error);
      res.status(500).json({ error: "Failed to save article" });
    }
  });

  router.get("/fetchContent", async (req, res) => {
    try {
      const contentSnapshot = await db.collection("news").get();

      if (contentSnapshot.empty) return res.status(404).json([]);

      const articles = contentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json(articles);
    } catch (error) {
      console.error("Error saving article:", error);
      res.status(500).json({ error: "Failed to find articles" });
    }
  });

  return router;
};
