import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FiAlertTriangle, FiXCircle, FiSend } from "react-icons/fi";
import { submitReport } from "../../services/reportService";

const reasonLabels = {
  spam: "Spam",
  fraud: "Fraude",
  inappropriate_content: "Contenu inapproprié",
  fake_parts: "Pièces contrefaites",
  no_show: "Absence / Non présentation",
  other: "Autre",
};

/**
 * ReportModal – A reusable modal for reporting stores, professionals, posts, etc.
 * Props:
 *  - isOpen: boolean
 *  - onClose: function
 *  - targetId: string – the ID of the entity being reported
 *  - targetType: "store" | "professional" | "post" | "comment" | "user"
 *  - targetName: string – a display name for context (e.g. "Magasin ABC")
 */
export default function ReportModal({ isOpen, onClose, targetId, targetType, targetName }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason) {
      setError("Veuillez sélectionner une raison.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await submitReport({
        target_id: targetId,
        target_type: targetType,
        reason,
        description,
      });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'envoi du signalement.";
      if (msg.includes("already reported")) {
        setError("Vous avez déjà signalé cet élément.");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setDescription("");
    setError("");
    setSuccess(false);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="text-red-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">
              Signaler
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors">
            <FiXCircle size={24} />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <FiSend className="text-green-600" size={28} />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Signalement envoyé</h4>
              <p className="text-sm text-gray-600 mb-6">
                Votre signalement a été transmis à notre équipe d'administration. Nous reviendrons vers vous après examen.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors">
                Fermer
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Signaler <span className="font-semibold">"{targetName || "cet élément"}"</span>.
                Veuillez choisir une raison et décrire le problème.
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-100">
                  {error}
                </div>
              )}

              {/* Reason */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Raison du signalement *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 text-sm">
                  <option value="">-- Choisir une raison --</option>
                  {Object.entries(reasonLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Description (optionnel)
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none bg-gray-50 text-sm"
                  rows="4"
                  placeholder="Décrivez le problème en détail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}></textarea>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2">
                  {submitting ? "Envoi..." : "Envoyer le signalement"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
