import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiLoader4Line,
  RiCalendarLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiPhoneLine,
  RiMailLine,
  RiCarLine,
  RiStarFill,
  RiStarLine,
  RiMapPinLine,
  RiCheckLine,
  RiPlayLine,
  RiFileTextLine,
} from "react-icons/ri";
import {
  getAppointmentById,
  startAppointment,
  completeAppointment,
} from "../../services/appointmentService";
import { collectCodPayment } from "../../services/paymentService";

/* ─── Status config ────────────────────────────────────────────────────── */

const STATUS_MAP = {
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
  cancelled: { bg: "bg-[#ef4444]/15", text: "text-[#ef4444]", label: "Annulé" },
};

const StarRating = ({ rating, size = 16 }) => (
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

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5">
    <div className="w-8 h-8 rounded-lg bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb] flex-shrink-0 mt-0.5">
      <Icon className="text-sm" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-[#9ca3af] font-medium">{label}</p>
      <p className="text-sm text-[#1f1f1f] mt-0.5">{value || "-"}</p>
    </div>
  </div>
);

/* ─── Main Component ───────────────────────────────────────────────────── */

export default function AppointmentDetailsPro() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apt, setApt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [completeForm, setCompleteForm] = useState({
    final_price_dzd: "",
    completion_notes: "",
  });
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getAppointmentById(id);
        setApt(data);
      } catch (err) {
        console.error("Error fetching appointment:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleStart = async () => {
    setActionLoading(true);
    try {
      const updated = await startAppointment(id);
      setApt(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!completeForm.final_price_dzd) return;
    setActionLoading(true);
    try {
      const updated = await completeAppointment(id, {
        final_price_dzd: Number(completeForm.final_price_dzd),
        completion_notes: completeForm.completion_notes || undefined,
      });
      setApt(updated);
      setShowComplete(false);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCollectCash = async () => {
    if (!apt.payment) return;
    setActionLoading(true);
    try {
      await collectCodPayment(apt.payment.id);
      // Refresh appointment to get updated payment status
      const data = await getAppointmentById(id);
      setApt(data);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RiLoader4Line className="animate-spin text-3xl text-[#2563eb]" />
      </div>
    );
  }

  if (!apt) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-[#9ca3af]">Rendez-vous non trouvé</p>
        <button
          onClick={() => navigate("/pro/appointments")}
          title="Retour"
          className="mt-3 p-2 mx-auto rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition flex items-center justify-center w-fit">
          <RiArrowLeftLine className="text-xl" />
        </button>
      </div>
    );
  }

  const clientName =
    apt.customer?.client_profile?.full_name || apt.customer?.phone || "Client";
  const initials = clientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const status = STATUS_MAP[apt.status] || STATUS_MAP.pending;
  const review = apt.reviews?.length ? apt.reviews[0] : null;

  return (
    <div className="px-6 py-6 space-y-6 max-w-4xl">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/pro/appointments")}
          className="w-10 h-10 rounded-xl bg-white border border-[#e9effd] flex items-center justify-center text-[#6b7280] hover:text-[#1f1f1f] hover:border-[#2563eb]/30 transition-all">
          <RiArrowLeftLine className="text-lg" />
        </button>
        <div className="flex-1">
          <h1
            className="text-xl font-bold tracking-tight text-[#1f1f1f]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Détails du rendez-vous
          </h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            #{apt.id.slice(-8).toUpperCase()}
          </p>
        </div>
        <span
          className={`text-sm font-semibold px-4 py-2 rounded-full ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* ── Left: Appointment Info ── */}
        <div className="space-y-5">
          {/* Service details */}
          <div className="bg-white border border-[#e9effd] rounded-2xl p-5 shadow-sm">
            <h2
              className="text-sm font-bold text-[#1f1f1f] mb-3"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Détails du service
            </h2>
            <InfoRow
              icon={RiFileTextLine}
              label="Type de service"
              value={apt.service_type}
            />
            {apt.description && (
              <InfoRow
                icon={RiFileTextLine}
                label="Description"
                value={apt.description}
              />
            )}
            {apt.location_address && (
              <InfoRow
                icon={RiMapPinLine}
                label="Localisation"
                value={apt.location_address}
              />
            )}
            <InfoRow
              icon={RiCalendarLine}
              label="Demandé le"
              value={formatDate(apt.created_at)}
            />
          </div>

          {/* Schedule & Pricing */}
          <div className="bg-white border border-[#e9effd] rounded-2xl p-5 shadow-sm">
            <h2
              className="text-sm font-bold text-[#1f1f1f] mb-3"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Horaire et tarifs
            </h2>
            <InfoRow
              icon={RiCalendarLine}
              label="Prévu pour"
              value={formatDate(apt.scheduled_at)}
            />
            <InfoRow
              icon={RiTimeLine}
              label="Durée"
              value={
                apt.duration_minutes ? `${apt.duration_minutes} minutes` : "-"
              }
            />
            <InfoRow
              icon={RiMoneyDollarCircleLine}
              label="Prix devis"
              value={
                apt.quoted_price_dzd
                  ? `${Number(apt.quoted_price_dzd).toLocaleString()} DZD`
                  : "-"
              }
            />
            {apt.final_price_dzd && (
              <InfoRow
                icon={RiMoneyDollarCircleLine}
                label="Prix final"
                value={`${Number(apt.final_price_dzd).toLocaleString()} DZD`}
              />
            )}
            {apt.confirmation_note && (
              <InfoRow
                icon={RiFileTextLine}
                label="Note de confirmation"
                value={apt.confirmation_note}
              />
            )}
            {apt.completion_notes && (
              <InfoRow
                icon={RiFileTextLine}
                label="Notes de fin"
                value={apt.completion_notes}
              />
            )}
            {apt.completed_at && (
              <InfoRow
                icon={RiCalendarLine}
                label="Completé le"
                value={formatDate(apt.completed_at)}
              />
            )}
            {apt.status === "completed" && !apt.payment_collected && (
              <div className="flex items-center gap-2 mt-2 text-xs text-[#ef4444] font-medium">
                <RiTimeLine /> Paiement en attente
                {apt.payment?.method === "cash_on_delivery" && " (Espèces)"}
              </div>
            )}
            {apt.payment_collected && (
              <div className="flex items-center gap-2 mt-2 text-xs text-[#10b981] font-medium">
                <RiCheckLine /> Paiement collecté
              </div>
            )}
          </div>

          {/* Action buttons */}
          {apt.status === "confirmed" && (
            <button
              onClick={handleStart}
              disabled={actionLoading}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-lg shadow-[#8b5cf6]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {actionLoading ? (
                <RiLoader4Line className="animate-spin" />
              ) : (
                <RiPlayLine />
              )}
              Start Appointment
            </button>
          )}

          {apt.status === "in_progress" && !showComplete && (
            <button
              onClick={() => setShowComplete(true)}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-[#10b981] text-white hover:bg-[#059669] shadow-lg shadow-[#10b981]/20 transition-all flex items-center justify-center gap-2">
              <RiCheckLine /> Terminer la consultation
            </button>
          )}

          {apt.status === "completed" && !apt.payment_collected && apt.payment?.method === "cash_on_delivery" && apt.payment?.status !== "success" && (
            <button
              onClick={handleCollectCash}
              disabled={actionLoading}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-[#f59e0b] text-white hover:bg-[#d97706] shadow-lg shadow-[#f59e0b]/20 transition-all flex items-center justify-center gap-2">
              {actionLoading ? (
                <RiLoader4Line className="animate-spin" />
              ) : (
                <RiMoneyDollarCircleLine />
              )}
              Confirmer la réception de l'argent
            </button>
          )}

          {/* Complete form */}
          {showComplete && (
            <div className="bg-white border border-[#e9effd] rounded-2xl p-5 shadow-sm space-y-4">
              <h2
                className="text-sm font-bold text-[#1f1f1f]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Terminer la consultation
              </h2>
              <div>
                <label className="text-xs font-medium text-[#6b7280] mb-1 block">
                  Prix final (DZD) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={completeForm.final_price_dzd}
                  onChange={(e) =>
                    setCompleteForm({
                      ...completeForm,
                      final_price_dzd: e.target.value,
                    })
                  }
                  placeholder={
                    apt.quoted_price_dzd
                      ? String(Number(apt.quoted_price_dzd))
                      : ""
                  }
                  className="w-full border border-[#e9effd] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]/50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#6b7280] mb-1 block">
                  Notes
                </label>
                <textarea
                  value={completeForm.completion_notes}
                  onChange={(e) =>
                    setCompleteForm({
                      ...completeForm,
                      completion_notes: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full border border-[#e9effd] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]/50 transition-all resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowComplete(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-[#e9effd] text-[#6b7280] hover:bg-[#f5f7fa]">
                  Annuler
                </button>
                <button
                  onClick={handleComplete}
                  disabled={actionLoading || !completeForm.final_price_dzd}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#10b981] text-white hover:bg-[#059669] disabled:opacity-50 flex items-center justify-center gap-2">
                  {actionLoading ? (
                    <RiLoader4Line className="animate-spin" />
                  ) : (
                    <RiCheckLine />
                  )}
                  Confirmer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Client, Vehicle, Review ── */}
        <div className="space-y-5">
          {/* Client card */}
          <div className="bg-white border border-[#e9effd] rounded-2xl p-5 shadow-sm">
            <h2
              className="text-sm font-bold text-[#1f1f1f] mb-3"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Client
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2563eb]/20 to-[#0b3c5d]/20 flex items-center justify-center text-sm font-bold text-[#2563eb]">
                {initials}
              </div>
              <div>
                <p className="text-base font-semibold text-[#1f1f1f]">
                  {clientName}
                </p>
                <p className="text-xs text-[#9ca3af]">Client</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[#6b7280]">
                <RiPhoneLine className="text-[#2563eb]" />{" "}
                {apt.customer?.phone || "-"}
              </div>
              <div className="flex items-center gap-2 text-[#6b7280]">
                <RiMailLine className="text-[#2563eb]" />{" "}
                {apt.customer?.email || "-"}
              </div>
              {apt.customer?.client_profile?.wilaya && (
                <div className="flex items-center gap-2 text-[#6b7280]">
                  <RiMapPinLine className="text-[#2563eb]" />{" "}
                  {apt.customer.client_profile.wilaya}
                </div>
              )}
            </div>
          </div>

          {/* Vehicle card */}
          {apt.vehicle && (
            <div className="bg-white border border-[#e9effd] rounded-2xl p-5 shadow-sm">
              <h2
                className="text-sm font-bold text-[#1f1f1f] mb-3"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Véhicule
              </h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb]">
                  <RiCarLine className="text-xl" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[#1f1f1f]">
                    {apt.vehicle.brand?.name} {apt.vehicle.model?.name}
                  </p>
                  <p className="text-xs text-[#9ca3af]">{apt.vehicle.year}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-[#6b7280]">
                {apt.vehicle.fuel_type && (
                  <p>
                    Carburant:{" "}
                    <span className="text-[#1f1f1f] font-medium capitalize">
                      {apt.vehicle.fuel_type}
                    </span>
                  </p>
                )}
                {apt.vehicle.mileage_km && (
                  <p>
                    Kilométrage:{" "}
                    <span className="text-[#1f1f1f] font-medium">
                      {apt.vehicle.mileage_km.toLocaleString()} km
                    </span>
                  </p>
                )}
                {apt.vehicle.color && (
                  <p>
                    Couleur:{" "}
                    <span className="text-[#1f1f1f] font-medium capitalize">
                      {apt.vehicle.color}
                    </span>
                  </p>
                )}
                {apt.vehicle.vin && (
                  <p>
                    VIN:{" "}
                    <span className="text-[#1f1f1f] font-medium">
                      {apt.vehicle.vin}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Review card (for completed appointments) */}
          {apt.status === "completed" && (
            <div className="bg-white border border-[#e9effd] rounded-2xl p-5 shadow-sm">
              <h2
                className="text-sm font-bold text-[#1f1f1f] mb-3"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Avis du client
              </h2>
              {review ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#1f1f1f]">
                      {review.author?.client_profile?.full_name || "Client"}
                    </p>
                    <StarRating rating={review.rating} />
                  </div>
                  {review.comment && (
                    <p className="text-sm text-[#6b7280] leading-relaxed bg-[#f8fafc] rounded-xl p-3 border border-[#e9effd]/60">
                      "{review.comment}"
                    </p>
                  )}
                  <p className="text-[10px] text-[#9ca3af]">
                    {formatDate(review.created_at)}
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <RiStarLine className="text-3xl text-[#d1d5db] mx-auto mb-2" />
                  <p className="text-sm text-[#9ca3af]">
                    Pas d'avis pour le moment
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cancellation info */}
          {apt.status === "cancelled" && (
            <div className="bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-[#ef4444] mb-2">Annulé</h2>
              {apt.cancellation_reason && (
                <p className="text-sm text-[#6b7280]">
                  Raison: {apt.cancellation_reason}
                </p>
              )}
              <p className="text-xs text-[#9ca3af] mt-1">
                {formatDate(apt.cancelled_at)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
