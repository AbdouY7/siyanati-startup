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
  getAllStoresAdmin,
  approveStore,
  rejectStore,
} from "../../services/adminService";
import { formatDate } from "../../utils/dateUtils";
import { getImageUrl } from "../../utils/imageUtils";

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [wilayaFilter, setWilayaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal State
  const [selectedStore, setSelectedStore] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const data = await getAllStoresAdmin();
      setStores(data);
      setError(null);
    } catch (err) {
      setError("Impossible de récupérer les magasins. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (store) => {
    setSelectedStore(store);
    setShowModal(true);
    setRejectionReason("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStore(null);
    setRejectionReason("");
  };

  const handleApprove = async () => {
    if (!selectedStore || !selectedStore.store_profile) return;
    try {
      setIsProcessing(true);
      await approveStore(selectedStore.store_profile.id);
      await fetchStores();
      handleCloseModal();
    } catch (err) {
      alert(
        "Impossible d'approuver le magasin: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedStore || !selectedStore.store_profile) return;
    if (!rejectionReason.trim()) {
      alert("Veuillez fournir une raison de rejet.");
      return;
    }
    try {
      setIsProcessing(true);
      await rejectStore(selectedStore.store_profile.id, rejectionReason);
      await fetchStores();
      handleCloseModal();
    } catch (err) {
      alert(
        "Impossible de rejeter le magasin: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Extract unique values for filters
  const uniqueWilayas = [
    ...new Set(stores.map((s) => s.store_profile?.wilaya).filter(Boolean)),
  ].sort();

  // Filter stores
  const filteredStores = stores.filter((store) => {
    const profile = store.store_profile;
    if (!profile) return false;

    const matchesSearch =
      profile.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWilaya = wilayaFilter ? profile.wilaya === wilayaFilter : true;
    const matchesStatus = statusFilter ? profile.status === statusFilter : true;

    return matchesSearch && matchesWilaya && matchesStatus;
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
          Gestion des magasins
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 shadow-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom du magasin, propriétaire ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex gap-4 overflow-x-auto">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white min-w-[140px] transition-all">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={wilayaFilter}
                onChange={(e) => setWilayaFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white min-w-[140px] transition-all">
                <option value="">All Wilayas</option>
                {uniqueWilayas.map((wilaya) => (
                  <option key={wilaya} value={wilaya}>
                    {wilaya}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Store Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStores.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500">
                    No stores found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => {
                  const profile = store.store_profile;
                  if (!profile) return null;

                  return (
                    <tr
                      key={store.id}
                      className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getImageUrl(profile.logo_url) ? (
                            <img
                              src={getImageUrl(profile.logo_url)}
                              alt={profile.store_name}
                              onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
                              className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mr-3 border border-primary/20">
                              {profile.store_name?.charAt(0) || "S"}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">
                              {profile.store_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Owner: {profile.owner_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {store.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {store.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {profile.wilaya}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">
                          {profile.address}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            profile.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : profile.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}>
                          {profile.status.charAt(0).toUpperCase() +
                            profile.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center space-x-3">
                          {profile.status === "pending" && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedStore(store);
                                  handleApprove();
                                }}
                                disabled={isProcessing}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve">
                                <FiCheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleOpenModal(store)}
                                disabled={isProcessing}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject">
                                <FiXCircle size={18} />
                              </button>
                            </>
                          )}
                          <Link
                            to={`/admin/stores/${store.id}`}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View Details">
                            <FiInfo size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal using React Portal */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">
                  Reject Store Registration
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  <FiXCircle size={24} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Please provide a reason for rejecting{" "}
                  <span className="font-semibold text-gray-900">
                    {selectedStore?.store_profile?.store_name}
                  </span>
                  . This reason will be saved in their profile.
                </p>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none bg-gray-50"
                  rows="4"
                  placeholder="Enter rejection reason here..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  disabled={isProcessing}></textarea>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={handleCloseModal}
                    disabled={isProcessing}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2">
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      "Confirm Rejection"
                    )}
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

export default AdminStores;
