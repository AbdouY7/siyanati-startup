const prisma = require("../prisma/client");
const uploadImage = require("../utils/uploadImage");

const partInclude = {
  category: true,
  compatibilities: {
    include: {
      brand: { select: { id: true, name: true, logo_url: true } },
      model: {
        select: { id: true, name: true, year_start: true, year_end: true },
      },
    },
  },
};

const isAdmin = (user) => user?.role === "admin";
const canSellParts = (user) =>
  user?.role === "customer" || user?.role === "store";
const getSellerType = (user) => (user.role === "store" ? "store" : "client");

const getFiles = (req, fieldName) => {
  if (req.file?.fieldname === fieldName) return [req.file];
  if (!req.files) return [];
  if (Array.isArray(req.files)) {
    return req.files.filter((file) => file.fieldname === fieldName);
  }

  return req.files[fieldName] || [];
};

const getPartImageFiles = (req) => [
  ...getFiles(req, "image"),
  ...getFiles(req, "images"),
];

const uploadPartImages = async (req) => {
  const results = await Promise.all(
    getPartImageFiles(req).map((file) => uploadImage(file.buffer, "parts")),
  );

  return results.map((result) => result.secure_url);
};

const checkCategory = async (category_id) => {
  if (!category_id) return true;

  const category = await prisma.category.findUnique({
    where: { id: category_id },
  });

  return Boolean(category);
};

// Create a part listing for the logged-in customer or store.
const createPart = async (req, res, next) => {
  try {
    if (!canSellParts(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only customers and stores can create parts",
      });
    }

    const { category_id, ...data } = req.body;
    const categoryExists = await checkCategory(category_id);

    if (!categoryExists) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const seller_type = getSellerType(req.user);
    const is_verified = seller_type === "store" ? true : false;
    const imageUrls = await uploadPartImages(req);

    const part = await prisma.part.create({
      data: {
        ...data,
        category_id,
        seller_id: req.user.id,
        seller_type,
        images: imageUrls.length ? imageUrls : data.images || [],
        is_active: true,
        is_verified,
        verified_at: is_verified ? new Date() : undefined,
      },
      include: partInclude,
    });

    res.status(201).json({ success: true, data: part });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This seller already has a part with this SKU",
      });
    }

    next(error);
  }
};

// Get visible parts. Admins see everything; sellers also see their own parts.
const getAllParts = async (req, res, next) => {
  try {
    const { category_id, condition, seller_type, seller_id, search, is_verified, page, limit } =
      req.query;

    const where = {
      ...(category_id && { category_id }),
      ...(condition && { condition }),
      ...(seller_type && { seller_type }),
      ...(seller_id && { seller_id }),
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(isAdmin(req.user) && is_verified !== undefined
        ? { is_verified: is_verified === "true" }
        : {}),
      ...(!isAdmin(req.user)
        ? {
            OR: [
              ...(req.user ? [{ seller_id: req.user.id }] : []),
              { is_active: true, is_verified: true },
            ],
          }
        : {}),
    };

    if (page || limit) {
      const take = Math.min(Number(limit) || 10, 50);
      const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

      const [parts, total] = await Promise.all([
        prisma.part.findMany({
          where,
          include: partInclude,
          orderBy: { created_at: "desc" },
          skip,
          take,
        }),
        prisma.part.count({ where }),
      ]);

      return res.json({
        success: true,
        data: {
          parts,
          total,
          page: Number(page) || 1,
          limit: take,
          total_pages: Math.ceil(total / take),
        },
      });
    }

    const parts = await prisma.part.findMany({
      where,
      include: partInclude,
      orderBy: { created_at: "desc" },
    });

    res.json({ success: true, data: parts });
  } catch (error) {
    next(error);
  }
};

