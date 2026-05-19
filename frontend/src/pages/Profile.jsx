import { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useInventory } from '../context/InventoryContext.jsx';

export default function Profile() {
  const { stats } = useInventory();
  const toast = useToast();
  const [workspaceName, setWorkspaceName] = useState('Inventory Workspace');

  const save = (e) => {
    e.preventDefault();
    toast.success('Workspace updated');
  };

  return (
    <div>
      <PageHeader title="Workspace" description="Manage your workspace settings." />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-1">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Workspace</p>
              <h3 className="text-xl font-semibold mt-2">{workspaceName}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white grid place-items-center text-lg font-bold shadow-soft">
              <Settings className="w-5 h-5" />
            </div>
          </div>
          <div className="grid gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Materials</p>
              <p className="text-lg font-bold mt-0.5">{stats.totalMaterials}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Products</p>
              <p className="text-lg font-bold mt-0.5">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <form onSubmit={save} className="card p-6 lg:col-span-2 space-y-4">
          <h3 className="font-semibold">Workspace information</h3>
          <div>
            <label className="label">Workspace name</label>
            <input
              className="input"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
          </div>
          <div className="pt-2 flex justify-end">
            <button className="btn-primary"><Save className="w-4 h-4" /> Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
