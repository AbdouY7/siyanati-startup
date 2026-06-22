import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { getAppointmentHistory, cancelAppointment } from "../../services/appointmentService";
import useWorkflowSubscription from "../../hooks/useWorkflowSubscription";
import {
  FiChevronLeft,
  FiSearch,
  FiFilter,
  FiChevronRight,
  FiCalendar,
  FiStar,
  FiUser,
  FiTool,
  FiClock,
  FiXCircle,
  FiCheckCircle,
  FiAlertCircle,
  FiPlayCircle,
  FiX,
  FiLoader,
  FiCheck,
} from "react-icons/fi";
import { createReview } from "../../services/reviewService";

const AppointmentHistoryPage = () => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    from_date: "",
    to_date: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });

  // ─── Review Modal State ──────────────────────────────────────────────────────
  const [selectedAptForReview, setSelectedAptForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const handleOpenReview = (apt) => {
    setSelectedAptForReview(apt);
    setRating(5);
    setHoverRating(0);
    setComment("");
    setReviewSuccess(false);
    setReviewError("");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setReviewError("Veuillez donner une note de 1 à 5 étoiles.");
      return;
    }

    setIsSubmittingReview(true);
    setReviewError("");

    try {
      await createReview({
        target_id: selectedAptForReview.professional_id,
        target_type: "professional",
        rating: Number(rating),
        comment: comment || undefined,
        appointment_id: selectedAptForReview.id,
      });

      // Update local appointments state to show Reviewed badge instantly
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAptForReview.id
            ? { ...apt, reviews: [{ id: "temp-id", rating, comment }] }
            : apt
        )
      );
      setReviewSuccess(true);
      setTimeout(() => {
        setSelectedAptForReview(null);
      }, 1500);
    } catch (err) {
      console.error("Failed to submit review", err);
      setReviewError(err.response?.data?.message || "Erreur lors de la soumission de l'avis.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const fetchAppointments = React.useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await getAppointmentHistory({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
        from_date: filters.from_date || undefined,
        to_date: filters.to_date || undefined,
      });

      setAppointments(response.appointments || []);
      setFiltered(response.appointments || []);
      setPagination((prev) => ({
        ...prev,
        total: response.total || 0,
        total_pages: response.total_pages || 0,
      }));
    } catch (error) {
      console.error("Failed to fetch appointments", error);
      // Optionally show toast notification here
    } finally {
      setIsLoading(false);
    }
  }, [user, pagination.page, pagination.limit, filters.status, filters.from_date, filters.to_date]);

  // Fetch appointments from backend
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useWorkflowSubscription({
    entityType: "appointment",
    onUpdate: () => {
      fetchAppointments();
    }
  });

  // Client-side search filtering
  useEffect(() => {
    if (searchQuery) {
      setFiltered(
        appointments.filter(
          (a) =>
            a.id?.toString().includes(searchQuery) ||
            a.professional?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.service_type?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFiltered(appointments);
    }
  }, [searchQuery, appointments]);

  // Handle cancel appointment
  const handleCancel = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) return;

    try {
      await cancelAppointment(id, { cancellation_reason: "Annulé par le client" });

      // Refresh list after cancellation
      const response = await getAppointmentHistory({
        page: pagination.page,
        limit: pagination.limit,
      });

      setAppointments(response.appointments || []);
      setFiltered(response.appointments || []);
    } catch (error) {
      console.error("Failed to cancel appointment", error);
      alert(error.response?.data?.message || "Erreur lors de l'annulation");
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return {
          style: "bg-emerald-100 text-emerald-700 border-emerald-200",
          icon: <FiCheckCircle size={12} />,
          label: "Terminé",
        };
      case "confirmed":
        return {
          style: "bg-blue-100 text-blue-700 border-blue-200",
          icon: <FiCheckCircle size={12} />,
          label: "Confirmé",
        };
      case "in_progress":
        return {
          style: "bg-purple-100 text-purple-700 border-purple-200",
          icon: <FiPlayCircle size={12} />,
          label: "En cours",
        };
      case "pending":
        return {
          style: "bg-amber-100 text-amber-700 border-amber-200",
          icon: <FiClock size={12} />,
          label: "En attente",
        };
      case "cancelled":
        return {
          style: "bg-rose-100 text-rose-700 border-rose-200",
          icon: <FiXCircle size={12} />,
          label: "Annulé",
        };
      default:
        return {
          style: "bg-gray-100 text-gray-700 border-gray-200",
          icon: <FiAlertCircle size={12} />,
          label: status,
        };
    }
  };

  const getStatusStyle = (status) => getStatusConfig(status).style;
  const getStatusLabel = (status) => getStatusConfig(status).label;
  const getStatusIcon = (status) => getStatusConfig(status).icon;

  const canCancel = (status) => ["pending", "confirmed"].includes(status?.toLowerCase());

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}


      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 mt-10">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/profile"
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-sm"
          >
            <FiChevronLeft size={20} />
          </Link>
          <h2 className="text-3xl font-bold text-[#1e3a8a] tracking-tight">
            HISTORIQUE DES RENDEZ-VOUS
          </h2>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par ID, professionnel ou service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[160px]"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmé</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
              <input
                type="date"
                value={filters.from_date}
                onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <input
                type="date"
                value={filters.to_date}
                onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                onClick={() => setFilters({ status: "", from_date: "", to_date: "" })}
                className="px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
              >
                <FiFilter size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FiCalendar size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucun rendez-vous trouvé</p>
              <p className="text-sm mt-1">Vos rendez-vous apparaîtront ici</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">ID</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Professionnel</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Service</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">
                        <FiCalendar size={12} className="inline mr-1" />Date
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Prix</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((apt) => (
                      <tr key={apt.id} className="hover:bg-blue-50/30 transition group">
                        <td className="py-4 px-6 font-mono text-sm font-semibold text-gray-900">
                          #{apt.id?.toString().slice(-6)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              <FiUser size={14} />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900 block">
                                {apt.professional?.full_name || "N/A"}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {apt.professional?.specialty_type || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                            <FiTool size={10} />
                            {apt.service_type || "N/A"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-600">
                            {apt.scheduled_at
                              ? new Date(apt.scheduled_at).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              : new Date(apt.created_at).toLocaleDateString("fr-FR")
                            }
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-bold text-[#1e3a8a]">
                            {apt.quoted_price_dzd
                              ? `${apt.quoted_price_dzd.toLocaleString("fr-FR")} DA`
                              : apt.final_price_dzd
                                ? `${apt.final_price_dzd.toLocaleString("fr-FR")} DA`
                                : "-"
                            }
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusStyle(apt.status)}`}>
                            {getStatusIcon(apt.status)}
                            {getStatusLabel(apt.status)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/profile/appointments/${apt.id}`}
                              className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
                            >
                              Voir plus <FiChevronRight size={14} />
                            </Link>
                            {apt.status === "completed" && (
                              apt.reviews?.length > 0 ? (
                                <span className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium">
                                  <FiCheck size={14} /> Noté
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleOpenReview(apt)}
                                  className="inline-flex items-center gap-1 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-medium transition"
                                >
                                  Laisser un avis
                                </button>
                              )
                            )}
                            {canCancel(apt.status) && (
                              <button
                                onClick={() => handleCancel(apt.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition"
                                title="Annuler"
                              >
                                <FiXCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Affichage {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Précédent
                    </button>
                    <span className="px-3 py-2 text-sm font-medium text-gray-700">
                      {pagination.page} / {pagination.total_pages}
                    </span>
                    <button
                      onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                      disabled={pagination.page === pagination.total_pages}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── Review Modal ──────────────────────────────────────────────────────── */}
      {selectedAptForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-blue-900 to-[#1e3a8a] text-white p-6">
              <button
                type="button"
                onClick={() => setSelectedAptForReview(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
                aria-label="Close modal"
              >
                <FiX size={18} />
              </button>
              <h3 className="text-xl font-bold tracking-tight">Laisser un avis</h3>
              <p className="text-blue-100 text-xs mt-1">
                Partagez votre expérience avec {selectedAptForReview.professional?.full_name || "le professionnel"}
              </p>
            </div>

            {/* Modal Content / Form */}
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-6">
              {reviewSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                    <FiCheck size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Avis enregistré !</h4>
                  <p className="text-gray-500 text-sm">
                    Merci pour votre retour. Il aide la communauté à faire les meilleurs choix.
                  </p>
                </div>
              ) : (
                <>
                  {reviewError && (
                    <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs flex items-center gap-2 border border-rose-100">
                      <FiAlertCircle size={16} className="shrink-0" />
                      <span>{reviewError}</span>
                    </div>
                  )}

                  {/* Rating Stars Section */}
                  <div className="flex flex-col items-center justify-center space-y-2 py-2">
                    <label className="text-sm font-semibold text-gray-700">Votre évaluation</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isGold = (hoverRating || rating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="text-3xl focus:outline-none transition-transform active:scale-95"
                          >
                            <FiStar
                              className={`w-10 h-10 transition-colors duration-150 ${isGold
                                ? "fill-amber-400 text-amber-400 filter drop-shadow-sm"
                                : "text-gray-300 hover:text-gray-400"
                                }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-medium text-amber-600 h-4">
                      {hoverRating === 1 || (!hoverRating && rating === 1) ? "Médiocre 😞" : ""}
                      {hoverRating === 2 || (!hoverRating && rating === 2) ? "Passable 😕" : ""}
                      {hoverRating === 3 || (!hoverRating && rating === 3) ? "Satisfaisant 🙂" : ""}
                      {hoverRating === 4 || (!hoverRating && rating === 4) ? "Très bien 😃" : ""}
                      {hoverRating === 5 || (!hoverRating && rating === 5) ? "Excellent ! 🤩" : ""}
                    </span>
                  </div>

                  {/* Review Text Area */}
                  <div className="space-y-2">
                    <label htmlFor="comment" className="text-sm font-semibold text-gray-700 flex justify-between">
                      <span>Votre commentaire</span>
                      <span className="text-xs text-gray-400 font-normal">(Facultatif)</span>
                    </label>
                    <textarea
                      id="comment"
                      rows="4"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Décrivez votre expérience avec ce professionnel, la qualité du travail, le respect des délais..."
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none placeholder:text-gray-400"
                    />
                  </div>

                  {/* Submit and Cancel Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isSubmittingReview}
                      onClick={() => setSelectedAptForReview(null)}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-sm font-semibold transition disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-semibold transition shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmittingReview ? (
                        <>
                          <FiLoader className="animate-spin" size={16} /> Enregistrement...
                        </>
                      ) : (
                        "Publier l'avis"
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistoryPage;