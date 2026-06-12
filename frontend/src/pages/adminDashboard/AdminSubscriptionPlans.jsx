import { useState, useEffect } from "react";
import { getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from "../../services/subscriptionService";
import { Plus, Edit, Trash2, X } from "lucide-react";

export default function AdminSubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  
  const initialFormState = {
    name: "",
    description: "",
    price_dzd: 0,
    duration_days: 30,
    target_type: "store",
    billing_cycle: "monthly",
    features: "",
    is_free_trial: false,
    trial_days: 0
  };
  
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await getSubscriptionPlans();
      setPlans(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        price_dzd: Number(formData.price_dzd),
        duration_days: Number(formData.duration_days),
        trial_days: Number(formData.trial_days),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f)
      };
      
      if (editingPlanId) {
        await updateSubscriptionPlan(editingPlanId, formattedData);
      } else {
        await createSubscriptionPlan(formattedData);
      }
      
      setIsModalOpen(false);
      setFormData(initialFormState);
      setEditingPlanId(null);
      fetchPlans();
    } catch (error) {
      console.error("Error saving plan", error);
      alert(error?.response?.data?.message || "Failed to save plan");
    }
  };

  const handleEditClick = (plan) => {
    setEditingPlanId(plan.id);
    setFormData({
      name: plan.name,
      description: plan.description || "",
      price_dzd: plan.price_dzd,
      duration_days: plan.duration_days,
      target_type: plan.target_type,
      billing_cycle: plan.billing_cycle,
      features: plan.features ? plan.features.join(", ") : "",
      is_free_trial: plan.is_free_trial,
      trial_days: plan.trial_days || 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce plan ?")) {
      try {
        await deleteSubscriptionPlan(id);
        fetchPlans();
      } catch (error) {
        console.error("Error deleting plan", error);
        alert(error?.response?.data?.message || "Erreur lors de la suppression");
      }
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1f1f]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Plans d'abonnement
          </h1>
          <p className="text-sm text-[#6b7280]">Gérez les forfaits pour les magasins et les professionnels</p>
        </div>
        <button 
          onClick={() => {
            setEditingPlanId(null);
            setFormData(initialFormState);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#2563eb] text-white px-4 py-2 rounded-xl hover:bg-[#1d4ed8]">
          <Plus size={18} />
          Créer un plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white border border-[#e9effd] rounded-2xl p-6 shadow-sm relative">
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={() => handleEditClick(plan)} className="text-blue-600 hover:text-blue-800"><Edit size={16}/></button>
              <button onClick={() => handleDelete(plan.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16}/></button>
            </div>
            <h3 className="text-xl font-bold text-[#1f1f1f]">{plan.name}</h3>
            <p className="text-xs text-[#6b7280] mt-1 capitalize">{plan.target_type}</p>
            <div className="mt-4 mb-6">
              <span className="text-3xl font-bold text-[#1f1f1f]">{plan.price_dzd}</span>
              <span className="text-sm text-[#6b7280]"> DZD / {plan.duration_days} jours</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features?.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-[#4b5563]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="text-center">
               <span className={`px-3 py-1 text-xs font-semibold rounded-full ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                 {plan.is_active ? 'Actif' : 'Inactif'}
               </span>
            </div>
          </div>
        ))}
        {plans.length === 0 && (
          <div className="col-span-full text-center py-10 text-[#6b7280]">Aucun plan trouvé.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-bold text-[#1f1f1f] mb-6">
              {editingPlanId ? "Modifier le plan" : "Créer un nouveau plan"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du plan</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (DZD)</label>
                  <input required name="price_dzd" value={formData.price_dzd} onChange={handleInputChange} type="number" className="w-full border border-gray-300 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée (Jours)</label>
                  <input required name="duration_days" value={formData.duration_days} onChange={handleInputChange} type="number" className="w-full border border-gray-300 rounded-lg p-2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cible</label>
                  <select name="target_type" value={formData.target_type} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2">
                    <option value="store">Magasin</option>
                    <option value="professional">Professionnel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cycle</label>
                  <select name="billing_cycle" value={formData.billing_cycle} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2">
                    <option value="monthly">Mensuel</option>
                    <option value="yearly">Annuel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fonctionnalités (séparées par des virgules)</label>
                <textarea name="features" value={formData.features} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2" rows="3"></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" name="is_free_trial" id="is_free_trial" checked={formData.is_free_trial} onChange={handleInputChange} />
                <label htmlFor="is_free_trial" className="text-sm font-medium text-gray-700">Ceci est un essai gratuit</label>
              </div>

              {formData.is_free_trial && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jours d'essai</label>
                  <input name="trial_days" value={formData.trial_days} onChange={handleInputChange} type="number" className="w-full border border-gray-300 rounded-lg p-2" />
                </div>
              )}

              <button type="submit" className="w-full bg-[#2563eb] text-white py-2 rounded-xl font-medium hover:bg-[#1d4ed8]">
                Enregistrer le plan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
