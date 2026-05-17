import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { calculateAge, formatDate, getYear } from "../../utils/dateUtils";
import { getUserVehicles } from "../../services/vehicleService";
import AddVehicleModal from "../../components/modals/AddVehicleModal";
import Header from "../../components/layaouts/Header";
import { 
  FiEdit2, 
  FiSettings, 
  FiLogOut, 
  FiMapPin, 
  FiPlus, 
  FiChevronRight,
  FiClock,
  FiCalendar,
  FiHeart,
  FiHome,
  FiUsers,
  FiMessageSquare,
  FiCreditCard
} from "react-icons/fi";
import { FaCar } from "react-icons/fa";

const ProfilePage = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const [vehicles, setVehicles] = useState([]);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-font-primary">
      {/* ─── Top Header Section ────────────────────────────────────────── */}
      <div className="bg-primary-dark pt-28 pb-16 px-4 md:px-8 lg:px-16 relative">
        <Header />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white flex items-center justify-center">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-gray-400 font-bold uppercase">
                    {profile.full_name?.charAt(0) || user.email.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex flex-col items-center md:items-start text-white mb-2">
              <h1 className="text-2xl md:text-3xl font-bold font-font-secondary">
                {profile.full_name || "Utilisateur"}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-white/80 text-sm">
                <FiMapPin size={16} />
                <span>{profile.wilaya || "Wilaya non définie"}</span>
              </div>
              <p className="text-white/60 text-xs mt-1">
                Membre depuis {getYear(user.created_at)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end shrink-0">
            <Link
              to="/profile/edit"
              className="bg-white text-secondary hover:bg-gray-50 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition shadow-sm text-sm"
            >
              modifier le profil <FiEdit2 size={16} />
            </Link>
            <button className="bg-white/10 text-white hover:bg-white/20 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition text-sm">
              Paramètre <FiSettings size={16} />
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition"
              title="Se déconnecter"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content Grid ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN (2/3 width on LG) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Informations personnel */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6 font-font-secondary">Informations personnel</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                <div>
                  <p className="text-xs font-semibold text-gray-800 mb-1">Date de naissance :</p>
                  <p className="text-sm text-gray-600">{formatDate(profile.date_of_birth)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800 mb-1">Années :</p>
                  <p className="text-sm text-gray-600">{calculateAge(profile.date_of_birth)} ans</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800 mb-1">Numéro de téléphone :</p>
                  <p className="text-sm text-gray-600">{user.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800 mb-1">Wilaya :</p>
                  <p className="text-sm text-gray-600">{profile.wilaya || "N/A"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-gray-800 mb-1">Localisation du residence :</p>
                  <p className="text-sm text-gray-600">{profile.address || "N/A"}</p>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <p className="text-xs font-semibold text-gray-800 mb-1">Adresse email :</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Mon Garage */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-lg font-bold text-gray-800 font-font-secondary">
                  Mon Garage <span className="text-gray-500 text-sm font-normal">(User vehicules)</span>
                </h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setIsAddVehicleModalOpen(true)}
                    className="flex-1 sm:flex-none bg-secondary hover:bg-secondary/90 text-white text-xs font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-1 transition"
                  >
                    ajouter un nouveau véhicule <FiPlus size={14} />
                  </button>
                  <button className="flex-1 sm:flex-none border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium py-2 px-4 rounded-lg transition">
                    tout véhicules
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {isLoading ? (
                  <p className="text-sm text-gray-500 text-center py-4">Chargement des véhicules...</p>
                ) : vehicles.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-xl">
                    Vous n'avez pas encore ajouté de véhicule.
                  </p>
                ) : (
                  vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition cursor-pointer group bg-gray-50/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 text-secondary">
                          {vehicle.brand?.logo_url ? (
                            <img src={vehicle.brand.logo_url} alt={vehicle.brand?.name} className="w-8 h-8 object-contain" />
                          ) : (
                            <FaCar size={24} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-secondary">{vehicle.brand?.name || "Marque"} <span className="text-gray-500 font-normal text-sm">{vehicle.model?.name}, {vehicle.year}</span></p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-semibold text-gray-500 uppercase">Voiture Santé</span>
                            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 w-4/5"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <FiChevronRight size={20} className="text-gray-400 group-hover:text-secondary transition" />
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (1/3 width on LG) */}
          <div className="flex flex-col gap-6">
            
            {/* Informations de paiement */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition">
              <h2 className="text-lg font-bold text-gray-800 mb-6 font-font-secondary">Informations de Paiement</h2>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#00519E] rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                  {/* Algérie Poste Logo placeholder */}
                  <span className="text-white font-bold text-[10px] text-center leading-tight">ALGERIE<br/>POSTE</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800 mb-0.5">Comptes Paiement :</p>
                  <p className="text-sm font-bold text-secondary mb-2">2 Comptes</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-800">Status :</p>
                      <p className="text-xs font-bold text-green-500">Valider</p>
                    </div>
                    <button className="bg-primary hover:bg-primary-dark text-white text-[10px] font-medium py-1 px-3 rounded flex items-center gap-1 transition">
                      Voir Plus <FiChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mes Statistiques */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6 font-font-secondary">Mes Statistiques</h2>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-3xl font-bold text-green-500 leading-none">15</p>
                    <p className="text-xs text-gray-600 mt-1">Commande terminée</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-yellow-500 leading-none">5</p>
                    <p className="text-xs text-gray-600 mt-1">rendez-vous en attente</p>
                  </div>
                </div>

                {/* Donut Chart Mock */}
                <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <path
                      className="text-gray-100"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Terminées (Green, 75%) */}
                    <path
                      className="text-green-500"
                      strokeDasharray="75, 100"
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* En attente (Yellow, 25%) */}
                    <path
                      className="text-gray-300"
                      strokeDasharray="25, 100"
                      strokeDashoffset="-75"
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] text-gray-500 font-medium">Activités<br/>Total</p>
                    <p className="text-lg font-bold text-secondary leading-none">20</p>
                  </div>
                </div>
              </div>

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
            </div>

          </div>
        </div>

        {/* ─── Bottom Navigation Grid ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <Link to="#" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition">
                <FiClock size={20} />
              </div>
              <span className="font-semibold text-gray-800 text-sm">Historiques des<br/>commandes</span>
            </div>
            <FiChevronRight size={20} className="text-gray-400 group-hover:text-secondary transition" />
          </Link>

          <Link to="#" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition">
                <FiCalendar size={20} />
              </div>
              <span className="font-semibold text-gray-800 text-sm">Historiques des<br/>Rendez-vous</span>
            </div>
            <FiChevronRight size={20} className="text-gray-400 group-hover:text-secondary transition" />
          </Link>

          <Link to="#" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition">
                <FiHeart size={20} />
              </div>
              <span className="font-semibold text-gray-800 text-sm">Piéces Favorites</span>
            </div>
            <FiChevronRight size={20} className="text-gray-400 group-hover:text-secondary transition" />
          </Link>

          <Link to="#" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition">
                <FiHome size={20} />
              </div>
              <span className="font-semibold text-gray-800 text-sm">Magasins Suivis</span>
            </div>
            <FiChevronRight size={20} className="text-gray-400 group-hover:text-secondary transition" />
          </Link>

          <Link to="#" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition">
                <FiSettings size={20} />
              </div>
              <span className="font-semibold text-gray-800 text-sm">Professionnels<br/>Sauvegardés</span>
            </div>
            <FiChevronRight size={20} className="text-gray-400 group-hover:text-secondary transition" />
          </Link>

          <Link to="#" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition">
                <FiMessageSquare size={20} />
              </div>
              <span className="font-semibold text-gray-800 text-sm">Mes Publications<br/>& Problèmes</span>
            </div>
            <FiChevronRight size={20} className="text-gray-400 group-hover:text-secondary transition" />
          </Link>
        </div>
      </div>

      <AddVehicleModal 
        isOpen={isAddVehicleModalOpen} 
        onClose={() => setIsAddVehicleModalOpen(false)}
        onSuccess={() => {
          // Refresh vehicles list
          getUserVehicles().then(v => setVehicles(v || []));
        }}
      />
    </div>
  );
};

export default ProfilePage;
