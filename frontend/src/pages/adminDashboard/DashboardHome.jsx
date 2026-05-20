import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Store,
  Briefcase,
  Package,
  Calendar,
  ShoppingCart,
  TrendingUp,
  Loader,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { getDashboardOverview } from "../../services/adminService";

/* ─── Sub-components ───────────────────────────────────────────────────── */

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

const StatCard = ({ label, value, trend, icon: Icon, color, isLoading }) => {
  const isPositive = trend >= 0;
  return (
    <div
      className="bg-white border rounded-2xl p-5 relative overflow-hidden group hover:shadow-lg hover:shadow-[#0b3c5d]/5 hover:-translate-y-0.5 transition-all duration-200"
      style={{ borderColor: `${color}30` }}>
      {isLoading ? (
        <>
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#e9effd] animate-pulse" />
            <div className="w-12 h-5 rounded-full bg-[#e9effd] animate-pulse" />
          </div>
          <div className="w-16 h-8 bg-[#e9effd] rounded mb-2 animate-pulse" />
          <div className="w-32 h-3 bg-[#e9effd] rounded animate-pulse" />
        </>
      ) : (
        <>
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}15`, color: color }}>
              <Icon className="text-lg" />
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isPositive
                  ? "bg-[#10b981]/10 text-[#10b981]"
                  : "bg-[#ef4444]/10 text-[#ef4444]"
              }`}>
              {isPositive ? (
                <ArrowUpRight size={12} />
              ) : (
                <ArrowDownRight size={12} />
              )}
              {Math.abs(trend)}%
            </span>
          </div>
          <p
            className="text-3xl font-bold tracking-tight text-[#1f1f1f]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <p className="text-xs text-[#6b7280] mt-1.5">{label}</p>
        </>
      )}
    </div>
  );
};

