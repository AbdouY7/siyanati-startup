import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "../../services/orderService";
import ReviewStoreModal from "../../components/reviews/ReviewStoreModal";
import PopupModal from "../../components/ui/PopupModal";
import {
  FiChevronLeft,
  FiPackage,
  FiMapPin,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiHome,
  FiStar,
  FiRotateCcw,
  FiXCircle
} from "react-icons/fi";

const ClientOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", message: "", type: "info", onConfirm: null });

  const showAlert = (title, message, type = "info") => {
    setModalConfig({ isOpen: true, title, message, type, onConfirm: null });
  };

  const showConfirm = (title, message, onConfirmCallback) => {
    setModalConfig({ isOpen: true, title, message, type: "warning", onConfirm: onConfirmCallback });
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleConfirmDeliveryClick = () => {
    showConfirm(
      "Confirmer la réception",
      "Confirmez-vous avoir bien reçu votre commande ?",
      async () => {
        closeModal();
        setIsUpdating(true);
        try {
          const data = await updateOrderStatus(id, { status: "delivered" });
          setOrder(data);
          showAlert("Succès", "La réception de votre commande a été confirmée.", "success");
        } catch (error) {
          console.error("Failed to confirm delivery", error);
          showAlert("Erreur", error.response?.data?.message || "Erreur lors de la confirmation", "error");
        } finally {
          setIsUpdating(false);
        }
      }
    );
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { style: "bg-amber-100 text-amber-700", icon: <FiClock size={16} />, label: "En attente" };
      case "confirmed":
        return { style: "bg-blue-100 text-blue-700", icon: <FiCheckCircle size={16} />, label: "Confirmée" };
      case "processing":
        return { style: "bg-indigo-100 text-indigo-700", icon: <FiPackage size={16} />, label: "En préparation" };
      case "shipped":
        return { style: "bg-purple-100 text-purple-700", icon: <FiTruck size={16} />, label: "Expédiée" };
      case "delivered":
        return { style: "bg-emerald-100 text-emerald-700", icon: <FiCheckCircle size={16} />, label: "Livrée" };
      case "cancelled":
        return { style: "bg-rose-100 text-rose-700", icon: <FiXCircle size={16} />, label: "Annulée" };
      case "refunded":
        return { style: "bg-gray-100 text-gray-700", icon: <FiRotateCcw size={16} />, label: "Remboursée" };
      default:
        return { style: "bg-gray-100 text-gray-700", icon: <FiAlertCircle size={16} />, label: status };
    }
  };

  const getStatusLabel = (status) => getStatusConfig(status).label;
  const getStatusStyle = (status) => getStatusConfig(status).style;
  const getStatusIcon = (status) => getStatusConfig(status).icon;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <FiAlertCircle size={48} className="mb-4" />
        <p className="text-lg">Commande introuvable</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">
          Retour à l'historique
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 transition shadow-sm">
            <FiChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[#1e3a8a] tracking-tight">
              Détails de la commande
            </h2>
            <p className="text-sm text-gray-500 font-mono">
              {order.order_number || `#${order.id.slice(-6)}`}
            </p>
          </div>
          <div className="ml-auto">
            <span className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${getStatusStyle(order.status)}`}>
              {getStatusIcon(order.status)}
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="relative pt-2 pb-6 px-4">
            <div className="absolute left-8 right-8 top-6 h-1 bg-gray-100 rounded-full" />
            <div 
              className={`absolute left-8 top-6 h-1 bg-blue-500 rounded-full transition-all duration-500`}
              style={{
                width: 
                  order.status === 'pending' ? '0%' :
                  order.status === 'confirmed' ? '25%' :
                  order.status === 'processing' ? '50%' :
                  order.status === 'shipped' ? '75%' :
                  order.status === 'delivered' ? '100%' : '0%'
              }}
            />
            
            <div className="relative flex justify-between">
              {[
                { id: 'pending', label: 'En attente', icon: FiClock },
                { id: 'confirmed', label: 'Confirmée', icon: FiCheckCircle },
                { id: 'processing', label: 'En préparation', icon: FiPackage },
                { id: 'shipped', label: 'Expédiée', icon: FiTruck },
                { id: 'delivered', label: 'Livrée', icon: FiHome }
              ].map((step, idx) => {
                const statusLevels = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
                const currentLevel = statusLevels.indexOf(order.status);
                const isCompleted = statusLevels.indexOf(step.id) <= currentLevel;
                const isCancelled = order.status === 'cancelled' || order.status === 'refunded';
                
                if (isCancelled) return null;

                return (
                  <div key={step.id} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-300 relative z-10 ${isCompleted ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                      <step.icon size={16} />
                    </div>
                    <span className={`text-xs font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Callouts */}
          {order.status === "shipped" && (
            <div className="mt-6 bg-blue-50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-100">
              <div className="flex items-center gap-3 text-blue-800">
                <FiPackage size={24} />
                <div>
                  <p className="font-bold">Votre commande est en route !</p>
                  <p className="text-sm text-blue-600/80">N'oubliez pas de confirmer la réception une fois le colis livré.</p>
                </div>
              </div>
              <button 
                onClick={handleConfirmDeliveryClick}
                disabled={isUpdating}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 whitespace-nowrap">
                Confirmer la réception
              </button>
            </div>
          )}

          {order.status === "delivered" && !hasReviewed && (
            <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-100">
              <div className="flex items-center gap-3 text-emerald-800">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-yellow-400 shadow-sm shrink-0">
                  <FiStar size={24} className="fill-current" />
                </div>
                <div>
                  <p className="font-bold">Commande livrée avec succès !</p>
                  <p className="text-sm text-emerald-600/80">Partagez votre expérience avec le vendeur.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-sm whitespace-nowrap">
                Laisser un avis
              </button>
            </div>
          )}
          {order.status === "delivered" && hasReviewed && (
            <div className="mt-6 text-center text-sm font-semibold text-emerald-600 flex items-center justify-center gap-2">
               <FiStar className="fill-current" /> Merci pour votre avis !
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiPackage className="text-blue-600" /> Articles
              </h3>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 border-b border-gray-50 last:border-0 last:pb-0 first:pt-0">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 leading-snug">{item.part_name}</p>
                      <p className="text-sm text-gray-500 mt-1">Ref: {item.part_sku || "N/A"}</p>
                      <p className="text-sm text-gray-500 mt-1">Qté: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-blue-700 text-lg">{Number(item.line_total_dzd).toLocaleString("fr-FR")} DA</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-400 mt-1">{Number(item.unit_price_dzd).toLocaleString("fr-FR")} DA / unité</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <FiDollarSign className="text-blue-600" /> Récapitulatif du paiement
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-semibold text-gray-900">{Number(order.subtotal_dzd).toLocaleString("fr-FR")} DA</span>
                </div>
                {order.discount_dzd > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Remise</span>
                    <span className="font-semibold">-{Number(order.discount_dzd).toLocaleString("fr-FR")} DA</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Frais de livraison</span>
                  <span className="font-semibold text-gray-900">
                    {order.delivery_type === "home_delivery" ? "Calculés selon la zone" : "Gratuit (Retrait)"}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-2">
                  <span className="font-black text-gray-900 text-lg">Total payé</span>
                  <span className="text-2xl font-black text-blue-700">{Number(order.total_dzd).toLocaleString("fr-FR")} DA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Store Info & Delivery */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiHome className="text-blue-600" /> Magasin vendeur
              </h3>
              <Link to={`/shops/${order.store?.id}`} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  {order.store?.logo_url ? (
                    <img src={order.store.logo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FiHome size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 group-hover:text-blue-600 transition truncate">{order.store?.store_name || "Boutique"}</p>
                  <p className="text-xs text-gray-500">Voir le profil</p>
                </div>
                <FiChevronLeft size={16} className="text-gray-400 rotate-180" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <FiTruck className="text-blue-600" /> Détails de livraison
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-1">Date de la commande</span>
                  <span className="font-semibold text-gray-900 flex items-center gap-1.5"><FiCalendar size={14} className="text-gray-400" /> {new Date(order.created_at).toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-1">Méthode de livraison</span>
                  <span className="font-semibold text-gray-900">{order.delivery_type === "home_delivery" ? "Livraison à domicile" : "Retrait en magasin"}</span>
                </div>
                {order.delivery_address && (
                  <div>
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-1">Adresse de livraison</span>
                    <span className="font-semibold text-gray-900 flex items-start gap-1.5 leading-snug">
                      <FiMapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                      {order.delivery_address}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReviewStoreModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        storeId={order.store_id}
        orderId={order.id}
        storeName={order.store?.store_name}
        onReviewSubmitted={() => {
          setHasReviewed(true);
          showAlert("Succès", "Votre avis a été enregistré avec succès !", "success");
        }}
      />

      <PopupModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
};

export default ClientOrderDetailsPage;
