import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiSearchLine, RiCloseLine, RiCheckLine, RiLoader4Line,
  RiCalendarLine, RiTimeLine, RiMoneyDollarCircleLine,
  RiFileTextLine, RiArrowRightLine, RiCarLine, RiUserLine,
  RiPhoneLine, RiMailLine, RiMapPinLine,
} from "react-icons/ri";
import { getAppointmentHistory, confirmAppointment, cancelAppointment } from "../../services/appointmentService";

/* ─── Status config ────────────────────────────────────────────────────── */

const STATUSES = [
  { key: "all",         label: "All" },
  { key: "pending",     label: "Pending",     color: "#f59e0b" },
  { key: "confirmed",   label: "Confirmed",   color: "#259ceb" },
  { key: "in_progress", label: "In Progress", color: "#8b5cf6" },
  { key: "completed",   label: "Completed",   color: "#10b981" },
  { key: "cancelled",   label: "Cancelled",   color: "#ef4444" },
];

const StatusBadge = ({ status }) => {
  const s = STATUSES.find((st) => st.key === status) || STATUSES[1];
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: `${s.color}15`, color: s.color }}
    >
      {s.label}
    </span>
  );
};

/* ─── Helpers ──────────────────────────────────────────────────────────── */

const getClientName = (apt) =>
  apt.customer?.client_profile?.full_name || apt.customer?.phone || "Client";

const getInitials = (name) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const getVehicleInfo = (apt) => {
  if (!apt.vehicle) return "-";
  return `${apt.vehicle.brand?.name || ""} ${apt.vehicle.model?.name || ""}`.trim() || "-";
};

/* ─── Main Component ───────────────────────────────────────────────────── */

