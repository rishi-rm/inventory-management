import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, AlertTriangle, Package } from 'lucide-react';
import Modal from './Modal.jsx';
import { useInventory } from '../context/InventoryContext.jsx';

const fmt = (n) => '₹' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 3 });

export default function ProductModal({ open, onClose, onSubmit, initial }) {
  const { materials, costPerUnit, getMaterial, units } = useInventory();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [rows, setRows] = useState([]); // [{materialId, quantity}]
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setName(initial?.name || '');
      setQuantity(initial ? String(initial.quantity) : '');
      setUnit(initial?.unit || (units && units[0]) || '');
      setRows(initial ? initial.materials.map((m) => ({ ...m, quantity: String(m.quantity) })) : []);
      setErrors({});
      setPickerOpen(false);
      setSelectedMaterials([]);
    }
  }, [open, initial]);

  const addRow = () => {
    const first = materials.find((m) => !rows.some((r) => r.materialId === m.id));
    if (!first) return;
    setRows((r) => [...r, { materialId: first.id, quantity: '' }]);
  };

  const updateRow = (idx, patch) => setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  const removeRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx));

  const availableMaterials = materials.filter((m) => !rows.some((r) => r.materialId === m.id));
  const toggleSelection = (id) => setSelectedMaterials((prev) =>
    prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
  );
  const addSelectedMaterials = () => {
    if (selectedMaterials.length === 0) return;
    setRows((prev) => [
      ...prev,
      ...selectedMaterials.map((materialId) => ({ materialId, quantity: '' })),
    ]);
    setSelectedMaterials([]);
    setPickerOpen(false);
  };

  const breakdown = useMemo(() => {
    return rows.map((r) => {
      const mat = getMaterial(r.materialId);
      const qty = parseFloat(r.quantity) || 0;
      const cpu = mat ? costPerUnit(mat) : 0;
      const subtotal = cpu * qty;
      const remaining = mat ? mat.quantity - qty : 0;
      return { row: r, mat, qty, cpu, subtotal, remaining, insufficient: mat && qty > mat.quantity };
    });
  }, [rows, getMaterial, costPerUnit]);

  const total = breakdown.reduce((s, b) => s + b.subtotal, 0);
  const hasInsufficient = breakdown.some((b) => b.insufficient);

  const handleSubmit = (e) => {
    e.preventDefault();
    const eobj = {};
    if (!name.trim()) eobj.name = 'Name is required';
    const q = parseFloat(quantity);
    if (isNaN(q) || q <= 0) eobj.quantity = 'Quantity must be greater than 0';
    if (!unit) eobj.unit = 'Select a unit';
    if (rows.length === 0) eobj.rows = 'Add at least one raw material';
    breakdown.forEach((b, i) => {
      const qty = parseFloat(b.row.quantity);
      if (isNaN(qty) || qty <= 0) eobj[`row-${i}`] = 'Enter quantity';
    });
    setErrors(eobj);
    if (Object.keys(eobj).length || hasInsufficient) return;
    onSubmit({
      name: name.trim(),
      quantity: q,
      unit,
      materials: rows.map((r) => ({ materialId: r.materialId, quantity: parseFloat(r.quantity) })),
    });
    onClose();
  };

  const availableForRow = (idx) =>
    materials.filter((m) => !rows.some((r, i) => i !== idx && r.materialId === m.id));

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={initial ? 'Edit product' : 'Create product'}
      description="Select raw materials used. Stockly calculates manufacturing cost live."
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} type="button">Cancel</button>
          <button className="btn-primary" form="prod-form" type="submit" disabled={hasInsufficient}>
            {initial ? 'Save changes' : 'Create product'}
          </button>
        </>
      }
    >
      {materials.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 grid place-items-center mb-3 text-slate-500">
            <Package className="w-5 h-5" />
          </div>
          <p className="font-semibold">No raw materials yet</p>
          <p className="text-sm text-slate-500 mt-1">Add raw materials before creating products.</p>
        </div>
      ) : (
        <form id="prod-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Product name</label>
              <input className="input" placeholder="e.g. Vanilla Cake" value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <p className="text-xs text-red-600 mt-1.5">{errors.name}</p>}
            </div>
            <div>
              <label className="label">Quantity produced</label>
              <div className="flex gap-2">
                <input type="number" min="0" step="any" className="input" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                <select className="input w-36" value={unit} onChange={(e) => setUnit(e.target.value)}>
                  {units.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              {errors.quantity && <p className="text-xs text-red-600 mt-1.5">{errors.quantity}</p>}
              {errors.unit && <p className="text-xs text-red-600 mt-1.5">{errors.unit}</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label !mb-0">Raw materials used</label>
              <button
                type="button"
                onClick={() => setPickerOpen((prev) => !prev)}
                disabled={rows.length >= materials.length}
                className="btn-ghost !py-1.5 !px-2.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add material
              </button>
            </div>
            {errors.rows && <p className="text-xs text-red-600 mb-2">{errors.rows}</p>}

            {pickerOpen && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">Select raw materials</p>
                    <p className="text-sm text-slate-500 mt-1">Choose one or more materials to add, then click Add selected materials.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary !py-1 !px-2 text-xs"
                    onClick={() => {
                      setPickerOpen(false);
                      setSelectedMaterials([]);
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {availableMaterials.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                    All materials are already added.
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {availableMaterials.map((material) => (
                      <label
                        key={material.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-slate-700"
                          checked={selectedMaterials.includes(material.id)}
                          onChange={() => toggleSelection(material.id)}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{material.name}</p>
                          <p className="text-xs text-slate-500">{material.quantity} {material.unit} in stock</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={addSelectedMaterials}
                    disabled={selectedMaterials.length === 0}
                  >
                    Add selected materials
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {breakdown.map((b, i) => {
                const opts = availableForRow(i);
                return (
                  <div key={i} className={`rounded-xl border p-3 ${b.insufficient ? 'border-red-200 bg-red-50/40' : 'border-slate-200 bg-white'}`}>
                    <div className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-12 sm:col-span-6">
                        <select
                          className="input"
                          value={b.row.materialId}
                          onChange={(e) => updateRow(i, { materialId: e.target.value })}
                        >
                          {opts.map((m) => (
                            <option key={m.id} value={m.id}>{m.name} ({m.quantity} {m.unit} in stock)</option>
                          ))}
                          {!opts.find((o) => o.id === b.row.materialId) && b.mat && (
                            <option value={b.mat.id}>{b.mat.name} ({b.mat.quantity} {b.mat.unit} in stock)</option>
                          )}
                        </select>
                      </div>
                      <div className="col-span-8 sm:col-span-4">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            className="input pr-14"
                            placeholder="Qty used"
                            value={b.row.quantity}
                            onChange={(e) => updateRow(i, { quantity: e.target.value })}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">{b.mat?.unit}</span>
                        </div>
                        {errors[`row-${i}`] && <p className="text-xs text-red-600 mt-1">{errors[`row-${i}`]}</p>}
                      </div>
                      <div className="col-span-4 sm:col-span-2 flex justify-end">
                        <button type="button" onClick={() => removeRow(i)} className="p-2 rounded-lg hover:bg-red-50 text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <Info label="Cost / unit" value={fmt(b.cpu)} />
                      <Info label="Subtotal" value={fmt(b.subtotal)} />
                      <Info
                        label="Remaining stock"
                        value={b.mat ? `${Math.max(0, b.mat.quantity - b.qty)} ${b.mat.unit}` : '—'}
                        accent={b.insufficient ? 'red' : b.remaining < 5 ? 'amber' : 'slate'}
                      />
                    </div>
                    {b.insufficient && (
                      <p className="mt-2 text-xs text-red-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Insufficient stock — only {b.mat.quantity} {b.mat.unit} available.
                      </p>
                    )}
                    {!b.insufficient && b.mat && b.remaining < 5 && b.qty > 0 && (
                      <p className="mt-2 text-xs text-amber-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Stock will be low after this production run.
                      </p>
                    )}
                  </div>
                );
              })}
              {rows.length === 0 && (
                <div className="text-center py-6 rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
                  No materials added yet. Click "Add material" to start.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">Total manufacturing cost</p>
                <p className="text-3xl font-bold mt-1">{fmt(total)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-70">Per unit produced</p>
                <p className="text-lg font-semibold">{quantity ? `${fmt(total / parseFloat(quantity || 1))} / ${unit}` : '—'}</p>
              </div>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}

function Info({ label, value, accent = 'slate' }) {
  const map = {
    slate: 'bg-slate-50 text-slate-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  };
  return (
    <div className={`rounded-lg p-2 ${map[accent]}`}>
      <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}