import React from "react";
import { Link } from "react-router-dom";
import { X, LogIn, UserPlus } from "lucide-react";

export default function AuthPopupModal({ isOpen, onClose, message = "Veuillez vous connecter pour continuer" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connexion requise
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all active:scale-[0.98]"
            >
              <LogIn size={18} />
              Se connecter
            </Link>
            
            <Link
              to="/signup"
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold py-3.5 px-6 rounded-xl transition-all active:scale-[0.98]"
            >
              <UserPlus size={18} />
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
