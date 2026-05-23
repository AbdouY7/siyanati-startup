const prisma = require("../prisma/client");
const {
  calculateOrderTotals,
  generateOrderNumber,
} = require("../utils/order.utils");

const listOrderInclude = {
  items: true,
  payment: { select: { id: true, status: true } },
  store: { select: { id: true, store_name: true, logo_url: true } },
  customer: {
    select: {
      id: true,
      phone: true,
      client_profile: { select: { full_name: true } },
    },
  },
};

const detailOrderInclude = {
  items: true,
  payment: true,
  store: { select: { id: true, store_name: true, logo_url: true } },
  customer: {
    select: {
      id: true,
      phone: true,
      client_profile: { select: { full_name: true } },
    },
  },
};

const isAdmin = (user) => user?.role === "admin";
const isCustomer = (user) => user?.role === "customer";
const isStore = (user) => user?.role === "store";

const aggregateItems = (items) => {
  const itemMap = new Map();

  items.forEach((item) => {
    const current = itemMap.get(item.part_id) || {
      part_id: item.part_id,
      quantity: 0,
    };

    current.quantity += item.quantity;
    itemMap.set(item.part_id, current);
  });

  return Array.from(itemMap.values());
};

const getStoreProfileForUser = (userId) =>
  prisma.storeProfile.findUnique({
    where: { user_id: userId },
    select: { id: true },
  });

const getOrderAccessWhere = async (user) => {
  if (isAdmin(user)) return {};
  if (isCustomer(user)) return { customer_id: user.id };

  if (isStore(user)) {
    const storeProfile = await getStoreProfileForUser(user.id);
    return storeProfile ? { store_id: storeProfile.id } : null;
  }

  return null;
};

const getAllowedTransitions = (status, user) => {
  const transitions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped"],
    shipped: ["delivered"],
    delivered: isAdmin(user) ? ["refunded"] : [],
  };

  return transitions[status] || [];
};

const restoreOrderStock = async (tx, items) => {
  await Promise.all(
    items.map((item) =>
      tx.part.update({
        where: { id: item.part_id },
        data: { stock_qty: { increment: item.quantity } },
      }),
    ),
  );
};

/**
 * Create a single-store order for the authenticated customer.
 */
const createOrder = async (req, res, next) => {
  try {
    if (!isCustomer(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only customers can create orders",
      });
    }

    const {
      store_id,
      delivery_type,
      delivery_address,
      delivery_notes,
      notes,
      loyalty_points_used,
    } = req.body;
    const requestedItems = aggregateItems(req.body.items);
    const partIds = requestedItems.map((item) => item.part_id);

    const store = await prisma.storeProfile.findFirst({
      where: {
        id: store_id,
        is_frozen: false,
      },
      select: {
        id: true,
        user_id: true,
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const parts = await prisma.part.findMany({
      where: { id: { in: partIds } },
      select: {
        id: true,
        seller_id: true,
        seller_type: true,
        name: true,
        sku: true,
        price_dzd: true,
        stock_qty: true,
        is_active: true,
        is_verified: true,
      },
    });
    const partsById = new Map(parts.map((part) => [part.id, part]));
    const missingPartIds = partIds.filter((partId) => !partsById.has(partId));

    if (missingPartIds.length > 0) {
      return res.status(404).json({
        success: false,
        message: "Part not found",
        invalid_part_ids: missingPartIds,
      });
    }

    const invalidStorePartIds = parts
      .filter(
        (part) => part.seller_type !== "store" || part.seller_id !== store.user_id,
      )
      .map((part) => part.id);

    if (invalidStorePartIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "All items must belong to the same store",
        invalid_part_ids: invalidStorePartIds,
      });
    }

    const unavailablePartIds = parts
      .filter((part) => !part.is_active || !part.is_verified)
      .map((part) => part.id);

    if (unavailablePartIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "All items must be active and verified",
        invalid_part_ids: unavailablePartIds,
      });
    }

    const insufficientItem = requestedItems.find((item) => {
      const part = partsById.get(item.part_id);
      return part.stock_qty < item.quantity;
    });

    if (insufficientItem) {
      const part = partsById.get(insufficientItem.part_id);

      return res.status(409).json({
        success: false,
        message: "Insufficient stock",
        part_id: insufficientItem.part_id,
        available: part.stock_qty,
      });
    }

    const totalItems = requestedItems.map((item) => {
      const part = partsById.get(item.part_id);
      return {
        price_dzd: part.price_dzd,
        quantity: item.quantity,
      };
    });
    const totals = calculateOrderTotals(totalItems, loyalty_points_used);

    if (loyalty_points_used > totals.subtotal_dzd) {
      return res.status(400).json({
        success: false,
        message: "Loyalty points used cannot exceed order subtotal",
      });
    }

    // TODO: Validate ClientProfile.loyalty_points when that field exists in the schema.
    const orderItems = requestedItems.map((item) => {
      const part = partsById.get(item.part_id);
      const unitPrice = Number(part.price_dzd);

      return {
        part_id: item.part_id,
        part_name: part.name,
        part_sku: part.sku,
        quantity: item.quantity,
        unit_price_dzd: unitPrice,
        discount_pct: 0,
        line_total_dzd: unitPrice * item.quantity,
      };
    });

    const order = await prisma.$transaction(async (tx) => {
      for (const item of requestedItems) {
        const updated = await tx.part.updateMany({
          where: {
            id: item.part_id,
            stock_qty: { gte: item.quantity },
          },
          data: {
            stock_qty: { decrement: item.quantity },
          },
        });

        if (updated.count !== 1) {
          const currentPart = await tx.part.findUnique({
            where: { id: item.part_id },
            select: { stock_qty: true },
          });
          const error = new Error("Insufficient stock");
          error.statusCode = 409;
          error.part_id = item.part_id;
          error.available = currentPart?.stock_qty || 0;
          throw error;
        }
      }

      return tx.order.create({
        data: {
          customer_id: req.user.id,
          store_id,
          order_number: generateOrderNumber(),
          subtotal_dzd: totals.subtotal_dzd,
          discount_dzd: totals.discount_dzd,
          total_dzd: totals.total_dzd,
          delivery_type,
          delivery_address,
          delivery_notes,
          notes,
          loyalty_points_used,
          loyalty_points_earned: totals.loyalty_points_earned,
          items: {
            create: orderItems,
          },
        },
        include: detailOrderInclude,
      });
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    if (error.statusCode === 409 && error.message === "Insufficient stock") {
      return res.status(409).json({
        success: false,
        message: "Insufficient stock",
        part_id: error.part_id,
        available: error.available,
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Order number already exists",
      });
    }

    next(error);
  }
};

