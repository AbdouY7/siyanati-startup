import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { getOrderHistory, updateOrderStatus } from "../../services/orderService";
import PopupModal from "../../components/ui/PopupModal";
import {
  FiSearch,
  FiFilter,
  FiChevronRight,
  FiCalendar,
  FiDollarSign,
  FiPackage,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiTruck,
  FiMapPin,
} from "react-icons/fi";
import { RiFileList3Line } from "react-icons/ri";
import { getImageUrl } from "../../utils/imageUtils";

export default function StoreOrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    wilaya: "",
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", message: "", type: "info", onConfirm: null });

  const showAlert = (title, message, type = "info") => {
    setModalConfig({ isOpen: true, title, message, type, onConfirm: null });
  };

  const showConfirm = (title, message, onConfirmCallback) => {
    setModalConfig({ isOpen: true, title, message, type: "warning", onConfirm: onConfirmCallback });
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await getOrderHistory({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
        search: searchQuery || undefined,
        wilaya: filters.wilaya || undefined,
      });

      setOrders(response.orders || []);
      setPagination((prev) => ({
        ...prev,
        total: response.total || 0,
        total_pages: response.total_pages || 0,
      }));
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters.status, filters.wilaya]);

  // Handle search when user types (with a basic debounce mechanism by listening to enter key or search button)
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchOrders();
  };

  const handleCancelOrder = (id) => {
    showConfirm(
      "Annuler la commande",
      "Êtes-vous sûr de vouloir annuler cette commande ?",
      async () => {
        closeModal();
        try {
          await updateOrderStatus(id, { status: "cancelled", cancellation_reason: "Annulée par le magasin" });
          fetchOrders();
          showAlert("Succès", "La commande a été annulée avec succès.", "success");
        } catch (error) {
          console.error("Failed to cancel order", error);
          showAlert("Erreur", error.response?.data?.message || "Erreur lors de l'annulation", "error");
        }
      }
    );
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, { status: newStatus });
      fetchOrders();
      showAlert("Succès", "Le statut de la commande a été mis à jour.", "success");
    } catch (error) {
      console.error("Failed to update status", error);
      showAlert("Erreur", error.response?.data?.message || "Erreur lors de la mise à jour du statut", "error");
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { style: "bg-amber-100 text-amber-700", icon: <FiClock size={12} />, label: "En attente" };
      case "confirmed":
        return { style: "bg-blue-100 text-blue-700", icon: <FiCheckCircle size={12} />, label: "Confirmée" };
      case "processing":
        return { style: "bg-indigo-100 text-indigo-700", icon: <FiPackage size={12} />, label: "En traitement" };
      case "shipped":
        return { style: "bg-purple-100 text-purple-700", icon: <FiTruck size={12} />, label: "Expédiée" };
      case "delivered":
        return { style: "bg-emerald-100 text-emerald-700", icon: <FiCheckCircle size={12} />, label: "Livrée" };
      case "cancelled":
        return { style: "bg-rose-100 text-rose-700", icon: <FiXCircle size={12} />, label: "Annulée" };
      default:
        return { style: "bg-gray-100 text-gray-700", icon: <FiAlertCircle size={12} />, label: status };
    }
  };

  const getInitials = (name) => {
    if (!name) return "CL";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getClientAvatar = (order) =>
    getImageUrl(order.customer?.client_profile?.avatar_url || order.customer?.client_profile?.profilePicUrl || order.customer?.avatar_url || order.customer?.profile_picture);


  const algWilayas = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane",
  ];

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1f1f1f]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Gestion des Commandes
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Consultez, filtrez et gérez les commandes de votre magasin.</p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e9effd] shadow-sm flex flex-col lg:flex-row gap-4 items-center">
        <form onSubmit={handleSearch} className="flex-1 relative w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par N° commande, client ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </form>
        <div className="flex gap-3 w-full lg:w-auto">
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[150px]"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="processing">En traitement</option>
            <option value="shipped">Expédiée</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>

          <select
            value={filters.wilaya}
            onChange={(e) => {
              setFilters({ ...filters, wilaya: e.target.value });
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[150px]"
          >
            <option value="">Toutes les Wilayas</option>
            {algWilayas.map((w, i) => (
              <option key={i} value={w}>{w}</option>
            ))}
          </select>
          <button type="button" onClick={handleSearch} className="px-5 py-3 bg-[#2563eb] text-white rounded-xl hover:bg-[#1e40af] transition-colors font-medium text-sm">
            Filtrer
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e9effd] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <RiFileList3Line className="text-6xl mb-4 text-[#e9effd]" />
            <p className="text-lg font-medium text-[#1f1f1f]">Aucune commande trouvée</p>
            <p className="text-sm mt-1">Ajustez vos filtres ou effectuez une nouvelle recherche</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-[#e9effd]">
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Commande</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Détails</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9effd]">
                {orders.map((order) => {
                  const clientName = order.customer?.client_profile?.full_name || order.customer?.phone || "Client Anonyme";
                  const wilaya = order.customer?.client_profile?.wilaya || "Inconnu";
                  const { style, icon, label } = getStatusConfig(order.status);
                  
                  return (
                    <tr key={order.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="py-4 px-6 align-top">
                        <span className="font-mono text-sm font-bold text-gray-900 block mb-1">#{order.order_number}</span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <FiCalendar size={10} />
                          {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="py-4 px-6 align-top">
                        <div className="flex items-center gap-3">
                          {getClientAvatar(order) ? (
                            <img src={getClientAvatar(order)} alt={clientName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563eb]/20 to-[#0b3c5d]/20 flex items-center justify-center text-xs font-bold text-[#2563eb] flex-shrink-0">
                              {getInitials(clientName)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{clientName}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <FiMapPin size={10} /> {wilaya}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 align-top">
                        <span className="text-sm font-medium text-gray-800">{order.items?.length || 0} Pièces</span>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-[200px]">
                          {order.items?.map(item => `${item.quantity}x ${item.part_name}`).join(", ")}
                        </div>
                      </td>
                      <td className="py-4 px-6 align-top">
                        <span className="text-sm font-bold text-[#1e3a8a]">{order.total_dzd?.toLocaleString("fr-FR")} DZD</span>
                      </td>
                      <td className="py-4 px-6 align-top">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${style}`}>
                          {icon} {label}
                        </span>
                        
                        {/* Status update buttons */}
                        {order.status === "pending" && (
                           <button onClick={() => handleUpdateStatus(order.id, "confirmed")} className="block mt-2 text-[10px] text-blue-600 hover:underline">
                             Passer en Confirmé
                           </button>
                        )}
                        {order.status === "confirmed" && (
                           <button onClick={() => handleUpdateStatus(order.id, "processing")} className="block mt-2 text-[10px] text-indigo-600 hover:underline">
                             Passer en Traitement
                           </button>
                        )}
                        {order.status === "processing" && (
                           <button onClick={() => handleUpdateStatus(order.id, "shipped")} className="block mt-2 text-[10px] text-purple-600 hover:underline">
                             Marquer Expédiée
                           </button>
                        )}
                      </td>
                      <td className="py-4 px-6 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/store/orders/${order.id}`} className="p-2 bg-gray-50 text-[#2563eb] rounded-lg hover:bg-blue-50 transition border border-gray-100" title="Voir les détails">
                            <FiChevronRight size={16} />
                          </Link>
                          {(order.status === "pending" || order.status === "confirmed") && (
                            <button onClick={() => handleCancelOrder(order.id)} className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition border border-rose-100" title="Annuler la commande">
                              <FiXCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#e9effd] bg-gray-50/30">
            <p className="text-xs text-gray-500">
              Affichage {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} commandes
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition bg-white"
              >
                Précédent
              </button>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.total_pages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition bg-white"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
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
}
