import React from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";

/**
 * A simple modal displayed when an unauthenticated user tries to perform a protected action.
 * Props:
 *  - isOpen: boolean whether to show the modal
 *  - onClose: function to call when the modal should be hidden
 */
export default function AuthRequiredModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate("/login");
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
      <div className="bg-white rounded-xl shadow-lg max-w-sm w-full mx-4 p-6 text-center z-[10000]">
        <h2 className="text-xl font-semibold mb-4">Action nécessitant une authentification</h2>
        <p className="text-gray-600 mb-6">
          Vous devez être connecté pour effectuer cette action.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleLogin}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
