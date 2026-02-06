const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const admin = require("firebase-admin");
const serviceAccount =
  process.env.NODE_ENV === "production"
    ? require("./config/serviceAccountProd.json")
    : require("./config/serviceAccountDev.json");

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});
require("./components/scheduledTasks.js");
require("./components/cleanUpInactiveUsers.js");

console.log(
  `🚀 Loaded environment: .env.${process.env.NODE_ENV || "development"}`
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
});

const db = admin.firestore();

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users")(db);
const contactRouter = require("./routes/contact");
const contactRepairShopsRouter = require("./routes/contactRepairShops")(db);
const repairShopRouter = require("./routes/repairShop")(db);
const bookingRouter = require("./routes/booking")(db);
const vehicleRouter = require("./routes/vehicleData");
const paymentsRouter = require("./routes/payments")(db);
const adminRouter = require("./routes/admin")(db);
const stripeRouter = require("./routes/stripe")(db);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use(helmet());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/contact", contactRouter);
app.use("/contactRepairShops", contactRepairShopsRouter);
app.use("/repairShop", repairShopRouter);
app.use("/booking", bookingRouter);
app.use("/vehicle", vehicleRouter);
app.use("/payments", paymentsRouter);
app.use("/admin", adminRouter);
app.use("/stripe", stripeRouter);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
