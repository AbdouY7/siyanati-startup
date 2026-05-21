import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  approveProfessional,
  getProfessionalDetailsAdmin,
  rejectProfessional,
  updateUserStatusAdmin,
} from "../../services/adminService";
import axiosInstance from "../../api/axios";
import {
  FiArrowLeft,
  FiStar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiCheck,
  FiX,
  FiSlash,
} from "react-icons/fi";

const AdminProfessionalDetails = () => {
  const { id } = useParams(); // This is the user ID of the professional
  const [pro, setPro] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch details
      const proData = await getProfessionalDetailsAdmin(id);
      setPro(proData);

      const profileId = proData.professional_profile?.id;

      if (profileId) {
        // 2. Fetch appointments for this professional
        try {
          const apptRes = await axiosInstance.get(
            `/appointments?professional_id=${profileId}`,
          );
          setAppointments(apptRes.data.data.appointments);
        } catch (e) {
          console.error("Failed to fetch appointments:", e);
        }

        // 3. Fetch reviews for this professional
        try {
          const revRes = await axiosInstance.get(
            `/reviews?target_id=${profileId}&target_type=professional`,
          );
          setReviews(revRes.data.data.reviews);
        } catch (e) {
          console.error("Failed to fetch reviews:", e);
        }
      }

      setError(null);
    } catch (err) {
      setError("Impossible de récupérer les détails du professionnel.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await approveProfessional(pro.professional_profile.id);
      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible d'approuver le professionnel.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt("Raison du refus de ce professionnel:");
    if (reason === null) return;

    try {
      setActionLoading(true);
      await rejectProfessional(
        pro.professional_profile.id,
        reason.trim() || "Inscription refusée par admin",
      );
      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de refuser le professionnel.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!window.confirm("Bloquer ce professionnel ?")) return;

    try {
      setActionLoading(true);
      const updatedUser = await updateUserStatusAdmin(pro.id, false);
      setPro(updatedUser);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de bloquer le professionnel.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !pro) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || "Professionnel non trouvé."}
        </div>
        <Link
          to="/admin/professionals"
          className="mt-4 inline-flex items-center text-primary hover:underline">
          <FiArrowLeft className="mr-2" /> Retour à la liste
        </Link>
      </div>
    );
  }

  const profile = pro.professional_profile || {};
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Navigation */}
      <div>
        <Link
          to="/admin/professionals"
          className="inline-flex items-center text-gray-500 hover:text-primary mb-4 transition-colors">
          <FiArrowLeft className="mr-2" /> Back to Professionals List
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">
          Professional Details
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3">
        {profile.status === "pending" && (
          <>
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition-colors">
              <FiCheck /> Approve professional
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors">
              <FiX /> Refuse
            </button>
          </>
        )}

        {profile.status === "approved" && pro.is_active && (
          <button
            onClick={handleBlock}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 transition-colors">
            <FiSlash /> Banne / Block user
          </button>
        )}

        {!pro.is_active && (
          <span className="inline-flex items-center rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 border border-red-100">
            User blocked
          </span>
        )}
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="h-32 w-32 bg-primary/10 rounded-full flex items-center justify-center text-primary text-4xl font-bold uppercase mb-4">
              {profile.full_name?.charAt(0) || "P"}
            </div>
            <span
              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${
                profile.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : profile.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}>
              {profile.status}
            </span>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {profile.full_name || "N/A"}
              </h2>
              <p className="text-lg text-primary font-medium capitalize mt-1">
                {profile.specialty_type?.replace("_", " ")}
                <span className="text-gray-400 text-sm ml-2">
                  ({profile.experience_years} ans exp)
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-gray-600 gap-2">
                <FiMail className="text-gray-400" />
                <span>{pro.email}</span>
              </div>
              <div className="flex items-center text-gray-600 gap-2">
                <FiPhone className="text-gray-400" />
                <span>{pro.phone || "No phone provided"}</span>
              </div>
              <div className="flex items-center text-gray-600 gap-2">
                <FiMapPin className="text-gray-400" />
                <span>
                  {profile.location_address ||
                    profile.wilaya ||
                    "No address provided"}
                </span>
              </div>
              <div className="flex items-center text-gray-600 gap-2">
                <FiStar className="text-yellow-400" />
                <span>
                  {profile.rating_avg
                    ? Number(profile.rating_avg).toFixed(1)
                    : "No ratings yet"}
                  <span className="text-gray-400 ml-1">
                    ({profile.rating_count || 0} reviews)
                  </span>
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Bio
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {profile.bio || "No biography provided by the professional."}
              </p>
            </div>

            {profile.hourly_rate_dzd && (
              <div className="mt-2">
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Hourly Rate:{" "}
                </span>
                <span className="text-gray-600 font-medium">
                  {profile.hourly_rate_dzd} DZD/hr
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid for Appointments and Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[500px]">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
            <FiCalendar className="text-primary text-xl" />
            <h2 className="text-lg font-bold text-gray-800">
              Recent Appointments
            </h2>
            <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
              {appointments.length}
            </span>
          </div>

          <div className="overflow-y-auto flex-1 pr-2">
            {appointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No appointments found for this professional.
              </p>
            ) : (
              <ul className="space-y-4">
                {appointments.map((appt) => (
                  <li
                    key={appt.id}
                    className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-800 capitalize">
                          {appt.service_type.replace("_", " ")}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Client:{" "}
                          {appt.customer?.client_profile?.full_name || "N/A"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full 
                        ${
                          appt.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : appt.status === "confirmed"
                              ? "bg-blue-100 text-blue-700"
                              : appt.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {appt.status}
                      </span>
                    </div>
                    {appt.scheduled_at && (
                      <p className="text-xs text-gray-500 mb-1">
                        <span className="font-medium">Scheduled:</span>{" "}
                        {new Date(appt.scheduled_at).toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                      {appt.description}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[500px]">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
            <FiStar className="text-yellow-400 text-xl" />
            <h2 className="text-lg font-bold text-gray-800">
              Reviews & Ratings
            </h2>
            <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
              {reviews.length}
            </span>
          </div>

          <div className="overflow-y-auto flex-1 pr-2">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet.</p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="p-4 border border-gray-100 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs">
                          {review.author?.client_profile?.full_name?.charAt(
                            0,
                          ) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {review.author?.client_profile?.full_name ||
                              "Anonymous User"}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={
                              i < review.rating
                                ? "fill-current"
                                : "text-gray-200"
                            }
                            size={14}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-md">
                      {review.comment}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfessionalDetails;
