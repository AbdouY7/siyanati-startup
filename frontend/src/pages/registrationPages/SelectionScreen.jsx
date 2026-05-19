import React, { useState } from 'react';
import { Store, Wrench, ChevronLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SelectionScreen = () => {
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();

  const handleConfirm = () => {
    if (selectedType === 'boutique') {
      navigate('/register-store');
    } else if (selectedType === 'professionnel') {
      navigate('/register-pro');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 pt-8 pb-10 relative">
            <button
            onClick={() => navigate('/register')}
              className="absolute top-6 left-6 w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="text-center pt-4">
              <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm">
                SIYANATI
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight">
                Choisissez votre type de compte
              </h1>
              <p className="text-blue-100 text-sm max-w-md mx-auto leading-relaxed">
                Sélectionnez le profil qui correspond à votre activité pour créer votre compte.
              </p>
            </div>
          </div>

          {/* Cards */}
          <div className="px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

              {/* Boutique Card */}
              <button
                onClick={() => setSelectedType('boutique')}
                className={`group relative p-7 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer outline-none ${
                  selectedType === 'boutique'
                    ? 'border-blue-600 bg-blue-600 shadow-xl shadow-blue-200 scale-[1.02]'
                    : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                }`}
              >
                {selectedType === 'boutique' && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 size={22} className="text-white" />
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${
                  selectedType === 'boutique'
                    ? 'bg-white/20'
                    : 'bg-blue-100 group-hover:bg-blue-200'
                }`}>
                  <Store
                    size={30}
                    strokeWidth={1.8}
                    className={selectedType === 'boutique' ? 'text-white' : 'text-blue-600'}
                  />
                </div>

                <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                  selectedType === 'boutique' ? 'text-white' : 'text-gray-800'
                }`}>
                  Boutique
                </h3>
                <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                  selectedType === 'boutique' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  Inscrivez-vous en tant que magasin de pièces automobiles pour vendre vos produits.
                </p>
              </button>

              {/* Professionnel Card */}
              <button
                onClick={() => setSelectedType('professionnel')}
                className={`group relative p-7 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer outline-none ${
                  selectedType === 'professionnel'
                    ? 'border-blue-600 bg-blue-600 shadow-xl shadow-blue-200 scale-[1.02]'
                    : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                }`}
              >
                {selectedType === 'professionnel' && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 size={22} className="text-white" />
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${
                  selectedType === 'professionnel'
                    ? 'bg-white/20'
                    : 'bg-blue-100 group-hover:bg-blue-200'
                }`}>
                  <Wrench
                    size={30}
                    strokeWidth={1.8}
                    className={selectedType === 'professionnel' ? 'text-white' : 'text-blue-600'}
                  />
                </div>

                <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                  selectedType === 'professionnel' ? 'text-white' : 'text-gray-800'
                }`}>
                  Professionnel
                </h3>
                <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                  selectedType === 'professionnel' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  Inscrivez-vous en tant que mécanicien ou technicien pour proposer vos services.
                </p>
              </button>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              disabled={!selectedType}
              className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 transition-all duration-300 ${
                selectedType
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {selectedType ? (
                <>
                  Continuer avec{' '}
                  {selectedType === 'boutique' ? 'Boutique' : 'Professionnel'}
                  <ArrowRight size={18} />
                </>
              ) : (
                'Sélectionnez un type de compte'
              )}
            </button>

            <p className="text-center text-gray-400 text-xs mt-4">
              Votre inscription sera examinée par notre équipe avant activation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionScreen;