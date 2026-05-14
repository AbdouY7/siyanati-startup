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
router.post("/vehicles", createVehicle);
router.get("/vehicles", getUserVehicles);
router.get("/clients/:clientId/vehicles", getClientVehicles);
router.get("/vehicles/:id", getVehicleById);
router.patch("/vehicles/:id", updateVehicle);
router.delete("/vehicles/:id", deleteVehicle);

// Admin routes

// Only admins can manage brands and models.
// Create a new brand
router.post("/brands", requireAdmin, createBrand);

// Update a brand by ID
router.patch("/brands/:id", requireAdmin, updateBrand);
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
