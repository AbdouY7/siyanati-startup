require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // increased for development (100 was too restrictive)
});

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175"
    ],
    credentials: true,
  }),
);
app.use(limiter);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Express server is running" });
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api", require("./routes/user.routes"));
app.use("/api", require("./routes/vehicule.routes"));
app.use("/api", require("./routes/category.routes"));
app.use("/api", require("./routes/part.routes"));
app.use("/api", require("./routes/compatibility.routes"));
app.use("/api/v1/orders", require("./routes/order.routes"));
app.use("/api/v1/payments", require("./routes/payment.routes"));
app.use("/api/professionals", require("./routes/schedule.routes"));
app.use("/api/appointments", require("./routes/appointment.routes"));
app.use("/api/reviews", require("./routes/review.routes"));
app.use("/api/reports", require("./routes/report.routes"));
app.use("/api", require("./routes/notification.routes"));
app.use("/api/diagnostic", require("./routes/diagnostic.routes"));
app.use(
  "/api/diagnostic/:postId/comments",
  require("./routes/diagnosticComment.routes"),
);
app.use("/api", require("./routes/subscriptionPlan.routes"));
app.use("/api", require("./routes/subscription.routes"));

app.use("/api/statistics", require("./routes/statistics.routes"));

app.use("/api/payment-accounts", require("./routes/paymentAccount.routes"));
app.use("/api/professional-stores", require("./routes/professionalStore.routes"));

app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/favorites", require("./routes/favorite.routes"));

// error handler
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);
  console.error("Stack:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    // Don't send stack in production
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
