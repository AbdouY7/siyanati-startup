import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { getBrands, getModelsByBrand, createVehicle } from "../../services/vehicleService";
import Input from "../uiComponents/InputField";

const AddVehicleModal = ({ isOpen, onClose, onSuccess }) => {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  
  const [formData, setFormData] = useState({
    brand_id: "",
    model_id: "",
    year: "",
    fuel_type: "",
    engine_cc: "",
    registration_number: "",
    vin: "",
    health_status: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Brands on load
  useEffect(() => {
    if (isOpen) {
      getBrands()
        .then(res => setBrands(res || []))
        .catch(err => console.error("Failed to load brands", err));
    }
  }, [isOpen]);

  // Fetch Models when brand changes
  useEffect(() => {
    if (formData.brand_id) {
      getModelsByBrand(formData.brand_id)
        .then(res => setModels(res || []))
        .catch(err => console.error("Failed to load models", err));
    } else {
      setModels([]);
    }
  }, [formData.brand_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset model if brand changes
    if (name === "brand_id") {
      setFormData(prev => ({ ...prev, model_id: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!formData.brand_id || !formData.model_id || !formData.year) {
      setError("Veuillez remplir les champs obligatoires (Marque, Modèle, Année).");
      setIsLoading(false);
      return;
    }

    try {
      await createVehicle({
        ...formData,
        year: parseInt(formData.year, 10),
        ...(formData.health_status !== "" && { health_status: parseInt(formData.health_status, 10) }),
      });
      setFormData({
        brand_id: "", model_id: "", year: "", fuel_type: "", engine_cc: "", registration_number: "", vin: "", health_status: ""
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout du véhicule.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold font-font-secondary text-gray-800">Ajouter un nouveau véhicule</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="grid grid-cols-2 gap-4">
              {/* Brand */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Marque *</label>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleChange}
                  className="w-full h-11 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
                >
                  <option value="">Sélectionnez...</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Modèle *</label>
                <select
                  name="model_id"
                  value={formData.model_id}
                  onChange={handleChange}
                  disabled={!formData.brand_id}
                  className="w-full h-11 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition disabled:opacity-50"
                >
                  <option value="">Sélectionnez...</option>
                  {models.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Year */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Année *</label>
                <Input
                  type="number"
                  name="year"
                  placeholder="Ex: 2020"
                  value={formData.year}
                  onChange={handleChange}
                />
              </div>

              {/* Fuel Type */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Carburant</label>
                <select
                  name="fuel_type"
                  value={formData.fuel_type}
                  onChange={handleChange}
                  className="w-full h-11 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
                >
                  <option value="">Sélectionnez...</option>
                  <option value="petrol">Essence (Petrol)</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Électrique</option>
                  <option value="hybrid">Hybride</option>
                  <option value="lpg">GPL (LPG)</option>
                </select>
              </div>
            </div>

            {/* Registration Number */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Numéro d'immatriculation</label>
              <Input
                name="registration_number"
                placeholder="Ex: 12345 116 16"
                value={formData.registration_number}
                onChange={handleChange}
              />
            </div>

            {/* VIN */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Numéro de châssis (VIN)</label>
              <Input
                name="vin"
                placeholder="17 caractères"
                value={formData.vin}
                onChange={handleChange}
              />
            </div>

            {/* Health Status */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                État de santé du véhicule {formData.health_status !== "" && (
                  <span className={`font-bold ${
                    parseInt(formData.health_status) >= 70 ? 'text-green-500' :
                    parseInt(formData.health_status) >= 40 ? 'text-yellow-500' : 'text-red-500'
                  }`}>{formData.health_status}%</span>
                )}
              </label>
              <input
                type="range"
                name="health_status"
                min="0"
                max="100"
                value={formData.health_status || 0}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Mauvais (0%)</span>
                <span>Excellent (100%)</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <div className="mt-4 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition disabled:opacity-70"
              >
                {isLoading ? "Ajout en cours..." : "Ajouter le véhicule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleModal;
