import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-slate-50">
      <div className="card p-10 text-center max-w-md">
        <p className="text-6xl font-bold text-slate-900">404</p>
        <p className="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn-primary mt-6 inline-flex">Back to dashboard</Link>
      </div>
    </div>
  );
}