import React from 'react';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

const PopupModal = ({ isOpen, onClose, onConfirm, title, message, type = 'info', confirmText = 'Confirmer', cancelText = 'Annuler' }) => {
  if (!isOpen) return null;

  const icons = {
    info: <FiInfo className="text-blue-500 w-12 h-12" />,
    success: <FiCheckCircle className="text-emerald-500 w-12 h-12" />,
    warning: <FiAlertCircle className="text-amber-500 w-12 h-12" />,
    error: <FiAlertCircle className="text-rose-500 w-12 h-12" />,
  };

  const isAlertOnly = !onConfirm;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition"
        >
          <FiX size={18} />
        </button>
        
        <div className="flex justify-center mb-4 mt-2">
          {icons[type] || icons.info}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-8">{message}</p>
        
        <div className="flex gap-3 justify-center w-full">
          {!isAlertOnly && (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              else onClose();
            }}
            className={`flex-1 py-2.5 px-4 text-white font-semibold rounded-xl transition ${
              type === 'error' ? 'bg-rose-600 hover:bg-rose-700' :
              type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
              type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isAlertOnly ? 'Fermer' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
