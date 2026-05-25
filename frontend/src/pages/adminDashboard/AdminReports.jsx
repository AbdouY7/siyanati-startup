import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiClock,
} from "react-icons/fi";
import { getAdminReports, updateReportStatus } from "../../services/reportService";

const reasonLabels = {
  spam: "Spam",
  fraud: "Fraude",
  inappropriate_content: "Contenu inapproprié",
  fake_parts: "Pièces contrefaites",
  no_show: "Absence",
  other: "Autre",
};

const statusLabels = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: FiClock },
  reviewed: { label: "Examiné", color: "bg-blue-100 text-blue-800", icon: FiEye },
  dismissed: { label: "Rejeté", color: "bg-gray-100 text-gray-800", icon: FiXCircle },
  actioned: { label: "Action prise", color: "bg-green-100 text-green-800", icon: FiCheckCircle },
};

const targetTypeLabels = {
  store: "Magasin",
  professional: "Professionnel",
  post: "Publication",
  comment: "Commentaire",
  user: "Utilisateur",
};

function StatusBadge({ status }) {
  const config = statusLabels[status] || statusLabels.pending;
  const Icon = config.icon;
  return (
    <span className={`px-2.5 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState("");

  // Review Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [reviewAction, setReviewAction] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [page, statusFilter, targetTypeFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getAdminReports({
        page,
        limit,
        status: statusFilter || undefined,
        target_type: targetTypeFilter || undefined,
      });

      if (data && data.reports) {
        setReports(data.reports);
        setTotalPages(data.total_pages);
        setTotalItems(data.total);
      } else {
        setReports([]);
      }
      setError(null);
    } catch (err) {
      setError("Impossible de récupérer les signalements.");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (report) => {
    setSelectedReport(report);
    setAdminNotes(report.admin_notes || "");
    setReviewAction("");
    setShowReviewModal(true);
  };

  const confirmReview = async () => {
    if (!reviewAction) {
      alert("Veuillez choisir une action.");
      return;
    }
    try {
      setIsProcessing(true);
      await updateReportStatus(selectedReport.id, {
        status: reviewAction,
        admin_notes: adminNotes,
      });
      await fetchReports();
      setShowReviewModal(false);
      setSelectedReport(null);
    } catch (err) {
      alert("Erreur: " + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Signalements</h1>
          <p className="text-sm text-gray-500 mt-1">
            Examiner et traiter les signalements envoyés par les utilisateurs
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 shadow-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-4 overflow-x-auto">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white min-w-[160px] transition-all">
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="reviewed">Examiné</option>
                <option value="actioned">Action prise</option>
                <option value="dismissed">Rejeté</option>
              </select>
            </div>
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={targetTypeFilter}
                onChange={(e) => { setTargetTypeFilter(e.target.value); setPage(1); }}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white min-w-[160px] transition-all">
                <option value="">Tous les types</option>
                <option value="store">Magasin</option>
                <option value="professional">Professionnel</option>
                <option value="post">Publication</option>
                <option value="comment">Commentaire</option>
                <option value="user">Utilisateur</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Signaleur
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cible
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Raison
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Aucun signalement trouvé.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {report.reporter?.email || "Inconnu"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {report.reporter?.role || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {targetTypeLabels[report.target_type] || report.target_type}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[120px]">
                        ID: {report.target_id?.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-50 text-red-700">
                        {reasonLabels[report.reason] || report.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleReviewClick(report)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Examiner">
                          <FiEye size={18} />
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
              Affichage de {((page - 1) * limit) + 1} à {Math.min(page * limit, totalItems)} sur {totalItems} signalements
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

      {/* Review Modal */}
      {showReviewModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">
                  Examiner le signalement
                </h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  <FiXCircle size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* Report details */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Signaleur:</span>
                    <span className="font-medium text-gray-900">{selectedReport?.reporter?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type de cible:</span>
                    <span className="font-medium text-gray-900">{targetTypeLabels[selectedReport?.target_type]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID cible:</span>
                    <span className="font-medium text-gray-900 text-xs">{selectedReport?.target_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Raison:</span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-50 text-red-700">
                      {reasonLabels[selectedReport?.reason] || selectedReport?.reason}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Statut actuel:</span>
                    <StatusBadge status={selectedReport?.status} />
                  </div>
                  {selectedReport?.description && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-gray-500 block mb-1">Description du signaleur:</span>
                      <p className="text-gray-800 bg-white p-2 rounded-lg border border-gray-100">{selectedReport.description}</p>
                    </div>
                  )}
                </div>

                {/* Admin action */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Action à prendre *
                  </label>
                  <select
                    value={reviewAction}
                    onChange={(e) => setReviewAction(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 text-sm">
                    <option value="">-- Choisir une action --</option>
                    <option value="actioned">✅ Action prise (notifier le signaleur)</option>
                    <option value="dismissed">❌ Rejeter le signalement (notifier le signaleur)</option>
                    <option value="reviewed">👁️ Marquer comme examiné (sans notification)</option>
                  </select>
                </div>

                {/* Admin notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Notes de l'administrateur
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none bg-gray-50 text-sm"
                    rows="3"
                    placeholder="Ajoutez vos notes sur ce signalement..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    disabled={isProcessing}></textarea>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    disabled={isProcessing}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                    Annuler
                  </button>
                  <button
                    onClick={confirmReview}
                    disabled={isProcessing || !reviewAction}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isProcessing ? "Traitement..." : "Confirmer"}
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

export default AdminReports;
