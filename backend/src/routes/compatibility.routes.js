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

// All compatibility APIs require a valid access token.
router.use(authMiddleware);

// Create and read compatibility rows.
router.post(
  "/compatibilities",
  validateSchema(compatibilityCreateSchema),
  createCompatibility,
);
router.get("/compatibilities", getAllCompatibilities);
router.get("/compatibilities/:id", getCompatibilityById);

// Update and delete compatibility rows.
router.patch(
  "/compatibilities/:id",
  validateSchema(compatibilityUpdateSchema),
  updateCompatibility,
);
router.delete("/compatibilities/:id", deleteCompatibility);

module.exports = router;
