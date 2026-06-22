import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import {
  getDiagnosticPosts,
  createDiagnosticPost,
  toggleSavePost,
  getPostComments,
  createPostComment,
} from "../services/diagnosticService";
import useWorkflowSubscription from "../hooks/useWorkflowSubscription";
import AuthRequiredModal from "../components/modals/AuthRequiredModal";
import { getUserVehicles } from "../services/vehicleService";
import { getImageUrl } from "../utils/imageUtils";
import {
  FiPlus,
  FiMessageSquare,
  FiBookmark,
  FiChevronRight,
  FiChevronLeft,
  FiImage,
  FiX,
  FiChevronDown,
  FiFileText,
  FiType,
  FiSearch,
  FiSend,
  FiShare2,
  FiMoreHorizontal,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";

/* ─────────────────────────────────────────────
   HELPERS — resolve author name & avatar
   Handles every possible API shape:
     • post.author.client_profile.full_name
     • post.author.full_name
     • post.author.name
     • post.author.username
     • post.user.full_name  …etc.
───────────────────────────────────────────── */
const resolveAuthor = (post) => {
  const a = post?.author || post?.user || {};

  const name =
    a?.client_profile?.full_name ||
    a?.professional_profile?.full_name ||
    a?.store_profile?.store_name ||
    a?.full_name ||
    a?.name ||
    a?.username ||
    a?.email?.split("@")[0] ||
    post?.author_name ||
    post?.user_name ||
    "Utilisateur";

  const avatar = getImageUrl(
    a?.client_profile?.avatar_url ||
    a?.client_profile?.profilePicUrl ||
    a?.professional_profile?.avatar_url ||
    a?.store_profile?.logo_url ||
    a?.avatar_url ||
    a?.avatar ||
    a?.profile_picture ||
    a?.photo ||
    post?.author_avatar
  );

  return { name, avatar };
};

const resolveCommentAuthor = (comment) => {
  const a = comment?.author || comment?.user || {};

  const name =
    a?.client_profile?.full_name ||
    a?.professional_profile?.full_name ||
    a?.store_profile?.store_name ||
    a?.full_name ||
    a?.name ||
    a?.username ||
    a?.email?.split("@")[0] ||
    "Utilisateur";

  const avatar = getImageUrl(
    a?.client_profile?.avatar_url ||
    a?.client_profile?.profilePicUrl ||
    a?.professional_profile?.avatar_url ||
    a?.store_profile?.logo_url ||
    a?.avatar_url ||
    a?.avatar ||
    a?.profile_picture
  );

  const role = a?.role || comment?.author_role || null;

  return { name, avatar, role };
};

/* ─────────────────────────────────────────────
   INLINE COMMENTS PANEL
───────────────────────────────────────────── */
const CommentsPanel = ({ postId, user, navigate }) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getPostComments(postId);
        setComments(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
      if (!user) {
        setAuthModalOpen(true);
        return;
      }

    setIsSubmitting(true);
    try {
      const res = await createPostComment(postId, { body: newComment });
      if (res?.success && res?.data) {
        setComments((prev) => [...prev, res.data]);
        setNewComment("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      <div className="border-t border-slate-100 bg-slate-50/60">
      {/* Comments list */}
      <div className="px-5 pt-4 pb-2 max-h-64 overflow-y-auto space-y-3 custom-scroll">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-4">
            Aucune réponse — soyez le premier !
          </p>
        ) : (
          comments.map((c) => {
            const { name, avatar: rawAvatar, role } = resolveCommentAuthor(c);
            const avatar = rawAvatar || "/default-avatar.png";
            const isPro = role && role !== "customer";

            return (
              <div key={c.id} className="flex gap-3 group">
                <img
                  src={avatar}
                  alt={name}
                  onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-100"
                />
                <div className="flex-1">
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-slate-800">{name}</span>
                      {isPro && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded-full uppercase tracking-wide">
                          {c.author?.role}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {c.body}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 ml-2 mt-0.5 block">
                    {new Date(c.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-slate-100">
        {user ? (
          <div className="flex gap-3 items-end">
            <img
              src={getImageUrl(user.avatar || user.profile_picture || user.client_profile?.avatar_url || user.store_profile?.logo_url) || "/default-avatar.png"}
              alt="Me"
              onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-100"
            />
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Répondre… (Entrée pour envoyer)"
                rows={1}
                className="w-full px-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none leading-relaxed"
              />
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !newComment.trim()}
                className="absolute right-2 bottom-2 w-7 h-7 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition"
              >
                <FiSend size={12} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <Link
              to="/login"
              className="text-sm text-blue-600 font-semibold hover:underline"
            >
              Connectez-vous pour commenter
            </Link>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   SINGLE POST CARD (feed style)
───────────────────────────────────────────── */
const PostCard = ({ post, user, navigate }) => {
  const images =
    post.images?.length > 0 ? post.images : [];
  const [imgIndex, setImgIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [savesCount, setSavesCount] = useState(post.saves_count || 0);
  const [showComments, setShowComments] = useState(false);

  const { name: authorName, avatar: rawAuthorAvatar } = resolveAuthor(post);
  const authorAvatar = rawAuthorAvatar || "/default-avatar.png";

  const commentsCount = post.comments_count || post._count?.comments || 0;

  const handleSave = async () => {
    if (!user) { navigate("/login"); return; }
    const wasSaved = saved;
    setSaved(!wasSaved);
    setSavesCount((c) => (wasSaved ? c - 1 : c + 1));
    try {
      await toggleSavePost(post.id);
    } catch {
      setSaved(wasSaved);
      setSavesCount((c) => (wasSaved ? c + 1 : c - 1));
    }
  };

  const location = useLocation();
  const basePath = location.pathname.startsWith('/pro') 
    ? "/pro/diagnostic" 
    : location.pathname.startsWith('/store') 
      ? "/store/diagnostic" 
      : "/diagnostic";

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        url: window.location.origin + `${basePath}/${post.id}`,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(
        window.location.origin + `${basePath}/${post.id}`
      );
    }
  };

  return (
    <article className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${post.status === "open" ? "bg-emerald-400" : "bg-slate-300"
                }`}
            />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-tight">
              {authorName}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <FiCalendar size={11} />
              {new Date(post.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {(post.vehicle?.brand?.name) && (
                <>
                  <span className="mx-0.5">·</span>
                  <FiMapPin size={11} />
                  {post.vehicle.brand.name}
                  {post.vehicle?.model?.name && ` ${post.vehicle.model.name}`}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${post.status === "open"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-slate-100 text-slate-500"
              }`}
          >
            {post.status === "open" ? "Ouvert" : "Résolu"}
          </span>
          <Link
            to={`${basePath}/${post.id}`}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition"
          >
            <FiMoreHorizontal size={18} />
          </Link>
        </div>
      </div>

      {/* ── Title ── */}
      <div className="px-5 pb-3">
        <h2 className="text-base font-bold text-slate-900 leading-snug mb-1">
          {post.title}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
          {post.description}
        </p>
        {post.description?.length > 200 && (
          <Link
            to={`${basePath}/${post.id}`}
            className="text-xs text-blue-600 font-semibold hover:underline mt-1 inline-block"
          >
            Voir plus
          </Link>
        )}
      </div>

      {/* ── Image Carousel ── */}
      {images.length > 0 && (
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden group">
          <img
            src={images[imgIndex]}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black/60"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black/60"
              >
                <FiChevronRight size={16} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`rounded-full transition-all duration-200 ${i === imgIndex
                      ? "w-5 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                      }`}
                  />
                ))}
              </div>
              <div className="absolute top-3 right-3 bg-black/40 text-white text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                {imgIndex + 1}/{images.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Vehicle Tags ── */}
      {(post.vehicle?.brand?.name || post.vehicle?.year || post.vehicle?.fuel_type) && (
        <div className="flex flex-wrap gap-1.5 px-5 pt-3">
          {post.vehicle?.brand?.name && (
            <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold border border-blue-100">
              {post.vehicle.brand.name}
            </span>
          )}
          {post.vehicle?.model?.name && (
            <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
              {post.vehicle.model.name}
            </span>
          )}
          {post.vehicle?.year && (
            <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
              {post.vehicle.year}
            </span>
          )}
          {post.vehicle?.fuel_type && (
            <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium capitalize">
              {post.vehicle.fuel_type}
            </span>
          )}
        </div>
      )}

      {/* ── Actions Bar ── */}
      <div className="flex items-center justify-between px-5 py-3 mt-1">
        <div className="flex items-center gap-1">
          {/* Comments toggle */}
          <button
            onClick={() => setShowComments((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${showComments
              ? "bg-blue-50 text-blue-600"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
          >
            <FiMessageSquare size={17} />
            <span>{commentsCount}</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${saved
              ? "bg-amber-50 text-amber-500"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
          >
            <FiBookmark size={17} className={saved ? "fill-amber-400" : ""} />
            <span>{savesCount}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <FiShare2 size={17} />
          </button>
        </div>

        <Link
          to={`${basePath}/${post.id}`}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
        >
          Voir tout <FiChevronRight size={14} />
        </Link>
      </div>

      {/* ── Inline Comments ── */}
      {showComments && (
        <CommentsPanel postId={post.id} user={user} navigate={navigate} />
      )}
    </article>
  );
};

/* ─────────────────────────────────────────────
   CREATE POST MODAL
───────────────────────────────────────────── */
const CreatePostModal = ({ onClose, onCreated, user }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [userVehicles, setUserVehicles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    vehicle_id: "",
    title: "",
    description: "",
    imageFiles: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserVehicles();
        let v = [];
        if (Array.isArray(res)) v = res;
        else if (res?.data && Array.isArray(res.data)) v = res.data;
        else if (res?.vehicles && Array.isArray(res.vehicles)) v = res.vehicles;
        else {
          const arr = Object.values(res || {}).filter(Array.isArray);
          if (arr.length) v = arr[0];
        }
        setUserVehicles(v);
      } catch {
        setUserVehicles([]);
      }
    })();
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newPreviews = [];
    const newFiles = [];
    let done = 0;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        newFiles.push(file);
        done++;
        if (done === files.length) {
          setPreviewImages((p) => [...p, ...newPreviews]);
          setFormData((p) => ({
            ...p,
            imageFiles: [...p.imageFiles, ...newFiles],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (i) => {
    setPreviewImages((p) => p.filter((_, idx) => idx !== i));
    setFormData((p) => ({
      ...p,
      imageFiles: p.imageFiles.filter((_, idx) => idx !== i),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      if (formData.vehicle_id) payload.append("vehicle_id", formData.vehicle_id);
      formData.imageFiles.forEach((f) => payload.append("images", f));
      const res = await createDiagnosticPost(payload);
      if (res?.success && res?.data) {
        onCreated(res.data);
        onClose();
      } else {
        setSubmitError("Erreur lors de la création du post");
      }
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || "Une erreur s'est produite. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !isSubmitting && onClose()}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || "/default-avatar.png"}
              alt="Me"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-bold text-slate-900">
                {user?.name || "Vous"}
              </p>
              <p className="text-xs text-slate-400">Nouveau diagnostic</p>
            </div>
          </div>
          <button
            onClick={() => !isSubmitting && onClose()}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition"
          >
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {submitError}
            </div>
          )}

          {/* Vehicle select */}
          <div className="relative">
            <FiChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              name="vehicle_id"
              value={formData.vehicle_id}
              onChange={(e) =>
                setFormData((p) => ({ ...p, vehicle_id: e.target.value }))
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="">Véhicule (optionnel)</option>
              {userVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand?.name} {v.model?.name} ({v.year})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="relative">
            <FiType
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Titre du problème"
              required
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div className="relative">
            <FiFileText
              size={16}
              className="absolute left-3 top-3.5 text-slate-400"
            />
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Décrivez les symptômes, le contexte et les réparations déjà effectuées..."
              required
              rows={5}
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Images */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Photos
            </p>
            <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 transition">
              {previewImages.length > 0 ? (
                <div className="p-3 grid grid-cols-3 gap-2">
                  {previewImages.map((src, i) => (
                    <div key={i} className="relative aspect-square">
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                      >
                        <FiX size={10} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
                  >
                    <FiPlus size={20} className="text-slate-400" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-10 flex flex-col items-center text-slate-400 hover:text-blue-500 transition"
                >
                  <FiImage size={28} className="mb-2" />
                  <span className="text-sm font-medium">Ajouter des photos</span>
                  <span className="text-xs mt-0.5">de la pièce ou du problème</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-md"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Publication en cours...
              </>
            ) : (
              "Publier le diagnostic"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const Diagnostics = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isDashboard = location.pathname.startsWith('/pro') || location.pathname.startsWith('/store');
  const paddingClass = isDashboard ? "pt-8" : "pt-[100px]";

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDiagnosticPosts({ search: searchQuery });
      setPosts(data?.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useWorkflowSubscription({
    entityType: "diagnostic",
    onUpdate: () => {
      fetchPosts();
    }
  });

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const openModal = () => {
    if (!user) { navigate("/login"); return; }
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Scroll style for comments */}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>

      <div className={`min-h-screen bg-slate-50 pb-16 ${paddingClass}`}>
        <div className="max-w-2xl mx-auto px-4">

          {/* ── Header ── */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Espace Diagnostic
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Partagez vos problèmes mécaniques et obtenez de l'aide
            </p>
          </div>

          {/* ── Create Post CTA ── */}
          {user?.role === "customer" && (
            <div
              onClick={openModal}
              className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-sm mb-5 cursor-pointer hover:border-blue-200 hover:shadow-md transition group"
            >
              <img
                src={user?.avatar || "/default-avatar.png"}
                alt="Me"
                className="w-10 h-10 rounded-full object-cover border border-slate-100"
              />
              <div className="flex-1 bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-400 rounded-2xl px-4 py-2.5 text-sm transition border border-slate-100 group-hover:border-blue-100">
                Quel problème avez-vous avec votre véhicule ?
              </div>
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:bg-blue-700 transition">
                <FiPlus size={18} />
              </div>
            </div>
          )}

          {/* ── Search ── */}
          <form
            onSubmit={(e) => { e.preventDefault(); fetchPosts(); }}
            className="relative mb-6"
          >
            <FiSearch
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un diagnostic..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition"
            />
          </form>

          {/* ── Feed ── */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse"
                >
                  <div className="flex items-center gap-3 p-5">
                    <div className="w-11 h-11 bg-slate-200 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-200 rounded-full w-1/3" />
                      <div className="h-2.5 bg-slate-100 rounded-full w-1/2" />
                    </div>
                  </div>
                  <div className="h-56 bg-slate-100" />
                  <div className="p-5 space-y-2">
                    <div className="h-3.5 bg-slate-200 rounded-full w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-full w-full" />
                    <div className="h-3 bg-slate-100 rounded-full w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-16 text-slate-400">
              <FiMessageSquare size={40} className="mb-3 text-blue-300" />
              <p className="font-semibold text-slate-700">Aucune publication trouvée</p>
              <p className="text-sm mt-1">Soyez le premier à poser une question !</p>
            </div>
          ) : (
            <div className="space-y-5">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  user={user}
                  navigate={navigate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          onCreated={handlePostCreated}
          user={user}
        />
      )}
    </>
  );
};

export default Diagnostics;