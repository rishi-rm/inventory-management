import { Fragment, useMemo, useState } from 'react';
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

          <div className="card p-4 mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
              <SearchInput value={q} onChange={setQ} placeholder="Search products..." />
              <button type="button" className="btn-secondary py-2 px-3 text-sm" disabled title="Filter options coming soon">
                Filters
              </button>
            </div>
            <p className="text-sm text-slate-500">{filtered.length} of {products.length} products</p>
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
            <div className="card overflow-hidden border border-slate-200">
              <div className="overflow-x-auto scroll-smooth">
                <table className="min-w-[980px] w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-[0.18em]">
                    <tr className="border-b border-slate-200">
                      <th className="sticky top-0 z-20 text-left px-4 py-3 font-semibold">Product</th>
                      <th className="sticky top-0 z-20 text-right px-4 py-3 font-semibold">Quantity</th>
                      <th className="sticky top-0 z-20 text-right px-4 py-3 font-semibold">Materials Used</th>
                      <th className="sticky top-0 z-20 text-right px-4 py-3 font-semibold">Manufacturing Cost</th>
                      <th className="sticky top-0 z-20 text-left px-4 py-3 font-semibold">Date</th>
                      <th className="sticky top-0 z-20 px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, idx) => {
                      const total = productCost(p);
                      const isOpen = expanded === p.id;
                      return (
                        <Fragment key={p.id}>
                          <tr className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-slate-100 transition-colors`}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0">
                                  <Package className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold truncate">{p.name}</p>
                                  <p className="text-xs text-slate-500">{p.quantity} units</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums font-semibold">{p.quantity}</td>
                            <td className="px-4 py-3 text-right tabular-nums">{p.materials.length}</td>
                            <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmt(total)}</td>
                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmtDate(p.createdAt)}</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <button
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                                onClick={() => setExpanded(isOpen ? null : p.id)}
                                title="Toggle materials"
                              >
                                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              <button
                                className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                                onClick={() => { setEditing(p); setModalOpen(true); }}
                                title="Edit product"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-100"
                                onClick={() => setDeleting(p)}
                                title="Delete product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                          {isOpen && (
                            <tr>
                              <td colSpan="6" className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                <div className="rounded-2xl bg-white border border-slate-200 p-4">
                                  <div className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">Materials breakdown</div>
                                  <div className="grid gap-3">
                                    {p.materials.map((u, i) => {
                                      const m = getMaterial(u.materialId);
                                      const cpu = m ? costPerUnit(m) : 0;
                                      return (
                                        <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl bg-slate-50 p-3">
                                          <div className="min-w-0">
                                            <p className="font-medium truncate">{m?.itemName || m?.name || 'Unknown'}</p>
                                            <p className="text-xs text-slate-500">{u.quantity} {m?.unit} × {fmt(cpu)}</p>
                                          </div>
                                          <p className="font-semibold tabular-nums">{fmt(cpu * u.quantity)}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm font-semibold">
                                    <span>Total cost</span>
                                    <span>{fmt(total)}</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
