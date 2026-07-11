import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import Footer from '../components/layaouts/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6 shadow-inner text-blue-600">
          <FiAlertTriangle size={44} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">Erreur 404</h1>
        <p className="text-gray-500 text-lg mb-8 max-w-md">
          Oups ! La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-md shadow-blue-200"
        >
          <FiArrowLeft />
          Retour à l'accueil
        </Link>
      </main>
      <Footer />
    </div>
  );
}
