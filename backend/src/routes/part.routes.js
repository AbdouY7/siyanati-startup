const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { optionalAuth } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/admin.middleware");
const upload = require("../middlewares/upload");
const {
  createPart,
  createBulkParts,
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
  partBulkCreateSchema,
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

// Public part reading routes
router.get("/parts", optionalAuth, getAllParts);
router.get("/parts/my", authMiddleware, getMyParts);
router.get("/parts/:id", optionalAuth, getPartById);

// Create part listings.
router.post(
  "/parts",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  validateSchema(partCreateSchema),
  createPart,
);

router.post(
  "/parts/bulk",
  authMiddleware,
  validateSchema(partBulkCreateSchema),
  createBulkParts,
);


// Update and delete part listings.
router.patch(
  "/parts/:id",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  validateSchema(partUpdateSchema),
  updatePart,
);
router.delete("/parts/:id", authMiddleware, deletePart);

// Admin verifies or unverifies client part listings.
router.patch(
  "/parts/:id/verify",
  authMiddleware,
  requireAdmin,
  validateSchema(partVerifySchema),
  verifyPart,
);

module.exports = router;
