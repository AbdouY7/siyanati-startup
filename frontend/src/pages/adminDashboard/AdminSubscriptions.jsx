import { useState, useEffect } from "react";
import { getAllSubscriptions, suspendSubscription, reactivateSubscription } from "../../services/subscriptionService";

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const data = await getAllSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (sub) => {
    try {
      if (sub.status === "active") {
        await suspendSubscription(sub.id);
      } else {
        await reactivateSubscription(sub.id);
      }
      fetchSubscriptions();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f1f1f]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          Abonnements Utilisateurs
        </h1>
        <p className="text-sm text-[#6b7280]">Consultez et gérez les abonnements actifs et expirés.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e9effd] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e9effd] text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
              <th className="px-6 py-4">Abonné</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Début</th>
              <th className="px-6 py-4">Expiration</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e9effd]">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-[#f8fafc]/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-[#1f1f1f]">{sub.subscriber_id.slice(0, 8)}...</td>
                <td className="px-6 py-4 text-sm text-[#6b7280] capitalize">{sub.subscriber_type}</td>
                <td className="px-6 py-4 text-sm text-[#1f1f1f]">{sub.plan?.name}</td>
                <td className="px-6 py-4 text-sm text-[#6b7280]">{new Date(sub.started_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-[#6b7280]">{new Date(sub.expires_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                    sub.status === 'active' ? 'bg-[#10b981]/10 text-[#10b981]' : 
                    sub.status === 'expired' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {sub.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleToggleStatus(sub)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline">
                    {sub.status === "active" ? "Suspendre" : "Réactiver"}
                  </button>
                </td>
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-10 text-center text-[#6b7280]">Aucun abonnement trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
