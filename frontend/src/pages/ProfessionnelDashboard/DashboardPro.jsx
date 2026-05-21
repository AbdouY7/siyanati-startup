import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  RiCalendarLine,
  RiArrowRightUpLine,
  RiCheckLine,
  RiCloseLine,
  RiStarFill,
  RiStarLine,
  RiLoader4Line,
} from "react-icons/ri";
import useAuthStore from "../../store/authStore";
import {
  getProfessionalDashboardStats,
  toggleProfessionalAvailability,
} from "../../services/statisticsService";
import {
  getAppointmentHistory,
  confirmAppointment,
  cancelAppointment,
} from "../../services/appointmentService";
import axiosInstance from "../../api/axios";

/* ─── Sub-components ───────────────────────────────────────────────────── */

const StarRating = ({ rating, size = 14 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) =>
      s <= Math.round(rating) ? (
        <RiStarFill
          key={s}
          className="text-[#f59e0b]"
          style={{ fontSize: size }}
        />
      ) : (
        <RiStarLine
          key={s}
          className="text-[#9ca3af]"
          style={{ fontSize: size }}
        />
      ),
    )}
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending: {
      bg: "bg-[#f59e0b]/15",
      text: "text-[#f59e0b]",
      label: "En attente",
    },
    confirmed: {
      bg: "bg-[#259ceb]/15",
      text: "text-[#259ceb]",
      label: "Confirmé",
    },
    cancelled: {
      bg: "bg-[#ef4444]/15",
      text: "text-[#ef4444]",
      label: "Annulé",
    },
    in_progress: {
      bg: "bg-[#8b5cf6]/15",
      text: "text-[#8b5cf6]",
      label: "En cours",
    },
    completed: {
      bg: "bg-[#10b981]/15",
      text: "text-[#10b981]",
      label: "Completé",
    },
  };
  const s = map[status] || map.pending;
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#e9effd] rounded-xl px-4 py-3 shadow-xl shadow-[#0b3c5d]/10">
      <p className="text-xs text-[#6b7280] mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <p
          key={p.dataKey}
          className="text-sm font-semibold"
          style={{ color: p.color }}>
          {p.name}: <span className="text-[#1f1f1f]">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white border border-[#e9effd] rounded-2xl p-5 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl bg-[#e9effd]" />
      <div className="w-12 h-5 rounded-full bg-[#e9effd]" />
    </div>
    <div className="w-16 h-8 bg-[#e9effd] rounded mb-2" />
    <div className="w-32 h-3 bg-[#e9effd] rounded mb-1" />
    <div className="w-24 h-3 bg-[#e9effd] rounded" />
  </div>
);

/* ─── Main Component ───────────────────────────────────────────────────── */