/**
 * List orders visible to the authenticated requester.
 */
const getOrders = async (req, res, next) => {
  try {
    const accessWhere = await getOrderAccessWhere(req.user);

    if (!accessWhere) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view orders",
      });
    }

    const { status, delivery_type, from_date, to_date, search, wilaya, page, limit } = req.query;
    const where = {
      ...accessWhere,
      ...(status && { status }),
      ...(delivery_type && { delivery_type }),
      ...((from_date || to_date) && {
        created_at: {
          ...(from_date && { gte: new Date(from_date) }),
          ...(to_date && { lte: new Date(to_date) }),
        },
      }),
      ...(search && {
        OR: [
          { order_number: { contains: search, mode: "insensitive" } },
          { customer: { phone: { contains: search, mode: "insensitive" } } },
          { customer: { client_profile: { full_name: { contains: search, mode: "insensitive" } } } }
        ]
      }),
      ...(wilaya && {
        customer: { client_profile: { wilaya } }
      }),
    };
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: listOrderInclude,
        orderBy: { created_at: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        total,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get one order visible to the authenticated requester.
 */
const getOrderById = async (req, res, next) => {
  try {
    const accessWhere = await getOrderAccessWhere(req.user);

    if (!accessWhere) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        ...accessWhere,
      },
      include: detailOrderInclude,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an order status with enforced marketplace transitions.
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    if (!isAdmin(req.user) && !isStore(req.user) && !isCustomer(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update order status",
      });
    }

    const accessWhere = isAdmin(req.user)
      ? {}
      : await getOrderAccessWhere(req.user);

    if (!accessWhere) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        ...accessWhere,
      },
      include: { items: true, payment: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const { status, cancellation_reason } = req.body;
    const allowedTransitions = getAllowedTransitions(order.status, req.user);

    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status}. Allowed transitions: ${allowedTransitions.join(", ") || "none"}`,
      });
    }

    if (isCustomer(req.user) && status !== "delivered") {
      return res.status(403).json({
        success: false,
        message: "Customers can only confirm delivery of their orders",
      });
    }

    let updatedOrder;

    if (status === "cancelled") {
      updatedOrder = await prisma.$transaction(async (tx) => {
        await restoreOrderStock(tx, order.items);

        return tx.order.update({
          where: { id: order.id },
          data: {
            status,
            cancelled_at: new Date(),
            cancellation_reason,
          },
          include: detailOrderInclude,
        });
      });
    } else if (status === "refunded") {
      updatedOrder = await prisma.$transaction(async (tx) => {
        if (order.payment) {
          await tx.payment.update({
            where: { order_id: order.id },
            data: { status: "refunded" },
          });
        }

        return tx.order.update({
          where: { id: order.id },
          data: { status },
          include: detailOrderInclude,
        });
      });
    } else {
      updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status },
        include: detailOrderInclude,
      });
    }

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    next(error);
  }
};

/**
 * Cancel a pending order owned by the authenticated customer.
 */
const cancelOrder = async (req, res, next) => {
  try {
    if (!isCustomer(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only customers can cancel their orders",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        customer_id: req.user.id,
      },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled by the customer",
      });
    }

    await prisma.$transaction(async (tx) => {
      await restoreOrderStock(tx, order.items);

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "cancelled",
          cancelled_at: new Date(),
          cancellation_reason: "Cancelled by customer",
        },
      });
    });

    res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
