const prisma = require("../prisma/client");

/**
 * Get favorites for the authenticated user
 * Query: ?target_type=store|professional|part&page=1&limit=20
 */
const getFavorites = async (req, res, next) => {
  try {
    const { target_type, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const where = { user_id: userId };
    if (target_type) where.target_type = target_type;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [favorites, total] = await prisma.$transaction([
      prisma.favorite.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.favorite.count({ where }),
    ]);

    // Enrich favorites with target details
    const enriched = await Promise.all(
      favorites.map(async (fav) => {
        let target = null;

        if (fav.target_type === "store") {
          target = await prisma.storeProfile.findUnique({
            where: { id: fav.target_id },
            select: {
              id: true,
              store_name: true,
              owner_name: true,
              logo_url: true,
              wilaya: true,
              address: true,
              rating_avg: true,
              rating_count: true,
              status: true,
              is_frozen: true,
              images: true,
            },
          });
        } else if (fav.target_type === "professional") {
          target = await prisma.professionalProfile.findUnique({
            where: { id: fav.target_id },
            select: {
              id: true,
              full_name: true,
              specialty_type: true,
              wilaya: true,
              location_address: true,
              hourly_rate_dzd: true,
              rating_avg: true,
              rating_count: true,
              is_available: true,
              is_frozen: true,
              shop_images: true,
              status: true,
            },
          });
        } else if (fav.target_type === "part") {
          target = await prisma.part.findUnique({
            where: { id: fav.target_id },
            select: {
              id: true,
              name: true,
              price_dzd: true,
              condition: true,
              images: true,
              stock_qty: true,
              is_active: true,
              seller_id: true,
              seller_type: true,
            },
          });
          // If part found, get seller info
          if (target && target.seller_type === "store") {
            const store = await prisma.storeProfile.findUnique({
              where: { user_id: target.seller_id },
              select: { store_name: true, logo_url: true },
            });
            target.seller = store;
          }
        }

        return {
          ...fav,
          target,
        };
      })
    );

    res.json({
      success: true,
      data: {
        favorites: enriched,
        total,
        page: Number(page),
        limit: take,
        total_pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a favorite
 * Body: { target_id, target_type }
 */
const addFavorite = async (req, res, next) => {
  try {
    const { target_id, target_type } = req.body;
    const userId = req.user.id;

    if (!target_id || !target_type) {
      return res.status(400).json({
        success: false,
        message: "target_id and target_type are required",
      });
    }

    // Validate target_type
    const validTypes = ["store", "professional", "part"];
    if (!validTypes.includes(target_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target_type. Must be store, professional, or part",
      });
    }

    // Verify target exists
    let targetExists = false;
    if (target_type === "store") {
      targetExists = await prisma.storeProfile.findUnique({ where: { id: target_id } });
    } else if (target_type === "professional") {
      targetExists = await prisma.professionalProfile.findUnique({ where: { id: target_id } });
    } else if (target_type === "part") {
      targetExists = await prisma.part.findUnique({ where: { id: target_id } });
    }

    if (!targetExists) {
      return res.status(404).json({
        success: false,
        message: `${target_type} not found`,
      });
    }

    const favorite = await prisma.favorite.create({
      data: {
        user_id: userId,
        target_id,
        target_type,
      },
    });

    res.status(201).json({ success: true, data: favorite });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Already in favorites",
      });
    }
    next(error);
  }
};

/**
 * Remove a favorite
 */
const removeFavorite = async (req, res, next) => {
  try {
    const { target_id, target_type } = req.params;
    const userId = req.user.id;

    const favorite = await prisma.favorite.findUnique({
      where: {
        user_id_target_id_target_type: {
          user_id: userId,
          target_id,
          target_type,
        },
      },
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    await prisma.favorite.delete({
      where: {
        user_id_target_id_target_type: {
          user_id: userId,
          target_id,
          target_type,
        },
      },
    });

    res.json({ success: true, message: "Removed from favorites" });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if a target is favorited by current user
 */
const checkFavorite = async (req, res, next) => {
  try {
    const { target_id, target_type } = req.params;
    const userId = req.user.id;

    const favorite = await prisma.favorite.findUnique({
      where: {
        user_id_target_id_target_type: {
          user_id: userId,
          target_id,
          target_type,
        },
      },
    });

    res.json({
      success: true,
      data: { is_favorite: !!favorite },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
};
