import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { getOrderHistory, cancelOrder, updateOrderStatus } from "../../services/orderService";
import useWorkflowSubscription from "../../hooks/useWorkflowSubscription";
import {
  FiChevronLeft,
  FiSearch,
  FiFilter,
  FiChevronRight,
  FiShoppingBag,
  FiCalendar,
  FiDollarSign,
  FiPackage,
  FiHome,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiRotateCcw,
  FiAlertCircle,
} from "react-icons/fi";
import PopupModal from "../../components/ui/PopupModal";

const OrderHistoryPage = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    delivery_type: "",
    from_date: "",
    to_date: "",
  });
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

  const fetchOrders = React.useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await getOrderHistory({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
        delivery_type: filters.delivery_type || undefined,
        from_date: filters.from_date || undefined,
        to_date: filters.to_date || undefined,
      });

      setOrders(response.orders || []);
      setFilteredOrders(response.orders || []);
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
  }, [
    user,
    pagination.page,
    pagination.limit,
    filters.status,
    filters.delivery_type,
    filters.from_date,
    filters.to_date,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useWorkflowSubscription({
    entityType: "order",
    onUpdate: () => {
      fetchOrders();
    }
  });

  useEffect(() => {
    if (searchQuery) {
      setFilteredOrders(
        orders.filter(
          (o) =>
            o.id?.toString().includes(searchQuery) ||
            o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.store?.store_name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()),
        ),
      );
    } else {
      setFilteredOrders(orders);
    }
  }, [searchQuery, orders]);

  const handleCancel = (id) => {
    showConfirm(
      "Annuler la commande",
      "Êtes-vous sûr de vouloir annuler cette commande ?",
      async () => {
        closeModal();
        try {
          await cancelOrder(id);
          const response = await getOrderHistory({
            page: pagination.page,
            limit: pagination.limit,
          });
          setOrders(response.orders || []);
          setFilteredOrders(response.orders || []);
          showAlert("Succès", "La commande a été annulée avec succès.", "success");
        } catch (error) {
          console.error("Failed to cancel order", error);
          showAlert("Erreur", error.response?.data?.message || "Erreur lors de l'annulation", "error");
        }
      }
    );
  };

  const handleConfirmDelivery = (id) => {
    showConfirm(
      "Confirmer la réception",
      "Confirmez-vous la réception de cette commande ?",
      async () => {
        closeModal();
        try {
          await updateOrderStatus(id, { status: "delivered" });
          const response = await getOrderHistory({
            page: pagination.page,
            limit: pagination.limit,
          });
          setOrders(response.orders || []);
          setFilteredOrders(response.orders || []);
          showAlert("Succès", "Réception de la commande confirmée.", "success");
        } catch (error) {
          console.error("Failed to confirm delivery", error);
          showAlert("Erreur", error.response?.data?.message || "Erreur lors de la confirmation", "error");
        }
      }
    );
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          style: "bg-amber-100 text-amber-700 border-amber-200",
          icon: <FiClock size={12} />,
          label: "En attente",
        };
      case "confirmed":
        return {
          style: "bg-blue-100 text-blue-700 border-blue-200",
          icon: <FiCheckCircle size={12} />,
          label: "Confirmée",
        };
      case "processing":
        return {
          style: "bg-indigo-100 text-indigo-700 border-indigo-200",
          icon: <FiPackage size={12} />,
          label: "En préparation",
        };
      case "shipped":
        return {
          style: "bg-purple-100 text-purple-700 border-purple-200",
          icon: <FiTruck size={12} />,
          label: "Expédiée",
        };
      case "delivered":
        return {
          style: "bg-emerald-100 text-emerald-700 border-emerald-200",
          icon: <FiCheckCircle size={12} />,
          label: "Livrée",
        };
      case "cancelled":
        return {
          style: "bg-rose-100 text-rose-700 border-rose-200",
          icon: <FiXCircle size={12} />,
          label: "Annulée",
        };
      case "refunded":
        return {
          style: "bg-gray-100 text-gray-700 border-gray-200",
          icon: <FiRotateCcw size={12} />,
          label: "Remboursée",
        };
      default:
        return {
          style: "bg-gray-100 text-gray-700 border-gray-200",
          icon: <FiAlertCircle size={12} />,
          label: status,
        };
    }
  };

  const getStatusStyle = (status) => getStatusConfig(status).style;
  const getStatusLabel = (status) => getStatusConfig(status).label;
  const getStatusIcon = (status) => getStatusConfig(status).icon;
  const canCancel = (status) => status?.toLowerCase() === "pending";

  const getDeliveryLabel = (type) => {
    switch (type?.toLowerCase()) {
      case "home_delivery":
        return "Livraison à domicile";
      case "store_pickup":
        return "Retrait en magasin";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 pt-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/profile"
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-sm">
            <FiChevronLeft size={20} />
          </Link>
          <h2 className="text-3xl font-bold text-[#1e3a8a] tracking-tight">
            HISTORIQUE DES COMMANDES
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Rechercher par N° commande ou magasin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[160px]">
                <option value="">Statut</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="processing">En préparation</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
                <option value="refunded">Remboursée</option>
              </select>
              <select
                value={filters.delivery_type}
                onChange={(e) =>
                  setFilters({ ...filters, delivery_type: e.target.value })
                }
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[160px]">
                <option value="">Livraison</option>
                <option value="home_delivery">Domicile</option>
                <option value="store_pickup">Magasin</option>
              </select>
              <input
                type="date"
                value={filters.from_date}
                onChange={(e) =>
                  setFilters({ ...filters, from_date: e.target.value })
                }
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Date début"
              />
              <input
                type="date"
                value={filters.to_date}
                onChange={(e) =>
                  setFilters({ ...filters, to_date: e.target.value })
                }
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Date fin"
              />
              <button
                onClick={() =>
                  setFilters({
                    status: "",
                    delivery_type: "",
                    from_date: "",
                    to_date: "",
                  })
                }
                className="px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition">
                <FiFilter size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FiShoppingBag size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucune commande trouvée</p>
              <p className="text-sm mt-1">Vos commandes apparaîtront ici</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        N° Commande
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Magasin
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Articles
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <FiCalendar size={12} /> Date
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Livraison
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <FiDollarSign size={12} /> Total
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-blue-50/30 transition group">
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-mono text-sm font-bold text-gray-900">
                              {order.order_number ||
                                `#${order.id?.toString().slice(-6)}`}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {order.items?.length || 0} article
                              {(order.items?.length || 0) > 1 ? "s" : ""}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden">
                              {order.store?.logo_url ? (
                                <img
                                  src={order.store.logo_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FiHome size={14} />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {order.store?.store_name || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            {(order.items || [])
                              .slice(0, 2)
                              .map((item, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs text-gray-600">
                                  {item.quantity}x {item.part_name}
                                </span>
                              ))}
                            {(order.items || []).length > 2 && (
                              <span className="text-[10px] text-gray-400">
                                +{(order.items || []).length - 2} autres
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs text-gray-600">
                            {getDeliveryLabel(order.delivery_type)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-bold text-[#1e3a8a]">
                            {order.total_dzd?.toLocaleString("fr-FR")} DA
                          </span>
                          {order.discount_dzd > 0 && (
                            <span className="text-[10px] text-emerald-600 block">
                              -{order.discount_dzd?.toLocaleString("fr-FR")} DA
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusStyle(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/profile/orders/${order.id}`}
                              className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition">
                              Voir plus <FiChevronRight size={14} />
                            </Link>
                            {order.status === "shipped" && (
                              <button
                                onClick={() => handleConfirmDelivery(order.id)}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition"
                                title="Confirmer la réception">
                                <FiCheckCircle size={14} /> Reçu
                              </button>
                            )}
                            {canCancel(order.status) && (
                              <button
                                onClick={() => handleCancel(order.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition"
                                title="Annuler">
                                <FiXCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Affichage {(pagination.page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total,
                    )}{" "}
                    sur {pagination.total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setPagination((p) => ({ ...p, page: p.page - 1 }))
                      }
                      disabled={pagination.page === 1}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition">
                      Précédent
                    </button>
                    <span className="px-3 py-2 text-sm font-medium text-gray-700">
                      {pagination.page} / {pagination.total_pages}
                    </span>
                    <button
                      onClick={() =>
                        setPagination((p) => ({ ...p, page: p.page + 1 }))
                      }
                      disabled={pagination.page === pagination.total_pages}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition">
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
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

export default OrderHistoryPage;
