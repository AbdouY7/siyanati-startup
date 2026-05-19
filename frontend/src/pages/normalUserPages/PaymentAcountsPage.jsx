import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getUserPaymentAccounts,
  createPaymentAccount,
  updatePaymentAccount,
  deletePaymentAccount,
} from "../../services/paymentAccountService";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiCreditCard,
  FiStar,
  FiX,
} from "react-icons/fi";

const PaymentAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    account_name: "",
    ccp_code: "",
    ccp_key: "",
    full_name: "",
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await getUserPaymentAccounts();
      setAccounts(data || []);
    } catch (error) {
      console.error("Failed to fetch accounts", error);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditAccount(null);
    setForm({ account_name: "", ccp_code: "", ccp_key: "", full_name: "" });
    setModalOpen(true);
  };

  const openEdit = (account) => {
    setEditAccount(account);
    setForm({
      account_name: account.account_name,
      ccp_code: account.ccp_code,
      ccp_key: account.ccp_key,
      full_name: account.full_name,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editAccount) {
        await updatePaymentAccount(editAccount.id, form);
      } else {
        await createPaymentAccount(form);
      }
      setModalOpen(false);
      fetchAccounts();
    } catch (error) {
      alert(error.response?.data?.message || "Une erreur s'est produite");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce compte ?"))
      return;

    try {
      await deletePaymentAccount(id);
      fetchAccounts();
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  const setDefault = async (id) => {
    try {
      await updatePaymentAccount(id, { is_default: true });
      fetchAccounts();
    } catch (error) {
      alert("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/profile"
          className="w-9 h-9 bg-[#1a3a8f] rounded-xl flex items-center justify-center text-white shadow hover:bg-[#15307a] transition">
          <FiChevronLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-extrabold text-[#1a3a8f] tracking-tight">
          Mes Comptes de Paiement
        </h2>
      </div>

      {/* Add Button */}
      <button
        onClick={openAdd}
        className="mb-6 w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1a3a8f] hover:bg-[#15307a] text-white font-semibold py-3 px-6 rounded-xl transition shadow-md">
        <FiPlus className="w-5 h-5" />
        Ajoutez compte de payment
      </button>

      {/* Accounts List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-3 border-[#1a3a8f] border-t-transparent rounded-full" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <FiCreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Aucun compte de paiement</p>
          <p className="text-sm text-gray-400 mt-1">
            Ajoutez votre compte CCP pour faciliter vos paiements
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`bg-white rounded-2xl shadow-sm border p-5 transition hover:shadow-md ${
                account.is_default
                  ? "border-[#1a3a8f] ring-1 ring-[#1a3a8f]/20"
                  : "border-gray-100"
              }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#00519E] rounded-xl flex items-center justify-center">
                    <FiCreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800">
                        {account.account_name}
                      </h3>
                      {account.is_default && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full">
                          <FiStar className="w-3 h-3" />
                          Par défaut
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {account.full_name}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-gray-600">
                        <span className="text-gray-400 text-xs">CCP:</span>{" "}
                        <span className="font-mono font-semibold">
                          {account.ccp_code}
                        </span>
                      </span>
                      <span className="text-gray-600">
                        <span className="text-gray-400 text-xs">Clé:</span>{" "}
                        <span className="font-mono font-semibold">
                          {account.ccp_key}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!account.is_default && (
                    <button
                      onClick={() => setDefault(account.id)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                      title="Définir par défaut">
                      <FiStar className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(account)}
                    className="p-2 text-[#1a3a8f] hover:bg-blue-50 rounded-lg transition"
                    title="Modifier">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Supprimer">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {editAccount
                  ? "Modifier le compte"
                  : "Ajouter un compte de paiement"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nom du compte
                </label>
                <input
                  type="text"
                  placeholder="Ex: Compte Principal"
                  value={form.account_name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      account_name: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/30 focus:border-[#1a3a8f] transition bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mohamed Benali"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, full_name: e.target.value }))
                  }
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/30 focus:border-[#1a3a8f] transition bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Code CCP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 123456789"
                    value={form.ccp_code}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, ccp_code: e.target.value }))
                    }
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/30 focus:border-[#1a3a8f] transition bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Clé CCP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 12"
                    value={form.ccp_key}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, ccp_key: e.target.value }))
                    }
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/30 focus:border-[#1a3a8f] transition bg-gray-50"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#1a3a8f] text-white font-semibold text-sm hover:bg-[#15307a] transition disabled:opacity-60 flex items-center gap-2">
                  {submitting && (
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                  )}
                  {editAccount ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.22s ease-out both; }
      `}</style>
    </div>
  );
};

export default PaymentAccountsPage;
