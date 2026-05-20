const prisma = require("../prisma/client");
const uploadImage = require("../utils/uploadImage");

const uploadFiles = async (files, folder) => {
  const results = await Promise.all(
    files.map((file) => uploadImage(file.buffer, folder)),
  );
  return results.map((result) => result.secure_url);
};

const getFiles = (req, fieldName) => {
  if (!req.files) return [];
  if (Array.isArray(req.files)) {
    return req.files.filter((file) => file.fieldname === fieldName);
  }
  return req.files[fieldName] || [];
};

// GET /api/professional-stores/me — authenticated professional gets their store
const getMyStore = async (req, res, next) => {
  try {
    const profile = await prisma.professionalProfile.findUnique({
      where: { user_id: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Professional profile not found" });
    }

    const store = await prisma.professionalStore.findUnique({
      where: { professional_id: profile.id },
    });

    if (!store) {
      return res.status(404).json({ success: false, message: "No store found for this professional" });
    }

    res.json({ success: true, data: store });
  } catch (error) {
    next(error);
  }
};

// GET /api/professional-stores/:professionalId — public view
const getStoreByProfessionalId = async (req, res, next) => {
  try {
    const store = await prisma.professionalStore.findUnique({
      where: { professional_id: req.params.professionalId },
      include: {
        professional: {
          select: {
            full_name: true,
            specialty_type: true,
            wilaya: true,
            rating_avg: true,
            rating_count: true,
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    res.json({ success: true, data: store });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/professional-stores/me — update store details
const updateMyStore = async (req, res, next) => {
  try {
    const profile = await prisma.professionalProfile.findUnique({
      where: { user_id: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Professional profile not found" });
    }

    const store = await prisma.professionalStore.findUnique({
      where: { professional_id: profile.id },
    });

    if (!store) {
      return res.status(404).json({ success: false, message: "No store found for this professional" });
    }

    const { name, address, wilaya, location_coordinates } = req.body;

    // Handle new image uploads
    const imageFiles = getFiles(req, "images");
    let newImageUrls = [];
    if (imageFiles.length > 0) {
      newImageUrls = await uploadFiles(imageFiles, "professional-stores");
    }

    // Handle new document uploads
    const docFiles = getFiles(req, "documents");
    let newDocUrls = [];
    if (docFiles.length > 0) {
      newDocUrls = await uploadFiles(docFiles, "professional-stores");
    }

    // Handle logo upload
    const logoFiles = getFiles(req, "logo");
    let logoUrl;
    if (logoFiles.length > 0) {
      const [uploaded] = await uploadFiles(logoFiles.slice(0, 1), "professional-stores");
      logoUrl = uploaded;
    }

    const updated = await prisma.professionalStore.update({
      where: { id: store.id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(wilaya && { wilaya }),
        ...(location_coordinates !== undefined && { location_coordinates }),
        ...(newImageUrls.length > 0 && { images: [...store.images, ...newImageUrls] }),
        ...(newDocUrls.length > 0 && { documents: [...store.documents, ...newDocUrls] }),
        ...(logoUrl && { logo_url: logoUrl }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/professional-stores/me — remove store and set work_type back to individuel
const deleteMyStore = async (req, res, next) => {
  try {
    const profile = await prisma.professionalProfile.findUnique({
      where: { user_id: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Professional profile not found" });
    }

    const store = await prisma.professionalStore.findUnique({
      where: { professional_id: profile.id },
    });

    if (!store) {
      return res.status(404).json({ success: false, message: "No store found" });
    }

    await prisma.$transaction([
      prisma.professionalStore.delete({ where: { id: store.id } }),
      prisma.professionalProfile.update({
        where: { id: profile.id },
        data: { work_type: "individuel" },
      }),
    ]);

    res.json({ success: true, message: "Store deleted and work type set to individuel" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyStore,
  getStoreByProfessionalId,
  updateMyStore,
  deleteMyStore,
};
