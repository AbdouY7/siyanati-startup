import React, { useEffect, useState } from "react";
import { getSubscriptionPlans } from "../../services/subscriptionService";
import { CheckCircle2 } from "lucide-react";

export default function LandingSubscriptionPlans({ onRequireAuth }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("professional"); // "professional" or "store"

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const allPlans = await getSubscriptionPlans();
        setPlans(allPlans);
      } catch (error) {
        console.error("Failed to fetch subscription plans:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const filteredPlans = plans.filter((p) => p.target_type === filter);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choisissez le plan qui vous convient
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Que vous soyez un professionnel indépendant ou un magasin de pièces détachées, nous avons des forfaits adaptés pour booster votre visibilité sur Siyanati.
          </p>
        </div>

        {/* Toggle Filter */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1 rounded-xl border border-gray-200 inline-flex shadow-sm">
            <button
              onClick={() => setFilter("professional")}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                filter === "professional"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Pour les Professionnels
            </button>
            <button
              onClick={() => setFilter("store")}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                filter === "store"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Pour les Magasins
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : filteredPlans.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Aucun plan disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start justify-center">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-blue-900/5 flex flex-col h-full relative overflow-hidden transition-transform hover:-translate-y-1"
              >
                {/* Decorative background shape */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-bl-full -z-10 opacity-50" />
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-blue-600">
                    {Number(plan.price_dzd).toLocaleString("fr-DZ")}
                  </span>
                  <span className="text-gray-500 font-medium">DA</span>
                  <span className="text-gray-400 text-sm ml-1">/ {plan.duration_days} jours</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">Visibilité accrue sur la plateforme</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">Badge exclusif sur votre profil</span>
                  </li>
                  {plan.trial_days > 0 && (
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm font-semibold">
                        Période d'essai gratuite de {plan.trial_days} jours incluse
                      </span>
                    </li>
                  )}
                </ul>

                <button
                  onClick={() => onRequireAuth("Vous devez être connecté pour souscrire à un abonnement.")}
                  className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 mt-auto"
                >
                  Souscrire maintenant
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
