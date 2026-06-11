const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");
const userController = require("../controllers/user.controller");

const router = express.Router();

// ─── Public Routes (no auth required) ────────────────────────────────────────
router.get("/users", userController.getAllUsers);
router.get("/clients", userController.getClients);
router.get("/shops", userController.getAllStores);
router.get("/professionals", userController.getAllProfessionals);

// Get user by ID – public so guests can view store/professional profiles
router.get("/users/:id", userController.getUser);

// ─── Protected Routes (auth required) ───

// Authenticated user's own profile actions
router.put(
  "/users/me/professional-profile",
  authMiddleware,
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "documents", maxCount: 10 },
    { name: "garageLogo", maxCount: 1 },
    { name: "garageImages", maxCount: 10 },
    { name: "garageDocuments", maxCount: 10 },
  ]),
  userController.updateMyProfessionalProfile,
);
router.delete("/users/me", authMiddleware, userController.deleteMyAccount);

// Update user profile (with optional profile picture upload)
router.put(
  "/users/:id",
  authMiddleware,
  upload.single("profilePicture"),
  userController.updateUserProfile,
);

// Admin routes
router.put(
  "/admin/approve/store-registration/:profileId",
  authMiddleware,
  userController.approveStoreRegistration,
);
router.put(
  "/admin/reject/store-registration/:profileId",
  authMiddleware,
  userController.rejectStoreRegistration,
);
router.put(
  "/admin/approve/professional-registration/:profileId",
  authMiddleware,
  userController.approveProfessionalRegistration,
);
router.put(
  "/admin/reject/professional-registration/:profileId",
  authMiddleware,
  userController.rejectProfessionalRegistration,
);
router.get(
  "/admin/pending-registrations",
  authMiddleware,
  userController.getPendingRegistrations,
);
router.patch(
  "/admin/users/:id/status",
  authMiddleware,
  userController.updateUserStatusAdmin,
);

router.put(
  "/stores/me",
  authMiddleware,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "images", maxCount: 10 },
    { name: "documents", maxCount: 10 },
  ]),
  userController.updateMyStoreProfile,
);

module.exports = router;
