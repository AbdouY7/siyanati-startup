import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { getFavorites, removeFavorite } from "../../services/favoriteService";
import {
  FiChevronLeft,
  FiSearch,
  FiPlus,
  FiMessageSquare,
  FiInfo,
  FiStar,
  FiMapPin,
  FiHome,
  FiHeart,
  FiTrash2,
} from "react-icons/fi";

const FollowedStoresPage = () => {
  const { user } = useAuthStore();
  const [stores, setStores] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const response = await getFavorites({
          target_type: "store",
          page: pagination.page,
          limit: pagination.limit,
        });
        const storeFavorites = response.favorites || [];
        setStores(storeFavorites);
        setFiltered(storeFavorites);
        setPagination((prev) => ({
          ...prev,
          total: response.total || 0,
          total_pages: response.total_pages || 0,
        }));
      } catch (error) {
        console.error("Failed to fetch followed stores", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, pagination.page, pagination.limit]);

  useEffect(() => {
    if (searchQuery) {
      setFiltered(
        stores.filter(
          (s) =>
            s.target?.store_name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            s.target?.owner_name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            s.target?.wilaya?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    } else {
      setFiltered(stores);
    }
  }, [searchQuery, stores]);

  const handleUnfollow = async (targetId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir ne plus suivre ce magasin ?"))
      return;
    try {
      await removeFavorite(targetId, "store");
      const response = await getFavorites({
        target_type: "store",
        page: pagination.page,
        limit: pagination.limit,
      });
      setStores(response.favorites || []);
      setFiltered(response.favorites || []);
    } catch (error) {
      console.error("Failed to unfollow store", error);
      alert(error.response?.data?.message || "Erreur");
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
            MAGASINS SUIVIS
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <FiSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Rechercher un magasin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <FiHome size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Aucun magasin suivi</p>
            <p className="text-sm mt-1">
              Ajoutez des magasins à vos favoris depuis le catalogue
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {filtered.map((fav) => {
              const store = fav.target;
              if (!store) return null;
              return (
                <div
                  key={fav.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                  <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                    <img
                      src={
                        store.images?.[0] ||
                        store.logo_url ||
                        "/placeholder-store.png"
                      }
                      alt={store.store_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-1">
                      {store.store_name || "N/A"}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">
                      {store.owner_name || "N/A"}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                      <FiMapPin size={10} />
                      {store.wilaya || "N/A"}
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <FiStar
                          className="text-amber-400 fill-amber-400"
                          size={14}
                        />
                        <span className="text-sm font-semibold text-blue-600">
                          {Number(store.rating_avg).toFixed(1) || "0.0"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          ({store.rating_count || 0})
                        </span>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          store.status === "approved" && !store.is_frozen
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                        {store.status === "approved" && !store.is_frozen
                          ? "Ouvert"
                          : "Fermé"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/messages/${store.user_id}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition">
                        Discussion <FiMessageSquare size={14} />
                      </Link>
                      <button
                        onClick={() => handleUnfollow(fav.target_id)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition"
                        title="Ne plus suivre">
                        <FiHeart size={16} className="fill-current" />
                      </button>
                      <Link
                        to={`/stores/${store.id}`}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                        <FiInfo size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition">
              Précédent
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700">
              {pagination.page} / {pagination.total_pages}
            </span>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page === pagination.total_pages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition">
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowedStoresPage;
