import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiShoppingCart,
  FiCheckCircle,
  FiAlertTriangle,
  FiPackage,
  FiMapPin,
  FiTag,
  FiCpu,
  FiDroplet,
  FiCalendar,
  FiLock,
  FiUser,
  FiCreditCard,
  FiClock,
  FiShield,
} from "react-icons/fi";
import { MdOutlineVerified } from "react-icons/md";

import Footer from "../components/layaouts/Footer";
import { getPartById } from "../services/partService";
import { createOrder } from "../services/orderService";
import { getStoreById } from "../services/storeService";
// ─── Helpers ──────────────────────────────────────────────────────────────────
function EtatBadge({ etat }) {
  return etat === "Neuf" ? (
    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
      ✦ Neuf
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">
      ↻ Occasion
    </span>
  );
}

function DispoBadge({ disponibilite }) {
  const map = {
    "En stock": {
      cls: "bg-blue-100 text-blue-700",
      icon: <FiCheckCircle size={11} />,
      label: "En stock",
    },
    "Stock limité": {
      cls: "bg-red-100 text-red-700",
      icon: <FiAlertTriangle size={11} />,
      label: "Stock limité",
    },
    "Sur commande": {
      cls: "bg-purple-100 text-purple-700",
      icon: <FiPackage size={11} />,
      label: "Sur commande",
    },
  };
  const { cls, icon, label } = map[disponibilite] ?? {
    cls: "bg-gray-100 text-gray-600",
    icon: null,
    label: disponibilite,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {icon} {label}
    </span>
  );
}

// ─── El Dahabia card preview ──────────────────────────────────────────────────
function DahabiaCardPreview({ fullName, cardNumber, expiry }) {
  const raw = cardNumber.replace(/\s/g, "");
  const padded = (raw + "????????????????").slice(0, 16);

  const masked = padded
    .split("")
    .map((c, i) => (i < raw.length ? c : "•"))
    .join("")
    .replace(/(.{4})/g, "$1 ")
    .trim();

  const displayName = fullName || "VOTRE NOM";
  const displayExp = expiry || "MM/AA";

  return (
    <div
      className="relative w-full h-48 rounded-2xl overflow-hidden select-none shadow-2xl"
      style={{
        background:
          "linear-gradient(135deg, #0f2d6e 0%, #1a5fa3 55%, #0e7a52 100%)",
      }}>
      {/* Decorative rings */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[160, 210, 260, 310].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/10"
            style={{
              width: size,
              height: size,
              top: -size / 2 + 20,
              right: -size / 2 + 30,
            }}
          />
        ))}
      </div>

      {/* Chip */}
      <div className="absolute top-5 left-5 w-10 h-7 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400 shadow-sm flex items-center justify-center">
        <div className="w-6 h-4 rounded-[2px] border border-yellow-600/30 grid grid-cols-2 gap-[2px] p-[3px]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-yellow-600/25 rounded-[1px]" />
          ))}
        </div>
      </div>

      {/* Dahabia branding */}
      <div className="absolute top-4 right-5 text-right">
        <p className="text-yellow-300 font-black text-lg tracking-[0.15em] leading-none drop-shadow">
          DAHABIA
        </p>
        <p className="text-white/50 text-[9px] tracking-[0.2em] mt-0.5">
          ALGÉRIE POSTE
        </p>
      </div>

      {/* Card number */}
      <div className="absolute left-5 right-5" style={{ bottom: "44px" }}>
        <p className="text-white/90 font-mono text-[18px] tracking-[0.22em] font-semibold drop-shadow">
          {masked}
        </p>
      </div>

      {/* Name + expiry */}
      <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
        <div>
          <p className="text-white/40 text-[8px] uppercase tracking-widest mb-0.5">
            Titulaire
          </p>
          <p className="text-white text-xs font-semibold tracking-wider uppercase truncate max-w-[160px] drop-shadow">
            {displayName}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-[8px] uppercase tracking-widest mb-0.5">
            Expire fin
          </p>
          <p className="text-white text-xs font-semibold font-mono drop-shadow">
            {displayExp}
          </p>
        </div>
      </div>

      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none" />
    </div>
  );
}

// ─── Quantity stepper ─────────────────────────────────────────────────────────
function Stepper({ value, onChange, min = 1, max = 10 }) {
  return (
    <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 w-fit">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="px-3.5 py-2 text-gray-500 hover:bg-gray-100 active:scale-95 transition-all text-xl leading-none font-light">
        −
      </button>
      <span className="px-5 py-2 text-sm font-bold text-gray-800 bg-white min-w-[44px] text-center border-x border-gray-200">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="px-3.5 py-2 text-gray-500 hover:bg-gray-100 active:scale-95 transition-all text-xl leading-none font-light">
        +
      </button>
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="text-blue-400 shrink-0">{icon}</div>
      <span className="text-gray-400 text-sm flex-1">{label}</span>
      <span className="text-gray-800 text-sm font-semibold">{value}</span>
    </div>
  );
}

