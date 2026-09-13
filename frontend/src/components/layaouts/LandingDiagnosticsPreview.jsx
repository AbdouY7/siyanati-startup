import React, { useEffect, useState } from "react";
import { getDiagnosticPosts } from "../../services/diagnosticService";
import { MessageCircle, ThumbsUp, Wrench, Search, Clock } from "lucide-react";
import { getImageUrl } from "../../utils/imageUtils";
import { useTranslation } from "react-i18next";

export default function LandingDiagnosticsPreview({ onRequireAuth }) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getRelativeTime = (date) => {
    const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
    const diff = new Date().getTime() - new Date(date).getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return rtf.format(-days, "day");
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return rtf.format(-hours, "hour");
    
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) return rtf.format(-minutes, "minute");
    
    return t("diag_just_now");
  };

  useEffect(() => {
    // Generate some attractive fake posts to showcase the feature
    const fakePosts = [
      {
        id: "f1",
        title: "Bruit métallique au freinage sur ma Golf 7",
        content: "Bonjour, depuis quelques jours j'entends un bruit strident quand je freine à faible allure. Les plaquettes ont été changées il y a 10 000 km. Une idée de ce que ça pourrait être ?",
        vehicle_brand: "Volkswagen",
        vehicle_model: "Golf 7",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        user: {
          full_name: "Karim B.",
          avatar_url: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        _count: { reactions: 12, comments: 4 }
      },
      {
        id: "f2",
        title: "Voyant moteur allumé après le plein (Peugeot 208)",
        content: "Salut à tous. J'ai fait le plein hier et ce matin le voyant moteur orange s'est allumé. La voiture ne broute pas et je ne perds pas de puissance. Faut-il que j'aille urgemment au garage ?",
        vehicle_brand: "Peugeot",
        vehicle_model: "208",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        user: {
          full_name: "Yasmine M.",
          avatar_url: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        _count: { reactions: 8, comments: 15 }
      },
      {
        id: "f3",
        title: "Perte de puissance dans les montées (TDI 140)",
        content: "Je remarque une grosse perte de puissance quand je prends l'autoroute dans les pentes. Le turbo semble se couper et je dois redémarrer la voiture pour qu'elle reparte normalement...",
        vehicle_brand: "Seat",
        vehicle_model: "Leon",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        user: {
          full_name: "Amine S.",
          avatar_url: "https://randomuser.me/api/portraits/men/85.jpg"
        },
        _count: { reactions: 24, comments: 9 }
      },
      {
        id: "f4",
        title: "Problème de climatisation qui souffle de l'air chaud",
        content: "Avec l'approche de l'été, ma clim ne refroidit plus rien du tout. Le compresseur a l'air de s'enclencher (j'entends le clic) mais l'air reste chaud. Une recharge de gaz suffirait-elle ?",
        vehicle_brand: "Renault",
        vehicle_model: "Clio 4",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        user: {
          full_name: "Sofiane T.",
          avatar_url: "https://randomuser.me/api/portraits/men/22.jpg"
        },
        _count: { reactions: 31, comments: 12 }
      }
    ];
    
    // Simulate network delay for a smooth skeleton loading effect if desired, or just set immediately
    setTimeout(() => {
      setPosts(fakePosts);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-12 text-center md:text-left">
          <div className="max-w-2xl flex flex-col items-center md:items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4">
              <Search size={16} />
              {t("diag_badge")}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("diag_header")}
            </h2>
            <p className="text-gray-500 text-lg">
              {t("diag_sub")}
            </p>
          </div>
          <button
            onClick={() => onRequireAuth(t("diag_req_auth_all"))}
            className="shrink-0 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white w-full max-w-xs md:max-w-none md:w-auto px-6 py-3 rounded-xl font-semibold transition-all active:scale-[0.98]"
          >
            <Wrench size={18} />
            {t("diag_btn_all")}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-gray-500">{t("diag_empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => onRequireAuth(t("diag_req_auth_read"))}
                className="group bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden text-center md:text-left"
              >
                <div className="flex items-start justify-center md:justify-between mb-4">
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <img
                      src={getImageUrl(post.user?.avatar_url || "")}
                      alt="Avatar"
                      onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=User&background=eff6ff&color=2563eb"; }}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100"
                    />
                    <div className="text-center md:text-left">
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        {post.user?.full_name || t("diag_user")}
                      </p>
                      <div className="flex items-center justify-center md:justify-start gap-1 text-xs text-gray-400 mt-0.5">
                        <Clock size={10} />
                        <span>
                          {getRelativeTime(post.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2">
                    {post.vehicle_brand} {post.vehicle_model}
                  </span>
                  <h3 className="font-bold text-gray-900 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                </div>
                
                <p className="text-gray-500 text-xs line-clamp-3 mb-4 flex-1">
                  {post.content}
                </p>

                <div className="flex items-center justify-center md:justify-start gap-4 pt-4 border-t border-gray-100 mt-auto">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold">
                    <ThumbsUp size={14} />
                    <span>{post._count?.reactions || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold">
                    <MessageCircle size={14} />
                    <span>{post._count?.comments || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
