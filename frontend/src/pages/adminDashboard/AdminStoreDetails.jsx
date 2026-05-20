import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiCalendar, FiUser, FiHome, FiFileText, FiImage } from "react-icons/fi";
import { getStoreDetailsAdmin } from "../../services/adminService";
import { formatDate } from "../../utils/dateUtils";

const AdminStoreDetails = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      const data = await getStoreDetailsAdmin(id);
      setStore(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch store details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="p-6">
        <Link to="/admin/stores" className="text-primary hover:underline flex items-center gap-2 mb-6">
          <FiArrowLeft /> Back to Stores
        </Link>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow-sm border border-red-100">
          {error || "Store not found"}
        </div>
      </div>
    );
  }

  const profile = store.store_profile || {};

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/admin/stores" className="text-gray-500 hover:text-primary flex items-center gap-2 mb-6 transition-colors">
        <FiArrowLeft /> Back to Stores
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 to-transparent px-8 py-10 border-b border-gray-100 flex flex-col md:flex-row items-center gap-6">
          {profile.logo_url ? (
            <img
              src={profile.logo_url}
              alt={profile.store_name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold shadow-md">
              {profile.store_name?.charAt(0) || "S"}
            </div>
          )}
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.store_name || "Unknown Store"}
                </h1>
                <p className="text-gray-600 font-medium">Owner: {profile.owner_name}</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider inline-block ${
                profile.status === "approved"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : profile.status === "rejected"
                  ? "bg-red-100 text-red-800 border border-red-200"
                  : "bg-yellow-100 text-yellow-800 border border-yellow-200"
              }`}>
                {profile.status}
              </div>
            </div>
          </div>
        </div>

        {profile.description && (
          <div className="px-8 py-6 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-gray-700">{profile.description}</p>
          </div>
        )}

        {/* Info Grid */}
        <div className="p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">Contact & Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-primary">
                <FiMail size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                <p className="font-medium text-gray-900">{store.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-primary">
                <FiPhone size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                <p className="font-medium text-gray-900">{store.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-primary">
                <FiMapPin size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Wilaya</p>
                <p className="font-medium text-gray-900">{profile.wilaya || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-primary">
                <FiHome size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Address</p>
                <p className="font-medium text-gray-900">{profile.address || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-primary">
                <FiCalendar size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Registration Submitted</p>
                <p className="font-medium text-gray-900">{formatDate(profile.submitted_at)}</p>
              </div>
            </div>
            
            {profile.reviewed_at && (
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-xl text-primary">
                  <FiCalendar size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Reviewed At</p>
                  <p className="font-medium text-gray-900">{formatDate(profile.reviewed_at)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rejection Reason */}
        {profile.status === "rejected" && profile.rejection_reason && (
          <div className="px-8 py-6 bg-red-50 border-t border-red-100">
            <h3 className="text-sm font-semibold text-red-800 uppercase tracking-wider mb-2">Rejection Reason</h3>
            <p className="text-red-700">{profile.rejection_reason}</p>
          </div>
        )}

        {/* Documents & Images */}
        <div className="p-8 border-t border-gray-100 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FiFileText className="text-primary" /> Legal Documents
            </h2>
            {profile.documents && profile.documents.length > 0 ? (
              <div className="flex flex-col gap-3">
                {profile.documents.map((doc, index) => (
                  <a
                    key={index}
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-primary transition-colors group"
                  >
                    <div className="p-2 bg-gray-100 rounded text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <FiFileText size={20} />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-primary transition-colors">
                      Document {index + 1}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No documents uploaded.</p>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FiImage className="text-primary" /> Store Images
            </h2>
            {profile.images && profile.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {profile.images.map((img, index) => (
                  <a
                    key={index}
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative group overflow-hidden rounded-lg border border-gray-200 bg-white aspect-square"
                  >
                    <img
                      src={img}
                      alt={`Store Image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-medium text-xs">View</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No images uploaded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStoreDetails;