// Get parts owned by the logged-in seller.
const getMyParts = async (req, res, next) => {
  try {
    if (!canSellParts(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only customers and stores can own parts",
      });
    }

    const { search, category_id, condition, page = 1, limit = 10 } = req.query;
    const take = Math.min(Number(limit) || 10, 50);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const where = {
      seller_id: req.user.id,
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(category_id && { category_id }),
      ...(condition && { condition }),
    };

    const [parts, total] = await Promise.all([
      prisma.part.findMany({
        where,
        include: partInclude,
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.part.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        parts,
        total,
        page: Number(page) || 1,
        limit: take,
        total_pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get one part by id.
const getPartById = async (req, res, next) => {
  try {
    const part = await prisma.part.findUnique({
      where: { id: req.params.id },
      include: partInclude,
    });

    if (!part) {
      return res
        .status(404)
        .json({ success: false, message: "Part not found" });
    }

    const ownsPart = req.user && part.seller_id === req.user.id;

    if (
      !isAdmin(req.user) &&
      !ownsPart &&
      (!part.is_active || !part.is_verified)
    ) {
      return res
        .status(404)
        .json({ success: false, message: "Part not found" });
    }

    res.json({ success: true, data: part });
  } catch (error) {
    next(error);
  }
};

// Update a part. Sellers update their own parts; admins moderate through dedicated endpoints.
const updatePart = async (req, res, next) => {
  try {
    if (isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Admins cannot create, update, or own parts",
      });
    }

    const existing = await prisma.part.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Part not found" });
    }

    if (existing.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own parts",
      });
    }

    const { category_id, ...data } = req.body;
    const categoryExists = await checkCategory(category_id);

    if (!categoryExists) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const moderationResetData =
      existing.seller_type === "client"
        ? {
            is_verified: false,
            verified_at: null,
            verified_by_admin_id: null,
          }
        : {};
    const imageUrls = await uploadPartImages(req);

    const part = await prisma.part.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(imageUrls.length && { images: imageUrls }),
        ...(category_id !== undefined && { category_id }),
        ...moderationResetData,
      },
      include: partInclude,
    });

    res.json({ success: true, data: part });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This seller already has a part with this SKU",
      });
    }

    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Part not found" });
    }

    next(error);
  }
};

// Verify or unverify a part. Admin only from the route.
const verifyPart = async (req, res, next) => {
  try {
    const { is_verified, is_active, is_featured } = req.body;

    const part = await prisma.part.update({
      where: { id: req.params.id },
      data: {
        is_verified,
        verified_at: is_verified ? new Date() : null,
        verified_by_admin_id: is_verified ? req.user.id : null,
        ...(is_active !== undefined && { is_active }),
        ...(is_featured !== undefined && { is_featured }),
      },
      include: partInclude,
    });

    res.json({ success: true, data: part });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Part not found" });
    }

    next(error);
  }
};

// Delete a part. If it has orders, soft-delete it by anonymizing seller_id to preserve order history.
const deletePart = async (req, res, next) => {
  try {
    const existing = await prisma.part.findUnique({
      where: { id: req.params.id },
      include: {
        order_items: { select: { id: true }, take: 1 } // Just check if it has any orders
      }
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Part not found" });
    }

    if (!isAdmin(req.user) && existing.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own parts",
      });
    }

    if (existing.order_items && existing.order_items.length > 0) {
      // Soft delete: hide from seller's dashboard and catalog, free up SKU uniqueness by changing seller_id
      await prisma.part.update({
        where: { id: req.params.id },
        data: {
          is_active: false,
          seller_id: `DELETED_${existing.seller_id}`,
          sku: null,
        },
      });
    } else {
      // Hard delete is safe if there are no order items
      await prisma.part.delete({
        where: { id: req.params.id },
      });
    }

    res.json({ success: true, message: "Part deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Part not found" });
    }

    next(error);
  }
};

// Bulk create parts for the logged-in store.
const createBulkParts = async (req, res, next) => {
  try {
    if (!canSellParts(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only customers and stores can create parts",
      });
    }

    const partsData = req.body; // Array of validated parts
    const seller_type = getSellerType(req.user);
    const is_verified = seller_type === "store" ? true : false;
    
    // Check if category exists for all distinct category_ids provided
    const categoryIds = [...new Set(partsData.map(p => p.category_id).filter(Boolean))];
    if (categoryIds.length > 0) {
      const existingCategories = await prisma.category.findMany({
        where: { id: { in: categoryIds } }
      });
      if (existingCategories.length !== categoryIds.length) {
         return res.status(404).json({ success: false, message: "One or more categories not found" });
      }
    }

    const dataToInsert = partsData.map(data => ({
      ...data,
      seller_id: req.user.id,
      seller_type,
      images: [],
      is_active: true,
      is_verified,
      verified_at: is_verified ? new Date() : null,
    }));

    const result = await prisma.part.createMany({
      data: dataToInsert,
      skipDuplicates: true, // skip if SKU already exists for this seller (needs unique constraint on schema, otherwise it might just insert or throw depending on Prisma setup)
    });

    res.status(201).json({ success: true, count: result.count });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "One or more parts conflict with existing SKUs",
      });
    }
    next(error);
  }
};

module.exports = {
  createPart,
  createBulkParts,
  getAllParts,
  getMyParts,
  getPartById,
  updatePart,
  verifyPart,
  deletePart,
};
