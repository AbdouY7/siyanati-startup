import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  Heart,
  Package,
  Share2,
  ShoppingCart,
} from "lucide-react";
import { getPartById } from "../services/partService";
import useFavoriteStore from "../store/useFavoriteStore";
import useAuthStore from "../store/authStore";
import AuthRequiredModal from "../components/modals/AuthRequiredModal";
import { FiArrowLeft } from "react-icons/fi";

const formatCondition = (condition) => {
  const labels = {
    new: "Neuf",
    used: "Occasion",
    refurbished: "Reconditionne",
  };
  return labels[condition] || condition || "N/A";
};

const formatPrice = (price) => Number(price || 0).toLocaleString("fr-DZ");

function StatusBadge({ type, value }) {
  const statusStyles = {
    etat: {
      Neuf: "bg-green-100 text-green-700",
      Occasion: "bg-orange-100 text-orange-700",
      Reconditionne: "bg-purple-100 text-purple-700",
    },
    disponibilite: {
      "En stock": "bg-blue-100 text-blue-700",
      Indisponible: "bg-red-100 text-red-700",
    },
  };

  const icon = value === "En stock" || value === "Neuf" ? (
    <Check className="w-4 h-4" />
  ) : (
    <AlertCircle className="w-4 h-4" />
  );

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
        statusStyles[type]?.[value] || "bg-gray-100 text-gray-700"
      }`}
    >
      {icon}
      {value}
    </div>
  );
}

export default function PartDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [part, setPart] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuthStore();
  const { checkIsFavorited, toggleFavorite, isFavorited, isToggling } = useFavoriteStore();
  const isFavorite = isFavorited(id, "part");
  const toggling = isToggling(id, "part");

  useEffect(() => {
    const fetchPart = async () => {
      try {
        setLoading(true);
        const data = await getPartById(id);
        setPart(data);
        setError(null);
      } catch (err) {
        setError("Impossible de charger les details de cette piece.");
      } finally {
        setLoading(false);
      }
    };

    fetchPart();
  }, [id]);

  // Check if this part is already favorited when user is logged in
  useEffect(() => {
    if (user && id) {
      checkIsFavorited(id, "part");
    }
  }, [user, id, checkIsFavorited]);

  const handleToggleFavorite = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    toggleFavorite(id, "part");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !part) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 pt-28">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors flex items-center justify-center text-slate-600 hover:text-blue-600 mb-6 w-fit"
          title="Retour"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="max-w-3xl bg-red-50 border border-red-100 text-red-700 rounded-xl p-4">
          {error || "Piece introuvable."}
        </div>
      </div>
    );
  }

  const compatibility = part.compatibilities?.[0];
  const conditionLabel = formatCondition(part.condition);
  const availability = part.stock_qty > 0 ? "En stock" : "Indisponible";
  const image = part.images?.[0] || "/placeholder-part.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[100px] pb-8">
        {/* Go back button */}
        <button
          onClick={() => navigate(-1)}
          className="p-2 w-fit rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition flex items-center justify-center mb-6"
          title="Retour"
        >
          <FiArrowLeft size={20} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="flex flex-col gap-4">
            <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden aspect-square flex items-center justify-center">
              <img src={image} alt={part.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4">
                <StatusBadge type="etat" value={conditionLabel} />
              </div>
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/90 text-slate-700 border border-slate-200 backdrop-blur-sm">
                  {part.category?.name || "General"}
                </span>
              </div>
            </div>

            {part.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {part.images.map((img) => (
                  <img
                    key={img}
                    src={img}
                    alt={part.name}
                    className="w-20 h-20 object-cover rounded-lg border-2 border-slate-200"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="border-b border-slate-200 pb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                {part.name}
              </h1>
              <p className="text-slate-600 text-lg">
                <span className="font-semibold text-slate-900">
                  {compatibility?.brand?.name || "Universel"}
                </span>{" "}
                {compatibility?.model?.name || ""}{" "}
                {compatibility ? `- ${compatibility.year_from}${compatibility.year_to ? ` / ${compatibility.year_to}` : ""}` : ""}
                {compatibility?.engine_variant ? ` - ${compatibility.engine_variant}` : ""}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Prix</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {formatPrice(part.price_dzd)}
                    <span className="text-lg text-slate-600 ml-2">DZD</span>
                  </p>
                </div>
                <StatusBadge type="disponibilite" value={availability} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 mb-1">Stock</p>
                  <p className="font-semibold text-slate-900">{part.stock_qty}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Vendeur</p>
                  <p className="font-semibold text-slate-900 capitalize">{part.seller_type}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">SKU</p>
                  <p className="font-semibold text-slate-900">{part.sku || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Reference OEM</p>
                  <p className="font-semibold text-slate-900">{part.oem_reference || "N/A"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Description</h3>
              <p className="text-slate-600 leading-relaxed">
                {part.description || "Aucune description fournie."}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Compatibilite</h3>
              {part.compatibilities?.length ? (
                <div className="space-y-2">
                  {part.compatibilities.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-700">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span>
                        {item.brand?.name || "Universel"} {item.model?.name || ""} - {item.year_from}
                        {item.year_to ? ` / ${item.year_to}` : ""} {item.engine_variant || ""}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Aucune compatibilite specifique.</p>
              )}
            </div>

            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="quantity" className="text-sm font-medium text-slate-700">
                    Quantite
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 10, 15, 20].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 flex gap-3">
                  <button
                    onClick={() => {
                      if (!user) {
                        setAuthModalOpen(true);
                      } else {
                        navigate(`/Buy-part/${id}`);
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Achetez
                  </button>
                  <button
                    onClick={handleToggleFavorite}
                    disabled={toggling}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      isFavorite
                        ? "bg-red-100 border-red-300 text-red-600"
                        : "border-slate-300 text-slate-600 hover:border-red-300"
                    } ${toggling ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                  </button>
                  <button className="px-4 py-3 rounded-lg border-2 border-slate-300 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
