export default function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-black mt-1 font-secondary">{value}</p>
        </div>
        <div className="p-3 bg-light rounded-lg">
          <Icon size={20} className="text-primary" />
        </div>
      </div>
    </div>
  );
}
