import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Package, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SearchInput from '../components/SearchInput.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ProductModal from '../components/ProductModal.jsx';
import { useInventory } from '../context/InventoryContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const fmt = (n) => '₹' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function Products() {
  const {
    products,
    materials,
    loadingProducts,
    errorProducts,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getMaterial,
    costPerUnit,
    productCost,
  } = useInventory();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => p.name.toLowerCase().includes(s));
  }, [products, q]);

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await updateProduct(editing.id, data);
        toast.success('Product updated');
      } else {
        await addProduct(data);
        toast.success('Product created — raw materials deducted from stock');
      }
      setEditing(null);
    } catch (err) {
      toast.error(err?.message || 'Could not save product');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteProduct(deleting.id);
      toast.success('Product deleted');
      setDeleting(null);
    } catch (err) {
      toast.error(err?.message || 'Could not delete product');
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manufacture products and track manufacturing costs."
        actions={
          <button
            className="btn-primary"
            onClick={() => { setEditing(null); setModalOpen(true); }}
            disabled={materials.length === 0}
            title={materials.length === 0 ? 'Add raw materials first' : ''}
          >
            <Plus className="w-4 h-4" /> New product
          </button>
        }
      />

      {loadingProducts && products.length === 0 ? (
        <div className="card p-8 text-center">
          <Spinner className="mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading products…</p>
        </div>
      ) : errorProducts && products.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Unable to load products"
          description={errorProducts}
          action={(
            <button className="btn-primary" onClick={fetchProducts}>
              Retry
            </button>
          )}
        />
      ) : (
        <>
          {errorProducts && (
            <div className="card p-4 mb-4 border border-red-100 bg-red-50 text-red-700">
              <div className="flex items-center justify-between gap-3">
                <p>Unable to refresh products. Please try again.</p>
                <button className="btn-secondary" onClick={fetchProducts}>Retry</button>
              </div>
            </div>
          )}

          <div className="card p-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <SearchInput value={q} onChange={setQ} placeholder="Search products..." />
            <p className="text-sm text-slate-500 sm:ml-auto">{filtered.length} of {products.length} products</p>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Package}
              title={products.length === 0 ? 'No products yet' : 'No matches found'}
              description={
                products.length === 0
                  ? materials.length === 0
                    ? 'Add raw materials first, then create your first product.'
                    : 'Create your first manufactured product to start tracking costs.'
                  : 'Try a different search term.'
              }
              action={products.length === 0 && materials.length > 0 && (
                <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
                  <Plus className="w-4 h-4" /> New product
                </button>
              )}
            />
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((p) => {
                const total = productCost(p);
                const isOpen = expanded === p.id;
                return (
                  <div key={p.id} className="card p-5 hover:shadow-soft transition-all hover:-translate-y-0.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.quantity} units · {fmtDate(p.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" onClick={() => { setEditing(p); setModalOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-50 text-red-600" onClick={() => setDeleting(p)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Total cost</p>
                        <p className="text-base font-bold mt-0.5">{fmt(total)}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Per unit</p>
                        <p className="text-base font-bold mt-0.5">{p.quantity > 0 ? fmt(total / p.quantity) : '—'}</p>
                      </div>
                    </div>

                    <button
                      className="mt-4 w-full flex items-center justify-between text-sm font-medium text-slate-700 hover:text-slate-900"
                      onClick={() => setExpanded(isOpen ? null : p.id)}
                    >
                      <span>{p.materials.length} raw materials used</span>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isOpen && (
                      <div className="mt-3 border-t border-slate-100 pt-3 space-y-2 animate-fade-in">
                        {p.materials.map((u, i) => {
                          const m = getMaterial(u.materialId);
                          const cpu = m ? costPerUnit(m) : 0;
                          return (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <div>
                                <p className="font-medium">{m?.name || 'Unknown'}</p>
                                <p className="text-xs text-slate-500">{u.quantity} {m?.unit} × {fmt(cpu)}</p>
                              </div>
                              <p className="font-semibold tabular-nums">{fmt(cpu * u.quantity)}</p>
                            </div>
                          );
                        })}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-sm font-bold">
                          <span>Total</span>
                          <span>{fmt(total)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <ProductModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={onSubmit} initial={editing} />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete product?"
        description={deleting ? `"${deleting.name}" will be permanently removed. Note: raw material stock will not be restored.` : ''}
        confirmText="Delete"
      />
    </div>
  );
}
