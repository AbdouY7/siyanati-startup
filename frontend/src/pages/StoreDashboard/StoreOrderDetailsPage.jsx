import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "../../services/orderService";
import PopupModal from "../../components/ui/PopupModal";
import {
  FiChevronLeft,
  FiPackage,
  FiMapPin,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiUser,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
} from "react-icons/fi";

const StoreOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleUpdateStatusClick = (newStatus) => {
    showConfirm(
      "Confirmation",
      `Voulez-vous vraiment changer le statut à : ${getStatusLabel(newStatus)} ?`,
      async () => {
        closeModal();
        setIsUpdating(true);
        try {
          const data = await updateOrderStatus(id, { status: newStatus });
          setOrder(data);
          showAlert("Succès", "Le statut de la commande a été mis à jour.", "success");
        } catch (error) {
          console.error("Failed to update status", error);
          showAlert("Erreur", error.response?.data?.message || "Erreur lors de la mise à jour", "error");
        } finally {
          setIsUpdating(false);
        }
      }
    );
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { style: "bg-amber-100 text-amber-700", label: "En attente" };
      case "confirmed":
        return { style: "bg-blue-100 text-blue-700", label: "Confirmée" };
      case "processing":
        return { style: "bg-indigo-100 text-indigo-700", label: "En préparation" };
      case "shipped":
        return { style: "bg-purple-100 text-purple-700", label: "Expédiée" };
      case "delivered":
        return { style: "bg-emerald-100 text-emerald-700", label: "Livrée" };
      case "cancelled":
        return { style: "bg-rose-100 text-rose-700", label: "Annulée" };
      case "refunded":
        return { style: "bg-gray-100 text-gray-700", label: "Remboursée" };
      default:
        return { style: "bg-gray-100 text-gray-700", label: status };
    }
  };

  const getStatusLabel = (status) => getStatusConfig(status).label;
  const getStatusStyle = (status) => getStatusConfig(status).style;

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
          Retour aux commandes
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 transition shadow-sm">
          <FiChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Commande {order.order_number || `#${order.id.slice(-6)}`}
          </h2>
          <p className="text-sm text-gray-500">
            Placée le {new Date(order.created_at).toLocaleString("fr-FR")}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full font-bold text-sm ${getStatusStyle(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Items & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiPackage className="text-blue-600" /> Articles commandés
            </h3>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{item.part_name}</p>
                    <p className="text-sm text-gray-500">SKU: {item.part_sku || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{Number(item.unit_price_dzd).toLocaleString("fr-FR")} DA</p>
                    <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                  </div>
                  <div className="text-right w-24">
                    <p className="font-black text-blue-700">{Number(item.line_total_dzd).toLocaleString("fr-FR")} DA</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons based on status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiClock className="text-blue-600" /> Mettre à jour le statut
            </h3>
            <div className="flex flex-wrap gap-3">
              {order.status === "pending" && (
                <>
                  <button onClick={() => handleUpdateStatusClick("confirmed")} disabled={isUpdating} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50">
                    Confirmer la commande
                  </button>
                  <button onClick={() => handleUpdateStatusClick("cancelled")} disabled={isUpdating} className="px-6 py-2 bg-rose-100 text-rose-700 rounded-xl font-medium hover:bg-rose-200 transition disabled:opacity-50">
                    Annuler
                  </button>
                </>
              )}
              {order.status === "confirmed" && (
                <>
                  <button onClick={() => handleUpdateStatusClick("processing")} disabled={isUpdating} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50">
                    Marquer en préparation
                  </button>
                  <button onClick={() => handleUpdateStatusClick("cancelled")} disabled={isUpdating} className="px-6 py-2 bg-rose-100 text-rose-700 rounded-xl font-medium hover:bg-rose-200 transition disabled:opacity-50">
                    Annuler
                  </button>
                </>
              )}
              {order.status === "processing" && (
                <button onClick={() => handleUpdateStatusClick("shipped")} disabled={isUpdating} className="px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition disabled:opacity-50">
                  Marquer comme expédiée
                </button>
              )}
              {order.status === "shipped" && (
                <p className="text-sm text-gray-500">En attente de confirmation de réception par le client.</p>
              )}
              {order.status === "delivered" && (
                <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                  <FiCheckCircle /> Commande livrée au client
                </p>
              )}
              {order.status === "cancelled" && (
                <p className="text-sm text-rose-600 font-medium flex items-center gap-2">
                  <FiXCircle /> Commande annulée
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Summary & Customer Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <FiUser className="text-blue-600" /> Client
            </h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-gray-500 block">Nom complet</span> <span className="font-semibold text-gray-900">{order.customer?.client_profile?.full_name || "N/A"}</span></p>
              <p><span className="text-gray-500 block">Téléphone</span> <span className="font-semibold text-gray-900">{order.customer?.phone || "N/A"}</span></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <FiTruck className="text-blue-600" /> Livraison
            </h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-gray-500 block">Type</span> <span className="font-semibold text-gray-900">{order.delivery_type === "home_delivery" ? "Livraison à domicile" : "Retrait en magasin"}</span></p>
              {order.delivery_address && (
                <p><span className="text-gray-500 block">Adresse</span> <span className="font-semibold text-gray-900">{order.delivery_address}</span></p>
              )}
              {order.notes && (
                <p><span className="text-gray-500 block">Notes du client</span> <span className="font-semibold text-gray-900 p-3 bg-gray-50 rounded-lg block mt-1 border border-gray-100">{order.notes}</span></p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <FiDollarSign className="text-blue-600" /> Paiement
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sous-total</span>
                <span className="font-medium">{Number(order.subtotal_dzd).toLocaleString("fr-FR")} DA</span>
              </div>
              {order.discount_dzd > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Remise</span>
                  <span>-{Number(order.discount_dzd).toLocaleString("fr-FR")} DA</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-2xl font-black text-blue-700">{Number(order.total_dzd).toLocaleString("fr-FR")} DA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default StoreOrderDetailsPage;
