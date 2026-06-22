import { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiDeleteBin6Line,
  RiEdit2Line,
  RiLoader4Line,
  RiMapPinLine,
  RiPhoneLine,
  RiSave3Line,
  RiStarFill,
  RiUser3Line,
  RiImageLine,
  RiFileTextLine,
} from "react-icons/ri";
import useAuthStore from "../../store/authStore";
import { deleteMyAccount } from "../../services/userService";
import { updateMyStoreProfile } from "../../services/storeService";
import { getImageUrl } from "../../utils/imageUtils";
import LocationSelector from "../../components/uiComponents/LocationSelector";

const fieldClass =
  "w-full rounded-xl border border-[#e9effd] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10";

const emptyToString = (value) =>
  value === null || value === undefined ? "" : String(value);

export default function StoreProfile() {
  const navigate = useNavigate();
  const { user, accessToken, setAuth, clearAuth } = useAuthStore();
  const profile = user?.store_profile || {};

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(() => ({
    owner_name: emptyToString(profile.owner_name),
    store_name: emptyToString(profile.store_name),
    phone: emptyToString(user?.phone),
    description: emptyToString(profile.description),
    wilaya: emptyToString(profile.wilaya),
    address: emptyToString(profile.address),
    location_coordinates: emptyToString(profile.location_coordinates),
    dahabia_rip: emptyToString(profile.dahabia_rip),
    logo_url: emptyToString(profile.logo_url),
    images: emptyToString(profile.images?.join(", ")),
  }));

  const initials = useMemo(() => {
    const name = profile.store_name || "Magasin";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [profile.store_name]);

  const heroImage = getImageUrl(profile.logo_url || profile.images?.[0]) || "";
  const storeImages = profile.images?.map(getImageUrl) || [];
  const storeDocuments = profile.documents || [];

  const [logoFile, setLogoFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);

  const logoRef = useRef(null);
  const imagesRef = useRef(null);
  const documentsRef = useRef(null);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const formData = new FormData();
      formData.append("owner_name", form.owner_name);
      formData.append("store_name", form.store_name);
      formData.append("phone", form.phone);
      formData.append("description", form.description);
      formData.append("wilaya", form.wilaya);
      formData.append("address", form.address);
      formData.append("location_coordinates", form.location_coordinates);
      formData.append("dahabia_rip", form.dahabia_rip);

      if (logoFile) formData.append("logo", logoFile);
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => formData.append("images", file));
      }
      if (documentFiles.length > 0) {
        documentFiles.forEach((file) => formData.append("documents", file));
      }

      const updatedUser = await updateMyStoreProfile(formData);
      await setAuth(updatedUser.user ?? updatedUser, accessToken);
      setEditing(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible de mettre à jour le profil.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Voulez-vous vraiment supprimer votre compte ? Cette action bloquera votre accès.",
      )
    )
      return;

    try {
      setSaving(true);
      await deleteMyAccount();
      clearAuth();
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible de supprimer le compte.",
      );
      setSaving(false);
    }
  };

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Hero / Header Card */}
      <div className="overflow-hidden rounded-2xl border border-[#e9effd] bg-white shadow-sm">
        <div className="h-40 bg-gradient-to-r from-[#2563eb] to-[#0b3c5d] relative">
          {heroImage && (
            <img
              src={heroImage}
              alt="Store"
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
          )}
        </div>
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-end gap-4 z-10">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#2563eb] text-2xl font-bold text-white shadow-lg">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={profile.store_name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-avatar.png";
                    }}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-[#1f1f1f]">
                  {profile.store_name || "Mon Magasin"}
                </h1>
                <p className="mt-1 text-sm text-[#6b7280]">
                  {profile.owner_name || "Propriétaire non renseigné"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#6b7280]">
                  <span className="inline-flex items-center gap-1">
                    <RiMapPinLine /> {profile.wilaya || "Wilaya non renseignée"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <RiPhoneLine /> {user?.phone || "Téléphone non renseigné"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <RiStarFill className="text-[#f59e0b]" />{" "}
                    {Number(profile.rating_avg || 0).toFixed(1)} (
                    {profile.rating_count || 0})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditing((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
                <RiEdit2Line />
                {editing ? "Fermer" : "Modifier mes informations"}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60">
                <RiDeleteBin6Line /> Supprimer le compte
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main Info */}
        <div className="rounded-2xl border border-[#e9effd] bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#1f1f1f]">
            <RiUser3Line className="text-[#2563eb]" /> Informations du magasin
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info label="Nom du magasin" value={profile.store_name} />
            <Info label="Propriétaire" value={profile.owner_name} />
            <Info label="Téléphone" value={user?.phone} />
            <Info label="Wilaya" value={profile.wilaya} />
            <Info label="Adresse" value={profile.address} />
            <Info label="Coordonnées GPS" value={profile.location_coordinates} />
            <Info label="Compte Dahabia (RIP)" value={profile.dahabia_rip} />
            <Info
              label="Statut"
              value={
                profile.status === "approved"
                  ? "Approuvé"
                  : profile.status === "pending"
                    ? "En attente"
                    : profile.status === "rejected"
                      ? "Rejeté"
                      : profile.status
              }
            />
          </div>
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">
              Description
            </p>
            <p className="mt-2 rounded-xl bg-[#f8fafc] p-4 text-sm leading-relaxed text-[#4b5563]">
              {profile.description || "Aucune description renseignée."}
            </p>
          </div>
        </div>

        {/* Images sidebar */}
        <div className="rounded-2xl border border-[#e9effd] bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#1f1f1f]">
            <RiImageLine className="text-[#2563eb]" /> Photos du magasin
          </h2>
          {storeImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {storeImages.slice(0, 4).map((image) => (
                <img
                  key={image}
                  src={image}
                  alt="Magasin"
                  className="h-24 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-[#f8fafc] p-4 text-sm text-[#6b7280]">
              Aucune photo renseignée.
            </p>
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-2xl border border-[#e9effd] bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#1f1f1f]">
          <RiFileTextLine className="text-[#2563eb]" /> Documents du magasin
        </h2>
        {storeDocuments.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {storeDocuments.map((doc, index) => (
              <a
                key={`${doc}-${index}`}
                href={getImageUrl(doc)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-[#e9effd] bg-[#f8fafc] px-3 py-2 text-sm font-medium text-[#374151] hover:border-[#2563eb] hover:text-[#2563eb]">
                <RiFileTextLine />
                Document {index + 1}
              </a>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-[#f8fafc] p-4 text-sm text-[#6b7280]">
            Aucun document renseigné.
          </p>
        )}
      </div>

      {/* Edit Form */}
      {editing && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-[#e9effd] bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-bold text-[#1f1f1f]">
            Modifier mes informations
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Nom du magasin"
              value={form.store_name}
              onChange={(value) => updateField("store_name", value)}
            />
            <Field
              label="Nom du propriétaire"
              value={form.owner_name}
              onChange={(value) => updateField("owner_name", value)}
            />
            <Field
              label="Téléphone"
              value={form.phone}
              onChange={(value) => updateField("phone", value)}
            />
            <Field
              label="Wilaya"
              value={form.wilaya}
              onChange={(value) => updateField("wilaya", value)}
            />
            <Field
              label="Adresse"
              value={form.address}
              onChange={(value) => updateField("address", value)}
            />
            <Field
              label="Compte Dahabia (RIP)"
              value={form.dahabia_rip}
              onChange={(value) => updateField("dahabia_rip", value)}
            />

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#6b7280]">
                Coordonnées GPS
              </label>
              <LocationSelector
                value={form.location_coordinates}
                onChange={(value) => updateField("location_coordinates", value)}
                placeholder="Sélectionnez l'emplacement du magasin"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6b7280]">
                Logo du magasin
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={logoRef}
                  onChange={(e) => setLogoFile(e.target.files[0])}
                />
                <button
                  type="button"
                  onClick={() => logoRef.current.click()}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50">
                  Choisir le logo
                </button>
                {logoFile && (
                  <span className="text-xs text-gray-500 truncate max-w-[120px]">
                    {logoFile.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6b7280]">
                Images du magasin
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  ref={imagesRef}
                  onChange={(e) => setImageFiles(Array.from(e.target.files))}
                />
                <button
                  type="button"
                  onClick={() => imagesRef.current.click()}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50">
                  Choisir des images
                </button>
                {imageFiles.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {imageFiles.length} fichier(s) sélectionné(s)
                  </span>
                )}
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6b7280]">
                Documents du magasin
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  multiple
                  className="hidden"
                  ref={documentsRef}
                  onChange={(e) => setDocumentFiles(Array.from(e.target.files))}
                />
                <button
                  type="button"
                  onClick={() => documentsRef.current.click()}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50">
                  Choisir des documents
                </button>
                {documentFiles.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {documentFiles.length} document(s) sélectionné(s)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9ca3af]">
                Les nouveaux documents seront ajoutés et les administrateurs
                seront notifiés.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#6b7280]">
                Description
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1f1f1f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60">
              {saving ? (
                <RiLoader4Line className="animate-spin" />
              ) : (
                <RiSave3Line />
              )}
              Enregistrer
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#1f1f1f]">
        {value || "Non renseigné"}
      </p>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#6b7280]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClass}
      />
    </div>
  );
}
