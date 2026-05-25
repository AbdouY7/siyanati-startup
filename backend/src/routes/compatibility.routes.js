const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createCompatibility,
  getAllCompatibilities,
  getCompatibilityById,
  updateCompatibility,
  deleteCompatibility,
} = require("../controllers/compatibility.controller");
const {
  compatibilityCreateSchema,
  compatibilityUpdateSchema,
} = require("../validators/compatibility.validator");

const router = express.Router();

const validateSchema = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  next();
};

// Public: Read compatibility data
router.get("/compatibilities", getAllCompatibilities);
router.get("/compatibilities/:id", getCompatibilityById);

// Create compatibility rows.
router.post(
  "/compatibilities",
  authMiddleware,
  validateSchema(compatibilityCreateSchema),
  createCompatibility,
);

// Update and delete compatibility rows.
router.patch(
  "/compatibilities/:id",
  authMiddleware,
  validateSchema(compatibilityUpdateSchema),
  updateCompatibility,
);
router.delete("/compatibilities/:id", authMiddleware, deleteCompatibility);

module.exports = router;
