import React, { useState } from "react";
import { FiX, FiStar, FiAlertCircle } from "react-icons/fi";
import axios from "../../api/axios";

const ReviewStoreModal = ({ isOpen, onClose, storeId, orderId, storeName, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Veuillez sélectionner une note.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    try {
      await axios.post("/reviews", {
        target_id: storeId,
        target_type: "store",
        order_id: orderId,
        rating,
        comment
      });
      onReviewSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur s'est produite lors de l'envoi de votre avis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Évaluer le magasin</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition bg-gray-50 hover:bg-gray-100 rounded-full p-2">
            <FiX size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Comment s'est passée votre commande chez <span className="font-bold text-gray-900">{storeName}</span> ?
          </p>

          <div className="flex flex-col items-center mb-6">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <FiStar
                    size={36}
                    className={`${
                      (hoveredRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    } transition-colors duration-200`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Cliquez pour noter sur 5</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Votre avis (optionnel)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience avec ce vendeur..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
            />
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-start gap-2 border border-red-100">
              <FiAlertCircle className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Envoyer l'avis"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewStoreModal;
