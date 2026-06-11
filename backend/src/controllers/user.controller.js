// Trigger nodemon restart
const bcrypt = require("bcrypt");
const prisma = require("../prisma/client");
const uploadImage = require("../utils/uploadImage");

const getFiles = (req, fieldName) => {
  if (!req.files) return [];
  if (Array.isArray(req.files)) {
    return req.files.filter((file) => file.fieldname === fieldName);
  }

  return req.files[fieldName] || [];
};

const uploadFiles = async (files, folder) => {
  const results = await Promise.all(
    files.map((file) => uploadImage(file.buffer, folder)),
  );

  return results.map((result) => result.secure_url);
};

const notifyAdminsAboutDocumentUpdate = async (tx, { actorName, actorRole, userId, count }) => {
  const admins = await tx.user.findMany({
    where: { role: "admin", is_active: true },
    select: { id: true },
  });

  if (admins.length === 0) return;

  await tx.notification.createMany({
    data: admins.map((admin) => ({
      user_id: admin.id,
      type: "new_message",
      title: "Documents de profil mis a jour",
      message: `${actorName || actorRole} a ajoute ${count} document(s) a son profil. Veuillez les verifier depuis le tableau de bord admin.`,
      reference_id: userId,
    })),
  });
};

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        phone: true,
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
        phone: true,
        role: true,
        is_active: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
        client_profile: true,
        store_profile: true,
        professional_profile: {
          include: { ProfessionalStore: true },
        },
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
        phone: true,
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
      where: { 
        role: "store",
        store_profile: {
          is_frozen: false
        }
      },
      select: {
        id: true,
        email: true,
        phone: true,
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
      where: { 
        role: "professional",
        professional_profile: {
          is_frozen: false
        }
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
        professional_profile: {
          include: { ProfessionalStore: true },
        },
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
    await prisma.$transaction(async (tx) => {
      await tx.professionalProfile.update({
        where: { id: profileId },
        data: {
          status: "approved",
          reviewed_by_admin_id: adminId,
          reviewed_at: new Date(),
        },
      });

      // Also approve the ProfessionalStore if it exists
      await tx.professionalStore.updateMany({
        where: { professional_id: profileId },
        data: { status: "approved" },
      });

      await tx.user.update({
        where: { id: professionalProfile.user_id },
        data: { role: "professional" },
      });
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
      include: {
        user: { select: { id: true, email: true } },
        ProfessionalStore: true,
      },
    });

    res.status(200).json({
      pendingStores,
      pendingProfessionals,
    });
  } catch (error) {
    next(error);
  }
};

// Admin block or unblock a user account.
const updateUserStatusAdmin = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const { is_active } = req.body;

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can update user status" });
    }

    if (typeof is_active !== "boolean") {
      return res.status(400).json({ message: "is_active must be a boolean" });
    }

    if (id === adminId && !is_active) {
      return res
        .status(400)
        .json({ message: "Admins cannot block their own account" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { is_active },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
        client_profile: true,
        store_profile: true,
        professional_profile: {
          include: { ProfessionalStore: true },
        },
      },
    });

    res.status(200).json({ user });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    next(error);
  }
};

const selectSafeUser = {
  id: true,
  email: true,
  phone: true,
  role: true,
  is_active: true,
  email_verified: true,
  created_at: true,
  updated_at: true,
  client_profile: true,
  store_profile: true,
  professional_profile: {
    include: { ProfessionalStore: true },
  },
};

