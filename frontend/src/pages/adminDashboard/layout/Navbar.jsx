import { Bell, Search, User } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-md ml-10 lg:ml-0">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-disabled" size={16} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray hover:text-primary transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
