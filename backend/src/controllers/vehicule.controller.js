const prisma = require("../prisma/client");
const uploadImage = require("../utils/uploadImage");

const getFile = (req, fieldNames) => {
  for (const fieldName of fieldNames) {
    if (req.file?.fieldname === fieldName) return req.file;
    if (Array.isArray(req.files)) {
      const file = req.files.find((item) => item.fieldname === fieldName);
      if (file) return file;
    }
    if (req.files?.[fieldName]?.[0]) return req.files[fieldName][0];
  }

  return null;
};

const uploadRegistrationDocument = async (req) => {
  const file = getFile(req, [
    "registration_document",
    "registration_document_url",
    "document",
  ]);

  if (!file) return null;

  const result = await uploadImage(file.buffer, "vehicle-documents");
  return result.secure_url;
};

// ✅ NEW: Vehicle picture upload helper
const uploadVehiclePicture = async (req) => {
  const file = getFile(req, [
    "image",
    "vehicule_picture",
    "vehicle_picture",
    "photo",
    "picture",
  ]);

  if (!file) return null;

  const result = await uploadImage(file.buffer, "vehicle-pictures");
  return result.secure_url;
};

const toOptionalInt = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  return Number(value);
};

const toOptionalBoolean = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return Boolean(value);
};

// ─── POST /vehicles ─────────────────────────────────────────

const createVehicle = async (req, res, next) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      brand_id,
      model_id,
      year,
      fuel_type,
      health_status,
      engine_cc,
      registration_number,
      registration_document_url,
      vin,
      is_default,
      color,
      mileage_km,
      notes,
    } = req.body;

    // Verify model belongs to brand
    const model = await prisma.model.findFirst({
      where: {
        id: model_id,
        brand_id,
      },
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: "Model not found or does not belong to the specified brand",
      });
    }

    const uploadedRegistrationDocumentUrl =
      await uploadRegistrationDocument(req);
    // ✅ NEW: Upload vehicle picture
    const uploadedVehiclePictureUrl = await uploadVehiclePicture(req);
    const parsedIsDefault = toOptionalBoolean(is_default);

    // Clear old default vehicle
    if (parsedIsDefault) {
      await prisma.vehicle.updateMany({
        where: {
          user_id,
          is_default: true,
        },
        data: {
          is_default: false,
        },
      });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        user_id,
        brand_id,
        model_id,
        year: Number(year),
        fuel_type,
        health_status: toOptionalInt(health_status),
        engine_cc: toOptionalInt(engine_cc),
        registration_number,
        registration_document_url:
          uploadedRegistrationDocumentUrl || registration_document_url,
        // ✅ NEW: Save vehicle picture URL
        vehicule_picture_url: uploadedVehiclePictureUrl || req.body.vehicule_picture_url || null,
        vin,
        is_default: parsedIsDefault ?? false,
        color,
        mileage_km: toOptionalInt(mileage_km),
        notes,
      },

      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo_url: true,
          },
        },

        model: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A vehicle with this VIN already exists",
      });
    }

    next(error);
  }
};

// ─── GET USER VEHICLES ─────────────────────────────────────

const getUserVehicles = async (req, res, next) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { brand_id, fuel_type, is_default } = req.query;

    const vehicles = await prisma.vehicle.findMany({
      where: {
        user_id,

        ...(brand_id && { brand_id }),

        ...(fuel_type && {
          fuel_type,
        }),

        ...(is_default !== undefined && {
          is_default: is_default === "true",
        }),
      },

      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo_url: true,
          },
        },

        model: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: [
        {
          is_default: "desc",
        },
        {
          created_at: "desc",
        },
      ],
    });

    res.json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET VEHICLE BY ID ─────────────────────────────────────

// GET /clients/:clientId/vehicles

const getClientVehicles = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { brand_id, fuel_type, is_default } = req.query;

    const client = await prisma.user.findFirst({
      where: {
        id: clientId,
        role: "customer",
      },
      select: {
        id: true,
      },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        user_id: clientId,

        ...(brand_id && { brand_id }),

        ...(fuel_type && {
          fuel_type,
        }),

        ...(is_default !== undefined && {
          is_default: is_default === "true",
        }),
      },

      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo_url: true,
          },
        },

        model: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: [
        {
          is_default: "desc",
        },
        {
          created_at: "desc",
        },
      ],
    });

    res.json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

const getVehicleById = async (req, res, next) => {
  try {
    const user_id = req.user?.id;

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: req.params.id,

        ...(user_id && { user_id }),
      },

      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo_url: true,
          },
        },

        model: {
          select: {
            id: true,
            name: true,
            year_start: true,
            year_end: true,
          },
        },
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /vehicles/:id ───────────────────────────────────

const updateVehicle = async (req, res, next) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const existing = await prisma.vehicle.findFirst({
      where: {
        id: req.params.id,
        user_id,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const { brand_id, model_id, is_default, ...rest } = req.body;
    const uploadedRegistrationDocumentUrl =
      await uploadRegistrationDocument(req);
    // ✅ NEW: Upload vehicle picture
    const uploadedVehiclePictureUrl = await uploadVehiclePicture(req);
    const parsedIsDefault = toOptionalBoolean(is_default);
    const normalizedRest = { ...rest };

    for (const field of ["year", "engine_cc", "mileage_km", "health_status"]) {
      if (field in normalizedRest) {
        normalizedRest[field] = toOptionalInt(normalizedRest[field]);
      }
    }

    // Validate brand-model relation
    if (model_id || brand_id) {
      const targetBrandId = brand_id || existing.brand_id;

      const targetModelId = model_id || existing.model_id;

      const model = await prisma.model.findFirst({
        where: {
          id: targetModelId,
          brand_id: targetBrandId,
        },
      });

      if (!model) {
        return res.status(404).json({
          success: false,
          message: "Model not found or does not belong to the specified brand",
        });
      }
    }

    // Handle default vehicle
    if (parsedIsDefault === true) {
      await prisma.vehicle.updateMany({
        where: {
          user_id,
          is_default: true,

          NOT: {
            id: req.params.id,
          },
        },

        data: {
          is_default: false,
        },
      });
    }

    const vehicle = await prisma.vehicle.update({
      where: {
        id: req.params.id,
      },

      data: {
        ...(brand_id && { brand_id }),

        ...(model_id && { model_id }),

        ...(parsedIsDefault !== undefined && {
          is_default: parsedIsDefault,
        }),

        ...normalizedRest,
        ...(uploadedRegistrationDocumentUrl && {
          registration_document_url: uploadedRegistrationDocumentUrl,
        }),
        // ✅ NEW: Update vehicle picture URL if uploaded
        ...(uploadedVehiclePictureUrl && {
          vehicule_picture_url: uploadedVehiclePictureUrl,
        }),
      },

      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo_url: true,
          },
        },

        model: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A vehicle with this VIN already exists",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    next(error);
  }
};

// DELETE /vehicles/:id

const deleteVehicle = async (req, res, next) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: req.params.id,
        user_id,
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    await prisma.vehicle.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    next(error);
  }
};

module.exports = {
  createVehicle,
  getUserVehicles,
  getClientVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};