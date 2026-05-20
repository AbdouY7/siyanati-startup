import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiCalendar, FiUser } from "react-icons/fi";
import { getClientDetailsAdmin } from "../../services/adminService";
import { formatDate } from "../../utils/dateUtils";

const AdminClientDetails = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClientDetails();
  }, [id]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const data = await getClientDetailsAdmin(id);
      setClient(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch client details. Please try again.");
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

  if (error || !client) {
    return (
      <div className="p-6">
        <Link to="/admin/clients" className="text-primary hover:underline flex items-center gap-2 mb-6">
          <FiArrowLeft /> Back to Clients
        </Link>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow-sm border border-red-100">
          {error || "Client not found"}
        </div>
      </div>
    );
  }

  const profile = client.client_profile || {};

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/admin/clients" className="text-gray-500 hover:text-primary flex items-center gap-2 mb-6 transition-colors">
        <FiArrowLeft /> Back to Clients
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 to-transparent px-8 py-10 border-b border-gray-100 flex flex-col md:flex-row items-center gap-6">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold shadow-md">
              {profile.full_name?.charAt(0) || "C"}
            </div>
          )}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {profile.full_name || "Unknown Client"}
            </h1>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Active Client
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-primary">
                <FiMail size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                <p className="font-medium text-gray-900">{client.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-primary">
                <FiPhone size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                <p className="font-medium text-gray-900">{client.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-primary">
                <FiMapPin size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Location</p>
                <p className="font-medium text-gray-900">{profile.wilaya || "Not provided"}</p>
                <p className="text-sm text-gray-600 mt-1">{profile.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-primary">
                <FiCalendar size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                <p className="font-medium text-gray-900">
                  {profile.date_of_birth ? formatDate(profile.date_of_birth) : "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-primary">
                <FiUser size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">National ID</p>
                <p className="font-medium text-gray-900">{profile.national_id_number || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-primary">
                <FiCalendar size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Account Created</p>
                <p className="font-medium text-gray-900">{formatDate(client.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* National ID Documents Section */}
        {profile.national_id_card && profile.national_id_card.length > 0 && (
          <div className="p-8 border-t border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Identity Documents</h2>
            <div className="flex flex-wrap gap-4">
              {profile.national_id_card.map((doc, index) => (
                <a
                  key={index}
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative group overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <img
                    src={doc}
                    alt={`ID Document ${index + 1}`}
                    className="h-32 w-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium text-sm">View Document</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClientDetails;
