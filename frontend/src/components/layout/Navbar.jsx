import { Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo.jsx';
import { clearStoredAccess } from '../../access.js';

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearStoredAccess();
    navigate('/unlock', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={onMenuClick}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="hidden md:block text-sm font-semibold text-slate-900">Inventory Workspace</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-sm text-slate-500">Your inventory tools are ready.</div>
          <button
            className="btn-secondary inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
