import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={`relative w-full ${sizes[size]} bg-white sm:rounded-2xl rounded-t-2xl shadow-soft border border-slate-200 sm:animate-scale-in animate-slide-up max-h-[92vh] flex flex-col`}
      >
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
            {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 sm:rounded-b-2xl flex flex-col-reverse sm:flex-row justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}