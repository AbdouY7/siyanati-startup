const prisma = require("../prisma/client");

// ─── GET /statistics/user ───────────────────────────────────

const getUserStatistics = async (req, res, next) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 1. Count completed orders
    const completedOrdersCount = await prisma.order.count({
      where: {
        customer_id: user_id,
        status: "delivered", // or "completed" depending on your flow
      },
    });

    // 2. Count pending appointments
    const pendingAppointmentsCount = await prisma.appointment.count({
      where: {
        customer_id: user_id,
        status: {
          in: ["pending", "confirmed"],
        },
      },
    });

    // 3. Count total vehicles
    const totalVehiclesCount = await prisma.vehicle.count({
      where: {
        user_id,
      },
    });

    // 4. Count total diagnostic posts
    const totalDiagnosticPostsCount = await prisma.diagnosticPost.count({
      where: {
        author_id: user_id,
        is_deleted: false,
      },
    });

    // 5. Count saved diagnostic posts
    const savedPostsCount = await prisma.diagnosticSave.count({
      where: {
        user_id,
      },
    });

    // 6. Total activities (orders + appointments + posts)
    const totalActivities = completedOrdersCount + pendingAppointmentsCount + totalDiagnosticPostsCount;

    res.json({
      success: true,
      data: {
        completed_orders: completedOrdersCount,
        pending_appointments: pendingAppointmentsCount,
        total_vehicles: totalVehiclesCount,
        total_diagnostic_posts: totalDiagnosticPostsCount,
        saved_posts: savedPostsCount,
        total_activities: totalActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserStatistics,
};