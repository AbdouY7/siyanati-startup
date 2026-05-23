import React, { useState, useEffect } from "react";
import { createPart } from "../../services/partService";
import { getBrands, getModelsByBrand } from "../../services/vehicleService";
import { FiX, FiUpload, FiPackage, FiDollarSign, FiHash, FiFileText, FiLayers, FiImage } from "react-icons/fi";

export default function CreatePartModal({ onClose, onCreated, categories = [] }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category_id: "",
    sku: "",
    oem_reference: "",
    condition: "new",
    price_dzd: "",
    stock_qty: "1",
    weight_kg: "",
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Compatibility
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [compat, setCompat] = useState({ brand_id: "", model_id: "", year_from: "", year_to: "", engine_variant: "" });

  useEffect(() => {
    getBrands().then((data) => setBrands(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (compat.brand_id) {
      getModelsByBrand(compat.brand_id).then((data) => setModels(Array.isArray(data) ? data : [])).catch(() => {});
    } else {
      setModels([]);
    }
  }, [compat.brand_id]);

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const setC = (key, val) => {
    setCompat((p) => ({ ...p, [key]: val }));
    if (key === "brand_id") setCompat((p) => ({ ...p, model_id: "", [key]: val }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nom obligatoire";
    if (!form.price_dzd || Number(form.price_dzd) <= 0) e.price_dzd = "Prix invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const formData = new FormData();
      // Append part fields
      Object.entries(form).forEach(([key, val]) => {
        if (val !== "" && val !== null && val !== undefined) {
          formData.append(key, val);
        }
      });
      // Append images
      images.forEach((file) => formData.append("images", file));

      const part = await createPart(formData);

      // If compatibility info provided, we would need a separate endpoint.
      // For now the part is created without compatibility (that can be added in the edit page).
      onCreated(part);
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.errors || "Erreur lors de la création";
      if (typeof msg === "object") {
        setErrors(msg);
      } else {
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#e9effd]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e9effd] sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-[#1f1f1f]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Ajouter une Nouvelle Pièce
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Remplissez les informations de la pièce</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nom de la pièce *</label>
            <div className={`flex items-center gap-2 bg-gray-50 border rounded-xl px-3.5 py-2.5 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
              <FiPackage size={15} className="text-gray-300" />
              <input type="text" placeholder="Ex: Filtre à huile Hyundai" value={form.name} onChange={(e) => set("name", e.target.value)}
                className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-300 bg-transparent" />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Category + Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Catégorie</label>
              <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
                <option value="">Sélectionner...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">État</label>
              <select value={form.condition} onChange={(e) => set("condition", e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
                <option value="new">Neuf</option>
                <option value="used">Occasion</option>
                <option value="refurbished">Reconditionné</option>
              </select>
            </div>
          </div>

          {/* Price + Stock + Weight */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Prix (DZD) *</label>
              <div className={`flex items-center gap-2 bg-gray-50 border rounded-xl px-3.5 py-2.5 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 ${errors.price_dzd ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                <FiDollarSign size={15} className="text-gray-300" />
                <input type="number" min="0" step="0.01" placeholder="0.00" value={form.price_dzd} onChange={(e) => set("price_dzd", e.target.value)}
                  className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-300 bg-transparent" />
              </div>
              {errors.price_dzd && <p className="text-red-500 text-xs mt-1">{errors.price_dzd}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Quantité</label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400">
                <FiHash size={15} className="text-gray-300" />
                <input type="number" min="0" placeholder="1" value={form.stock_qty} onChange={(e) => set("stock_qty", e.target.value)}
                  className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-300 bg-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Poids (kg)</label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400">
                <FiLayers size={15} className="text-gray-300" />
                <input type="number" min="0" step="0.1" placeholder="0.0" value={form.weight_kg} onChange={(e) => set("weight_kg", e.target.value)}
                  className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-300 bg-transparent" />
              </div>
            </div>
          </div>

          {/* SKU + OEM */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">SKU</label>
              <input type="text" placeholder="Référence interne" value={form.sku} onChange={(e) => set("sku", e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Référence OEM</label>
              <input type="text" placeholder="Référence constructeur" value={form.oem_reference} onChange={(e) => set("oem_reference", e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
            <textarea placeholder="Description détaillée de la pièce..." value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
          </div>

          {/* Images */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Images (max 5)</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition text-sm text-gray-500">
                <FiUpload size={16} />
                Choisir des images
                <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
              </label>
              {previews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {previews.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Compatibility Section */}
          <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-4">
            <label className="block text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3">Compatibilité (optionnel)</label>
            <div className="grid grid-cols-2 gap-3">
              <select value={compat.brand_id} onChange={(e) => setC("brand_id", e.target.value)}
                className="bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="">Marque</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <select value={compat.model_id} onChange={(e) => setC("model_id", e.target.value)} disabled={!compat.brand_id}
                className="bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50">
                <option value="">Modèle</option>
                {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input type="number" placeholder="Année de" value={compat.year_from} onChange={(e) => setC("year_from", e.target.value)}
                className="bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              <input type="number" placeholder="Année à" value={compat.year_to} onChange={(e) => setC("year_to", e.target.value)}
                className="bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <input type="text" placeholder="Type de moteur (ex: 1.6 HDI)" value={compat.engine_variant} onChange={(e) => setC("engine_variant", e.target.value)}
              className="w-full mt-3 bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e9effd] sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl transition shadow-lg ${loading ? "bg-blue-400 cursor-not-allowed shadow-none" : "bg-[#2563eb] hover:bg-[#1e40af] shadow-blue-200"}`}>
            {loading ? "Création..." : "Créer la Pièce"}
          </button>
        </div>
      </div>
    </div>
  );
}
