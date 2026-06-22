const prisma = require("../prisma/client");
const jwt = require("jsonwebtoken");
const { emitWorkflowUpdate } = require("../socket");

const postListInclude = {
  author: {
    select: {
      id: true,
      role: true,
      client_profile: true,
      professional_profile: true,
      store_profile: true,
    },
  },
  vehicle: { include: { brand: true, model: true } },
  brand: true,
  model: true,
  _count: {
    select: {
      comments: true,
      reactions: true,
    },
  },
};

const postDetailInclude = { ...postListInclude };

const getPosts = async (req, res, next) => {
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

    const {
      status,
      brand_id,
      model_id,
      author_id,
      year,
      fuel_type,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const where = {
      ...(!isAdmin && { is_deleted: false }),
      ...(status && { status }),
      ...(brand_id && { brand_id }),
      ...(model_id && { model_id }),
      ...(author_id && { author_id }),
      ...(year && { year: Number(year) }),
      ...(fuel_type && { fuel_type }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [posts, total] = await Promise.all([
      prisma.diagnosticPost.findMany({
        where,
        include: postListInclude,
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.diagnosticPost.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        posts,
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

const getPostById = async (req, res, next) => {
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

    const where = {
      id: req.params.id,
      ...(!isAdmin && { is_deleted: false }),
    };

    const post = await prisma.diagnosticPost.findFirst({
      where,
      include: postDetailInclude,
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    await prisma.diagnosticPost.update({
      where: { id: post.id },
      data: { views_count: { increment: 1 } },
    });

    post.views_count += 1;

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const {
      title,
      description,
      vehicle_id,
      brand_id,
      model_id,
      year,
      fuel_type,
    } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({
          success: false,
          message: "title and description are required",
        });
    }

    // Upload images from multer files to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadImage = require("../utils/uploadImage");
      const uploadPromises = req.files.map((file) =>
        uploadImage(file.buffer, "diagnostic-posts")
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((r) => r.secure_url);
    }



    let actualBrandId = brand_id;
    let actualModelId = model_id;
    let actualYear = year;
    let actualFuelType = fuel_type;

    if (vehicle_id) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicle_id },
      });

      if (!vehicle || vehicle.user_id !== req.user.id) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Vehicle not found or not owned by you",
          });
      }

      actualBrandId = null;
      actualModelId = null;
      actualYear = null;
      actualFuelType = null;
    }

    const post = await prisma.diagnosticPost.create({
      data: {
        author_id: req.user.id,
        title,
        description,
        images: imageUrls,
        vehicle_id,
        brand_id: actualBrandId,
        model_id: actualModelId,
        year: actualYear ? Number(actualYear) : null,
        fuel_type: actualFuelType,
        status: "open",
      },
      include: postDetailInclude,
    });

    emitWorkflowUpdate({
      entityType: "diagnostic",
      entityId: post.id,
      action: "created",
      newState: post,
      affectedUsers: [post.author_id],
      broadcastToRoles: ["professional", "admin"]
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { title, description, images } = req.body;

    const post = await prisma.diagnosticPost.findUnique({
      where: { id: req.params.id },
    });

    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    if (post.author_id !== req.user.id)
      return res.status(403).json({ success: false, message: "Forbidden" });

    if (post.is_deleted)
      return res
        .status(400)
        .json({ success: false, message: "Cannot edit deleted post" });

    if (post.status === "closed")
      return res
        .status(400)
        .json({ success: false, message: "Cannot edit closed post" });

    const updated = await prisma.diagnosticPost.update({
      where: { id: post.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(images && { images }),
      },
      include: postDetailInclude,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.code === "P2025")
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    next(error);
  }
};

const updatePostStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const post = await prisma.diagnosticPost.findUnique({
      where: { id: req.params.id },
    });

    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    const isAdmin = req.user.role === "admin";
    const isAuthor = post.author_id === req.user.id;

    if (!isAdmin && !isAuthor)
      return res.status(403).json({ success: false, message: "Forbidden" });

    let isValid = false;

    if (isAuthor && !isAdmin) {
      if (
        (post.status === "open" && status === "resolved") ||
        (post.status === "resolved" && status === "open")
      ) {
        isValid = true;
      }
    } else if (isAdmin) {
      if (
        status === "closed" ||
        (post.status === "closed" && status === "open")
      ) {
        isValid = true;
      }
    }

    if (!isValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status transition" });
    }

    const updated = await prisma.diagnosticPost.update({
      where: { id: post.id },
      data: { status },
      include: postDetailInclude,
    });

    emitWorkflowUpdate({
      entityType: "diagnostic",
      entityId: updated.id,
      action: "status_updated",
      newState: updated,
      affectedUsers: [updated.author_id],
      broadcastToRoles: ["professional", "admin"]
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.code === "P2025")
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await prisma.diagnosticPost.findUnique({
      where: { id: req.params.id },
    });

    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    const isAdmin = req.user.role === "admin";
    const isAuthor = post.author_id === req.user.id;

    if (!isAdmin && !isAuthor) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await prisma.diagnosticPost.update({
      where: { id: post.id },
      data: {
        is_deleted: true,
        ...(isAdmin && { deleted_by_admin_id: req.user.id }),
        deleted_at: new Date(),
      },
    });

    res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    if (error.code === "P2025")
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    next(error);
  }
};

const toggleSave = async (req, res, next) => {
  try {
    const post_id = req.params.id;
    const user_id = req.user.id;

    const post = await prisma.diagnosticPost.findUnique({
      where: { id: post_id },
    });
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    const existingSave = await prisma.diagnosticSave.findUnique({
      where: { user_id_post_id: { user_id, post_id } },
    });

    await prisma.$transaction(async (tx) => {
      if (existingSave) {
        await tx.diagnosticSave.delete({ where: { id: existingSave.id } });
        await tx.diagnosticPost.update({
          where: { id: post_id },
          data: { saves_count: { decrement: 1 } },
        });
      } else {
        await tx.diagnosticSave.create({ data: { user_id, post_id } });
        await tx.diagnosticPost.update({
          where: { id: post_id },
          data: { saves_count: { increment: 1 } },
        });
      }
    });

    res.json({ success: true, data: { saved: !existingSave } });
  } catch (error) {
    if (error.code === "P2002") {
      res.json({ success: true, data: { saved: true } });
      return;
    }
    next(error);
  }
};

const toggleReaction = async (req, res, next) => {
  try {
    const post_id = req.params.id;
    const user_id = req.user.id;

    const post = await prisma.diagnosticPost.findUnique({
      where: { id: post_id },
    });
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    const existing = await prisma.diagnosticReaction.findUnique({
      where: {
        user_id_target_id_target_type: {
          user_id,
          target_id: post_id,
          target_type: "post",
        },
      },
    });

    if (existing) {
      await prisma.diagnosticReaction.delete({ where: { id: existing.id } });
      res.json({ success: true, data: { reacted: false } });
    } else {
      await prisma.diagnosticReaction.create({
        data: {
          user_id,
          target_id: post_id,
          target_type: "post",
          post_id,
        },
      });
      res.json({ success: true, data: { reacted: true } });
    }
  } catch (error) {
    if (error.code === "P2002") {
      res.json({ success: true, data: { reacted: true } });
      return;
    }
    next(error);
  }
};

const getMyPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {
      author_id: req.user.id,
      is_deleted: false,
    };

    const [posts, total] = await Promise.all([
      prisma.diagnosticPost.findMany({
        where,
        include: postListInclude,
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.diagnosticPost.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        posts,
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

const getSavedPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = { user_id: req.user.id };

    const [savedPosts, total] = await Promise.all([
      prisma.diagnosticSave.findMany({
        where,
        include: {
          post: {
            include: postListInclude,
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.diagnosticSave.count({ where }),
    ]);

    // Extract the post object from the savedPost relation
    const posts = savedPosts.map((save) => save.post).filter(Boolean);

    res.json({
      success: true,
      data: {
        posts,
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

module.exports = {
  getPosts,
  getPostById,
  getMyPosts,
  createPost,
  updatePost,
  updatePostStatus,
  deletePost,
  toggleSave,
  toggleReaction,
  getSavedPosts,
};
