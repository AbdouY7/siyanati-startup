const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getUserPaymentAccounts,
  createPaymentAccount,
  updatePaymentAccount,
  deletePaymentAccount,
} = require("../controllers/paymentAccount.controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getUserPaymentAccounts);
router.post("/", createPaymentAccount);
router.patch("/:id", updatePaymentAccount);
router.delete("/:id", deletePaymentAccount);

module.exports = router;
