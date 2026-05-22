import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Receipt, History } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Generate Bill', path: '/billing', icon: Receipt },
    { name: 'Bill Logs', path: '/logs', icon: History },
  ];

  return (
    <nav className="bg-slate-900 text-white w-full md:w-64 h-auto md:h-screen p-4 flex flex-row md:flex-col justify-between md:justify-start gap-4 shadow-xl border-b md:border-b-0 md:border-r border-slate-800 fixed top-0 left-0 z-50 overflow-y-auto">
      <div className="hidden md:block mb-8 px-2 mt-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
          Shop CRM Pro
        </h1>
        <p className="text-xs text-slate-400 mt-1">Tablet-optimized Mode</p>
      </div>

      <div className="flex flex-row md:flex-col gap-2 w-full justify-around md:justify-start">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm w-full ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon size={20} />
              <span className="hidden md:inline">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}