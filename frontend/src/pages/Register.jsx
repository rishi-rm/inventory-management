import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import Spinner from '../components/Spinner.jsx';
import { AuthShell, Field } from './Login.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
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
      await register(form);
      toast.success('Account created!');
      nav('/dashboard');
    } catch {
      toast.error('Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <Logo size="lg" />
        <h1 className="text-2xl font-bold mt-6">Create your account</h1>
        <p className="text-sm text-slate-500 mt-1">Start managing your inventory in minutes</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Full name" icon={User} error={errors.name}>
          <input
            className="input pl-10"
            placeholder="Jane Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
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
            placeholder="At least 6 characters"
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
          {loading ? <Spinner /> : <>Create account <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-slate-900 font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}