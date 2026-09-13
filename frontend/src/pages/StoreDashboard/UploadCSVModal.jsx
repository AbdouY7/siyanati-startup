import React, { useState } from "react";
import { FiX, FiUpload, FiFileText, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { createBulkParts } from "../../services/partService";

export default function UploadCSVModal({ onClose, onUploaded, categories = [] }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith(".csv")) {
      setFile(selected);
      setError("");
      parseCSV(selected);
    } else {
      setFile(null);
      setPreview([]);
      setError("Veuillez sélectionner un fichier CSV valide.");
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setError("Le fichier CSV est vide ou ne contient pas de données.");
        return;
      }

      // Basic simple CSV parser (assuming comma separated, no complex quotes)
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const data = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        const row = {};
        headers.forEach((h, index) => {
          row[h] = values[index] ? values[index].trim() : "";
        });
        
        // Ensure required fields mapping
        if (row.name && row.price_dzd) {
          data.push({
            name: row.name,
            sku: row.sku || null,
            description: row.description || null,
            price_dzd: parseFloat(row.price_dzd) || 0,
            stock_qty: parseInt(row.stock_qty, 10) || 0,
            condition: row.condition === "used" || row.condition === "refurbished" ? row.condition : "new",
            oem_reference: row.oem_reference || null,
          });
        }
      }
      
      if (data.length === 0) {
        setError("Aucune ligne valide trouvée. Assurez-vous d'avoir les colonnes 'name' et 'price_dzd'.");
      } else {
        setPreview(data);
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (preview.length === 0) return;
    
    setLoading(true);
    setError("");

    try {
      const partsData = preview.map(p => ({
        ...p,
        category_id: selectedCategory || null
      }));

      await createBulkParts(partsData);
      onUploaded();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'importation. Vérifiez vos données.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Importer depuis un CSV</h2>
            <p className="text-sm text-gray-500">Format attendu: name, price_dzd, stock_qty, condition, sku</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
              <FiAlertCircle className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="mb-6 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fichier CSV</label>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="flex items-center gap-2 px-4 py-3 border border-gray-200 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition"
                >
                  <FiFileText className="text-gray-400" size={20} />
                  <span className="text-sm text-gray-600 flex-1 truncate">
                    {file ? file.name : "Cliquez pour sélectionner un fichier"}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium">Parcourir</span>
                </label>
              </div>
            </div>

            <div className="w-1/3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie par défaut</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Sélectionnez une catégorie...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {preview.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">Aperçu des données</h3>
                <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-full">
                  {preview.length} pièces trouvées
                </span>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="py-2 px-4 font-semibold text-gray-600">Nom</th>
                      <th className="py-2 px-4 font-semibold text-gray-600">SKU</th>
                      <th className="py-2 px-4 font-semibold text-gray-600">Prix</th>
                      <th className="py-2 px-4 font-semibold text-gray-600">Stock</th>
                      <th className="py-2 px-4 font-semibold text-gray-600">État</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {preview.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2 px-4 truncate max-w-[150px]" title={row.name}>{row.name}</td>
                        <td className="py-2 px-4 text-gray-500">{row.sku || "—"}</td>
                        <td className="py-2 px-4 font-medium text-blue-600">{row.price_dzd} DA</td>
                        <td className="py-2 px-4">{row.stock_qty}</td>
                        <td className="py-2 px-4">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            {row.condition}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={handleUpload}
            disabled={preview.length === 0 || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] text-white text-sm font-semibold rounded-xl hover:bg-[#1e40af] transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FiCheckCircle size={16} />
            )}
            {loading ? "Importation..." : "Confirmer l'importation"}
          </button>
        </div>
      </div>
    </div>
  );
}
