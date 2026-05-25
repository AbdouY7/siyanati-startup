import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { calculateAge, formatDate } from "../../utils/dateUtils";
import { getUserVehicles } from "../../services/vehicleService";
import { getUserStatistics } from "../../services/statisticsService";
import { getUserPaymentAccounts } from "../../services/paymentAccountService"; // ✅ NEW
import AddVehicleModal from "../../components/modals/AddVehicleModal";
import {
  FiPlus,
  FiChevronRight,
  FiClock,
  FiCalendar,
  FiHeart,
  FiHome,
  FiSettings,
  FiMessageSquare,
  FiCreditCard, // ✅ NEW
  FiBookmark,
} from "react-icons/fi";
import { FaCar } from "react-icons/fa";

const ProfileInfoPage = () => {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [paymentAccounts, setPaymentAccounts] = useState([]); // ✅ NEW
  const [paymentLoading, setPaymentLoading] = useState(true); // ✅ NEW
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const profile = user?.client_profile || {};

  useEffect(() => {
    const fetchVehicles = async () => {
      if (user) {
        try {
          const userVehicles = await getUserVehicles();
          setVehicles(userVehicles || []);
        } catch (error) {
          console.error("Failed to fetch vehicles", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchVehicles();
  }, [user]);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (user) {
        try {
          const stats = await getUserStatistics();
          setStatistics(stats);
        } catch (error) {
          console.error("Failed to fetch statistics", error);
        } finally {
          setStatsLoading(false);
        }
      }
    };
    fetchStatistics();
  }, [user]);

  // ✅ NEW: Fetch payment accounts
  useEffect(() => {
    const fetchPaymentAccounts = async () => {
      if (user) {
        try {
          const accounts = await getUserPaymentAccounts();
          setPaymentAccounts(accounts || []);
        } catch (error) {
          console.error("Failed to fetch payment accounts", error);
        } finally {
          setPaymentLoading(false);
        }
      }
    };
    fetchPaymentAccounts();
  }, [user]);

  const getChartData = () => {
    if (!statistics) return { completedPct: 75, pendingPct: 25, total: 20 };
    const total = statistics.total_activities || 1;
    const completedPct =
      Math.round((statistics.completed_orders / total) * 100) || 0;
    const pendingPct =
      Math.round((statistics.pending_appointments / total) * 100) || 0;
    return { completedPct, pendingPct, total };
  };

  const { completedPct, pendingPct, total } = getChartData();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 -mt-8 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN (2/3) ─────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Informations personnel */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 font-font-secondary">
              Informations personnel
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs font-semibold text-gray-800 mb-1">
                  Date de naissance :
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(profile.date_of_birth)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800 mb-1">
                  Années :
                </p>
                <p className="text-sm text-gray-600">
                  {calculateAge(profile.date_of_birth)} ans
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800 mb-1">
                  Numéro de téléphone :
                </p>
                <p className="text-sm text-gray-600">{user?.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800 mb-1">
                  Wilaya :
                </p>
                <p className="text-sm text-gray-600">
                  {profile.wilaya || "N/A"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-gray-800 mb-1">
                  Localisation du residence :
                </p>
                <p className="text-sm text-gray-600">
                  {profile.address || "N/A"}
                </p>
              </div>
              <div className="col-span-2 md:col-span-3">
                <p className="text-xs font-semibold text-gray-800 mb-1">
                  Adresse email :
                </p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Mon Garage */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-lg font-bold text-gray-800 font-font-secondary">
                Mon Garage{" "}
                <span className="text-gray-500 text-sm font-normal">
                  (User vehicules)
                </span>
              </h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsAddVehicleModalOpen(true)}
                  className="flex-1 sm:flex-none bg-secondary hover:bg-secondary/90 text-white text-xs font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-1 transition">
                  ajouter un nouveau véhicule <FiPlus size={14} />
                </button>
                <Link
                  to="/profile/vehicules"
                  className="flex-1 sm:flex-none border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium py-2 px-4 rounded-lg transition">
                  tout véhicules
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {isLoading ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chargement des véhicules...
                </p>
              ) : vehicles.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-xl">
                  Vous n'avez pas encore ajouté de véhicule.
                </p>
              ) : (
                vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition cursor-pointer group bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 text-secondary overflow-hidden">
                        {vehicle.vehicule_picture_url ? (
                          <img
                            src={vehicle.vehicule_picture_url}
                            alt={`${vehicle.brand?.name} ${vehicle.model?.name}`}
                            className="w-full h-full object-cover"
                          />
                        ) : vehicle.brand?.logo_url ? (
                          <img
                            src={vehicle.brand.logo_url}
                            alt={vehicle.brand?.name}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <FaCar size={24} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-secondary">
                          {vehicle.brand?.name || "Marque"}{" "}
                          <span className="text-gray-500 font-normal text-sm">
                            {vehicle.model?.name}, {vehicle.year}
                          </span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-semibold text-gray-500 uppercase">
                            Voiture Santé
                          </span>
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                (vehicle.health_status ?? 100) >= 70
                                  ? "bg-green-500"
                                  : (vehicle.health_status ?? 100) >= 40
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                              style={{
                                width: `${vehicle.health_status ?? 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-gray-500">
                            {vehicle.health_status ?? "—"}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <FiChevronRight
                      size={20}
                      className="text-gray-400 group-hover:text-secondary transition"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (1/3) ────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/* ✅ UPDATED: Informations de paiement with real data */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition">
            <h2 className="text-lg font-bold text-gray-800 mb-6 font-font-secondary">
              Informations de Paiement
            </h2>

            {paymentLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin w-5 h-5 border-2 border-secondary border-t-transparent rounded-full" />
              </div>
            ) : paymentAccounts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">
                  Aucun compte de paiement
                </p>
                <Link
                  to="/profile/payment-accounts"
                  className="inline-flex items-center gap-1 bg-primary hover:bg-primary-dark text-white text-xs font-medium py-2 px-4 rounded-lg transition">
                  <FiPlus size={12} />
                  Ajouter un compte
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#00519E] rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                  <FiCreditCard className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800 mb-0.5">
                    Comptes Paiement :
                  </p>
                  <p className="text-sm font-bold text-secondary mb-2">
                    {paymentAccounts.length} Compte
                    {paymentAccounts.length > 1 ? "s" : ""}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-800">
                        Compte par défaut :
                      </p>
                      <p className="text-xs font-medium text-gray-600 truncate max-w-[120px]">
                        {paymentAccounts.find((a) => a.is_default)
                          ?.account_name || paymentAccounts[0]?.account_name}
                      </p>
                    </div>
                    <Link
                      to="/profile/payment-accounts"
                      className="bg-primary hover:bg-primary-dark text-white text-[10px] font-medium py-1.5 px-3 rounded flex items-center gap-1 transition">
                      Voir Plus <FiChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mes Statistiques */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 font-font-secondary">
              Mes Statistiques
            </h2>

            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-secondary border-t-transparent rounded-full" />
              </div>
            ) : !statistics ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Impossible de charger les statistiques
              </p>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-3xl font-bold text-green-500 leading-none">
                      {statistics.completed_orders}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Commande terminée
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-yellow-500 leading-none">
                      {statistics.pending_appointments}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      rendez-vous en attente
                    </p>
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 36 36">
                    <path
                      className="text-gray-100"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-green-500"
                      strokeDasharray={`${completedPct}, 100`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-gray-300"
                      strokeDasharray={`${pendingPct}, 100`}
                      strokeDashoffset={-completedPct}
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] text-gray-500 font-medium">
                      Activités
                      <br />
                      Total
                    </p>
                    <p className="text-lg font-bold text-secondary leading-none">
                      {total}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!statsLoading && statistics && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-[10px] text-gray-500">Terminée</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <span className="text-[10px] text-gray-500">En attente</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom Navigation Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pb-8">
        {[
          {
            to: "/profile/orders",
            icon: <FiClock size={20} />,
            label: "Historiques des\ncommandes",
          },
          {
            to: "/profile/appointments",
            icon: <FiCalendar size={20} />,
            label: "Historiques des\nRendez-vous",
          },
          {
            to: "/profile/favorite-pieces",
            icon: <FiHeart size={20} />,
            label: "Piéces Favorites",
          },
          {
            to: "/profile/followed-stores",
            icon: <FiHome size={20} />,
            label: "Magasins Suivis",
          },
          {
            to: "/profile/saved-professionals",
            icon: <FiSettings size={20} />,
            label: "Professionnels\nSauvegardés",
          },
          {
            to: "/profile/publications",
            icon: <FiMessageSquare size={20} />,
            label: "Mes Publications\n& Problèmes",
          },
          {
            to: "/profile/saved-diagnostic-posts",
            icon: <FiBookmark size={20} />,
            label: "Diagnostics\nSauvegardés",
          },
        ].map(({ to, icon, label }, i) => (
          <Link
            key={i}
            to={to}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition">
                {icon}
              </div>
              <span className="font-semibold text-gray-800 text-sm whitespace-pre-line">
                {label}
              </span>
            </div>
            <FiChevronRight
              size={20}
              className="text-gray-400 group-hover:text-secondary transition"
            />
          </Link>
        ))}
      </div>

      <AddVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
        onSuccess={() => {
          getUserVehicles().then((v) => setVehicles(v || []));
        }}
      />
    </div>
  );
};

export default ProfileInfoPage;
