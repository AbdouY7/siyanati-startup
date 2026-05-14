const prisma = require("../prisma/client");

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

    // Clear old default vehicle
    if (is_default) {
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
        year,
        fuel_type,
        engine_cc,
        registration_number,
        registration_document_url,
        vin,
        is_default: is_default ?? false,
        color,
        mileage_km,
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
    if (is_default === true) {
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

        ...(is_default !== undefined && {
          is_default,
        }),

        ...rest,
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

module.exports = {
  createVehicle,
  getUserVehicles,
  getVehicleById,
  updateVehicle,
};
