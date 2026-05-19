import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      nav('/dashboard');
    } catch {
      toast.error('Could not sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <Logo size="lg" />
        <h1 className="text-2xl font-bold mt-6">Welcome back</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in to manage your inventory</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" icon={Mail} error={errors.email}>
          <input
            type="email"
            className="input pl-10"
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Password" icon={Lock} error={errors.password}>
          <input
            type={showPw ? 'text' : 'password'}
            className="input pl-10 pr-10"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </Field>

        <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
          {loading ? <Spinner /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-slate-900 font-semibold hover:underline">Sign up</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ children }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_20%,#fff_0,transparent_50%),radial-gradient(circle_at_80%_70%,#fff_0,transparent_40%)]" />
        <div className="relative">
          <Logo size="lg" />
        </div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight">Inventory that feels effortless.</h2>
          <p className="mt-4 text-slate-300">Track raw materials, manufacture products, and calculate costs — all in one beautifully simple workspace.</p>
          {/* <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              ['1.2k+', 'Items tracked'],
              ['99.9%', 'Accuracy'],
              ['24/7', 'Visibility'],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-bold">{v}</p>
                <p className="text-xs text-slate-400">{l}</p>
              </div>
            ))}
          </div> */}
        </div>
        <p className="relative text-xs text-slate-400">© {new Date().getFullYear()} Stockly</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-md card p-8 animate-fade-in">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />}
        {children}
      </div>
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}