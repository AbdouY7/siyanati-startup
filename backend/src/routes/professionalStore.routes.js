const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");
const controller = require("../controllers/professionalStore.controller");

const router = express.Router();

// Public route — get store by professional profile ID
router.get("/:professionalId", controller.getStoreByProfessionalId);

// Protected routes
router.use(authMiddleware);

router.get("/me/store", controller.getMyStore);

router.patch(
  "/me/store",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "documents", maxCount: 10 },
    { name: "logo", maxCount: 1 },
  ]),
  controller.updateMyStore,
);

router.delete("/me/store", controller.deleteMyStore);

module.exports = router;
