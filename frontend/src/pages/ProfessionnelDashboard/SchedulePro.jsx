import { useEffect, useMemo, useState } from "react";
import {
  RiAddLine,
  RiCalendarCheckLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiLoader4Line,
  RiSave3Line,
  RiTimeLine,
} from "react-icons/ri";
import {
  addScheduleException,
  deleteScheduleException,
  getProfessionalSchedule,
  saveWeeklySchedule,
} from "../../services/scheduleService";

const DAYS = [
  { value: 0, label: "Dimanche", short: "Dim" },
  { value: 1, label: "Lundi", short: "Lun" },
  { value: 2, label: "Mardi", short: "Mar" },
  { value: 3, label: "Mercredi", short: "Mer" },
  { value: 4, label: "Jeudi", short: "Jeu" },
  { value: 5, label: "Vendredi", short: "Ven" },
  { value: 6, label: "Samedi", short: "Sam" },
];

const emptyWeek = () =>
  Object.fromEntries(
    DAYS.map((day) => [
      day.value,
      {
        enabled: false,
        start_time: "09:00",
        end_time: "17:00",
        slot_duration_minutes: 60,
      },
    ]),
  );

const dateLabel = (value) =>
  new Date(value).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const normalizeDate = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

export default function SchedulePro() {
  const professionalId = "me";

  const [schedules, setSchedules] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [draft, setDraft] = useState(emptyWeek);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [dayOffForm, setDayOffForm] = useState({
    exception_date: "",
    reason: "",
  });

  const scheduleByDay = useMemo(() => {
    const map = new Map();
    schedules.forEach((schedule) => map.set(schedule.day_of_week, schedule));
    return map;
  }, [schedules]);

  const activeDaysCount = schedules.filter((item) => item.is_active).length;

  const syncDraft = (items) => {
    const nextDraft = emptyWeek();
    items.forEach((item) => {
      nextDraft[item.day_of_week] = {
        enabled: item.is_active,
        start_time: item.start_time,
        end_time: item.end_time,
        slot_duration_minutes: item.slot_duration_minutes || 60,
      };
    });
    setDraft(nextDraft);
  };

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfessionalSchedule(professionalId);
      const nextSchedules = data.schedules || [];
      setSchedules(nextSchedules);
      setExceptions(data.exceptions || []);
      setIsAvailable(Boolean(data.is_available));
      syncDraft(nextSchedules);
    } catch (err) {
      setError("Impossible de charger votre planning.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [professionalId]);

  useEffect(() => {
    const handleAvailabilityChange = (event) => {
      if (typeof event.detail?.is_available === "boolean") {
        setIsAvailable(event.detail.is_available);
      }
    };

    window.addEventListener("professional-availability-change", handleAvailabilityChange);
    window.addEventListener("focus", fetchSchedule);

    return () => {
      window.removeEventListener("professional-availability-change", handleAvailabilityChange);
      window.removeEventListener("focus", fetchSchedule);
    };
  }, [professionalId]);

  const updateDraftDay = (day, key, value) => {
    setDraft((current) => ({
      ...current,
      [day]: {
        ...current[day],
        [key]: value,
      },
    }));
  };

  const openEditor = () => {
    syncDraft(schedules);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload = DAYS.filter((day) => draft[day.value].enabled).map((day) => ({
      day_of_week: day.value,
      start_time: draft[day.value].start_time,
      end_time: draft[day.value].end_time,
      slot_duration_minutes: Number(draft[day.value].slot_duration_minutes) || 60,
      is_active: true,
    }));

    try {
      setSaving(true);
      setError(null);
      const data = await saveWeeklySchedule(professionalId, payload);
      setSchedules(data.schedules || []);
      setExceptions(data.exceptions || []);
      setIsAvailable(Boolean(data.is_available));
      syncDraft(data.schedules || []);
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'enregistrer le planning.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddDayOff = async (event) => {
    event.preventDefault();
    if (!dayOffForm.exception_date) return;

    try {
      setSaving(true);
      await addScheduleException(professionalId, {
        exception_date: dayOffForm.exception_date,
        is_day_off: true,
        reason: dayOffForm.reason || "Jour de repos",
      });
      setDayOffForm({ exception_date: "", reason: "" });
      await fetchSchedule();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'ajouter ce jour de repos.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDayOff = async (id) => {
    try {
      setSaving(true);
      await deleteScheduleException(professionalId, id);
      await fetchSchedule();
    } catch (err) {
      setError("Impossible de supprimer ce jour de repos.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#1f1f1f]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Planning de travail
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Consultez vos horaires, ajustez vos jours de travail et ajoutez vos jours de repos.
          </p>
        </div>

        <button
          onClick={openEditor}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-[#2563eb]/20 transition-all hover:bg-[#1d4ed8] active:scale-[0.98]"
        >
          <RiTimeLine className="text-lg" />
          Définir votre planning quotidien
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#e9effd] bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563eb]/10 text-[#2563eb]">
            <RiCalendarCheckLine className="text-xl" />
          </div>
          <p className="mt-4 text-2xl font-bold text-[#1f1f1f]">{activeDaysCount}</p>
          <p className="text-sm text-[#6b7280]">jours actifs par semaine</p>
        </div>

        <div className="rounded-2xl border border-[#e9effd] bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
            <RiTimeLine className="text-xl" />
          </div>
          <p className="mt-4 text-2xl font-bold text-[#1f1f1f]">
            {isAvailable ? "Disponible" : "Indisponible"}
          </p>
          <p className="text-sm text-[#6b7280]">statut actuel du profil</p>
        </div>

        <div className="rounded-2xl border border-[#e9effd] bg-white p-5 shadow-sm lg:col-span-2">
          <p className="text-sm font-semibold text-[#1f1f1f]">Jours de repos exceptionnels</p>
          <p className="mt-1 text-sm text-[#6b7280]">{exceptions.length} date(s) enregistrée(s)</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e9effd] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1f1f1f]">Calendrier hebdomadaire</h2>
            <p className="mt-1 text-xs text-[#6b7280]">
              Les cases vides représentent des jours sans horaire défini.
            </p>
          </div>
          {loading && <RiLoader4Line className="animate-spin text-xl text-[#2563eb]" />}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-7">
          {DAYS.map((day) => {
            const item = scheduleByDay.get(day.value);
            return (
              <div
                key={day.value}
                className={`min-h-40 rounded-2xl border p-4 transition-all ${
                  item?.is_active
                    ? "border-[#2563eb]/30 bg-[#2563eb]/5"
                    : "border-[#e9effd] bg-[#f8fafc]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#1f1f1f]">{day.short}</p>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      item?.is_active
                        ? "bg-[#10b981]/10 text-[#10b981]"
                        : "bg-[#e9effd] text-[#6b7280]"
                    }`}
                  >
                    {item?.is_active ? "Ouvert" : "Repos"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#6b7280]">{day.label}</p>

                {item?.is_active ? (
                  <div className="mt-5 rounded-xl border border-white bg-white p-3 shadow-sm">
                    <p className="text-xs font-medium text-[#6b7280]">Horaires</p>
                    <p className="mt-1 text-lg font-bold text-[#1f1f1f]">
                      {item.start_time} - {item.end_time}
                    </p>
                    <p className="mt-1 text-xs text-[#9ca3af]">
                      Créneaux de {item.slot_duration_minutes} min
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 flex h-20 items-center justify-center rounded-xl border border-dashed border-[#d8e1f3] text-xs font-medium text-[#9ca3af]">
                    Aucun horaire
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <form
          onSubmit={handleAddDayOff}
          className="rounded-2xl border border-[#e9effd] bg-white p-6 shadow-sm lg:col-span-2"
        >
          <h2 className="text-base font-bold text-[#1f1f1f]">Ajouter un jour de repos</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#6b7280]">Date</label>
              <input
                type="date"
                value={dayOffForm.exception_date}
                onChange={(e) => setDayOffForm((current) => ({ ...current, exception_date: e.target.value }))}
                className="w-full rounded-xl border border-[#e9effd] px-3 py-2.5 text-sm outline-none focus:border-[#2563eb]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#6b7280]">Raison</label>
              <input
                type="text"
                value={dayOffForm.reason}
                onChange={(e) => setDayOffForm((current) => ({ ...current, reason: e.target.value }))}
                placeholder="Ex: Congé, urgence..."
                className="w-full rounded-xl border border-[#e9effd] px-3 py-2.5 text-sm outline-none focus:border-[#2563eb]"
              />
            </div>
            <button
              type="submit"
              disabled={saving || !dayOffForm.exception_date}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f1f1f] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RiAddLine /> Ajouter
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-[#e9effd] bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-bold text-[#1f1f1f]">Liste des jours de repos</h2>
          <div className="mt-4 space-y-3">
            {exceptions.length === 0 ? (
              <p className="rounded-xl bg-[#f8fafc] p-4 text-sm text-[#9ca3af]">
                Aucun jour de repos spécifique n'est enregistré.
              </p>
            ) : (
              exceptions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[#e9effd] bg-[#f8fafc] p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1f1f1f]">
                      {dateLabel(normalizeDate(item.exception_date))}
                    </p>
                    <p className="mt-1 text-xs text-[#6b7280]">
                      {item.reason || "Jour de repos"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteDayOff(item.id)}
                    disabled={saving}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[#ef4444] transition-colors hover:bg-[#ef4444]/10 disabled:opacity-50"
                    title="Supprimer"
                  >
                    <RiDeleteBin6Line />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1020]/45 px-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e9effd] px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#1f1f1f]">Définir votre planning quotidien</h2>
                <p className="mt-1 text-xs text-[#6b7280]">
                  Activez les jours travaillés puis indiquez les heures d'ouverture et de fermeture.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[#f5f7fa]"
              >
                <RiCloseLine className="text-xl" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-6">
              <div className="space-y-3">
                {DAYS.map((day) => (
                  <div
                    key={day.value}
                    className={`grid grid-cols-1 gap-3 rounded-2xl border p-4 md:grid-cols-[180px_1fr_1fr_150px] md:items-center ${
                      draft[day.value].enabled
                        ? "border-[#2563eb]/30 bg-[#2563eb]/5"
                        : "border-[#e9effd] bg-[#f8fafc]"
                    }`}
                  >
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={draft[day.value].enabled}
                        onChange={(e) => updateDraftDay(day.value, "enabled", e.target.checked)}
                        className="h-4 w-4 rounded border-[#d8e1f3] text-[#2563eb] focus:ring-[#2563eb]"
                      />
                      <span className="text-sm font-semibold text-[#1f1f1f]">{day.label}</span>
                    </label>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#6b7280]">Début</label>
                      <input
                        type="time"
                        value={draft[day.value].start_time}
                        disabled={!draft[day.value].enabled}
                        onChange={(e) => updateDraftDay(day.value, "start_time", e.target.value)}
                        className="w-full rounded-xl border border-[#e9effd] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563eb] disabled:bg-[#eef2f7] disabled:text-[#9ca3af]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#6b7280]">Fin</label>
                      <input
                        type="time"
                        value={draft[day.value].end_time}
                        disabled={!draft[day.value].enabled}
                        onChange={(e) => updateDraftDay(day.value, "end_time", e.target.value)}
                        className="w-full rounded-xl border border-[#e9effd] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563eb] disabled:bg-[#eef2f7] disabled:text-[#9ca3af]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#6b7280]">Créneau</label>
                      <select
                        value={draft[day.value].slot_duration_minutes}
                        disabled={!draft[day.value].enabled}
                        onChange={(e) => updateDraftDay(day.value, "slot_duration_minutes", Number(e.target.value))}
                        className="w-full rounded-xl border border-[#e9effd] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563eb] disabled:bg-[#eef2f7] disabled:text-[#9ca3af]"
                      >
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                        <option value={90}>90 min</option>
                        <option value={120}>120 min</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#e9effd] px-6 py-4">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-[#e9effd] px-4 py-2.5 text-sm font-semibold text-[#6b7280] hover:bg-[#f5f7fa]"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <RiLoader4Line className="animate-spin" /> : <RiSave3Line />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
