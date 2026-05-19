import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { getFavorites, removeFavorite } from "../../services/favoriteService";
import {
  FiChevronLeft,
  FiSearch,
  FiShoppingCart,
  FiFilter,
  FiCheck,
  FiHeart,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

const FavoritePiecesPage = () => {
  const { user } = useAuthStore();
  const [pieces, setPieces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    condition: "",
    min_price: "",
    max_price: "",
  });
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
          target_type: "part",
          page: pagination.page,
          limit: pagination.limit,
        });
        const partFavorites = response.favorites || [];
        setPieces(partFavorites);
        setFiltered(partFavorites);
        setPagination((prev) => ({
          ...prev,
          total: response.total || 0,
          total_pages: response.total_pages || 0,
        }));
      } catch (error) {
        console.error("Failed to fetch favorite pieces", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, pagination.page, pagination.limit]);

  useEffect(() => {
    let result = [...pieces];
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.target?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.target?.sku?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (filters.condition) {
      result = result.filter((p) => p.target?.condition === filters.condition);
    }
    if (filters.min_price) {
      result = result.filter(
        (p) => Number(p.target?.price_dzd) >= Number(filters.min_price),
      );
    }
    if (filters.max_price) {
      result = result.filter(
        (p) => Number(p.target?.price_dzd) <= Number(filters.max_price),
      );
    }
    setFiltered(result);
  }, [searchQuery, filters, pieces]);

  const handleRemove = async (targetId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir retirer cette pièce ?"))
      return;
    try {
      await removeFavorite(targetId, "part");
      const response = await getFavorites({
        target_type: "part",
        page: pagination.page,
        limit: pagination.limit,
      });
      setPieces(response.favorites || []);
      setFiltered(response.favorites || []);
    } catch (error) {
      console.error("Failed to remove piece", error);
      alert(error.response?.data?.message || "Erreur");
    }
  };

  const handleAddToCart = (partId) => {
    console.log("Add to cart:", partId);
  };

  const getConditionLabel = (condition) => {
    const map = {
      new: "Neuve",
      used: "Occasion",
      refurbished: "Reconditionnée",
    };
    return map[condition] || condition;
  };

  const getConditionStyle = (condition) => {
    switch (condition) {
      case "new":
        return "bg-emerald-100 text-emerald-700";
      case "used":
        return "bg-amber-100 text-amber-700";
      case "refurbished":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
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
            PIÈCES FAVORITES
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <FiSearch
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Rechercher une pièce..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              <button className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">
                <FiShoppingCart size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.condition}
                onChange={(e) =>
                  setFilters({ ...filters, condition: e.target.value })
                }
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="">État</option>
                <option value="new">Neuve</option>
                <option value="used">Occasion</option>
                <option value="refurbished">Reconditionnée</option>
              </select>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  Min
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.min_price}
                  onChange={(e) =>
                    setFilters({ ...filters, min_price: e.target.value })
                  }
                  className="w-32 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  Max
                </span>
                <input
                  type="number"
                  placeholder="999999"
                  value={filters.max_price}
                  onChange={(e) =>
                    setFilters({ ...filters, max_price: e.target.value })
                  }
                  className="w-32 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <button
                onClick={() =>
                  setFilters({ condition: "", min_price: "", max_price: "" })
                }
                className="px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition">
                <FiFilter size={18} />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <FiHeart size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Aucune pièce favorite</p>
            <p className="text-sm mt-1">
              Ajoutez des pièces à vos favoris depuis le catalogue
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {filtered.map((fav) => {
              const piece = fav.target;
              if (!piece) return null;
              return (
                <div
                  key={fav.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={piece.images?.[0] || "/placeholder-piece.png"}
                      alt={piece.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={() => handleRemove(fav.target_id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-500 shadow-sm hover:bg-rose-50 transition">
                      <FiHeart size={16} className="fill-current" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                      {piece.name || "N/A"}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">
                      {piece.sku || "N/A"}
                    </p>
                    <p className="text-xs text-gray-400 mb-1">
                      {piece.seller?.store_name || "N/A"}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getConditionStyle(piece.condition)}`}>
                        {getConditionLabel(piece.condition)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          piece.stock_qty > 0 && piece.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                        {piece.stock_qty > 0 && piece.is_active
                          ? "En stock"
                          : "Rupture"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-blue-600">
                        {Number(piece.price_dzd).toLocaleString("fr-FR")} Da
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {piece.stock_qty} dispo
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(piece.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition">
                        Achetez <FiPlus size={14} />
                      </button>
                      <Link
                        to={`/parts/${piece.id}`}
                        className="flex-1 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 text-xs font-medium py-2.5 rounded-xl flex items-center justify-center transition">
                        Voir plus
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

export default FavoritePiecesPage;
