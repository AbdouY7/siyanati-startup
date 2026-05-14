const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/admin.middleware");
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
} = require("../controllers/brand.controller");

const {
  createVehicle,
  getUserVehicles,
  getVehicleById,
  updateVehicle,
  // deleteVehicle,
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

// Admin routes

router.use(requireAdmin); // ← only admins can manage brands
// Create a new brand
router.post("/brands", createBrand);

// Update a brand by ID
router.patch("/brands/:id", updateBrand);
// Soft delete a brand by ID
router.delete("/brands/:id", deleteBrand);

//------- routes models ───────────────────────────────────────────────

// Create model
router.post("/models", createModel);

// Update model
router.patch("/models/:id", updateModel);

module.exports = router;
