const express = require("express");
const authController = require("../controllers/auth.controller");
const upload = require("../middlewares/upload");
const {
  loginSchema,
  registerSchema,
  storeRegisterSchema,
  professionalRegisterSchema,
} = require("../validators/auth.validator");
const bcrypt = require("bcrypt");

const router = express.Router();

const validateSchema = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.flatten().fieldErrors, // ← shows exactly which fields failed
    });
  }
  req.body = result.data;
  next();
};

router.post("/login", validateSchema(loginSchema), authController.login);
router.post(
  "/register",
  validateSchema(registerSchema),
  authController.register,
);
router.post(
  "/register/store",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "logo", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "logo_url", maxCount: 1 },
  ]),
  validateSchema(storeRegisterSchema),
  authController.registerStore,
);
router.post(
  "/register/professional",
  upload.fields([
    { name: "shop_images", maxCount: 10 },
    { name: "images", maxCount: 10 },
  ]),
  validateSchema(professionalRegisterSchema),
  authController.registerProfessional,
);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);
// router.get("/profile/me", authController.getProfile);

module.exports = router;
