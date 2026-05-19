import Modal from './Modal.jsx';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmText = 'Confirm', danger = true }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={null}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={() => { onConfirm?.(); onClose?.(); }}>
            {confirmText}
          </button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className={`w-11 h-11 rounded-full grid place-items-center shrink-0 ${danger ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
        </div>
      </div>
    </Modal>
  );
}