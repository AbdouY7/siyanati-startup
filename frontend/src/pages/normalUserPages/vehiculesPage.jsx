import React, { useEffect, useState, useRef } from "react";
import useVehicleStore from "../../store/useVehiculeStore";
import { Link } from "react-router-dom";

// ─── Health Bar ───────────────────────────────────────────────────────────────
const HealthBar = ({ value = 0 }) => {
  const pct = Math.min(100, Math.max(0, Number(value)));
  const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-500">Voiture Santé</span>
        <span className="text-xs font-bold" style={{ color }}>
          {pct}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// ─── Vehicle Card ─────────────────────────────────────────────────────────────
const VehicleCard = ({ vehicle, onEdit, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const brand = vehicle.brand?.name || vehicle.brand || "—";
  const model = vehicle.model?.name || vehicle.model || "—";
  // ✅ UPDATED: Use vehicule_picture_url from backend
  const image =
    vehicle.vehicule_picture_url || vehicle.image || vehicle.photo || null;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      <div className="relative h-44 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={`${brand} ${model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-blue-200">
            <svg
              className="w-20 h-20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1m0-6h9l3 4"
              />
            </svg>
            <span className="text-sm mt-1 text-blue-300 font-medium">
              {brand} {model}
            </span>
          </div>
        )}
        {vehicle.year && (
          <span className="absolute top-3 right-3 bg-[#1a3a8f] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            {vehicle.year}
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-base font-bold text-gray-800 mb-3">
          Voiture informations
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm flex-1">
          <InfoRow label="Marque" value={brand} />
          <InfoRow label="Modèle" value={model} />
          <InfoRow label="Année" value={vehicle.year} />
          <InfoRow
            label="Immatriculation"
            value={vehicle.registration_number || vehicle.immatriculation}
          />
          <InfoRow
            label="Type de moteur"
            value={vehicle.engine_type || vehicle.moteur}
          />
          <InfoRow
            label="Type de carburant"
            value={vehicle.fuel_type || vehicle.carburant}
          />
        </div>
        <HealthBar value={vehicle.health_status ?? vehicle.sante ?? 0} />

        <div className="flex items-center gap-2 mt-4">
          {confirmDelete ? (
            <>
              <span className="text-xs text-red-600 flex-1">
                Confirmer la suppression ?
              </span>
              <button
                onClick={() => {
                  onDelete(vehicle.id);
                  setConfirmDelete(false);
                }}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition">
                Oui
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition">
                Non
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(vehicle)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#1a3a8f] text-white text-sm font-semibold rounded-xl hover:bg-[#15307a] transition">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Modifier
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
                title="Supprimer">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-gray-400 text-xs">{label} :</p>
    <p className="text-[#1a3a8f] font-semibold text-sm truncate">
      {value || "—"}
    </p>
  </div>
);

// ─── Add Card ─────────────────────────────────────────────────────────────────
const AddVehicleCard = ({ onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-2xl shadow-md border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[360px] gap-3 hover:border-[#1a3a8f] hover:shadow-lg transition-all duration-300 group cursor-pointer">
    <div className="w-14 h-14 bg-[#1a3a8f] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
      <svg
        className="w-7 h-7 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </div>
    <span className="text-gray-400 text-sm font-medium group-hover:text-[#1a3a8f] transition-colors">
      Ajoutez nouvel voiture
    </span>
  </button>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const FUEL_TYPES = ["Essence", "Diesel", "Hybride", "Électrique", "GPL"];

const EMPTY_FORM = {
  brand_id: "",
  model_id: "",
  year: "",
  fuel_type: "",
  registration_number: "",
  vin: "",
  health_status: 0,
};

const VehicleModal = ({
  open,
  onClose,
  onSubmit,
  brands,
  models,
  onBrandChange,
  brandsLoading,
  modelsLoading,
  initialData,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Image state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(null);
  const imageInputRef = useRef();
  const overlayRef = useRef();

  const isEdit = !!initialData;

  // Init form on open
  useEffect(() => {
    if (!open) return;
    setForm(
      initialData
        ? {
            brand_id: initialData.brand?.id || initialData.brand_id || "",
            model_id: initialData.model?.id || initialData.model_id || "",
            year: initialData.year || "",
            fuel_type: initialData.fuel_type || initialData.carburant || "",
            registration_number: initialData.registration_number || "",
            vin: initialData.vin || "",
            health_status: initialData.health_status ?? initialData.sante ?? 0,
          }
        : EMPTY_FORM,
    );
    // ✅ UPDATED: Use vehicule_picture_url from backend for preview
    setImagePreview(
      initialData?.vehicule_picture_url ||
        initialData?.image ||
        initialData?.photo ||
        null,
    );
    setImageFile(null);
    setImageError(null);
    setErrors({});
  }, [open, initialData]);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  // Image handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Veuillez sélectionner une image valide.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }
    setImageError(null);
    setImageFile(file);
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setImageError(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // Form handlers
  const handleChange = (field, value) => {
    if (field === "brand_id") {
      setForm((prev) => ({ ...prev, brand_id: value, model_id: "" }));
      if (value) onBrandChange(value);
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.brand_id) e.brand_id = "Marque requise";
    if (!form.model_id) e.model_id = "Modèle requis";
    if (
      !form.year ||
      isNaN(form.year) ||
      form.year < 1900 ||
      form.year > new Date().getFullYear() + 1
    )
      e.year = "Année invalide";
    if (form.vin && form.vin.length !== 17)
      e.vin = "Le VIN doit contenir 17 caractères";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ ...form, imageFile });
      onClose();
    } catch (_) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? "Modifier le véhicule" : "Ajouter un nouveau véhicule"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* ── Image Upload ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Photo du véhicule{" "}
              <span className="text-gray-400 font-normal text-xs">
                (optionnel)
              </span>
            </label>

            {imagePreview ? (
              /* Preview with hover overlay */
              <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 group">
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-100 transition">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Changer
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              /* Drop zone */
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-[#1a3a8f] hover:bg-blue-50/40 transition-all duration-200 flex flex-col items-center justify-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#1a3a8f]/10 flex items-center justify-center transition">
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-[#1a3a8f] transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-500 group-hover:text-[#1a3a8f] transition">
                    Cliquez pour ajouter une photo
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    PNG, JPG, WEBP — max 5 Mo
                  </p>
                </div>
              </button>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {imageError && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                <svg
                  className="w-3.5 h-3.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
                  />
                </svg>
                {imageError}
              </p>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* Marque + Modèle */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Marque *" error={errors.brand_id}>
              <select
                value={form.brand_id}
                onChange={(e) => handleChange("brand_id", e.target.value)}
                className={selectCls(errors.brand_id)}
                disabled={brandsLoading}>
                <option value="">Sélectionnez...</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {brandsLoading && <Spinner />}
            </Field>

            <Field label="Modèle *" error={errors.model_id}>
              <select
                value={form.model_id}
                onChange={(e) => handleChange("model_id", e.target.value)}
                className={selectCls(errors.model_id)}
                disabled={!form.brand_id || modelsLoading}>
                <option value="">Sélectionnez...</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {modelsLoading && <Spinner />}
            </Field>
          </div>

          {/* Année + Carburant */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Année *" error={errors.year}>
              <input
                type="number"
                placeholder="Ex: 2020"
                value={form.year}
                onChange={(e) => handleChange("year", e.target.value)}
                className={inputCls(errors.year)}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </Field>
            <Field label="Carburant">
              <select
                value={form.fuel_type}
                onChange={(e) => handleChange("fuel_type", e.target.value)}
                className={selectCls()}>
                <option value="">Sélectionnez...</option>
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Immatriculation */}
          <Field label="Numéro d'immatriculation">
            <input
              type="text"
              placeholder="Ex: 12345 116 16"
              value={form.registration_number}
              onChange={(e) =>
                handleChange("registration_number", e.target.value)
              }
              className={inputCls()}
            />
          </Field>

          {/* VIN */}
          <Field label="Numéro de châssis (VIN)" error={errors.vin}>
            <input
              type="text"
              placeholder="17 caractères"
              maxLength={17}
              value={form.vin}
              onChange={(e) =>
                handleChange("vin", e.target.value.toUpperCase())
              }
              className={inputCls(errors.vin)}
            />
            <p className="text-right text-xs text-gray-400 mt-0.5">
              {form.vin.length}/17
            </p>
          </Field>

          {/* Health */}
          <Field label={`État de santé du véhicule — ${form.health_status}%`}>
            <input
              type="range"
              min="0"
              max="100"
              value={form.health_status}
              onChange={(e) =>
                handleChange("health_status", Number(e.target.value))
              }
              className="w-full accent-[#1a3a8f]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>Mauvais (0%)</span>
              <span>Excellent (100%)</span>
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-[#1a3a8f] text-white font-semibold text-sm hover:bg-[#15307a] transition disabled:opacity-60 flex items-center gap-2">
            {submitting && (
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            )}
            {isEdit ? "Enregistrer" : "Ajouter le véhicule"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <div className="relative">{children}</div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const inputCls = (err) =>
  `w-full border ${err ? "border-red-400" : "border-gray-200"} rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/30 focus:border-[#1a3a8f] transition bg-gray-50`;

const selectCls = (err) =>
  `w-full border ${err ? "border-red-400" : "border-gray-200"} rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/30 focus:border-[#1a3a8f] transition bg-gray-50 appearance-none`;

const Spinner = () => (
  <div className="absolute right-3 top-1/2 -translate-y-1/2">
    <svg
      className="animate-spin w-4 h-4 text-[#1a3a8f]"
      fill="none"
      viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  </div>
);

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
    <div className="h-44 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="grid grid-cols-2 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-3 bg-gray-100 rounded" />
        ))}
      </div>
      <div className="h-2 bg-gray-200 rounded-full mt-4" />
      <div className="h-10 bg-gray-200 rounded-xl mt-2" />
    </div>
  </div>
);

// ─── Main Section ─────────────────────────────────────────────────────────────
const VehiclesSection = () => {
  const {
    vehicles,
    brands,
    models,
    loading,
    brandsLoading,
    modelsLoading,
    fetchVehicles,
    fetchBrands,
    fetchModelsByBrand,
    addVehicle,
    editVehicle,
    removeVehicle,
    clearModels,
  } = useVehicleStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    fetchVehicles();
    fetchBrands();
  }, []);

  const openAdd = () => {
    setEditTarget(null);
    clearModels();
    setModalOpen(true);
  };

  const openEdit = (vehicle) => {
    setEditTarget(vehicle);
    if (vehicle.brand?.id || vehicle.brand_id)
      fetchModelsByBrand(vehicle.brand?.id || vehicle.brand_id);
    setModalOpen(true);
  };

  // imageFile is destructured out and passed separately to the store
  const handleSubmit = async ({ imageFile, ...formData }) => {
    if (editTarget) {
      await editVehicle(editTarget.id, formData, imageFile);
    } else {
      await addVehicle(formData, imageFile);
    }
  };

  return (
    <section className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/profile"
          className="w-9 h-9 bg-[#1a3a8f] rounded-xl flex items-center justify-center text-white shadow hover:bg-[#15307a] transition">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h2 className="text-3xl font-extrabold text-[#1a3a8f] tracking-tight uppercase">
          Mes Voiture
        </h2>
      </div>

      {useVehicleStore.getState().error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
            />
          </svg>
          Une erreur s'est produite lors du chargement des véhicules.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? [...Array(2)].map((_, i) => <SkeletonCard key={i} />)
          : vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onEdit={openEdit}
                onDelete={removeVehicle}
              />
            ))}
        {!loading && <AddVehicleCard onClick={openAdd} />}
      </div>

      <VehicleModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onSubmit={handleSubmit}
        brands={brands}
        models={models}
        onBrandChange={fetchModelsByBrand}
        brandsLoading={brandsLoading}
        modelsLoading={modelsLoading}
        initialData={editTarget}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.22s ease-out both; }
      `}</style>
    </section>
  );
};

export default VehiclesSection;
