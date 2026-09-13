import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import AuthRequiredModal from "../components/modals/AuthRequiredModal";
import {
  getDiagnosticPostById,
  getPostComments,
  createPostComment,
  toggleSavePost,
} from "../services/diagnosticService";
import useWorkflowSubscription from "../hooks/useWorkflowSubscription";
import {
  FiChevronLeft,
  FiMessageSquare,
  FiBookmark,
  FiShare2,
  FiChevronRight,
  FiCalendar,
  FiUser,
  FiSend,
  FiImage,
} from "react-icons/fi";
import { getImageUrl } from "../utils/imageUtils";

const resolveAuthor = (entity) => {
  const a = entity?.author || entity?.user || {};

  const name =
    a?.client_profile?.full_name ||
    a?.professional_profile?.full_name ||
    a?.store_profile?.store_name ||
    a?.full_name ||
    a?.name ||
    a?.username ||
    a?.email?.split("@")[0] ||
    entity?.author_name ||
    entity?.user_name ||
    "Utilisateur inconnu";

  const avatar =
    getImageUrl(
      a?.client_profile?.avatar_url ||
      a?.professional_profile?.avatar_url ||
      a?.store_profile?.logo_url ||
      a?.avatar_url ||
      a?.avatar ||
      a?.profile_picture ||
      a?.photo ||
      entity?.author_avatar
    ) || "/default-avatar.png";

  return { name, avatar };
};

const DiagnosticPostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPostDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const postData = await getDiagnosticPostById(id);
      setPost(postData);
      
      const commentsData = await getPostComments(id);
      setComments(commentsData || []);
    } catch (error) {
      console.error("Failed to fetch post details", error);
      navigate("/diagnostic");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchPostDetails();
  }, [fetchPostDetails]);

  useWorkflowSubscription({
    entityType: "diagnostic",
    onUpdate: () => {
      fetchPostDetails();
    }
  });

  const handleToggleSave = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await toggleSavePost(id);
      // Optimistic update
      setPost(prev => ({
        ...prev,
        saves_count: prev.saves_count + 1 // A bit simplistic but shows feedback
      }));
    } catch (error) {
      console.error("Failed to save post", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    setIsSubmitting(true);
    try {
      const response = await createPostComment(id, { body: newComment });
      if (response?.success && response?.data) {
        setComments(prev => [...prev, response.data]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Failed to add comment", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextImage = (total) => {
    setCurrentImageIndex((prev) => (prev + 1) % total);
  };

  const prevImage = (total) => {
    setCurrentImageIndex((prev) => (prev - 1 + total) % total);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) return null;

  const images = post.images?.length > 0 ? post.images : ["/placeholder-car.png"];

  const isDashboard = location.pathname.startsWith('/pro') || location.pathname.startsWith('/store');
  const paddingClass = isDashboard ? "pt-8" : "pt-[100px]";
  const backLink = location.pathname.startsWith('/pro') 
    ? "/pro/diagnostic" 
    : location.pathname.startsWith('/store') 
      ? "/store/diagnostic" 
      : "/diagnostic";

  return (
    <div className={`min-h-screen bg-gray-50/50 pb-16 ${paddingClass}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Back */}
        <button
          onClick={() => navigate(-1)}
          title="Retour aux diagnostics"
          className="p-2 w-fit rounded-full hover:bg-gray-200 text-slate-500 hover:text-blue-600 transition mb-6 flex items-center justify-center">
          <FiChevronLeft size={22} />
        </button>

        {/* Post Content */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
          {/* Header */}
          <div className="p-6 md:p-8 flex items-start justify-between border-b border-slate-50">
            <div className="flex items-center gap-4">
              <img
                src={resolveAuthor(post).avatar}
                alt="Author"
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {resolveAuthor(post).name}
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-400 mt-0.5">
                  <FiUser size={14} />
                  <span className="capitalize">{post.author?.role === 'customer' ? 'Client' : post.author?.role}</span>
                  <span>•</span>
                  <FiCalendar size={14} />
                  <span>
                    {new Date(post.created_at).toLocaleDateString("fr-FR", { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                post.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {post.status === 'open' ? 'En cours' : 'Résolu'}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">
              {post.title}
            </h1>

            {/* Vehicle Details Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold">
                {post.vehicle?.brand?.name || post.brand?.name || "Véhicule non spécifié"}
              </span>
              {(post.vehicle?.model?.name || post.model?.name) && (
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                  {post.vehicle?.model?.name || post.model?.name}
                </span>
              )}
              {(post.vehicle?.year || post.year) && (
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                  {post.vehicle?.year || post.year}
                </span>
              )}
              {(post.vehicle?.fuel_type || post.fuel_type) && (
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium capitalize">
                  {post.vehicle?.fuel_type || post.fuel_type}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="text-slate-700 text-base md:text-lg leading-relaxed whitespace-pre-line mb-8">
              {post.description}
            </div>

            {/* Image Gallery */}
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden mb-8 group">
              <img
                src={images[currentImageIndex]}
                alt="Diagnostic"
                className="w-full h-full object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => prevImage(images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-800 hover:bg-white transition shadow-sm opacity-0 group-hover:opacity-100"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => nextImage(images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-800 hover:bg-white transition shadow-sm opacity-0 group-hover:opacity-100"
                  >
                    <FiChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentImageIndex
                            ? "bg-blue-600 w-4"
                            : "bg-white/70 hover:bg-white"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div className="flex gap-4">
                <button 
                  onClick={handleToggleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                >
                  <FiBookmark size={18} />
                  <span>Sauvegarder</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition font-medium">
                  <FiShare2 size={18} />
                  <span>Partager</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <FiMessageSquare className="text-blue-600" />
            Réponses ({comments.length})
          </h3>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleAddComment} className="flex gap-4 mb-10">
              <img
                src={user.avatar || "/default-avatar.png"}
                alt="Me"
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Apportez votre aide, posez une question ou proposez une solution..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition resize-none min-h-[50px]"
                  rows="2"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="absolute right-2 bottom-3 w-8 h-8 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 transition"
                >
                  <FiSend size={14} />
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-blue-50 p-4 rounded-xl text-center mb-8">
              <p className="text-blue-800 text-sm font-medium">
                Connectez-vous pour participer à la discussion
              </p>
              <Link to="/login" className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                Se connecter
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Aucune réponse pour le moment. Soyez le premier à répondre !
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <img
                    src={resolveAuthor(comment).avatar}
                    alt="Comment Author"
                    className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                          {resolveAuthor(comment).name}
                          {comment.author?.role && comment.author?.role !== 'customer' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase">
                              {comment.author?.role}
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(comment.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm whitespace-pre-line">
                        {comment.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DiagnosticPostDetails;