/* ─── Main Component ───────────────────────────────────────────────────── */

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Charts data
  const [ordersChart, setOrdersChart] = useState([]);
  const [appointmentsChart, setAppointmentsChart] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  // Recent data
  const [recentClients, setRecentClients] = useState([]);
  const [recentStores, setRecentStores] = useState([]);
  const [recentPros, setRecentPros] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  // ── Fetch dashboard overview ──
  const fetchOverview = useCallback(async () => {
    try {
      setStatsLoading(true);
      setChartsLoading(true);
      setRecentLoading(true);
      setStatsError(null);

      const dashboardData = await getDashboardOverview();

      setStats(dashboardData.stats);
      setOrdersChart(dashboardData.charts.orders);
      setAppointmentsChart(dashboardData.charts.appointments);
      setRecentClients(dashboardData.recent.recentClients || []);
      setRecentStores(dashboardData.recent.recentStores || []);
      setRecentPros(dashboardData.recent.recentPros || []);

    } catch (err) {
      setStatsError("Failed to load dashboard statistics");
      console.error(err);
    } finally {
      setStatsLoading(false);
      setChartsLoading(false);
      setRecentLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const now = new Date();
  const currentYear = now.getFullYear();

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Page title */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight text-[#1f1f1f]"
          style={{ fontFamily: "'Montserrat', sans-serif" }}>
          Dashboard
        </h1>
        <p className="text-sm text-[#6b7280] mt-0.5">
          Overview of your platform's performance and key metrics
        </p>
      </div>

      {/* ── Stat Cards ── */}
      {statsError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {statsError}
          <button
            onClick={fetchOverview}
            className="ml-2 underline hover:text-red-800">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Clients"
          value={stats?.totalClients || 0}
          trend={stats?.clientsTrend || 0}
          icon={Users}
          color="#2563eb"
          isLoading={statsLoading}
        />
        <StatCard
          label="Total Stores"
          value={stats?.totalStores || 0}
          trend={stats?.storesTrend || 0}
          icon={Store}
          color="#f59e0b"
          isLoading={statsLoading}
        />
        <StatCard
          label="Total Professionals"
          value={stats?.totalProfessionals || 0}
          trend={stats?.prosTrend || 0}
          icon={Briefcase}
          color="#8b5cf6"
          isLoading={statsLoading}
        />
        <StatCard
          label="Total Parts"
          value={stats?.totalParts || 0}
          trend={stats?.partsTrend || 0}
          icon={Package}
          color="#10b981"
          isLoading={statsLoading}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Orders Chart */}
        <div className="bg-white border border-[#e9effd] rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h2
              className="text-base font-bold text-[#1f1f1f]"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Orders Overview
            </h2>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Order counts by status — {currentYear}
            </p>
          </div>
          {chartsLoading ? (
            <div className="h-[240px] flex items-center justify-center">
              <Loader className="animate-spin text-2xl text-[#2563eb]" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={ordersChart}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9effd" />
                <XAxis
                  dataKey="name"
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
                <Legend wrapperStyle={{ paddingTop: "12px" }} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" />
                <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Appointments Chart */}
        <div className="bg-white border border-[#e9effd] rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h2
              className="text-base font-bold text-[#1f1f1f]"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Appointments Overview
            </h2>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Appointment counts by status — {currentYear}
            </p>
          </div>
          {chartsLoading ? (
            <div className="h-[240px] flex items-center justify-center">
              <Loader className="animate-spin text-2xl text-[#2563eb]" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart
                data={appointmentsChart}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9effd" />
                <XAxis
                  dataKey="name"
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
                <Legend wrapperStyle={{ paddingTop: "12px" }} />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  name="Pending"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="cancelled"
                  name="Cancelled"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Recent Data Row ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Clients */}
        <div className="bg-white border border-[#e9effd] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="text-base font-bold text-[#1f1f1f]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Recent Clients
              </h2>
              <p className="text-xs text-[#6b7280] mt-0.5">
                Latest registrations
              </p>
            </div>
            <button className="text-xs text-[#2563eb] hover:text-[#173c8f] font-medium transition-colors">
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {recentLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-[#e9effd]" />
                  <div className="flex-1">
                    <div className="w-24 h-3 bg-[#e9effd] rounded mb-1" />
                    <div className="w-16 h-2 bg-[#e9effd] rounded" />
                  </div>
                </div>
              ))
            ) : recentClients.length === 0 ? (
              <p className="text-sm text-[#9ca3af] text-center py-8">
                No recent clients
              </p>
            ) : (
              recentClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] hover:bg-[#e9effd]/50 border border-[#e9effd]/60 transition-all">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563eb]/20 to-[#0b3c5d]/20 flex items-center justify-center text-xs font-bold text-[#2563eb] flex-shrink-0">
                    {client.client_profile?.full_name?.[0] || "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-[#1f1f1f]">
                      {client.client_profile?.full_name || client.email}
                    </p>
                    <p className="text-xs text-[#6b7280] truncate">
                      {client.email}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Stores */}
        <div className="bg-white border border-[#e9effd] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="text-base font-bold text-[#1f1f1f]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Recent Stores
              </h2>
              <p className="text-xs text-[#6b7280] mt-0.5">Latest additions</p>
            </div>
            <button className="text-xs text-[#2563eb] hover:text-[#173c8f] font-medium transition-colors">
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {recentLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-[#e9effd]" />
                  <div className="flex-1">
                    <div className="w-24 h-3 bg-[#e9effd] rounded mb-1" />
                    <div className="w-16 h-2 bg-[#e9effd] rounded" />
                  </div>
                </div>
              ))
            ) : recentStores.length === 0 ? (
              <p className="text-sm text-[#9ca3af] text-center py-8">
                No recent stores
              </p>
            ) : (
              recentStores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] hover:bg-[#e9effd]/50 border border-[#e9effd]/60 transition-all">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f59e0b]/20 to-[#d97706]/20 flex items-center justify-center text-xs font-bold text-[#f59e0b] flex-shrink-0">
                    {store.store_name?.[0] || "S"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-[#1f1f1f]">
                      {store.store_name || "Unknown Store"}
                    </p>
                    <p className="text-xs text-[#6b7280] truncate">
                      {store.location || store.wilaya || "No location"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Professionals */}
        <div className="bg-white border border-[#e9effd] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="text-base font-bold text-[#1f1f1f]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Recent Professionals
              </h2>
              <p className="text-xs text-[#6b7280] mt-0.5">
                Latest registrations
              </p>
            </div>
            <button className="text-xs text-[#2563eb] hover:text-[#173c8f] font-medium transition-colors">
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {recentLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-[#e9effd]" />
                  <div className="flex-1">
                    <div className="w-24 h-3 bg-[#e9effd] rounded mb-1" />
                    <div className="w-16 h-2 bg-[#e9effd] rounded" />
                  </div>
                </div>
              ))
            ) : recentPros.length === 0 ? (
              <p className="text-sm text-[#9ca3af] text-center py-8">
                No recent professionals
              </p>
            ) : (
              recentPros.map((pro) => (
                <div
                  key={pro.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] hover:bg-[#e9effd]/50 border border-[#e9effd]/60 transition-all">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b5cf6]/20 to-[#6d28d9]/20 flex items-center justify-center text-xs font-bold text-[#8b5cf6] flex-shrink-0">
                    {pro.full_name?.[0] || "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-[#1f1f1f]">
                      {pro.full_name || pro.user?.email || "Unknown Pro"}
                    </p>
                    <p className="text-xs text-[#6b7280] truncate">
                      {pro.specialty_type || "Specialist"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
