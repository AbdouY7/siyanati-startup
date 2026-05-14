require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const app = express();

app.use(helmet());
app.use(cors());
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
module.exports = app;
