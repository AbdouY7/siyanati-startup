const prisma = require("../prisma/client");
const jwt = require("jsonwebtoken");

const reviewListInclude = {
  author: {
    select: {
      id: true,
      client_profile: { select: { full_name: true, avatar_url: true } },
    },
  },
};

const reviewDetailInclude = {
  author: {
    select: {
      id: true,
      client_profile: { select: { full_name: true, avatar_url: true } },
    },
  },
  order: true,
  appointment: true,
};

const recalculateRating = async (targetType, targetId) => {
  if (targetType !== "store" && targetType !== "professional") return;

  const stats = await prisma.review.aggregate({
    where: { target_type: targetType, target_id: targetId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const data = {
    rating_avg: stats._avg.rating ? Number(stats._avg.rating) : 0,
    rating_count: stats._count.rating,
  };

  if (targetType === "store") {
    await prisma.storeProfile.update({ where: { id: targetId }, data });
  } else if (targetType === "professional") {
    await prisma.professionalProfile.update({ where: { id: targetId }, data });
  }
};

const createReview = async (req, res, next) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const {
      target_id,
      target_type,
      rating,
      comment,
      media_urls,
      order_id,
      appointment_id,
    } = req.body;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    if (target_type === "professional") {
      if (!appointment_id)
        return res
          .status(400)
          .json({ success: false, message: "appointment_id is required" });

      const appointment = await prisma.appointment.findUnique({
        where: { id: appointment_id },
      });
      if (!appointment)
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      if (appointment.customer_id !== req.user.id)
        return res.status(403).json({ success: false, message: "Forbidden" });
      if (appointment.status !== "completed")
        return res
          .status(400)
          .json({ success: false, message: "Appointment must be completed" });
      if (appointment.professional_id !== target_id)
        return res.status(400).json({
          success: false,
          message: "Invalid target_id for this appointment",
        });
    } else if (target_type === "store") {
      if (!order_id)
        return res
          .status(400)
          .json({ success: false, message: "order_id is required" });

      const order = await prisma.order.findUnique({ where: { id: order_id } });
      if (!order)
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      if (order.customer_id !== req.user.id)
        return res.status(403).json({ success: false, message: "Forbidden" });
      if (order.status !== "delivered")
        return res
          .status(400)
          .json({ success: false, message: "Order must be delivered" });
      if (order.store_id !== target_id)
        return res.status(400).json({
          success: false,
          message: "Invalid target_id for this order",
        });
    } else if (target_type === "part") {
      if (!order_id)
        return res
          .status(400)
          .json({ success: false, message: "order_id is required" });

      const order = await prisma.order.findUnique({
        where: { id: order_id },
        include: { items: true },
      });
      if (!order)
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      if (order.customer_id !== req.user.id)
        return res.status(403).json({ success: false, message: "Forbidden" });
      if (order.status !== "delivered")
        return res
          .status(400)
          .json({ success: false, message: "Order must be delivered" });

      const partInOrder = order.items.find(
        (item) => item.part_id === target_id,
      );
      if (!partInOrder)
        return res
          .status(400)
          .json({ success: false, message: "Part not found in this order" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid target_type" });
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        author_id: req.user.id,
        target_id,
        target_type,
        ...(order_id ? { order_id } : {}),
        ...(appointment_id ? { appointment_id } : {}),
      },
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Vous avez déjà évalué cette commande ou ce rendez-vous",
      });
    }

    const review = await prisma.review.create({
      data: {
        author_id: req.user.id,
        target_id,
        target_type,
        rating,
        comment,
        media_urls: media_urls || [],
        order_id,
        appointment_id,
      },
      include: reviewDetailInclude,
    });

    await recalculateRating(target_type, target_id);

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "You have already reviewed this" });
    }
    next(error);
  }
};

const getReviews = async (req, res, next) => {
  try {
    let isAdmin = false;
    let isOwner = false;
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await prisma.user.findUnique({
            where: { id: decoded.sub },
            include: {
              professional_profile: true,
              store_profile: true,
            },
          });

          if (user && user.is_active) {
            if (user.role === "admin") {
              isAdmin = true;
            }

            const { target_id, target_type } = req.query;

            // Check ownership based on target_type
            if (target_type === "professional" && user.professional_profile) {
              isOwner = user.professional_profile.id === target_id;
            } else if (target_type === "store" && user.store_profile) {
              isOwner = user.store_profile.id === target_id;
            }
          }
        }
      } catch (e) {}
    }

    const { target_id, target_type, page = 1, limit = 10 } = req.query;

    const where = {
      ...(target_id && { target_id }),
      ...(target_type && { target_type }),
      ...(!isAdmin && !isOwner && { is_verified: true }),
    };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [reviews, total] = await prisma.$transaction([
      prisma.review.findMany({
        where,
        include: reviewListInclude,
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.review.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        reviews,
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

const getReviewById = async (req, res, next) => {
  try {
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await prisma.user.findUnique({
            where: { id: decoded.sub },
          });
          if (user && user.is_active && user.role === "admin") {
            isAdmin = true;
          }
        }
      } catch (e) {}
    }

    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
      include: reviewDetailInclude,
    });

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    if (!review.is_verified && !isAdmin) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    if (review.author_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await prisma.review.delete({
      where: { id: review.id },
    });

    await recalculateRating(review.target_type, review.target_id);

    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }
    next(error);
  }
};

const verifyReview = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { is_verified: true },
      include: reviewDetailInclude,
    });

    res.json({ success: true, data: review });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }
    next(error);
  }
};

const markHelpful = async (req, res, next) => {
  try {
    await prisma.review.update({
      where: { id: req.params.id },
      data: { helpful_count: { increment: 1 } },
    });

    res.json({ success: true, message: "Helpful count incremented" });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }
    next(error);
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  deleteReview,
  verifyReview,
  markHelpful,
};
