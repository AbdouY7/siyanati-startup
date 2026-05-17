import { Users, Store, Briefcase, FileText, ShoppingCart, Calendar, Flag, TrendingUp } from 'lucide-react';
import StatCard from './ui/StatCard';
import DataTable from './ui/DataTable';
import LoadingSpinner from './ui/LoadingSpinner';
import { useApi } from './hooks/useApi';
// import { api } from '../api/axios';

const statsConfig = [
  { key: 'totalClients', label: 'Total Clients', icon: Users },
  { key: 'totalStores', label: 'Total Stores', icon: Store },
  { key: 'totalProfessionals', label: 'Total Professionals', icon: Briefcase },
  { key: 'totalPosts', label: 'Total Posts', icon: FileText },
  { key: 'totalOrders', label: 'Total Orders', icon: ShoppingCart },
  { key: 'totalAppointments', label: 'Total Appointments', icon: Calendar },
  { key: 'totalReports', label: 'Total Reports', icon: Flag },
  { key: 'totalRevenue', label: 'Total Revenue', icon: TrendingUp },
];

const recentColumns = [
  { key: 'type', label: 'Type', render: (val) => (
    <span className={`badge ${
      val === 'user' ? 'badge-info' : 
      val === 'order' ? 'badge-success' : 
      val === 'report' ? 'badge-danger' : 'badge-warning'
    }`}>{val}</span>
  )},
  { key: 'description', label: 'Description' },
  { key: 'user', label: 'User' },
  { key: 'date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
];

export default function DashboardHome() {
  const { data: stats, loading: statsLoading } = useApi(api.getDashboardStats);
  const { data: activity, loading: activityLoading } = useApi(api.getRecentActivity);

  const mockStats = {
    totalClients: 1245,
    totalStores: 86,
    totalProfessionals: 234,
    totalPosts: 1567,
    totalOrders: 3421,
    totalAppointments: 892,
    totalReports: 45,
    totalRevenue: 125000,
  };

  const mockActivity = [
    { id: 1, type: 'user', description: 'New client registered', user: 'John Doe', date: '2024-01-15' },
    { id: 2, type: 'order', description: 'New order #1234', user: 'Jane Smith', date: '2024-01-15' },
    { id: 3, type: 'report', description: 'Report submitted on post', user: 'Mike Johnson', date: '2024-01-14' },
    { id: 4, type: 'appointment', description: 'Appointment scheduled', user: 'Sarah Wilson', date: '2024-01-14' },
    { id: 5, type: 'store', description: 'New store approved', user: 'Auto Parts Co', date: '2024-01-13' },
  ];

  const displayStats = stats || mockStats;
  const displayActivity = activity || mockActivity;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black font-secondary">Dashboard</h1>
        <p className="text-gray text-sm mt-1">Overview of your platform</p>
      </div>

      {statsLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsConfig.map((stat) => (
            <StatCard
              key={stat.key}
              title={stat.label}
              value={displayStats[stat.key]?.toLocaleString() || 0}
              icon={stat.icon}
            />
          ))}
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black font-secondary">Recent Activity</h2>
          <button className="text-primary text-sm font-medium hover:underline">View All</button>
        </div>
        {activityLoading ? (
          <LoadingSpinner />
        ) : (
          <DataTable columns={recentColumns} data={displayActivity} />
        )}
      </div>
    </div>
  );
}
