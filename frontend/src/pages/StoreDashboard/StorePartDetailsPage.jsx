import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPartById, updatePart, deletePart, getCategories, createCompatibility, updateCompatibility, deleteCompatibility } from "../../services/partService";
import { getBrands, getModelsByBrand } from "../../services/vehicleService";
import {
  FiArrowLeft,
  FiSave,
  FiTrash2,
  FiUpload,
  FiPackage,
  FiDollarSign,
  FiHash,
  FiLayers,
  FiImage,
  FiCheckCircle,
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

const conditionLabels = { new: "Neuf", used: "Occasion", refurbished: "Reconditionné" };

export default function StorePartDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [part, setPart] = useState(null);
  const [form, setForm] = useState({});
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [partData, cats, brds] = await Promise.all([
          getPartById(id),
          getCategories().catch(() => []),
          getBrands().catch(() => []),
        ]);

        setPart(partData);
        setCategories(Array.isArray(cats) ? cats : []);
        setBrands(Array.isArray(brds) ? brds : []);

        const comp = partData.compatibilities?.[0];
        setForm({
          name: partData.name || "",
          description: partData.description || "",
          category_id: partData.category_id || "",
          sku: partData.sku || "",
          oem_reference: partData.oem_reference || "",
          condition: partData.condition || "new",
          price_dzd: partData.price_dzd || "",
          stock_qty: partData.stock_qty ?? 0,
          weight_kg: partData.weight_kg || "",
          is_active: partData.is_active ?? true,
          // Compatibility
          compatibility_id: comp?.id || "",
          brand_id: comp?.brand?.id || "",
          model_id: comp?.model?.id || "",
          year_from: comp?.year_from || "",
          year_to: comp?.year_to || "",
          engine_variant: comp?.engine_variant || "",
        });

        if (comp?.brand?.id) {
          const mdls = await getModelsByBrand(comp.brand.id).catch(() => []);
          setModels(Array.isArray(mdls) ? mdls : []);
        }
      } catch (error) {
        console.error("Failed to fetch part", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  useEffect(() => {
    if (form.brand_id) {
      getModelsByBrand(form.brand_id).then((data) => setModels(Array.isArray(data) ? data : [])).catch(() => {});
    } else {
      setModels([]);
    }
  }, [form.brand_id]);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setNewImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const formData = new FormData();
      // Append only allowed fields for part update
      ["name", "description", "category_id", "sku", "oem_reference", "condition", "price_dzd", "stock_qty", "weight_kg"].forEach((key) => {
        if (form[key] !== "" && form[key] !== null && form[key] !== undefined) {
          formData.append(key, form[key]);
        }
      });
      newImages.forEach((file) => formData.append("images", file));

      const updated = await updatePart(id, formData);
      
      if (form.brand_id && form.model_id && form.year_from) {
        const compPayload = {
          part_id: id,
          brand_id: form.brand_id,
          model_id: form.model_id,
          year_from: parseInt(form.year_from),
          year_to: form.year_to ? parseInt(form.year_to) : undefined,
          engine_variant: form.engine_variant || undefined,
        };
        try {
          if (form.compatibility_id) {
            await updateCompatibility(form.compatibility_id, compPayload);
          } else {
            const newComp = await createCompatibility(compPayload);
            setForm(p => ({ ...p, compatibility_id: newComp.id }));
          }
        } catch (compErr) {
          console.error("Erreur de compatibilité", compErr);
        }
      } else if (form.compatibility_id) {
        try {
          await deleteCompatibility(form.compatibility_id);
          setForm(p => ({ ...p, compatibility_id: "" }));
        } catch (compErr) {
          console.error("Erreur suppression compatibilité", compErr);
        }
      }

      const refreshedPart = await getPartById(id);
      setPart(refreshedPart);
      
      setNewImages([]);
      setPreviews([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer la pièce "${part?.name}" définitivement ?`)) return;
    try {
      await deletePart(id);
      navigate("/store/parts");
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!part) {
    return (
      <div className="px-6 py-20 text-center">
        <FiAlertTriangle className="mx-auto text-4xl text-rose-400 mb-3" />
        <p className="text-gray-700 font-medium">Pièce introuvable</p>
        <button onClick={() => navigate("/store/parts")} className="mt-4 text-sm text-blue-600 hover:underline">← Retour</button>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/store/parts")} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1f1f1f]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Modifier la Pièce
            </h1>
            <p className="text-xs text-gray-400">ID: {id.slice(0, 8)}...</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {success && (
            <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium animate-pulse">
              <FiCheckCircle size={16} /> Sauvegardé !
            </span>
          )}
          <button onClick={handleDelete} className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition border border-rose-100" title="Supprimer">
            <FiTrash2 size={18} />
          </button>
          <button onClick={handleSave} disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition shadow-lg ${saving ? "bg-blue-400 cursor-not-allowed shadow-none" : "bg-[#2563eb] hover:bg-[#1e40af] shadow-blue-200"}`}>
            <FiSave size={16} /> {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border border-[#e9effd] shadow-sm p-5">
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Images actuelles</label>
        <div className="flex gap-3 flex-wrap mb-4">
          {part.images?.length > 0 ? (
            part.images.map((src, i) => (
              <img key={i} src={src} alt="" className="w-24 h-24 rounded-xl object-cover border border-gray-200 shadow-sm" />
            ))
          ) : (
            <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 border border-gray-200">
              <FiImage size={28} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition text-sm text-gray-500">
            <FiUpload size={16} /> Remplacer les images
            <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
          </label>
          {previews.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {previews.map((src, i) => (
                <img key={i} src={src} alt="" className="w-12 h-12 rounded-lg object-cover border border-blue-200" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Form */}
      <div className="bg-white rounded-2xl border border-[#e9effd] shadow-sm p-5 space-y-5">
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Informations Générales</label>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Nom de la pièce *</label>
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
        </div>

        {/* Category + Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Catégorie</label>
            <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
              <option value="">Aucune</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">État</label>
            <select value={form.condition} onChange={(e) => set("condition", e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
              <option value="new">Neuf</option>
              <option value="used">Occasion</option>
              <option value="refurbished">Reconditionné</option>
            </select>
          </div>
        </div>

        {/* Price + Stock + Weight */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Prix (DZD) *</label>
            <input type="number" min="0" step="0.01" value={form.price_dzd} onChange={(e) => set("price_dzd", e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Quantité en stock
              {form.stock_qty == 0 && <span className="text-rose-500 ml-1">(Rupture !)</span>}
            </label>
            <input type="number" min="0" value={form.stock_qty} onChange={(e) => set("stock_qty", e.target.value)}
              className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${form.stock_qty == 0 ? "border-rose-300 bg-rose-50" : "border-gray-200"}`} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Poids (kg)</label>
            <input type="number" min="0" step="0.1" value={form.weight_kg} onChange={(e) => set("weight_kg", e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
          </div>
        </div>

        {/* SKU + OEM */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">SKU</label>
            <input type="text" value={form.sku} onChange={(e) => set("sku", e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Référence OEM</label>
            <input type="text" value={form.oem_reference} onChange={(e) => set("oem_reference", e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
        </div>
      </div>

      {/* Compatibility */}
      <div className="bg-white rounded-2xl border border-[#e9effd] shadow-sm p-5 space-y-4">
        <label className="block text-[11px] font-bold text-blue-600 uppercase tracking-widest">Compatibilité Véhicule</label>
        <div className="grid grid-cols-2 gap-3">
          <select value={form.brand_id} onChange={(e) => { set("brand_id", e.target.value); set("model_id", ""); }}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
            <option value="">Marque</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={form.model_id} onChange={(e) => set("model_id", e.target.value)} disabled={!form.brand_id}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 disabled:opacity-50">
            <option value="">Modèle</option>
            {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <input type="number" placeholder="Année de" value={form.year_from} onChange={(e) => set("year_from", e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
          <input type="number" placeholder="Année à" value={form.year_to} onChange={(e) => set("year_to", e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
        </div>
        <input type="text" placeholder="Type de moteur (ex: 1.6 HDI)" value={form.engine_variant} onChange={(e) => set("engine_variant", e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
      </div>

      {/* Status info */}
      <div className="bg-white rounded-2xl border border-[#e9effd] shadow-sm p-5">
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Statut de la Pièce</label>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            {part.is_active ? <FiEye className="text-emerald-500" /> : <FiEyeOff className="text-gray-400" />}
            <span className="text-gray-600">{part.is_active ? "Active" : "Inactive"}</span>
          </div>
          <div className="flex items-center gap-2">
            {part.is_verified ? <FiCheckCircle className="text-emerald-500" /> : <FiAlertTriangle className="text-amber-500" />}
            <span className="text-gray-600">{part.is_verified ? "Vérifiée" : "Non vérifiée"}</span>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Vues : </span>
            <span className="font-semibold text-gray-700">{part.views_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
