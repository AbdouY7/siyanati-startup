import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import {
  getUserPublications,
  createDiagnosticPost,
  updateDiagnosticPost,
  deleteDiagnosticPost,
} from "../../services/diagnosticService";
import { getUserVehicles } from "../../services/vehicleService";
import {
  FiChevronLeft,
  FiPlus,
  FiMessageSquare,
  FiBookmark,
  FiShare2,
  FiEdit3,
  FiTrash2,
  FiChevronRight,
  FiImage,
  FiX,
  FiChevronDown,
  FiTag,
  FiFileText,
  FiType,
  FiAlertTriangle,
} from "react-icons/fi";

const PublicationsProblemsPage = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [userVehicles, setUserVehicles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  // Edit mode states
  const [editingPost, setEditingPost] = useState(null); // null = create mode, object = edit mode

  // Delete confirmation states
  const [deleteTarget, setDeleteTarget] = useState(null); // post id to delete
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    vehicle_id: "",
    title: "",
    tags: "",
    description: "",
    images: [],
    imageFiles: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const data = await getUserPublications();
          setPosts(data?.posts || []);
          const indices = {};
          (data?.posts || []).forEach((p) => {
            indices[p.id] = 0;
          });
          setCurrentImageIndex(indices);
        } catch (error) {
          console.error("Failed to fetch publications", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  const fetchUserVehicles = useCallback(async () => {
    setIsLoadingVehicles(true);
    try {
      const response = await getUserVehicles();

      let vehicles = [];
      if (Array.isArray(response)) {
        vehicles = response;
      } else if (response?.data && Array.isArray(response.data)) {
        vehicles = response.data;
      } else if (response?.vehicles && Array.isArray(response.vehicles)) {
        vehicles = response.vehicles;
      } else if (typeof response === "object" && response !== null) {
        const possibleArrays = Object.values(response).filter(Array.isArray);
        if (possibleArrays.length > 0) {
          vehicles = possibleArrays[0];
        }
      }

      setUserVehicles(vehicles);
    } catch (error) {
      console.error("Failed to fetch vehicles", error);
      setUserVehicles([]);
    } finally {
      setIsLoadingVehicles(false);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen && user) {
      fetchUserVehicles();
    }
  }, [fetchUserVehicles, isModalOpen, user]);

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

  // ── Delete ──
  const openDeleteConfirm = (postId) => {
    setDeleteTarget(postId);
  };

  const closeDeleteConfirm = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteDiagnosticPost(deleteTarget);
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete post", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Open Create Modal ──
  const openCreateModal = () => {
    setEditingPost(null);
    setIsModalOpen(true);
    setSubmitError(null);
    setFormData({
      vehicle_id: "",
      title: "",
      tags: "",
      description: "",
      images: [],
      imageFiles: [],
    });
    setPreviewImages([]);
  };

  // ── Open Edit Modal ──
  const openEditModal = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
    setSubmitError(null);
    setFormData({
      vehicle_id: post.vehicle_id || "",
      title: post.title || "",
      tags: (post.tags || []).join(", "),
      description: post.description || "",
      images: post.images || [],
      imageFiles: [],
    });
    // Existing images from the server are URLs
    setPreviewImages(post.images || []);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setSubmitError(null);
    setEditingPost(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newPreviews = [];
    const newFiles = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        newFiles.push(file);

        if (newPreviews.length === files.length) {
          setPreviewImages((prev) => [...prev, ...newPreviews]);
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...newPreviews],
            imageFiles: [...(prev.imageFiles || []), ...newFiles],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      // Also remove from imageFiles if applicable (new files start after existing images count)
      const existingCount = editingPost ? (editingPost.images || []).length : 0;
      let newImageFiles = prev.imageFiles || [];
      if (index >= existingCount) {
        const fileIndex = index - existingCount;
        newImageFiles = newImageFiles.filter((_, i) => i !== fileIndex);
      }
      return { ...prev, images: newImages, imageFiles: newImageFiles };
    });
  };

  // ── Submit (Create or Update) ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (editingPost) {
        // ── UPDATE MODE ──
        const formPayload = new FormData();
        formPayload.append("title", formData.title);
        formPayload.append("description", formData.description);

        // New image files to upload
        formData.imageFiles?.forEach((file) => {
          formPayload.append("images", file);
        });

        const response = await updateDiagnosticPost(editingPost.id, formPayload);

        if (response?.success && response?.data) {
          setPosts((prev) =>
            prev.map((p) => (p.id === editingPost.id ? response.data : p)),
          );
          closeModal();
        } else {
          setSubmitError("Erreur lors de la modification du post");
        }
      } else {
        // ── CREATE MODE ──
        const formPayload = new FormData();
        formPayload.append("title", formData.title);
        formPayload.append("description", formData.description);
        if (formData.vehicle_id) {
          formPayload.append("vehicle_id", formData.vehicle_id);
        }

        formData.imageFiles?.forEach((file) => {
          formPayload.append("images", file);
        });

        const response = await createDiagnosticPost(formPayload);

        if (response?.success && response?.data) {
          const newPost = response.data;
          setPosts((prev) => [newPost, ...prev]);
          setCurrentImageIndex((prev) => ({
            ...prev,
            [newPost.id]: 0,
          }));
          closeModal();
        } else {
          setSubmitError("Erreur lors de la création du post");
        }
      }
    } catch (error) {
      console.error("Failed to submit post", error);
      setSubmitError(
        error?.response?.data?.message ||
          "Une erreur s'est produite. Veuillez réessayer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isModalOpen, isSubmitting]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-sm">
              <FiChevronLeft size={20} />
            </Link>
            <h2 className="text-3xl font-bold text-[#1e3a8a] tracking-tight">
              PUBLICATIONS & PROBLÈMES
            </h2>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-sm">
            Ajoutez un post <FiPlus size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <FiMessageSquare size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Aucune publication</p>
            <p className="text-sm mt-1">
              Partagez votre premier problème ou publication
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {posts.map((post) => {
              const images =
                post.images?.length > 0
                  ? post.images
                  : ["/placeholder-car.png"];
              const currentIdx = currentImageIndex[post.id] || 0;

              return (
                <div
                  key={post.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                  <div className="flex items-center gap-3 p-4 pb-2">
                    <img
                      src={user?.avatar || "/default-avatar.png"}
                      alt="User"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">
                        {user?.full_name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {user?.client_profile?.wilaya}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {post.created_at
                        ? new Date(post.created_at).toLocaleDateString("fr-FR")
                        : "il y a 2h"}
                    </span>
                  </div>

                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden mx-4 rounded-xl">
                    <img
                      src={images[currentIdx]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => prevImage(post.id, images.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition">
                          <FiChevronLeft size={16} />
                        </button>
                        <button
                          onClick={() => nextImage(post.id, images.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition">
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

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">
                      {post.title || "Sans titre"}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-3">
                      <span>
                        {post.vehicle?.brand?.name ||
                          post.brand?.name ||
                          "Véhicule"}
                      </span>
                      <span>•</span>
                      <span>{post.vehicle?.year || post.year || "N/A"}</span>
                      <span>•</span>
                      <span>
                        {post.vehicle?.fuel_type || post.fuel_type || "N/A"}
                      </span>
                      <span>•</span>
                      <span>{post.vehicle?.engine || "N/A"}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(post.tags || []).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {post.description || "Description du problème..."}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition text-xs">
                          <FiMessageSquare size={14} />
                          <span>{post.comments_count || "0"}</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition text-xs">
                          <FiBookmark size={14} />
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition text-xs">
                          <FiShare2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(post)}
                          title="Modifier le post"
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition">
                          <FiEdit3 size={14} />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(post.id)}
                          title="Supprimer le post"
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-[#1e3a8a]">
                {editingPost ? "Modifier le post" : "Ajoutez nouveau post"}
              </h3>
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition disabled:opacity-50">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {submitError}
                </div>
              )}

              {/* Vehicle selector — only for create mode */}
              {!editingPost && (
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiChevronDown size={18} />
                  </div>
                  <select
                    name="vehicle_id"
                    value={formData.vehicle_id}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer">
                    <option value="">Choisir une voiture du garage</option>
                    {userVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand?.name} {vehicle.model?.name} (
                        {vehicle.year})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiType size={18} />
                </div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Titre de post (court et clair)"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tags — only for create mode */}
              {!editingPost && (
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiTag size={18} />
                  </div>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="Étiquettes de catégorie (séparées par des virgules)"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <FiFileText size={18} />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description du post"
                  required
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Photo du véhicule
                </p>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-blue-300 transition">
                  {previewImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {previewImages.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition">
                            <FiX size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition">
                        <FiPlus size={24} className="text-gray-400" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-8 flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 transition">
                      <FiImage size={32} className="mb-2" />
                      <span className="text-sm">
                        Cliquez pour ajouter des photos
                      </span>
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
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition shadow-sm">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>
                      {editingPost ? "Modification..." : "Envoi en cours..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>{editingPost ? "Modifier" : "Ajoutez"}</span>
                    {editingPost ? (
                      <FiEdit3 size={16} />
                    ) : (
                      <FiPlus size={16} />
                    )}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeDeleteConfirm}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-[fadeIn_0.15s_ease-out]">
            <div className="mx-auto w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mb-4">
              <FiAlertTriangle size={28} className="text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Supprimer ce post ?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Cette action est irréversible. Le post sera définitivement supprimé.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={closeDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50">
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition disabled:bg-rose-400">
                {isDeleting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 size={14} />
                    <span>Supprimer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationsProblemsPage;