// Update professional profile for the authenticated professional.
const updateMyProfessionalProfile = async (req, res, next) => {
  try {
    if (req.user.role !== "professional") {
      return res
        .status(403)
        .json({ message: "Only professionals can update this profile" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        professional_profile: {
          include: { ProfessionalStore: true },
        },
      },
    });

    if (!user?.professional_profile) {
      return res
        .status(404)
        .json({ message: "Professional profile not found" });
    }

    const {
      phone,
      full_name,
      specialty_type,
      experience_years,
      wilaya,
      location_address,
      bio,
      hourly_rate_dzd,
      work_type,
      is_available,
      garage_name,
      garage_wilaya,
      garage_address,
      garage_logo_url,
      garage_images,
      dahabia_rip,
    } = req.body;

    const userUpdateData = {};
    if (phone !== undefined) userUpdateData.phone = phone;

    const profileUpdateData = {};
    if (full_name !== undefined) profileUpdateData.full_name = full_name;

    // Handle profile picture upload
    if (req.files && req.files.profilePicture) {
      const result = await uploadImage(
        req.files.profilePicture[0].buffer,
        "profile-pictures",
      );
      profileUpdateData.avatar_url = result.secure_url;
    }
    if (specialty_type !== undefined)
      profileUpdateData.specialty_type = specialty_type;
    if (experience_years !== undefined) {
      profileUpdateData.experience_years =
        experience_years === "" || experience_years === null
          ? null
          : Number(experience_years);
    }
    if (wilaya !== undefined) profileUpdateData.wilaya = wilaya;
    if (location_address !== undefined)
      profileUpdateData.location_address = location_address;
    if (bio !== undefined) profileUpdateData.bio = bio;
    if (hourly_rate_dzd !== undefined) {
      profileUpdateData.hourly_rate_dzd =
        hourly_rate_dzd === "" || hourly_rate_dzd === null
          ? null
          : Number(hourly_rate_dzd);
    }
    if (work_type !== undefined) profileUpdateData.work_type = work_type;
    if (is_available !== undefined)
      profileUpdateData.is_available = Boolean(is_available);
    if (dahabia_rip !== undefined) profileUpdateData.dahabia_rip = dahabia_rip;

    const profileId = user.professional_profile.id;
    const professionalDocumentUrls = await uploadFiles(
      getFiles(req, "documents"),
      "professional-documents",
    );
    const garageDocumentUrls = await uploadFiles(
      getFiles(req, "garageDocuments"),
      "professional-store-documents",
    );
    const uploadedDocumentCount =
      professionalDocumentUrls.length + garageDocumentUrls.length;

    if (professionalDocumentUrls.length > 0) {
      profileUpdateData.documents = [
        ...(user.professional_profile.documents || []),
        ...professionalDocumentUrls,
      ];
    }

    await prisma.$transaction(async (tx) => {
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: req.user.id },
          data: userUpdateData,
        });
      }

      if (Object.keys(profileUpdateData).length > 0) {
        await tx.professionalProfile.update({
          where: { id: profileId },
          data: profileUpdateData,
        });
      }

      const wantsGarageUpdate =
        garage_name !== undefined ||
        garage_wilaya !== undefined ||
        garage_address !== undefined ||
        garage_logo_url !== undefined ||
        garage_images !== undefined ||
        garageDocumentUrls.length > 0;

      if (wantsGarageUpdate) {
        // Process uploaded garage logo
        let finalGarageLogoUrl = garage_logo_url;
        if (req.files && req.files.garageLogo) {
          const result = await uploadImage(
            req.files.garageLogo[0].buffer,
            "garage-logos",
          );
          finalGarageLogoUrl = result.secure_url;
        }

        // Process uploaded garage images
        let finalGarageImages = garage_images;
        if (req.files && req.files.garageImages && req.files.garageImages.length > 0) {
          const uploadPromises = req.files.garageImages.map((file) =>
            uploadImage(file.buffer, "garage-images"),
          );
          const results = await Promise.all(uploadPromises);
          finalGarageImages = results.map((r) => r.secure_url);
        } else if (garage_images !== undefined) {
          finalGarageImages = Array.isArray(garage_images)
            ? garage_images
            : String(garage_images || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
        }

        const garageData = {
          ...(garage_name !== undefined && { name: garage_name }),
          ...(garage_wilaya !== undefined && { wilaya: garage_wilaya }),
          ...(garage_address !== undefined && { address: garage_address }),
          ...(finalGarageLogoUrl !== undefined && { logo_url: finalGarageLogoUrl }),
          ...(finalGarageImages !== undefined && { images: finalGarageImages }),
          ...(garageDocumentUrls.length > 0 && {
            documents: [
              ...(user.professional_profile.ProfessionalStore?.documents || []),
              ...garageDocumentUrls,
            ],
          }),
        };

        if (user.professional_profile.ProfessionalStore) {
          await tx.professionalStore.update({
            where: { professional_id: profileId },
            data: garageData,
          });
        } else if (
          Object.keys(garageData).length > 0 &&
          (work_type || user.professional_profile.work_type) === "avec_magasin"
        ) {
          await tx.professionalStore.create({
            data: {
              professional_id: profileId,
              name: garageData.name || "Garage",
              wilaya:
                garageData.wilaya || wilaya || user.professional_profile.wilaya,
              address:
                garageData.address ||
                location_address ||
                user.professional_profile.location_address ||
                "Non renseignee",
              images: garageData.images || [],
              documents: garageData.documents || [],
              logo_url: garageData.logo_url,
              status: "approved",
            },
          });
        }
      }

      if (uploadedDocumentCount > 0) {
        await notifyAdminsAboutDocumentUpdate(tx, {
          actorName: user.professional_profile.full_name,
          actorRole: "Professionnel",
          userId: req.user.id,
          count: uploadedDocumentCount,
        });
      }
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: selectSafeUser,
    });

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Phone number already in use" });
    }
    next(error);
  }
};

