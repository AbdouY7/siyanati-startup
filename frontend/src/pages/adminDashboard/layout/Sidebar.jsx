import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Store, Briefcase, FileText, Flag, Menu, X 
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/admin/home', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/clients', icon: Users, label: 'Clients' },
  { path: '/stores', icon: Store, label: 'Stores' },
  { path: '/professionals', icon: Briefcase, label: 'Professionals' },
  { path: '/posts', icon: FileText, label: 'Posts' },
  { path: '/reports', icon: Flag, label: 'Reports' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-40
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-darkBlue font-secondary">Admin Panel</h1>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray hover:bg-light hover:text-primary'
                }
              `}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
