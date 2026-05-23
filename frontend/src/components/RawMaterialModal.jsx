import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from './Modal.jsx';
import { useInventory } from '../context/InventoryContext.jsx';


const CUSTOM_VALUE = '__custom__';

export default function RawMaterialModal({ open, onClose, onSubmit, initial }) {
  const { units, addUnit } = useInventory();
  const [form, setForm] = useState({ itemName: '', quantity: '', unit: 'kg', baseRate: '', frate: 10 });
  const [customUnit, setCustomUnit] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              itemName: initial.itemName || initial.name,
              quantity: String(initial.quantity),
              unit: initial.unit || 'kg',
              baseRate: String(initial.baseRate || ''),
              frate: initial.frate || 10,
            }
          : { itemName: '', quantity: '', unit: 'kg', baseRate: '', frate: 10 }
      );
      setCustomUnit('');
      setErrors({});
    }
  }, [open, initial]);

  // baseRate is rate per unit (e.g. per kg); frate is freight per unit
  const calculations = useMemo(() => {
    const q = parseFloat(form.quantity) || 0;
    const br = parseFloat(form.baseRate) || 0;
    const fr = parseFloat(form.frate) || 0;
    const unitBeforeTax = br + fr;
    const gstPerUnit = unitBeforeTax * 0.18;
    const totalRatePerUnit = unitBeforeTax + gstPerUnit;
    const totalCapitalInvested = totalRatePerUnit * q;
    return { br, fr, unitBeforeTax, gstPerUnit, totalRatePerUnit, totalCapitalInvested };
  }, [form.quantity, form.baseRate, form.frate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const eobj = {};
    if (!form.itemName || !form.itemName.trim()) eobj.itemName = 'Item name is required';
    const q = parseFloat(form.quantity);
    if (isNaN(q) || q <= 0) eobj.quantity = 'Quantity must be greater than 0';
    const br = parseFloat(form.baseRate);
    if (isNaN(br) || br < 0) eobj.baseRate = 'Base rate must be 0 or greater';
    const fr = parseFloat(form.frate);
    if (isNaN(fr) || fr < 10 || fr > 120) eobj.frate = 'Freight must be between 10 and 120';
    let unit = form.unit;
    if (unit === CUSTOM_VALUE) {
      const u = customUnit.trim().toLowerCase();
      if (!u) eobj.unit = 'Enter a custom unit';
      else unit = u;
    }
    setErrors(eobj);
    if (Object.keys(eobj).length) return;
    if (form.unit === CUSTOM_VALUE) addUnit(unit);
    onSubmit({ itemName: form.itemName.trim(), quantity: q, baseRate: br, frate: fr, unit });
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
          <input className="input" placeholder="e.g. Sugar" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
          {errors.itemName && <p className="text-xs text-red-600 mt-1.5">{errors.itemName}</p>}
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Base rate (₹/unit)</label>
            <input type="number" min="0" step="any" className="input" placeholder="0.00" value={form.baseRate} onChange={(e) => setForm({ ...form, baseRate: e.target.value })} />
            {errors.baseRate && <p className="text-xs text-red-600 mt-1.5">{errors.baseRate}</p>}
          </div>
          <div>
            <label className="label">Freight (₹/unit)</label>
            <input
              type="number"
              min="0"
              step="any"
              className="input"
              placeholder="0.00"
              value={form.frate}
              onChange={(e) => setForm({ ...form, frate: e.target.value })}
            />
            {errors.frate && <p className="text-xs text-red-600 mt-1.5">{errors.frate}</p>}
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mt-2">
          <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Preview</p>
          <div className="mt-2 grid grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Base rate / unit</p>
              <p className="font-semibold">₹{calculations.br.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Base + freight / unit</p>
              <p className="font-semibold">₹{calculations.unitBeforeTax.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">GST / unit</p>
              <p className="font-semibold">₹{calculations.gstPerUnit.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total rate / unit</p>
              <p className="font-semibold">₹{calculations.totalRatePerUnit.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Total capital invested</p>
            <p className="text-xl font-bold mt-0.5">₹{calculations.totalCapitalInvested.toFixed(2)}</p>
          </div>
          <p className="text-xs text-slate-500 text-right">Total capital = total rate per unit × quantity</p>
        </div>
      </form>
    </Modal>
  );
}