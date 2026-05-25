import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getSavedDiagnosticPosts } from "../../services/diagnosticService";
import {
  FiChevronLeft,
  FiMessageSquare,
  FiBookmark,
  FiChevronRight,
} from "react-icons/fi";

const SavedDiagnosticPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  const fetchSavedPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getSavedDiagnosticPosts();
      setPosts(data?.posts || []);
      
      const indices = {};
      (data?.posts || []).forEach((p) => {
        indices[p.id] = 0;
      });
      setCurrentImageIndex(indices);
    } catch (error) {
      console.error("Failed to fetch saved posts", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);

  const nextImage = (postId, total) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [postId]: (prev[postId] + 1) % total,
    }));
  };

  const prevImage = (postId, total) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [postId]: (prev[postId] - 1 + total) % total,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 pt-[100px]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 pt-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/profile"
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-sm"
          >
            <FiChevronLeft size={20} />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-[#1e3a8a] tracking-tight">
              DIAGNOSTICS SAUVEGARDÉS
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Retrouvez ici tous les posts que vous avez enregistrés
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <FiBookmark size={48} className="mb-4 opacity-50 text-blue-500" />
            <p className="text-lg font-medium text-slate-700">Aucun post sauvegardé</p>
            <p className="text-sm mt-1">
              Explorez l'espace diagnostic et sauvegardez les posts intéressants.
            </p>
            <Link 
              to="/diagnostic" 
              className="mt-6 px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition"
            >
              Voir les diagnostics
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {posts.map((post) => {
              const images =
                post.images?.length > 0
                  ? post.images
                  : ["/placeholder-car.png"];
              const currentIdx = currentImageIndex[post.id] || 0;

              return (
                <div
                  key={post.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-center gap-3 p-4 pb-2">
                    <img
                      src={post.author?.client_profile?.avatar_url || "/default-avatar.png"}
                      alt="User"
                      className="w-10 h-10 rounded-full object-cover border border-slate-100"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {post.author?.client_profile?.full_name || "Utilisateur"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {post.created_at
                          ? new Date(post.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', year: 'numeric' })
                          : "Récent"}
                      </p>
                    </div>
                  </div>

                  <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden mx-4 rounded-xl">
                    <img
                      src={images[currentIdx]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => prevImage(post.id, images.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition opacity-0 group-hover:opacity-100"
                        >
                          <FiChevronLeft size={16} />
                        </button>
                        <button
                          onClick={() => nextImage(post.id, images.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition opacity-0 group-hover:opacity-100"
                        >
                          <FiChevronRight size={16} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full transition ${
                                idx === currentIdx
                                  ? "bg-blue-600"
                                  : "bg-white/60"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">
                      {post.title || "Sans titre"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-blue-600 bg-blue-50 self-start px-2 py-1 rounded-md mb-3 font-medium">
                      <span>
                        {post.vehicle?.brand?.name ||
                          post.brand?.name ||
                          "Général"}
                      </span>
                      {post.vehicle?.year && (
                        <>
                          <span className="text-blue-300">•</span>
                          <span>{post.vehicle.year}</span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed flex-1">
                      {post.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center gap-4">
                        <Link 
                          to={`/diagnostic/${post.id}`}
                          className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition text-sm font-medium"
                        >
                          <FiMessageSquare size={18} />
                          <span>{post.comments_count || post._count?.comments || "0"}</span>
                        </Link>
                        <span className="flex items-center gap-1.5 text-blue-600 text-sm font-medium">
                          <FiBookmark size={18} className="fill-current" />
                        </span>
                      </div>
                      
                      <Link
                        to={`/diagnostic/${post.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Voir détails &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedDiagnosticPostsPage;
