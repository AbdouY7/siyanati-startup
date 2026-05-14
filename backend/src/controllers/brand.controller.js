const prisma = require("../prisma/client");
const { randomUUID } = require("crypto");

// ─── POST /brands ─────────────────────────────────────────────────────────────

const createBrand = async (req, res, next) => {
  try {
    const { name, country, logo_url } = req.body;
    const brand_id = randomUUID();

    const brand = await prisma.brand.create({
      data: { name, country, logo_url },
    });

    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    // Unique constraint on name
    if (error.code === "P2002") {
      res
        .status(409)
        .json({ success: false, message: "Brand name already exists" });
      return;
    }
    next(error);
  }
};

// ─── GET /brands ──────────────────────────────────────────────────────────────

const getAllBrands = async (req, res, next) => {
  try {
    const { country, search } = req.query;

    const brands = await prisma.brand.findMany({
      where: {
        is_deleted: false,
        ...(country ? { country } : {}),
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: brands });
  } catch (error) {
    next(error);
  }
};

// ─── GET /brands/:id ──────────────────────────────────────────────────────────

const getBrandById = async (req, res, next) => {
  try {
    const brand = await prisma.brand.findUnique({
      where: {
        id: req.params.id,
        is_deleted: false,
      },
      include: { models: true },
    });

    if (!brand) {
      res.status(404).json({ success: false, message: "Brand not found" });
      return;
    }

    res.json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /brands/:id ────────────────────────────────────────────────────────

const updateBrand = async (req, res, next) => {
  try {
    const brand = await prisma.brand.update({
      where: { id: req.params.id, is_deleted: false },
      data: req.body,
    });

    res.json({ success: true, data: brand });
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ success: false, message: "Brand not found" });
      return;
    }
    if (error.code === "P2002") {
      res
        .status(409)
        .json({ success: false, message: "Brand name already exists" });
      return;
    }
    next(error);
  }
};

const deleteBrand = async (req, res, next) => {
  try {
    const brandId = req.params.id;

    // Check if brand exists and is not already deleted
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: { models: true },
    });

    if (!brand || brand.is_deleted) {
      res.status(404).json({
        success: false,
        message: "Brand not found",
      });
      return;
    }

    // Prevent deletion if brand has models
    if (brand.models.length > 0) {
      res.status(400).json({
        success: false,
        message: "Cannot delete brand with existing models",
      });
      return;
    }

    // Soft delete
    await prisma.brand.update({
      where: { id: brandId },
      data: { is_deleted: true },
    });

    res.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const createModel = async (req, res, next) => {
  try {
    const { brand_id, name, year_start, year_end } = req.body;

    // Verify brand exists
    const brandExists = await prisma.brand.findUnique({
      where: { id: brand_id },
    });

    if (!brandExists) {
      res.status(404).json({ success: false, message: "Brand not found" });
      return;
    }

    const model = await prisma.model.create({
      data: { brand_id, name, year_start, year_end },
      include: { brand: { select: { id: true, name: true } } },
    });

    res.status(201).json({ success: true, data: model });
  } catch (error) {
    next(error);
  }
};

// ─── GET /models ──────────────────────────────────────────────────────────────

const getAllModels = async (req, res, next) => {
  try {
    const { brand_id, search } = req.query;

    const models = await prisma.model.findMany({
      where: {
        ...(brand_id ? { brand_id } : {}),
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
      include: { brand: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: models });
  } catch (error) {
    next(error);
  }
};

// ─── GET /models/:id ──────────────────────────────────────────────────────────

const getModelById = async (req, res, next) => {
  try {
    const model = await prisma.model.findUnique({
      where: { id: req.params.id },
      include: { brand: { select: { id: true, name: true } } },
    });

    if (!model) {
      res.status(404).json({ success: false, message: "Model not found" });
      return;
    }

    res.json({ success: true, data: model });
  } catch (error) {
    next(error);
  }
};

// ─── GET /brands/:brandId/models ──────────────────────────────────────────────

const getModelsByBrand = async (req, res, next) => {
  try {
    const { brandId } = req.params;

    const brandExists = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brandExists) {
      res.status(404).json({ success: false, message: "Brand not found" });
      return;
    }

    const models = await prisma.model.findMany({
      where: { brand_id: brandId },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: models });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /models/:id ────────────────────────────────────────────────────────

const updateModel = async (req, res, next) => {
  try {
    const { brand_id, ...rest } = req.body;

    // Verify new brand exists if brand_id is being changed
    if (brand_id) {
      const brandExists = await prisma.brand.findUnique({
        where: { id: brand_id },
      });

      if (!brandExists) {
        res.status(404).json({ success: false, message: "Brand not found" });
        return;
      }
    }

    const model = await prisma.model.update({
      where: { id: req.params.id },
      data: { ...(brand_id ? { brand_id } : {}), ...rest },
      include: { brand: { select: { id: true, name: true } } },
    });

    res.json({ success: true, data: model });
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ success: false, message: "Model not found" });
      return;
    }
    next(error);
  }
};

module.exports = {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  createModel,
  getAllModels,
  getModelById,
  getModelsByBrand,
  updateModel,
};
