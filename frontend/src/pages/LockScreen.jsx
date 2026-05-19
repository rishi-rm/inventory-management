import { useState, useEffect } from 'react';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { verifyAccessPin } from '../api.js';
import Logo from '../components/Logo.jsx';
import { isUnlocked, setStoredAccessPin } from '../access.js';

export default function LockScreen() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isUnlocked()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!pin || pin.length !== 4) {
      setError('Enter the 4-digit access code');
      return;
    }

    setLoading(true);

    try {
      await verifyAccessPin(pin);
      setStoredAccessPin(pin);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid access code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950/90 text-slate-100 grid place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-md animate-fade-in">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-300 grid place-items-center shadow-lg shadow-emerald-500/10">
            <Lock className="w-7 h-7" />
          </div>
          <Logo />
          <p className="text-slate-400">Enter the 4-digit PIN to access your inventory dashboard.</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-slate-200">Access code</label>
          <input
            type="password"
            inputMode="numeric"
            pattern="\d*"
            maxLength={4}
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/[^0-9]/g, ''))}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xl tracking-[0.4em] text-center text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="• • • •"
            autoFocus
          />

          {error && (
            <div className="rounded-2xl border border-red-600/50 bg-red-600/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Unlocking…' : 'Unlock'}
          </button>
        </form>

        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-sm text-slate-500">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            Single access code protection for this inventory app.
          </div>
          <p className="mt-3">This app is only available after entering the correct PIN.</p>
        </div>
      </div>
    </div>
  );
}
