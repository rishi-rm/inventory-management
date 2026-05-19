import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from './Modal.jsx';
import { useInventory } from '../context/InventoryContext.jsx';

const CUSTOM_VALUE = '__custom__';

export default function RawMaterialModal({ open, onClose, onSubmit, initial }) {
  const { units, addUnit } = useInventory();
  const [form, setForm] = useState({ name: '', quantity: '', unit: 'kg', totalCost: '' });
  const [customUnit, setCustomUnit] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? { name: initial.name, quantity: String(initial.quantity), unit: initial.unit, totalCost: String(initial.totalCost) }
          : { name: '', quantity: '', unit: 'kg', totalCost: '' }
      );
      setCustomUnit('');
      setErrors({});
    }
  }, [open, initial]);

  const cpu = useMemo(() => {
    const q = parseFloat(form.quantity);
    const c = parseFloat(form.totalCost);
    if (!q || !c || q <= 0) return 0;
    return c / q;
  }, [form.quantity, form.totalCost]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const eobj = {};
    if (!form.name.trim()) eobj.name = 'Name is required';
    const q = parseFloat(form.quantity);
    if (isNaN(q) || q < 0) eobj.quantity = 'Must be 0 or greater';
    const c = parseFloat(form.totalCost);
    if (isNaN(c) || c < 0) eobj.totalCost = 'Must be 0 or greater';
    let unit = form.unit;
    if (unit === CUSTOM_VALUE) {
      const u = customUnit.trim().toLowerCase();
      if (!u) eobj.unit = 'Enter a custom unit';
      else unit = u;
    }
    setErrors(eobj);
    if (Object.keys(eobj).length) return;
    if (form.unit === CUSTOM_VALUE) addUnit(unit);
    onSubmit({ name: form.name.trim(), quantity: q, totalCost: c, unit });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit raw material' : 'Add raw material'}
      description="Track quantity, cost and unit. Cost per unit is computed automatically."
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} type="button">Cancel</button>
          <button className="btn-primary" form="rm-form" type="submit">{initial ? 'Save changes' : 'Add material'}</button>
        </>
      }
    >
      <form id="rm-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Material name</label>
          <input className="input" placeholder="e.g. Sugar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <p className="text-xs text-red-600 mt-1.5">{errors.name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Quantity</label>
            <input type="number" min="0" step="any" className="input" placeholder="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            {errors.quantity && <p className="text-xs text-red-600 mt-1.5">{errors.quantity}</p>}
          </div>
          <div>
            <label className="label">Unit</label>
            <select className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              {units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
              <option value={CUSTOM_VALUE}>+ Custom unit…</option>
            </select>
            {errors.unit && <p className="text-xs text-red-600 mt-1.5">{errors.unit}</p>}
          </div>
        </div>
        {form.unit === CUSTOM_VALUE && (
          <div className="animate-fade-in">
            <label className="label">Custom unit</label>
            <div className="relative">
              <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="input pl-10" placeholder="e.g. bottles" value={customUnit} onChange={(e) => setCustomUnit(e.target.value)} />
            </div>
          </div>
        )}
        <div>
          <label className="label">Total cost (₹)</label>
          <input type="number" min="0" step="any" className="input" placeholder="0.00" value={form.totalCost} onChange={(e) => setForm({ ...form, totalCost: e.target.value })} />
          {errors.totalCost && <p className="text-xs text-red-600 mt-1.5">{errors.totalCost}</p>}
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Cost per unit</p>
            <p className="text-xl font-bold mt-0.5">₹{cpu.toFixed(2)}</p>
          </div>
          <p className="text-xs text-slate-500 text-right">Auto-calculated<br />total ÷ quantity</p>
        </div>
      </form>
    </Modal>
  );
}