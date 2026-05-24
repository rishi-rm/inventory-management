import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Boxes as BoxesIcon, User, X } from 'lucide-react';
import Logo from '../Logo.jsx';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/raw-materials', label: 'Raw Materials', icon: BoxesIcon },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex-col z-30">
        <SidebarContent />
      </aside>

      {/* Mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/40 animate-fade-in" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col animate-slide-up sm:animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <Logo />
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent onNavigate={onClose} hideLogo />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarContent({ onNavigate, hideLogo }) {
  return (
    <>
      {!hideLogo && (
        <div className="p-5 border-b border-slate-100">
          <Logo />
        </div>
      )}
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white shadow-soft'
                  : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Support</p>
        <p className="mt-1 text-sm text-slate-600">+91 78148 37076</p>
        <p className="mt-1 text-sm text-slate-600">rishabh.rm.2511@gmail.com</p>
      </div>
    </>
  );
}