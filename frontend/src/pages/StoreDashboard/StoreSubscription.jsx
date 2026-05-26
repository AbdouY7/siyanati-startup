import { useState, useEffect } from "react";
import { getMyActiveSubscription, getSubscriptionPlans, createSubscription } from "../../services/subscriptionService";
import { initiateSubscriptionPayment } from "../../services/paymentService";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StoreSubscription() {
  const navigate = useNavigate();
  const [activeSub, setActiveSub] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      try {
        const sub = await getMyActiveSubscription();
        setActiveSub(sub);
      } catch (err) {
        setActiveSub(null);
      }
      
      const allPlans = await getSubscriptionPlans();
      setPlans(allPlans.filter(p => p.target_type === "store"));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      setSubscribing(true);
      // 1. Create subscription
      const sub = await createSubscription(plan.id);
      
      if (sub.is_trial) {
        alert("Période d'essai activée avec succès !");
        fetchData();
        return;
      }

      // 2. Initiate payment
      const paymentData = await initiateSubscriptionPayment(sub.id, "edahabia");
      
      // 3. Redirect to payment page
      navigate(`/subscription-payment/${paymentData.payment.edahabia_ref}?plan=${encodeURIComponent(plan.name)}&amount=${plan.price_dzd}&type=store`);
      
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Erreur lors de la souscription.";
      alert(msg);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#1f1f1f]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          Mon Abonnement Magasin
        </h1>
        <p className="text-[#6b7280] mt-2">Gérez votre visibilité sur la plateforme Siyanati</p>
      </div>

      {activeSub ? (
        <div className="bg-white border-2 border-[#10b981] rounded-2xl p-8 max-w-2xl mx-auto shadow-lg shadow-[#10b981]/10 text-center">
          <div className="w-16 h-16 bg-[#10b981]/10 text-[#10b981] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#1f1f1f] mb-2">Abonnement Actif</h2>
          <p className="text-[#6b7280] mb-6">Votre profil magasin est visible par tous les clients.</p>
          
          <div className="grid grid-cols-2 gap-4 text-left bg-[#f8fafc] p-4 rounded-xl border border-[#e9effd]">
            <div>
              <p className="text-xs text-[#6b7280] uppercase tracking-wider font-semibold mb-1">Plan Actuel</p>
              <p className="font-medium text-[#1f1f1f]">{activeSub.plan?.name}</p>
            </div>
            <div>
              <p className="text-xs text-[#6b7280] uppercase tracking-wider font-semibold mb-1">Date d'expiration</p>
              <p className="font-medium text-[#1f1f1f]">{new Date(activeSub.expires_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 items-start mb-8 max-w-2xl mx-auto">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-red-800">Profil Masqué</h3>
              <p className="text-xs text-red-700 mt-1">
                Votre abonnement est inactif ou expiré. Votre magasin n'apparaît plus dans les résultats de recherche des clients. Abonnez-vous pour restaurer votre visibilité.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white border border-[#e9effd] rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col">
                <h3 className="text-xl font-bold text-[#1f1f1f]">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-black text-[#2563eb]">{plan.price_dzd}</span>
                  <span className="text-sm text-[#6b7280] font-medium"> DZD / {plan.duration_days} jours</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-[#4b5563]">
                      <CheckCircle2 className="text-[#10b981] flex-shrink-0 mt-0.5" size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handleSubscribe(plan)}
                  disabled={subscribing}
                  className="w-full py-3 bg-gradient-to-r from-[#2563eb] to-[#0b3c5d] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
                  {subscribing ? 'Traitement...' : plan.is_free_trial ? 'Commencer Essai Gratuit' : 'S\'abonner via Edahabia'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
