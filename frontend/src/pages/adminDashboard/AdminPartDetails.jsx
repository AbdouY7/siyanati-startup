import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPartById, deletePart } from "../../services/partService";
import axiosInstance from "../../api/axios"; // For verification if needed
import {
  FiArrowLeft,
  FiTrash2,
  FiPackage,
  FiImage,
  FiCheckCircle,
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiXCircle
} from "react-icons/fi";
import { createPortal } from "react-dom";

const conditionLabels = { new: "Neuf", used: "Occasion", refurbished: "Reconditionné" };

export default function AdminPartDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionProcessing, setActionProcessing] = useState(false);

  // Modal State
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    const fetchPart = async () => {
      try {
        setLoading(true);
        const partData = await getPartById(id);
        setPart(partData);
      } catch (error) {
        console.error("Failed to fetch part", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPart();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Voulez-vous vraiment supprimer la pièce "${part?.name}" ? Cette action est irréversible.`)) return;
    try {
      setActionProcessing(true);
      await deletePart(id);
      navigate("/admin/parts");
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la suppression");
      setActionProcessing(false);
    }
  };

  const handleVerifyToggle = async () => {
    try {
      setActionProcessing(true);
      // We assume there's a verify part endpoint in admin routes or part routes
      // /parts/:id/verify (PATCH) as seen in part.routes.js
      const newStatus = !part.is_verified;
      const res = await axiosInstance.patch(`/parts/${id}/verify`, { is_verified: newStatus });
      setPart(res.data.data);
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la vérification");
    } finally {
      setActionProcessing(false);
    }
  };

  const handleNotifySellerClick = () => {
    setNotificationMessage("");
    setShowNotifyModal(true);
  };

  const confirmNotify = async () => {
    if (!notificationMessage.trim()) {
      alert("Veuillez saisir un message.");
      return;
    }
    try {
      setActionProcessing(true);
      // Mock notification sending
      await new Promise(resolve => setTimeout(resolve, 800));
      alert(`Notification envoyée au vendeur de la pièce "${part?.name}"`);
      setShowNotifyModal(false);
    } catch (err) {
      alert("Erreur: " + err.message);
    } finally {
      setActionProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!part) {
    return (
      <div className="px-6 py-20 text-center">
        <FiAlertTriangle className="mx-auto text-4xl text-rose-400 mb-3" />
        <p className="text-gray-700 font-medium">Pièce introuvable</p>
        <button onClick={() => navigate(-1)} className="mt-4 p-2 mx-auto rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition flex items-center justify-center w-fit" title="Retour">
          <FiArrowLeft size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1f1f1f]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Détails de la Pièce (Admin)
            </h1>
            <p className="text-xs text-gray-400">ID: {id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleNotifySellerClick} disabled={actionProcessing} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition border border-yellow-200">
            <FiAlertCircle size={16} /> Notifier le Vendeur
          </button>
          <button onClick={handleVerifyToggle} disabled={actionProcessing} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition border ${part.is_verified ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`}>
            <FiCheckCircle size={16} /> {part.is_verified ? "Révoquer la vérification" : "Vérifier la pièce"}
          </button>
          <button onClick={handleDelete} disabled={actionProcessing} className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition border border-rose-100" title="Supprimer">
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border border-[#e9effd] shadow-sm p-5">
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Images</label>
        <div className="flex gap-3 flex-wrap">
          {part.images?.length > 0 ? (
            part.images.map((src, i) => (
              <img key={i} src={src} alt="" className="w-32 h-32 rounded-xl object-cover border border-gray-200 shadow-sm" />
            ))
          ) : (
            <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 border border-gray-200">
              <FiImage size={32} />
            </div>
          )}
        </div>
      </div>

      {/* Info Overview */}
      <div className="bg-white rounded-2xl border border-[#e9effd] shadow-sm p-5 space-y-5">
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Informations Générales</label>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nom</label>
            <div className="text-gray-900 font-medium">{part.name}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Vendeur</label>
            <div className="text-gray-900 capitalize">{part.seller_type} ({part.seller_id.substring(0,8)}...)</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Catégorie</label>
            <div className="text-gray-900">{part.category?.name || "Non catégorisé"}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">État</label>
            <div className="text-gray-900">{conditionLabels[part.condition] || part.condition}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">SKU</label>
            <div className="text-gray-900">{part.sku || "N/A"}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Référence OEM</label>
            <div className="text-gray-900">{part.oem_reference || "N/A"}</div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Prix</label>
            <div className="text-lg font-bold text-[#2563eb]">{parseFloat(part.price_dzd).toLocaleString("fr-DZ")} DZD</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Stock</label>
            <div className={`font-medium ${part.stock_qty > 0 ? 'text-gray-900' : 'text-rose-600'}`}>{part.stock_qty} unités</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Poids</label>
            <div className="text-gray-900">{part.weight_kg ? `${part.weight_kg} kg` : "N/A"}</div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
          <div className="text-gray-700 whitespace-pre-wrap">{part.description || "Aucune description fournie."}</div>
        </div>
      </div>

      {/* Compatibility */}
      <div className="bg-white rounded-2xl border border-[#e9effd] shadow-sm p-5 space-y-4">
        <label className="block text-[11px] font-bold text-blue-600 uppercase tracking-widest">Compatibilité Véhicule</label>
        {part.compatibilities && part.compatibilities.length > 0 ? (
          <div className="space-y-3">
            {part.compatibilities.map((comp, idx) => (
              <div key={idx} className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{comp.brand?.name} {comp.model?.name}</div>
                  <div className="text-xs text-gray-500">
                    Années: {comp.year_from} - {comp.year_to || "Aujourd'hui"}
                    {comp.engine_variant && ` | Moteur: ${comp.engine_variant}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">Aucune compatibilité spécifiée.</div>
        )}
      </div>

      {/* Status info */}
      <div className="bg-white rounded-2xl border border-[#e9effd] shadow-sm p-5">
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Statut de la Pièce</label>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            {part.is_active ? <FiEye className="text-emerald-500" /> : <FiEyeOff className="text-gray-400" />}
            <span className="text-gray-600">{part.is_active ? "Active" : "Inactive"}</span>
          </div>
          <div className="flex items-center gap-2">
            {part.is_verified ? <FiCheckCircle className="text-emerald-500" /> : <FiAlertTriangle className="text-amber-500" />}
            <span className="text-gray-600">{part.is_verified ? "Vérifiée" : "Non vérifiée"}</span>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Vues : </span>
            <span className="font-semibold text-gray-700">{part.views_count || 0}</span>
          </div>
        </div>
      </div>

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
                  Envoyer un message au vendeur concernant la pièce <span className="font-semibold">"{part?.name}"</span>.
                </p>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none bg-gray-50"
                  rows="4"
                  placeholder="Décrivez le problème avec cette pièce..."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  disabled={actionProcessing}></textarea>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowNotifyModal(false)}
                    disabled={actionProcessing}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                    Annuler
                  </button>
                  <button
                    onClick={confirmNotify}
                    disabled={actionProcessing}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2">
                    {actionProcessing ? "Envoi..." : "Envoyer"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
