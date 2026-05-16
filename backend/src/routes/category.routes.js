const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/admin.middleware");
const upload = require("../middlewares/upload");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const {
  categoryCreateSchema,
  categoryUpdateSchema,
} = require("../validators/category.validator");

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

// All category APIs require a valid access token.
router.use(authMiddleware);

// Read category data.
router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById);

// Only admins can manage categories.
router.post(
  "/categories",
  requireAdmin,
  upload.single("image"),
  validateSchema(categoryCreateSchema),
  createCategory,
);
router.patch(
  "/categories/:id",
  requireAdmin,
  upload.single("image"),
  validateSchema(categoryUpdateSchema),
  updateCategory,
);
router.delete("/categories/:id", requireAdmin, deleteCategory);

module.exports = router;
