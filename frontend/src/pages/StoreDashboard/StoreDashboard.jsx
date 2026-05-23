import React, { useState, useEffect, useCallback } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  RiCalendarLine,
  RiArrowRightUpLine,
  RiCheckLine,
  RiCloseLine,
  RiStarFill,
  RiStarLine,
  RiLoader4Line,
  RiStore2Line,
  RiShoppingBag3Line,
  RiGroupLine,
} from "react-icons/ri";
import useAuthStore from "../../store/authStore";
import { getStoreDashboardStats } from "../../services/statisticsService";
import { getOrderHistory } from "../../services/orderService";
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
    processing: {
      bg: "bg-[#8b5cf6]/15",
      text: "text-[#8b5cf6]",
      label: "En traitement",
    },
    shipped: {
      bg: "bg-[#3b82f6]/15",
      text: "text-[#3b82f6]",
      label: "Expédié",
    },
    delivered: {
      bg: "bg-[#10b981]/15",
      text: "text-[#10b981]",
      label: "Livré",
    },
    cancelled: {
      bg: "bg-[#ef4444]/15",
      text: "text-[#ef4444]",
      label: "Annulé",
    },
    refunded: {
      bg: "bg-[#64748b]/15",
      text: "text-[#64748b]",
      label: "Remboursé",
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
          {p.name}: <span className="text-[#1f1f1f]">
            {p.value} {p.name === "Revenus" ? "DZD" : ""}
          </span>
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

export default function StoreDashboard() {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState("year");

  // Dashboard stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Recent orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Recent reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Store profile id (needed for reviews query)
  const storeProfileId = user?.store_profile?.id;
  const storeName = user?.store_profile?.store_name || "Magasin";
  const ownerName = user?.store_profile?.owner_name || "Propriétaire";
  const firstName = ownerName.split(" ")[0];

  // ── Fetch dashboard stats ──
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const data = await getStoreDashboardStats();
      setStats(data);
    } catch (err) {
      setStatsError(
        "Impossible de charger les statistiques du tableau de bord",
      );
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch recent orders ──
  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const data = await getOrderHistory({ limit: 5 });
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // ── Fetch recent reviews ──
  const fetchReviews = useCallback(async () => {
    if (!storeProfileId) return;
    try {
      setReviewsLoading(true);
      const response = await axiosInstance.get("/reviews", {
        params: {
          target_type: "store",
          target_id: storeProfileId,
          limit: 4,
        },
      });
      setReviews(response.data.data?.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  }, [storeProfileId]);

  useEffect(() => {
    fetchStats();
    fetchOrders();
  }, [fetchStats, fetchOrders]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ── Build stat cards ──
  const statCards = stats
    ? [
        {
          label: "Clients",
          value: String(stats.total_clients),
          sub: "Clients uniques cette année",
          trend: "",
          up: true,
          icon: RiGroupLine,
          color: "#8b5cf6",
        },
        {
          label: "Pièces actives",
          value: String(stats.total_parts),
          sub: "En ligne sur le magasin",
          trend: "",
          up: true,
          icon: RiStore2Line,
          color: "#2563eb",
        },
        {
          label: "Commandes cette année",
          value: String(stats.orders_this_year),
          sub: `${stats.orders_this_year - stats.orders_prev_year >= 0 ? "+" : ""}${stats.orders_this_year - stats.orders_prev_year} par rapport l'année dernière`,
          trend: `${stats.year_trend >= 0 ? "+" : ""}${stats.year_trend}%`,
          up: stats.year_trend >= 0,
          icon: RiShoppingBag3Line,
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
    if (!dateStr) return "Inconnu";
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

  const getClientName = (ord) =>
    ord.customer?.client_profile?.full_name || ord.customer?.phone || "Client";

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
            Tableau de bord du Magasin
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Bienvenue, {firstName} — voici les statistiques de {storeName}.
          </p>
        </div>
        <div className="flex items-center gap-3">
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
              Statistiques des commandes et revenus
            </h2>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Aperçu complet de l'année — {now.getFullYear()}
            </p>
          </div>
        </div>
        {statsLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <RiLoader4Line className="animate-spin text-2xl text-[#2563eb]" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid stroke="#f5f5f5" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
              <Bar yAxisId="left" dataKey="total" name="Commandes" barSize={20} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="completed" name="Completé" barSize={20} fill="#10b981" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenus" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-5 gap-4">
        {/* Recent Orders */}
        <div className="col-span-3 bg-white border border-[#e9effd] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="text-base font-bold text-[#1f1f1f]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Commandes récentes
              </h2>
              <p className="text-xs text-[#6b7280] mt-0.5">
                Dernières commandes enregistrées
              </p>
            </div>
            <button className="text-xs text-[#2563eb] hover:text-[#173c8f] font-medium transition-colors">
              Voir tous →
            </button>
          </div>
          <div className="space-y-3">
            {ordersLoading ? (
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
            ) : orders.length === 0 ? (
              <p className="text-sm text-[#9ca3af] text-center py-8">
                Aucune commande récente
              </p>
            ) : (
              orders.map((ord) => {
                const clientName = getClientName(ord);
                const initials = getInitials(clientName);
                return (
                  <div
                    key={ord.id}
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
                          #{ord.order_number}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#10b981] truncate">
                        {ord.total_dzd} DZD
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-[#6b7280] mb-1.5">
                        {formatDate(ord.created_at)}
                      </p>
                      <StatusBadge status={ord.status} />
                    </div>
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
                  review.author?.client_profile?.full_name || "Anonyme";
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
