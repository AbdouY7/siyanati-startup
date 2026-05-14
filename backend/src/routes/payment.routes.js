/*
Example requests/responses

POST /api/v1/payments/initiate
Request:
{ "order_id": "b317b2da-cbb8-4d3f-a470-913c1b5e4f55", "method": "edahabia" }
Response:
{
  "success": true,
  "data": {
    "payment": { "id": "...", "status": "pending", "method": "edahabia" },
    "checkout_url": "https://edahabia.mock/pay?ref=EDAH-1718200000000-123456"
  }
}

POST /api/v1/payments/webhook
Request:
{ "edahabia_ref": "EDAH-1718200000000-123456", "status": "success" }
Response:
{ "success": true, "data": { "received": true } }

GET /api/v1/payments/:order_id
Response:
{ "success": true, "data": { "id": "...", "order_id": "...", "status": "success" } }
*/

const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  initiatePayment,
  handleEdahabiaWebhook,
  getPaymentByOrder,
} = require("../controllers/payment.controller");
const {
  initiatePaymentSchema,
  edahabiaWebhookSchema,
  paymentByOrderParamsSchema,
} = require("../validators/payment.validator");

const router = express.Router();

router.post(
  "/webhook",
  validate(edahabiaWebhookSchema),
  handleEdahabiaWebhook,
);

router.use(authMiddleware);

router.post("/initiate", validate(initiatePaymentSchema), initiatePayment);
router.get("/:order_id", validate(paymentByOrderParamsSchema), getPaymentByOrder);

module.exports = router;
