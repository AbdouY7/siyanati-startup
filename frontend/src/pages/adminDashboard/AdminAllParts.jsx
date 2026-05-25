import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { FiSearch, FiFilter, FiTrash2, FiEye, FiAlertCircle, FiXCircle } from "react-icons/fi";
import { getAllParts, deletePart } from "../../services/partService";

const formatCondition = (condition) => {
  const labels = {
    new: "Neuf",
    used: "Occasion",
    refurbished: "Reconditionné",
  };
  return labels[condition] || condition || "N/A";
};

const AdminAllParts = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");

  // Modal State
  const [selectedPart, setSelectedPart] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset page on search change
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchParts();
  }, [page, limit, debouncedSearchTerm, conditionFilter]);

  const fetchParts = async () => {
    try {
      setLoading(true);
      // Notice: getAllParts has been updated in backend to handle page and limit parameters
      const response = await getAllParts({
        page,
        limit,
        search: debouncedSearchTerm,
        condition: conditionFilter,
      });

      if (response && response.parts) {
        setParts(response.parts);
        setTotalPages(response.total_pages);
        setTotalItems(response.total);
      } else {
        // Fallback if backend returned array
        setParts(Array.isArray(response) ? response : []);
      }
      setError(null);
    } catch (err) {
      setError("Impossible de récupérer les pièces. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (part) => {
    setSelectedPart(part);
    setShowDeleteModal(true);
  };

  const handleNotifyClick = (part) => {
    setSelectedPart(part);
    setNotificationMessage("");
    setShowNotifyModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPart) return;
    try {
      setIsProcessing(true);
      await deletePart(selectedPart.id);
      await fetchParts();
      setShowDeleteModal(false);
      setSelectedPart(null);
    } catch (err) {
      alert("Erreur lors de la suppression: " + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmNotify = async () => {
    if (!selectedPart) return;
    if (!notificationMessage.trim()) {
      alert("Veuillez saisir un message.");
      return;
    }
    try {
      setIsProcessing(true);
      // Mock notification sending
      await new Promise(resolve => setTimeout(resolve, 800));
      alert(`Notification envoyée au vendeur de la pièce ${selectedPart.name}`);
      setShowNotifyModal(false);
      setSelectedPart(null);
    } catch (err) {
      alert("Erreur: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Pièces</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez toutes les pièces proposées sur la plateforme</p>
        </div>
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
              placeholder="Rechercher par nom de pièce, SKU ou référence OEM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex gap-4 overflow-x-auto">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={conditionFilter}
                onChange={(e) => {
                  setConditionFilter(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white min-w-[140px] transition-all">
                <option value="">Tous les états</option>
                <option value="new">Neuf</option>
                <option value="used">Occasion</option>
                <option value="refurbished">Reconditionné</option>
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
                  Pièce
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Catégorie & État
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Prix & Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Vendeur
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && parts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : parts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Aucune pièce trouvée.
                  </td>
                </tr>
              ) : (
                parts.map((part) => (
                  <tr key={part.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {part.images && part.images.length > 0 ? (
                          <img
                            src={part.images[0]}
                            alt={part.name}
                            className="w-12 h-12 rounded object-cover mr-3 border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center mr-3 border border-gray-200 text-gray-400">
                            <FiEye size={20} />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900 max-w-xs truncate" title={part.name}>
                            {part.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            SKU: {part.sku || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {part.category?.name || "Non catégorisé"}
                      </div>
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 mt-1">
                        {formatCondition(part.condition)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-primary">
                        {parseFloat(part.price_dzd).toLocaleString("fr-DZ")} DZD
                      </div>
                      <div className={`text-xs mt-1 ${part.stock_qty > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Stock: {part.stock_qty}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 capitalize">
                        {part.seller_type}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[120px]">
                        ID: {part.seller_id.substring(0,8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center space-x-2">
                        <Link
                          to={`/admin/parts/${part.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir les détails">
                          <FiEye size={18} />
                        </Link>
                        <button
                          onClick={() => handleNotifyClick(part)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Notifier le vendeur">
                          <FiAlertCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(part)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer la pièce">
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Affichage de {((page - 1) * limit) + 1} à {Math.min(page * limit, totalItems)} sur {totalItems} pièces
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Précédent
              </button>
              <div className="flex items-center px-2 text-sm">
                {page} / {totalPages}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 mx-auto">
                  <FiTrash2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
                  Supprimer la pièce
                </h3>
                <p className="text-sm text-center text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir supprimer la pièce <span className="font-semibold">"{selectedPart?.name}"</span> ? Cette action est irréversible.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                    Annuler
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex justify-center items-center">
                    {isProcessing ? "Suppression..." : "Supprimer"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Notify Modal */}
      {showNotifyModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifier le vendeur
                </h3>
                <button
                  onClick={() => setShowNotifyModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  <FiXCircle size={24} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Envoyer un message au vendeur concernant la pièce <span className="font-semibold">"{selectedPart?.name}"</span>.
                </p>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none bg-gray-50"
                  rows="4"
                  placeholder="Décrivez le problème avec cette pièce..."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  disabled={isProcessing}></textarea>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowNotifyModal(false)}
                    disabled={isProcessing}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                    Annuler
                  </button>
                  <button
                    onClick={confirmNotify}
                    disabled={isProcessing}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2">
                    {isProcessing ? "Envoi..." : "Envoyer"}
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

export default AdminAllParts;
