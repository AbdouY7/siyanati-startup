import { useMemo, useState, useRef } from "react";
import { getImageUrl } from "../../utils/imageUtils";
import { useNavigate } from "react-router-dom";
import {
  RiBuilding2Line,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiLoader4Line,
  RiMapPinLine,
  RiPhoneLine,
  RiSave3Line,
  RiStarFill,
  RiUser3Line,
} from "react-icons/ri";
import useAuthStore from "../../store/authStore";
import {
  deleteMyAccount,
  updateMyProfessionalProfile,
} from "../../services/professionalService";

const fieldClass =
  "w-full rounded-xl border border-[#e9effd] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10";

const emptyToString = (value) =>
  value === null || value === undefined ? "" : String(value);

export default function ProfilePro() {
  const navigate = useNavigate();
  const { user, accessToken, setAuth, clearAuth } = useAuthStore();
  const profile = user?.professional_profile || {};
  const garage = profile.ProfessionalStore || null;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(() => ({
    full_name: emptyToString(profile.full_name),
    phone: emptyToString(user?.phone),
    specialty_type: emptyToString(profile.specialty_type),
    experience_years: emptyToString(profile.experience_years),
    wilaya: emptyToString(profile.wilaya),
    location_address: emptyToString(profile.location_address),
    bio: emptyToString(profile.bio),
    hourly_rate_dzd: emptyToString(profile.hourly_rate_dzd),
    work_type: emptyToString(profile.work_type || "individuel"),
    garage_name: emptyToString(garage?.name),
    garage_wilaya: emptyToString(garage?.wilaya),
    garage_address: emptyToString(garage?.address),
    garage_logo_url: emptyToString(garage?.logo_url),
    garage_images: emptyToString(garage?.images?.join(", ")),
  }));

  const initials = useMemo(() => {
    const name = profile.full_name || "Professionnel";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [profile.full_name]);

  const heroImage = getImageUrl(garage?.logo_url || garage?.images?.[0] || "");
  const garageImages = garage?.images?.map(getImageUrl) || [];
  const avatarImage = getImageUrl(profile.avatar_url || user?.avatar_url || "");

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [garageLogoFile, setGarageLogoFile] = useState(null);
  const [garageImageFiles, setGarageImageFiles] = useState([]);

  const profilePicRef = useRef(null);
  const garageLogoRef = useRef(null);
  const garageImagesRef = useRef(null);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (profilePicFile) formData.append("profilePicture", profilePicFile);
      if (garageLogoFile) formData.append("garageLogo", garageLogoFile);
      if (garageImageFiles.length > 0) {
        garageImageFiles.forEach((file) => {
          formData.append("garageImages", file);
        });
      }

      const updatedUser = await updateMyProfessionalProfile(formData);
      await setAuth(updatedUser, accessToken);
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
      <div className="overflow-hidden rounded-2xl border border-[#e9effd] bg-white shadow-sm">
        <div className="h-40 bg-gradient-to-r from-[#2563eb] to-[#0b3c5d] relative">
          {heroImage && (
            <img
              src={heroImage}
              alt="Garage"
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
          )}
        </div>
        <div className="px-6 pb-6 ">
          <div className="-mt-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-end gap-4 z-10">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#2563eb] text-2xl font-bold text-white shadow-lg ">
                {avatarImage ? (
                  <img
                    src={avatarImage}
                    alt={profile.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : heroImage ? (
                  <img
                    src={heroImage}
                    alt={profile.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-[#1f1f1f]">
                  {profile.full_name || "Professionnel"}
                </h1>
                <p className="mt-1 text-sm text-[#6b7280]">
                  {profile.specialty_type || "Specialite non renseignee"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#6b7280]">
                  <span className="inline-flex items-center gap-1">
                    <RiMapPinLine /> {profile.wilaya || "Wilaya non renseignee"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <RiPhoneLine /> {user?.phone || "Telephone non renseigne"}
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
                onClick={() => setEditing((value) => !value)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
                <RiEdit2Line />{" "}
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#e9effd] bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#1f1f1f]">
            <RiUser3Line className="text-[#2563eb]" /> Informations
            professionnelles
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info label="Nom complet" value={profile.full_name} />
            <Info label="Telephone" value={user?.phone} />
            <Info label="Specialite" value={profile.specialty_type} />
            <Info
              label="Experience"
              value={
                profile.experience_years
                  ? `${profile.experience_years} ans`
                  : "Non renseignee"
              }
            />
            <Info label="Wilaya" value={profile.wilaya} />
            <Info label="Adresse" value={profile.location_address} />
            <Info
              label="Tarif horaire"
              value={
                profile.hourly_rate_dzd
                  ? `${Number(profile.hourly_rate_dzd).toLocaleString("fr-DZ")} DA`
                  : "Non renseigne"
              }
            />
            <Info
              label="Type de travail"
              value={
                profile.work_type === "avec_magasin"
                  ? "Avec garage"
                  : "Individuel"
              }
            />
          </div>
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">
              Bio
            </p>
            <p className="mt-2 rounded-xl bg-[#f8fafc] p-4 text-sm leading-relaxed text-[#4b5563]">
              {profile.bio || "Aucune bio renseignee."}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e9effd] bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#1f1f1f]">
            <RiBuilding2Line className="text-[#2563eb]" /> Garage
          </h2>
          {garage ? (
            <div className="space-y-4">
              <Info label="Nom" value={garage.name} />
              <Info label="Wilaya" value={garage.wilaya} />
              <Info label="Adresse" value={garage.address} />
              {garageImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {garageImages.slice(0, 4).map((image) => (
                    <img
                      key={image}
                      src={image}
                      alt="Garage"
                      className="h-24 w-full rounded-xl object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="rounded-xl bg-[#f8fafc] p-4 text-sm text-[#6b7280]">
              Ce professionnel travaille sans garage.
            </p>
          )}
        </div>
      </div>

      {editing && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-[#e9effd] bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-bold text-[#1f1f1f]">
            Modifier mes informations
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Nom complet"
              value={form.full_name}
              onChange={(value) => updateField("full_name", value)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6b7280]">Photo de profil</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={profilePicRef}
                  onChange={(e) => setProfilePicFile(e.target.files[0])}
                />
                <button
                  type="button"
                  onClick={() => profilePicRef.current.click()}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Choisir une image
                </button>
                {profilePicFile && <span className="text-xs text-gray-500">{profilePicFile.name}</span>}
              </div>
            </div>
            <Field
              label="Telephone"
              value={form.phone}
              onChange={(value) => updateField("phone", value)}
            />
            <Field
              label="Specialite"
              value={form.specialty_type}
              onChange={(value) => updateField("specialty_type", value)}
            />
            <Field
              label="Experience"
              type="number"
              value={form.experience_years}
              onChange={(value) => updateField("experience_years", value)}
            />
            <Field
              label="Wilaya"
              value={form.wilaya}
              onChange={(value) => updateField("wilaya", value)}
            />
            <Field
              label="Adresse"
              value={form.location_address}
              onChange={(value) => updateField("location_address", value)}
            />
            <Field
              label="Tarif horaire DZD"
              type="number"
              value={form.hourly_rate_dzd}
              onChange={(value) => updateField("hourly_rate_dzd", value)}
            />
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#6b7280]">
                Type de travail
              </label>
              <select
                value={form.work_type}
                onChange={(e) => updateField("work_type", e.target.value)}
                className={fieldClass}>
                <option value="individuel">Individuel</option>
                <option value="avec_magasin">Avec garage</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#6b7280]">
                Bio
              </label>
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          {form.work_type === "avec_magasin" && (
            <div className="mt-6 border-t border-[#e9effd] pt-5">
              <h3 className="mb-4 text-sm font-bold text-[#1f1f1f]">
                Informations du garage
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Nom du garage"
                  value={form.garage_name}
                  onChange={(value) => updateField("garage_name", value)}
                />
                <Field
                  label="Wilaya du garage"
                  value={form.garage_wilaya}
                  onChange={(value) => updateField("garage_wilaya", value)}
                />
                <Field
                  label="Adresse du garage"
                  value={form.garage_address}
                  onChange={(value) => updateField("garage_address", value)}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#6b7280]">Logo du garage</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={garageLogoRef}
                      onChange={(e) => setGarageLogoFile(e.target.files[0])}
                    />
                    <button
                      type="button"
                      onClick={() => garageLogoRef.current.click()}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Choisir le logo
                    </button>
                    {garageLogoFile && <span className="text-xs text-gray-500 truncate max-w-[120px]">{garageLogoFile.name}</span>}
                  </div>
                </div>
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#6b7280]">Images du garage</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      ref={garageImagesRef}
                      onChange={(e) => setGarageImageFiles(Array.from(e.target.files))}
                    />
                    <button
                      type="button"
                      onClick={() => garageImagesRef.current.click()}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Choisir des images
                    </button>
                    {garageImageFiles.length > 0 && <span className="text-xs text-gray-500">{garageImageFiles.length} fichier(s) selectionne(s)</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

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
        {value || "Non renseigne"}
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
