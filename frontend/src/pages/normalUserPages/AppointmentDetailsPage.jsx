import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";
import {
  FiChevronLeft,
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiTool,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiPlayCircle,
  FiStar,
  FiEdit,
  FiTrash2,
  FiCreditCard,
} from "react-icons/fi";
import { initiateAppointmentPayment } from "../../services/paymentService";

const AppointmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/appointments/${id}`);
        setAppointment(response.data.data || response.data);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load appointment details",
        );
        console.error("Error fetching appointment:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAppointmentDetails();
    }
  }, [id]);

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return {
          style: "bg-emerald-100 text-emerald-700 border-emerald-200",
          icon: <FiCheckCircle size={18} />,
          label: "Terminé",
          bgColor: "bg-emerald-500",
        };
      case "confirmed":
        return {
          style: "bg-blue-100 text-blue-700 border-blue-200",
          icon: <FiCheckCircle size={18} />,
          label: "Confirmé",
          bgColor: "bg-blue-500",
        };
      case "in_progress":
        return {
          style: "bg-purple-100 text-purple-700 border-purple-200",
          icon: <FiPlayCircle size={18} />,
          label: "En cours",
          bgColor: "bg-purple-500",
        };
      case "pending":
        return {
          style: "bg-amber-100 text-amber-700 border-amber-200",
          icon: <FiClock size={18} />,
          label: "En attente",
          bgColor: "bg-amber-500",
        };
      case "cancelled":
        return {
          style: "bg-rose-100 text-rose-700 border-rose-200",
          icon: <FiXCircle size={18} />,
          label: "Annulé",
          bgColor: "bg-rose-500",
        };
      default:
        return {
          style: "bg-gray-100 text-gray-700 border-gray-200",
          icon: <FiAlertCircle size={18} />,
          label: status,
          bgColor: "bg-gray-500",
        };
    }
  };

  const handlePayment = async (method) => {
    try {
      setPaymentLoading(true);
      const res = await initiateAppointmentPayment(appointment.id, method);
      if (method === "edahabia" && res.payment?.edahabia_ref) {
        navigate(`/appointment-payment/${res.payment.edahabia_ref}?amount=${appointment.final_price_dzd}&id=${appointment.id}`);
      } else {
        // Refresh appointment
        const response = await axiosInstance.get(`/appointments/${id}`);
        setAppointment(response.data.data || response.data);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'initiation du paiement");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50/50 pb-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
          <Link
            to="/profile/appointments"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition mb-6">
            <FiChevronLeft size={18} />
            Retour
          </Link>
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
            <FiAlertCircle size={48} className="mx-auto mb-4 text-red-500" />
            <p className="text-xl font-semibold text-gray-900 mb-2">Erreur</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(appointment.status);
  const professional = appointment.professional || appointment.provider;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
        {/* Back Button */}
        <Link
          to="/profile/appointments"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition mb-6">
          <FiChevronLeft size={18} />
          Retour aux rendez-vous
        </Link>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Appointment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Rendez-vous #{appointment.id?.toString().slice(-6)}
                  </h1>
                  <p className="text-gray-500">
                    Créé le{" "}
                    {new Date(appointment.created_at).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${statusConfig.style}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </div>

              {/* Key Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
                  <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
                    Service
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {appointment.service_type || "N/A"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4">
                  <p className="text-xs text-purple-600 font-semibold uppercase mb-1">
                    Statut
                  </p>
                  <p className="text-sm font-bold text-gray-900 capitalize">
                    {statusConfig.label}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4">
                  <p className="text-xs text-emerald-600 font-semibold uppercase mb-1">
                    Prix
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {appointment.quoted_price_dzd
                      ? `${appointment.quoted_price_dzd.toLocaleString("fr-FR")} DA`
                      : appointment.final_price_dzd
                        ? `${appointment.final_price_dzd.toLocaleString("fr-FR")} DA`
                        : "À définir"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4">
                  <p className="text-xs text-amber-600 font-semibold uppercase mb-1">
                    Durée
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {appointment.duration_minutes
                      ? `${appointment.duration_minutes} min`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Détails du rendez-vous
              </h2>

              <div className="space-y-6">
                {/* Date & Time */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <FiCalendar size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                      Date et heure
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {appointment.scheduled_at
                        ? new Date(appointment.scheduled_at).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "Non planifié"}
                    </p>
                    {appointment.scheduled_at && (
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(appointment.scheduled_at).toLocaleTimeString(
                          "fr-FR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Service Type */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <FiTool size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                      Type de service
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {appointment.service_type || "N/A"}
                    </p>
                    {appointment.service_details && (
                      <p className="text-sm text-gray-600 mt-1">
                        {appointment.service_details}
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes/Description */}
                {appointment.description && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <FiEdit size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                        Notes
                      </p>
                      <p className="text-gray-700">{appointment.description}</p>
                    </div>
                  </div>
                )}

                {/* Price Details */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <FiDollarSign size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                      Détails de prix
                    </p>
                    <div className="space-y-2">
                      {appointment.quoted_price_dzd && (
                        <p className="text-gray-700">
                          Prix devis:{" "}
                          <span className="font-bold">
                            {appointment.quoted_price_dzd.toLocaleString(
                              "fr-FR",
                            )}{" "}
                            DA
                          </span>
                        </p>
                      )}
                      {appointment.final_price_dzd && (
                        <p className="text-gray-700">
                          Prix final:{" "}
                          <span className="font-bold">
                            {appointment.final_price_dzd.toLocaleString(
                              "fr-FR",
                            )}{" "}
                            DA
                          </span>
                        </p>
                      )}
                      {!appointment.quoted_price_dzd &&
                        !appointment.final_price_dzd && (
                          <p className="text-gray-500 italic">
                            Prix à être défini
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                {/* Cancellation Reason */}
                {appointment.status === "cancelled" &&
                  appointment.cancellation_reason && (
                    <div className="flex gap-4 bg-rose-50 p-4 rounded-xl">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                        <FiXCircle size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                          Raison d'annulation
                        </p>
                        <p className="text-gray-700">
                          {appointment.cancellation_reason}
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Payment Section */}
            {appointment.status === "completed" && !appointment.payment_collected && appointment.payment?.method !== "cash_on_delivery" && (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <FiCreditCard size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Paiement Requis
                    </h2>
                    <p className="text-sm text-gray-500">
                      Veuillez choisir votre méthode de paiement
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handlePayment("edahabia")}
                    disabled={paymentLoading}
                    className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-50"
                  >
                    <img src="/dahabia.png" alt="Edahabia" className="h-10 mb-3 object-contain" onError={(e) => e.target.style.display = 'none'} />
                    <span className="font-semibold text-gray-900">Carte Edahabia</span>
                  </button>
                  <button
                    onClick={() => handlePayment("cash_on_delivery")}
                    disabled={paymentLoading}
                    className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition disabled:opacity-50"
                  >
                    <FiDollarSign size={40} className="text-emerald-500 mb-3" />
                    <span className="font-semibold text-gray-900">Espèces (à la main)</span>
                  </button>
                </div>
              </div>
            )}
            
            {appointment.status === "completed" && appointment.payment?.method === "cash_on_delivery" && !appointment.payment_collected && (
              <div className="bg-amber-50 rounded-2xl shadow-sm border border-amber-200 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <FiClock size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-amber-900">Paiement en espèces</p>
                    <p className="text-sm text-amber-700">En attente de confirmation par le professionnel.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Professional Info */}
          <div className="space-y-6">
            {/* Professional Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Professional Header */}
              <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600"></div>

              {/* Professional Content */}
              <div className="px-6 pb-6">
                {/* Avatar */}
                <div className="flex justify-center -mt-16 mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                    {professional?.full_name?.charAt(0) || "P"}
                  </div>
                </div>

                {/* Name & Title */}
                <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
                  {professional?.full_name || "N/A"}
                </h3>
                <p className="text-sm text-gray-600 text-center mb-4 capitalize">
                  {professional?.specialty_type || "Professionnel"}
                </p>

                {/* Rating */}
                {professional?.rating_avg && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <FiStar
                          key={i}
                          size={16}
                          className={`${
                            i <= Math.round(Number(professional.rating_avg))
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {Number(professional.rating_avg).toFixed(1)}
                    </span>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <FiMail
                      size={16}
                      className="text-gray-400 mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        Email
                      </p>
                      <p className="text-sm text-gray-700 break-all">
                        {professional?.email || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  {professional?.phone && (
                    <div className="flex items-start gap-3">
                      <FiPhone
                        size={16}
                        className="text-gray-400 mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                          Téléphone
                        </p>
                        <p className="text-sm text-gray-700">
                          {professional.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {professional?.wilaya && (
                    <div className="flex items-start gap-3">
                      <FiMapPin
                        size={16}
                        className="text-gray-400 mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                          Localisation
                        </p>
                        <p className="text-sm text-gray-700">
                          {professional.wilaya}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {professional?.experience_years && (
                    <div className="flex items-start gap-3">
                      <FiUser
                        size={16}
                        className="text-gray-400 mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                          Expérience
                        </p>
                        <p className="text-sm text-gray-700">
                          {professional.experience_years} années
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {professional?.bio && (
                    <div className="flex items-start gap-3">
                      <FiEdit
                        size={16}
                        className="text-gray-400 mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                          À propos
                        </p>
                        <p className="text-sm text-gray-700">
                          {professional.bio}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
                <FiEdit size={18} />
                Modifier rendez-vous
              </button>
              {["pending", "confirmed"].includes(
                appointment.status?.toLowerCase(),
              ) && (
                <button className="w-full px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-lg transition flex items-center justify-center gap-2">
                  <FiTrash2 size={18} />
                  Annuler rendez-vous
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsPage;
