import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiAlertTriangle,
  FiLock,
  FiUser,
  FiCreditCard,
  FiClock,
  FiShield,
  FiShoppingCart
} from "react-icons/fi";
import Footer from "../../components/layaouts/Footer";
import { simulateEdahabiaWebhook } from "../../services/paymentService";
import { getUserPaymentAccounts } from "../../services/paymentAccountService";

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

export default function AppointmentPaymentPage() {
  const { ref } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const amount = searchParams.get("amount") || "0";
  const appointmentId = searchParams.get("id");

  const [form, setForm] = useState({
    fullName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
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

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accounts = await getUserPaymentAccounts();
        if (accounts && accounts.length > 0) {
          const defaultAcc = accounts.find((a) => a.is_default) || accounts[0];
          setForm((prev) => ({
            ...prev,
            fullName: defaultAcc.full_name || prev.fullName,
            cardNumber: fmtCard(defaultAcc.ccp_code || prev.cardNumber),
          }));
        }
      } catch (err) {
        // ignore
      }
    };
    fetchAccounts();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Nom obligatoire";
    if (form.cardNumber.replace(/\s/g, "").length < 16)
      e.cardNumber = "16 chiffres requis";
    if (form.expiry.length < 5) e.expiry = "Format MM/AA requis";
    if (form.cvv.length < 3) e.cvv = "3 ou 4 chiffres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await simulateEdahabiaWebhook(ref, "success");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Erreur lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const backLink = appointmentId ? `/appointments/${appointmentId}` : "/profile/appointments";
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 max-w-md mx-auto px-6 py-24 text-center">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FiCheckCircle size={44} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Paiement Réussi !
          </h1>
          <p className="text-gray-400 text-sm mb-1">
            Paiement de{" "}
            <span className="font-bold text-blue-700">
              {Number(amount).toLocaleString("fr-DZ")} Da
            </span>{" "}
            traité avec succès.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            La consultation est maintenant marquée comme payée.
          </p>

          <Link
            to={backLink}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl active:scale-95 transition-all text-center">
            Retour aux détails du rendez-vous
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-6 pt-[100px] pb-8">
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
          {/* ── LEFT: Summary ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Résumé du paiement
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-semibold">Service</span>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold">
                    Rendez-vous
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4">
                  <span className="text-gray-600">Total à payer</span>
                  <span className="font-black text-blue-700 text-xl">
                    {Number(amount).toLocaleString("fr-DZ")} Da
                  </span>
                </div>
              </div>
            </div>
            
            {/* Info note */}
            <div className="bg-blue-50 rounded-2xl p-4 flex gap-3 text-sm text-blue-800">
              <FiShield className="shrink-0 mt-0.5" size={16} />
              <p>
                Ce paiement sera lié à votre consultation. 
                Le montant sera prélevé de manière sécurisée via Edahabia.
              </p>
            </div>
          </div>

          {/* ── RIGHT: Payment ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center shrink-0 shadow">
                  <span className="text-[10px] font-black text-yellow-900">D</span>
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
                    onChange={(e) => set("fullName", e.target.value.toUpperCase())}
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

            <div className="flex items-start gap-2 text-gray-400 text-xs px-1">
              <FiLock size={12} className="shrink-0 mt-0.5" />
              <span>
                Vos données sont chiffrées SSL. Nous ne stockons jamais les
                informations de votre carte Dahabia.
              </span>
            </div>

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
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Traitement en cours...
                </>
              ) : (
                <>
                  <FiShoppingCart size={18} />
                  Payer {Number(amount).toLocaleString("fr-DZ")} Da
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