export default function Dashboard() {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState("year");
  const [isAvailable, setIsAvailable] = useState(false);
  const [availLoading, setAvailLoading] = useState(false);

  // Dashboard stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Recent appointments
  const [appointments, setAppointments] = useState([]);
  const [apptsLoading, setApptsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Recent reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Professional profile id (needed for reviews query)
  const professionalProfileId = user?.professional_profile?.id;
  const professionalName =
    user?.professional_profile?.full_name || "Professional";
  const firstName = professionalName.split(" ")[0];

  // ── Fetch dashboard stats ──
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const data = await getProfessionalDashboardStats();
      setStats(data);
      setIsAvailable(data.is_available);
    } catch (err) {
      setStatsError(
        "Impossible de charger les statistiques du tableau de bord",
      );
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch recent appointments ──
  const fetchAppointments = useCallback(async () => {
    try {
      setApptsLoading(true);
      const data = await getAppointmentHistory({ limit: 5 });
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setApptsLoading(false);
    }
  }, []);

  // ── Fetch recent reviews ──
  const fetchReviews = useCallback(async () => {
    if (!professionalProfileId) return;
    try {
      setReviewsLoading(true);
      const response = await axiosInstance.get("/reviews", {
        params: {
          target_type: "professional",
          target_id: professionalProfileId,
          limit: 4,
        },
      });
      setReviews(response.data.data?.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  }, [professionalProfileId]);

  useEffect(() => {
    fetchStats();
    fetchAppointments();
  }, [fetchStats, fetchAppointments]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ── Toggle availability ──
  const handleAvailabilityToggle = async (state) => {
    const newValue = state === "Ouvrir";
    setAvailLoading(true);
    try {
      await toggleProfessionalAvailability(newValue);
      setIsAvailable(newValue);
    } catch (err) {
      console.error("Error toggling availability:", err);
    } finally {
      setAvailLoading(false);
    }
  };

  // ── Confirm appointment ──
  const handleConfirm = async (id) => {
    setActionLoading(id);
    try {
      await confirmAppointment(id, {
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
        duration_minutes: 60,
        quoted_price_dzd: 5000,
      });
      fetchAppointments();
    } catch (err) {
      console.error("Error confirming:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Cancel appointment ──
  const handleCancel = async (id) => {
    setActionLoading(id);
    try {
      await cancelAppointment(id, {
        cancellation_reason: "Professional cancelled",
      });
      fetchAppointments();
    } catch (err) {
      console.error("Error cancelling:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Build stat cards ──
  const statCards = stats
    ? [
        {
          label: "Rendez-vous ce mois",
          value: String(stats.appointments_this_month),
          sub: `${stats.appointments_this_month - stats.appointments_prev_month >= 0 ? "+" : ""}${stats.appointments_this_month - stats.appointments_prev_month} par rapport au mois dernier`,
          trend: `${stats.month_trend >= 0 ? "+" : ""}${stats.month_trend}%`,
          up: stats.month_trend >= 0,
          icon: RiCalendarLine,
          color: "#2563eb",
        },
        {
          label: "Rendez-vous cette année",
          value: String(stats.appointments_this_year),
          sub: `${stats.appointments_this_year - stats.appointments_prev_year >= 0 ? "+" : ""}${stats.appointments_this_year - stats.appointments_prev_year} par rapport l'année dernière`,
          trend: `${stats.year_trend >= 0 ? "+" : ""}${stats.year_trend}%`,
          up: stats.year_trend >= 0,
          icon: RiArrowRightUpLine,
          color: "#259ceb",
        },
        {
          label: "Taux d'achèvement",
          value: `${stats.completion_rate}%`,
          sub: `${stats.completed_this_year} completés sur ${stats.appointments_this_year}`,
          trend: stats.completion_rate >= 80 ? "Bon" : "Bas",
          up: stats.completion_rate >= 80,
          icon: RiCheckLine,
          color: "#10b981",
        },
        {
          label: "Note globale",
          value: stats.rating_avg.toFixed(1),
          sub: `En fonction de ${stats.rating_count} avis`,
          isRating: true,
          icon: RiStarFill,
          color: "#f59e0b",
        },
      ]
    : [];

  const chartData = stats?.monthly_stats || [];

  // ── Format date for display ──
  const formatDate = (dateStr) => {
    if (!dateStr) return "Non planifié";
    const d = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === now.toDateString()) {
      return `Aujourd'hui, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (d.toDateString() === tomorrow.toDateString()) {
      return `Demain, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return d.toLocaleDateString("fr-FR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getClientName = (apt) =>
    apt.customer?.client_profile?.full_name || apt.customer?.phone || "Client";

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const now = new Date();
  const currentMonthYear = now.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#1f1f1f]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Tableau de bord
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Bienvenue, {firstName} — voici ce qui se passe aujourd'hui.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Availability toggle */}
          <div className="relative">
            {availLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl z-10">
                <RiLoader4Line className="animate-spin text-[#2563eb]" />
              </div>
            )}
            {["Ouvrir", "Fermer"].map((state) => (
              <button
                key={state}
                onClick={() => handleAvailabilityToggle(state)}
                disabled={availLoading}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                  ${
                    (isAvailable && state === "Ouvrir") ||
                    (!isAvailable && state === "Fermer")
                      ? "bg-[#2563eb] text-white shadow-sm"
                      : "text-[#6b7280] hover:text-[#1f1f1f]"
                  }`}>
                {state}
              </button>
            ))}
          </div>

          {/* Time range selector */}
          <div className="flex items-center bg-white border border-[#e9effd] rounded-xl p-1">
            {["week", "month", "year"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                  ${
                    timeRange === range
                      ? "bg-[#2563eb] text-white shadow-sm"
                      : "text-[#6b7280] hover:text-[#1f1f1f]"
                  }`}>
                {range === "week"
                  ? "Semaine"
                  : range === "month"
                    ? "Mois"
                    : "Année"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6b7280] bg-white border border-[#e9effd] rounded-xl px-4 py-2.5">
            <RiCalendarLine className="text-sm" />
            <span>{currentMonthYear}</span>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {statsError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {statsError}
          <button
            onClick={fetchStats}
            className="ml-2 underline hover:text-red-800">
            Réessayer
          </button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="bg-white border rounded-2xl p-5 relative overflow-hidden group hover:shadow-lg hover:shadow-[#0b3c5d]/5 hover:-translate-y-0.5 transition-all duration-200"
                  style={{ borderColor: `${card.color}30` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${card.color}15`,
                        color: card.color,
                      }}>
                      <Icon className="text-lg" />
                    </div>
                    {card.trend && (
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.up ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[#ef4444]/10 text-[#ef4444]"}`}>
                        {card.trend}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-3xl font-bold tracking-tight text-[#1f1f1f]"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {card.value}
                  </p>
                  {card.isRating && (
                    <StarRating rating={stats?.rating_avg || 0} size={13} />
                  )}
                  <p className="text-xs text-[#6b7280] mt-1.5">{card.label}</p>
                  <p className="text-[11px] text-[#9ca3af] mt-0.5">
                    {card.sub}
                  </p>
                </div>
              );
            })}
      </div>

      {/* ── Chart ── */}
      <div className="bg-white border border-[#e9effd] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-base font-bold text-[#1f1f1f]"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Statistiques des rendez-vous
            </h2>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Aperçu complet de l'année — {now.getFullYear()}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {[
              { color: "#2563eb", label: "Total" },
              { color: "#10b981", label: "Completé" },
              { color: "#ef4444", label: "Annulé" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-0.5 rounded-full"
                  style={{ backgroundColor: l.color }}
                />
                <span className="text-[#6b7280]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        {statsLoading ? (
          <div className="h-[240px] flex items-center justify-center">
            <RiLoader4Line className="animate-spin text-2xl text-[#2563eb]" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9effd" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#2563eb", strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                name="Completé"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#10b981", strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="cancelled"
                name="Annulé"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#ef4444", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-5 gap-4">
        {/* Recent Appointments */}
        <div className="col-span-3 bg-white border border-[#e9effd] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="text-base font-bold text-[#1f1f1f]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Demandes de rendez-vous récentes
              </h2>
              <p className="text-xs text-[#6b7280] mt-0.5">
                {appointments.filter((a) => a.status === "pending").length} en
                attente de votre confirmation
              </p>
            </div>
            <button className="text-xs text-[#2563eb] hover:text-[#173c8f] font-medium transition-colors">
              Voir tous →
            </button>
          </div>
          <div className="space-y-3">
            {apptsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl bg-[#f8fafc] animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-[#e9effd]" />
                  <div className="flex-1">
                    <div className="w-28 h-4 bg-[#e9effd] rounded mb-1" />
                    <div className="w-20 h-3 bg-[#e9effd] rounded" />
                  </div>
                  <div className="w-20 h-5 bg-[#e9effd] rounded-full" />
                </div>
              ))
            ) : appointments.length === 0 ? (
              <p className="text-sm text-[#9ca3af] text-center py-8">
                Aucun rendez-vous récent
              </p>
            ) : (
              appointments.map((apt) => {
                const clientName = getClientName(apt);
                const initials = getInitials(clientName);
                return (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-[#f8fafc] hover:bg-[#e9effd]/50 border border-[#e9effd]/60 transition-all group">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563eb]/20 to-[#0b3c5d]/20 flex items-center justify-center text-xs font-bold text-[#2563eb] flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate text-[#1f1f1f]">
                          {clientName}
                        </p>
                        <span className="text-[10px] text-[#9ca3af]">
                          #{apt.id.slice(-4).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-[#6b7280] truncate">
                        {apt.service_type}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-[#6b7280] mb-1.5">
                        {formatDate(apt.scheduled_at || apt.created_at)}
                      </p>
                      <StatusBadge status={apt.status} />
                    </div>
                    {apt.status === "pending" && (
                      <div className="hidden group-hover:flex items-center gap-1 ml-1">
                        <button
                          onClick={() => handleConfirm(apt.id)}
                          disabled={actionLoading === apt.id}
                          className="w-7 h-7 rounded-lg bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20 flex items-center justify-center transition-colors disabled:opacity-50">
                          {actionLoading === apt.id ? (
                            <RiLoader4Line className="animate-spin text-xs" />
                          ) : (
                            <RiCheckLine className="text-xs" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCancel(apt.id)}
                          disabled={actionLoading === apt.id}
                          className="w-7 h-7 rounded-lg bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 flex items-center justify-center transition-colors disabled:opacity-50">
                          <RiCloseLine className="text-xs" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="col-span-2 bg-white border border-[#e9effd] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="text-base font-bold text-[#1f1f1f]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Avis récents
              </h2>
              <p className="text-xs text-[#6b7280] mt-0.5">
                {stats
                  ? `Moy. ${stats.rating_avg.toFixed(1)} ⭐ sur ${stats.rating_count} avis`
                  : "Chargement..."}
              </p>
            </div>
            <button className="text-xs text-[#2563eb] hover:text-[#173c8f] font-medium transition-colors">
              Voir tous →
            </button>
          </div>
          <div className="space-y-4">
            {reviewsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#f8fafc] animate-pulse">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#e9effd]" />
                    <div className="flex-1">
                      <div className="w-24 h-3 bg-[#e9effd] rounded" />
                    </div>
                  </div>
                  <div className="w-full h-8 bg-[#e9effd] rounded" />
                </div>
              ))
            ) : reviews.length === 0 ? (
              <p className="text-sm text-[#9ca3af] text-center py-8">
                Aucun avis pour le moment
              </p>
            ) : (
              reviews.map((review) => {
                const reviewerName =
                  review.author?.client_profile?.full_name || "Anonymous";
                const initials = getInitials(reviewerName);
                const timeAgo = getTimeAgo(review.created_at);
                return (
                  <div
                    key={review.id}
                    className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e9effd]/60 hover:bg-[#e9effd]/30 transition-all">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563eb]/20 to-[#0b3c5d]/20 flex items-center justify-center text-[10px] font-bold text-[#2563eb] flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-none truncate text-[#1f1f1f]">
                          {reviewerName}
                        </p>
                        <p className="text-[10px] text-[#9ca3af] mt-0.5">
                          {timeAgo}
                        </p>
                      </div>
                      <StarRating rating={review.rating} size={12} />
                    </div>
                    {review.comment && (
                      <p className="text-xs text-[#6b7280] leading-relaxed line-clamp-2">
                        {review.comment}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function getTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "A l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}m`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
}
