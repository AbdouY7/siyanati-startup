/*
Example requests/responses

POST /api/v1/orders
Request:
{
  "store_id": "2eae5f47-6b4d-4f8f-9c64-3d1fdf80db66",
  "items": [{ "part_id": "47f2c5ce-b16d-4db9-bf78-9c72d2418b14", "quantity": 2 }],
  "delivery_type": "home_delivery",
  "delivery_address": "Algiers, Algeria",
  "loyalty_points_used": 0
}
Response:
{ "success": true, "data": { "id": "...", "order_number": "ORD-1718200000000-4823", "items": [] } }

GET /api/v1/orders?page=1&limit=20
Response:
{ "success": true, "data": { "orders": [], "total": 0, "page": 1, "limit": 20, "total_pages": 0 } }

PATCH /api/v1/orders/:id/status
Request:
{ "status": "confirmed" }
Response:
{ "success": true, "data": { "id": "...", "status": "confirmed", "items": [] } }
*/

const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/order.controller");
const {
  createOrderSchema,
  listOrdersSchema,
  orderIdParamsSchema,
  updateOrderStatusSchema,
} = require("../validators/order.validator");

const router = express.Router();

router.use(authMiddleware);

router.post("/", validate(createOrderSchema), createOrder);
router.get("/", validate(listOrdersSchema), getOrders);
router.get("/:id", validate(orderIdParamsSchema), getOrderById);
router.patch("/:id/status", validate(updateOrderStatusSchema), updateOrderStatus);
router.delete("/:id", validate(orderIdParamsSchema), cancelOrder);

module.exports = router;
