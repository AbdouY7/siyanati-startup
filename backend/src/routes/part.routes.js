const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/admin.middleware");
const {
  createPart,
  getAllParts,
  getMyParts,
  getPartById,
  updatePart,
  verifyPart,
  deletePart,
} = require("../controllers/part.controller");
const {
  partCreateSchema,
  partUpdateSchema,
  partVerifySchema,
} = require("../validators/part.validator");

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

// All part APIs require a valid access token.
router.use(authMiddleware);

// Create and read part listings.
router.post("/parts", validateSchema(partCreateSchema), createPart);
router.get("/parts", getAllParts);
router.get("/parts/my", getMyParts);
router.get("/parts/:id", getPartById);

// Update and delete part listings.
router.patch("/parts/:id", validateSchema(partUpdateSchema), updatePart);
router.delete("/parts/:id", deletePart);

// Admin verifies or unverifies client part listings.
router.patch(
  "/parts/:id/verify",
  requireAdmin,
  validateSchema(partVerifySchema),
  verifyPart,
);

module.exports = router;
