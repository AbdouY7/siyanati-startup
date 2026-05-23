const prisma = require("../prisma/client");

// ─── Helper: get the ProfessionalProfile id for a user ──────
const getProfessionalProfile = (userId) =>
  prisma.professionalProfile.findUnique({
    where: { user_id: userId },
    select: { id: true, rating_avg: true, rating_count: true, is_available: true, full_name: true },
  });

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

// ─── GET /statistics/professional-dashboard ──────────────────
// Returns all dashboard data for the logged-in professional

const getProfessionalDashboardStats = async (req, res, next) => {
  try {
    if (req.user.role !== "professional") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const profile = await getProfessionalProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Professional profile not found" });
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // Start/end of current month
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 1);

    // Start/end of previous month
    const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthEnd = new Date(currentYear, currentMonth, 1);

    // Start/end of current year
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear + 1, 0, 1);

    // Start/end of previous year
    const prevYearStart = new Date(currentYear - 1, 0, 1);
    const prevYearEnd = new Date(currentYear, 0, 1);

    // Run counts sequentially to prevent Neon connection pool exhaustion
    const appointmentsThisMonth = await prisma.appointment.count({
      where: {
        professional_id: profile.id,
        created_at: { gte: monthStart, lt: monthEnd },
      },
    });

    const appointmentsPrevMonth = await prisma.appointment.count({
      where: {
        professional_id: profile.id,
        created_at: { gte: prevMonthStart, lt: prevMonthEnd },
      },
    });

    const appointmentsThisYear = await prisma.appointment.count({
      where: {
        professional_id: profile.id,
        created_at: { gte: yearStart, lt: yearEnd },
      },
    });

    const appointmentsPrevYear = await prisma.appointment.count({
      where: {
        professional_id: profile.id,
        created_at: { gte: prevYearStart, lt: prevYearEnd },
      },
    });

    const completedThisYear = await prisma.appointment.count({
      where: {
        professional_id: profile.id,
        status: "completed",
        created_at: { gte: yearStart, lt: yearEnd },
      },
    });

    const cancelledThisYear = await prisma.appointment.count({
      where: {
        professional_id: profile.id,
        status: "cancelled",
        created_at: { gte: yearStart, lt: yearEnd },
      },
    });

    // ── Monthly stats for chart (current year, all 12 months) ──
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Fetch all appointments for this year to aggregate by month in JS
    const yearAppointments = await prisma.appointment.findMany({
      where: {
        professional_id: profile.id,
        created_at: { gte: yearStart, lt: yearEnd },
      },
      select: {
        created_at: true,
        status: true,
      },
    });

    const monthlyStats = monthNames.map((month, index) => {
      const monthAppts = yearAppointments.filter((a) => {
        const d = new Date(a.created_at);
        return d.getMonth() === index;
      });

      return {
        month,
        total: monthAppts.length,
        completed: monthAppts.filter((a) => a.status === "completed").length,
        cancelled: monthAppts.filter((a) => a.status === "cancelled").length,
      };
    });

    // Completion rate
    const completionRate = appointmentsThisYear > 0
      ? Number(((completedThisYear / appointmentsThisYear) * 100).toFixed(1))
      : 0;

    // Trends
    const monthTrend = appointmentsPrevMonth > 0
      ? Number((((appointmentsThisMonth - appointmentsPrevMonth) / appointmentsPrevMonth) * 100).toFixed(1))
      : appointmentsThisMonth > 0 ? 100 : 0;

    const yearTrend = appointmentsPrevYear > 0
      ? Number((((appointmentsThisYear - appointmentsPrevYear) / appointmentsPrevYear) * 100).toFixed(1))
      : appointmentsThisYear > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        appointments_this_month: appointmentsThisMonth,
        appointments_prev_month: appointmentsPrevMonth,
        month_trend: monthTrend,
        appointments_this_year: appointmentsThisYear,
        appointments_prev_year: appointmentsPrevYear,
        year_trend: yearTrend,
        completed_this_year: completedThisYear,
        cancelled_this_year: cancelledThisYear,
        completion_rate: completionRate,
        rating_avg: Number(profile.rating_avg),
        rating_count: profile.rating_count,
        is_available: profile.is_available,
        full_name: profile.full_name,
        monthly_stats: monthlyStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Helper: get the StoreProfile id for a user ──────
const getStoreProfile = (userId) =>
  prisma.storeProfile.findUnique({
    where: { user_id: userId },
    select: { id: true, rating_avg: true, rating_count: true, store_name: true },
  });

// ─── GET /statistics/store-dashboard ──────────────────
// Returns all dashboard data for the logged-in store

