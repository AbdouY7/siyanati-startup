const prisma = require("../prisma/client");

const compatibilityInclude = {
  part: { select: { id: true, name: true, seller_id: true, seller_type: true } },
  brand: { select: { id: true, name: true, logo_url: true } },
  model: { select: { id: true, name: true, year_start: true, year_end: true } },
};

const isAdmin = (user) => user?.role === "admin";

const canManagePart = (part, user) => isAdmin(user) || part?.seller_id === user?.id;

const checkYearRange = (year_from, year_to) => {
  if (year_to === null || year_to === undefined) return true;
  return year_to >= year_from;
};

const checkBrandModel = async (brand_id, model_id) => {
  const model = await prisma.model.findFirst({
    where: { id: model_id, brand_id },
  });

  return Boolean(model);
};

// Create a compatibility row for a part.
const createCompatibility = async (req, res, next) => {
  try {
    const { part_id, brand_id, model_id, year_from, year_to, engine_variant } =
      req.body;

    if (!checkYearRange(year_from, year_to)) {
      return res.status(400).json({
        success: false,
        message: "year_to must be greater than or equal to year_from",
      });
    }

    const part = await prisma.part.findUnique({
      where: { id: part_id },
    });

    if (!part) {
      return res.status(404).json({ success: false, message: "Part not found" });
    }

    if (!canManagePart(part, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You can only manage compatibility for your own parts",
      });
    }

    const modelMatchesBrand = await checkBrandModel(brand_id, model_id);

    if (!modelMatchesBrand) {
      return res.status(404).json({
        success: false,
        message: "Model not found or does not belong to the specified brand",
      });
    }

    const compatibility = await prisma.partCompatibility.create({
      data: {
        part_id,
        brand_id,
        model_id,
        year_from,
        year_to,
        engine_variant,
      },
      include: compatibilityInclude,
    });

    res.status(201).json({ success: true, data: compatibility });
  } catch (error) {
    next(error);
  }
};

// Get compatibility rows with optional filters.
const getAllCompatibilities = async (req, res, next) => {
  try {
    const { part_id, brand_id, model_id } = req.query;

    const compatibilities = await prisma.partCompatibility.findMany({
      where: {
        ...(part_id && { part_id }),
        ...(brand_id && { brand_id }),
        ...(model_id && { model_id }),
      },
      include: compatibilityInclude,
      orderBy: { year_from: "asc" },
    });

    res.json({ success: true, data: compatibilities });
  } catch (error) {
    next(error);
  }
};

// Get one compatibility row by id.
const getCompatibilityById = async (req, res, next) => {
  try {
    const compatibility = await prisma.partCompatibility.findUnique({
      where: { id: req.params.id },
      include: compatibilityInclude,
    });

    if (!compatibility) {
      return res
        .status(404)
        .json({ success: false, message: "Compatibility not found" });
    }

    res.json({ success: true, data: compatibility });
  } catch (error) {
    next(error);
  }
};

// Update a compatibility row. Part owner or admin only.
const updateCompatibility = async (req, res, next) => {
  try {
    const existing = await prisma.partCompatibility.findUnique({
      where: { id: req.params.id },
      include: { part: true },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Compatibility not found" });
    }

    if (!canManagePart(existing.part, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You can only manage compatibility for your own parts",
      });
    }

    const brand_id = req.body.brand_id || existing.brand_id;
    const model_id = req.body.model_id || existing.model_id;
    const year_from = req.body.year_from || existing.year_from;
    const year_to =
      req.body.year_to !== undefined ? req.body.year_to : existing.year_to;

    if (!checkYearRange(year_from, year_to)) {
      return res.status(400).json({
        success: false,
        message: "year_to must be greater than or equal to year_from",
      });
    }

    const modelMatchesBrand = await checkBrandModel(brand_id, model_id);

    if (!modelMatchesBrand) {
      return res.status(404).json({
        success: false,
        message: "Model not found or does not belong to the specified brand",
      });
    }

    const compatibility = await prisma.partCompatibility.update({
      where: { id: req.params.id },
      data: req.body,
      include: compatibilityInclude,
    });

    res.json({ success: true, data: compatibility });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Compatibility not found" });
    }

    next(error);
  }
};

// Delete a compatibility row. Part owner or admin only.
const deleteCompatibility = async (req, res, next) => {
  try {
    const existing = await prisma.partCompatibility.findUnique({
      where: { id: req.params.id },
      include: { part: true },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Compatibility not found" });
    }

    if (!canManagePart(existing.part, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You can only manage compatibility for your own parts",
      });
    }

    await prisma.partCompatibility.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: "Compatibility deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Compatibility not found" });
    }

    next(error);
  }
};

module.exports = {
  createCompatibility,
  getAllCompatibilities,
  getCompatibilityById,
  updateCompatibility,
  deleteCompatibility,
};
