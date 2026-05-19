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

// Protect routes with auth middleware
router.use(authMiddleware);

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

// Vehicle routes
// ✅ FIXED: Added "image" field for vehicle picture upload
router.post(
  "/vehicles",
  upload.fields([
    { name: "registration_document", maxCount: 1 },
    { name: "registration_document_url", maxCount: 1 },
    { name: "document", maxCount: 1 },
    { name: "image", maxCount: 1 },        // ✅ ADD THIS
  ]),
  createVehicle,
);
router.get("/vehicles", getUserVehicles);
router.get("/clients/:clientId/vehicles", getClientVehicles);
router.get("/vehicles/:id", getVehicleById);
router.patch(
  "/vehicles/:id",
  // ✅ FIXED: Added "image" field for vehicle picture upload
  upload.fields([
    { name: "registration_document", maxCount: 1 },
    { name: "registration_document_url", maxCount: 1 },
    { name: "document", maxCount: 1 },
    { name: "image", maxCount: 1 },        // ✅ ADD THIS
  ]),
  updateVehicle,
);
router.delete("/vehicles/:id", deleteVehicle);

// Admin routes

// Only admins can manage brands and models.
// Create a new brand
router.post("/brands", requireAdmin, upload.single("image"), createBrand);

// Update a brand by ID
router.patch("/brands/:id", requireAdmin, upload.single("image"), updateBrand);
// Soft delete a brand by ID
router.delete("/brands/:id", requireAdmin, deleteBrand);

//------- routes models ───────────────────────────────────────────────

// Create model
router.post("/models", requireAdmin, createModel);

// Update model
router.patch("/models/:id", requireAdmin, updateModel);

// Delete model
router.delete("/models/:id", requireAdmin, deleteModel);

module.exports = router;