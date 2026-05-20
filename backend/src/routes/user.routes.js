const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");
const userController = require("../controllers/user.controller");

const router = express.Router();

// Protect routes with auth middleware
router.use(authMiddleware);

// Get all users
router.get("/users", userController.getAllUsers);

// Get user by ID
router.get("/users/:id", userController.getUser);

// Update user profile (with optional profile picture upload)
router.put("/users/:id", upload.single("profilePicture"), userController.updateUserProfile);

// Get all clients
router.get("/clients", userController.getClients);

// Get all shops
router.get("/shops", userController.getAllStores);

// Get all professionals
router.get("/professionals", userController.getAllProfessionals);

// Admin routes
router.put(
  "/admin/approve/store-registration/:profileId",
  userController.approveStoreRegistration,
);
router.put(
  "/admin/reject/store-registration/:profileId",
  userController.rejectStoreRegistration,
);
router.put(
  "/admin/approve/professional-registration/:profileId",
  userController.approveProfessionalRegistration,
);
router.put(
  "/admin/reject/professional-registration/:profileId",
  userController.rejectProfessionalRegistration,
);
router.get(
  "/admin/pending-registrations",
  userController.getPendingRegistrations,
);
router.patch(
  "/admin/users/:id/status",
  userController.updateUserStatusAdmin,
);

module.exports = router;
