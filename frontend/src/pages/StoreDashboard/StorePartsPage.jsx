import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getMyParts, deletePart, getCategories } from "../../services/partService";
import { getBrands, getModelsByBrand } from "../../services/vehicleService";
import CreatePartModal from "./CreatePartModal";
import UploadCSVModal from "./UploadCSVModal";
import {
  FiSearch,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiPackage,
  FiEye,
  FiChevronRight,
  FiBox,
  FiDollarSign,
  FiFilter,
  FiUpload,
} from "react-icons/fi";
import { RiFileList3Line } from "react-icons/ri";

const conditionLabels = { new: "Neuf", used: "Occasion", refurbished: "Reconditionné" };
const conditionStyles = {
  new: "bg-emerald-100 text-emerald-700",
  used: "bg-amber-100 text-amber-700",
  refurbished: "bg-violet-100 text-violet-700",
};

export default function StorePartsPage() {
  const [parts, setParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ category_id: "", condition: "" });

  // Pagination
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, total_pages: 0 });

  // Filter options
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then((data) => setCategories(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const fetchParts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getMyParts({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        category_id: filters.category_id || undefined,
        condition: filters.condition || undefined,
      });
      setParts(response.parts || []);
      setPagination((p) => ({
        ...p,
        total: response.total || 0,
        total_pages: response.total_pages || 0,
      }));
    } catch (error) {
      console.error("Failed to fetch parts", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, filters.category_id, filters.condition]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer la pièce "${name}" ?`)) return;
    try {
      await deletePart(id);
      fetchParts();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handlePartCreated = () => {
    setShowModal(false);
    setPagination((p) => ({ ...p, page: 1 }));
    fetchParts();
  };

  const handleCSVUploaded = () => {
    setShowCSVModal(false);
    setPagination((p) => ({ ...p, page: 1 }));
    fetchParts();
  };

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1f1f1f]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Gestion des Pièces
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Ajoutez, modifiez et gérez les pièces de votre magasin.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCSVModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-white text-[#2563eb] border-2 border-[#2563eb] rounded-xl hover:bg-blue-50 transition-colors font-semibold text-sm"
          >
            <FiUpload size={18} /> Importer CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-[#2563eb] text-white rounded-xl hover:bg-[#1e40af] transition-colors font-semibold text-sm shadow-lg shadow-blue-200"
          >
            <FiPlus size={18} /> Ajouter une Pièce
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#e9effd] shadow-sm flex flex-col lg:flex-row gap-4 items-center">
        <form onSubmit={handleSearch} className="flex-1 relative w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom de pièce..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </form>
        <div className="flex gap-3 w-full lg:w-auto">
          <select
            value={filters.category_id}
            onChange={(e) => {
              setFilters({ ...filters, category_id: e.target.value });
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[160px]"
          >
            <option value="">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filters.condition}
            onChange={(e) => {
              setFilters({ ...filters, condition: e.target.value });
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[140px]"
          >
            <option value="">Tous états</option>
            <option value="new">Neuf</option>
            <option value="used">Occasion</option>
            <option value="refurbished">Reconditionné</option>
          </select>
          <button type="button" onClick={handleSearch} className="px-5 py-3 bg-[#2563eb] text-white rounded-xl hover:bg-[#1e40af] transition-colors font-medium text-sm">
            <FiFilter size={16} />
          </button>
        </div>
      </div>

      {/* Parts Grid / Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e9effd] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full" />
          </div>
        ) : parts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FiBox className="text-6xl mb-4 text-[#e9effd]" />
            <p className="text-lg font-medium text-[#1f1f1f]">Aucune pièce trouvée</p>
            <p className="text-sm mt-1">Ajoutez votre première pièce pour commencer</p>
            <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-medium hover:bg-[#1e40af] transition">
              <FiPlus className="inline mr-1" size={14} /> Ajouter une Pièce
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-[#e9effd]">
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pièce</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Compatibilité</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prix</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">État</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9effd]">
                {parts.map((part) => {
                  const comp = part.compatibilities?.[0];
                  const cond = part.condition || "new";

                  return (
                    <tr key={part.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="py-4 px-6 align-top">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                            {part.images?.[0] ? (
                              <img src={part.images[0]} alt={part.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <FiPackage size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{part.name}</p>
                            {part.sku && <p className="text-[11px] text-gray-400 font-mono">SKU: {part.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 align-top">
                        <span className="text-sm text-gray-700">{part.category?.name || "—"}</span>
                      </td>
                      <td className="py-4 px-6 align-top">
                        {comp ? (
                          <div>
                            <p className="text-sm font-medium text-gray-800">{comp.brand?.name} {comp.model?.name}</p>
                            <p className="text-xs text-gray-400">{comp.year_from}{comp.year_to ? ` - ${comp.year_to}` : ""} {comp.engine_variant ? `· ${comp.engine_variant}` : ""}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Universel</span>
                        )}
                      </td>
                      <td className="py-4 px-6 align-top">
                        <span className="text-sm font-bold text-[#1e3a8a]">{Number(part.price_dzd).toLocaleString("fr-FR")} DZD</span>
                      </td>
                      <td className="py-4 px-6 align-top">
                        <span className={`text-sm font-bold ${part.stock_qty > 5 ? "text-emerald-600" : part.stock_qty > 0 ? "text-amber-600" : "text-rose-600"}`}>
                          {part.stock_qty}
                        </span>
                        {part.stock_qty === 0 && <p className="text-[10px] text-rose-500 font-medium">Rupture</p>}
                      </td>
                      <td className="py-4 px-6 align-top">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${conditionStyles[cond] || "bg-gray-100 text-gray-700"}`}>
                          {conditionLabels[cond] || cond}
                        </span>
                      </td>
                      <td className="py-4 px-6 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/store/parts/${part.id}`}
                            className="p-2 bg-gray-50 text-[#2563eb] rounded-lg hover:bg-blue-50 transition border border-gray-100"
                            title="Voir / Modifier"
                          >
                            <FiEdit3 size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(part.id, part.name)}
                            className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition border border-rose-100"
                            title="Supprimer"
                          >
                            <FiTrash2 size={15} />
                          </button>
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
              Affichage {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} pièces
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

      {/* Create Part Modal */}
      {showModal && (
        <CreatePartModal
          onClose={() => setShowModal(false)}
          onCreated={handlePartCreated}
          categories={categories}
        />
      )}

      {/* CSV Upload Modal */}
      {showCSVModal && (
        <UploadCSVModal
          onClose={() => setShowCSVModal(false)}
          onUploaded={handleCSVUploaded}
          categories={categories}
        />
      )}
    </div>
  );
}
