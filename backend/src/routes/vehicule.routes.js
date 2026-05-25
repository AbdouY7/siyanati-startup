const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/admin.middleware");
const upload = require("../middlewares/upload");
const {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  createModel,
  getAllModels,
  getModelById,
  getModelsByBrand,
  updateModel,
  deleteModel,
} = require("../controllers/brand.controller");

const {
  createVehicle,
  getUserVehicles,
  getClientVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicule.controller");

const router = express.Router();

// Public routes for brands and models
// Get all brands with optional filters
router.get("/brands", getAllBrands);
// Get a brand by ID
router.get("/brands/:id", getBrandById);

// Get all models (optional filters)
router.get("/models", getAllModels);

// Get model by ID
router.get("/models/:id", getModelById);

// Get models by brand
router.get("/brands/:brandId/models", getModelsByBrand);

// ─── Protected Vehicle routes ───
// ✅ FIXED: Added "image" field for vehicle picture upload
router.post(
  "/vehicles",
  authMiddleware,
  upload.fields([
    { name: "registration_document", maxCount: 1 },
    { name: "registration_document_url", maxCount: 1 },
    { name: "document", maxCount: 1 },
    { name: "image", maxCount: 1 },        // ✅ ADD THIS
  ]),
  createVehicle,
);
router.get("/vehicles", authMiddleware, getUserVehicles);
router.get("/clients/:clientId/vehicles", authMiddleware, getClientVehicles);
router.get("/vehicles/:id", authMiddleware, getVehicleById);
router.patch(
  "/vehicles/:id",
  authMiddleware,
  // ✅ FIXED: Added "image" field for vehicle picture upload
  upload.fields([
    { name: "registration_document", maxCount: 1 },
    { name: "registration_document_url", maxCount: 1 },
    { name: "document", maxCount: 1 },
    { name: "image", maxCount: 1 },        // ✅ ADD THIS
  ]),
  updateVehicle,
);
router.delete("/vehicles/:id", authMiddleware, deleteVehicle);

// Admin routes

// Only admins can manage brands and models.
// Create a new brand
router.post("/brands", authMiddleware, requireAdmin, upload.single("image"), createBrand);

// Update a brand by ID
router.patch("/brands/:id", authMiddleware, requireAdmin, upload.single("image"), updateBrand);
// Soft delete a brand by ID
router.delete("/brands/:id", authMiddleware, requireAdmin, deleteBrand);

//------- routes models ───────────────────────────────────────────────

// Create model
router.post("/models", authMiddleware, requireAdmin, createModel);

// Update model
router.patch("/models/:id", authMiddleware, requireAdmin, updateModel);

// Delete model
router.delete("/models/:id", authMiddleware, requireAdmin, deleteModel);

module.exports = router;