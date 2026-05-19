const bcrypt = require("bcrypt");
const prisma = require("../prisma/client");
const uploadImage = require("../utils/uploadImage");

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        is_active: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
      },
    });
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        is_active: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
        client_profile: true,
        store_profile: true,
        professional_profile: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

// Get all clients (users with role 'customer')
const getClients = async (req, res, next) => {
  try {
    const clients = await prisma.user.findMany({
      where: { role: "customer" },
      select: {
        id: true,
        email: true,
        role: true,
        is_active: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
        client_profile: true,
      },
    });
    res.status(200).json({ clients });
  } catch (error) {
    next(error);
  }
};

// Get all shops (users with role 'store')
const getAllStores = async (req, res, next) => {
  try {
    const stores = await prisma.user.findMany({
      where: { role: "store" },
      select: {
        id: true,
        email: true,
        role: true,
        is_active: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
        store_profile: true,
      },
    });
    res.status(200).json({ stores });
  } catch (error) {
    next(error);
  }
};

// Get all professionals
const getAllProfessionals = async (req, res, next) => {
  try {
    const professionals = await prisma.user.findMany({
      where: { role: "professional" },
      select: {
        id: true,
        email: true,
        role: true,
        is_active: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
        professional_profile: true,
      },
    });
    res.status(200).json({ professionals });
  } catch (error) {
    next(error);
  }
};

// Admin approve store registration
const approveStoreRegistration = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const adminId = req.user.id;

    // Check if admin
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can approve registrations" });
    }

    // Find and update store profile
    const storeProfile = await prisma.storeProfile.findUnique({
      where: { id: profileId },
    });
    if (!storeProfile) {
      return res.status(404).json({ message: "Store profile not found" });
    }

    if (storeProfile.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Profile is not pending approval" });
    }

    // Update profile and user role
    await prisma.storeProfile.update({
      where: { id: profileId },
      data: {
        status: "approved",
        reviewed_by_admin_id: adminId,
        reviewed_at: new Date(),
      },
    });

    await prisma.user.update({
      where: { id: storeProfile.user_id },
      data: { role: "store" },
    });

    res.status(200).json({ message: "Store upgrade approved successfully" });
  } catch (error) {
    next(error);
  }
};

// Admin reject store registration
const rejectStoreRegistration = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { rejection_reason } = req.body;
    const adminId = req.user.id;

    // Check if admin
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can reject registrations" });
    }

    // Find and update store profile
    const storeProfile = await prisma.storeProfile.findUnique({
      where: { id: profileId },
    });
    if (!storeProfile) {
      return res.status(404).json({ message: "Store profile not found" });
    }

    if (storeProfile.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Profile is not pending approval" });
    }

    // Update profile
    await prisma.storeProfile.update({
      where: { id: profileId },
      data: {
        status: "rejected",
        rejection_reason,
        reviewed_by_admin_id: adminId,
        reviewed_at: new Date(),
      },
    });

    res.status(200).json({ message: "Store registration rejected" });
  } catch (error) {
    next(error);
  }
};

// Admin approve professional registration
const approveProfessionalRegistration = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const adminId = req.user.id;

    // Check if admin
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can approve registrations" });
    }

    // Find and update professional profile
    const professionalProfile = await prisma.professionalProfile.findUnique({
      where: { id: profileId },
    });
    if (!professionalProfile) {
      return res
        .status(404)
        .json({ message: "Professional profile not found" });
    }

    if (professionalProfile.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Profile is not pending approval" });
    }

    // Update profile and user role
    await prisma.professionalProfile.update({
      where: { id: profileId },
      data: {
        status: "approved",
        reviewed_by_admin_id: adminId,
        reviewed_at: new Date(),
      },
    });

    await prisma.user.update({
      where: { id: professionalProfile.user_id },
      data: { role: "professional" },
    });

    res
      .status(200)
      .json({ message: "Professional registration approved successfully" });
  } catch (error) {
    next(error);
  }
};

// Admin reject professional registration
const rejectProfessionalRegistration = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { rejection_reason } = req.body;
    const adminId = req.user.id;

    // Check if admin
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can reject registrations" });
    }

    // Find and update professional profile
    const professionalProfile = await prisma.professionalProfile.findUnique({
      where: { id: profileId },
    });
    if (!professionalProfile) {
      return res
        .status(404)
        .json({ message: "Professional profile not found" });
    }

    if (professionalProfile.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Profile is not pending approval" });
    }

    // Update profile
    await prisma.professionalProfile.update({
      where: { id: profileId },
      data: {
        status: "rejected",
        rejection_reason,
        reviewed_by_admin_id: adminId,
        reviewed_at: new Date(),
      },
    });

    res.status(200).json({ message: "Professional registration rejected" });
  } catch (error) {
    next(error);
  }
};

// Get pending registration requests (admin only)
const getPendingRegistrations = async (req, res, next) => {
  try {
    const adminId = req.user.id;

    // Check if admin
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can view pending registrations" });
    }

    const pendingStores = await prisma.storeProfile.findMany({
      where: { status: "pending" },
      include: { user: { select: { id: true, email: true } } },
    });

    const pendingProfessionals = await prisma.professionalProfile.findMany({
      where: { status: "pending" },
      include: { user: { select: { id: true, email: true } } },
    });

    res.status(200).json({
      pendingStores,
      pendingProfessionals,
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile (for the authenticated user)
const updateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Only allow the user to update their own profile or admin
    if (req.user.id !== id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { client_profile: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { full_name, wilaya, address, date_of_birth, phone, preferred_language } = req.body;

    // Handle profile picture upload
    let profilePicUrl;
    if (req.file) {
      const result = await uploadImage(req.file.buffer, "profile-pictures");
      profilePicUrl = result.secure_url;
    }

    // Update user fields (phone)
    const userUpdateData = {};
    if (phone !== undefined) userUpdateData.phone = phone;

    // Update client profile fields
    const profileUpdateData = {};
    if (full_name !== undefined) profileUpdateData.full_name = full_name;
    if (wilaya !== undefined) profileUpdateData.wilaya = wilaya;
    if (address !== undefined) profileUpdateData.address = address;
    if (preferred_language !== undefined) profileUpdateData.preferred_language = preferred_language;
    if (profilePicUrl) profileUpdateData.profilePicUrl = profilePicUrl;
    if (date_of_birth !== undefined) {
      profileUpdateData.date_of_birth = date_of_birth ? new Date(date_of_birth) : null;
    }

    // Run updates in transaction
    await prisma.$transaction(async (tx) => {
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id },
          data: userUpdateData,
        });
      }

      if (user.client_profile && Object.keys(profileUpdateData).length > 0) {
        await tx.clientProfile.update({
          where: { user_id: id },
          data: profileUpdateData,
        });
      }
    });

    // Fetch updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        phone: true,
        is_active: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
        client_profile: true,
        store_profile: true,
        professional_profile: true,
      },
    });

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Phone number already in use" });
    }
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUser,
  getClients,
  getAllStores,
  getAllProfessionals,
  approveStoreRegistration,
  rejectStoreRegistration,
  approveProfessionalRegistration,
  rejectProfessionalRegistration,
  getPendingRegistrations,
  updateUserProfile,
};
