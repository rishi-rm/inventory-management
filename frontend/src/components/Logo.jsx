import { Boxes } from 'lucide-react';

export default function Logo({ size = 'md' }) {
  const dim = size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const text = size === 'lg' ? 'text-2xl' : 'text-lg';
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${dim} rounded-xl bg-slate-900 text-white grid place-items-center shadow-soft`}>
        <Boxes className="w-5 h-5" />
      </div>
      <span className={`font-bold tracking-tight ${text}`}>Stockly</span>
    </div>
  );
}