// ─── Form field wrapper ───────────────────────────────────────────────────────
function FormField({ label, icon, error, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <div
        className={`flex items-center gap-2 bg-gray-50 border rounded-xl px-3.5 py-2.5 transition-all
        focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400
        ${error ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
        {icon && <span className="text-gray-300 shrink-0">{icon}</span>}
        {children}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
          <FiAlertTriangle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BuyPartPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [part, setPart] = useState(null);
  const [loadingPart, setLoadingPart] = useState(true);

  useEffect(() => {
    const fetchPart = async () => {
      try {
        setLoadingPart(true);
        const data = await getPartById(id);
        setPart(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPart(false);
      }
    };
    fetchPart();
  }, [id]);

  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const fmtCard = (v) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const fmtExpiry = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const fmtCvv = (v) => v.replace(/\D/g, "").slice(0, 4);
  const fmtPhone = (v) => v.replace(/\D/g, "").slice(0, 10);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Nom obligatoire";
    if (form.cardNumber.replace(/\s/g, "").length < 16)
      e.cardNumber = "16 chiffres requis";
    if (form.expiry.length < 5) e.expiry = "Format MM/AA requis";
    if (form.cvv.length < 3) e.cvv = "3 ou 4 chiffres";
    if (form.phone.length < 10) e.phone = "10 chiffres requis";
    if (!form.address.trim()) e.address = "Adresse obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Fetch store to get store_profile_id instead of user_id
      const storeData = await getStoreById(part.seller_id);
      const storeProfileId = storeData?.store_profile?.id;
      
      if (!storeProfileId) {
        throw new Error("Impossible de trouver le profil du magasin");
      }

      const orderData = {
        store_id: storeProfileId,
        items: [{ part_id: part.id, quantity: qty }],
        delivery_type: "home_delivery",
        delivery_address: form.address,
        notes: `Tél: ${form.phone}`,
      };
      await createOrder(orderData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Erreur lors de la commande");
    } finally {
      setLoading(false);
    }
  };

  if (loadingPart) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Chargement...</div>;
  }
  if (!part) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Pièce introuvable</div>;
  }

  const total = Number(part.price_dzd) * qty;

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FiCheckCircle size={44} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Commande confirmée !
          </h1>
          <p className="text-gray-400 text-sm mb-1">
            Paiement de{" "}
            <span className="font-bold text-blue-700">
              {total.toLocaleString("fr-DZ")} Da
            </span>{" "}
            traité avec succès.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Un SMS de confirmation sera envoyé au numéro fourni.
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left mb-8 flex items-center gap-4">
            <img
              src={part.images?.[0] || ""}
              alt={part.name}
              className="w-16 h-16 object-cover rounded-xl bg-gray-100 shrink-0"
            />
            <div>
              <p className="font-bold text-gray-800">{part.name}</p>
              <p className="text-gray-400 text-sm">Vendeur Partenaire</p>
              <p className="text-blue-700 font-black mt-1">
                {total.toLocaleString("fr-DZ")} Da
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to="/shops"
              className="flex-1 no-underline border border-gray-200 text-gray-600 text-sm font-semibold py-3 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-center">
              Retour aux magasins
            </Link>
            <Link
              to="/catalogues"
              className="flex-1 no-underline bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl active:scale-95 transition-all text-center">
              Voir le catalogue
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main page ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 pt-[100px] pb-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-7 transition-colors">
          <FiArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ── LEFT: Part details ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Image + info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative h-64 bg-gradient-to-br from-slate-50 to-blue-50">
                <img
                  src={part.images?.[0] || ""}
                  alt={part.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                  <EtatBadge etat={part.condition === "new" ? "Neuf" : "Occasion"} />
                  <DispoBadge disponibilite={part.stock_qty > 0 ? "En stock" : "Stock limité"} />
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200">
                  {part.category?.name || "Pièce"}
                </div>
              </div>

              <div className="p-5">
                <h1 className="text-xl font-black text-gray-900 mb-1">
                  {part.name}
                </h1>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-5">
                  <MdOutlineVerified className="text-blue-500" size={14} />
                  <span>Vendeur Partenaire</span>
                </div>

                <InfoRow
                  icon={<FiTag size={14} />}
                  label="Catégorie"
                  value={part.category?.name || "Pièce"}
                />
                <InfoRow
                  icon={<FiCpu size={14} />}
                  label="Référence OEM"
                  value={part.oem_reference || "N/A"}
                />
                <InfoRow
                  icon={<FiCalendar size={14} />}
                  label="SKU"
                  value={part.sku || "N/A"}
                />
                <InfoRow
                  icon={<FiDroplet size={14} />}
                  label="Condition"
                  value={part.condition === "new" ? "Neuf" : "Occasion"}
                />
                <InfoRow
                  icon={<FiMapPin size={14} />}
                  label="Disponibilité"
                  value={part.stock_qty > 0 ? "En stock" : "Rupture"}
                />
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Résumé de la commande
              </p>
              <div className="flex items-center justify-between mb-5">
                <span className="text-gray-600 text-sm">Quantité</span>
                <Stepper value={qty} onChange={setQty} />
              </div>
              <div className="space-y-2.5 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Prix unitaire</span>
                  <span>{Number(part.price_dzd).toLocaleString("fr-DZ")} Da</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Quantité</span>
                  <span>× {qty}</span>
                </div>
                <div className="flex justify-between items-baseline font-black text-blue-700 text-xl pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span>{total.toLocaleString("fr-DZ")} Da</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Payment ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Card preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center shrink-0 shadow">
                  <span className="text-[10px] font-black text-yellow-900">
                    D
                  </span>
                </div>
                <h2 className="font-bold text-gray-800">
                  Paiement par Carte Dahabia
                </h2>
                <div className="ml-auto flex items-center gap-1 text-green-600">
                  <FiShield size={13} />
                  <span className="text-xs font-semibold">Sécurisé</span>
                </div>
              </div>
              <DahabiaCardPreview
                fullName={form.fullName}
                cardNumber={form.cardNumber}
                expiry={form.expiry}
              />
            </div>

            {/* Card fields */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FiCreditCard size={13} className="text-blue-400" />
                Informations de la carte
              </p>
              <div className="flex flex-col gap-4">
                <FormField
                  label="Nom complet du titulaire"
                  icon={<FiUser size={15} />}
                  error={errors.fullName}>
                  <input
                    type="text"
                    placeholder="Ex: AHMED BENALI"
                    value={form.fullName}
                    onChange={(e) =>
                      set("fullName", e.target.value.toUpperCase())
                    }
                    className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-300 bg-transparent tracking-wider"
                  />
                </FormField>

                <FormField
                  label="Numéro de la carte (16 chiffres)"
                  icon={<FiCreditCard size={15} />}
                  error={errors.cardNumber}>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0000  0000  0000  0000"
                    value={form.cardNumber}
                    onChange={(e) => set("cardNumber", fmtCard(e.target.value))}
                    className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-300 bg-transparent font-mono tracking-[0.2em]"
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label="Date d'expiration"
                    icon={<FiClock size={15} />}
                    error={errors.expiry}>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/AA"
                      value={form.expiry}
                      onChange={(e) => set("expiry", fmtExpiry(e.target.value))}
                      className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-300 bg-transparent font-mono tracking-widest"
                    />
                  </FormField>

                  <FormField
                    label="Code CVV / CVC"
                    icon={<FiLock size={15} />}
                    error={errors.cvv}>
                    <input
                      type="password"
                      inputMode="numeric"
                      placeholder="• • • •"
                      value={form.cvv}
                      onChange={(e) => set("cvv", fmtCvv(e.target.value))}
                      className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-300 bg-transparent font-mono"
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Delivery fields */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FiPackage size={13} className="text-blue-400" />
                Informations de livraison
              </p>
              <div className="flex flex-col gap-4">
                <FormField label="Numéro de téléphone" error={errors.phone}>
                  <span className="text-gray-400 text-sm font-semibold shrink-0 pr-2.5 border-r border-gray-200">
                    +213
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0XX XX XX XX"
                    value={form.phone}
                    onChange={(e) => set("phone", fmtPhone(e.target.value))}
                    className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-300 bg-transparent pl-2"
                  />
                </FormField>

                <FormField label="Adresse de livraison" error={errors.address}>
                  <textarea
                    placeholder="Numéro, rue, cité, wilaya..."
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    rows={2}
                    className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-300 bg-transparent resize-none"
                  />
                </FormField>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2 text-gray-400 text-xs px-1">
              <FiLock size={12} className="shrink-0 mt-0.5" />
              <span>
                Vos données sont chiffrées SSL. Nous ne stockons jamais les
                informations de votre carte Dahabia.
              </span>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2.5 font-bold text-white py-4 rounded-2xl transition-all duration-200 text-base active:scale-[0.98] shadow-lg
                ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed shadow-none"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                }`}>
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Traitement en cours...
                </>
              ) : (
                <>
                  <FiShoppingCart size={18} />
                  Confirmer le paiement · {total.toLocaleString("fr-DZ")} Da
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
