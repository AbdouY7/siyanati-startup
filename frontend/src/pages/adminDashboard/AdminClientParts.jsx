import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiBox, FiEye, FiFilter, FiSearch } from "react-icons/fi";
import { getClientDetailsAdmin } from "../../services/adminService";
import { getAllParts } from "../../services/partService";

const getFirstCompatibility = (part) => part.compatibilities?.[0] || {};

const uniqueOptions = (items, getValue) =>
  [...new Set(items.map(getValue).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b)),
  );

const formatCondition = (condition) => {
  const labels = {
    new: "Neuf",
    used: "Occasion",
    refurbished: "Reconditionné",
  };
  return labels[condition] || condition || "N/A";
};

const AdminClientParts = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    model: "",
    engine: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientData, partsData] = await Promise.all([
          getClientDetailsAdmin(id),
          getAllParts({ seller_id: id, seller_type: "client" }),
        ]);
        setClient(clientData);
        setParts(partsData || []);
        setError(null);
      } catch (err) {
        setError("Impossible de récupérer les pièces du client.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const filterOptions = useMemo(
    () => ({
      categories: uniqueOptions(parts, (part) => part.category?.name),
      brands: uniqueOptions(
        parts,
        (part) => getFirstCompatibility(part).brand?.name,
      ),
      models: uniqueOptions(
        parts,
        (part) => getFirstCompatibility(part).model?.name,
      ),
      engines: uniqueOptions(
        parts,
        (part) => getFirstCompatibility(part).engine_variant,
      ),
    }),
    [parts],
  );

  const filteredParts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return parts.filter((part) => {
      const comp = getFirstCompatibility(part);
      const category = part.category?.name || "";
      const brand = comp.brand?.name || "";
      const model = comp.model?.name || "";
      const engine = comp.engine_variant || "";

      const matchesSearch =
        !q ||
        [
          part.name,
          part.sku,
          part.oem_reference,
          category,
          brand,
          model,
          engine,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));

      return (
        matchesSearch &&
        (!filters.category || category === filters.category) &&
        (!filters.brand || brand === filters.brand) &&
        (!filters.model || model === filters.model) &&
        (!filters.engine || engine === filters.engine)
      );
    });
  }, [filters, parts, search]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setSearch("");
    setFilters({ category: "", brand: "", model: "", engine: "" });
  };

  const clientName = client?.client_profile?.full_name || client?.email || "Client";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link
        to={`/admin/clients/${id}`}
        title="Retour aux détails du client"
        className="p-2 w-fit rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition flex items-center justify-center mb-6">
        <FiArrowLeft size={20} />
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Pièces du client
            </p>
            <h1 className="text-2xl font-bold text-gray-900">{clientName}</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-4 py-2 text-sm font-semibold self-start lg:self-auto">
            <FiBox /> {filteredParts.length} / {parts.length} pièces
          </div>
        </div>

        {error && (
          <div className="m-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-col xl:flex-row gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, SKU, catégorie, marque, modèle..."
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400">
              <option value="">Toutes les catégories</option>
              {filterOptions.categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={filters.brand}
              onChange={(e) => updateFilter("brand", e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400">
              <option value="">Toutes les marques</option>
              {filterOptions.brands.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={filters.model}
              onChange={(e) => updateFilter("model", e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400">
              <option value="">Tous les modèles</option>
              {filterOptions.models.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={filters.engine}
              onChange={(e) => updateFilter("engine", e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400">
              <option value="">Tous les moteurs</option>
              {filterOptions.engines.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100">
              <FiFilter /> Réinitialiser
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Pièce
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Catégorie
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Marque
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Modèle
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Moteur
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Stock
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredParts.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-16 text-center text-gray-500">
                    Aucune pièce trouvée pour ce client.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const comp = getFirstCompatibility(part);
                  return (
                    <tr key={part.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={part.images?.[0] || "/placeholder-part.png"}
                            alt={part.name}
                            className="h-12 w-12 rounded-lg object-cover bg-gray-100 border border-gray-100"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {part.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatCondition(part.condition)}{" "}
                              {part.sku ? `- SKU ${part.sku}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {part.category?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {comp.brand?.name || "Universel"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {comp.model?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {comp.engine_variant || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {part.stock_qty}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admin/parts/${part.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
                          <FiEye /> Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminClientParts;