// Soft-delete the authenticated account.
const deleteMyAccount = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        is_active: false,
        refresh_token: null,
      },
    });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
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

    const {
      full_name,
      wilaya,
      address,
      date_of_birth,
      phone,
      preferred_language,
    } = req.body;

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
    if (preferred_language !== undefined)
      profileUpdateData.preferred_language = preferred_language;
    if (profilePicUrl) profileUpdateData.profilePicUrl = profilePicUrl;
    if (date_of_birth !== undefined) {
      profileUpdateData.date_of_birth = date_of_birth
        ? new Date(date_of_birth)
        : null;
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
        professional_profile: {
          include: { ProfessionalStore: true },
        },
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

// the store update contoller is in store.controller.js because it has specific logic related to the store profile and garage, while this user.controller.js file contains more general user-related operations.

const updateMyStoreProfile = async (req, res, next) => {
  try {
    if (req.user.role !== "store") {
      return res
        .status(403)
        .json({ message: "Only store owners can update this profile" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { store_profile: true },
    });

    if (!user?.store_profile) {
      return res.status(404).json({ message: "Store profile not found" });
    }

    const {
      phone,
      owner_name,
      store_name,
      description,
      wilaya,
      address,
      logo_url,
      images,
      dahabia_rip,
    } = req.body;

    const userUpdateData = {};
    if (phone !== undefined) userUpdateData.phone = phone;

    const profileUpdateData = {};
    if (owner_name !== undefined) profileUpdateData.owner_name = owner_name;
    if (store_name !== undefined) profileUpdateData.store_name = store_name;
    if (description !== undefined) profileUpdateData.description = description;
    if (wilaya !== undefined) profileUpdateData.wilaya = wilaya;
    if (address !== undefined) profileUpdateData.address = address;
    if (logo_url !== undefined) profileUpdateData.logo_url = logo_url;
    if (dahabia_rip !== undefined) profileUpdateData.dahabia_rip = dahabia_rip;
    const storeDocumentUrls = await uploadFiles(
      getFiles(req, "documents"),
      "store-documents",
    );
    
    // Handle store logo upload
    if (req.files && req.files.logo) {
      const result = await uploadImage(req.files.logo[0].buffer, "store-logos");
      profileUpdateData.logo_url = result.secure_url;
    }

    // Handle store images upload
    if (req.files && req.files.images && req.files.images.length > 0) {
      const uploadPromises = req.files.images.map((file) =>
        uploadImage(file.buffer, "store-images"),
      );
      const results = await Promise.all(uploadPromises);
      profileUpdateData.images = results.map((r) => r.secure_url);
    } else if (images !== undefined) {
      profileUpdateData.images = Array.isArray(images)
        ? images
        : String(images || "")
            .split(",")
            .map((url) => url.trim())
            .filter(Boolean);
    }

    if (storeDocumentUrls.length > 0) {
      profileUpdateData.documents = [
        ...(user.store_profile.documents || []),
        ...storeDocumentUrls,
      ];
    }

    await prisma.$transaction(async (tx) => {
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: req.user.id },
          data: userUpdateData,
        });
      }

      if (Object.keys(profileUpdateData).length > 0) {
        await tx.storeProfile.update({
          where: { id: user.store_profile.id },
          data: profileUpdateData,
        });
      }

      if (storeDocumentUrls.length > 0) {
        await notifyAdminsAboutDocumentUpdate(tx, {
          actorName: user.store_profile.store_name,
          actorRole: "Magasin",
          userId: req.user.id,
          count: storeDocumentUrls.length,
        });
      }
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: selectSafeUser,
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
  updateUserStatusAdmin,
  updateMyProfessionalProfile,
  deleteMyAccount,
  updateUserProfile,
  updateMyStoreProfile,
};