const getStoreDashboardStats = async (req, res, next) => {
  try {
    if (req.user.role !== "store") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const profile = await getStoreProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Store profile not found" });
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // Start/end of current month
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 1);

    // Start/end of previous month
    const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthEnd = new Date(currentYear, currentMonth, 1);

    // Start/end of current year
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear + 1, 0, 1);

    // Start/end of previous year
    const prevYearStart = new Date(currentYear - 1, 0, 1);
    const prevYearEnd = new Date(currentYear, 0, 1);

    // 1. Orders statistics
    const ordersThisMonth = await prisma.order.count({
      where: {
        store_id: profile.id,
        created_at: { gte: monthStart, lt: monthEnd },
      },
    });

    const ordersPrevMonth = await prisma.order.count({
      where: {
        store_id: profile.id,
        created_at: { gte: prevMonthStart, lt: prevMonthEnd },
      },
    });

    const ordersThisYear = await prisma.order.count({
      where: {
        store_id: profile.id,
        created_at: { gte: yearStart, lt: yearEnd },
      },
    });

    const ordersPrevYear = await prisma.order.count({
      where: {
        store_id: profile.id,
        created_at: { gte: prevYearStart, lt: prevYearEnd },
      },
    });

    const completedThisYear = await prisma.order.count({
      where: {
        store_id: profile.id,
        status: "delivered",
        created_at: { gte: yearStart, lt: yearEnd },
      },
    });

    const cancelledThisYear = await prisma.order.count({
      where: {
        store_id: profile.id,
        status: "cancelled",
        created_at: { gte: yearStart, lt: yearEnd },
      },
    });

    // 2. Parts statistics
    const totalParts = await prisma.part.count({
      where: {
        seller_id: req.user.id,
        seller_type: "store",
        is_active: true,
      },
    });

    // 3. Clients statistics (unique customers who ordered from this store)
    const clients = await prisma.order.findMany({
      where: { store_id: profile.id },
      distinct: ['customer_id'],
      select: { customer_id: true },
    });
    const totalClients = clients.length;

    // 4. Monthly stats for chart (current year, all 12 months)
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

    const yearOrders = await prisma.order.findMany({
      where: {
        store_id: profile.id,
        created_at: { gte: yearStart, lt: yearEnd },
      },
      select: {
        created_at: true,
        status: true,
        total_dzd: true,
      },
    });

    const monthlyStats = monthNames.map((month, index) => {
      const monthOrders = yearOrders.filter((o) => {
        const d = new Date(o.created_at);
        return d.getMonth() === index;
      });

      const completedOrders = monthOrders.filter((o) => o.status === "delivered");
      
      const revenue = completedOrders.reduce((sum, order) => {
        return sum + Number(order.total_dzd || 0);
      }, 0);

      return {
        month,
        total: monthOrders.length,
        completed: completedOrders.length,
        cancelled: monthOrders.filter((o) => o.status === "cancelled").length,
        revenue: revenue,
      };
    });

    // Trends
    const monthTrend = ordersPrevMonth > 0
      ? Number((((ordersThisMonth - ordersPrevMonth) / ordersPrevMonth) * 100).toFixed(1))
      : ordersThisMonth > 0 ? 100 : 0;

    const yearTrend = ordersPrevYear > 0
      ? Number((((ordersThisYear - ordersPrevYear) / ordersPrevYear) * 100).toFixed(1))
      : ordersThisYear > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        orders_this_month: ordersThisMonth,
        orders_prev_month: ordersPrevMonth,
        month_trend: monthTrend,
        orders_this_year: ordersThisYear,
        orders_prev_year: ordersPrevYear,
        year_trend: yearTrend,
        completed_this_year: completedThisYear,
        cancelled_this_year: cancelledThisYear,
        total_clients: totalClients,
        total_parts: totalParts,
        rating_avg: Number(profile.rating_avg),
        rating_count: profile.rating_count,
        store_name: profile.store_name,
        monthly_stats: monthlyStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /statistics/professional-availability ─────────────
// Toggle the professional's is_available flag

const toggleProfessionalAvailability = async (req, res, next) => {
  try {
    if (req.user.role !== "professional") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { is_available } = req.body;

    if (typeof is_available !== "boolean") {
      return res.status(400).json({ success: false, message: "is_available must be a boolean" });
    }

    const updated = await prisma.professionalProfile.update({
      where: { user_id: req.user.id },
      data: { is_available },
      select: { is_available: true },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Professional profile not found" });
    }
    next(error);
  }
};

module.exports = {
  getUserStatistics,
  getProfessionalDashboardStats,
  getStoreDashboardStats,
  toggleProfessionalAvailability,
};