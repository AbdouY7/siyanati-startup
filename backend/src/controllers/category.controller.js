const prisma = require("../prisma/client");

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const categoryInclude = {
  parent: {
    select: { id: true, name: true, slug: true },
  },
  children: {
    select: { id: true, name: true, slug: true, icon_url: true },
  },
  _count: {
    select: { parts: true, children: true },
  },
};

// Create a category. Admin only from the route.
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, parent_id, icon_url } = req.body;

    // Check parent category before assigning it.
    if (parent_id) {
      const parent = await prisma.category.findUnique({
        where: { id: parent_id },
      });

      if (!parent) {
        return res
          .status(404)
          .json({ success: false, message: "Parent category not found" });
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: slug || slugify(name),
        parent_id,
        icon_url,
      },
      include: categoryInclude,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Category name already exists" });
    }

    next(error);
  }
};

// Get all categories.
const getAllCategories = async (req, res, next) => {
  try {
    const { search, parent_id } = req.query;

    const categories = await prisma.category.findMany({
      where: {
        ...(parent_id !== undefined && { parent_id: parent_id || null }),
        ...(search && { name: { contains: search, mode: "insensitive" } }),
      },
      include: categoryInclude,
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// Get one category by id.
const getCategoryById = async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: categoryInclude,
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// Update a category. Admin only from the route.
const updateCategory = async (req, res, next) => {
  try {
    const { name, slug, parent_id, icon_url } = req.body;

    if (parent_id && parent_id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Category cannot be its own parent",
      });
    }

    if (parent_id) {
      const parent = await prisma.category.findUnique({
        where: { id: parent_id },
      });

      if (!parent) {
        return res
          .status(404)
          .json({ success: false, message: "Parent category not found" });
      }
    }

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(parent_id !== undefined && { parent_id }),
        ...(icon_url !== undefined && { icon_url }),
      },
      include: categoryInclude,
    });

    res.json({ success: true, data: category });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Category name already exists" });
    }

    next(error);
  }
};

// Delete a category. Child categories and parts are kept by Prisma as nullable relations.
const deleteCategory = async (req, res, next) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    next(error);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
