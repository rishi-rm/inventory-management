import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Boxes, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SearchInput from '../components/SearchInput.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import RawMaterialModal from '../components/RawMaterialModal.jsx';
import { useInventory } from '../context/InventoryContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const fmtMoney = (n) => '₹' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function RawMaterials() {
  const {
    materials,
    loadingMaterials,
    errorMaterials,
    fetchMaterials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    costPerUnit,
  } = useInventory();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return materials;
    return materials.filter((m) => m.name.toLowerCase().includes(s) || m.unit.toLowerCase().includes(s));
  }, [materials, q]);

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await updateMaterial(editing.id, data);
        toast.success('Material updated');
      } else {
        await addMaterial(data);
        toast.success('Material added');
      }
      setEditing(null);
    } catch (err) {
      toast.error(err?.message || 'Could not save material');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMaterial(deleting.id);
      toast.success('Material deleted');
      setDeleting(null);
    } catch (err) {
      toast.error(err?.message || 'Could not delete material');
    }
  };

  return (
    <div>
      <PageHeader
        title="Raw Materials"
        description="Manage your raw inventory and unit costs."
        actions={
          <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus className="w-4 h-4" /> Add material
          </button>
        }
      />

      {loadingMaterials && materials.length === 0 ? (
        <div className="card p-8 text-center">
          <Spinner className="mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading raw materials…</p>
        </div>
      ) : errorMaterials && materials.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Unable to load raw materials"
          description={errorMaterials}
          action={
            <button className="btn-primary" onClick={fetchMaterials}>
              Retry
            </button>
          }
        />
      ) : (
        <>
          {errorMaterials && (
            <div className="card p-4 mb-4 border border-red-100 bg-red-50 text-red-700">
              <div className="flex items-center justify-between gap-3">
                <p>Unable to refresh raw materials. Please try again.</p>
                <button className="btn-secondary" onClick={fetchMaterials}>Retry</button>
              </div>
            </div>
          )}

          <div className="card p-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <SearchInput value={q} onChange={setQ} placeholder="Search materials..." />
            <p className="text-sm text-slate-500 sm:ml-auto">{filtered.length} of {materials.length} items</p>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title={materials.length === 0 ? 'No raw materials yet' : 'No matches found'}
              description={materials.length === 0 ? 'Add your first raw material to start tracking inventory and costs.' : 'Try a different search term.'}
              action={materials.length === 0 && (
                <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
                  <Plus className="w-4 h-4" /> Add material
                </button>
              )}
            />
          ) : (
            <>
              <div className="hidden md:block card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left font-semibold px-5 py-3">Material</th>
                      <th className="text-right font-semibold px-5 py-3">Quantity</th>
                      <th className="text-right font-semibold px-5 py-3">Total cost</th>
                      <th className="text-right font-semibold px-5 py-3">Cost / unit</th>
                      <th className="text-left font-semibold px-5 py-3">Updated</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 grid place-items-center">
                              <Boxes className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{m.name}</p>
                              <StockBadge qty={m.quantity} />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums">{m.quantity} <span className="text-slate-500">{m.unit}</span></td>
                        <td className="px-5 py-4 text-right tabular-nums">{fmtMoney(m.totalCost)}</td>
                        <td className="px-5 py-4 text-right tabular-nums font-semibold">{fmtMoney(costPerUnit(m))}</td>
                        <td className="px-5 py-4 text-slate-500">{fmtDate(m.updatedAt)}</td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" onClick={() => { setEditing(m); setModalOpen(true); }}>
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-red-50 text-red-600" onClick={() => setDeleting(m)}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {filtered.map((m) => (
                  <div key={m.id} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 grid place-items-center shrink-0">
                          <Boxes className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{m.name}</p>
                          <StockBadge qty={m.quantity} />
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" onClick={() => { setEditing(m); setModalOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-50 text-red-600" onClick={() => setDeleting(m)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                      <Cell label="Qty" value={`${m.quantity} ${m.unit}`} />
                      <Cell label="Total" value={fmtMoney(m.totalCost)} />
                      <Cell label="Per unit" value={fmtMoney(costPerUnit(m))} />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Updated {fmtDate(m.updatedAt)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <RawMaterialModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={onSubmit} initial={editing} />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete raw material?"
        description={deleting ? `"${deleting.name}" will be permanently removed from your inventory.` : ''}
        confirmText="Delete"
      />
    </div>
  );
}

function Cell({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function StockBadge({ qty }) {
  if (qty <= 0) return <span className="chip bg-red-50 text-red-700 mt-1"><AlertTriangle className="w-3 h-3" /> Out of stock</span>;
  if (qty < 5) return <span className="chip bg-amber-50 text-amber-700 mt-1"><AlertTriangle className="w-3 h-3" /> Low stock</span>;
  return <span className="chip bg-emerald-50 text-emerald-700 mt-1">In stock</span>;
}