export default function AppointmentPro() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [selectedApt, setSelectedApt] = useState(null);
  const [modalStep, setModalStep] = useState(1); // 1 = review, 2 = accept form
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmForm, setConfirmForm] = useState({
    scheduled_at: "",
    duration_minutes: 60,
    quoted_price_dzd: "",
    confirmation_note: "",
  });

  // ── Fetch ──
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (activeFilter !== "all") params.status = activeFilter;
      const data = await getAppointmentHistory(params);
      setAppointments(data.appointments || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, page]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => { setPage(1); }, [activeFilter]);

  // ── Filter by search ──
  const filtered = appointments.filter((apt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = getClientName(apt).toLowerCase();
    const vehicle = getVehicleInfo(apt).toLowerCase();
    const service = (apt.service_type || "").toLowerCase();
    return name.includes(q) || vehicle.includes(q) || service.includes(q);
  });

  // ── Actions ──
  const handleAccept = async () => {
    if (!selectedApt || !confirmForm.scheduled_at || !confirmForm.quoted_price_dzd) return;
    setActionLoading(true);
    try {
      await confirmAppointment(selectedApt.id, {
        scheduled_at: new Date(confirmForm.scheduled_at).toISOString(),
        duration_minutes: Number(confirmForm.duration_minutes),
        quoted_price_dzd: Number(confirmForm.quoted_price_dzd),
        confirmation_note: confirmForm.confirmation_note || undefined,
      });
      closeModal();
      fetchAppointments();
    } catch (err) {
      console.error("Error confirming:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefuse = async () => {
    if (!selectedApt) return;
    setActionLoading(true);
    try {
      await cancelAppointment(selectedApt.id, { cancellation_reason: "Professional declined the request" });
      closeModal();
      fetchAppointments();
    } catch (err) {
      console.error("Error refusing:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (apt) => {
    setSelectedApt(apt);
    setModalStep(1);
    setConfirmForm({ scheduled_at: "", duration_minutes: 60, quoted_price_dzd: "", confirmation_note: "" });
  };

  const closeModal = () => {
    setSelectedApt(null);
    setModalStep(1);
  };

  return (
    <div className="px-6 py-6 space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1f1f1f]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          Appointments
        </h1>
        <p className="text-sm text-[#6b7280] mt-0.5">
          Manage your appointment requests and schedule
        </p>
      </div>

      {/* ── Filters + Search ── */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Status tabs */}
        <div className="flex items-center bg-white border border-[#e9effd] rounded-xl p-1 gap-0.5">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveFilter(s.key)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all
                ${activeFilter === s.key
                  ? "bg-[#2563eb] text-white shadow-sm"
                  : "text-[#6b7280] hover:text-[#1f1f1f] hover:bg-[#f5f7fa]"
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs ml-auto">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search by name, vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#e9effd] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1f1f1f] placeholder-[#9ca3af] focus:outline-none focus:border-[#2563eb]/50 transition-all"
          />
        </div>

        <p className="text-xs text-[#9ca3af]">{total} total</p>
      </div>

      {/* ── Appointments Table ── */}
      <div className="bg-white border border-[#e9effd] rounded-2xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_1fr_auto] gap-4 px-6 py-3 border-b border-[#e9effd] text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
          <span>Client</span>
          <span>Requested</span>
          <span>Scheduled</span>
          <span>Vehicle</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {/* Rows */}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_1fr_auto] gap-4 px-6 py-4 border-b border-[#e9effd]/60 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#e9effd]" />
                <div><div className="w-24 h-3.5 bg-[#e9effd] rounded mb-1" /><div className="w-16 h-3 bg-[#e9effd] rounded" /></div>
              </div>
              <div className="w-28 h-3.5 bg-[#e9effd] rounded self-center" />
              <div className="w-28 h-3.5 bg-[#e9effd] rounded self-center" />
              <div className="w-24 h-3.5 bg-[#e9effd] rounded self-center" />
              <div className="w-20 h-5 bg-[#e9effd] rounded-full self-center" />
              <div className="w-16 h-8 bg-[#e9effd] rounded-lg self-center" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <RiCalendarLine className="text-4xl text-[#d1d5db] mx-auto mb-3" />
            <p className="text-sm text-[#9ca3af]">No appointments found</p>
          </div>
        ) : (
          filtered.map((apt) => {
            const clientName = getClientName(apt);
            const initials = getInitials(clientName);
            return (
              <div
                key={apt.id}
                className="grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_1fr_auto] gap-4 px-6 py-4 border-b border-[#e9effd]/60 hover:bg-[#f8fafc] transition-colors items-center"
              >
                {/* Client */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563eb]/20 to-[#0b3c5d]/20 flex items-center justify-center text-xs font-bold text-[#2563eb] flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-[#1f1f1f]">{clientName}</p>
                    <p className="text-xs text-[#9ca3af] truncate">{apt.service_type}</p>
                  </div>
                </div>

                {/* Requested date */}
                <p className="text-xs text-[#6b7280]">{formatDate(apt.created_at)}</p>

                {/* Scheduled date */}
                <p className={`text-xs ${apt.scheduled_at ? "text-[#1f1f1f] font-medium" : "text-[#d1d5db]"}`}>
                  {formatDate(apt.scheduled_at)}
                </p>

                {/* Vehicle */}
                <p className="text-xs text-[#6b7280]">{getVehicleInfo(apt)}</p>

                {/* Status */}
                <StatusBadge status={apt.status} />

                {/* Action */}
                {apt.status === "pending" ? (
                  <button
                    onClick={() => openModal(apt)}
                    className="px-3.5 py-2 rounded-lg text-xs font-medium bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors shadow-sm"
                  >
                    Review
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/pro/appointments/${apt.id}`)}
                    className="px-3.5 py-2 rounded-lg text-xs font-medium bg-[#f5f7fa] text-[#6b7280] hover:bg-[#e9effd] hover:text-[#1f1f1f] transition-colors flex items-center gap-1"
                  >
                    Details <RiArrowRightLine />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#e9effd] text-[#6b7280] hover:bg-[#e9effd] disabled:opacity-40 transition-all"
          >
            Previous
          </button>
          <span className="text-xs text-[#6b7280]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#e9effd] text-[#6b7280] hover:bg-[#e9effd] disabled:opacity-40 transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* ─── Review Modal ─── */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={closeModal}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e9effd]">
              <div>
                <h2 className="text-base font-bold text-[#1f1f1f]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {modalStep === 1 ? "Appointment Request" : "Set Appointment Details"}
                </h2>
                <p className="text-xs text-[#9ca3af] mt-0.5">
                  {modalStep === 1 ? "Review this request" : "Step 2 — Schedule & pricing"}
                </p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg bg-[#f5f7fa] flex items-center justify-center text-[#6b7280] hover:text-[#1f1f1f] transition-colors">
                <RiCloseLine className="text-lg" />
              </button>
            </div>

            {modalStep === 1 ? (
              /* ── Step 1: Review ── */
              <div className="px-6 py-5 space-y-5">
                {/* Client info */}
                <div>
                  <h3 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">Client Information</h3>
                  <div className="bg-[#f8fafc] border border-[#e9effd]/60 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563eb]/20 to-[#0b3c5d]/20 flex items-center justify-center text-sm font-bold text-[#2563eb]">
                        {getInitials(getClientName(selectedApt))}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1f1f1f]">{getClientName(selectedApt)}</p>
                        <p className="text-xs text-[#9ca3af]">Client</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-[#6b7280]">
                        <RiPhoneLine /> {selectedApt.customer?.phone || "-"}
                      </div>
                      <div className="flex items-center gap-1.5 text-[#6b7280]">
                        <RiMailLine /> {selectedApt.customer?.email || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle info */}
                {selectedApt.vehicle && (
                  <div>
                    <h3 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">Vehicle</h3>
                    <div className="bg-[#f8fafc] border border-[#e9effd]/60 rounded-xl p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb]">
                          <RiCarLine className="text-lg" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1f1f1f]">{getVehicleInfo(selectedApt)}</p>
                          <p className="text-xs text-[#9ca3af]">{selectedApt.vehicle.year || ""}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appointment info */}
                <div>
                  <h3 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">Request Details</h3>
                  <div className="bg-[#f8fafc] border border-[#e9effd]/60 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="font-medium text-[#6b7280] w-24 flex-shrink-0">Service:</span>
                      <span className="text-[#1f1f1f]">{selectedApt.service_type}</span>
                    </div>
                    {selectedApt.description && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="font-medium text-[#6b7280] w-24 flex-shrink-0">Description:</span>
                        <span className="text-[#1f1f1f]">{selectedApt.description}</span>
                      </div>
                    )}
                    {selectedApt.location_address && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="font-medium text-[#6b7280] w-24 flex-shrink-0">Location:</span>
                        <span className="text-[#1f1f1f]">{selectedApt.location_address}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-sm">
                      <span className="font-medium text-[#6b7280] w-24 flex-shrink-0">Requested:</span>
                      <span className="text-[#1f1f1f]">{formatDate(selectedApt.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleRefuse}
                    disabled={actionLoading}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border-2 border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/5 transition-all disabled:opacity-50"
                  >
                    {actionLoading ? "..." : "Refuse"}
                  </button>
                  <button
                    onClick={() => setModalStep(2)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-lg shadow-[#2563eb]/20 transition-all"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ) : (
              /* ── Step 2: Set appointment details ── */
              <div className="px-6 py-5 space-y-4">
                {/* Date & Time */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[#1f1f1f] mb-1.5">
                    <RiCalendarLine className="text-[#2563eb]" /> Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={confirmForm.scheduled_at}
                    onChange={(e) => setConfirmForm({ ...confirmForm, scheduled_at: e.target.value })}
                    min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
                    className="w-full border border-[#e9effd] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]/50 transition-all"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[#1f1f1f] mb-1.5">
                    <RiTimeLine className="text-[#2563eb]" /> Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={confirmForm.duration_minutes}
                    onChange={(e) => setConfirmForm({ ...confirmForm, duration_minutes: e.target.value })}
                    className="w-full border border-[#e9effd] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]/50 transition-all"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[#1f1f1f] mb-1.5">
                    <RiMoneyDollarCircleLine className="text-[#2563eb]" /> Quoted Price (DZD) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={confirmForm.quoted_price_dzd}
                    onChange={(e) => setConfirmForm({ ...confirmForm, quoted_price_dzd: e.target.value })}
                    placeholder="e.g. 5000"
                    className="w-full border border-[#e9effd] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]/50 transition-all"
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[#1f1f1f] mb-1.5">
                    <RiFileTextLine className="text-[#2563eb]" /> Note (optional)
                  </label>
                  <textarea
                    value={confirmForm.confirmation_note}
                    onChange={(e) => setConfirmForm({ ...confirmForm, confirmation_note: e.target.value })}
                    placeholder="Any message for the client..."
                    rows={3}
                    className="w-full border border-[#e9effd] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]/50 transition-all resize-none"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setModalStep(1)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border border-[#e9effd] text-[#6b7280] hover:bg-[#f5f7fa] transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={actionLoading || !confirmForm.scheduled_at || !confirmForm.quoted_price_dzd}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold bg-[#10b981] text-white hover:bg-[#059669] shadow-lg shadow-[#10b981]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <RiLoader4Line className="animate-spin" /> : <RiCheckLine />}
                    Confirm Appointment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
