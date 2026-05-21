import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
} from "react-icons/fi";
import {
  getAllProfessionalsAdmin,
  approveProfessional,
  rejectProfessional,
} from "../../services/adminService";

const AdminProfessionals = () => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [wilayaFilter, setWilayaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");

  // Modal State
  const [selectedPro, setSelectedPro] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const data = await getAllProfessionalsAdmin();
      setProfessionals(data);
      setError(null);
    } catch (err) {
      setError(
        "Impossible de récupérer les professionnels. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pro) => {
    setSelectedPro(pro);
    setShowModal(true);
    setRejectionReason("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPro(null);
    setRejectionReason("");
  };

  const handleApprove = async () => {
    if (!selectedPro || !selectedPro.professional_profile) return;
    try {
      setIsProcessing(true);
      await approveProfessional(selectedPro.professional_profile.id);
      await fetchProfessionals();
      handleCloseModal();
    } catch (err) {
      alert(
        "Impossible d'approuver le professionnel: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPro || !selectedPro.professional_profile) return;
    if (!rejectionReason.trim()) {
      alert("Veuillez fournir une raison de rejet.");
      return;
    }
    try {
      setIsProcessing(true);
      await rejectProfessional(
        selectedPro.professional_profile.id,
        rejectionReason,
      );
      await fetchProfessionals();
      handleCloseModal();
    } catch (err) {
      alert(
        "Impossible de rejeter le professionnel: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Extract unique values for filters
  const uniqueWilayas = [
    ...new Set(
      professionals.map((p) => p.professional_profile?.wilaya).filter(Boolean),
    ),
  ].sort();
  const uniqueSpecialties = [
    ...new Set(
      professionals
        .map((p) => p.professional_profile?.specialty_type)
        .filter(Boolean),
    ),
  ].sort();

  // Filter professionals
  const filteredProfessionals = professionals.filter((pro) => {
    const profile = pro.professional_profile;
    if (!profile) return false;

    const matchesSearch =
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pro.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWilaya = wilayaFilter ? profile.wilaya === wilayaFilter : true;
    const matchesStatus = statusFilter ? profile.status === statusFilter : true;
    const matchesSpecialty = specialtyFilter
      ? profile.specialty_type === specialtyFilter
      : true;

    return matchesSearch && matchesWilaya && matchesStatus && matchesSpecialty;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestion des professionnels
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" />
          <select
            className="border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            value={wilayaFilter}
            onChange={(e) => setWilayaFilter(e.target.value)}>
            <option value="">All Wilayas</option>
            {uniqueWilayas.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        <select
          className="border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}>
          <option value="">All Specialties</option>
          {uniqueSpecialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className="border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Professional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProfessionals.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-500">
                    No professionals found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredProfessionals.map((pro) => {
                  const profile = pro.professional_profile;
                  const status = profile?.status || "unknown";

                  return (
                    <tr
                      key={pro.id}
                      className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {profile?.full_name?.charAt(0) || "P"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {profile?.full_name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {pro.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {profile?.specialty_type || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {profile?.work_type?.replace("_", " ") || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {profile?.wilaya || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {profile?.experience_years
                          ? `${profile.experience_years} ans`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            status === "approved"
                              ? "bg-green-100 text-green-800"
                              : status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {status === "pending" ? (
                          <button
                            onClick={() => handleOpenModal(pro)}
                            className="text-primary hover:text-secondary bg-primary/10 px-3 py-1 rounded-md transition-colors">
                            Examiner
                          </button>
                        ) : (
                          <Link
                            to={`/admin/professionals/${pro.id}`}
                            className="text-gray-600 hover:text-primary bg-gray-100 px-3 py-1 rounded-md transition-colors inline-flex items-center gap-1">
                            <FiInfo size={14} /> Details
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {showModal &&
        selectedPro &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
              {/* Background overlay with blur effect */}
              <div
                className="fixed inset-0 bg-white/10 backdrop-blur-md transition-opacity"
                aria-hidden="true"
                onClick={handleCloseModal}></div>

              {/* Modal Content */}
              <div className="relative bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-2xl w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3
                        className="text-lg leading-6 font-bold text-gray-900 mb-4"
                        id="modal-title">
                        Review Professional Application
                      </h3>

                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase">
                              Full Name
                            </p>
                            <p className="font-medium">
                              {selectedPro.professional_profile?.full_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">
                              Email
                            </p>
                            <p className="font-medium">{selectedPro.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">
                              Phone
                            </p>
                            <p className="font-medium">
                              {selectedPro.phone || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">
                              Wilaya
                            </p>
                            <p className="font-medium">
                              {selectedPro.professional_profile?.wilaya}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">
                              Specialty
                            </p>
                            <p className="font-medium capitalize">
                              {selectedPro.professional_profile?.specialty_type}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">
                              Experience
                            </p>
                            <p className="font-medium">
                              {
                                selectedPro.professional_profile
                                  ?.experience_years
                              }{" "}
                              ans
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs text-gray-500 uppercase">Bio</p>
                          <p className="text-sm mt-1">
                            {selectedPro.professional_profile?.bio ||
                              "No bio provided."}
                          </p>
                        </div>

                        {/* Store info if applicable */}
                        {selectedPro.professional_profile?.work_type ===
                          "avec_magasin" &&
                          selectedPro.professional_profile
                            ?.ProfessionalStore?.[0] && (
                            <div className="mt-4 border-t pt-4">
                              <p className="text-sm font-bold text-gray-700 mb-2">
                                Informations sur le magasin associé
                              </p>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500 uppercase">
                                    Nom du magasin
                                  </p>
                                  <p className="font-medium">
                                    {
                                      selectedPro.professional_profile
                                        .ProfessionalStore[0].name
                                    }
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase">
                                    Adresse du magasin
                                  </p>
                                  <p className="font-medium">
                                    {
                                      selectedPro.professional_profile
                                        .ProfessionalStore[0].address
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* Documents link */}
                        {selectedPro.professional_profile?.documents &&
                          selectedPro.professional_profile.documents.length >
                            0 && (
                            <div className="mt-4 border-t pt-4">
                              <p className="text-sm font-bold text-gray-700 mb-2">
                                Documents
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                {selectedPro.professional_profile.documents.map(
                                  (doc, idx) => (
                                    <a
                                      key={idx}
                                      href={doc}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded">
                                      View Document {idx + 1}
                                    </a>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Rejection Reason (only shown/used for rejection) */}
                      <div className="mt-4">
                        <label
                          htmlFor="rejection_reason"
                          className="block text-sm font-medium text-gray-700">
                          Rejection Reason (Required for rejection)
                        </label>
                        <textarea
                          id="rejection_reason"
                          rows="3"
                          className="mt-1 shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
                          placeholder="Please provide a reason if rejecting..."
                          value={rejectionReason}
                          onChange={(e) =>
                            setRejectionReason(e.target.value)
                          }></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    disabled={isProcessing}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    onClick={handleApprove}>
                    {isProcessing ? "Processing..." : "Approve Application"}
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    onClick={handleReject}>
                    Reject Application
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleCloseModal}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default AdminProfessionals;
