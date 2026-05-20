import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiFilter, FiInfo } from "react-icons/fi";
import { getAllClientsAdmin } from "../../services/adminService";
import { formatDate } from "../../utils/dateUtils";

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [wilayaFilter, setWilayaFilter] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await getAllClientsAdmin();
      setClients(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch clients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Extract unique wilayas for filter
  const uniqueWilayas = [
    ...new Set(clients.map((c) => c.client_profile?.wilaya).filter(Boolean)),
  ].sort();

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const profile = client.client_profile || {};
    
    const matchesSearch =
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm);
      
    const matchesWilaya = wilayaFilter ? profile.wilaya === wilayaFilter : true;

    return matchesSearch && matchesWilaya;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clients Management</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 shadow-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={wilayaFilter}
                onChange={(e) => setWilayaFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white min-w-[150px] transition-all"
              >
                <option value="">All Wilayas</option>
                {uniqueWilayas.map((wilaya) => (
                  <option key={wilaya} value={wilaya}>
                    {wilaya}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Client Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No clients found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const profile = client.client_profile || {};
                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.full_name}
                              className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mr-3 border border-primary/20">
                              {profile.full_name?.charAt(0) || "C"}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">
                              {profile.full_name || "Unknown Client"}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {client.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {client.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {client.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {profile.wilaya || "-"}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">
                          {profile.address || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(client.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center space-x-3">
                          <Link
                            to={`/admin/clients/${client.id}`}
                            className="p-2 text-gray-400 hover:text-primary bg-gray-50 hover:bg-primary/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiInfo size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{filteredClients.length}</span>{" "}
            of <span className="font-medium text-gray-900">{clients.length}</span> clients
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminClients;
