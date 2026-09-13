const express = require("express");
const authController = require("../controllers/auth.controller");
const upload = require("../middlewares/upload");
const {
  loginSchema,
  registerSchema,
} = require("../validators/auth.validator");

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

router.post("/login", validateSchema(loginSchema), authController.login);
router.post("/google", authController.googleAuth);
router.post(
  "/register",
  validateSchema(registerSchema),
  authController.register,
);

// Store registration (multipart — Zod validation done inside controller)
router.post(
  "/register-store",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "documents", maxCount: 10 },
    { name: "logo", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "logo_url", maxCount: 1 },
  ]),
  authController.registerStore,
);

// Professional registration (multipart — includes optional store files)
router.post(
  "/register-professional",
  upload.fields([
    { name: "shop_images", maxCount: 10 },
    { name: "images", maxCount: 10 },
    { name: "documents", maxCount: 10 },
    { name: "store_documents", maxCount: 10 },
    { name: "store_images", maxCount: 10 },
  ]),
  authController.registerProfessional,
);

const authMiddleware = require("../middlewares/auth.middleware");

router.post("/register-admin", authController.registerAdmin);

router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

// Verification routes
router.post("/send-email-verification", authMiddleware, authController.sendEmailVerification);
router.post("/verify-email", authMiddleware, authController.verifyEmail);
router.post("/verify-registration-email", authController.verifyRegistrationEmail);
router.post("/resend-registration-otp", authController.resendRegistrationOtp);
router.post("/send-phone-verification", authMiddleware, authController.sendPhoneVerification);
router.post("/verify-phone", authMiddleware, authController.verifyPhone);

module.exports = router;
